import React, { useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const ZipLayer = ({ zipData }) => {
  useEffect(() => {
    console.log("ZipLayer received data:", zipData);
    if (zipData) {
      console.log("Data type:", zipData.type);
      console.log("Features count:", zipData.features?.length || 0);
      if (zipData.features && zipData.features.length > 0) {
        console.log("First feature:", zipData.features[0]);
      }
    }
  }, [zipData]);

  if (!zipData) {
    console.log("No data provided to ZipLayer");
    return null;
  }

  // Improved data normalization similar to ZipCodeLayer
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
    console.warn("No valid polygon features found in zip data");
    return null;
  }

  // Create zip fill layer with different styling
  const fillLayer = {
    id: "zip-fill",
    type: "fill",
    source: "zip",
    paint: {
      "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#e20074", // Hover color (pink/red)
        // [
        //   "interpolate",
        //   ["linear"],
        //   ["get", "SHAPE_Area"],
        //   0, "#f8f9fa",     // Very light gray for small areas
        //   0.0001, "#e8f4f8",    // Light blue-gray
        //   0.0002, "#d1e7dd",    // Light green-gray
        //   0.0003, "#fff3cd",    // Light yellow
        //   0.0004, "#f8d7da",    // Light red
        //   0.0005, "#d1ecf1"    // Light cyan
        // ]
        // "#e5e5e5"
        [
          "case",
          ["in", ["get", "ZCTA5CE10"], ["literal", ["98148", "98166", "98225"]]],
          "#FF0000", // Darker gray for specific ZIP codes
          "#e5e5e5"  // Regular gray for other ZIP codes
        ]
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.6,
        0.8
      ]
    }
  };

  // Create outline layer with darker borders for zip codes
  const lineLayer = {
    id: "zip-outline",
    type: "line",
    source: "zip",
    paint: {
      "line-color": "#6c757d",
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        3,
        1.5
      ],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.9
      ]
    }
  };

  // Create label layer for zip identifiers
  const labelLayer = {
    id: "zip-label",
    type: "symbol",
    source: "zip",
    layout: {
      "text-field": ["get", "ZIP_CODE_TEXT"],
      "text-font": ["Open Sans Regular"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 10,
        12, 14
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false
    },
    paint: {
      "text-color": "#495057",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
      "text-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.8
      ]
    },
    filter: ["has", "ZIP_CODE_TEXT"] // Show labels with ZIP codes
  };

  return (
    <Source id="zip" type="geojson" data={geojsonData} generateId={true}>
      <Layer {...fillLayer} />
      <Layer {...lineLayer} />
      <Layer {...labelLayer} />
    </Source>
  );
};

export default ZipLayer;
