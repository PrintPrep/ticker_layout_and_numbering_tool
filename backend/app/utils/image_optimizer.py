"""
Image optimization utilities using pyvips
"""

import pyvips
from io import BytesIO
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


def optimize_image(
    image_bytes: bytes,
    max_dimension: int = 4000,
    quality: int = 90,
    dpi: int = 300
) -> Tuple[bytes, float, float]:
    """
    Optimize image and extract dimensions
    
    Args:
        image_bytes: Input image bytes
        max_dimension: Maximum width or height
        quality: JPEG/PNG quality (0-100)
        dpi: Assumed DPI for dimension calculation
    
    Returns:
        Tuple of (optimized_bytes, width_mm, height_mm)
    """
    try:
        # Load image
        image = pyvips.Image.new_from_buffer(image_bytes, '')
        
        # Get original dimensions
        width_px = image.width
        height_px = image.height
        
        # Calculate dimensions in mm (assuming DPI)
        width_mm = (width_px / dpi) * 25.4
        height_mm = (height_px / dpi) * 25.4
        
        # Resize if too large
        if max(width_px, height_px) > max_dimension:
            scale = max_dimension / max(width_px, height_px)
            image = image.resize(scale, kernel='lanczos3')
            logger.info(f"Resized image from {width_px}x{height_px} to {image.width}x{image.height}")
        
        # Convert to sRGB if needed
        if image.interpretation != 'srgb':
            image = image.colourspace('srgb')
        
        # Save as PNG with optimization
        buffer = BytesIO()
        image.write_to_buffer('.png', Q=quality)
        
        optimized_bytes = image.write_to_buffer('.png', Q=quality)
        
        logger.info(f"Optimized image: {width_mm:.2f}mm x {height_mm:.2f}mm")
        
        return optimized_bytes, width_mm, height_mm
    
    except Exception as e:
        logger.error(f"Image optimization failed: {e}")
        raise


def generate_thumbnail(
    image_bytes: bytes,
    max_width: int = 200,
    quality: int = 80
) -> bytes:
    """
    Generate thumbnail from image
    
    Args:
        image_bytes: Input image bytes
        max_width: Maximum width for thumbnail
        quality: Output quality
    
    Returns:
        Thumbnail bytes
    """
    try:
        image = pyvips.Image.new_from_buffer(image_bytes, '')
        
        # Calculate scale
        scale = max_width / image.width
        
        # Resize
        thumbnail = image.resize(scale, kernel='lanczos3')
        
        # Save as PNG
        thumbnail_bytes = thumbnail.write_to_buffer('.png', Q=quality)
        
        logger.info(f"Generated thumbnail: {thumbnail.width}x{thumbnail.height}")
        
        return thumbnail_bytes
    
    except Exception as e:
        logger.error(f"Thumbnail generation failed: {e}")
        raise


def get_image_dimensions(image_bytes: bytes, dpi: int = 300) -> Tuple[float, float, float]:
    """
    Get image dimensions without optimization
    
    Args:
        image_bytes: Input image bytes
        dpi: Assumed DPI
    
    Returns:
        Tuple of (width_mm, height_mm, aspect_ratio)
    """
    try:
        image = pyvips.Image.new_from_buffer(image_bytes, '')
        
        width_px = image.width
        height_px = image.height
        
        width_mm = (width_px / dpi) * 25.4
        height_mm = (height_px / dpi) * 25.4
        aspect_ratio = width_mm / height_mm if height_mm > 0 else 1.0
        
        return width_mm, height_mm, aspect_ratio
    
    except Exception as e:
        logger.error(f"Failed to get image dimensions: {e}")
        raise


def convert_colorspace(
    image_bytes: bytes,
    target_colorspace: str = 'RGB'
) -> bytes:
    """
    Convert image colorspace
    
    Args:
        image_bytes: Input image bytes
        target_colorspace: Target colorspace (RGB, CMYK, etc.)
    
    Returns:
        Converted image bytes
    """
    try:
        image = pyvips.Image.new_from_buffer(image_bytes, '')
        
        # Convert to target colorspace
        if target_colorspace.upper() == 'CMYK':
            image = image.colourspace('cmyk')
        elif target_colorspace.upper() == 'RGB':
            image = image.colourspace('srgb')
        
        # Write to buffer
        converted_bytes = image.write_to_buffer('.png')
        
        return converted_bytes
    
    except Exception as e:
        logger.error(f"Colorspace conversion failed: {e}")
        raise