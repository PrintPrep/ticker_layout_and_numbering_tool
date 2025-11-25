"""
Barcode generation utilities
"""

import barcode
from barcode.writer import ImageWriter
from io import BytesIO
import base64
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def generate_barcode(
    data: str,
    barcode_type: str = 'code128',
    height: int = 50,
    show_text: bool = True
) -> Optional[str]:
    """
    Generate barcode and return as base64 data URL
    
    Args:
        data: Data to encode
        barcode_type: Type of barcode (code128, ean13, ean8, upca, code39)
        height: Height in millimeters
        show_text: Show text below barcode
    
    Returns:
        Base64 data URL string or None on error
    """
    try:
        # Get barcode class
        barcode_class = barcode.get_barcode_class(barcode_type)
        
        # Create barcode instance
        barcode_instance = barcode_class(data, writer=ImageWriter())
        
        # Configure options
        options = {
            'write_text': show_text,
            'module_height': height / 10,  # Convert mm to barcode units
            'text_distance': 3,
            'quiet_zone': 2,
            'font_size': 10
        }
        
        # Generate to buffer
        buffer = BytesIO()
        barcode_instance.write(buffer, options=options)
        
        # Convert to base64
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    
    except Exception as e:
        logger.error(f"Barcode generation error: {e}")
        return None


def validate_barcode_data(data: str, barcode_type: str) -> bool:
    """
    Validate barcode data for specific type
    
    Args:
        data: Data to validate
        barcode_type: Type of barcode
    
    Returns:
        True if valid, False otherwise
    """
    try:
        if barcode_type == 'ean13':
            return len(data) == 12 and data.isdigit()
        elif barcode_type == 'ean8':
            return len(data) == 7 and data.isdigit()
        elif barcode_type == 'upca':
            return len(data) == 11 and data.isdigit()
        elif barcode_type == 'code128':
            return len(data) > 0
        elif barcode_type == 'code39':
            # Code39 allows alphanumeric
            return len(data) > 0
        return False
    except:
        return False


# Supported barcode types
SUPPORTED_BARCODE_TYPES = [
    'code128',
    'ean13',
    'ean8',
    'upca',
    'code39'
]