import React, { useMemo } from "react";
import * as d3 from "d3";

const MarketRegionLayer = ({
  data,
  width,
  height,
  strokeWidth = 1,
  strokeColor = "#fff",
  fillColor = "#69b3a2",
  onFeatureClick,
  onFeatureHover,
  onFeatureLeave,
  transform,
}) => {
  // Memoize the processed data to avoid recalculation on every render
  const processedData = useMemo(() => {
    if (!data || !data.features || data.features.length === 0) {
      return null;
    }

    // Filter out Alaska and Hawaii from the map data
    const filteredFeatures = data.features.filter((feature) => {
      const market = feature.properties?.Market;
      return market !== "ALASKA" && market !== "HAWAII HI";
    });

    const filteredData = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };
    return filteredData;
  }, [data]);

  // Memoize the projection and path generator
  const { projection, pathGenerator } = useMemo(() => {
    if (!processedData || !width || !height) {
      return { projection: null, pathGenerator: null };
    }

    const proj = d3.geoAlbersUsa().fitSize([width, height], processedData);

    const path = d3.geoPath().projection(proj);

    return { projection: proj, pathGenerator: path };
  }, [processedData, width, height]);

  // Handle mouse events
  const handleMouseEnter = (event, feature) => {
    if (onFeatureHover) {
      onFeatureHover(event, feature);
    }
  };

  const handleMouseLeave = (event) => {
    if (onFeatureLeave) {
      onFeatureLeave(event);
    }
  };

  const handleClick = (event, feature) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
  };

  // Early return if no data or projection
  if (!processedData || !pathGenerator || !projection) {
    return null;
  }

  // Render the paths using React
  return (
    <g
      className="market-region-layer"
      transform={transform ? transform.toString() : undefined}
    >
      {processedData.features.map((feature, index) => {
        const pathString = pathGenerator(feature);
        if (!pathString) return null;

        return (
          <path
            key={`market-region-${index}`}
            d={pathString}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth / (transform ? transform.k : 1)}
            style={{ cursor: "pointer" }}
            onMouseEnter={(event) => handleMouseEnter(event, feature)}
            onMouseLeave={handleMouseLeave}
            onClick={(event) => handleClick(event, feature)}
            onMouseMove={(event) => {
              // Update tooltip position if needed
              if (onFeatureHover) {
                onFeatureHover(event, feature);
              }
            }}
          />
        );
      })}
    </g>
  );
};

export default MarketRegionLayer;
