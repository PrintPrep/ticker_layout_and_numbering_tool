# ============================================================================
# FILE: backend/app/services/file_processor.py
# ============================================================================

import hashlib
import logging
from io import BytesIO

from app.utils.pdf_converter import pdf_to_image, get_pdf_info
from app.utils.image_optimizer import optimize_image, generate_thumbnail, get_image_dimensions
from app.models.file_models import FileProcessingResult
from app.core.config import settings

logger = logging.getLogger(__name__)


class FileProcessor:
    """Process uploaded files (PDF and images)"""
    
    def __init__(self):
        self.dpi = settings.PDF_DPI
        self.thumbnail_max_width = settings.THUMBNAIL_MAX_WIDTH
    
    def process_file(self, file_bytes: bytes, filename: str) -> FileProcessingResult:
        """
        Process uploaded file (PDF or image)
        
        Args:
            file_bytes: Raw file bytes
            filename: Original filename
        
        Returns:
            FileProcessingResult with processed data
        """
        # Calculate SHA256 hash
        sha256 = hashlib.sha256(file_bytes).hexdigest()
        
        # Detect file type
        is_pdf = filename.lower().endswith('.pdf') or file_bytes[:4] == b'%PDF'
        
        if is_pdf:
            return self._process_pdf(file_bytes, sha256)
        else:
            return self._process_image(file_bytes, sha256)
    
    def _process_pdf(self, pdf_bytes: bytes, sha256: str) -> FileProcessingResult:
        """Process PDF file"""
        try:
            # Convert first page to PNG
            png_bytes, width_mm, height_mm = pdf_to_image(pdf_bytes, dpi=self.dpi)
            
            # Generate thumbnail
            thumbnail_bytes = generate_thumbnail(
                png_bytes,
                max_width=self.thumbnail_max_width
            )
            
            # Calculate aspect ratio
            aspect_ratio = width_mm / height_mm if height_mm > 0 else 1.0
            
            logger.info(f"Processed PDF: {width_mm:.2f}mm x {height_mm:.2f}mm")
            
            return FileProcessingResult(
                image_bytes=png_bytes,
                thumbnail_bytes=thumbnail_bytes,
                width_mm=width_mm,
                height_mm=height_mm,
                aspect_ratio=aspect_ratio,
                sha256=sha256
            )
        
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            raise
    
    def _process_image(self, image_bytes: bytes, sha256: str) -> FileProcessingResult:
        """Process image file"""
        try:
            # Optimize image
            optimized_bytes, width_mm, height_mm = optimize_image(
                image_bytes,
                dpi=self.dpi
            )
            
            # Generate thumbnail
            thumbnail_bytes = generate_thumbnail(
                optimized_bytes,
                max_width=self.thumbnail_max_width
            )
            
            # Calculate aspect ratio
            aspect_ratio = width_mm / height_mm if height_mm > 0 else 1.0
            
            logger.info(f"Processed image: {width_mm:.2f}mm x {height_mm:.2f}mm")
            
            return FileProcessingResult(
                image_bytes=optimized_bytes,
                thumbnail_bytes=thumbnail_bytes,
                width_mm=width_mm,
                height_mm=height_mm,
                aspect_ratio=aspect_ratio,
                sha256=sha256
            )
        
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise