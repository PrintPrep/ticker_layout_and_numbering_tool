"""
Pydantic models for file operations
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class FileUploadRequest(BaseModel):
    """Request model for file upload"""
    file: str  # base64 encoded file
    filename: str
    side: str = Field(..., pattern="^(front|back)$")
    userId: Optional[str] = None


class FileDimensions(BaseModel):
    """File dimensions in millimeters"""
    widthMm: float
    heightMm: float
    aspectRatio: float


class ProcessedFileResponse(BaseModel):
    """Response after file processing"""
    fileId: str
    originalName: str
    processedUrl: str
    thumbnailUrl: str
    dimensions: FileDimensions
    aspectRatio: float
    fileSizeBytes: int
    mimeType: str
    side: str
    sha256: Optional[str] = None


class FileProcessingResult(BaseModel):
    """Internal model for file processing result"""
    image_bytes: bytes
    thumbnail_bytes: bytes
    width_mm: float
    height_mm: float
    aspect_ratio: float
    sha256: str