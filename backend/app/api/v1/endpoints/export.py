# ============================================================================
# FILE: backend/app/api/v1/endpoints/export.py
# ============================================================================

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import math
import logging

# Make sure you're importing the correct model
from app.models.export_models import DirectExportRequest  # This should be DirectExportRequest
from app.services.pdf_generator import PDFGenerator

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/direct")
async def direct_export(
    request: DirectExportRequest  # This should be DirectExportRequest, not InitiateExportRequest
):
    """
    Direct PDF export without job tracking
    Returns PDF bytes directly
    """
    try:
        logger.info(f"Starting direct export for {request.layoutConfig.totalCopies} copies")
        
        # Generate PDF directly
        pdf_generator = PDFGenerator(
            quality=request.exportSettings.quality, # e.g., 'high', 'medium', 'low'
            color_space=request.exportSettings.colorSpace # e.g., 'RGB' or 'CMYK'
        )
        
        # Prepare front pages
        front_pages = []
        back_pages = []
        
        # Calculate how many sheets we need
        placements_count = len(request.layoutConfig.placements)
        if placements_count == 0:
            raise HTTPException(status_code=400, detail="No placements configured")
            
        total_sheets = math.ceil(request.layoutConfig.totalCopies / placements_count)
        
        logger.info(f"Generating {total_sheets} sheets with {placements_count} placements each")
        
        for sheet_idx in range(total_sheets):
            front_page = {
                'placements': request.layoutConfig.placements,
                'designImageUrl': request.designFiles.frontFileId,
                'numberingElements': request.numberingConfig.get('elements', []) if request.numberingConfig else []
            }
            front_pages.append(front_page)
            
            if request.designFiles.backFileId:
                back_page = {
                    'placements': request.layoutConfig.placements,
                    'designImageUrl': request.designFiles.backFileId,
                    'numberingElements': request.numberingConfig.get('elements', []) if request.numberingConfig else []
                }
                back_pages.append(back_page)
        
        # Generate PDF
        pdf_bytes = pdf_generator.create_pdf(
            paper_width_mm=request.layoutConfig.paperSettings.paperWidthMm,
            paper_height_mm=request.layoutConfig.paperSettings.paperHeightMm,
            front_pages=front_pages,
            back_pages=back_pages if back_pages else None
        )
        
        logger.info(f"PDF generated successfully: {len(pdf_bytes)} bytes")
        
        # Return PDF directly
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=tickets_export.pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Direct export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))