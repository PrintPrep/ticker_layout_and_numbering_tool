# ============================================================================
# FILE: backend/app/api/v1/endpoints/layout.py
# ============================================================================

from fastapi import APIRouter, HTTPException, status
import logging

from app.models.layout_models import OptimizeLayoutRequest, OptimizeLayoutResponse
from app.services.layout_optimizer import LayoutOptimizer

logger = logging.getLogger(__name__)
router = APIRouter()

optimizer = LayoutOptimizer()


@router.post("/optimize", response_model=OptimizeLayoutResponse)
async def optimize_layout(request: OptimizeLayoutRequest):
    """Optimize ticket layout on paper"""
    try:
        result = optimizer.optimize(request)
        
        logger.info(f"Layout optimized: {result.fittedCount} tickets fitted")
        return result
    
    except Exception as e:
        logger.error(f"Layout optimization failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Layout optimization failed: {str(e)}"
        )