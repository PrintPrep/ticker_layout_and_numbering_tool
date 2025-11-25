# ============================================================================
# FILE: backend/app/services/numbering_generator.py
# ============================================================================

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class NumberingGenerator:
    """Generate numbering sequences for tickets"""
    
    def __init__(self, numbering_config: Dict[str, Any]):
        self.config = numbering_config
    
    def generate_for_ticket(self, ticket_number: int, row_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate numbering string for a specific ticket
        
        Args:
            ticket_number: Ticket index (1-based)
            row_data: Optional data from CSV/XLSX import
        
        Returns:
            Generated numbering string
        """
        elements = self.config.get('elements', [])
        parts = []
        
        for element in sorted(elements, key=lambda x: x.get('order', 0)):
            element_parts = []
            
            for sub_element in sorted(element.get('subElements', []), key=lambda x: x.get('order', 0)):
                sub_type = sub_element.get('type')
                config = sub_element.get('config', {})
                
                if sub_type == 'text':
                    # Static text
                    text = config.get('text', '')
                    element_parts.append(text)
                
                elif sub_type == 'numeric':
                    # Dynamic numeric value
                    value = self._generate_numeric(config, ticket_number)
                    element_parts.append(value)
                
                # Check if column mapping exists (CSV/XLSX import)
                column_name = sub_element.get('columnMapping')
                if column_name and row_data:
                    # Override with data from import
                    element_parts[-1] = str(row_data.get(column_name, element_parts[-1]))
            
            # Join sub-elements with separator
            separator_config = element.get('separator', {})
            separator = self._get_separator(separator_config)
            element_text = separator.join(element_parts)
            
            parts.append(element_text)
        
        return ''.join(parts)
    
    def _generate_numeric(self, config: Dict[str, Any], ticket_number: int) -> str:
        """Generate numeric value based on configuration"""
        numeric_type = config.get('numericType', '123')
        start_value = config.get('startValue', 1)
        step = config.get('step', 1)
        flow = config.get('flow', 'increment')
        
        # Calculate value
        if flow == 'increment':
            value = start_value + (ticket_number - 1) * step
        else:  # decrement
            value = start_value - (ticket_number - 1) * step
        
        # Format value
        if numeric_type == '123':
            digits = config.get('fixedDigitCount', 3) if config.get('digits') == 'fixed' else len(str(value))
            return str(value).zfill(digits)
        
        elif numeric_type == 'roman_lower':
            return self._to_roman(value).lower()
        
        elif numeric_type == 'roman_upper':
            return self._to_roman(value)
        
        elif numeric_type == 'abc_lower':
            return chr(96 + value) if value <= 26 else f"z{value - 26}"
        
        elif numeric_type == 'abc_upper':
            return chr(64 + value) if value <= 26 else f"Z{value - 26}"
        
        elif numeric_type == 'hex':
            return hex(value)[2:].upper()
        
        return str(value)
    
    def _to_roman(self, num: int) -> str:
        """Convert integer to Roman numeral"""
        val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
        syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        roman_num = ''
        i = 0
        while num > 0:
            for _ in range(num // val[i]):
                roman_num += syms[i]
                num -= val[i]
            i += 1
        return roman_num
    
    def _get_separator(self, separator_config: Dict[str, Any]) -> str:
        """Get separator character"""
        sep_type = separator_config.get('type', 'none')
        
        separators = {
            'hyphen': '-',
            'underscore': '_',
            'dot': '.',
            'comma': ',',
            'space': ' ',
            'none': '',
            'custom': separator_config.get('customValue', '')
        }
        
        return separators.get(sep_type, '')