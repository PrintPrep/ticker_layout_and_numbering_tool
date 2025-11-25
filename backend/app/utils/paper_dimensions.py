"""
Paper size constants in millimeters
ISO A-series, B-series, and US paper formats
"""

PAPER_SIZES = {
    # ISO A-series
    'A0': {'w': 841, 'h': 1189},
    'A1': {'w': 594, 'h': 841},
    'A2': {'w': 420, 'h': 594},
    'A3': {'w': 297, 'h': 420},
    'A4': {'w': 210, 'h': 297},
    'A5': {'w': 148, 'h': 210},
    'A6': {'w': 105, 'h': 148},
    'A7': {'w': 74, 'h': 105},
    'A8': {'w': 52, 'h': 74},
    'A9': {'w': 37, 'h': 52},
    'A10': {'w': 26, 'h': 37},
    
    # ISO B-series
    'B0': {'w': 1000, 'h': 1414},
    'B1': {'w': 707, 'h': 1000},
    'B2': {'w': 500, 'h': 707},
    'B3': {'w': 353, 'h': 500},
    'B4': {'w': 250, 'h': 353},
    'B5': {'w': 176, 'h': 250},
    'B6': {'w': 125, 'h': 176},
    'B7': {'w': 88, 'h': 125},
    'B8': {'w': 62, 'h': 88},
    'B9': {'w': 44, 'h': 62},
    'B10': {'w': 31, 'h': 44},
    
    # US common formats
    'Letter': {'w': 216, 'h': 279},
    'Legal': {'w': 216, 'h': 356},
    'Tabloid': {'w': 279, 'h': 432},
    'Executive': {'w': 184, 'h': 267},
}


def get_paper_size(size_name: str) -> dict:
    """Get paper dimensions by name"""
    return PAPER_SIZES.get(size_name, PAPER_SIZES['A4'])


def mm_to_pt(mm: float) -> float:
    """Convert millimeters to points (1 pt = 1/72 inch, 1 inch = 25.4 mm)"""
    return (mm * 72) / 25.4


def pt_to_mm(pt: float) -> float:
    """Convert points to millimeters"""
    return (pt * 25.4) / 72