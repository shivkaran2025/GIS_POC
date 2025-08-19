# Interactive Map Component

This directory contains the interactive map components that integrate with the backend API to display geographic data based on zoom levels.

## Components

### Main Components

- **Map.jsx** - Main map component that orchestrates all layers and handles zoom-based data loading
- **MarketRegionLayer.jsx** - Renders market regions (initial view)
- **NeighborhoodLayer.jsx** - Renders CDC neighborhoods (mid-zoom view)
- **SiteLocationLayer.jsx** - Renders site locations as points (high-zoom view)

### UI Components

- **MapControls.jsx** - Zoom in/out, reset, and pan controls
- **MapInfo.jsx** - Displays current view information and site count
- **MapTooltip.jsx** - Hover tooltip for map features

## Features

### Zoom-Based Data Loading

The map automatically loads different data based on zoom level:

1. **Market Regions** (Zoom < 1.5x)

   - Shows market boundaries
   - Displays total market count
   - Uses GeoJSON data from `/api/market-regions`

2. **Neighborhoods** (Zoom 1.5x - 3.0x)

   - Shows CDC neighborhood boundaries
   - Displays neighborhood count
   - Uses GeoJSON data from `/api/cdc-neighborhoods`

3. **Site Locations** (Zoom > 3.0x)
   - Shows individual site locations as points
   - Displays site count for current view
   - Uses coordinate data from `/api/site-locations/coordinates`

### Interactive Features

- **Hover Effects** - Features highlight on hover with tooltips
- **Click Interactions** - Click features to see detailed information
- **Smooth Transitions** - Animated zoom and data loading
- **Responsive Design** - Adapts to container size

### API Integration

The map uses the `ApiService` to fetch data from the backend:

```javascript
// Market regions
const marketData = await ApiService.getMarketRegions();

// Neighborhoods
const neighborhoodData = await ApiService.getCdcNeighborhoods();

// Site locations with bounds
const siteData = await ApiService.getSiteLocationsByCoordinates(
  lat,
  lng,
  radius
);
```

## Usage

```jsx
import Map from "./components/map/Map";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        width={800}
        height={500}
        minZoom={0.5}
        maxZoom={10}
        neighborhoodZoomThreshold={3.0}
      />
    </div>
  );
}
```

## Props

| Prop                        | Type   | Default | Description                               |
| --------------------------- | ------ | ------- | ----------------------------------------- |
| `width`                     | number | 800     | Map width in pixels                       |
| `height`                    | number | 500     | Map height in pixels                      |
| `minZoom`                   | number | 0.5     | Minimum zoom level                        |
| `maxZoom`                   | number | 10      | Maximum zoom level                        |
| `neighborhoodZoomThreshold` | number | 3.0     | Zoom level to switch to neighborhood view |

## Data Flow

1. **Initial Load** - Map loads market regions by default
2. **Zoom Detection** - D3 zoom handler detects zoom level changes
3. **Data Loading** - Appropriate API endpoint is called based on zoom level
4. **Layer Rendering** - Correct layer component renders the new data
5. **UI Updates** - Info panel and controls update to reflect current view

## Error Handling

- Network errors are displayed with retry options
- Loading states are shown during data fetching
- Graceful fallbacks for missing data

## Performance

- Data is cached in the `useMapData` hook
- Only loads new data when zoom level changes
- Efficient D3 rendering with proper cleanup
- Debounced zoom handling to prevent excessive API calls

