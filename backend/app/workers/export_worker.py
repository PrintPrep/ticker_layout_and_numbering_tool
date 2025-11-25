# ============================================================================
# FILE: backend/app/workers/export_worker.py
# ============================================================================

from celery import Task
import logging
import httpx
import math
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.storage import get_storage_provider
from app.core.redis_cache import get_import_data, cache_job_status
from app.services.pdf_generator import PDFGenerator
from app.services.numbering_generator import NumberingGenerator

logger = logging.getLogger(__name__)


class CallbackTask(Task):
    """Custom task class with callback"""
    
    def on_success(self, retval, task_id, args, kwargs):
        logger.info(f"Task {task_id} succeeded")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {exc}")


@celery_app.task(bind=True, base=CallbackTask)
def process_export_job(self, job_data: Dict[str, Any]):
    """
    Background task to generate PDF export
    """
    job_id = job_data.get('jobId', 'unknown')
    
    try:
        logger.info(f"Starting export job: {job_id}")
        result = process_export_job_logic_sync(job_id, job_data)
        return result
    
    except Exception as e:
        logger.error(f"Export job failed: {e}", exc_info=True)
        update_job_status_api(job_id, 'failed', error=str(e))
        raise


def process_export_job_logic_sync(job_id: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Core export logic (shared between Celery and sync processing)
    """
    try:
        # Update status to processing
        update_job_status_api(job_id, 'processing', 5)
        
        # Extract configuration
        design_files = job_data['designFiles']
        layout_config = job_data['layoutConfig']
        export_settings = job_data['exportSettings']
        numbering_config = job_data.get('numberingConfig')
        imported_data_ref = job_data.get('importedData')
        
        front_file_url = design_files['frontFileId']
        back_file_url = design_files.get('backFileId')
        
        placements = layout_config['placements']
        total_copies = layout_config['totalCopies']
        paper_settings = layout_config['paperSettings']
        
        update_job_status_api(job_id, 'processing', 10)
        
        # Load imported data if present
        imported_data = None
        if imported_data_ref:
            import_id = imported_data_ref.get('importId')
            cached_data = get_import_data(import_id)
            if cached_data:
                imported_data = pd.read_json(cached_data)
                logger.info(f"Loaded {len(imported_data)} rows from import")
        
        update_job_status_api(job_id, 'processing', 15)
        
        # Initialize numbering generator
        numbering_generator = None
        if numbering_config:
            numbering_generator = NumberingGenerator(numbering_config)
        
        # Calculate pages needed
        tickets_per_sheet = len(placements)
        total_sheets = math.ceil(total_copies / tickets_per_sheet)
        
        logger.info(f"Generating {total_sheets} sheets, {total_copies} total tickets")
        
        update_job_status_api(job_id, 'processing', 20)
        
        # Build front pages
        front_pages = []
        for sheet_idx in range(total_sheets):
            page_placements = []
            
            for placement_idx, placement in enumerate(placements):
                ticket_num = sheet_idx * tickets_per_sheet + placement_idx + 1
                
                if ticket_num > total_copies:
                    break
                
                # Generate numbering for this ticket
                numbering_text = ''
                if numbering_generator:
                    row_data = None
                    if imported_data is not None and ticket_num <= len(imported_data):
                        row_data = imported_data.iloc[ticket_num - 1].to_dict()
                    
                    numbering_text = numbering_generator.generate_for_ticket(ticket_num, row_data)
                
                # Add to page placements
                page_placements.append({
                    **placement,
                    'ticketNumber': ticket_num,
                    'numberingText': numbering_text
                })
            
            front_pages.append({
                'placements': page_placements,
                'designImageUrl': front_file_url,
                'numberingElements': numbering_config.get('elements', []) if numbering_config else []
            })
        
        update_job_status_api(job_id, 'processing', 40)
        
        # Build back pages if double-sided
        back_pages = None
        if back_file_url:
            back_pages = []
            for sheet_idx in range(total_sheets):
                page_placements = []
                
                for placement_idx, placement in enumerate(placements):
                    ticket_num = sheet_idx * tickets_per_sheet + placement_idx + 1
                    
                    if ticket_num > total_copies:
                        break
                    
                    # Generate numbering for this ticket (back side)
                    numbering_text = ''
                    if numbering_generator:
                        row_data = None
                        if imported_data is not None and ticket_num <= len(imported_data):
                            row_data = imported_data.iloc[ticket_num - 1].to_dict()
                        
                        numbering_text = numbering_generator.generate_for_ticket(ticket_num, row_data)
                    
                    # Add to page placements
                    page_placements.append({
                        **placement,
                        'ticketNumber': ticket_num,
                        'numberingText': numbering_text
                    })
                
                back_pages.append({
                    'placements': page_placements,
                    'designImageUrl': back_file_url,
                    'numberingElements': [
                        e for e in numbering_config.get('elements', [])
                        if e.get('side') == 'back'
                    ] if numbering_config else []
                })
        
        update_job_status_api(job_id, 'processing', 60)
        
        # Generate PDF
        pdf_generator = PDFGenerator(
            quality=export_settings['quality'],
            color_space=export_settings['colorSpace']
        )
        
        pdf_bytes = pdf_generator.create_pdf(
            paper_width_mm=paper_settings['paperWidthMm'],
            paper_height_mm=paper_settings['paperHeightMm'],
            front_pages=front_pages,
            back_pages=back_pages
        )
        
        update_job_status_api(job_id, 'processing', 85)
        
        # Upload PDF to storage
        storage = get_storage_provider()
        download_url = await_sync(storage.upload_file(
            pdf_bytes,
            f"export_{job_id}.pdf",
            folder="exports"
        ))
        
        file_size = len(pdf_bytes)
        
        update_job_status_api(job_id, 'processing', 95)
        
        # Complete job
        result = {
            'jobId': job_id,
            'status': 'completed',
            'progress': 100,
            'downloadUrl': download_url,
            'fileSize': file_size,
            'metadata': {
                'totalSheets': total_sheets,
                'totalTickets': total_copies,
                'processingTime': 'N/A'
            },
            'completedAt': datetime.now().isoformat()
        }
        
        update_job_status_api(
            job_id,
            'completed',
            100,
            download_url=download_url,
            file_size=file_size
        )
        
        logger.info(f"Export job completed: {job_id}, {file_size} bytes")
        return result
    
    except Exception as e:
        logger.error(f"Export processing failed: {e}", exc_info=True)
        raise


def update_job_status_api(
    job_id: str,
    status: str,
    progress: int = None,
    download_url: str = None,
    file_size: int = None,
    error: str = None
):
    """Update job status via API or cache"""
    try:
        # Try API first
        with httpx.Client() as client:
            response = client.post(
                f"{settings.NEXTJS_API_URL}/api/export/update-status",
                json={
                    'jobId': job_id,
                    'status': status,
                    'progress': progress,
                    'downloadUrl': download_url,
                    'fileSize': file_size,
                    'error': error
                },
                timeout=10.0
            )
            response.raise_for_status()
    except Exception as e:
        logger.warning(f"API update failed, using cache: {e}")
        # Fallback to cache
        cache_job_status(job_id, {
            'jobId': job_id,
            'status': status,
            'progress': progress or 0,
            'downloadUrl': download_url,
            'fileSize': file_size,
            'error': error
        })


def await_sync(coro):
    """Run async function synchronously"""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


# Async version for non-Celery processing
async def process_export_job_logic(job_id: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Async version of export logic
    """
    return process_export_job_logic_sync(job_id, job_data)
