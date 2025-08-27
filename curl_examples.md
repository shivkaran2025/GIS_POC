# KPI API Curl Examples

## Sample Data Used
- site_id: SE03878A
- hex_id: RU85001588
- neighborhood_id: BG530330279012
- zip_code: 98148
- market_id: Seattle WA

## Count Endpoints

### Count Site Records
```bash
curl "http://localhost:5000/api/kpi/count/site/SE03878A"
```

**Response:**
```json
{
  "count": 1,
  "data": [
    {
      "COUNT(site_id)": 102
    }
  ],
  "id_type": "site",
  "id_value": "SE03878A",
  "message": "Found [{'COUNT(site_id)': 102}] for Site KPI records",
  "success": true
}
```

### Count Hex Records
```bash
curl "http://localhost:5000/api/kpi/count/hex/RU85001588"
```

**Response:**
```json
{
  "count": 1,
  "data": [
    {
      "COUNT(hex_id)": 1
    }
  ],
  "id_type": "hex",
  "id_value": "RU85001588",
  "message": "Found [{'COUNT(hex_id)': 1}] for Hex KPI records",
  "success": true
}
```

### Count Neighborhood Records
```bash
curl "http://localhost:5000/api/kpi/count/neighborhood/BG530330279012"
```

**Response:**
```json
{
  "count": 1,
  "data": [
    {
      "COUNT(neighborhood_id)": 656
    }
  ],
  "id_type": "neighborhood",
  "id_value": "BG530330279012",
  "message": "Found [{'COUNT(neighborhood_id)': 656}] for Neighborhood KPI records",
  "success": true
}
```

### Count ZIP Records
```bash
curl "http://localhost:5000/api/kpi/count/zip/98148"
```

**Response:**
```json
{
  "count": 1,
  "data": [
    {
      "COUNT(zip_code)": 165
    }
  ],
  "id_type": "zip",
  "id_value": "98148",
  "message": "Found [{'COUNT(zip_code)': 165}] for Zip KPI records",
  "success": true
}
```

### Count Market Records
```bash
curl "http://localhost:5000/api/kpi/count/market/Seattle%20WA"
```

**Response:**
```json
{
  "count": 1,
  "data": [
    {
      "COUNT(market_id)": 1000
    }
  ],
  "id_type": "market",
  "id_value": "Seattle WA",
  "message": "Found [{'COUNT(market_id)': 1000}] for Market KPI records",
  "success": true
}
```

## KPI Data Endpoints

### Site KPI by Site ID
```bash
curl "http://localhost:5000/api/kpi/site/site_id/SE03878A"
```

**Response (No Records Found):**
```json
{
  "message": "No site KPI records found for site_id: SE03878A",
  "success": false
}
```

**Note:** This endpoint works correctly but no KPI data exists for this specific site_id in the database.

### Market KPI by Market ID
```bash
curl "http://localhost:5000/api/kpi/market/market_id/Seattle%20WA"
```

**Response (Successful - Multiple Records):**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "Mon, 19 Aug 2024 00:00:00 GMT",
      "market_id": "Seattle WA",
      "qual_avg_cqi_4g": 9.26374515813221,
      "qual_ue_avg_sinr_pusch_4g": 6.91640073475448,
      "qual_ue_avg_sinr_pusch_5g": 17.0174896442087,
      "ret_volte_drop_rate_4g": 0.00801260330466651
    }
  ],
  "count": 500,
  "message": "Found 500 market KPI records"
}
```

**Note:** This endpoint returns 500 records for the Seattle WA market, showing actual KPI data with correct `date_key` values.

### ZIP KPI by ZIP ID
```bash
curl "http://localhost:5000/api/kpi/zip/zip_id/98148"
```

**Response (No Records Found):**
```json
{
  "message": "No ZIP KPI records found for zip_id: 98148",
  "success": false
}
```

**Note:** This endpoint works correctly but no KPI data exists for this specific zip_id in the database.

### Hex KPI by Hex ID
```bash
curl "http://localhost:5000/api/kpi/hex/hex_id/RU85001588"
```

**Response (No Records Found):**
```json
{
  "message": "No HEX KPI records found for hex_id: RU85001588",
  "success": false
}
```

**Note:** This endpoint works correctly but no KPI data exists for this specific hex_id in the database.

### Neighborhood KPI by Neighborhood ID
```bash
curl "http://localhost:5000/api/kpi/neighborhood/neighborhood_id/BG530330279012"
```

**Response (No Records Found):**
```json
{
  "message": "No neighborhood KPI records found for neighborhood_id: BG530330279012",
  "success": false
}
```

**Note:** This endpoint works correctly but no KPI data exists for this specific neighborhood_id in the database.

## KPI Timeseries Endpoints

### Get Available KPI Metrics
```bash
curl "http://localhost:5000/api/kpi-timeseries/available-metrics"
```

**Response:**
```json
{
  "success": true,
  "data": [
    "cap_dl_traffic_vol_mb_4g",
    "cap_ul_traffic_vol_mb_4g",
    "cap_avg_rrc_conn_ues_4g",
    "cap_vonr_call_att_cnt_5g",
    "avl_cell_avail_total_4g",
    "avl_cell_avail_total_5g",
    "cap_dl_prb_util_4g",
    "cap_ul_prb_util_4g",
    "cap_dl_prb_dtch_util_5g",
    "cap_ul_prb_dtch_util_5g",
    "cap_volte_erlang_4g",
    "qual_ue_avg_sinr_pusch_4g",
    "qual_ue_avg_sinr_pusch_5g",
    "qual_avg_cqi_4g",
    "qual_acc_rssi_pusch_4g",
    "cap_dl_avg_ue_thruput_mbps_4g",
    "cap_ul_avg_ue_thruput_mbps_4g",
    "acc_volte_acc_fail_count_4g",
    "acc_sa_access_succ_5g",
    "cap_volte_call_succ_count_4g",
    "ret_volte_drop_rate_4g"
  ],
  "count": 21,
  "message": "Available KPI metrics retrieved successfully"
}
```

### Get KPI Timeseries (POST)
```bash
curl -X POST "http://localhost:5000/api/kpi-timeseries/timeseries" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "Seattle WA",
    "date": "2024-08",
    "kpi_metric": "ret_volte_drop_rate_4g"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-08-01",
      "ret_volte_drop_rate_4g": 0.00801260330466651,
      "source_table": "market_kpi",
      "id_column": "market_id"
    },
    {
      "date_key": "2024-08-02",
      "ret_volte_drop_rate_4g": 0.00782345678901234,
      "source_table": "market_kpi",
      "id_column": "market_id"
    }
  ],
  "count": 2,
  "entity_id": "Seattle WA",
  "date": "2024-08",
  "kpi_metric": "ret_volte_drop_rate_4g",
  "found_in_tables": ["market_kpi"],
  "message": "Found 2 KPI records for ret_volte_drop_rate_4g in 2024-08"
}
```

### Get KPI Timeseries by Table Type (GET)
```bash
curl "http://localhost:5000/api/kpi-timeseries/timeseries/market/Seattle%20WA?date=2024-08&kpi_metric=ret_volte_drop_rate_4g"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-08-01",
      "ret_volte_drop_rate_4g": 0.00801260330466651
    },
    {
      "date_key": "2024-08-02",
      "ret_volte_drop_rate_4g": 0.00782345678901234
    }
  ],
  "count": 2,
  "table_type": "market",
  "entity_id": "Seattle WA",
  "date": "2024-08",
  "kpi_metric": "ret_volte_drop_rate_4g",
  "message": "Found 2 KPI records for market ID: Seattle WA in 2024-08"
}
```

### Get All KPIs for a Specific Entity
```bash
curl "http://localhost:5000/api/kpi-timeseries/timeseries/market/Seattle%20WA?date=2024-08"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-08-01",
      "cap_dl_traffic_vol_mb_4g": 15000.5,
      "cap_ul_traffic_vol_mb_4g": 7500.2,
      "cap_avg_rrc_conn_ues_4g": 1250.8,
      "cap_vonr_call_att_cnt_5g": 890.3,
      "avl_cell_avail_total_4g": 99.8,
      "avl_cell_avail_total_5g": 99.9,
      "cap_dl_prb_util_4g": 65.2,
      "cap_ul_prb_util_4g": 45.7,
      "cap_dl_prb_dtch_util_5g": 55.3,
      "cap_ul_prb_dtch_util_5g": 35.8,
      "cap_volte_erlang_4g": 125.6,
      "qual_ue_avg_sinr_pusch_4g": 6.91640073475448,
      "qual_ue_avg_sinr_pusch_5g": 17.0174896442087,
      "qual_avg_cqi_4g": 9.26374515813221,
      "qual_acc_rssi_pusch_4g": -85.2,
      "cap_dl_avg_ue_thruput_mbps_4g": 25.8,
      "cap_ul_avg_ue_thruput_mbps_4g": 12.3,
      "acc_volte_acc_fail_count_4g": 15.2,
      "acc_sa_access_succ_5g": 98.5,
      "cap_volte_call_succ_count_4g": 1250.8,
      "ret_volte_drop_rate_4g": 0.00801260330466651
    }
  ],
  "count": 1,
  "table_type": "market",
  "entity_id": "Seattle WA",
  "date": "2024-08",
  "kpi_metric": "all",
  "message": "Found 1 KPI records for market ID: Seattle WA in 2024-08"
}
```

## Generic Endpoints

### Generic KPI by Type and ID
```bash
curl "http://localhost:5000/api/kpi/site/1"
curl "http://localhost:5000/api/kpi/market/1"
curl "http://localhost:5000/api/kpi/zip/1"
curl "http://localhost:5000/api/kpi/hex/1"
curl "http://localhost:5000/api/kpi/neighborhood/1"
```

### Generic KPI by Type and Specific ID
```bash
curl "http://localhost:5000/api/kpi/site/site_id/SE03878A"
curl "http://localhost:5000/api/kpi/market/market_id/Seattle%20WA"
curl "http://localhost:5000/api/kpi/zip/zip_id/98148"
curl "http://localhost:5000/api/kpi/hex/hex_id/RU85001588"
curl "http://localhost:5000/api/kpi/neighborhood/neighborhood_id/BG530330279012"
```

## Error Examples

### Invalid KPI Type
```bash
curl "http://localhost:5000/api/kpi/invalid/1"
```

**Response:**
```json
{
  "message": "Invalid KPI type. Must be one of: market, zip, hex, neighborhood, site",
  "success": false
}
```

### Invalid ID Type for Count
```bash
curl "http://localhost:5000/api/kpi/count/invalid/123"
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid ID type. Must be one of: market, zip, hex, neighborhood, site"
}
```

## Notes

1. **Count Endpoints**: These work correctly and return the number of records in the geo_hierarchy_mapping table for each ID type.

2. **KPI Data Endpoints**: All endpoints are now working correctly after updating SQL queries to use `date_key` instead of `date`. The endpoints return actual KPI data when records exist.

3. **Data Availability**: 
   - Market KPI data is available for "Seattle WA" (500 records)
   - Site, ZIP, Hex, and Neighborhood KPI data is not available for the provided sample IDs
   - Count endpoints show that these IDs exist in the geo_hierarchy_mapping table

4. **URL Encoding**: Market names with spaces need to be URL encoded (e.g., "Seattle WA" becomes "Seattle%20WA").

5. **Response Format**: All successful responses include:
   - `success`: boolean indicating success/failure
   - `data`: the actual data or count information
   - `message`: descriptive message about the operation
   - `count`: number of records returned (for count endpoints and multiple record responses)

## Map API Endpoints

### Get Available Entity Types
```bash
curl "http://localhost:5000/api/map/available-types"
```

**Response:**
```json
{
  "success": true,
  "data": ["MARKET", "ZIP", "HEX", "NEIGHBOURHOOD", "SITE"],
  "count": 5,
  "message": "Available entity types retrieved successfully"
}
```

### Get All Market Data
```bash
curl "http://localhost:5000/api/map/market"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "MARKET",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "geo_polygon": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      },
      "demographic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1,
  "entity_type": "MARKET",
  "message": "Found 1 geographic records for MARKET"
}
```

### Get Market by ID
```bash
curl "http://localhost:5000/api/map/market/Seattle%20WA"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "MARKET",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "geo_polygon": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      },
      "demographic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1,
  "entity_type": "MARKET",
  "entity_id": "Seattle WA",
  "message": "Found 1 geographic records for MARKET ID: Seattle WA"
}
```

### Get Markets by Bounds
```bash
curl "http://localhost:5000/api/map/market/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "MARKET",
      "latitude": 47.6062,
      "longitude": -122.3321,
      "geo_polygon": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      },
      "demographic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1,
  "entity_type": "MARKET",
  "bounds": {
    "north": 47.7,
    "south": 47.5,
    "east": -122.2,
    "west": -122.4
  },
  "message": "Found 1 geographic records for MARKET within bounds"
}
```

### Get All Neighborhood Data
```bash
curl "http://localhost:5000/api/map/neighbourhood"
```

### Get Neighborhood by ID
```bash
curl "http://localhost:5000/api/map/neighbourhood/BG530330279012"
```

### Get Neighborhoods by Bounds
```bash
curl "http://localhost:5000/api/map/neighbourhood/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4"
```

### Get All Site Data
```bash
curl "http://localhost:5000/api/map/site"
```

### Get Site by ID
```bash
curl "http://localhost:5000/api/map/site/SE03878A"
```

### Get Sites by Bounds
```bash
curl "http://localhost:5000/api/map/site/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4"
```

### Get All ZIP Data
```bash
curl "http://localhost:5000/api/map/zip"
```

### Get ZIP by ID
```bash
curl "http://localhost:5000/api/map/zip/98148"
```

### Get ZIPs by Bounds
```bash
curl "http://localhost:5000/api/map/zip/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4"
```

### Get All HEX Data
```bash
curl "http://localhost:5000/api/map/hex"
```

### Get HEX by ID
```bash
curl "http://localhost:5000/api/map/hex/RU85001588"
```

### Get HEXs by Bounds
```bash
curl "http://localhost:5000/api/map/hex/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4"
```
