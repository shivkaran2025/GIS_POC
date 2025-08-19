#!/usr/bin/env python3
"""
Comprehensive test script for the GeoJSON & Site Location API
Tests all endpoints including ZIP codes, Market regions, CDC neighborhoods, and Site locations
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(url, description):
    """Test an endpoint and print results"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=30)
        end_time = time.time()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            
            if isinstance(data, dict):
                if 'count' in data:
                    print(f"Count: {data['count']}")
                if 'dataset' in data:
                    print(f"Dataset: {data['dataset']}")
                if 'features' in data:
                    print(f"Features: {len(data['features'])}")
                if 'sites' in data:
                    print(f"Sites: {len(data['sites'])}")
                if 'results' in data:
                    print(f"Results: {len(data['results'])}")
                
                # Print first item for inspection
                if 'features' in data and data['features']:
                    print(f"\nFirst Feature Properties: {list(data['features'][0].get('properties', {}).keys())}")
                elif 'sites' in data and data['sites']:
                    print(f"\nFirst Site: {data['sites'][0]}")
                elif 'results' in data and data['results']:
                    print(f"\nFirst Result Dataset: {data['results'][0].get('dataset')}")
                elif 'type' in data and data['type'] == 'Feature':
                    print("Single feature returned")
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")

def main():
    print("Comprehensive GeoJSON & Site Location API Test")
    print("=" * 60)
    
    # Test API information
    test_endpoint(f"{BASE_URL}/", "API Information")
    
    # Test ZIP codes endpoints
    test_endpoint(f"{BASE_URL}/api/zip-codes", "All ZIP Codes")
    test_endpoint(f"{BASE_URL}/api/zip-codes/id/493", "ZIP Code by OBJECTID")
    test_endpoint(f"{BASE_URL}/api/zip-codes/zipcode/20375", "ZIP Code by Number")
    
    # Test Market Regions endpoints (renamed from TMO regions)
    test_endpoint(f"{BASE_URL}/api/market-regions", "All Market Regions")
    test_endpoint(f"{BASE_URL}/api/market-regions/id/ALASKA", "Market Region by ID (Alaska)")
    test_endpoint(f"{BASE_URL}/api/market-regions/property/Region/WEST", "Market Regions by Region")
    
    # Test CDC Neighborhoods endpoints
    test_endpoint(f"{BASE_URL}/api/cdc-neighborhoods", "All CDC Neighborhoods")
    test_endpoint(f"{BASE_URL}/api/cdc-neighborhoods/id/1", "CDC Neighborhood by ID")
    
    # Test Site Locations endpoints (new)
    test_endpoint(f"{BASE_URL}/api/site-locations", "All Site Locations")
    test_endpoint(f"{BASE_URL}/api/site-locations/site/CTNH515A", "Site by ID")
    test_endpoint(f"{BASE_URL}/api/site-locations/coordinates?lat=40.037362&lng=-75.214826&radius=0.1", "Sites by Coordinates")
    
    # Test Search functionality
    test_endpoint(f"{BASE_URL}/api/search?q=20375&dataset=zip_codes", "Search ZIP Codes")
    test_endpoint(f"{BASE_URL}/api/search?q=CTNH515A&dataset=site_locations", "Search Site Locations")
    test_endpoint(f"{BASE_URL}/api/search?q=Washington", "Cross-dataset Search")
    
    print(f"\n{'='*60}")
    print("Testing Complete!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
