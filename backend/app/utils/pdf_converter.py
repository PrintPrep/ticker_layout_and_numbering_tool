"""
PDF conversion utilities using PyMuPDF (fitz)
"""

import fitz  # PyMuPDF
from io import BytesIO
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


def pdf_to_image(
    pdf_bytes: bytes,
    page_number: int = 0,
    dpi: int = 300
) -> Tuple[bytes, float, float]:
    """
    Convert PDF page to PNG image
    
    Args:
        pdf_bytes: PDF file bytes
        page_number: Page to convert (0-indexed)
        dpi: Resolution for output image
    
    Returns:
        Tuple of (png_bytes, width_mm, height_mm)
    """
    try:
        # Open PDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if page_number >= len(doc):
            raise ValueError(f"Page {page_number} does not exist (PDF has {len(doc)} pages)")
        
        # Get the specified page
        page = doc[page_number]
        
        # Get dimensions in points (1 point = 1/72 inch)
        rect = page.rect
        width_pt = rect.width
        height_pt = rect.height
        
        # Convert to millimeters
        width_mm = (width_pt / 72) * 25.4
        height_mm = (height_pt / 72) * 25.4
        
        # Create transformation matrix for DPI
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        
        # Render page to pixmap
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PNG bytes
        png_bytes = pix.tobytes("png")
        
        # Clean up
        doc.close()
        
        logger.info(f"Converted PDF page to image: {width_mm:.2f}mm x {height_mm:.2f}mm at {dpi} DPI")
        
        return png_bytes, width_mm, height_mm
    
    except Exception as e:
        logger.error(f"PDF conversion failed: {e}")
        raise


def get_pdf_info(pdf_bytes: bytes) -> dict:
    """
    Extract PDF metadata
    
    Args:
        pdf_bytes: PDF file bytes
    
    Returns:
        Dictionary with PDF info
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        info = {
            'page_count': len(doc),
            'title': doc.metadata.get('title', ''),
            'author': doc.metadata.get('author', ''),
            'subject': doc.metadata.get('subject', ''),
            'keywords': doc.metadata.get('keywords', ''),
        }
        
        # Get first page dimensions
        if len(doc) > 0:
            page = doc[0]
            rect = page.rect
            info['width_mm'] = (rect.width / 72) * 25.4
            info['height_mm'] = (rect.height / 72) * 25.4
            info['aspect_ratio'] = rect.width / rect.height if rect.height > 0 else 1.0
        
        doc.close()
        
        return info
    
    except Exception as e:
        logger.error(f"Failed to get PDF info: {e}")
        raise