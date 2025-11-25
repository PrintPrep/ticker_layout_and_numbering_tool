"""
backend/app/models/layout_models.py
Pydantic models for layout optimization
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal, List


class Placement(BaseModel):
    """Single ticket placement on sheet"""
    index: int
    xMm: float
    yMm: float
    widthMm: float
    heightMm: float
    rotation: Literal[0, 90, 180, 270] = 0  # Updated to use Literal for type safety
    row: int
    col: int


class OptimizeLayoutRequest(BaseModel):
    """Request to optimize layout"""
    paperWidthMm: float
    paperHeightMm: float
    cardWidthMm: float
    cardHeightMm: float
    cardCount: Optional[int] = None
    
    # Margins (distance from paper edge)
    topMarginMm: float = 5
    bottomMarginMm: float = 5
    leftMarginMm: float = 5
    rightMarginMm: float = 5
    
    # Spacing (gap between tickets)
    spacingMm: float = 5
    
    # Orientation flags (kept for backward compatibility)
    horizontalOnly: bool = False
    verticalOnly: bool = False
    autoRotate: bool = True


class OptimizeLayoutResponse(BaseModel):
    """Response from layout optimization"""
    placements: List[Placement]
    fittedCount: int
    ticketsPerSheet: int
    totalSheets: int
    usableWidthMm: float
    usableHeightMm: float