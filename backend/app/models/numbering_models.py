"""
Pydantic models for numbering configuration
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


class SubElementConfig(BaseModel):
    """Configuration for a sub-element (text or numeric)"""
    # Text type
    text: Optional[str] = None
    
    # Numeric type
    numericType: Optional[Literal['123', 'roman_lower', 'roman_upper', 'abc_lower', 'abc_upper', 'hex']] = None
    digits: Optional[Literal['fixed', 'dynamic']] = 'dynamic'
    fixedDigitCount: Optional[int] = 3
    flow: Optional[Literal['increment', 'decrement']] = 'increment'
    startValue: Optional[int] = 1
    step: Optional[int] = 1
    
    # Styling (common)
    fontFamily: str = 'Helvetica'
    fontSize: int = 12
    bold: bool = False
    italic: bool = False
    underline: bool = False
    color: str = '#000000'


class SubElement(BaseModel):
    """Sub-element within a numbering element"""
    id: str
    order: int
    type: Literal['text', 'numeric']
    config: SubElementConfig


class SeparatorConfig(BaseModel):
    """Separator configuration"""
    type: Literal['hyphen', 'underscore', 'dot', 'comma', 'space', 'none', 'custom'] = 'none'
    customValue: Optional[str] = None


class LayoutConfig(BaseModel):
    """Layout configuration for sub-elements"""
    direction: Literal['horizontal', 'vertical'] = 'horizontal'
    alignment: Literal['left', 'center', 'right'] = 'center'
    spacing: int = 0


class ContainerStyle(BaseModel):
    """Container styling"""
    backgroundColor: str = 'transparent'
    backgroundOpacity: float = Field(1.0, ge=0, le=1)
    borderWidth: int = 0
    borderColor: str = '#000000'
    borderOpacity: float = Field(1.0, ge=0, le=1)
    borderRadius: int = 0
    padding: int = 0
    textAlign: Literal['left', 'center', 'right'] = 'center'


class StructuredQRData(BaseModel):
    """Structured data for QR codes"""
    type: Literal['url', 'vcard', 'wifi', 'email', 'sms', 'tel', 'geo']
    url: Optional[str] = None
    vcard: Optional[Dict[str, str]] = None
    wifi: Optional[Dict[str, str]] = None
    email: Optional[Dict[str, str]] = None
    sms: Optional[Dict[str, str]] = None
    tel: Optional[Dict[str, str]] = None
    geo: Optional[Dict[str, float]] = None


class QRCodeAddon(BaseModel):
    """QR code addon configuration"""
    enabled: bool = False
    dataSource: Literal['element', 'custom', 'column', 'url', 'vcard', 'wifi', 'email'] = 'element'
    sourceElementId: Optional[str] = None
    customData: Optional[str] = None
    columnName: Optional[str] = None
    structuredData: Optional[StructuredQRData] = None
    size: int = 100
    errorCorrection: Literal['L', 'M', 'Q', 'H'] = 'M'
    position: Dict[str, float] = {'x': 0, 'y': 0}


class BarcodeAddon(BaseModel):
    """Barcode addon configuration"""
    enabled: bool = False
    type: Literal['code128', 'ean13', 'ean8', 'upca', 'code39'] = 'code128'
    dataSource: Literal['element', 'custom', 'column'] = 'element'
    sourceElementId: Optional[str] = None
    customData: Optional[str] = None
    columnName: Optional[str] = None
    showText: bool = True
    height: int = 50
    position: Dict[str, float] = {'x': 0, 'y': 0}


class ImageAddon(BaseModel):
    """Image addon configuration"""
    enabled: bool = False
    imageId: str
    imageUrl: str
    size: Dict[str, float]
    position: Dict[str, float]
    opacity: float = Field(1.0, ge=0, le=1)
    repeatPerTicket: bool = False


class Addons(BaseModel):
    """All addon configurations"""
    qrCode: Optional[QRCodeAddon] = None
    barcode: Optional[BarcodeAddon] = None
    image: Optional[ImageAddon] = None


class NumberingElement(BaseModel):
    """Complete numbering element"""
    id: str
    side: Literal['front', 'back']
    position: Dict[str, float]  # {x, y}
    size: Dict[str, float]  # {width, height}
    rotation: int = 0
    zIndex: int = 0
    subElements: List[SubElement]
    separator: SeparatorConfig = SeparatorConfig()
    layout: LayoutConfig = LayoutConfig()
    containerStyle: ContainerStyle = ContainerStyle()
    addons: Optional[Addons] = None


class NumberingConfigRequest(BaseModel):
    """Request to save numbering configuration"""
    projectId: str
    side: Literal['front', 'back']
    elements: List[NumberingElement]


class GenerateQRRequest(BaseModel):
    """Request to generate QR code preview"""
    data: str
    size: int = 100
    errorCorrection: Literal['L', 'M', 'Q', 'H'] = 'M'


class GenerateBarcodeRequest(BaseModel):
    """Request to generate barcode preview"""
    data: str
    type: Literal['code128', 'ean13', 'ean8', 'upca', 'code39'] = 'code128'
    height: int = 50
    showText: bool = True


class ImportDataRequest(BaseModel):
    """Request to import CSV/XLSX data"""
    file: str  # base64 encoded
    filename: str
    projectId: str
    userId: Optional[str] = None


class ImportDataResponse(BaseModel):
    """Response after importing data"""
    importId: str
    columns: List[str]
    rowCount: int
    preview: List[Dict[str, Any]]  # First 10 rows
    expiresAt: str  # ISO datetime