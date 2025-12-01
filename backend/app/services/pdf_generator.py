"""
PDF Generation Service
Uses ReportLab to create print-ready PDFs with tickets
"""
# backend/app/services/pdf_generator.py

from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
import logging
from typing import Dict, List, Any, Optional, Tuple
import base64

from app.utils.paper_dimensions import mm_to_pt
from app.utils.geometry import mirror_position_horizontal, get_back_rotation
from app.utils.qr_generator import generate_qr_code, generate_structured_qr_data, replace_template_variables
from app.utils.barcode_generator import generate_barcode

logger = logging.getLogger(__name__)


class PDFGenerator:
    """Generate print-ready PDFs with ticket layouts"""
    
    def __init__(self, quality: str = 'print', color_space: str = 'RGB'):
        """
        Initialize PDF generator
        
        Args:
            quality: 'print' (300 DPI) or 'digital' (150 DPI)
            color_space: 'RGB' or 'CMYK'
        """
        self.quality = quality
        self.dpi = 300 if quality == 'print' else 150
        self.color_space = color_space
        self.pdf_buffer = BytesIO()
        self.canvas = None
        
        # Register default fonts
        self._register_fonts()
    
    def _register_fonts(self):
        """Register fonts for use in PDF"""
        # ReportLab includes built-in fonts:
        # Helvetica, Times-Roman, Courier
        # For custom fonts, you would register TTF files here:
        # pdfmetrics.registerFont(TTFont('CustomFont', 'path/to/font.ttf'))
        pass
    
    def create_pdf(
        self,
        paper_width_mm: float,
        paper_height_mm: float,
        front_pages: List[Dict[str, Any]],
        back_pages: Optional[List[Dict[str, Any]]] = None
    ) -> bytes:
        """
        Create complete PDF with front and optionally back pages
        
        Args:
            paper_width_mm: Paper width in millimeters
            paper_height_mm: Paper height in millimeters
            front_pages: List of front page configurations
            back_pages: Optional list of back page configurations
        
        Returns:
            PDF bytes
        """
        try:
            # Convert to points
            width_pt = mm_to_pt(paper_width_mm)
            height_pt = mm_to_pt(paper_height_mm)
            
            # Create canvas
            self.canvas = canvas.Canvas(
                self.pdf_buffer,
                pagesize=(width_pt, height_pt)
            )
            
            # Generate pages (interleaved: front1, back1, front2, back2, ...)
            total_sheets = len(front_pages)
            
            for sheet_idx in range(total_sheets):
                # Front page
                self._render_page(
                    front_pages[sheet_idx],
                    paper_width_mm,
                    paper_height_mm,
                    is_back=False
                )
                self.canvas.showPage()
                
                # Back page (if double-sided)
                if back_pages and sheet_idx < len(back_pages):
                    self._render_page(
                        back_pages[sheet_idx],
                        paper_width_mm,
                        paper_height_mm,
                        is_back=True
                    )
                    self.canvas.showPage()
            
            # Save PDF
            self.canvas.save()
            
            # Get bytes
            self.pdf_buffer.seek(0)
            pdf_bytes = self.pdf_buffer.getvalue()
            
            logger.info(f"Generated PDF: {len(pdf_bytes)} bytes, {total_sheets} sheets")
            return pdf_bytes
        
        except Exception as e:
            logger.error(f"PDF generation failed: {e}", exc_info=True)
            raise
    
    def _render_page(
        self,
        page_config: Dict[str, Any],
        paper_width_mm: float,
        paper_height_mm: float,
        is_back: bool = False
    ):
        """
        Render a single page with all tickets
        
        Args:
            page_config: Configuration with placements and content
            paper_width_mm: Paper width in mm
            paper_height_mm: Paper height in mm
            is_back: True if rendering back side
        """
        placements = page_config.get('placements', [])
        design_image_url = page_config.get('designImageUrl')
        numbering_elements = page_config.get('numberingElements', [])
        
        for placement in placements:
            ticket_number = placement.get('ticketNumber', 1)
            
            # Get placement position and dimensions
            x_mm = placement['xMm']
            y_mm = placement['yMm']
            width_mm = placement['widthMm']
            height_mm = placement['heightMm']
            rotation = placement.get('rotation', 0)
            
            # Mirror position for back side
            if is_back:
                x_mm = mirror_position_horizontal(x_mm, width_mm, paper_width_mm)
                rotation = get_back_rotation(rotation)
            
            # Place design image
            if design_image_url:
                self._place_image(
                    design_image_url,
                    x_mm,
                    y_mm,
                    width_mm,
                    height_mm,
                    paper_height_mm,
                    rotation
                )
            
            # Overlay numbering elements
            for element in numbering_elements:
                element_side = element.get('side', 'front')
                if (is_back and element_side != 'back') or (not is_back and element_side != 'front'):
                    continue
                
                # Get numbering text for this ticket
                numbering_text = placement.get('numberingText', '')
                
                # Render text
                self._render_numbering_element(
                    element,
                    numbering_text,
                    x_mm,
                    y_mm,
                    paper_height_mm,
                    ticket_number
                )
    
    def _place_image(
        self,
        image_url: str,
        x_mm: float,
        y_mm: float,
        width_mm: float,
        height_mm: float,
        paper_height_mm: float,
        rotation: int = 0
    ):
        """
        Place image on canvas at specified position
        
        Args:
            image_url: URL or path to image
            x_mm: X position in mm (from left)
            y_mm: Y position in mm (from top)
            width_mm: Width in mm
            height_mm: Height in mm
            paper_height_mm: Total paper height (for coordinate conversion)
            rotation: Rotation in degrees (0, 90, 180, 270)
        """
        try:
            # Fetch image
            import httpx
            response = httpx.get(image_url, timeout=30.0)
            response.raise_for_status()
            img = ImageReader(BytesIO(response.content))
            
            # Convert to points
            x_pt = mm_to_pt(x_mm)
            y_pt_from_top = mm_to_pt(y_mm)
            w_pt = mm_to_pt(width_mm)
            h_pt = mm_to_pt(height_mm)
            
            # PDF coordinates are from bottom-left, flip Y
            paper_height_pt = mm_to_pt(paper_height_mm)
            y_pt = paper_height_pt - y_pt_from_top - h_pt
            
            if rotation == 0:
                # No rotation
                self.canvas.drawImage(
                    img,
                    x_pt,
                    y_pt,
                    width=w_pt,
                    height=h_pt,
                    preserveAspectRatio=False
                )
            
            elif rotation == 90:
                # Rotate 90° clockwise
                self.canvas.saveState()
                self.canvas.translate(x_pt + w_pt/2, y_pt + h_pt/2)
                self.canvas.rotate(90)
                self.canvas.drawImage(
                    img,
                    -h_pt/2,
                    -w_pt/2,
                    width=h_pt,
                    height=w_pt,
                    preserveAspectRatio=False
                )
                self.canvas.restoreState()
            
            elif rotation == 180:
                # Rotate 180°
                self.canvas.saveState()
                self.canvas.translate(x_pt + w_pt/2, y_pt + h_pt/2)
                self.canvas.rotate(180)
                self.canvas.drawImage(
                    img,
                    -w_pt/2,
                    -h_pt/2,
                    width=w_pt,
                    height=h_pt,
                    preserveAspectRatio=False
                )
                self.canvas.restoreState()
            
            elif rotation == 270:
                # Rotate 270° clockwise
                self.canvas.saveState()
                self.canvas.translate(x_pt + w_pt/2, y_pt + h_pt/2)
                self.canvas.rotate(270)
                self.canvas.drawImage(
                    img,
                    -h_pt/2,
                    -w_pt/2,
                    width=h_pt,
                    height=w_pt,
                    preserveAspectRatio=False
                )
                self.canvas.restoreState()
        
        except Exception as e:
            logger.error(f"Failed to place image: {e}")
            # Draw placeholder rectangle
            self.canvas.setStrokeColorRGB(0.8, 0.8, 0.8)
            self.canvas.rect(x_pt, y_pt, w_pt, h_pt)
    
    def _render_numbering_element(
        self,
        element: Dict[str, Any],
        numbering_text: str,
        base_x_mm: float,
        base_y_mm: float,
        paper_height_mm: float,
        ticket_number: int
    ):
        """
        Render numbering element with text and addons
        
        Args:
            element: Numbering element configuration
            numbering_text: Generated numbering text
            base_x_mm: Base X position of ticket
            base_y_mm: Base Y position of ticket
            paper_height_mm: Paper height for coordinate conversion
            ticket_number: Current ticket number
        """
        try:
            # Get element position relative to ticket
            pos = element.get('position', {})
            elem_x_mm = base_x_mm + pos.get('x', 0)
            elem_y_mm = base_y_mm + pos.get('y', 0)
            
            # Get container style
            container_style = element.get('containerStyle', {})
            
            # Render container background
            if container_style.get('backgroundColor') != 'transparent':
                self._render_container_background(
                    elem_x_mm,
                    elem_y_mm,
                    element.get('size', {}),
                    container_style,
                    paper_height_mm
                )
            
            # Render text
            self._render_text(
                numbering_text,
                elem_x_mm,
                elem_y_mm,
                element.get('size', {}),
                element.get('subElements', []),
                container_style,
                paper_height_mm
            )
            
            # Render addons
            addons = element.get('addons', {})
            
            # QR Code
            if addons.get('qrCode', {}).get('enabled'):
                self._render_qr_code(
                    addons['qrCode'],
                    numbering_text,
                    elem_x_mm,
                    elem_y_mm,
                    paper_height_mm,
                    ticket_number
                )
            
            # Barcode
            if addons.get('barcode', {}).get('enabled'):
                self._render_barcode(
                    addons['barcode'],
                    numbering_text,
                    elem_x_mm,
                    elem_y_mm,
                    paper_height_mm
                )
            
            # Image
            if addons.get('image', {}).get('enabled'):
                self._render_addon_image(
                    addons['image'],
                    elem_x_mm,
                    elem_y_mm,
                    paper_height_mm
                )
        
        except Exception as e:
            logger.error(f"Failed to render numbering element: {e}")
    
    def _render_container_background(
        self,
        x_mm: float,
        y_mm: float,
        size: Dict[str, float],
        style: Dict[str, Any],
        paper_height_mm: float
    ):
        """Render container background with border"""
        x_pt = mm_to_pt(x_mm)
        y_pt_from_top = mm_to_pt(y_mm)
        w_pt = mm_to_pt(size.get('width', 50))
        h_pt = mm_to_pt(size.get('height', 20))
        
        paper_height_pt = mm_to_pt(paper_height_mm)
        y_pt = paper_height_pt - y_pt_from_top - h_pt
        
        # Background color
        bg_color = style.get('backgroundColor', '#FFFFFF')
        bg_opacity = style.get('backgroundOpacity', 1.0)
        
        if bg_color != 'transparent':
            r, g, b = self._hex_to_rgb(bg_color)
            self.canvas.setFillColorRGB(r, g, b, alpha=bg_opacity)
            self.canvas.rect(x_pt, y_pt, w_pt, h_pt, fill=1, stroke=0)
        
        # Border
        border_width = style.get('borderWidth', 0)
        if border_width > 0:
            border_color = style.get('borderColor', '#000000')
            border_opacity = style.get('borderOpacity', 1.0)
            r, g, b = self._hex_to_rgb(border_color)
            self.canvas.setStrokeColorRGB(r, g, b, alpha=border_opacity)
            self.canvas.setLineWidth(border_width)
            self.canvas.rect(x_pt, y_pt, w_pt, h_pt, fill=0, stroke=1)
    
    def _render_text(
        self,
        text: str,
        x_mm: float,
        y_mm: float,
        size: Dict[str, float],
        sub_elements: List[Dict],
        style: Dict[str, Any],
        paper_height_mm: float
    ):
        """Render text on canvas"""
        # Get first sub-element for styling (simplified)
        if not sub_elements:
            return
        
        config = sub_elements[0].get('config', {})
        
        # Get font settings
        font_family = config.get('fontFamily', 'Helvetica')
        font_size = config.get('fontSize', 12)
        bold = config.get('bold', False)
        italic = config.get('italic', False)
        color = config.get('color', '#000000')
        
        # Build font name
        font_name = font_family
        if bold:
            font_name += '-Bold'
        if italic:
            font_name += '-Italic' if not bold else 'Oblique'
        
        # Fallback to built-in fonts
        if font_family not in ['Helvetica', 'Times-Roman', 'Courier']:
            font_name = 'Helvetica'
        
        # Convert position
        x_pt = mm_to_pt(x_mm)
        y_pt_from_top = mm_to_pt(y_mm)
        paper_height_pt = mm_to_pt(paper_height_mm)
        
        # Text alignment
        text_align = style.get('textAlign', 'center')
        padding = style.get('padding', 0)
        width_mm = size.get('width', 50)
        
        if text_align == 'center':
            x_pt += mm_to_pt(width_mm / 2)
        elif text_align == 'right':
            x_pt += mm_to_pt(width_mm) - mm_to_pt(padding)
        else:  # left
            x_pt += mm_to_pt(padding)
        
        # Vertical centering
        height_mm = size.get('height', 20)
        y_pt = paper_height_pt - y_pt_from_top - mm_to_pt(height_mm / 2)
        
        # Set font and color
        self.canvas.setFont(font_name, font_size)
        r, g, b = self._hex_to_rgb(color)
        self.canvas.setFillColorRGB(r, g, b)
        
        # Draw text
        if text_align == 'center':
            self.canvas.drawCentredString(x_pt, y_pt, text)
        elif text_align == 'right':
            self.canvas.drawRightString(x_pt, y_pt, text)
        else:
            self.canvas.drawString(x_pt, y_pt, text)
    
    def _render_qr_code(
        self,
        qr_config: Dict[str, Any],
        numbering_text: str,
        base_x_mm: float,
        base_y_mm: float,
        paper_height_mm: float,
        ticket_number: int
    ):
        """Render QR code"""
        try:
            # Get QR data
            data_source = qr_config.get('dataSource', 'element')
            
            if data_source == 'element':
                qr_data = numbering_text
            elif data_source == 'custom':
                qr_data = qr_config.get('customData', '')
                # Replace template variables
                qr_data = replace_template_variables(qr_data, {'ticket_number': ticket_number})
            elif qr_config.get('structuredData'):
                qr_data = generate_structured_qr_data(qr_config['structuredData'])
            else:
                qr_data = numbering_text
            
            # Generate QR code
            qr_image_data = generate_qr_code(
                qr_data,
                size=qr_config.get('size', 100),
                error_correction=qr_config.get('errorCorrection', 'M')
            )
            
            # Parse base64 image
            qr_bytes = base64.b64decode(qr_image_data.split(',')[1])
            qr_img = ImageReader(BytesIO(qr_bytes))
            
            # Get position
            pos = qr_config.get('position', {})
            qr_x_mm = base_x_mm + pos.get('x', 0)
            qr_y_mm = base_y_mm + pos.get('y', 0)
            qr_size_mm = qr_config.get('size', 100) / 3.78  # px to mm approximation
            
            # Convert to points
            x_pt = mm_to_pt(qr_x_mm)
            y_pt_from_top = mm_to_pt(qr_y_mm)
            size_pt = mm_to_pt(qr_size_mm)
            
            paper_height_pt = mm_to_pt(paper_height_mm)
            y_pt = paper_height_pt - y_pt_from_top - size_pt
            
            # Draw QR code
            self.canvas.drawImage(qr_img, x_pt, y_pt, width=size_pt, height=size_pt)
        
        except Exception as e:
            logger.error(f"Failed to render QR code: {e}")
    
    def _render_barcode(
        self,
        barcode_config: Dict[str, Any],
        numbering_text: str,
        base_x_mm: float,
        base_y_mm: float,
        paper_height_mm: float
    ):
        """Render barcode"""
        try:
            # Get barcode data
            data_source = barcode_config.get('dataSource', 'element')
            
            if data_source == 'element':
                barcode_data = numbering_text
            elif data_source == 'custom':
                barcode_data = barcode_config.get('customData', '')
            else:
                barcode_data = numbering_text
            
            # Generate barcode
            barcode_image_data = generate_barcode(
                barcode_data,
                barcode_type=barcode_config.get('type', 'code128'),
                height=barcode_config.get('height', 50),
                show_text=barcode_config.get('showText', True)
            )
            
            if not barcode_image_data:
                return
            
            # Parse base64 image
            barcode_bytes = base64.b64decode(barcode_image_data.split(',')[1])
            barcode_img = ImageReader(BytesIO(barcode_bytes))
            
            # Get position
            pos = barcode_config.get('position', {})
            bc_x_mm = base_x_mm + pos.get('x', 0)
            bc_y_mm = base_y_mm + pos.get('y', 0)
            bc_height_mm = barcode_config.get('height', 50) / 3.78
            bc_width_mm = 80  # Approximate width
            
            # Convert to points
            x_pt = mm_to_pt(bc_x_mm)
            y_pt_from_top = mm_to_pt(bc_y_mm)
            w_pt = mm_to_pt(bc_width_mm)
            h_pt = mm_to_pt(bc_height_mm)
            
            paper_height_pt = mm_to_pt(paper_height_mm)
            y_pt = paper_height_pt - y_pt_from_top - h_pt
            
            # Draw barcode
            self.canvas.drawImage(barcode_img, x_pt, y_pt, width=w_pt, height=h_pt)
        
        except Exception as e:
            logger.error(f"Failed to render barcode: {e}")
    
    def _render_addon_image(
        self,
        image_config: Dict[str, Any],
        base_x_mm: float,
        base_y_mm: float,
        paper_height_mm: float
    ):
        """Render addon image"""
        try:
            image_url = image_config.get('imageUrl')
            if not image_url:
                return
            
            # Fetch image
            import httpx
            response = httpx.get(image_url, timeout=30.0)
            response.raise_for_status()
            img = ImageReader(BytesIO(response.content))
            
            # Get position and size
            pos = image_config.get('position', {})
            size = image_config.get('size', {})
            
            img_x_mm = base_x_mm + pos.get('x', 0)
            img_y_mm = base_y_mm + pos.get('y', 0)
            img_width_mm = size.get('width', 20)
            img_height_mm = size.get('height', 20)
            
            # Convert to points
            x_pt = mm_to_pt(img_x_mm)
            y_pt_from_top = mm_to_pt(img_y_mm)
            w_pt = mm_to_pt(img_width_mm)
            h_pt = mm_to_pt(img_height_mm)
            
            paper_height_pt = mm_to_pt(paper_height_mm)
            y_pt = paper_height_pt - y_pt_from_top - h_pt
            
            # Draw image
            self.canvas.drawImage(img, x_pt, y_pt, width=w_pt, height=h_pt)
        
        except Exception as e:
            logger.error(f"Failed to render addon image: {e}")
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[float, float, float]:
        """Convert hex color to RGB tuple (0-1 range)"""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        return r, g, b