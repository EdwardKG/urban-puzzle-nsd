import numpy as np
from typing import List, Any

def validate_numerical_data(data: List[Any]) -> bool:
    """Validate if data contains only numerical values"""
    try:
        np.array(data, dtype=float)
        return True
    except (ValueError, TypeError):
        return False

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safely divide two numbers, returning default if denominator is zero"""
    try:
        if denominator == 0:
            return default
        return numerator / denominator
    except (ZeroDivisionError, TypeError):
        return default

def format_number(value: float, decimals: int = 2) -> float:
    """Format number to specified decimal places"""
    return round(value, decimals)
