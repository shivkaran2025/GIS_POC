import React, { useMemo, useCallback } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const NeighborhoodLayer = ({ data }) => {
  // Data validation को memoize करें
  const isValidData = useMemo(() => {
    return data && (
      data.type === "FeatureCollection" ||
      Array.isArray(data.features) ||
      data.feature ||
      Array.isArray(data)
    );
  }, [data]);

  // GeoJSON processing को memoize करें
  const geojsonData = useMemo(() => {
    if (!isValidData) return null;

    try {
      console.log("Processing GeoJSON data...");

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

      return {
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
    } catch (error) {
      console.error("Error normalizing GeoJSON data:", error);
      return { type: "FeatureCollection", features: [] };
    }
  }, [data, isValidData]);

  // Feature count को memoize करें
  const featureCount = useMemo(() => {
    return geojsonData?.features?.length || 0;
  }, [geojsonData]);

  // Source properties को memoize करें
  const sourceProps = useMemo(() => ({
    id: "neighborhood",
    type: "geojson",
    data: geojsonData,
    // Performance optimizations
    maxzoom: 12,
    buffer: 0,
    tolerance: 0.375
  }), [geojsonData]);

  // Layer styles को static memoize करें
  const layerStyles = useMemo(() => ({
    fillLayer: {
      id: "neighborhood-fill",
      type: "fill",
      source: "neighborhood",
      paint: {
        "fill-color": "#0080ff",
        "fill-opacity": 0.4,
      },
      minzoom: 5, // Don't render at low zoom
    },
    lineLayer: {
      id: "neighborhood-line",
      type: "line",
      source: "neighborhood",
      paint: {
        "line-color": "#004080",
        "line-width": 2,
      },
      minzoom: 5,
    }
  }), []);

  // Early returns
  if (!isValidData) {
    return null;
  }

  if (featureCount === 0) {
    console.warn("No valid polygon features found in neighborhood data");
    return null;
  }

  console.log(`Rendering ${featureCount} polygon features`);

  return (
    <Source {...sourceProps}>
      <Layer {...layerStyles.fillLayer} />
      <Layer {...layerStyles.lineLayer} />
    </Source>
  );
};

export default NeighborhoodLayer;
