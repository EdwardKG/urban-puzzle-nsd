import numpy as np
import pandas as pd
from typing import Dict, Any, List

class DataProcessingService:
    """Service for data processing operations"""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process data based on specified operation
        
        Args:
            input_data: Dictionary containing values and operation
            
        Returns:
            Processed data results
        """
        try:
            values = input_data.get('values', [])
            operation = input_data.get('operation', 'sum')
            
            if not values:
                raise ValueError("Values cannot be empty")
            
            arr = np.array(values)
            
            operations = {
                'sum': lambda x: float(np.sum(x)),
                'mean': lambda x: float(np.mean(x)),
                'product': lambda x: float(np.prod(x)),
                'normalize': lambda x: ((x - np.min(x)) / (np.max(x) - np.min(x))).tolist(),
                'standardize': lambda x: ((x - np.mean(x)) / np.std(x)).tolist(),
                'cumsum': lambda x: np.cumsum(x).tolist(),
                'diff': lambda x: np.diff(x).tolist(),
            }
            
            if operation not in operations:
                raise ValueError(f"Unsupported operation: {operation}")
            
            result = operations[operation](arr)
            
            return {
                'operation': operation,
                'input_length': len(values),
                'result': result
            }
            
        except Exception as e:
            raise Exception(f"Processing failed: {str(e)}")
    
    def transform_data(self, data: List[float], transformation: str) -> List[float]:
        """
        Apply transformation to data
        
        Args:
            data: List of numerical values
            transformation: Type of transformation (log, sqrt, square, etc.)
            
        Returns:
            Transformed data
        """
        try:
            arr = np.array(data)
            
            transformations = {
                'log': lambda x: np.log(x + 1),  # log(x+1) to handle zeros
                'log10': lambda x: np.log10(x + 1),
                'sqrt': lambda x: np.sqrt(np.abs(x)),
                'square': lambda x: x ** 2,
                'cube': lambda x: x ** 3,
                'reciprocal': lambda x: 1 / (x + 1e-10),  # avoid division by zero
            }
            
            if transformation not in transformations:
                raise ValueError(f"Unsupported transformation: {transformation}")
            
            transformed = transformations[transformation](arr)
            
            return transformed.tolist()
            
        except Exception as e:
            raise Exception(f"Transformation failed: {str(e)}")
    
    def clean_data(self, data: List[float], strategy: str = 'mean') -> Dict[str, Any]:
        """
        Clean data by handling missing values and outliers
        
        Args:
            data: List of numerical values (may contain None or NaN)
            strategy: Strategy for handling missing values
            
        Returns:
            Cleaned data with statistics
        """
        try:
            arr = np.array(data, dtype=float)
            
            # Count missing values
            missing_count = np.isnan(arr).sum()
            
            # Handle missing values
            if strategy == 'mean':
                fill_value = np.nanmean(arr)
            elif strategy == 'median':
                fill_value = np.nanmedian(arr)
            elif strategy == 'zero':
                fill_value = 0
            else:
                fill_value = np.nanmean(arr)
            
            arr[np.isnan(arr)] = fill_value
            
            # Remove outliers using IQR method
            q1 = np.percentile(arr, 25)
            q3 = np.percentile(arr, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers_count = np.sum((arr < lower_bound) | (arr > upper_bound))
            
            return {
                'cleaned_data': arr.tolist(),
                'original_length': len(data),
                'missing_values': int(missing_count),
                'outliers_detected': int(outliers_count),
                'strategy_used': strategy
            }
            
        except Exception as e:
            raise Exception(f"Data cleaning failed: {str(e)}")
