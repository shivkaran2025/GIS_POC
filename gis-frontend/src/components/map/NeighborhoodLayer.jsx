import React, { useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const NeighborhoodLayer = ({ data }) => {
  useEffect(() => {
    console.log("NeighborhoodLayer received data:", data);
    if (data) {
      console.log("Data type:", data.type);
      console.log("Features count:", data.features?.length || 0);
      if (data.features && data.features.length > 0) {
        console.log("First feature:", data.features[0]);
      }
    }
  }, [data]);

  if (!data) {
    console.log("No data provided to NeighborhoodLayer");
    return null;
  }

  // Improved data normalization
  const geojsonData = (() => {
    try {
      if (data.type === "FeatureCollection") {
        return data;
      }

      let features = [];
      if (Array.isArray(data.features)) {
        features = data.features;
      } else if (data.feature) {
        features = [data.feature];
      } else if (Array.isArray(data)) {
        features = data;
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
    console.warn("No valid polygon features found in neighborhood data");
    return null;
  }

  const fillLayer = {
    id: "neighborhood-fill",
    type: "fill",
    source: "neighborhood",
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0.4,
    },
  };

  const lineLayer = {
    id: "neighborhood-line",
    type: "line",
    source: "neighborhood",
    paint: {
      "line-color": "#004080",
      "line-width": 2,
    },
  };

  return (
    <Source id="neighborhood" type="geojson" data={geojsonData}>
      <Layer {...fillLayer} />
      <Layer {...lineLayer} />
    </Source>
  );
};

export default NeighborhoodLayer;
