from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint for map routes
map_bp = Blueprint('map', __name__, url_prefix='/api/map')

def get_db_connection():
    """Get database connection from the main app"""
    from flask import current_app
    return current_app.extensions['sqlalchemy'].engine

def validate_entity_type(entity_type):
    """Validate if the entity type is valid"""
    valid_types = ['MARKET', 'ZIP', 'HEX', 'NEIGHBOURHOOD', 'SITE']
    return entity_type.upper() in valid_types

def get_entity_id_column(entity_type):
    """Get the corresponding ID column name for the entity type"""
    mapping = {
        'MARKET': 'market_id',
        'ZIP': 'zip_id', 
        'HEX': 'hex_id',
        'NEIGHBOURHOOD': 'neighborhood_id',
        'SITE': 'site_id'
    }
    return mapping.get(entity_type.upper())

@map_bp.route('/<entity_type>', methods=['GET'])
def get_all_entities(entity_type):
    """
    Get all geographic data for a specific entity type
    
    URL Parameters:
    - entity_type: one of 'market', 'zip', 'hex', 'neighbourhood', 'site'
    """
    try:
        # Validate entity type
        if not validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "message": f"Invalid entity type. Must be one of: MARKET, ZIP, HEX, NEIGHBOURHOOD, SITE"
            }), 400
        
        entity_type_upper = entity_type.upper()
        
        # Get database connection
        engine = get_db_connection()
        
        with engine.connect() as connection:
            # Query to get all geographic data for the entity type
            query = text("""
                SELECT 
                    gd.id,
                    gd.type,
                    gd.latitude,
                    gd.longitude,
                    gd.geo_polygon,
                    gd.demographic_id,
                    gd.created_at,
                    gd.updated_at
                FROM Geo_Data gd
                WHERE gd.type = :entity_type 
                AND gd.deleted_at IS NULL
                ORDER BY gd.id
            """)
            
            result = connection.execute(query, {
                "entity_type": entity_type_upper
            })
            
            records = result.fetchall()
            
            if not records:
                return jsonify({
                    "success": False,
                    "message": f"No geographic data found for entity type: {entity_type}",
                    "entity_type": entity_type_upper
                }), 404
            
            # Convert records to list of dictionaries
            data = []
            for record in records:
                record_dict = dict(record._mapping)
                # Parse JSON polygon if it exists
                if record_dict.get('geo_polygon'):
                    try:
                        record_dict['geo_polygon'] = json.loads(record_dict['geo_polygon'])
                    except (json.JSONDecodeError, TypeError):
                        record_dict['geo_polygon'] = None
                data.append(record_dict)
            
            return jsonify({
                "success": True,
                "data": data,
                "count": len(data),
                "entity_type": entity_type_upper,
                "message": f"Found {len(data)} geographic records for {entity_type_upper}"
            }), 200
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_all_entities: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error in get_all_entities: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500

@map_bp.route('/<entity_type>/<entity_id>', methods=['GET'])
def get_entity_by_id(entity_type, entity_id):
    """
    Get geographic data for a specific entity by ID
    
    URL Parameters:
    - entity_type: one of 'market', 'zip', 'hex', 'neighbourhood', 'site'
    - entity_id: the entity ID to search for
    """
    try:
        # Validate entity type
        if not validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "message": f"Invalid entity type. Must be one of: MARKET, ZIP, HEX, NEIGHBOURHOOD, SITE"
            }), 400
        
        entity_type_upper = entity_type.upper()
        entity_id_column = get_entity_id_column(entity_type_upper)
        
        if not entity_id_column:
            return jsonify({
                "success": False,
                "message": f"Invalid entity type: {entity_type}"
            }), 400
        
        # Get database connection
        engine = get_db_connection()
        
        with engine.connect() as connection:
            # Query to get geographic data for the specific entity
            query = text("""
                SELECT 
                    gd.id,
                    gd.type,
                    gd.latitude,
                    gd.longitude,
                    gd.geo_polygon,
                    gd.demographic_id,
                    gd.created_at,
                    gd.updated_at
                FROM Geo_Data gd
                WHERE gd.type = :entity_type 
                AND gd.demographic_id = :entity_id
                AND gd.deleted_at IS NULL
            """)
            result = connection.execute(query, {
                "entity_type": entity_type_upper,
                "entity_id": entity_id
            })
            
            records = result.fetchall()
            
            if not records:
                return jsonify({
                    "success": False,
                    "message": f"No geographic data found for {entity_type} ID: {entity_id}",
                    "entity_type": entity_type_upper,
                    "entity_id": entity_id
                }), 404
            
            # Convert records to list of dictionaries
            data = []
            for record in records:
                record_dict = dict(record._mapping)
                # Parse JSON polygon if it exists
                if record_dict.get('geo_polygon'):
                    try:
                        record_dict['geo_polygon'] = json.loads(record_dict['geo_polygon'])
                    except (json.JSONDecodeError, TypeError):
                        record_dict['geo_polygon'] = None
                data.append(record_dict)
            
            return jsonify({
                "success": True,
                "data": data,
                "count": len(data),
                "entity_type": entity_type_upper,
                "entity_id": entity_id,
                "message": f"Found {len(data)} geographic records for {entity_type_upper} ID: {entity_id}"
            }), 200
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_entity_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error in get_entity_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500

@map_bp.route('/<entity_type>/bounds', methods=['GET'])
def get_entities_by_bounds(entity_type):
    """
    Get geographic data for entities within specified bounds
    
    URL Parameters:
    - entity_type: one of 'market', 'zip', 'hex', 'neighbourhood', 'site'
    
    Query Parameters:
    - north: north boundary (latitude)
    - south: south boundary (latitude) 
    - east: east boundary (longitude)
    - west: west boundary (longitude)
    """
    try:
        # Validate entity type
        if not validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "message": f"Invalid entity type. Must be one of: MARKET, ZIP, HEX, NEIGHBOURHOOD, SITE"
            }), 400
        
        # Get query parameters
        north = request.args.get('north')
        south = request.args.get('south')
        east = request.args.get('east')
        west = request.args.get('west')
        
        # Validate required parameters
        if not all([north, south, east, west]):
            return jsonify({
                "success": False,
                "message": "All bounds parameters are required: north, south, east, west"
            }), 400
        
        # Validate numeric values
        try:
            north = float(north)
            south = float(south)
            east = float(east)
            west = float(west)
        except ValueError:
            return jsonify({
                "success": False,
                "message": "All bounds parameters must be valid numbers"
            }), 400
        
        # Validate bounds logic
        if north <= south:
            return jsonify({
                "success": False,
                "message": "North boundary must be greater than south boundary"
            }), 400
        
        if east <= west:
            return jsonify({
                "success": False,
                "message": "East boundary must be greater than west boundary"
            }), 400
        
        entity_type_upper = entity_type.upper()
        
        # Get database connection
        engine = get_db_connection()
        
        with engine.connect() as connection:
            # Query to get geographic data within bounds
            query = text("""
                SELECT 
                    gd.id,
                    gd.type,
                    gd.latitude,
                    gd.longitude,
                    gd.geo_polygon,
                    gd.demographic_id,
                    gd.created_at,
                    gd.updated_at
                FROM Geo_Data gd
                WHERE gd.type = :entity_type 
                AND gd.latitude BETWEEN :south AND :north
                AND gd.longitude BETWEEN :west AND :east
                AND gd.deleted_at IS NULL
                ORDER BY gd.id
            """)
            
            result = connection.execute(query, {
                "entity_type": entity_type_upper,
                "north": north,
                "south": south,
                "east": east,
                "west": west
            })
            
            records = result.fetchall()
            
            if not records:
                return jsonify({
                    "success": False,
                    "message": f"No geographic data found for {entity_type} within specified bounds",
                    "entity_type": entity_type_upper,
                    "bounds": {
                        "north": north,
                        "south": south,
                        "east": east,
                        "west": west
                    }
                }), 404
            
            # Convert records to list of dictionaries
            data = []
            for record in records:
                record_dict = dict(record._mapping)
                # Parse JSON polygon if it exists
                if record_dict.get('geo_polygon'):
                    try:
                        record_dict['geo_polygon'] = json.loads(record_dict['geo_polygon'])
                    except (json.JSONDecodeError, TypeError):
                        record_dict['geo_polygon'] = None
                data.append(record_dict)
            
            return jsonify({
                "success": True,
                "data": data,
                "count": len(data),
                "entity_type": entity_type_upper,
                "bounds": {
                    "north": north,
                    "south": south,
                    "east": east,
                    "west": west
                },
                "message": f"Found {len(data)} geographic records for {entity_type_upper} within bounds"
            }), 200
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_entities_by_bounds: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error in get_entities_by_bounds: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500

@map_bp.route('/available-types', methods=['GET'])
def get_available_entity_types():
    """Get list of available entity types"""
    types = ['MARKET', 'ZIP', 'HEX', 'NEIGHBOURHOOD', 'SITE']
    
    return jsonify({
        "success": True,
        "data": types,
        "count": len(types),
        "message": "Available entity types retrieved successfully"
    }), 200
