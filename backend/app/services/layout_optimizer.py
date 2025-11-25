# ============================================================================
# FILE: backend/app/services/layout_optimizer.py
# ============================================================================

import math
from typing import List, Dict
import logging

from app.models.layout_models import Placement, OptimizeLayoutRequest, OptimizeLayoutResponse

logger = logging.getLogger(__name__)


class LayoutOptimizer:
    """Optimize ticket layout on paper"""
    
    def optimize(self, request: OptimizeLayoutRequest) -> OptimizeLayoutResponse:
        """
        Calculate optimal layout with margins and spacing
        
        Args:
            request: Layout optimization parameters
        
        Returns:
            OptimizeLayoutResponse with placements
        """
        # Calculate usable area (subtract margins)
        usable_width = max(0, request.paperWidthMm - request.leftMarginMm - request.rightMarginMm)
        usable_height = max(0, request.paperHeightMm - request.topMarginMm - request.bottomMarginMm)
        
        # Card dimensions including spacing
        card_with_spacing_w = request.cardWidthMm + request.spacingMm
        card_with_spacing_h = request.cardHeightMm + request.spacingMm
        
        # Calculate how many fit (without spacing on last row/column)
        cols = math.floor((usable_width + request.spacingMm) / card_with_spacing_w)
        rows = math.floor((usable_height + request.spacingMm) / card_with_spacing_h)
        
        tickets_per_sheet = cols * rows
        
        # Generate placements
        placements = []
        index = 0
        
        for row in range(rows):
            for col in range(cols):
                # Position relative to usable area start
                x = request.leftMarginMm + (col * card_with_spacing_w)
                y = request.topMarginMm + (row * card_with_spacing_h)
                
                placements.append(Placement(
                    index=index,
                    xMm=round(x, 6),
                    yMm=round(y, 6),
                    widthMm=round(request.cardWidthMm, 6),
                    heightMm=round(request.cardHeightMm, 6),
                    rotation=0,
                    row=row,
                    col=col
                ))
                
                index += 1
                
                # Stop if user specified a card count
                if request.cardCount and index >= request.cardCount:
                    break
            
            if request.cardCount and index >= request.cardCount:
                break
        
        # Limit to requested count
        if request.cardCount and request.cardCount > 0:
            placements = placements[:request.cardCount]
        
        fitted_count = len(placements)
        total_sheets = math.ceil(fitted_count / tickets_per_sheet) if tickets_per_sheet > 0 else 0
        
        logger.info(
            f"Optimized layout: {fitted_count} tickets, "
            f"{tickets_per_sheet} per sheet, {total_sheets} sheets"
        )
        
        return OptimizeLayoutResponse(
            placements=placements,
            fittedCount=fitted_count,
            ticketsPerSheet=tickets_per_sheet,
            totalSheets=total_sheets,
            usableWidthMm=usable_width,
            usableHeightMm=usable_height
        )
