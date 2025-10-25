#!/usr/bin/env python3
"""
Script to convert brownfield CSV data into JSON format
with FAR (Floor Area Ratio) development scenario calculations
"""
import csv
import json
import sys
from pathlib import Path

# Constants for calculations
RESIDENTIAL_AREA_PER_PERSON = 35  # m² per person
COMMERCIAL_AREA_PER_WORKPLACE = 15  # m² per workplace

def read_csv(file_path):
    """Read CSV file and return list of dictionaries"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def calculate_development_scenario(area_m2, commercial_pct, residential_pct, far):
    """
    Calculate population change, workplace change, and GFA change for a development scenario
    
    Args:
        area_m2: Site area in square meters
        commercial_pct: Percentage of commercial development (0-100)
        residential_pct: Percentage of residential development (0-100)
        far: Floor Area Ratio
    
    Returns:
        Dictionary with population_change, workplace_change, gfa_change
    """
    # Calculate total GFA (Gross Floor Area)
    total_gfa = area_m2 * far
    
    # Calculate commercial and residential GFA
    commercial_gfa = total_gfa * (commercial_pct / 100)
    residential_gfa = total_gfa * (residential_pct / 100)
    
    # Calculate workplaces and population
    workplaces = commercial_gfa / COMMERCIAL_AREA_PER_WORKPLACE if commercial_gfa > 0 else 0
    population = residential_gfa / RESIDENTIAL_AREA_PER_PERSON if residential_gfa > 0 else 0
    
    return {
        "population_change": round(population, 2),
        "workplace_change": round(workplaces, 2),
        "gfa_change": round(total_gfa, 2)
    }

def generate_development_scenarios(area_m2):
    """
    Generate all development scenarios for a brownfield site
    
    Scenarios include different FAR values (1, 1.5, 2, 3) and
    commercial/residential mixes (30/70 and 70/30)
    """
    scenarios = {}
    
    # Define FAR values to test
    far_values = [1, 1.5, 2, 3]
    
    # Define commercial/residential mixes
    mixes = [
        {"commercial": 30, "residential": 70, "label": "30c_70r"},
        {"commercial": 70, "residential": 30, "label": "70c_30r"}
    ]
    
    # Generate scenarios for each combination
    for far in far_values:
        for mix in mixes:
            scenario_key = f"{mix['label']}_far_{str(far).replace('.', '_')}"
            scenarios[scenario_key] = calculate_development_scenario(
                area_m2,
                mix['commercial'],
                mix['residential'],
                far
            )
    
    return scenarios

def process_brownfields(brownfields_csv, relationships_csv, businesses_csv):
    """Process all CSV files and create JSON structure"""
    
    # Read all CSV files
    print(f"Reading {brownfields_csv}...")
    brownfields = read_csv(brownfields_csv)
    print(f"Found {len(brownfields)} brownfields")
    
    print(f"Reading {relationships_csv}...")
    relationships = read_csv(relationships_csv)
    print(f"Found {len(relationships)} relationships")
    
    print(f"Reading {businesses_csv}...")
    businesses = read_csv(businesses_csv)
    print(f"Found {len(businesses)} businesses")
    
    # Create a mapping of osm_id to business data
    business_map = {b['osm_id']: b for b in businesses}
    
    # Create result structure
    result = []
    
    for bf in brownfields:
        # Extract brownfield data
        area_m2 = float(bf.get('area_m2', 0)) if bf.get('area_m2') else 0
        
        brownfield_data = {
            "id": bf.get('id', ''),
            "area": area_m2,
            "shape": bf.get('geometry_wkt', ''),
            "name": bf.get('name', ''),
            "category": bf.get('fclass', ''),
            "status": bf.get('current_use', ''),
            "development_scenarios": generate_development_scenarios(area_m2)
        }
        
        result.append(brownfield_data)
    
    return result

def main():
    # Define file paths
    data_dir = Path(__file__).parent / 'python-service' / 'data'
    
    brownfields_file = data_dir / 'bratislava_brownfields.csv'
    relationships_file = data_dir / 'bf_small_businesses_relationships.csv'
    businesses_file = data_dir / 'small_businesses_all.csv'
    
    # Check if files exist
    for file in [brownfields_file, relationships_file, businesses_file]:
        if not file.exists():
            print(f"Error: File not found: {file}")
            sys.exit(1)
    
    # Process the data
    json_data = process_brownfields(
        brownfields_file,
        relationships_file,
        businesses_file
    )
    
    # Save to JSON file
    output_file = Path(__file__).parent / 'brownfields_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSuccessfully created {output_file}")
    print(f"Total brownfields: {len(json_data)}")
    
    # Print first item as example
    if json_data:
        print("\nExample brownfield entry:")
        print(json.dumps(json_data[0], indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
