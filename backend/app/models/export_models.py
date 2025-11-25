# ============================================================================
# FILE: backend/app/models/export_models.py
# ============================================================================

from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal


class ExportSettings(BaseModel):
    """Export quality and color settings"""
    quality: Literal['print', 'digital'] = 'print'
    colorSpace: Literal['RGB', 'CMYK'] = 'RGB'


class DesignFiles(BaseModel):
    """Design file URLs"""
    frontFileId: str
    backFileId: Optional[str] = None


class PaperSettings(BaseModel):
    """Paper configuration"""
    paperWidthMm: float
    paperHeightMm: float
    topMarginMm: float = 5
    bottomMarginMm: float = 5
    leftMarginMm: float = 5
    rightMarginMm: float = 5
    spacingMm: float = 5


class LayoutConfig(BaseModel):
    """Layout configuration for export"""
    placements: List[Dict[str, Any]]
    totalCopies: int
    paperSettings: PaperSettings


class ImportedData(BaseModel):
    """Reference to imported CSV/XLSX data"""
    importId: str


class DirectExportRequest(BaseModel):
    """Request for direct PDF export (without project tracking)"""
    designFiles: DesignFiles
    layoutConfig: LayoutConfig
    exportSettings: ExportSettings
    numberingConfig: Optional[Dict[str, Any]] = None
    importedData: Optional[ImportedData] = None
    projectId: Optional[str] = None  # Make optional for direct exports
    userId: Optional[str] = None


# Keep the original for other endpoints if needed
class InitiateExportRequest(BaseModel):
    """Request to start PDF export (with project tracking)"""
    projectId: str
    userId: Optional[str] = None
    designFiles: DesignFiles
    layoutConfig: LayoutConfig
    exportSettings: ExportSettings
    numberingConfig: Optional[Dict[str, Any]] = None
    importedData: Optional[ImportedData] = None

class ExportJobStatus(BaseModel):
    """Export job status"""
    jobId: str
    status: Literal['queued', 'processing', 'completed', 'failed']
    progress: int = 0
    downloadUrl: Optional[str] = None
    fileSize: Optional[int] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    createdAt: str
    completedAt: Optional[str] = None


class UpdateExportStatusRequest(BaseModel):
    """Request to update export job status (from Celery worker)"""
    jobId: str
    status: Literal['queued', 'processing', 'completed', 'failed']
    progress: Optional[int] = None
    downloadUrl: Optional[str] = None
    fileSize: Optional[int] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None