from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import csv
from typing import Dict, List, Optional, Any
import logging
import time
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'], supports_credentials=True)

# File paths
GEOJSON_FILES = {
    'zip_codes': 'Zip_Codes.geojson',
    'market_regions': 'tmo_region_market.json',  # Renamed from tmo_regions
    'cdc_neighborhoods': 'CDC_V3_NEIGHBORHOODS_SHAPEFILE.json'
}

CSV_FILES = {
    'site_locations': 'site_lat_long_08132025.csv'
}

# Cache for loaded data
geojson_cache = {}
csv_cache = {}

# Spatial index for CDC neighborhoods
cdc_spatial_index = None
cdc_features_with_bounds = None
cdc_grid_index = None

# Query result cache for bounds queries
bounds_query_cache = {}
MAX_CACHE_SIZE = 1000  # Maximum number of cached queries

# Grid-based spatial indexing for ultra-fast queries
class SpatialGridIndex:
    def __init__(self, features, grid_size=1.0):
        self.grid_size = grid_size
        self.grid = {}
        self.features = features
        
        # Calculate global bounds
        self.global_bounds = self._calculate_global_bounds(features)
        
        # Build grid
        self._build_grid(features)
    
    def _calculate_global_bounds(self, features):
        """Calculate global bounds of all features"""
        min_lng, max_lng = float('inf'), float('-inf')
        min_lat, max_lat = float('inf'), float('-inf')
        
        for feature in features:
            bbox = self._get_feature_bbox(feature)
            if bbox:
                min_lng = min(min_lng, bbox['min_lng'])
                max_lng = max(max_lng, bbox['max_lng'])
                min_lat = min(min_lat, bbox['min_lat'])
                max_lat = max(max_lat, bbox['max_lat'])
        
        return {
            'min_lng': min_lng,
            'max_lng': max_lng,
            'min_lat': min_lat,
            'max_lat': max_lat
        }
    
    def _get_feature_bbox(self, feature):
        """Get bounding box of a feature"""
        geometry = feature.get('geometry', {})
        if not geometry:
            return None
            
        geom_type = geometry.get('type')
        coordinates = geometry.get('coordinates', [])
        
        if geom_type in ['Polygon', 'MultiPolygon']:
            return calculate_bounding_box(coordinates)
        
        return None
    
    def _get_grid_cells(self, bbox):
        """Get grid cells that intersect with bounding box"""
        cells = set()
        
        min_cell_lng = int(bbox['min_lng'] / self.grid_size)
        max_cell_lng = int(bbox['max_lng'] / self.grid_size)
        min_cell_lat = int(bbox['min_lat'] / self.grid_size)
        max_cell_lat = int(bbox['max_lat'] / self.grid_size)
        
        for lng_cell in range(min_cell_lng, max_cell_lng + 1):
            for lat_cell in range(min_cell_lat, max_cell_lat + 1):
                cells.add((lng_cell, lat_cell))
        
        return cells
    
    def _build_grid(self, features):
        """Build the spatial grid index"""
        for i, feature in enumerate(features):
            bbox = self._get_feature_bbox(feature)
            if not bbox:
                continue
            
            cells = self._get_grid_cells(bbox)
            for cell in cells:
                if cell not in self.grid:
                    self.grid[cell] = []
                self.grid[cell].append(i)
        
        logger.info(f"Built grid index with {len(self.grid)} cells")
    
    def query_bounds(self, north, south, east, west):
        """Query features within bounds using grid index"""
        query_bbox = {
            'min_lng': west,
            'max_lng': east,
            'min_lat': south,
            'max_lat': north
        }
        
        # Get relevant grid cells
        cells = self._get_grid_cells(query_bbox)
        
        # Collect candidate feature indices
        candidate_indices = set()
        for cell in cells:
            if cell in self.grid:
                candidate_indices.update(self.grid[cell])
        
        # Return candidate features
        candidates = [self.features[i] for i in candidate_indices]
        return candidates

def calculate_bounding_box(coordinates):
    """Calculate bounding box for a set of coordinates"""
    if not coordinates:
        return None
    
    # Flatten coordinates if they're nested
    flat_coords = []
    for coord in coordinates:
        if isinstance(coord[0], (list, tuple)):
            flat_coords.extend(coord)
        else:
            flat_coords.append(coord)
    
    if not flat_coords:
        return None
    
    # Ensure all coordinates are valid numbers
    valid_coords = []
    for coord in flat_coords:
        if len(coord) >= 2:
            try:
                lng, lat = float(coord[0]), float(coord[1])
                valid_coords.append([lng, lat])
            except (ValueError, TypeError):
                continue
    
    if not valid_coords:
        return None
    
    lngs = [coord[0] for coord in valid_coords]
    lats = [coord[1] for coord in valid_coords]
    
    return {
        'min_lng': min(lngs),
        'max_lng': max(lngs),
        'min_lat': min(lats),
        'max_lat': max(lats)
    }

def build_spatial_index(features):
    """Build a spatial index for faster bounds queries"""
    indexed_features = []
    
    for i, feature in enumerate(features):
        geometry = feature.get('geometry', {})
        if not geometry:
            continue
            
        geom_type = geometry.get('type')
        coordinates = geometry.get('coordinates', [])
        
        if geom_type == 'Polygon':
            bbox = calculate_bounding_box(coordinates)
        elif geom_type == 'MultiPolygon':
            bbox = calculate_bounding_box(coordinates)
        else:
            continue
            
        if bbox:
            indexed_features.append({
                'index': i,
                'feature': feature,
                'bbox': bbox
            })
    
    logger.info(f"Built spatial index for {len(indexed_features)} features")
    return indexed_features

def check_bbox_intersection(bbox1, bbox2):
    """Check if two bounding boxes intersect"""
    return not (bbox1['max_lng'] < bbox2['min_lng'] or 
                bbox1['min_lng'] > bbox2['max_lng'] or 
                bbox1['max_lat'] < bbox2['min_lat'] or 
                bbox1['min_lat'] > bbox2['max_lat'])

def simplify_coordinates(coordinates, precision=4):
    """Simplify coordinates by reducing precision"""
    if isinstance(coordinates, list):
        if len(coordinates) > 0 and isinstance(coordinates[0], (list, tuple)):
            return [simplify_coordinates(coord, precision) for coord in coordinates]
        else:
            return [round(coord, precision) for coord in coordinates]
    return coordinates

def make_cache_key(north, south, east, west, max_features=1000, simplify=False):
    """Create a cache key for bounds query"""
    return f"{north:.4f}_{south:.4f}_{east:.4f}_{west:.4f}_{max_features}_{simplify}"

def get_cached_bounds_result(cache_key):
    """Get cached result for bounds query"""
    return bounds_query_cache.get(cache_key)

def cache_bounds_result(cache_key, result):
    """Cache result for bounds query"""
    if len(bounds_query_cache) >= MAX_CACHE_SIZE:
        # Remove oldest entry (simple LRU)
        oldest_key = next(iter(bounds_query_cache))
        del bounds_query_cache[oldest_key]
    
    bounds_query_cache[cache_key] = result

def check_feature_in_bounds_optimized(feature, north, south, east, west):
    """Optimized bounds checking using pre-computed bounding boxes"""
    geometry = feature.get('geometry', {})
    if not geometry:
        return False
    
    geom_type = geometry.get('type')
    coordinates = geometry.get('coordinates', [])
    
    # Quick bounding box check first
    query_bbox = {
        'min_lng': west,
        'max_lng': east,
        'min_lat': south,
        'max_lat': north
    }
    
    # Calculate feature bbox
    feature_bbox = calculate_bounding_box(coordinates)
    if not feature_bbox:
        return False
    
    # If bounding boxes don't intersect, feature is definitely not in bounds
    if not check_bbox_intersection(feature_bbox, query_bbox):
        return False
    
    # For more precise checking, do point-in-polygon test
    # This is a simplified version - for production, consider using a proper geometry library
    try:
        if geom_type == 'Polygon':
            if coordinates and len(coordinates) > 0:
                exterior_ring = coordinates[0]
                for coord_pair in exterior_ring:
                    if len(coord_pair) >= 2:
                        lng, lat = float(coord_pair[0]), float(coord_pair[1])
                        if west <= lng <= east and south <= lat <= north:
                            return True
        
        elif geom_type == 'MultiPolygon':
            for polygon in coordinates:
                if polygon and len(polygon) > 0:
                    exterior_ring = polygon[0]
                    for coord_pair in exterior_ring:
                        if len(coord_pair) >= 2:
                            lng, lat = float(coord_pair[0]), float(coord_pair[1])
                            if west <= lng <= east and south <= lat <= north:
                                return True
        
        return False
        
    except (IndexError, TypeError, KeyError, ValueError) as e:
        logger.warning(f"Error checking bounds for feature: {str(e)}")
        return False

def load_geojson_file(file_path: str) -> Dict[str, Any]:
    """Load and parse a GeoJSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Successfully loaded {file_path}")
        return data
    except Exception as e:
        logger.error(f"Error loading {file_path}: {str(e)}")
        return None

def load_csv_file(file_path: str) -> List[Dict[str, Any]]:
    """Load and parse a CSV file"""
    try:
        data = []
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
        logger.info(f"Successfully loaded {file_path} with {len(data)} records")
        return data
    except Exception as e:
        logger.error(f"Error loading {file_path}: {str(e)}")
        return []

def get_cached_data(data_type: str, file_key: str):
    """Get cached data, loading if necessary"""
    if data_type == 'geojson':
        if file_key not in geojson_cache:
            geojson_cache[file_key] = load_geojson_file(GEOJSON_FILES[file_key])
        return geojson_cache[file_key]
    elif data_type == 'csv':
        if file_key not in csv_cache:
            csv_cache[file_key] = load_csv_file(CSV_FILES[file_key])
        return csv_cache[file_key]
    return None

def initialize_cdc_spatial_index():
    """Initialize spatial index for CDC neighborhoods"""
    global cdc_spatial_index, cdc_features_with_bounds, cdc_grid_index
    
    if cdc_spatial_index is None:
        logger.info("Building spatial index for CDC neighborhoods...")
        start_time = time.time()
        
        data = get_cached_data('geojson', 'cdc_neighborhoods')
        if data:
            features = data.get('features', [])
            
            # Build both indexing systems for comparison
            cdc_features_with_bounds = build_spatial_index(features)
            
            # Build grid index for ultra-fast queries
            logger.info("Building grid-based spatial index...")
            grid_start = time.time()
            cdc_grid_index = SpatialGridIndex(features, grid_size=0.5)  # 0.5 degree grid cells
            grid_elapsed = time.time() - grid_start
            logger.info(f"Grid index built in {grid_elapsed:.2f} seconds")
            
            cdc_spatial_index = True
            
            elapsed = time.time() - start_time
            logger.info(f"All spatial indexes built in {elapsed:.2f} seconds")
        else:
            logger.error("Failed to load CDC neighborhoods data for spatial indexing")

def search_features(features: List[Dict], query: str, search_fields: List[str] = None) -> List[Dict]:
    """Search features by query in specified fields"""
    if not search_fields:
        search_fields = ['properties']
    
    results = []
    query_lower = query.lower()
    
    for feature in features:
        if 'properties' in feature:
            properties = feature['properties']
            for field in search_fields:
                if field == 'properties':
                    # Search in all property values
                    for key, value in properties.items():
                        if str(value).lower().find(query_lower) != -1:
                            results.append(feature)
                            break
                elif field in properties:
                    if str(properties[field]).lower().find(query_lower) != -1:
                        results.append(feature)
                        break
        else:
            # For CSV data without properties
            for key, value in feature.items():
                if str(value).lower().find(query_lower) != -1:
                    results.append(feature)
                    break
    
    return results

# Initialize spatial index on startup
def setup_spatial_index():
    """Initialize spatial index before first request"""
    initialize_cdc_spatial_index()

# Initialize on app startup
with app.app_context():
    setup_spatial_index()

@app.route('/')
def index():
    """API information and available endpoints"""
    return jsonify({
        "name": "GeoJSON & Site Location API",
        "version": "2.0",
        "description": "API for serving geographic data from GeoJSON files and site location data from CSV",
        "datasets": {
            "zip_codes": "ZIP code boundaries and information",
            "market_regions": "Market region boundaries and information", 
            "cdc_neighborhoods": "CDC neighborhood boundaries and information",
            "site_locations": "Site locations with latitude and longitude coordinates"
        },
        "endpoints": {
            "base": "/",
            "zip_codes": {
                "all": "/api/zip-codes",
                "by_id": "/api/zip-codes/id/{id}",
                "by_zipcode": "/api/zip-codes/zipcode/{zipcode}"
            },
            "market_regions": {
                "all": "/api/market-regions",
                "by_id": "/api/market-regions/id/{id}",
                "by_property": "/api/market-regions/property/{name}/{value}"
            },
            "cdc_neighborhoods": {
                "all": "/api/cdc-neighborhoods", 
                "by_id": "/api/cdc-neighborhoods/id/{id}",
                "by_property": "/api/cdc-neighborhoods/property/{name}/{value}"
            },
            "site_locations": {
                "all": "/api/site-locations",
                "by_site_id": "/api/site-locations/site/{site_id}",
                "by_coordinates": "/api/site-locations/coordinates?lat={lat}&lng={lng}&radius={radius}"
            },
            "search": {
                "cross_dataset": "/api/search?q={query}&dataset={dataset}",
                "all_datasets": "/api/search?q={query}"
            }
        }
    })

# ZIP Codes endpoints
@app.route('/api/zip-codes')
def get_all_zip_codes():
    """Get all ZIP codes"""
    data = get_cached_data('geojson', 'zip_codes')
    if not data:
        return jsonify({"error": "Failed to load ZIP codes data"}), 500
    
    return jsonify({
        "dataset": "zip_codes",
        "count": len(data.get('features', [])),
        "features": data.get('features', [])
    })

@app.route('/api/zip-codes/id/<int:id>')
def get_zip_code_by_id(id):
    """Get ZIP code by OBJECTID"""
    data = get_cached_data('geojson', 'zip_codes')
    if not data:
        return jsonify({"error": "Failed to load ZIP codes data"}), 500
    
    for feature in data.get('features', []):
        if feature.get('properties', {}).get('OBJECTID') == id:
            return jsonify({
                "dataset": "zip_codes",
                "feature": feature
            })
    
    return jsonify({"error": f"ZIP code with OBJECTID {id} not found"}), 404

@app.route('/api/zip-codes/zipcode/<zipcode>')
def get_zip_code_by_zipcode(zipcode):
    """Get ZIP code by ZIPCODE"""
    data = get_cached_data('geojson', 'zip_codes')
    if not data:
        return jsonify({"error": "Failed to load ZIP codes data"}), 500
    
    for feature in data.get('features', []):
        if str(feature.get('properties', {}).get('ZIPCODE')) == str(zipcode):
            return jsonify({
                "dataset": "zip_codes",
                "feature": feature
            })
    
    return jsonify({"error": f"ZIP code {zipcode} not found"}), 404

@app.route('/api/zip-codes/bounds')
def get_zip_codes_by_bounds():
    """Get ZIP codes within geographic bounds"""
    north = request.args.get('north', type=float)
    south = request.args.get('south', type=float)
    east = request.args.get('east', type=float)
    west = request.args.get('west', type=float)
    
    if None in [north, south, east, west]:
        return jsonify({"error": "All bound parameters required"}), 400
    
    logger.info(f"Fetching ZIP codes for bounds: N={north}, S={south}, E={east}, W={west}")
    
    data = get_cached_data('geojson', 'zip_codes')
    if not data:
        return jsonify({"error": "Failed to load ZIP codes data"}), 500
    
    results = []
    for feature in data.get('features', []):
        if check_feature_in_bounds(feature, north, south, east, west):
            results.append(feature)
    
    logger.info(f"Found {len(results)} ZIP codes out of {len(data.get('features', []))} total")
    
    return jsonify({
        "dataset": "zip_codes",
        "bounds": {"north": north, "south": south, "east": east, "west": west},
        "count": len(results),
        "features": results
    })


# Market Regions endpoints (renamed from TMO regions)
@app.route('/api/market-regions')
def get_all_market_regions():
    """Get all market regions"""
    data = get_cached_data('geojson', 'market_regions')
    if not data:
        return jsonify({"error": "Failed to load market regions data"}), 500
    
    return jsonify({
        "dataset": "market_regions",
        "count": len(data.get('features', [])),
        "features": data.get('features', [])
    })

@app.route('/api/market-regions/id/<market_id>')
def get_market_region_by_id(market_id):
    """Get market region by Market name (ID)"""
    data = get_cached_data('geojson', 'market_regions')
    if not data:
        return jsonify({"error": "Failed to load market regions data"}), 500
    
    # URL decode the market_id to handle spaces
    from urllib.parse import unquote
    market_name = unquote(market_id)
    
    for feature in data.get('features', []):
        if feature.get('properties', {}).get('Market') == market_name:
            return jsonify({
                "dataset": "market_regions",
                "feature": feature
            })
    
    return jsonify({"error": f"Market region '{market_name}' not found"}), 404

@app.route('/api/market-regions/property/<name>/<value>')
def get_market_region_by_property(name, value):
    """Get market regions by property name and value"""
    data = get_cached_data('geojson', 'market_regions')
    if not data:
        return jsonify({"error": "Failed to load market regions data"}), 500
    
    # URL decode the value to handle spaces
    from urllib.parse import unquote
    decoded_value = unquote(value)
    
    results = []
    for feature in data.get('features', []):
        if str(feature.get('properties', {}).get(name, '')).lower() == str(decoded_value).lower():
            results.append(feature)
    
    return jsonify({
        "dataset": "market_regions",
        "property": name,
        "value": decoded_value,
        "count": len(results),
        "features": results
    })

# CDC Neighborhoods endpoints
# @app.route('/api/cdc-neighborhoods')
# def get_all_cdc_neighborhoods():
#     """Get CDC neighborhoods with pagination"""
#     data = get_cached_data('geojson', 'cdc_neighborhoods')
#     if not data:
#         return jsonify({"error": "Failed to load CDC neighborhoods data"}), 500

#     features = data.get('features', [])

#     # Pagination parameters
#     limit = request.args.get('limit', default=1000, type=int)   # default: 1000 features
#     offset = request.args.get('offset', default=0, type=int)    # default: start from 0

#     # Slice features safely
#     paginated_features = features[offset:offset + limit]

#     return jsonify({
#         "dataset": "cdc_neighborhoods",
#         "total_count": len(features),         # total features in dataset
#         "returned_count": len(paginated_features),  # features in this response
#         "offset": offset,
#         "limit": limit,
#         "features": paginated_features
#     })

@app.route('/api/cdc-neighborhoods')
def get_all_cdc_neighborhoods():
    """Get all CDC neighborhoods"""
    data = get_cached_data('geojson', 'cdc_neighborhoods')
    if not data:
        return jsonify({"error": "Failed to load CDC neighborhoods data"}), 500
    
    return jsonify({
        "dataset": "cdc_neighborhoods",
        "count": len(data.get('features', [])),
        "features": data.get('features', [])
    })

# Add this helper function after your existing functions in app.py

def check_feature_in_bounds(feature, north, south, east, west):
    """Check if a GeoJSON feature intersects with given bounds"""
    try:
        geometry = feature.get('geometry', {})
        if not geometry:
            return False
        
        geom_type = geometry.get('type')
        coordinates = geometry.get('coordinates', [])
        
        if geom_type == 'Polygon':
            # For Polygon: coordinates is [exterior_ring, hole1, hole2, ...]
            # exterior_ring is [[lng1, lat1], [lng2, lat2], ...]
            if coordinates and len(coordinates) > 0:
                exterior_ring = coordinates[0]  # Get the exterior ring
                for coord_pair in exterior_ring:
                    if len(coord_pair) >= 2:  # Make sure it has lng, lat
                        lng, lat = float(coord_pair[0]), float(coord_pair[1])
                        if west <= lng <= east and south <= lat <= north:
                            return True
        
        elif geom_type == 'MultiPolygon':
            # For MultiPolygon: coordinates is [polygon1, polygon2, ...]
            # Each polygon is [exterior_ring, hole1, hole2, ...]
            for polygon in coordinates:
                if polygon and len(polygon) > 0:
                    exterior_ring = polygon[0]  # Get the exterior ring of each polygon
                    for coord_pair in exterior_ring:
                        if len(coord_pair) >= 2:  # Make sure it has lng, lat
                            lng, lat = float(coord_pair[0]), float(coord_pair[1])
                            if west <= lng <= east and south <= lat <= north:
                                return True
        
        elif geom_type == 'Point':
            # For Point: coordinates is [lng, lat]
            if len(coordinates) >= 2:
                lng, lat = float(coordinates[0]), float(coordinates[1])
                return west <= lng <= east and south <= lat <= north
        
        elif geom_type == 'MultiPoint':
            # For MultiPoint: coordinates is [[lng1, lat1], [lng2, lat2], ...]
            for coord_pair in coordinates:
                if len(coord_pair) >= 2:
                    lng, lat = float(coord_pair[0]), float(coord_pair[1])
                    if west <= lng <= east and south <= lat <= north:
                        return True
        
        return False
        
    except (IndexError, TypeError, KeyError, ValueError) as e:
        logger.warning(f"Error checking bounds for feature: {str(e)}")
        return False


# Add this new endpoint to your app.py

@app.route('/api/cdc-neighborhoods/bounds')
def get_cdc_neighborhoods_by_bounds():
    """Get CDC neighborhoods within geographic bounds - OPTIMIZED VERSION"""
    start_time = time.time()
    
    # Get bounds parameters
    north = request.args.get('north', type=float)
    south = request.args.get('south', type=float)
    east = request.args.get('east', type=float)
    west = request.args.get('west', type=float)
    
    if None in [north, south, east, west]:
        return jsonify({"error": "All bound parameters (north, south, east, west) are required"}), 400
    
    # Get additional parameters
    max_features = request.args.get('max_features', type=int, default=1000)
    simplify = request.args.get('simplify', type=bool, default=False)
    
    # Check cache first
    cache_key = make_cache_key(north, south, east, west, max_features, simplify)
    cached_result = get_cached_bounds_result(cache_key)
    if cached_result:
        logger.info(f"Cache hit for bounds query: {cache_key}")
        return jsonify(cached_result)
    
    logger.info(f"Fetching neighborhoods for bounds: N={north}, S={south}, E={east}, W={west}")
    
    # Ensure spatial index is initialized
    if cdc_spatial_index is None:
        initialize_cdc_spatial_index()
    
    if not cdc_grid_index:
        return jsonify({"error": "Grid index not available"}), 500
    
    # Use grid index for ultra-fast candidate selection
    candidate_features = cdc_grid_index.query_bounds(north, south, east, west)
    logger.info(f"Grid index found {len(candidate_features)} candidate features")
    
    # Further refine with precise bounds checking (only on candidates)
    results = []
    for feature in candidate_features:
        if check_feature_in_bounds_optimized(feature, north, south, east, west):
            results.append(feature)
    
    elapsed_time = time.time() - start_time
    logger.info(f"Found {len(results)} neighborhoods in {elapsed_time:.3f} seconds")
    
    # Optimize response size by limiting features if too many
    # if len(results) > max_features:
    #     logger.warning(f"Limiting results from {len(results)} to {max_features} features")
    #     results = results[:max_features]
    
    # Check if client wants simplified geometry
    if simplify:
        # Simplify geometry by reducing coordinate precision
        for feature in results:
            if 'geometry' in feature and 'coordinates' in feature['geometry']:
                feature['geometry']['coordinates'] = simplify_coordinates(
                    feature['geometry']['coordinates'], precision=4
                )
    
    response_data = {
        "dataset": "cdc_neighborhoods",
        "bounds": {
            "north": north,
            "south": south,
            "east": east,
            "west": west
        },
        "total_features": len(cdc_grid_index.features),
        "candidate_features": len(candidate_features),
        "count": len(results),
        "query_time_ms": round(elapsed_time * 1000, 2),
        "index_type": "grid",
        "cached": False,
        "features": results
    }
    
    # Cache the result
    cache_bounds_result(cache_key, response_data)
    
    return jsonify(response_data)

@app.route('/api/cdc-neighborhoods/performance')
def get_cdc_performance_stats():
    """Get performance statistics for CDC neighborhoods"""
    stats = {
        "spatial_index_built": cdc_spatial_index is not None,
        "grid_index_built": cdc_grid_index is not None,
        "total_features": len(cdc_grid_index.features) if cdc_grid_index else 0,
        "cache_size": len(bounds_query_cache),
        "max_cache_size": MAX_CACHE_SIZE,
        "grid_cells": len(cdc_grid_index.grid) if cdc_grid_index else 0,
        "grid_size": cdc_grid_index.grid_size if cdc_grid_index else None
    }
    
    if cdc_grid_index:
        stats["global_bounds"] = cdc_grid_index.global_bounds
    
    return jsonify(stats)


@app.route('/api/cdc-neighborhoods/id/<int:id>')
def get_cdc_neighborhood_by_id(id):
    """Get CDC neighborhood by ID"""
    data = get_cached_data('geojson', 'cdc_neighborhoods')
    if not data:
        return jsonify({"error": "Failed to load CDC neighborhoods data"}), 500
    
    for feature in data.get('features', []):
        if feature.get('properties', {}).get('OBJECTID') == id:
            return jsonify({
                "dataset": "cdc_neighborhoods",
                "feature": feature
            })
    
    return jsonify({"error": f"CDC neighborhood with ID {id} not found"}), 404

@app.route('/api/cdc-neighborhoods/property/<name>/<value>')
def get_cdc_neighborhood_by_property(name, value):
    """Get CDC neighborhoods by property name and value"""
    data = get_cached_data('geojson', 'cdc_neighborhoods')
    if not data:
        return jsonify({"error": "Failed to load CDC neighborhoods data"}), 500
    
    results = []
    for feature in data.get('features', []):
        if str(feature.get('properties', {}).get(name, '')).lower() == str(value).lower():
            results.append(feature)
    
    return jsonify({
        "dataset": "cdc_neighborhoods",
        "property": name,
        "value": value,
        "count": len(results),
        "features": results
    })

# Site Locations endpoints (new)
@app.route('/api/site-locations')
def get_all_site_locations():
    """Get all site locations"""
    data = get_cached_data('csv', 'site_locations')
    if not data:
        return jsonify({"error": "Failed to load site locations data"}), 500
    
    return jsonify({
        "dataset": "site_locations",
        "count": len(data),
        "sites": data
    })

@app.route('/api/site-locations/site/<site_id>')
def get_site_by_id(site_id):
    """Get site location by site ID"""
    data = get_cached_data('csv', 'site_locations')
    if not data:
        return jsonify({"error": "Failed to load site locations data"}), 500
    
    for site in data:
        if site.get('site_id') == site_id:
            return jsonify({
                "dataset": "site_locations",
                "site": site
            })
    
    return jsonify({"error": f"Site with ID {site_id} not found"}), 404

@app.route('/api/site-locations/coordinates')
def get_sites_by_coordinates():
    """Get sites within a radius of given coordinates"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', type=float, default=1.0)  # Default 1 degree radius
    
    if lat is None or lng is None:
        return jsonify({"error": "Latitude and longitude parameters are required"}), 400
    
    data = get_cached_data('csv', 'site_locations')
    if not data:
        return jsonify({"error": "Failed to load site locations data"}), 500
    
    results = []
    for site in data:
        try:
            site_lat = float(site.get('s_site_latitude', 0))
            site_lng = float(site.get('s_site_longitude', 0))
            
            # Simple distance calculation (approximate)
            lat_diff = abs(site_lat - lat)
            lng_diff = abs(site_lng - lng)
            
            if lat_diff <= radius and lng_diff <= radius:
                results.append(site)
        except (ValueError, TypeError):
            continue
    
    return jsonify({
        "dataset": "site_locations",
        "center": {"latitude": lat, "longitude": lng},
        "radius": radius,
        "count": len(results),
        "sites": results
    })

# Search endpoint
@app.route('/api/search')
def search_data():
    """Search across datasets"""
    query = request.args.get('q', '')
    dataset = request.args.get('dataset', 'all')
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    results = []
    
    if dataset in ['all', 'zip_codes']:
        data = get_cached_data('geojson', 'zip_codes')
        if data:
            zip_results = search_features(data.get('features', []), query)
            for feature in zip_results:
                results.append({
                    "dataset": "zip_codes",
                    "feature": feature
                })
    
    if dataset in ['all', 'market_regions']:
        data = get_cached_data('geojson', 'market_regions')
        if data:
            market_results = search_features(data.get('features', []), query, ['Market', 'Eng_Market', 'Market_Area', 'Region'])
            for feature in market_results:
                results.append({
                    "dataset": "market_regions",
                    "feature": feature
                })
    
    if dataset in ['all', 'cdc_neighborhoods']:
        data = get_cached_data('geojson', 'cdc_neighborhoods')
        if data:
            cdc_results = search_features(data.get('features', []), query)
            for feature in cdc_results:
                results.append({
                    "dataset": "cdc_neighborhoods",
                    "feature": feature
                })
    
    if dataset in ['all', 'site_locations']:
        data = get_cached_data('csv', 'site_locations')
        if data:
            site_results = search_features(data, query, ['site_id'])
            for site in site_results:
                results.append({
                    "dataset": "site_locations",
                    "site": site
                })
    
    return jsonify({
        "query": query,
        "dataset": dataset,
        "count": len(results),
        "results": results
    })

if __name__ == '__main__':
    print("Starting GeoJSON & Site Location API Server...")
    print("Available endpoints:")
    print("  GET / - API information")
    print("  GET /api/zip-codes - All ZIP codes")
    print("  GET /api/zip-codes/id/<id> - ZIP code by OBJECTID")
    print("  GET /api/zip-codes/zipcode/<zipcode> - ZIP code by ZIPCODE")
    print("  GET /api/market-regions - All market regions")
    print("  GET /api/market-regions/id/<id> - Market region by ID")
    print("  GET /api/market-regions/property/<name>/<value> - Market region by property")
    print("  GET /api/cdc-neighborhoods - All CDC neighborhoods")
    print("  GET /api/cdc-neighborhoods/id/<id> - CDC neighborhood by ID")
    print("  GET /api/cdc-neighborhoods/property/<name>/<value> - CDC neighborhood by property")
    print("  GET /api/site-locations - All site locations")
    print("  GET /api/site-locations/site/<site_id> - Site by ID")
    print("  GET /api/site-locations/coordinates?lat=<lat>&lng=<lng>&radius=<radius> - Sites by coordinates")
    print("  GET /api/search?q=<query>&dataset=<dataset> - Search across datasets")
    print("Server will start on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
