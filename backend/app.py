from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os
import csv
from typing import Dict, List, Optional, Any
import logging
import time
from functools import lru_cache
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'], supports_credentials=True)

# Load configuration
app.config.from_object(Config)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Load data files
ZIP_CODES_FILE = 'usa_zip_codes_geo_100m.json'
MARKET_REGIONS_FILE = 'tmo_region_market.json'
CDC_NEIGHBORHOODS_FILE = 'CDC_V3_NEIGHBORHOODS_SHAPEFILE.json'
SITE_LOCATIONS_FILE = 'site_lat_long_08132025.csv'

# Global data storage
zip_codes_data = None
market_regions_data = None
cdc_neighborhoods_data = None
site_locations_data = None

# Spatial indexing
spatial_index = None
grid_index = None

def load_geojson_file(filename: str) -> Dict:
    """Load GeoJSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading {filename}: {str(e)}")
        return {"type": "FeatureCollection", "features": []}

def load_csv_file(filename: str) -> List[Dict]:
    """Load CSV file"""
    try:
        data = []
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
        return data
    except Exception as e:
        logger.error(f"Error loading {filename}: {str(e)}")
        return []

def build_spatial_index():
    """Build spatial index for CDC neighborhoods"""
    global spatial_index
    try:
        logger.info("Building spatial index for CDC neighborhoods...")
        
        # Simple bounding box index for now
        spatial_index = {}
        
        for feature in cdc_neighborhoods_data.get('features', []):
            try:
                if 'geometry' in feature and 'coordinates' in feature['geometry']:
                    coords = feature['geometry']['coordinates']
                    
                    # Handle different coordinate structures
                    if isinstance(coords, list) and len(coords) > 0:
                        # Get the first polygon (or line)
                        if isinstance(coords[0], list):
                            polygon_coords = coords[0]
                        else:
                            polygon_coords = coords
                        
                        # Extract lat/lon values, ensuring they are numbers
                        lats = []
                        lons = []
                        
                        for coord in polygon_coords:
                            if isinstance(coord, list) and len(coord) >= 2:
                                try:
                                    lon = float(coord[0])
                                    lat = float(coord[1])
                                    lats.append(lat)
                                    lons.append(lon)
                                except (ValueError, TypeError):
                                    continue
                        
                        if lats and lons:
                            bbox = {
                                'min_lat': min(lats),
                                'max_lat': max(lats),
                                'min_lon': min(lons),
                                'max_lon': max(lons)
                            }
                            
                            # Store in spatial index
                            feature_id = feature.get('properties', {}).get('GEOID', str(len(spatial_index)))
                            spatial_index[feature_id] = {
                                'feature': feature,
                                'bbox': bbox
                            }
            except Exception as e:
                logger.warning(f"Skipping feature in spatial index due to parsing error: {str(e)}")
                continue
        
        logger.info(f"Built spatial index for {len(spatial_index)} features")
        
    except Exception as e:
        logger.error(f"Error building spatial index: {str(e)}")
        spatial_index = {}  # Ensure spatial_index is initialized even if there's an error

def build_grid_index():
    """Build grid-based spatial index"""
    global grid_index
    try:
        logger.info("Building grid-based spatial index...")
        
        # Define grid parameters
        grid_size = 0.1  # 0.1 degree grid cells
        grid_index = {}
        
        for feature in cdc_neighborhoods_data.get('features', []):
            try:
                if 'geometry' in feature and 'coordinates' in feature['geometry']:
                    coords = feature['geometry']['coordinates']
                    
                    # Handle different coordinate structures
                    if isinstance(coords, list) and len(coords) > 0:
                        # Get the first polygon (or line)
                        if isinstance(coords[0], list):
                            polygon_coords = coords[0]
                        else:
                            polygon_coords = coords
                        
                        # Extract lat/lon values, ensuring they are numbers
                        lats = []
                        lons = []
                        
                        for coord in polygon_coords:
                            if isinstance(coord, list) and len(coord) >= 2:
                                try:
                                    lon = float(coord[0])
                                    lat = float(coord[1])
                                    lats.append(lat)
                                    lons.append(lon)
                                except (ValueError, TypeError):
                                    continue
                        
                        if lats and lons:
                            # Calculate grid cells that this feature intersects
                            min_lat, max_lat = min(lats), max(lats)
                            min_lon, max_lon = min(lons), max(lons)
                            
                            # Generate grid cell keys
                            try:
                                for lat in range(int(min_lat / grid_size), int(max_lat / grid_size) + 1):
                                    for lon in range(int(min_lon / grid_size), int(max_lon / grid_size) + 1):
                                        cell_key = f"{lat}_{lon}"
                                        if cell_key not in grid_index:
                                            grid_index[cell_key] = []
                                        grid_index[cell_key].append(feature)
                            except (ValueError, TypeError) as e:
                                logger.warning(f"Skipping feature due to coordinate conversion error: {str(e)}")
                                continue
            except Exception as e:
                logger.warning(f"Skipping feature due to parsing error: {str(e)}")
                continue
        
        logger.info(f"Built grid index with {len(grid_index)} cells")
        
    except Exception as e:
        logger.error(f"Error building grid index: {str(e)}")
        grid_index = {}  # Ensure grid_index is initialized even if there's an error

def load_all_data():
    """Load all data files"""
    global zip_codes_data, market_regions_data, cdc_neighborhoods_data, site_locations_data
    
    logger.info("Loading data files...")
    
    # Load GeoJSON files
    if os.path.exists(ZIP_CODES_FILE):
        zip_codes_data = load_geojson_file(ZIP_CODES_FILE)
        logger.info(f"Loaded ZIP codes: {len(zip_codes_data.get('features', []))} features")
    
    if os.path.exists(MARKET_REGIONS_FILE):
        market_regions_data = load_geojson_file(MARKET_REGIONS_FILE)
        logger.info(f"Loaded market regions: {len(market_regions_data.get('features', []))} features")
    
    if os.path.exists(CDC_NEIGHBORHOODS_FILE):
        cdc_neighborhoods_data = load_geojson_file(CDC_NEIGHBORHOODS_FILE)
        logger.info(f"Loaded CDC neighborhoods: {len(cdc_neighborhoods_data.get('features', []))} features")
    
    if os.path.exists(SITE_LOCATIONS_FILE):
        site_locations_data = load_csv_file(SITE_LOCATIONS_FILE)
        logger.info(f"Loaded site locations: {len(site_locations_data)} records")
    
    # Build spatial indexes
    if cdc_neighborhoods_data:
        build_spatial_index()
        build_grid_index()

# Load data on startup
load_all_data()

@app.route('/', methods=['GET'])
def index():
    """API information"""
    return jsonify({
        'service': 'GIS POC API',
        'version': '1.0.0',
        'endpoints': {
            'geojson': {
                'method': 'GET',
                'url': '/api/geojson',
                'description': 'Get GeoJSON data with spatial filtering'
            },
            'kpi_routes': {
                'description': 'KPI data endpoints (see /api/kpi/*)',
                'endpoints': [
                    '/api/kpi/market/<id>',
                    '/api/kpi/market/market_id/<market_id>',
                    '/api/kpi/zip/<id>',
                    '/api/kpi/zip/zip_id/<zip_id>',
                    '/api/kpi/hex/<id>',
                    '/api/kpi/hex/hex_id/<hex_id>',
                    '/api/kpi/neighborhood/<id>',
                    '/api/kpi/neighborhood/neighborhood_id/<neighborhood_id>',
                    '/api/kpi/site/<id>',
                    '/api/kpi/site/site_id/<site_id>'
                ]
            },
            'ui_compatibility': {
                'description': 'UI compatibility endpoints for existing frontend',
                'endpoints': [
                    '/api/market-regions',
                    '/api/market-regions/id/<market_name>',
                    '/api/cdc-neighborhoods',
                    '/api/cdc-neighborhoods/id/<neighborhood_id>',
                    '/api/cdc-neighborhoods/bounds',
                    '/api/site-locations',
                    '/api/site-locations/coordinates',
                    '/api/site-locations/site/<site_id>',
                    '/api/zip-codes',
                    '/api/zip-codes/bounds',
                    '/api/search'
                ]
            }
        },
        'data_sources': {
            'zip_codes': len(zip_codes_data.get('features', [])) if zip_codes_data else 0,
            'market_regions': len(market_regions_data.get('features', [])) if market_regions_data else 0,
            'cdc_neighborhoods': len(cdc_neighborhoods_data.get('features', [])) if cdc_neighborhoods_data else 0,
            'site_locations': len(site_locations_data) if site_locations_data else 0
        },
        'message': 'GIS POC API is running'
    }), 200

@app.route('/api/geojson', methods=['GET'])
def get_geojson():
    """Get GeoJSON data with spatial filtering"""
    try:
        dataset = request.args.get('dataset', 'cdc_neighborhoods')
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 0.1, type=float)
        
        # Select dataset
        if dataset == 'zip_codes':
            data = zip_codes_data
        elif dataset == 'market_regions':
            data = market_regions_data
        elif dataset == 'cdc_neighborhoods':
            data = cdc_neighborhoods_data
        else:
            return jsonify({
                'success': False,
                'message': f'Unknown dataset: {dataset}'
            }), 400
        
        if not data:
            return jsonify({
                'success': False,
                'message': f'Dataset {dataset} not available'
            }), 404
        
        # Apply spatial filtering if coordinates provided
        if lat is not None and lng is not None:
            filtered_features = []
            
            for feature in data.get('features', []):
                if 'geometry' in feature and 'coordinates' in feature['geometry']:
                    # Simple distance calculation (can be improved)
                    coords = feature['geometry']['coordinates'][0]
                    feature_lats = [coord[1] for coord in coords]
                    feature_lons = [coord[0] for coord in coords]
                    
                    feature_center_lat = sum(feature_lats) / len(feature_lats)
                    feature_center_lon = sum(feature_lons) / len(feature_lons)
                    
                    # Calculate distance (simplified)
                    distance = ((lat - feature_center_lat) ** 2 + (lng - feature_center_lon) ** 2) ** 0.5
                    
                    if distance <= radius:
                        filtered_features.append(feature)
            
            data = {
                'type': 'FeatureCollection',
                'features': filtered_features
            }
        
        return jsonify({
            'success': True,
            'dataset': dataset,
            'count': len(data.get('features', [])),
            'data': data
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_geojson: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving data: {str(e)}'
        }), 500

# UI Compatibility Endpoints - Maintain existing frontend functionality

@app.route('/api/market-regions', methods=['GET'])
def get_market_regions():
    """Get all market regions (UI compatibility)"""
    try:
        if not market_regions_data:
            return jsonify({
                'success': False,
                'message': 'Market regions data not available'
            }), 404
        
        return jsonify(market_regions_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_market_regions: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving market regions: {str(e)}'
        }), 500

@app.route('/api/market-regions/id/<market_name>', methods=['GET'])
def get_market_region_by_id(market_name):
    """Get market region by name (UI compatibility)"""
    try:
        if not market_regions_data:
            return jsonify({
                'success': False,
                'message': 'Market regions data not available'
            }), 404
        
        # Find market region by name
        for feature in market_regions_data.get('features', []):
            if feature.get('properties', {}).get('name') == market_name:
                return jsonify(feature), 200
        
        return jsonify({
            'success': False,
            'message': f'Market region {market_name} not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error in get_market_region_by_id: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving market region: {str(e)}'
        }), 500

@app.route('/api/cdc-neighborhoods', methods=['GET'])
def get_cdc_neighborhoods():
    """Get all CDC neighborhoods (UI compatibility)"""
    try:
        if not cdc_neighborhoods_data:
            return jsonify({
                'success': False,
                'message': 'CDC neighborhoods data not available'
            }), 404
        
        return jsonify(cdc_neighborhoods_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_cdc_neighborhoods: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving CDC neighborhoods: {str(e)}'
        }), 500

@app.route('/api/cdc-neighborhoods/id/<neighborhood_id>', methods=['GET'])
def get_cdc_neighborhood_by_id(neighborhood_id):
    """Get CDC neighborhood by ID (UI compatibility)"""
    try:
        if not cdc_neighborhoods_data:
            return jsonify({
                'success': False,
                'message': 'CDC neighborhoods data not available'
            }), 404
        
        # Find neighborhood by ID
        for feature in cdc_neighborhoods_data.get('features', []):
            if feature.get('properties', {}).get('GEOID') == neighborhood_id:
                return jsonify(feature), 200
        
        return jsonify({
            'success': False,
            'message': f'CDC neighborhood {neighborhood_id} not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error in get_cdc_neighborhood_by_id: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving CDC neighborhood: {str(e)}'
        }), 500

@app.route('/api/cdc-neighborhoods/bounds', methods=['GET'])
def get_cdc_neighborhoods_by_bounds():
    """Get CDC neighborhoods by bounds (UI compatibility)"""
    try:
        if not cdc_neighborhoods_data:
            return jsonify({
                'success': False,
                'message': 'CDC neighborhoods data not available'
            }), 404
        
        north = request.args.get('north', type=float)
        south = request.args.get('south', type=float)
        east = request.args.get('east', type=float)
        west = request.args.get('west', type=float)
        
        if not all([north, south, east, west]):
            return jsonify({
                'success': False,
                'message': 'All bounds parameters (north, south, east, west) are required'
            }), 400
        
        # Filter features within bounds
        filtered_features = []
        for feature in cdc_neighborhoods_data.get('features', []):
            if 'geometry' in feature and 'coordinates' in feature['geometry']:
                try:
                    coords = feature['geometry']['coordinates']
                    if isinstance(coords, list) and len(coords) > 0:
                        if isinstance(coords[0], list):
                            polygon_coords = coords[0]
                        else:
                            polygon_coords = coords
                        
                        # Check if any coordinate is within bounds
                        for coord in polygon_coords:
                            if isinstance(coord, list) and len(coord) >= 2:
                                try:
                                    lon = float(coord[0])
                                    lat = float(coord[1])
                                    if west <= lon <= east and south <= lat <= north:
                                        filtered_features.append(feature)
                                        break
                                except (ValueError, TypeError):
                                    continue
                except Exception:
                    continue
        
        return jsonify({
            'type': 'FeatureCollection',
            'features': filtered_features
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_cdc_neighborhoods_by_bounds: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving CDC neighborhoods by bounds: {str(e)}'
        }), 500

@app.route('/api/site-locations', methods=['GET'])
def get_site_locations():
    """Get all site locations (UI compatibility)"""
    try:
        if not site_locations_data:
            return jsonify({
                'success': False,
                'message': 'Site locations data not available'
            }), 404
        
        return jsonify({
            'sites': site_locations_data,
            'count': len(site_locations_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_site_locations: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving site locations: {str(e)}'
        }), 500

@app.route('/api/site-locations/coordinates', methods=['GET'])
def get_site_locations_by_coordinates():
    """Get site locations by coordinates (UI compatibility)"""
    try:
        if not site_locations_data:
            return jsonify({
                'success': False,
                'message': 'Site locations data not available'
            }), 404
        
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10, type=float)
        
        if not all([lat, lng]):
            return jsonify({
                'success': False,
                'message': 'Latitude and longitude parameters are required'
            }), 400
        
        # Filter sites within radius
        filtered_sites = []
        for site in site_locations_data:
            try:
                site_lat = float(site.get('s_site_latitude', 0))
                site_lng = float(site.get('s_site_longitude', 0))
                
                # Calculate distance (simplified)
                distance = ((lat - site_lat) ** 2 + (lng - site_lng) ** 2) ** 0.5
                
                if distance <= radius:
                    filtered_sites.append(site)
            except (ValueError, TypeError):
                continue
        
        return jsonify({
            'sites': filtered_sites,
            'count': len(filtered_sites)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_site_locations_by_coordinates: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving site locations by coordinates: {str(e)}'
        }), 500

@app.route('/api/site-locations/site/<site_id>', methods=['GET'])
def get_site_by_id(site_id):
    """Get site by ID (UI compatibility)"""
    try:
        if not site_locations_data:
            return jsonify({
                'success': False,
                'message': 'Site locations data not available'
            }), 404
        
        # Find site by ID
        for site in site_locations_data:
            if site.get('site_id') == site_id:
                return jsonify(site), 200
        
        return jsonify({
            'success': False,
            'message': f'Site {site_id} not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error in get_site_by_id: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving site: {str(e)}'
        }), 500

@app.route('/api/zip-codes', methods=['GET'])
def get_zip_codes():
    """Get all ZIP codes (UI compatibility)"""
    try:
        if not zip_codes_data:
            return jsonify({
                'success': False,
                'message': 'ZIP codes data not available'
            }), 404
        
        return jsonify(zip_codes_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_zip_codes: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving ZIP codes: {str(e)}'
        }), 500

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


@app.route('/api/zip-codes/bounds', methods=['GET'])
def get_zip_codes_by_bounds():
    """Get ZIP codes by bounds (UI compatibility)"""
    try:
        if not zip_codes_data:
            return jsonify({
                'success': False,
                'message': 'ZIP codes data not available'
            }), 404
        
        north = request.args.get('north', type=float)
        south = request.args.get('south', type=float)
        east = request.args.get('east', type=float)
        west = request.args.get('west', type=float)
        
        if not all([north, south, east, west]):
            return jsonify({
                'success': False,
                'message': 'All bounds parameters (north, south, east, west) are required'
            }), 400
        
        results = []
        for feature in zip_codes_data.get('features', []):
            if check_feature_in_bounds(feature, north, south, east, west):
                results.append(feature)
         
        logger.info(f"Found {len(results)} ZIP codes out of {len(zip_codes_data.get('features', []))} total")

        return jsonify({
            "dataset": "zip_codes",
            "bounds": {"north": north, "south": south, "east": east, "west": west},
            "count": len(results),
            "features": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_zip_codes_by_bounds: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving ZIP codes by bounds: {str(e)}'
        }), 500

@app.route('/api/search', methods=['GET'])
def search():
    """Search across datasets (UI compatibility)"""
    try:
        query = request.args.get('q', '').lower()
        dataset = request.args.get('dataset', 'all')
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'Search query is required'
            }), 400
        
        results = []
        
        # Search in market regions
        if dataset in ['all', 'market_regions'] and market_regions_data:
            for feature in market_regions_data.get('features', []):
                properties = feature.get('properties', {})
                if any(query in str(value).lower() for value in properties.values()):
                    results.append({
                        'type': 'market_region',
                        'data': feature
                    })
        
        # Search in CDC neighborhoods
        if dataset in ['all', 'cdc_neighborhoods'] and cdc_neighborhoods_data:
            for feature in cdc_neighborhoods_data.get('features', []):
                properties = feature.get('properties', {})
                if any(query in str(value).lower() for value in properties.values()):
                    results.append({
                        'type': 'cdc_neighborhood',
                        'data': feature
                    })
        
        # Search in site locations
        if dataset in ['all', 'site_locations'] and site_locations_data:
            for site in site_locations_data:
                if any(query in str(value).lower() for value in site.values()):
                    results.append({
                        'type': 'site_location',
                        'data': site
                    })
        
        # Search in ZIP codes
        if dataset in ['all', 'zip_codes'] and zip_codes_data:
            for feature in zip_codes_data.get('features', []):
                properties = feature.get('properties', {})
                if any(query in str(value).lower() for value in properties.values()):
                    results.append({
                        'type': 'zip_code',
                        'data': feature
                    })
        
        return jsonify({
            'success': True,
            'query': query,
            'dataset': dataset,
            'count': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"Error in search: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error performing search: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'GIS POC API is running',
        'timestamp': time.time(),
        'data_loaded': {
            'zip_codes': zip_codes_data is not None,
            'market_regions': market_regions_data is not None,
            'cdc_neighborhoods': cdc_neighborhoods_data is not None,
            'site_locations': site_locations_data is not None
        }
    }), 200

if __name__ == '__main__':
    print("🚀 Starting GIS POC API...")
    print(f"🗄️  Database: {app.config['DB_NAME']} on {app.config['DB_HOST']}")
    print("="*80)
    
    # Register KPI routes
    from routes.kpi_routes import kpi_bp
    app.register_blueprint(kpi_bp)
    
    print("✅ KPI routes registered")
    print("✅ Data files loaded")
    print("✅ Spatial indexes built")
    print("="*80)
    
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
