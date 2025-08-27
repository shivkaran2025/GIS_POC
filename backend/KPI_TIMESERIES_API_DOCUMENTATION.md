# KPI Timeseries API Documentation

## Overview

The KPI Timeseries API provides endpoints to retrieve time-series KPI data from the 5 KPI tables (site_kpi, hex_kpi, neighborhood_kpi, zip_kpi, market_kpi) based on entity ID, date range (month/year), and specific KPI metrics.

## Base URL

```
http://localhost:5000/api/kpi-timeseries
```

## Available KPI Metrics

The following KPI metrics are available across all tables:

- `cap_dl_traffic_vol_mb_4g` - Downlink traffic volume (MB) for 4G
- `cap_ul_traffic_vol_mb_4g` - Uplink traffic volume (MB) for 4G
- `cap_avg_rrc_conn_ues_4g` - Average RRC connected UEs for 4G
- `cap_vonr_call_att_cnt_5g` - VoNR call attempt count for 5G
- `avl_cell_avail_total_4g` - Cell availability total for 4G
- `avl_cell_avail_total_5g` - Cell availability total for 5G
- `cap_dl_prb_util_4g` - Downlink PRB utilization for 4G
- `cap_ul_prb_util_4g` - Uplink PRB utilization for 4G
- `cap_dl_prb_dtch_util_5g` - Downlink PRB DTCH utilization for 5G
- `cap_ul_prb_dtch_util_5g` - Uplink PRB DTCH utilization for 5G
- `cap_volte_erlang_4g` - VoLTE erlang for 4G
- `qual_ue_avg_sinr_pusch_4g` - UE average SINR PUSCH for 4G
- `qual_ue_avg_sinr_pusch_5g` - UE average SINR PUSCH for 5G
- `qual_avg_cqi_4g` - Average CQI for 4G
- `qual_acc_rssi_pusch_4g` - Access RSSI PUSCH for 4G
- `cap_dl_avg_ue_thruput_mbps_4g` - Downlink average UE throughput (Mbps) for 4G
- `cap_ul_avg_ue_thruput_mbps_4g` - Uplink average UE throughput (Mbps) for 4G
- `acc_volte_acc_fail_count_4g` - VoLTE access fail count for 4G
- `acc_sa_access_succ_5g` - SA access success for 5G
- `cap_volte_call_succ_count_4g` - VoLTE call success count for 4G
- `ret_volte_drop_rate_4g` - VoLTE drop rate for 4G

## Endpoints

### 1. Get Available KPI Metrics

**GET** `/api/kpi-timeseries/available-metrics`

Returns a list of all available KPI metrics.

**Response:**
```json
{
  "success": true,
  "data": [
    "cap_dl_traffic_vol_mb_4g",
    "cap_ul_traffic_vol_mb_4g",
    // ... all available metrics
  ],
  "count": 21,
  "message": "Available KPI metrics retrieved successfully"
}
```

### 2. Get KPI Timeseries (POST)

**POST** `/api/kpi-timeseries/timeseries`

Retrieves KPI timeseries data for a specific entity across all tables, date range, and KPI metric.

**Request Body:**
```json
{
  "entity_id": "uuid-string",
  "date": "2024-01",
  "kpi_metric": "ret_volte_drop_rate_4g"
}
```

**Parameters:**
- `entity_id` (required): The entity ID to search for across all KPI tables
- `date` (required): Date in YYYY-MM format (e.g., "2024-01")
- `kpi_metric` (required): The specific KPI metric to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-01-01",
      "ret_volte_drop_rate_4g": 0.5,
      "source_table": "site_kpi",
      "id_column": "site_id"
    },
    {
      "date_key": "2024-01-02",
      "ret_volte_drop_rate_4g": 0.6,
      "source_table": "site_kpi",
      "id_column": "site_id"
    }
  ],
  "count": 2,
  "entity_id": "uuid-string",
  "date": "2024-01",
  "kpi_metric": "ret_volte_drop_rate_4g",
  "found_in_tables": ["site_kpi"],
  "message": "Found 2 KPI records for ret_volte_drop_rate_4g in 2024-01"
}
```

### 3. Get KPI Timeseries by Table Type (GET)

**GET** `/api/kpi-timeseries/timeseries/{table_type}/{entity_id}`

Retrieves KPI timeseries data for a specific table type and entity ID.

**URL Parameters:**
- `table_type`: One of 'site', 'hex', 'neighborhood', 'zip', 'market'
- `entity_id`: The entity ID to search for

**Query Parameters:**
- `date` (optional): Date in YYYY-MM format (defaults to current month)
- `kpi_metric` (optional): Specific KPI metric to retrieve (returns all if not specified)

**Examples:**

1. Get all KPIs for a site in January 2024:
```
GET /api/kpi-timeseries/timeseries/site/123e4567-e89b-12d3-a456-426614174000?date=2024-01
```

2. Get specific KPI for a market in current month:
```
GET /api/kpi-timeseries/timeseries/market/123e4567-e89b-12d3-a456-426614174000?kpi_metric=ret_volte_drop_rate_4g
```

**Response (with specific KPI):**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-01-01",
      "ret_volte_drop_rate_4g": 0.5
    },
    {
      "date_key": "2024-01-02",
      "ret_volte_drop_rate_4g": 0.6
    }
  ],
  "count": 2,
  "table_type": "site",
  "entity_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01",
  "kpi_metric": "ret_volte_drop_rate_4g",
  "message": "Found 2 KPI records for site ID: 123e4567-e89b-12d3-a456-426614174000 in 2024-01"
}
```

**Response (all KPIs):**
```json
{
  "success": true,
  "data": [
    {
      "date_key": "2024-01-01",
      "cap_dl_traffic_vol_mb_4g": 1000.5,
      "cap_ul_traffic_vol_mb_4g": 500.2,
      "ret_volte_drop_rate_4g": 0.5,
      // ... all other KPI metrics
    }
  ],
  "count": 1,
  "table_type": "site",
  "entity_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01",
  "kpi_metric": "all",
  "message": "Found 1 KPI records for site ID: 123e4567-e89b-12d3-a456-426614174000 in 2024-01"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM (e.g., 2024-01)"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "No KPI data found for entity_id: uuid-string in 2024-01",
  "entity_id": "uuid-string",
  "date": "2024-01",
  "kpi_metric": "ret_volte_drop_rate_4g"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Database error: [error details]"
}
```

## Usage Examples

### cURL Examples

1. Get available KPI metrics:
```bash
curl -X GET http://localhost:5000/api/kpi-timeseries/available-metrics
```

2. Get KPI timeseries using POST:
```bash
curl -X POST http://localhost:5000/api/kpi-timeseries/timeseries \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "date": "2024-01",
    "kpi_metric": "ret_volte_drop_rate_4g"
  }'
```

3. Get KPI timeseries for specific table:
```bash
curl -X GET "http://localhost:5000/api/kpi-timeseries/timeseries/site/123e4567-e89b-12d3-a456-426614174000?date=2024-01&kpi_metric=ret_volte_drop_rate_4g"
```

### JavaScript Examples

```javascript
// Get available metrics
const metrics = await fetch('/api/kpi-timeseries/available-metrics')
  .then(res => res.json());

// Get timeseries data
const timeseriesData = await fetch('/api/kpi-timeseries/timeseries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    entity_id: '123e4567-e89b-12d3-a456-426614174000',
    date: '2024-01',
    kpi_metric: 'ret_volte_drop_rate_4g'
  })
}).then(res => res.json());
```

## Notes

1. **Date Format**: All dates should be in YYYY-MM format (e.g., "2024-01" for January 2024)
2. **Entity ID Search**: The POST endpoint searches across all 5 KPI tables for the given entity_id
3. **Table-Specific Search**: The GET endpoint searches only in the specified table type
4. **Data Filtering**: Results are filtered by month and year, returning all daily records within that month
5. **Soft Deletes**: The API automatically excludes records where `deleted_at` is not NULL
6. **Ordering**: Results are ordered by `date_key` in ascending order

## Database Tables

The API works with the following KPI tables:
- `site_kpi` - Site-level KPI data
- `hex_kpi` - Hex-level KPI data  
- `neighborhood_kpi` - Neighborhood-level KPI data
- `zip_kpi` - ZIP code-level KPI data
- `market_kpi` - Market-level KPI data

Each table contains the same KPI metrics and uses `date_key` for time-series data.
