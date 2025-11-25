# ============================================================================
# FILE: backend/app/services/layout_optimizer.py
# ============================================================================

import math
from typing import List, Literal
import logging

from app.models.layout_models import Placement, OptimizeLayoutRequest, OptimizeLayoutResponse

logger = logging.getLogger(__name__)


class Rectangle:
    """Represents a free rectangle in the packing space"""
    def __init__(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    
    def area(self) -> float:
        return self.width * self.height


class LayoutOptimizer:
    """Optimize ticket layout on paper with multiple fill methods"""
    
    def optimize(self, request: OptimizeLayoutRequest) -> OptimizeLayoutResponse:
        """
        Calculate optimal layout with margins, spacing, and orientation
        
        Args:
            request: Layout optimization parameters
        
        Returns:
            OptimizeLayoutResponse with placements
        """
        # Calculate usable area (subtract margins)
        usable_width = max(0, request.paperWidthMm - request.leftMarginMm - request.rightMarginMm)
        usable_height = max(0, request.paperHeightMm - request.topMarginMm - request.bottomMarginMm)
        
        # Determine fill mode from boolean flags
        if request.horizontalOnly:
            fill_mode = 'horizontal'
        elif request.verticalOnly:
            fill_mode = 'vertical'
        elif request.autoRotate:
            fill_mode = 'auto-rotate'
        else:
            fill_mode = 'horizontal'  # Default
        
        # Calculate placements based on fill mode
        if fill_mode == 'horizontal':
            placements = self._calculate_grid_layout(
                usable_width, usable_height,
                request.cardWidthMm, request.cardHeightMm,
                request.spacingMm, request.leftMarginMm, request.topMarginMm,
                rotation=0
            )
        elif fill_mode == 'vertical':
            placements = self._calculate_grid_layout(
                usable_width, usable_height,
                request.cardHeightMm, request.cardWidthMm,  # Swapped
                request.spacingMm, request.leftMarginMm, request.topMarginMm,
                rotation=90
            )
        else:  # auto-rotate
            placements = self._calculate_mixed_orientation_layout(
                usable_width, usable_height,
                request.cardWidthMm, request.cardHeightMm,
                request.spacingMm, request.leftMarginMm, request.topMarginMm
            )
        
        # Apply card count limit if specified
        if request.cardCount and request.cardCount > 0:
            placements = placements[:request.cardCount]
        
        fitted_count = len(placements)
        tickets_per_sheet = len(placements)
        total_sheets = math.ceil(request.cardCount / tickets_per_sheet) if request.cardCount and tickets_per_sheet > 0 else 1
        
        logger.info(
            f"Optimized layout ({fill_mode}): {fitted_count} tickets, "
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
    
    def _calculate_grid_layout(
        self,
        usable_width: float,
        usable_height: float,
        card_width: float,
        card_height: float,
        spacing: float,
        left_margin: float,
        top_margin: float,
        rotation: Literal[0, 90]
    ) -> List[Placement]:
        """
        Grid-based layout for horizontal or vertical orientation only
        """
        card_with_spacing_w = card_width + spacing
        card_with_spacing_h = card_height + spacing
        
        cols = math.floor((usable_width + spacing) / card_with_spacing_w)
        rows = math.floor((usable_height + spacing) / card_with_spacing_h)
        
        placements = []
        index = 0
        
        for row in range(rows):
            for col in range(cols):
                x = left_margin + (col * card_with_spacing_w)
                y = top_margin + (row * card_with_spacing_h)
                
                placements.append(Placement(
                    index=index,
                    xMm=round(x, 6),
                    yMm=round(y, 6),
                    widthMm=round(card_width, 6),
                    heightMm=round(card_height, 6),
                    rotation=rotation,
                    row=row,
                    col=col
                ))
                
                index += 1
        
        return placements
    
    def _calculate_mixed_orientation_layout(
        self,
        usable_width: float,
        usable_height: float,
        card_width: float,
        card_height: float,
        spacing: float,
        left_margin: float,
        top_margin: float
    ) -> List[Placement]:
        """
        Mixed-orientation layout using guillotine bin packing algorithm
        Allows both horizontal (0°) and vertical (90°) cards on the same page
        """
        placements = []
        free_rectangles = [Rectangle(0, 0, usable_width, usable_height)]
        
        index = 0
        grid_row = 0
        grid_col = 0
        
        # Keep trying to place cards until no more space
        while free_rectangles:
            # Find best rectangle and orientation
            best_rect = None
            best_rect_index = -1
            best_rotation = 0
            best_fit = float('inf')
            
            # Try each free rectangle
            for i, rect in enumerate(free_rectangles):
                # Try horizontal orientation (0°)
                if rect.width >= card_width and rect.height >= card_height:
                    wasted_space = rect.area() - (card_width * card_height)
                    if wasted_space < best_fit:
                        best_fit = wasted_space
                        best_rect = rect
                        best_rect_index = i
                        best_rotation = 0
                
                # Try vertical orientation (90°)
                if rect.width >= card_height and rect.height >= card_width:
                    wasted_space = rect.area() - (card_height * card_width)
                    if wasted_space < best_fit:
                        best_fit = wasted_space
                        best_rect = rect
                        best_rect_index = i
                        best_rotation = 90
            
            # No more space available
            if best_rect is None:
                break
            
            # Determine actual card dimensions based on rotation
            actual_width = card_width if best_rotation == 0 else card_height
            actual_height = card_height if best_rotation == 0 else card_width
            
            # Place the card
            placements.append(Placement(
                index=index,
                xMm=round(left_margin + best_rect.x, 6),
                yMm=round(top_margin + best_rect.y, 6),
                widthMm=round(actual_width, 6),
                heightMm=round(actual_height, 6),
                rotation=best_rotation,
                row=grid_row,
                col=grid_col
            ))
            
            # Remove used rectangle
            free_rectangles.pop(best_rect_index)
            
            # Split remaining space using guillotine cuts
            remaining_right = best_rect.width - actual_width - spacing
            remaining_bottom = best_rect.height - actual_height - spacing
            
            # Add right rectangle if there's space
            if remaining_right > 0:
                free_rectangles.append(Rectangle(
                    best_rect.x + actual_width + spacing,
                    best_rect.y,
                    remaining_right,
                    best_rect.height
                ))
            
            # Add bottom rectangle if there's space
            if remaining_bottom > 0:
                free_rectangles.append(Rectangle(
                    best_rect.x,
                    best_rect.y + actual_height + spacing,
                    actual_width,
                    remaining_bottom
                ))
            
            # Update grid position (approximate for display)
            grid_col += 1
            if grid_col > 5:  # Arbitrary wrap
                grid_col = 0
                grid_row += 1
            
            # Sort rectangles by area (larger first) for better packing
            free_rectangles.sort(key=lambda r: r.area(), reverse=True)
            
            index += 1
            
            # Safety limit to prevent infinite loops
            if index > 1000:
                break
        
        return placements