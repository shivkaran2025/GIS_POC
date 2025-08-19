  # GeoJSON & Site Location API Documentation

  ## Overview

  This API serves geographic data from GeoJSON files and site location data from CSV files. It provides endpoints for accessing ZIP codes, market regions, CDC neighborhoods, and site locations with comprehensive search capabilities.

  **Base URL:** `http://localhost:5000`

  ## API Information

  ### GET /

  Returns API information and available endpoints.

  **Response:**
  ```json
  {
    "name": "GeoJSON & Site Location API",
    "version": "2.0",
    "description": "API for serving geographic data from GeoJSON files and site location data from CSV",
    "datasets": {
      "zip_codes": "ZIP code boundaries and information",
      "market_regions": "Market region boundaries and information",
      "cdc_neighborhoods": "CDC neighborhood boundaries and information",
      "site_locations": "Site locations with latitude and longitude coordinates"
    },
    "endpoints": {
      "base": "/",
      "zip_codes": {
        "all": "/api/zip-codes",
        "by_id": "/api/zip-codes/id/{id}",
        "by_zipcode": "/api/zip-codes/zipcode/{zipcode}"
      },
      "market_regions": {
        "all": "/api/market-regions",
        "by_id": "/api/market-regions/id/{id}",
        "by_property": "/api/market-regions/property/{name}/{value}"
      },
      "cdc_neighborhoods": {
        "all": "/api/cdc-neighborhoods",
        "by_id": "/api/cdc-neighborhoods/id/{id}",
        "by_property": "/api/cdc-neighborhoods/property/{name}/{value}"
      },
      "site_locations": {
        "all": "/api/site-locations",
        "by_site_id": "/api/site-locations/site/{site_id}",
        "by_coordinates": "/api/site-locations/coordinates?lat={lat}&lng={lng}&radius={radius}"
      },
      "search": {
        "cross_dataset": "/api/search?q={query}&dataset={dataset}",
        "all_datasets": "/api/search?q={query}"
      }
    }
  }
  ```

  ## Endpoints

  ### ZIP Codes

  #### GET /api/zip-codes
  Returns all ZIP code features.

  #### GET /api/zip-codes/id/{id}
  Returns a specific ZIP code by OBJECTID.

  #### GET /api/zip-codes/zipcode/{zipcode}
  Returns a specific ZIP code by ZIPCODE.

  **Example Response:**
  ```json
  {
    "dataset": "zip_codes",
    "feature": {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[-77.02541798499993, 38.82846284500005], ...]]]
      },
      "properties": {
        "OBJECTID": 493,
        "ZIPCODE": 20375,
        "NAME": "NAVAL RESEARCH LABRATORY",
        "LABEL": 20375,
        "ZIP_CODE_TEXT": "20375"
      }
    }
  }
  ```

  ### Market Regions

  #### GET /api/market-regions
  Returns all market region features.

  #### GET /api/market-regions/id/{market_name}
  Returns a specific market region by Market name (handles spaces with URL encoding).

  #### GET /api/market-regions/property/{name}/{value}
  Returns market regions by property name and value.

  **Example Response:**
  ```json
  {
    "dataset": "market_regions",
    "feature": {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[-149.070836, 63.080715], ...]]]
      },
      "properties": {
        "Region": "WEST",
        "Market": "ALASKA",
        "Sales_Mark": "Alaska, AK",
        "Eng_Market": "Alaska AK",
        "Market_Area": "ALASKA",
        "Market_Abb": "AK",
        "Longitude": -149.070836,
        "Latitude": 63.080715
      }
    }
  }
  ```

  ### CDC Neighborhoods

  #### GET /api/cdc-neighborhoods
  Returns all CDC neighborhood features.

  #### GET /api/cdc-neighborhoods/id/{id}
  Returns a specific CDC neighborhood by ID.

  #### GET /api/cdc-neighborhoods/property/{name}/{value}
  Returns CDC neighborhoods by property name and value.

  **Example Response:**
  ```json
  {
    "dataset": "cdc_neighborhoods",
    "feature": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-77.123, 38.456], [-77.124, 38.457], ...]]
      },
      "properties": {
        "OBJECTID": 1,
        "NEIGHBORHOOD_NAME": "Downtown",
        "CDC_ID": "CDC001",
        "POPULATION": 15000
      }
    }
  }
  ```

  ### Site Locations

  #### GET /api/site-locations
  Returns all site locations.

  #### GET /api/site-locations/site/{site_id}
  Returns a specific site by site ID.

  #### GET /api/site-locations/coordinates
  Returns sites within a radius of given coordinates.

  **Parameters:**
  - `lat` (float): Latitude coordinate
  - `lng` (float): Longitude coordinate
  - `radius` (float, optional): Search radius in degrees (default: 1.0)

  **Example Request:**
  ```
  GET /api/site-locations/coordinates?lat=40.037362&lng=-75.214826&radius=0.1
  ```

  **Example Response:**
  ```json
  {
    "dataset": "site_locations",
    "center": {
      "latitude": 40.037362,
      "longitude": -75.214826
    },
    "radius": 0.1,
    "count": 5,
    "sites": [
      {
        "site_id": "PHS0415A",
        "s_site_latitude": "40.037362",
        "s_site_longitude": "-75.214826"
      }
    ]
  }
  ```

  ### Search

  #### GET /api/search
  Searches across datasets for matching features.

  **Parameters:**
  - `q` (string, required): Search query
  - `dataset` (string, optional): Specific dataset to search (default: "all")

  **Available dataset values:**
  - `all`: Search all datasets
  - `zip_codes`: Search only ZIP codes
  - `market_regions`: Search only market regions
  - `cdc_neighborhoods`: Search only CDC neighborhoods
  - `site_locations`: Search only site locations

  **Example Request:**
  ```
  GET /api/search?q=20375&dataset=zip_codes
  ```

  **Example Response:**
  ```json
  {
    "query": "20375",
    "dataset": "zip_codes",
    "count": 1,
    "results": [
      {
        "dataset": "zip_codes",
        "feature": {
          "type": "Feature",
          "properties": {
            "OBJECTID": 493,
            "ZIPCODE": 20375,
            "NAME": "NAVAL RESEARCH LABRATORY"
          }
        }
      }
    ]
  }
  ```

  ## Error Responses

  All endpoints return consistent error responses:

  **404 Not Found:**
  ```json
  {
    "error": "ZIP code 99999 not found"
  }
  ```

  **400 Bad Request:**
  ```json
  {
    "error": "Query parameter 'q' is required"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "error": "Failed to load ZIP codes data"
  }
  ```

  ## Usage Examples

  ### cURL Examples

  ```bash
  # Get all ZIP codes
  curl http://localhost:5000/api/zip-codes

  # Get specific ZIP code
  curl http://localhost:5000/api/zip-codes/zipcode/20375

  # Get market region by name
  curl http://localhost:5000/api/market-regions/id/ALASKA

  # Search for sites near coordinates
  curl "http://localhost:5000/api/site-locations/coordinates?lat=40.037362&lng=-75.214826&radius=0.1"

  # Search across all datasets
  curl "http://localhost:5000/api/search?q=Washington"
  ```

  ### JavaScript Examples

  ```javascript
  // Fetch ZIP code data
  fetch('http://localhost:5000/api/zip-codes/zipcode/20375')
    .then(response => response.json())
    .then(data => console.log(data));

  // Search for sites
  fetch('http://localhost:5000/api/site-locations/site/CTNH515A')
    .then(response => response.json())
    .then(data => console.log(data));
  ```

  ## Data Sources

  - **ZIP Codes**: `Zip_Codes.geojson` - US ZIP code boundaries
  - **Market Regions**: `tmo_region_market.json` - Market region boundaries
  - **CDC Neighborhoods**: `CDC_V3_NEIGHBORHOODS_SHAPEFILE.json` - CDC neighborhood boundaries
  - **Site Locations**: `site_lat_long_08132025.csv` - Site coordinates

  ## Performance Notes

  - All data is cached in memory for fast access
  - Large GeoJSON files are loaded once at startup
  - CSV data is parsed and cached for efficient querying
  - Search operations are performed on cached data
