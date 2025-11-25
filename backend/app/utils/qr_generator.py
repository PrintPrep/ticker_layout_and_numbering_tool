"""
QR code generation utilities
"""

import qrcode
from io import BytesIO
import base64
from typing import Optional, Dict, Any


def generate_qr_code(
    data: str,
    size: int = 100,
    error_correction: str = 'M'
) -> str:
    """
    Generate QR code and return as base64 data URL
    
    Args:
        data: Data to encode
        size: Size in pixels
        error_correction: L, M, Q, or H
    
    Returns:
        Base64 data URL string
    """
    error_levels = {
        'L': qrcode.constants.ERROR_CORRECT_L,
        'M': qrcode.constants.ERROR_CORRECT_M,
        'Q': qrcode.constants.ERROR_CORRECT_Q,
        'H': qrcode.constants.ERROR_CORRECT_H
    }
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
        box_size=10,
        border=4,
    )
    
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img = img.resize((size, size))
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"


def generate_structured_qr_data(structured_config: Dict[str, Any]) -> str:
    """
    Generate structured QR data (vCard, WiFi, etc.)
    
    Args:
        structured_config: Configuration with type and data
    
    Returns:
        Formatted string for QR encoding
    """
    data_type = structured_config.get('type')
    
    if data_type == 'vcard':
        vcard = structured_config.get('vcard', {})
        first_name = vcard.get('firstName', '')
        last_name = vcard.get('lastName', '')
        email = vcard.get('email', '')
        phone = vcard.get('phone', '')
        org = vcard.get('organization', '')
        
        return f"""BEGIN:VCARD
VERSION:3.0
FN:{first_name} {last_name}
EMAIL:{email}
TEL:{phone}
ORG:{org}
END:VCARD"""
    
    elif data_type == 'wifi':
        wifi = structured_config.get('wifi', {})
        ssid = wifi.get('ssid', '')
        password = wifi.get('password', '')
        encryption = wifi.get('encryption', 'WPA')
        return f"WIFI:S:{ssid};T:{encryption};P:{password};;"
    
    elif data_type == 'email':
        email = structured_config.get('email', {})
        to = email.get('to', '')
        subject = email.get('subject', '')
        body = email.get('body', '')
        return f"mailto:{to}?subject={subject}&body={body}"
    
    elif data_type == 'sms':
        sms = structured_config.get('sms', {})
        number = sms.get('number', '')
        message = sms.get('message', '')
        return f"SMSTO:{number}:{message}"
    
    elif data_type == 'tel':
        tel = structured_config.get('tel', {})
        number = tel.get('number', '')
        return f"tel:{number}"
    
    elif data_type == 'geo':
        geo = structured_config.get('geo', {})
        lat = geo.get('latitude', 0)
        lon = geo.get('longitude', 0)
        return f"geo:{lat},{lon}"
    
    elif data_type == 'url':
        return structured_config.get('url', '')
    
    return ''


def replace_template_variables(template: str, data: Dict[str, Any]) -> str:
    """
    Replace template variables like {{ticket_number}} with actual values
    
    Args:
        template: String with {{variable}} placeholders
        data: Dictionary with variable values
    
    Returns:
        String with variables replaced
    """
    result = template
    for key, value in data.items():
        placeholder = f"{{{{{key}}}}}"
        result = result.replace(placeholder, str(value))
    return result