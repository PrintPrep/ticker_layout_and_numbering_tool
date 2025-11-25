# ============================================================================
# FILE: backend/app/api/v1/endpoints/numbering.py
# ============================================================================

from fastapi import APIRouter, HTTPException, status
import base64
import pandas as pd
from datetime import datetime, timedelta
from uuid import uuid4
import logging

from app.models.numbering_models import (
    GenerateQRRequest,
    GenerateBarcodeRequest,
    ImportDataRequest,
    ImportDataResponse
)
from app.utils.qr_generator import generate_qr_code
from app.utils.barcode_generator import generate_barcode
from app.core.redis_cache import cache_import_data

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate-qr")
async def generate_qr_preview(request: GenerateQRRequest):
    """Generate QR code preview"""
    try:
        qr_image = generate_qr_code(
            data=request.data,
            size=request.size,
            error_correction=request.errorCorrection
        )
        
        return {"success": True, "imageData": qr_image}
    
    except Exception as e:
        logger.error(f"QR generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"QR code generation failed: {str(e)}"
        )


@router.post("/generate-barcode")
async def generate_barcode_preview(request: GenerateBarcodeRequest):
    """Generate barcode preview"""
    try:
        barcode_image = generate_barcode(
            data=request.data,
            barcode_type=request.type,
            height=request.height,
            show_text=request.showText
        )
        
        if not barcode_image:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid barcode data for specified type"
            )
        
        return {"success": True, "imageData": barcode_image}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Barcode generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Barcode generation failed: {str(e)}"
        )


@router.post("/import-data", response_model=ImportDataResponse)
async def import_csv_xlsx(request: ImportDataRequest):
    """Import CSV or XLSX data"""
    try:
        # Decode file
        file_bytes = base64.b64decode(request.file)
        
        # Detect file type
        is_xlsx = request.filename.lower().endswith(('.xlsx', '.xls'))
        
        # Parse file
        if is_xlsx:
            df = pd.read_excel(BytesIO(file_bytes), sheet_name=0)  # First sheet only
        else:
            df = pd.read_csv(BytesIO(file_bytes))
        
        # Get columns and preview
        columns = df.columns.tolist()
        row_count = len(df)
        preview = df.head(10).to_dict('records')
        
        # Generate import ID
        import_id = str(uuid4())
        
        # Cache data (1 hour TTL)
        cache_import_data(import_id, df.to_json(), ttl=3600)
        
        # Calculate expiry
        expires_at = (datetime.now() + timedelta(hours=1)).isoformat()
        
        logger.info(f"Imported {row_count} rows from {request.filename}")
        
        return ImportDataResponse(
            importId=import_id,
            columns=columns,
            rowCount=row_count,
            preview=preview,
            expiresAt=expires_at
        )
    
    except Exception as e:
        logger.error(f"Data import failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data import failed: {str(e)}"
        )