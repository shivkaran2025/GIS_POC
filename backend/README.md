# GeoJSON & Site Location API Server

A Flask-based REST API server that serves geographic data from multiple sources:
- **ZIP Codes** (`Zip_Codes.geojson`)
- **Market Regions** (`tmo_region_market.json`)
- **CDC Neighborhoods** (`CDC_V3_NEIGHBORHOODS_SHAPEFILE.json`)
- **Site Locations** (`site_lat_long_08132025.csv`)

## Features

- **Caching**: All data cached in memory for fast access
- **Multiple Formats**: Supports GeoJSON and CSV data sources
- **Search Capabilities**: Search by ID, coordinates, or any property
- **Cross-dataset Search**: Search across all datasets with a single query
- **Geographic Queries**: Find sites within a radius of coordinates

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server**:
   ```bash
   python app.py
   ```

3. **Test the API**:
   ```bash
   python test_api.py
   ```

## API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /api/zip-codes` - All ZIP codes
- `GET /api/market-regions` - All market regions
- `GET /api/cdc-neighborhoods` - All CDC neighborhoods
- `GET /api/site-locations` - All site locations

### Search Endpoints
- `GET /api/zip-codes/zipcode/{zipcode}` - ZIP code by number
- `GET /api/market-regions/id/{market_name}` - Market region by market name
- `GET /api/site-locations/site/{site_id}` - Site by ID
- `GET /api/site-locations/coordinates?lat={lat}&lng={lng}&radius={radius}` - Sites by coordinates
- `GET /api/search?q={query}&dataset={dataset}` - Search across datasets

## Example Usage

```bash
# Get ZIP code information
curl http://localhost:5000/api/zip-codes/zipcode/20375

# Get market region by name
curl http://localhost:5000/api/market-regions/id/ALASKA

# Find sites near coordinates
curl "http://localhost:5000/api/site-locations/coordinates?lat=40.037362&lng=-75.214826&radius=0.1"

# Search across all datasets
curl "http://localhost:5000/api/search?q=Washington"
```

## Data Sources

| Dataset | Format | Records | Description |
|---------|--------|---------|-------------|
| ZIP Codes | GeoJSON | 493 | US ZIP code boundaries |
| Market Regions | GeoJSON | ~150 | Market region boundaries |
| CDC Neighborhoods | GeoJSON | ~2,500 | CDC neighborhood boundaries |
| Site Locations | CSV | 428,646 | Site coordinates |

## Response Format

All endpoints return consistent JSON responses:

```json
{
  "dataset": "dataset_name",
  "count": 1,
  "features": [...],  // For GeoJSON data
  "sites": [...],     // For CSV data
  "results": [...]    // For search results
}
```

## Performance

- **Memory**: ~600MB RAM for all datasets
- **Response Time**: <100ms for most queries
- **Data Loading**: Files loaded once at startup

## Documentation

For detailed API documentation with JSON response examples, see `API_DOCUMENTATION.md`.

## Troubleshooting

- **Port in use**: Kill existing processes or change port in `app.py`
- **Missing files**: Ensure all data files are in the same directory
- **Memory issues**: Server requires ~600MB RAM for all datasets
