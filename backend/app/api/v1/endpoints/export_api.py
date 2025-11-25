# ============================================================================
# FILE: backend/app/api/v1/endpoints/export_api.py
# ============================================================================

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from uuid import uuid4
from datetime import datetime
import logging

from app.models.export_models import (
    InitiateExportRequest,
    ExportJobStatus,
    UpdateExportStatusRequest
)
from app.core.redis_cache import cache_job_status, get_job_status
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/initiate", response_model=ExportJobStatus)
async def initiate_export(request: InitiateExportRequest, background_tasks: BackgroundTasks):
    """
    Initiate PDF export job
    Creates job and queues it for processing
    """
    try:
        # Generate job ID
        job_id = str(uuid4())
        
        # Create job status
        job_status = ExportJobStatus(
            jobId=job_id,
            status='queued',
            progress=0,
            createdAt=datetime.now().isoformat()
        )
        
        # Cache job status
        cache_job_status(job_id, job_status.dict())
        
        # Queue job for processing
        if settings.USE_CELERY:
            # Queue in Celery
            from app.workers.export_worker import process_export_job
            process_export_job.delay(request.dict())
        else:
            # Process synchronously (development mode)
            logger.warning("Celery disabled, processing export synchronously")
            background_tasks.add_task(process_export_sync, job_id, request.dict())
        
        logger.info(f"Export job created: {job_id}")
        return job_status
    
    except Exception as e:
        logger.error(f"Failed to initiate export: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate export: {str(e)}"
        )


@router.get("/status/{job_id}", response_model=ExportJobStatus)
async def get_export_status(job_id: str):
    """Get export job status"""
    try:
        status = get_job_status(job_id)
        
        if not status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job {job_id} not found"
            )
        
        return ExportJobStatus(**status)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job status: {str(e)}"
        )


@router.post("/update-status")
async def update_export_status(request: UpdateExportStatusRequest):
    """
    Update export job status (called by Celery worker)
    """
    try:
        # Get existing status
        existing = get_job_status(request.jobId)
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job {request.jobId} not found"
            )
        
        # Update fields
        updated = ExportJobStatus(**existing)
        updated.status = request.status
        if request.progress is not None:
            updated.progress = request.progress
        if request.downloadUrl:
            updated.downloadUrl = request.downloadUrl
        if request.fileSize:
            updated.fileSize = request.fileSize
        if request.error:
            updated.error = request.error
        if request.metadata:
            updated.metadata = request.metadata
        if request.status == 'completed':
            updated.completedAt = datetime.now().isoformat()
        
        # Cache updated status
        cache_job_status(request.jobId, updated.dict())
        
        logger.info(f"Job {request.jobId} status updated to {request.status}")
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update job status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job status: {str(e)}"
        )


# Synchronous export processing (fallback)
async def process_export_sync(job_id: str, job_data: dict):
    """Process export synchronously (when Celery is disabled)"""
    try:
        # Import here to avoid circular dependency
        from app.workers.export_worker import process_export_job_logic
        
        # Update status to processing
        cache_job_status(job_id, {
            'jobId': job_id,
            'status': 'processing',
            'progress': 0
        })
        
        # Process export
        result = await process_export_job_logic(job_id, job_data)
        
        # Update to completed
        cache_job_status(job_id, result)
        
    except Exception as e:
        logger.error(f"Sync export failed: {e}", exc_info=True)
        # Update job to failed
        cache_job_status(job_id, {
            'jobId': job_id,
            'status': 'failed',
            'error': str(e),
            'progress': 0
        })