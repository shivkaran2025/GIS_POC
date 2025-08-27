from flask import Blueprint, jsonify, request
from sqlalchemy import text, and_, extract
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint for KPI timeseries routes
kpi_timeseries_bp = Blueprint('kpi_timeseries', __name__, url_prefix='/api/kpi-timeseries')

def get_db_connection():
    """Get database connection from the main app"""
    from flask import current_app
    return current_app.extensions['sqlalchemy'].engine

def validate_kpi_metric(kpi_metric):
    """Validate if the KPI metric exists in the schema"""
    valid_kpi_metrics = [
        'cap_dl_traffic_vol_mb_4g',
        'cap_ul_traffic_vol_mb_4g',
        'cap_avg_rrc_conn_ues_4g',
        'cap_vonr_call_att_cnt_5g',
        'avl_cell_avail_total_4g',
        'avl_cell_avail_total_5g',
        'cap_dl_prb_util_4g',
        'cap_ul_prb_util_4g',
        'cap_dl_prb_dtch_util_5g',
        'cap_ul_prb_dtch_util_5g',
        'cap_volte_erlang_4g',
        'qual_ue_avg_sinr_pusch_4g',
        'qual_ue_avg_sinr_pusch_5g',
        'qual_avg_cqi_4g',
        'qual_acc_rssi_pusch_4g',
        'cap_dl_avg_ue_thruput_mbps_4g',
        'cap_ul_avg_ue_thruput_mbps_4g',
        'acc_volte_acc_fail_count_4g',
        'acc_sa_access_succ_5g',
        'cap_volte_call_succ_count_4g',
        'ret_volte_drop_rate_4g'
    ]
    return kpi_metric in valid_kpi_metrics

def determine_table_from_entity_id(entity_id):
    """Determine which KPI table to query based on entity ID pattern"""
    # This is a simplified approach - you might want to enhance this logic
    # based on your actual entity ID patterns
    
    # For now, we'll check all tables and return the first one that has the entity_id
    # This could be optimized by having specific patterns for each entity type
    
    tables = ['site_kpi', 'hex_kpi', 'neighborhood_kpi', 'zip_kpi', 'market_kpi']
    id_columns = ['site_id', 'hex_id', 'neighborhood_id', 'zip_id', 'market_id']
    
    return tables, id_columns

@kpi_timeseries_bp.route('/timeseries', methods=['POST'])
def get_kpi_timeseries():
    """
    Get KPI timeseries data for a specific entity, date range, and KPI metric
    
    Expected JSON payload:
    {
        "entity_id": "uuid-string",
        "date": "2024-01",  # Format: YYYY-MM
        "kpi_metric": "ret_volte_drop_rate_4g"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400
        
        # Extract and validate parameters
        entity_id = data.get('entity_id')
        date_str = data.get('date')
        kpi_metric = data.get('kpi_metric')
        
        if not entity_id:
            return jsonify({
                "success": False,
                "message": "entity_id is required"
            }), 400
        
        if not date_str:
            return jsonify({
                "success": False,
                "message": "date is required (format: YYYY-MM)"
            }), 400
        
        if not kpi_metric:
            return jsonify({
                "success": False,
                "message": "kpi_metric is required"
            }), 400
        
        # Validate date format
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m')
            year = date_obj.year
            month = date_obj.month
        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid date format. Use YYYY-MM (e.g., 2024-01)"
            }), 400
        
        # Validate KPI metric
        if not validate_kpi_metric(kpi_metric):
            return jsonify({
                "success": False,
                "message": f"Invalid KPI metric: {kpi_metric}"
            }), 400
        
        # Get database connection
        engine = get_db_connection()
        
        # Define tables and their corresponding ID columns
        tables = ['site_kpi', 'hex_kpi', 'neighborhood_kpi', 'zip_kpi', 'market_kpi']
        id_columns = ['site_id', 'hex_id', 'neighborhood_id', 'zip_id', 'market_id']
        
        all_results = []
        found_in_tables = []
        
        with engine.connect() as connection:
            # Check each table for the entity_id
            for table, id_column in zip(tables, id_columns):
                try:
                    # Query to find records for the entity_id in the specified month/year
                    query = text(f"""
                        SELECT 
                            date_key,
                            {kpi_metric},
                            '{table}' as source_table,
                            '{id_column}' as id_column
                        FROM {table} 
                        WHERE {id_column} = :entity_id 
                        AND YEAR(date_key) = :year 
                        AND MONTH(date_key) = :month
                        AND deleted_at IS NULL
                        ORDER BY date_key
                    """)
                    
                    result = connection.execute(query, {
                        "entity_id": entity_id,
                        "year": year,
                        "month": month
                    })
                    
                    records = result.fetchall()
                    
                    if records:
                        table_results = [dict(record._mapping) for record in records]
                        all_results.extend(table_results)
                        found_in_tables.append(table)
                        
                except SQLAlchemyError as e:
                    logger.warning(f"Error querying {table}: {str(e)}")
                    continue
        
        if not all_results:
            return jsonify({
                "success": False,
                "message": f"No KPI data found for entity_id: {entity_id} in {date_str}",
                "entity_id": entity_id,
                "date": date_str,
                "kpi_metric": kpi_metric
            }), 404
        
        # Sort results by date
        all_results.sort(key=lambda x: x['date_key'])
        
        return jsonify({
            "success": True,
            "data": all_results,
            "count": len(all_results),
            "entity_id": entity_id,
            "date": date_str,
            "kpi_metric": kpi_metric,
            "found_in_tables": found_in_tables,
            "message": f"Found {len(all_results)} KPI records for {kpi_metric} in {date_str}"
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_kpi_timeseries: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500

@kpi_timeseries_bp.route('/timeseries/<table_type>/<entity_id>', methods=['GET'])
def get_kpi_timeseries_by_table(table_type, entity_id):
    """
    Get KPI timeseries data for a specific table type and entity ID
    
    URL Parameters:
    - table_type: one of 'site', 'hex', 'neighborhood', 'zip', 'market'
    - entity_id: the entity ID to search for
    
    Query Parameters:
    - date: date in YYYY-MM format (optional, defaults to current month)
    - kpi_metric: specific KPI metric to retrieve (optional, returns all if not specified)
    """
    try:
        # Validate table type
        valid_tables = ['site', 'hex', 'neighborhood', 'zip', 'market']
        if table_type.lower() not in valid_tables:
            return jsonify({
                "success": False,
                "message": f"Invalid table type. Must be one of: {', '.join(valid_tables)}"
            }), 400
        
        # Get query parameters
        date_str = request.args.get('date')
        kpi_metric = request.args.get('kpi_metric')
        
        # Set default date to current month if not provided
        if not date_str:
            current_date = datetime.now()
            date_str = current_date.strftime('%Y-%m')
        
        # Validate date format
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m')
            year = date_obj.year
            month = date_obj.month
        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid date format. Use YYYY-MM (e.g., 2024-01)"
            }), 400
        
        # Validate KPI metric if provided
        if kpi_metric and not validate_kpi_metric(kpi_metric):
            return jsonify({
                "success": False,
                "message": f"Invalid KPI metric: {kpi_metric}"
            }), 400
        
        # Get database connection
        engine = get_db_connection()
        
        # Determine table name and ID column
        table_name = f"{table_type.lower()}_kpi"
        id_column = f"{table_type.lower()}_id"
        
        # Build query based on whether kpi_metric is specified
        if kpi_metric:
            select_columns = f"date_key, {kpi_metric}"
        else:
            # Select all KPI metrics
            select_columns = """
                date_key,
                cap_dl_traffic_vol_mb_4g,
                cap_ul_traffic_vol_mb_4g,
                cap_avg_rrc_conn_ues_4g,
                cap_vonr_call_att_cnt_5g,
                avl_cell_avail_total_4g,
                avl_cell_avail_total_5g,
                cap_dl_prb_util_4g,
                cap_ul_prb_util_4g,
                cap_dl_prb_dtch_util_5g,
                cap_ul_prb_dtch_util_5g,
                cap_volte_erlang_4g,
                qual_ue_avg_sinr_pusch_4g,
                qual_ue_avg_sinr_pusch_5g,
                qual_avg_cqi_4g,
                qual_acc_rssi_pusch_4g,
                cap_dl_avg_ue_thruput_mbps_4g,
                cap_ul_avg_ue_thruput_mbps_4g,
                acc_volte_acc_fail_count_4g,
                acc_sa_access_succ_5g,
                cap_volte_call_succ_count_4g,
                ret_volte_drop_rate_4g
            """
        
        with engine.connect() as connection:
            query = text(f"""
                SELECT {select_columns}
                FROM {table_name} 
                WHERE {id_column} = :entity_id 
                AND YEAR(date_key) = :year 
                AND MONTH(date_key) = :month
                AND deleted_at IS NULL
                ORDER BY date_key
            """)
            
            result = connection.execute(query, {
                "entity_id": entity_id,
                "year": year,
                "month": month
            })
            
            records = result.fetchall()
            
            if not records:
                return jsonify({
                    "success": False,
                    "message": f"No KPI data found for {table_type} ID: {entity_id} in {date_str}",
                    "table_type": table_type,
                    "entity_id": entity_id,
                    "date": date_str
                }), 404
            
            data = [dict(record._mapping) for record in records]
            
            return jsonify({
                "success": True,
                "data": data,
                "count": len(data),
                "table_type": table_type,
                "entity_id": entity_id,
                "date": date_str,
                "kpi_metric": kpi_metric if kpi_metric else "all",
                "message": f"Found {len(data)} KPI records for {table_type} ID: {entity_id} in {date_str}"
            }), 200
            
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_kpi_timeseries_by_table: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error in get_kpi_timeseries_by_table: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500

@kpi_timeseries_bp.route('/available-metrics', methods=['GET'])
def get_available_kpi_metrics():
    """Get list of available KPI metrics"""
    metrics = [
        'cap_dl_traffic_vol_mb_4g',
        'cap_ul_traffic_vol_mb_4g',
        'cap_avg_rrc_conn_ues_4g',
        'cap_vonr_call_att_cnt_5g',
        'avl_cell_avail_total_4g',
        'avl_cell_avail_total_5g',
        'cap_dl_prb_util_4g',
        'cap_ul_prb_util_4g',
        'cap_dl_prb_dtch_util_5g',
        'cap_ul_prb_dtch_util_5g',
        'cap_volte_erlang_4g',
        'qual_ue_avg_sinr_pusch_4g',
        'qual_ue_avg_sinr_pusch_5g',
        'qual_avg_cqi_4g',
        'qual_acc_rssi_pusch_4g',
        'cap_dl_avg_ue_thruput_mbps_4g',
        'cap_ul_avg_ue_thruput_mbps_4g',
        'acc_volte_acc_fail_count_4g',
        'acc_sa_access_succ_5g',
        'cap_volte_call_succ_count_4g',
        'ret_volte_drop_rate_4g'
    ]
    
    return jsonify({
        "success": True,
        "data": metrics,
        "count": len(metrics),
        "message": "Available KPI metrics retrieved successfully"
    }), 200
