import React from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const SelectedBoundaryLayer = ({ 
  selectedMarketBoundary, 
  selectedZipBoundary, 
  selectedNeighborhoodBoundary 
}) => {
  // Create boundary data for selected market
  const marketBoundaryData = selectedMarketBoundary ? {
    type: "FeatureCollection",
    features: [selectedMarketBoundary]
  } : null;

  // Create boundary data for selected zip
  const zipBoundaryData = selectedZipBoundary ? {
    type: "FeatureCollection",
    features: [selectedZipBoundary]
  } : null;

  // Create boundary data for selected neighborhood
  const neighborhoodBoundaryData = selectedNeighborhoodBoundary ? {
    type: "FeatureCollection",
    features: [selectedNeighborhoodBoundary]
  } : null;

  // Market boundary layer style
  const marketBoundaryLayer = {
    id: "selected-market-boundary",
    type: "line",
    source: "selected-market-boundary",
    paint: {
      "line-color": "#e20074", // Pink color for market
      "line-width": 4,
      "line-opacity": 0.9,
    //   "line-dasharray": [2, 2] // Dashed line for distinction
    },
    layout: {
      "visibility": "visible"
    }
  };

  // Zip boundary layer style
  const zipBoundaryLayer = {
    id: "selected-zip-boundary",
    type: "line",
    source: "selected-zip-boundary",
    paint: {
      "line-color": "#28a745", // Green color for ZIP
      "line-width": 3,
      "line-opacity": 0.9,
    //   "line-dasharray": [2, 2] // Dashed line for distinction
    },
    layout: {
      "visibility": "visible"
    }
  };

  // Neighborhood boundary layer style
  const neighborhoodBoundaryLayer = {
    id: "selected-neighborhood-boundary",
    type: "line",
    source: "selected-neighborhood-boundary",
    paint: {
      "line-color": "#fd7e14", // Orange color for neighborhood
      "line-width": 3,
      "line-opacity": 0.9,
    //   "line-dasharray": [2, 2] // Dashed line for distinction
    },
    layout: {
      "visibility": "visible"
    }
  };

  return (
    <>
      {/* Selected Market Boundary */}
      {marketBoundaryData && (
        <Source id="selected-market-boundary" type="geojson" data={marketBoundaryData}>
          <Layer {...marketBoundaryLayer} />
        </Source>
      )}

      {/* Selected Zip Boundary */}
      {zipBoundaryData && (
        <Source id="selected-zip-boundary" type="geojson" data={zipBoundaryData}>
          <Layer {...zipBoundaryLayer} />
        </Source>
      )}

      {/* Selected Neighborhood Boundary */}
      {neighborhoodBoundaryData && (
        <Source id="selected-neighborhood-boundary" type="geojson" data={neighborhoodBoundaryData}>
          <Layer {...neighborhoodBoundaryLayer} />
        </Source>
      )}
    </>
  );
};

export default SelectedBoundaryLayer;
