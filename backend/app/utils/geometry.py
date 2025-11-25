"""
Geometric calculation utilities
"""

import math
from typing import Dict, Tuple


def calculate_aspect_ratio(width: float, height: float) -> float:
    """Calculate aspect ratio (width / height)"""
    if height == 0:
        return 1.0
    return round(width / height, 6)


def rotate_dimensions(width: float, height: float, rotation: int) -> Tuple[float, float]:
    """
    Get dimensions after rotation
    90° and 270° swap width and height
    """
    if rotation in [90, 270]:
        return height, width
    return width, height


def get_back_rotation(front_rotation: int) -> int:
    """
    Calculate back side rotation for proper alignment
    Rules:
    - 0° stays 0°
    - 90° becomes 270°
    - 180° stays 180°
    - 270° becomes 90°
    """
    rotation_map = {
        0: 0,
        90: 270,
        180: 180,
        270: 90
    }
    return rotation_map.get(front_rotation, 0)


def mirror_position_horizontal(
    x: float,
    width: float,
    paper_width: float
) -> float:
    """
    Mirror position horizontally for back side printing
    """
    return paper_width - x - width


def calculate_scaled_dimensions(
    original_width: float,
    original_height: float,
    target_width: float = None,
    target_height: float = None,
    maintain_aspect: bool = True
) -> Tuple[float, float]:
    """
    Calculate scaled dimensions maintaining aspect ratio
    """
    if not maintain_aspect:
        return target_width or original_width, target_height or original_height
    
    aspect_ratio = calculate_aspect_ratio(original_width, original_height)
    
    if target_width and not target_height:
        return target_width, target_width / aspect_ratio
    elif target_height and not target_width:
        return target_height * aspect_ratio, target_height
    elif target_width and target_height:
        # Fit within bounds
        scale = min(
            target_width / original_width,
            target_height / original_height
        )
        return original_width * scale, original_height * scale
    
    return original_width, original_height


def round_to_precision(value: float, decimals: int = 6) -> float:
    """Round float to specified decimal places"""
    return round(value, decimals)