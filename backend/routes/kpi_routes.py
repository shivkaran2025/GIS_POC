from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint for KPI routes
kpi_bp = Blueprint('kpi', __name__, url_prefix='/api/kpi')

def get_db_connection():
    """Get database connection from the main app"""
    from flask import current_app
    return current_app.extensions['sqlalchemy'].engine

@kpi_bp.route('/count/<id_type>/<id_value>', methods=['GET'])
def get_count_kpi_by_type_id(id_type, id_value):
    """Get count of KPI records by type and id"""
    valid_id_types = ['market', 'zip', 'hex', 'neighborhood', 'site']
    
    if id_type.lower() not in valid_id_types:
        return jsonify({
            "success": False,
            "message": f"Invalid ID type. Must be one of: {', '.join(valid_id_types)}"
        }), 400
    
    try:
        engine = get_db_connection()
        table_name = "geo_hierarchy_mapping" 
        column_name = "zip_code" if id_type == "zip" else f"{id_type.lower()}_id"

        with engine.connect() as connection:
            query = text(f"SELECT DISTINCT COUNT({column_name}) FROM {table_name} WHERE {column_name} = :id_value")
            result = connection.execute(query, {"id_value": id_value})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "id_type": id_type,
                    "id_value": id_value,
                    "count": len(data),
                    "message": f"Found {data} for {id_type.title()} KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No {id_type.title()} KPI records found for {column_name}: {id_value}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_kpi_by_type_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500



@kpi_bp.route('/market/<int:record_id>', methods=['GET'])
def get_market_kpi_by_id(record_id):
    """Get market KPI record by ID"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM market_kpi WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": "Market KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"Market KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_market_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/market/market_id/<market_id>', methods=['GET'])
def get_market_kpi_by_market_id(market_id):
    """Get market KPI records by market_id"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT market_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM market_kpi WHERE market_id = :market_id")
            result = connection.execute(query, {"market_id": market_id})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} market KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No market KPI records found for market_id: {market_id}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_market_kpi_by_market_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/zip/<int:record_id>', methods=['GET'])
def get_zip_kpi_by_id(record_id):
    """Get ZIP KPI record by ID"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM zip_kpi WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": "ZIP KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"ZIP KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_zip_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/zip/zip_id/<zip_id>', methods=['GET'])
def get_zip_kpi_by_zip_id(zip_id):
    """Get ZIP KPI records by zip_id"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT zip_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM zip_kpi WHERE zip_id = :zip_id")
            result = connection.execute(query, {"zip_id": zip_id})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} ZIP KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No ZIP KPI records found for zip_id: {zip_id}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_zip_kpi_by_zip_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/hex/<int:record_id>', methods=['GET'])
def get_hex_kpi_by_id(record_id):
    """Get HEX KPI record by ID"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM hex_kpi WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": "HEX KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"HEX KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_hex_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/hex/hex_id/<hex_id>', methods=['GET'])
def get_hex_kpi_by_hex_id(hex_id):
    """Get HEX KPI records by hex_id"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT hex_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM hex_kpi WHERE hex_id = :hex_id")
            result = connection.execute(query, {"hex_id": hex_id})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} HEX KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No HEX KPI records found for hex_id: {hex_id}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_hex_kpi_by_hex_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/neighborhood/<int:record_id>', methods=['GET'])
def get_neighborhood_kpi_by_id(record_id):
    """Get neighborhood KPI record by ID"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM neighborhood_kpi WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": "Neighborhood KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"Neighborhood KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_neighborhood_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/neighborhood/neighborhood_id/<neighborhood_id>', methods=['GET'])
def get_neighborhood_kpi_by_neighborhood_id(neighborhood_id):
    """Get neighborhood KPI records by neighborhood_id"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT neighborhood_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM neighborhood_kpi WHERE neighborhood_id = :neighborhood_id")
            result = connection.execute(query, {"neighborhood_id": neighborhood_id})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} neighborhood KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No neighborhood KPI records found for neighborhood_id: {neighborhood_id}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_neighborhood_kpi_by_neighborhood_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/site/<int:record_id>', methods=['GET'])
def get_site_kpi_by_id(record_id):
    """Get site KPI record by ID"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM site_kpi WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": "Site KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"Site KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_site_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

@kpi_bp.route('/site/site_id/<site_id>', methods=['GET'])
def get_site_kpi_by_site_id(site_id):
    """Get site KPI records by site_id"""
    try:
        engine = get_db_connection()
        with engine.connect() as connection:
            query = text("SELECT site_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM site_kpi WHERE site_id = :site_id")
            result = connection.execute(query, {"site_id": site_id})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} site KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No site KPI records found for site_id: {site_id}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_site_kpi_by_site_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

# Generic route for all KPI types by *_id (must come before the generic ID route)
@kpi_bp.route('/<kpi_type>/<id_type>_id/<id_value>', methods=['GET'])
def get_kpi_by_type_id(kpi_type, id_type, id_value):
    """Generic route to get KPI records by *_id for any KPI type"""
    valid_types = ['market', 'zip', 'hex', 'neighborhood', 'site']
    valid_id_types = ['market', 'zip', 'hex', 'neighborhood', 'site']
    
    if kpi_type.lower() not in valid_types:
        return jsonify({
            "success": False,
            "message": f"Invalid KPI type. Must be one of: {', '.join(valid_types)}"
        }), 400
    
    if id_type.lower() not in valid_id_types:
        return jsonify({
            "success": False,
            "message": f"Invalid ID type. Must be one of: {', '.join(valid_id_types)}"
        }), 400
    
    try:
        engine = get_db_connection()
        table_name = f"{kpi_type.lower()}_kpi"
        column_name = f"{id_type.lower()}_id"
        
        with engine.connect() as connection:
            query = text(f"SELECT id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM {table_name} WHERE {column_name} = :id_value")
            result = connection.execute(query, {"id_value": id_value})
            records = result.fetchall()
            
            if records:
                data = [dict(record._mapping) for record in records]
                return jsonify({
                    "success": True,
                    "data": data,
                    "count": len(data),
                    "message": f"Found {len(data)} {kpi_type.title()} KPI records"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"No {kpi_type.title()} KPI records found for {id_type}_id: {id_value}"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_kpi_by_type_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500

# Generic route for all KPI types by numeric ID (must come last)
@kpi_bp.route('/<kpi_type>/<int:record_id>', methods=['GET'])
def get_kpi_by_id(kpi_type, record_id):
    """Generic route to get KPI record by ID for any KPI type"""
    valid_types = ['market', 'zip', 'hex', 'neighborhood', 'site']
    
    if kpi_type.lower() not in valid_types:
        return jsonify({
            "success": False,
            "message": f"Invalid KPI type. Must be one of: {', '.join(valid_types)}"
        }), 400
    
    try:
        engine = get_db_connection()
        table_name = f"{kpi_type.lower()}_kpi"
        
        with engine.connect() as connection:
            query = text(f"SELECT {kpi_type.lower()}_id, date_key, ret_volte_drop_rate_4g, qual_avg_cqi_4g, qual_ue_avg_sinr_pusch_5g, qual_ue_avg_sinr_pusch_4g FROM {table_name} WHERE id = :record_id")
            result = connection.execute(query, {"record_id": record_id})
            record = result.fetchone()
            
            if record:
                return jsonify({
                    "success": True,
                    "data": dict(record._mapping),
                    "message": f"{kpi_type.title()} KPI record found"
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": f"{kpi_type.title()} KPI record with ID {record_id} not found"
                }), 404
                
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_kpi_by_id: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500
