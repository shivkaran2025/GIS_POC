import React, { useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const ZipCodeLayer = ({ zipData }) => {
  useEffect(() => {
    console.log("ZipCodeLayer received data:", zipData);
    if (zipData) {
      console.log("Data type:", zipData.type);
      console.log("Features count:", zipData.features?.length || 0);
      if (zipData.features && zipData.features.length > 0) {
        console.log("First feature:", zipData.features[0]);
      }
    }
  }, [zipData]);

  if (!zipData) {
    console.log("No data provided to ZipCodeLayer");
    return null;
  }

  // Improved data normalization similar to NeighborhoodLayer
  const geojsonData = (() => {
    try {
      if (zipData.type === "FeatureCollection") {
        return zipData;
      }

      let features = [];
      if (Array.isArray(zipData.features)) {
        features = zipData.features;
      } else if (zipData.feature) {
        features = [zipData.feature];
      } else if (Array.isArray(zipData)) {
        features = zipData;
      }

      const normalized = {
        type: "FeatureCollection",
        features: features.filter(
          (feature) =>
            feature &&
            feature.type === "Feature" &&
            feature.geometry &&
            (feature.geometry.type === "Polygon" ||
              feature.geometry.type === "MultiPolygon")
        ),
      };

      console.log("Normalized GeoJSON:", normalized);
      console.log("Valid features:", normalized.features.length);

      return normalized;
    } catch (error) {
      console.error("Error normalizing GeoJSON data:", error);
      return { type: "FeatureCollection", features: [] };
    }
  })();

  if (!geojsonData.features || geojsonData.features.length === 0) {
    console.warn("No valid polygon features found in ZIP data");
    return null;
  }

  // Create grayscale fill layer similar to the image
  const fillLayer = {
    id: "zip-fill",
    type: "fill",
    source: "zip",
    paint: {
      "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#e20074", // Hover color (pink/red)
        [
          "interpolate",
          ["linear"],
          ["get", "density"],
          0, "#f8f9fa",     // Very light gray for no density
          20, "#f0f0f0",    // Light gray
          40, "#e0e0e0",    // Medium light gray
          60, "#d0d0d0",    // Medium gray
          80, "#c0c0c0",    // Medium dark gray
          100, "#a0a0a0"    // Dark gray
        ]
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.4,
        0.7
      ]
    }
  };

  // Create outline layer with white borders
  const lineLayer = {
    id: "zip-outline",
    type: "line",
    source: "zip",
    paint: {
      "line-color": "#ffffff",
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        2,
        1
      ],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.8
      ]
    }
  };

  // Create label layer for ZIP codes
  const labelLayer = {
    id: "zip-label",
    type: "symbol",
    source: "zip",
    layout: {
      "text-field": ["get", "zip_code"],
      "text-font": ["Open Sans Regular"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 8,
        12, 12
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false
    },
    paint: {
      "text-color": "#333333",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1,
      "text-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.7
      ]
    },
    filter: [">", ["get", "site_count"], 0] // Only show labels for areas with sites
  };

  return (
    <Source id="zip" type="geojson" data={geojsonData} generateId={true}>
      <Layer {...fillLayer} />
      <Layer {...lineLayer} />
      <Layer {...labelLayer} />
    </Source>
  );
};

export default ZipCodeLayer;