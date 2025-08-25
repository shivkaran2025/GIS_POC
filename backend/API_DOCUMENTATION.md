# GIS POC API Documentation

## Base URL
```
http://localhost:5000
```

## Core Endpoints

### `GET /`
Returns API information and available endpoints.

**Response:**
```json
{
  "service": "GIS POC API",
  "version": "1.0.0",
  "endpoints": {
    "geojson": {
      "method": "GET",
      "url": "/api/geojson",
      "description": "Get GeoJSON data with spatial filtering"
    },
    "kpi_routes": {
      "description": "KPI data endpoints (see /api/kpi/*)"
    },
    "ui_compatibility": {
      "description": "UI compatibility endpoints for existing frontend"
    }
  },
  "data_sources": {
    "zip_codes": 1234,
    "market_regions": 567,
    "cdc_neighborhoods": 890,
    "site_locations": 123
  }
}
```

### `GET /health`
Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "success": true,
  "message": "GIS POC API is running",
  "timestamp": 1703123456.789,
  "data_loaded": {
    "zip_codes": true,
    "market_regions": true,
    "cdc_neighborhoods": true,
    "site_locations": true
  }
}
```

### `GET /api/geojson`
Retrieve GeoJSON data with spatial filtering.

**Parameters:**
- `dataset` (optional): `zip_codes`, `market_regions`, `cdc_neighborhoods` (default: `cdc_neighborhoods`)
- `lat` (optional): Latitude for spatial filtering
- `lng` (optional): Longitude for spatial filtering  
- `radius` (optional): Search radius in degrees (default: 0.1)

**Example:**
```
GET /api/geojson?dataset=zip_codes&lat=40.7128&lng=-74.0060&radius=0.05
```

## Count Endpoints

### `GET /api/kpi/count/<id_type>/<id_value>`
Get count of KPI records by type and ID value from the geo_hierarchy_mapping table.

**Parameters:**
- `id_type` (required): One of `market`, `zip`, `hex`, `neighborhood`, `site`
- `id_value` (required): The specific ID value to count records for

**Valid ID Types:**
- `market` - Counts market_id records
- `zip` - Counts zip_code records  
- `hex` - Counts hex_id records
- `neighborhood` - Counts neighborhood_id records
- `site` - Counts site_id records

**Example Requests:**
```
GET /api/kpi/count/zip/98148
GET /api/kpi/count/market/Seattle WA
GET /api/kpi/count/site/SE03878A
GET /api/kpi/count/neighborhood/BG530330279012
GET /api/kpi/count/hex/RU85001588
```

**Successful Response:**
```json
{
  "success": true,
  "data": [
    {
      "COUNT(zip_code)": 165
    }
  ],
  "id_type": "zip",
  "id_value": "98148",
  "count": 1,
  "message": "Found [{'COUNT(zip_code)': 165}] for Zip KPI records"
}
```

**Error Response (Invalid ID Type):**
```json
{
  "success": false,
  "message": "Invalid ID type. Must be one of: market, zip, hex, neighborhood, site"
}
```

## KPI Data Endpoints

**Note:** These endpoints now work correctly after updating SQL queries to use `date_key` instead of `date`.

All KPI endpoints support fetching by ID and by specific ID types:

### Market KPI
- `GET /api/kpi/market/<id>` - Get market KPI by record ID
- `GET /api/kpi/market/market_id/<market_id>` - Get market KPI by market_id

### ZIP KPI
- `GET /api/kpi/zip/<id>` - Get ZIP KPI by record ID
- `GET /api/kpi/zip/zip_id/<zip_id>` - Get ZIP KPI by zip_id

### HEX KPI
- `GET /api/kpi/hex/<id>` - Get HEX KPI by record ID
- `GET /api/kpi/hex/hex_id/<hex_id>` - Get HEX KPI by hex_id

### Neighborhood KPI
- `GET /api/kpi/neighborhood/<id>` - Get neighborhood KPI by record ID
- `GET /api/kpi/neighborhood/neighborhood_id/<neighborhood_id>` - Get neighborhood KPI by neighborhood_id

### Site KPI
- `GET /api/kpi/site/<id>` - Get site KPI by record ID
- `GET /api/kpi/site/site_id/<site_id>` - Get site KPI by site_id

### Generic Endpoints
- `GET /api/kpi/<kpi_type>/<id>` - Generic endpoint for any KPI type
- `GET /api/kpi/<kpi_type>/<id_type>_id/<id_value>` - Generic endpoint for any ID type

**Valid KPI Types:** `market`, `zip`, `hex`, `neighborhood`, `site`

**Successful Response (Multiple Records):**
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

## UI Compatibility Endpoints

These endpoints maintain compatibility with existing frontend applications:

### Market Regions
- `GET /api/market-regions` - Get all market regions
- `GET /api/market-regions/id/<market_name>` - Get market region by name

### CDC Neighborhoods
- `GET /api/cdc-neighborhoods` - Get all CDC neighborhoods
- `GET /api/cdc-neighborhoods/id/<neighborhood_id>` - Get neighborhood by ID
- `GET /api/cdc-neighborhoods/bounds` - Get neighborhood bounds

### Site Locations
- `GET /api/site-locations` - Get all site locations
- `GET /api/site-locations/coordinates` - Get sites by coordinates
- `GET /api/site-locations/site/<site_id>` - Get site by ID

### ZIP Codes
- `GET /api/zip-codes` - Get all ZIP codes
- `GET /api/zip-codes/bounds` - Get ZIP code bounds

### Search
- `GET /api/search` - Cross-dataset search functionality

## Sample API Responses

### Count Response (Successful)
```json
{
  "success": true,
  "data": [
    {
      "COUNT(market_id)": 1000
    }
  ],
  "id_type": "market",
  "id_value": "Seattle WA",
  "count": 1,
  "message": "Found [{'COUNT(market_id)': 1000}] for Market KPI records"
}
```

### Count Response (Zero Records)
```json
{
  "success": true,
  "data": [
    {
      "COUNT(site_id)": 0
    }
  ],
  "id_type": "site",
  "id_value": "SE03878A",
  "count": 1,
  "message": "Found [{'COUNT(site_id)': 0}] for Site KPI records"
}
```

### Successful Response (Single Record)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "market_id": "Seattle WA",
    "date_key": "2024-11-28",
    "cap_dl_traffic_vol_mb_4g": 699768.0,
    "cap_ul_traffic_vol_mb_4g": 123456.0,
    "cap_dl_traffic_vol_mb_5g": 234567.0,
    "cap_ul_traffic_vol_mb_5g": 34567.0,
    "created_at": "2024-11-28T10:30:00",
    "updated_at": "2024-11-28T10:30:00"
  },
  "message": "Market KPI record found"
}
```

### Successful Response (Multiple Records)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "site_id": "SE04615A",
      "date_key": "2024-11-28",
      "cap_dl_traffic_vol_mb_4g": 699768.0,
      "cap_ul_traffic_vol_mb_4g": 123456.0
    },
    {
      "id": 2,
      "site_id": "SE04615A",
      "date_key": "2024-11-29",
      "cap_dl_traffic_vol_mb_4g": 712345.0,
      "cap_ul_traffic_vol_mb_4g": 134567.0
    }
  ],
  "count": 2,
  "message": "Found 2 site KPI records"
}
```

### Error Response (Record Not Found)
```json
{
  "success": false,
  "message": "Site KPI record with ID 999 not found"
}
```

### Error Response (Invalid KPI Type)
```json
{
  "success": false,
  "message": "Invalid KPI type. Must be one of: market, zip, hex, neighborhood, site"
}
```

### Error Response (Database Error)
```json
{
  "success": false,
  "message": "Database error: (pymysql.err.OperationalError) (1045, \"Access denied for user 'root'@'localhost'\")"
}
```

## Database Tables

The application works with 6 tables:

1. **market_kpi** - Market-level KPI data
2. **zip_kpi** - ZIP code-level KPI data
3. **hex_kpi** - Hex-level KPI data
4. **neighborhood_kpi** - Neighborhood-level KPI data
5. **site_kpi** - Site-level KPI data
6. **geo_hierarchy_mapping** - Geographic hierarchy mapping table (used for count endpoints)

Each KPI table supports queries by:
- Primary key (`id`)
- Specific ID field (`market_id`, `zip_id`, `hex_id`, `neighborhood_id`, `site_id`)

The geo_hierarchy_mapping table supports count queries by:
- `market_id`, `zip_code`, `hex_id`, `neighborhood_id`, `site_id`

**Note:** The KPI tables use `date_key` as the date column, and all API queries have been updated to use the correct column name.

## Error Handling

### HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters or request format |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

### Common Error Responses

#### Database Connection Error
```json
{
  "success": false,
  "message": "Database error: (pymysql.err.OperationalError) (1045, \"Access denied for user 'root'@'localhost'\")"
}
```

#### Record Not Found
```json
{
  "success": false,
  "message": "Site KPI record with ID 999 not found"
}
```

#### Invalid Parameters
```json
{
  "success": false,
  "message": "Invalid KPI type. Must be one of: market, zip, hex, neighborhood, site"
}
```

#### Invalid ID Type for Count
```json
{
  "success": false,
  "message": "Invalid ID type. Must be one of: market, zip, hex, neighborhood, site"
}
```

#### Record Not Found (No Data)
```json
{
  "success": false,
  "message": "No site KPI records found for site_id: SE03878A"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production deployments, consider implementing rate limiting at the reverse proxy level (e.g., Nginx) or using Flask-Limiter.

## Authentication

Currently, no authentication is required. For production deployments, consider implementing:
- API key authentication
- JWT tokens
- OAuth 2.0

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins in development. For production, configure specific allowed origins in the Flask-CORS settings.

## Performance Considerations

- GeoJSON data is loaded into memory on application startup
- Large datasets may require pagination (not currently implemented)
- Database queries are not cached (consider implementing Redis for caching)
- Spatial filtering uses in-memory grid indexing for performance

## Monitoring

Use the `/health` endpoint for:
- Load balancer health checks
- Application monitoring
- Data source availability verification
- Uptime monitoring

## API Versioning

Currently using version 1.0.0. Future versions should maintain backward compatibility or use URL versioning (e.g., `/api/v2/`).