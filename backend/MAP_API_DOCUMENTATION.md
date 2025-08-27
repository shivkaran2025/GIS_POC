# Map API Documentation

## 📋 Overview

The Map API provides geographic data access using the `Geo_Data` table from the database. This API can replace the existing Geographic Data API and provides consistent endpoints for all entity types: MARKET, ZIP, HEX, NEIGHBOURHOOD, and SITE.

## 🌐 Base URL

```
http://localhost:5000/api/map
```

## 📊 Available Entity Types

The API supports the following entity types (matching the ENUM in Geo_Data table):

- `MARKET` - Market regions
- `ZIP` - ZIP codes  
- `HEX` - Hexagonal regions
- `NEIGHBOURHOOD` - Neighborhood areas
- `SITE` - Site locations

## 🔗 Endpoints

### 1. Get Available Entity Types

**GET** `/api/map/available-types`

Returns a list of all available entity types.

**Response:**
```json
{
  "success": true,
  "data": ["MARKET", "ZIP", "HEX", "NEIGHBOURHOOD", "SITE"],
  "count": 5,
  "message": "Available entity types retrieved successfully"
}
```

### 2. Get All Entities by Type

**GET** `/api/map/{entity_type}`

Retrieves all geographic data for a specific entity type.

**Parameters:**
- `entity_type` (path): One of `market`, `zip`, `hex`, `neighbourhood`, `site`

**Example Request:**
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

### 3. Get Entity by ID

**GET** `/api/map/{entity_type}/{entity_id}`

Retrieves geographic data for a specific entity by its ID.

**Parameters:**
- `entity_type` (path): One of `market`, `zip`, `hex`, `neighbourhood`, `site`
- `entity_id` (path): The entity ID to search for

**Example Request:**
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

### 4. Get Entities by Bounds

**GET** `/api/map/{entity_type}/bounds`

Retrieves geographic data for entities within specified geographic bounds.

**Parameters:**
- `entity_type` (path): One of `market`, `zip`, `hex`, `neighbourhood`, `site`
- `north` (query): North boundary (latitude)
- `south` (query): South boundary (latitude)
- `east` (query): East boundary (longitude)
- `west` (query): West boundary (longitude)

**Example Request:**
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

## 📊 Response Data Structure

Each geographic record contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary key from Geo_Data table |
| `type` | String | Entity type (MARKET, ZIP, HEX, NEIGHBOURHOOD, SITE) |
| `latitude` | Decimal | Geographic latitude coordinate |
| `longitude` | Decimal | Geographic longitude coordinate |
| `geo_polygon` | JSON | GeoJSON polygon data (if available) |
| `demographic_id` | String | Foreign key to Geo_Hierarchy_Mapping |
| `created_at` | Timestamp | Record creation timestamp |
| `updated_at` | Timestamp | Record last update timestamp |

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid entity type. Must be one of: MARKET, ZIP, HEX, NEIGHBOURHOOD, SITE"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "No geographic data found for entity type: market",
  "entity_type": "MARKET"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Database error: [error details]"
}
```

## 🧪 Usage Examples

### JavaScript/Fetch API

```javascript
// Get all market data
fetch('/api/map/market')
  .then(response => response.json())
  .then(data => console.log(data));

// Get specific market by ID
fetch('/api/map/market/Seattle%20WA')
  .then(response => response.json())
  .then(data => console.log(data));

// Get markets within bounds
fetch('/api/map/market/bounds?north=47.7&south=47.5&east=-122.2&west=-122.4')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Python/Requests

```python
import requests

# Get all market data
response = requests.get('http://localhost:5000/api/map/market')
data = response.json()

# Get specific market by ID
response = requests.get('http://localhost:5000/api/map/market/Seattle%20WA')
data = response.json()

# Get markets within bounds
params = {
    'north': 47.7,
    'south': 47.5,
    'east': -122.2,
    'west': -122.4
}
response = requests.get('http://localhost:5000/api/map/market/bounds', params=params)
data = response.json()
```

## 🔄 Migration from Existing Geographic Data API

This new Map API can replace the existing Geographic Data API endpoints:

| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/market-regions` | `/api/map/market` | Get all market data |
| `/api/market-regions/id/{id}` | `/api/map/market/{id}` | Get market by ID |
| `/api/cdc-neighborhoods` | `/api/map/neighbourhood` | Get all neighborhood data |
| `/api/cdc-neighborhoods/id/{id}` | `/api/map/neighbourhood/{id}` | Get neighborhood by ID |
| `/api/cdc-neighborhoods/bounds` | `/api/map/neighbourhood/bounds` | Get neighborhoods by bounds |
| `/api/site-locations` | `/api/map/site` | Get all site data |
| `/api/site-locations/site/{id}` | `/api/map/site/{id}` | Get site by ID |
| `/api/zip-codes` | `/api/map/zip` | Get all ZIP data |
| `/api/zip-codes/bounds` | `/api/map/zip/bounds` | Get ZIP codes by bounds |

## 📝 Important Notes

1. **HEX Data**: Currently, HEX data may not exist in the database, but the API is ready to handle it when data becomes available.

2. **Entity ID Mapping**: The API uses the `Geo_Hierarchy_Mapping` table to correlate `demographic_id` with the actual entity IDs from the KPI tables.

3. **GeoJSON Polygons**: The `geo_polygon` field contains GeoJSON polygon data when available, which can be used for rendering boundaries on maps.

4. **Case Insensitive**: Entity types are case-insensitive in the URL (e.g., `market`, `MARKET`, `Market` all work).

5. **Bounds Validation**: The bounds endpoint validates that north > south and east > west to ensure logical geographic bounds.

## 🚀 Performance Considerations

- All queries include `deleted_at IS NULL` to exclude soft-deleted records
- Results are ordered by `id` for consistent pagination
- The API uses parameterized queries to prevent SQL injection
- Geographic bounds queries use efficient BETWEEN clauses on latitude/longitude

## 🔧 Database Schema Reference

This API uses the following database tables:

- **Geo_Data**: Primary table containing geographic coordinates and polygons
- **Geo_Hierarchy_Mapping**: Mapping table linking geographic data to entity IDs

The `Geo_Data` table structure:
```sql
CREATE TABLE Geo_Data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('MARKET','ZIP','HEX','NEIGHBOURHOOD','SITE'),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    geo_polygon JSON,
    demographic_id CHAR(36) NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
