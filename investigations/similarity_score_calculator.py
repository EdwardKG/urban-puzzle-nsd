"""
Brownfield Similarity Score Calculator

This module calculates similarity scores between a Bratislava brownfield and 
international brownfield redevelopment projects based on multiple factors:
- Area size (normalized log scale)
- Current use/function compatibility
- Ownership type
- Heritage status
- Environmental burden/pollution
- Density metrics (if available)

Returns similarity scores from 0 to 1 for each international brownfield.

QUICK START:
------------
from similarity_score_calculator import BrownfieldSimilarityCalculator

# Initialize
calculator = BrownfieldSimilarityCalculator(
    'path/to/bratislava_brownfields.csv',
    'path/to/brownfields_international.csv'
)

# Calculate similarity for a Bratislava brownfield (e.g., 'bf_0', 'bf_1', etc.)
results = calculator.calculate_similarity('bf_0')

# Get simplified JSON output
json_output = calculator.calculate_similarity_json('bf_0', include_components=False)
print(json_output)

# Use custom weights
custom_weights = {
    'area': 0.35,       # Emphasize area more
    'function': 0.35,   # Emphasize function more
    'ownership': 0.10,
    'heritage': 0.05,
    'pollution': 0.05,
    'density': 0.10
}
results = calculator.calculate_similarity('bf_0', weights=custom_weights)
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path


class BrownfieldSimilarityCalculator:
    """Calculate similarity scores between brownfields."""
    
    def __init__(self, bratislava_csv_path, international_csv_path):
        """
        Initialize the calculator with data paths.
        
        Args:
            bratislava_csv_path: Path to brownfields_all.csv
            international_csv_path: Path to brownfields_international.csv
        """
        self.bratislava_df = pd.read_csv(bratislava_csv_path)
        self.international_df = pd.read_csv(international_csv_path)
        
        # Parse JSON properties
        self._parse_properties()
        
    def _parse_properties(self):
        """Parse JSON properties column for both datasets."""
        for df in [self.bratislava_df, self.international_df]:
            if 'properties_for_similarity_calc' in df.columns:
                df['properties'] = df['properties_for_similarity_calc'].apply(
                    lambda x: json.loads(x) if pd.notna(x) else {}
                )
    
    def _get_function_similarity(self, func1, func2):
        """
        Calculate similarity between two land use functions.
        
        Args:
            func1, func2: Function strings (e.g., 'mixed_use', 'commercial', 'residential')
            
        Returns:
            float: Similarity score 0-1
        """
        # Define function compatibility matrix
        function_compatibility = {
            'mixed_use': {'mixed_use': 1.0, 'commercial': 0.7, 'residential': 0.7, 
                         'industrial': 0.4, 'retail': 0.6, '': 0.3},
            'commercial': {'commercial': 1.0, 'mixed_use': 0.7, 'retail': 0.8, 
                          'residential': 0.5, 'industrial': 0.4, '': 0.3},
            'residential': {'residential': 1.0, 'mixed_use': 0.7, 'commercial': 0.5, 
                           'retail': 0.4, 'industrial': 0.2, '': 0.3},
            'industrial': {'industrial': 1.0, 'commercial': 0.4, 'mixed_use': 0.4, 
                          'residential': 0.2, 'retail': 0.3, '': 0.3},
            'retail': {'retail': 1.0, 'commercial': 0.8, 'mixed_use': 0.6, 
                      'residential': 0.4, 'industrial': 0.3, '': 0.3},
            '': {'': 1.0, 'mixed_use': 0.3, 'commercial': 0.3, 
                'residential': 0.3, 'industrial': 0.3, 'retail': 0.3}
        }
        
        func1 = str(func1).lower() if pd.notna(func1) else ''
        func2 = str(func2).lower() if pd.notna(func2) else ''
        
        if func1 in function_compatibility and func2 in function_compatibility[func1]:
            return function_compatibility[func1][func2]
        elif func2 in function_compatibility and func1 in function_compatibility[func2]:
            return function_compatibility[func2][func1]
        else:
            return 0.5  # Default moderate similarity for unknown functions
    
    def _get_area_similarity(self, area1, area2):
        """
        Calculate area similarity using normalized log scale.
        Areas within same order of magnitude score higher.
        
        Args:
            area1, area2: Areas in square meters
            
        Returns:
            float: Similarity score 0-1
        """
        if pd.isna(area1) or pd.isna(area2) or area1 <= 0 or area2 <= 0:
            return 0.5  # Unknown areas get neutral score
        
        # Use log scale to compare orders of magnitude
        log_ratio = abs(np.log10(area1) - np.log10(area2))
        
        # Convert to similarity score (0 log difference = 1.0, higher differences decay)
        # Within same order of magnitude (log_ratio < 1) = high similarity
        # One order of magnitude difference = 0.5 similarity
        # Two orders = 0.25, etc.
        similarity = np.exp(-log_ratio)
        
        return similarity
    
    def _get_ownership_similarity(self, own1, own2):
        """
        Calculate ownership similarity.
        
        Args:
            own1, own2: Ownership types ('public', 'private', 'mixed', etc.)
            
        Returns:
            float: Similarity score 0-1
        """
        own1 = str(own1).lower() if pd.notna(own1) else ''
        own2 = str(own2).lower() if pd.notna(own2) else ''
        
        if own1 == own2:
            return 1.0
        elif '' in [own1, own2]:
            return 0.5  # Unknown ownership
        elif 'mixed' in [own1, own2]:
            return 0.7  # Mixed ownership somewhat similar to all
        else:
            return 0.3  # Public vs private are different but not completely dissimilar
    
    def _get_heritage_similarity(self, has_heritage1, has_heritage2):
        """
        Calculate heritage status similarity.
        
        Args:
            has_heritage1, has_heritage2: Boolean or 0/1 for heritage status
            
        Returns:
            float: Similarity score 0-1
        """
        # Convert to boolean
        h1 = bool(has_heritage1) if pd.notna(has_heritage1) else None
        h2 = bool(has_heritage2) if pd.notna(has_heritage2) else None
        
        if h1 is None or h2 is None:
            return 0.5  # Unknown status
        elif h1 == h2:
            return 1.0
        else:
            return 0.4  # Different heritage status
    
    def _get_pollution_similarity(self, has_pollution1, has_pollution2, burden1, burden2):
        """
        Calculate environmental burden/pollution similarity.
        
        Args:
            has_pollution1, has_pollution2: Boolean for pollution presence
            burden1, burden2: Environmental burden descriptions
            
        Returns:
            float: Similarity score 0-1
        """
        # Check boolean pollution flags
        p1 = bool(has_pollution1) if pd.notna(has_pollution1) else None
        p2 = bool(has_pollution2) if pd.notna(has_pollution2) else None
        
        # Check burden descriptions
        b1 = str(burden1).lower() if pd.notna(burden1) and burden1 != '' else None
        b2 = str(burden2).lower() if pd.notna(burden2) and burden2 != '' else None
        
        # If both have explicit pollution info
        if p1 is not None and p2 is not None:
            return 1.0 if p1 == p2 else 0.4
        
        # If both have burden descriptions
        if b1 is not None and b2 is not None:
            return 1.0  # Both have documented environmental issues
        
        # If one has documented burden and other doesn't
        if (b1 is not None and b2 is None) or (b1 is None and b2 is not None):
            return 0.5
        
        # Unknown for both
        return 0.5
    
    def _get_density_similarity(self, props1, props2):
        """
        Calculate density similarity based on available density metrics.
        
        Args:
            props1, props2: Property dictionaries with potential density values
            
        Returns:
            float: Similarity score 0-1, or None if not applicable
        """
        # Look for density metrics
        density_keys = ['residential_density_per_ha', 'employee_density_per_ha', 
                       'building_density_fsi']
        
        similarities = []
        
        for key in density_keys:
            if key in props1 and key in props2:
                d1, d2 = props1[key], props2[key]
                if d1 and d2:
                    # Use ratio-based similarity (closer to 1.0 = more similar)
                    ratio = min(d1, d2) / max(d1, d2)
                    similarities.append(ratio)
        
        if similarities:
            return np.mean(similarities)
        
        return None  # No density data available
    
    def calculate_similarity(self, bratislava_id, weights=None):
        """
        Calculate similarity scores between a Bratislava brownfield and all international ones.
        
        Args:
            bratislava_id: ID of the Bratislava brownfield (e.g., 'bf_0', 'nivy')
            weights: Optional dict of feature weights. Default uses balanced weights.
                    Keys: 'area', 'function', 'ownership', 'heritage', 'pollution', 'density'
        
        Returns:
            list: List of dicts with 'id' and 'similarity_score' (0-1)
        """
        # Default weights (must sum to 1.0)
        if weights is None:
            weights = {
                'area': 0.25,
                'function': 0.30,
                'ownership': 0.15,
                'heritage': 0.10,
                'pollution': 0.10,
                'density': 0.10
            }
        
        # Get the target brownfield
        target = self.bratislava_df[self.bratislava_df['id'] == bratislava_id]
        
        if target.empty:
            raise ValueError(f"Bratislava brownfield with id '{bratislava_id}' not found")
        
        target = target.iloc[0]
        target_props = target.get('properties', {})
        
        results = []
        
        for _, intl_bf in self.international_df.iterrows():
            intl_props = intl_bf.get('properties', {})
            
            # Calculate individual similarity scores
            scores = {}
            
            # Area similarity
            scores['area'] = self._get_area_similarity(
                target.get('area_m2', target_props.get('area')),
                intl_bf.get('area_m2', intl_props.get('area'))
            )
            
            # Function similarity
            target_func = target_props.get('function') or target.get('current_use', '')
            intl_func = intl_props.get('function') or intl_bf.get('current_use', '')
            scores['function'] = self._get_function_similarity(target_func, intl_func)
            
            # Ownership similarity
            scores['ownership'] = self._get_ownership_similarity(
                target_props.get('ownership') or target.get('ownership'),
                intl_props.get('ownership') or intl_bf.get('ownership')
            )
            
            # Heritage similarity
            scores['heritage'] = self._get_heritage_similarity(
                target_props.get('has_heritage'),
                intl_props.get('has_heritage')
            )
            
            # Pollution/environmental burden similarity
            scores['pollution'] = self._get_pollution_similarity(
                target_props.get('has_pollution'),
                intl_props.get('has_pollution'),
                target.get('environmental_burden'),
                intl_bf.get('environmental_burden')
            )
            
            # Density similarity (if available)
            density_sim = self._get_density_similarity(target_props, intl_props)
            if density_sim is not None:
                scores['density'] = density_sim
            else:
                # No density data, redistribute weight to other factors
                scores['density'] = 0.5  # Neutral score
            
            # Calculate weighted total similarity
            total_similarity = sum(scores[key] * weights[key] for key in weights.keys())
            
            results.append({
                'id': intl_bf['id'],
                'similarity_score': round(total_similarity, 3),
                'component_scores': {k: round(v, 3) for k, v in scores.items()}
            })
        
        # Sort by similarity score (highest first)
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return results
    
    def calculate_similarity_json(self, bratislava_id, weights=None, include_components=False):
        """
        Calculate similarity and return as JSON string.
        
        Args:
            bratislava_id: ID of the Bratislava brownfield
            weights: Optional custom weights
            include_components: If True, include component scores breakdown
            
        Returns:
            str: JSON string with similarity results
        """
        results = self.calculate_similarity(bratislava_id, weights)
        
        if not include_components:
            # Simplify output - only id and score
            results = [{'id': r['id'], 'similarity_score': r['similarity_score']} 
                      for r in results]
        
        return json.dumps(results, indent=2)


def main():
    """Example usage of the similarity calculator."""
    
    # Set up paths
    base_path = Path(__file__).parent.parent / 'python-service' / 'data'
    bratislava_csv = base_path / 'bratislava_brownfields.csv'
    international_csv = base_path / 'brownfields_international.csv'
    
    # Initialize calculator
    calculator = BrownfieldSimilarityCalculator(bratislava_csv, international_csv)
    
    # Example: Calculate similarity for 'bf_0' brownfield
    print("Calculating similarity for 'bf_0' brownfield...")
    print("=" * 60)
    
    results = calculator.calculate_similarity('bf_0')
    
    print(json.dumps(results, indent=2))
    
    print("\n" + "=" * 60)
    print("\nSimplified JSON output:")
    print(calculator.calculate_similarity_json('bf_0', include_components=False))
    
    # Example with custom weights (emphasize area and function more)
    print("\n" + "=" * 60)
    print("\nWith custom weights (area: 0.35, function: 0.35):")
    custom_weights = {
        'area': 0.35,
        'function': 0.35,
        'ownership': 0.10,
        'heritage': 0.05,
        'pollution': 0.05,
        'density': 0.10
    }
    results_custom = calculator.calculate_similarity('bf_0', weights=custom_weights)
    print(json.dumps(results_custom, indent=2))


if __name__ == '__main__':
    main()
