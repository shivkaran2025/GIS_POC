create schema if not exists gisdev;
use gisdev;

-- ==================================================
-- DEMOGRAPHIC DATA TABLES
-- ==================================================

-- ---------------------------------------------------------------------------------
-- Table: Geo_Hierarchy_Mapping
-- Purpose: Acts as a central mapping table to define the relationships between
-- different levels of the geographic hierarchy (Market -> Zip -> Neighborhood -> Hex -> Site).
-- ---------------------------------------------------------------------------------

CREATE TABLE if not exists Geo_Hierarchy_Mapping (
    -- Primary Key: A unique identifier for each mapping record.
    mapping_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Foreign Key IDs for each level of the hierarchy.
    site_id CHAR(36),
    neighborhood_id CHAR(36),
    hex_id CHAR(36),
    zip_code CHAR(36),
    market_id CHAR(36),
    -- site_active TINYINT(1),
    -- Standard audit columns for tracking record lifecycle.
    deleted_at TIMESTAMP NULL, -- Timestamp for soft deletes.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------------
-- Table: Geo_Data
-- Purpose: Stores the actual geographic data, such as coordinates and polygons,
-- for each entity in the hierarchy.
-- ---------------------------------------------------------------------------------

CREATE TABLE if not exists Geo_Data (
    -- Primary Key: A unique identifier for each geographic data record.
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Type of the geographic entity, linking it to a level in the hierarchy.
    type ENUM('MARKET','ZIP','HEX','NEIGHBOURHOOD','SITE'),

    -- Geographic coordinates.
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    -- Stores the geographic boundary as a JSON object (e.g., GeoJSON Polygon).
    geo_polygon JSON,

    -- Foreign Key: Links this geographic data back to a specific record in the hierarchy mapping table.    
    demographic_id BIGINT, 
    
    -- Standard audit columns for tracking record lifecycle.
    deleted_at TIMESTAMP NULL, -- Timestamp for soft deletes.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (demographic_id) REFERENCES Geo_Hierarchy_Mapping(mapping_id)
);

-- ---------------------------------------------------------------------------------
-- Table: KPI_Audit_Log
-- Purpose: A generic log table to track all changes (INSERT, UPDATE, DELETE)
-- made to the KPI fact tables for auditing and debugging purposes.
-- ---------------------------------------------------------------------------------

CREATE TABLE if not exists KPI_Audit_Log (
    -- Primary Key: A unique identifier for each audit log entry.
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Details about the change.
    table_name VARCHAR(100), -- The name of the table that was changed.
    record_uuid CHAR(36), -- The UUID of the record that was changed.
    action ENUM('INSERT','UPDATE','DELETE'), -- The type of action performed.

    -- JSON columns to store the state of the data before and after the change.
    old_values JSON,
    new_values JSON,

    -- Metadata about who made the change and when.
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- KPI TABLES 
-- These tables store time-series data for Key Performance Indicators (KPIs)
-- aggregated at different geographic levels.
-- ==================================================

CREATE TABLE if not exists site_kpi (
	-- Core identifiers for the record.
    id BIGINT AUTO_INCREMENT,
    site_id CHAR(36) NOT NULL,
    date_key DATE NOT NULL,

    -- KPI Metrics
    cap_dl_traffic_vol_mb_4g DOUBLE,
    cap_ul_traffic_vol_mb_4g DOUBLE,
    cap_avg_rrc_conn_ues_4g DOUBLE,
    cap_vonr_call_att_cnt_5g DOUBLE,
    avl_cell_avail_total_4g DOUBLE,
    avl_cell_avail_total_5g DOUBLE,
    cap_dl_prb_util_4g DOUBLE,
    cap_ul_prb_util_4g DOUBLE,
    cap_dl_prb_dtch_util_5g DOUBLE,
    cap_ul_prb_dtch_util_5g DOUBLE,
    cap_volte_erlang_4g DOUBLE,
    qual_ue_avg_sinr_pusch_4g DOUBLE,
    qual_ue_avg_sinr_pusch_5g DOUBLE,
    qual_avg_cqi_4g DOUBLE,
    qual_acc_rssi_pusch_4g DOUBLE,
    cap_dl_avg_ue_thruput_mbps_4g DOUBLE,
    cap_ul_avg_ue_thruput_mbps_4g DOUBLE,
    acc_volte_acc_fail_count_4g DOUBLE,
    acc_sa_access_succ_5g DOUBLE,
    cap_volte_call_succ_count_4g DOUBLE,
    ret_volte_drop_rate_4g DOUBLE,
    
    -- LLM output
    llm_insights TEXT,

    -- Audit fields
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id, site_id, date_key),
    UNIQUE KEY uq_site_date (site_id, date_key)
)
-- Partition biannually
PARTITION BY RANGE (YEAR(date_key)*2 + QUARTER(date_key) DIV 3) (
    PARTITION p_min VALUES LESS THAN (0),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);


CREATE TABLE if not exists Hex_Kpi (
	-- Core identifiers for the record.
    id BIGINT AUTO_INCREMENT,
    hex_id CHAR(36) NOT NULL,
    date_key DATE NOT NULL,

    -- KPI Metrics
    cap_dl_traffic_vol_mb_4g DOUBLE,
    cap_ul_traffic_vol_mb_4g DOUBLE,
    cap_avg_rrc_conn_ues_4g DOUBLE,
    cap_vonr_call_att_cnt_5g DOUBLE,
    avl_cell_avail_total_4g DOUBLE,
    avl_cell_avail_total_5g DOUBLE,
    cap_dl_prb_util_4g DOUBLE,
    cap_ul_prb_util_4g DOUBLE,
    cap_dl_prb_dtch_util_5g DOUBLE,
    cap_ul_prb_dtch_util_5g DOUBLE,
    cap_volte_erlang_4g DOUBLE,
    qual_ue_avg_sinr_pusch_4g DOUBLE,
    qual_ue_avg_sinr_pusch_5g DOUBLE,
    qual_avg_cqi_4g DOUBLE,
    qual_acc_rssi_pusch_4g DOUBLE,
    cap_dl_avg_ue_thruput_mbps_4g DOUBLE,
    cap_ul_avg_ue_thruput_mbps_4g DOUBLE,
    acc_volte_acc_fail_count_4g DOUBLE,
    acc_sa_access_succ_5g DOUBLE,
    cap_volte_call_succ_count_4g DOUBLE,
    ret_volte_drop_rate_4g DOUBLE,

    -- Audit fields
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id, hex_id, date_key),
    UNIQUE KEY uq_hex_date (hex_id, date_key)
)
-- Partition by Quarter
PARTITION BY RANGE (YEAR(date_key)*4 + QUARTER(date_key)) (
    PARTITION p_min VALUES LESS THAN (0),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);

CREATE TABLE if not exists Neighborhood_Kpi (
	-- Core identifiers for the record.
    id BIGINT AUTO_INCREMENT,
    neighborhood_id CHAR(36) NOT NULL,
    date_key DATE NOT NULL,

    -- KPI Metrics
    cap_dl_traffic_vol_mb_4g DOUBLE,
    cap_ul_traffic_vol_mb_4g DOUBLE,
    cap_avg_rrc_conn_ues_4g DOUBLE,
    cap_vonr_call_att_cnt_5g DOUBLE,
    avl_cell_avail_total_4g DOUBLE,
    avl_cell_avail_total_5g DOUBLE,
    cap_dl_prb_util_4g DOUBLE,
    cap_ul_prb_util_4g DOUBLE,
    cap_dl_prb_dtch_util_5g DOUBLE,
    cap_ul_prb_dtch_util_5g DOUBLE,
    cap_volte_erlang_4g DOUBLE,
    qual_ue_avg_sinr_pusch_4g DOUBLE,
    qual_ue_avg_sinr_pusch_5g DOUBLE,
    qual_avg_cqi_4g DOUBLE,
    qual_acc_rssi_pusch_4g DOUBLE,
    cap_dl_avg_ue_thruput_mbps_4g DOUBLE,
    cap_ul_avg_ue_thruput_mbps_4g DOUBLE,
    acc_volte_acc_fail_count_4g DOUBLE,
    acc_sa_access_succ_5g DOUBLE,
    cap_volte_call_succ_count_4g DOUBLE,
    ret_volte_drop_rate_4g DOUBLE,

    -- Audit fields
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id, neighborhood_id, date_key),
    UNIQUE KEY uq_neighborhood_date (neighborhood_id, date_key)
)
PARTITION BY RANGE (YEAR(date_key)) (
    PARTITION p_min VALUES LESS THAN (2020),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);


CREATE TABLE if not exists Zip_Kpi (
	-- Core identifiers for the record.
    id BIGINT AUTO_INCREMENT,
    zip_id CHAR(36) NOT NULL,
    date_key DATE NOT NULL,

    -- KPI Metrics
    cap_dl_traffic_vol_mb_4g DOUBLE,
    cap_ul_traffic_vol_mb_4g DOUBLE,
    cap_avg_rrc_conn_ues_4g DOUBLE,
    cap_vonr_call_att_cnt_5g DOUBLE,
    avl_cell_avail_total_4g DOUBLE,
    avl_cell_avail_total_5g DOUBLE,
    cap_dl_prb_util_4g DOUBLE,
    cap_ul_prb_util_4g DOUBLE,
    cap_dl_prb_dtch_util_5g DOUBLE,
    cap_ul_prb_dtch_util_5g DOUBLE,
    cap_volte_erlang_4g DOUBLE,
    qual_ue_avg_sinr_pusch_4g DOUBLE,
    qual_ue_avg_sinr_pusch_5g DOUBLE,
    qual_avg_cqi_4g DOUBLE,
    qual_acc_rssi_pusch_4g DOUBLE,
    cap_dl_avg_ue_thruput_mbps_4g DOUBLE,
    cap_ul_avg_ue_thruput_mbps_4g DOUBLE,
    acc_volte_acc_fail_count_4g DOUBLE,
    acc_sa_access_succ_5g DOUBLE,
    cap_volte_call_succ_count_4g DOUBLE,
    ret_volte_drop_rate_4g DOUBLE,

    -- Audit fields
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id, zip_id, date_key),
    UNIQUE KEY uq_zip_date (zip_id, date_key)
)
PARTITION BY RANGE (YEAR(date_key)) (
    PARTITION p_min VALUES LESS THAN (2020),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);


CREATE TABLE if not exists Market_Kpi (
	-- Core identifiers for the record.
    id BIGINT AUTO_INCREMENT,
    market_id CHAR(36) NOT NULL,
    date_key DATE NOT NULL,

    -- KPI Metrics
    cap_dl_traffic_vol_mb_4g DOUBLE,
    cap_ul_traffic_vol_mb_4g DOUBLE,
    cap_avg_rrc_conn_ues_4g DOUBLE,
    cap_vonr_call_att_cnt_5g DOUBLE,
    avl_cell_avail_total_4g DOUBLE,
    avl_cell_avail_total_5g DOUBLE,
    cap_dl_prb_util_4g DOUBLE,
    cap_ul_prb_util_4g DOUBLE,
    cap_dl_prb_dtch_util_5g DOUBLE,
    cap_ul_prb_dtch_util_5g DOUBLE,
    cap_volte_erlang_4g DOUBLE,
    qual_ue_avg_sinr_pusch_4g DOUBLE,
    qual_ue_avg_sinr_pusch_5g DOUBLE,
    qual_avg_cqi_4g DOUBLE,
    qual_acc_rssi_pusch_4g DOUBLE,
    cap_dl_avg_ue_thruput_mbps_4g DOUBLE,
    cap_ul_avg_ue_thruput_mbps_4g DOUBLE,
    acc_volte_acc_fail_count_4g DOUBLE,
    acc_sa_access_succ_5g DOUBLE,
    cap_volte_call_succ_count_4g DOUBLE,
    ret_volte_drop_rate_4g DOUBLE,

    -- Audit fields
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id, market_id, date_key),
    UNIQUE KEY uq_market_date (market_id, date_key)
)
-- No partitioning required
;

