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
