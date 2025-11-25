# ============================================================================
# FILE: backend/app/api/v1/endpoints/files.py
# ============================================================================

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import base64
import logging

from app.models.file_models import FileUploadRequest, ProcessedFileResponse, FileDimensions
from app.services.file_processor import FileProcessor
from app.core.storage import get_storage_provider

logger = logging.getLogger(__name__)
router = APIRouter()

file_processor = FileProcessor()
storage = get_storage_provider()


@router.post("/process", response_model=ProcessedFileResponse)
async def process_file(request: FileUploadRequest):
    """
    Process uploaded file (PDF or image)
    Convert PDF to image, optimize, generate thumbnail, upload to storage
    """
    try:
        # Decode base64 file
        try:
            file_bytes = base64.b64decode(request.file)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 encoding: {str(e)}"
            )
        
        # Process file
        result = file_processor.process_file(file_bytes, request.filename)
        
        # Upload processed image
        processed_url = await storage.upload_file(
            result.image_bytes,
            request.filename,
            folder=f"processed/{request.side}"
        )
        
        # Upload thumbnail
        thumbnail_url = await storage.upload_file(
            result.thumbnail_bytes,
            f"thumb_{request.filename}",
            folder=f"thumbnails/{request.side}"
        )
        
        # Return response
        response = ProcessedFileResponse(
            fileId=result.sha256[:16],  # Use first 16 chars of hash as ID
            originalName=request.filename,
            processedUrl=processed_url,
            thumbnailUrl=thumbnail_url,
            dimensions=FileDimensions(
                widthMm=result.width_mm,
                heightMm=result.height_mm,
                aspectRatio=result.aspect_ratio
            ),
            aspectRatio=result.aspect_ratio,
            fileSizeBytes=len(file_bytes),
            mimeType="image/png",
            side=request.side,
            sha256=result.sha256
        )
        
        logger.info(f"File processed successfully: {request.filename}")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File processing failed: {str(e)}"
        )
