import React from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const MarketLayer = ({ marketData }) => {
  if (!marketData || !marketData.features) return null;

  return (
    <Source
      id="market"
      type="geojson"
      data={{
        type: "FeatureCollection",
        features: marketData.features || [],
      }}
      generateId={true}
    >
      {/* Market Fill Layer */}
      <Layer
        id="market-fill"
        type="fill"
        paint={{
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            // "#EC7BB5",
            "#e20074",
            "#ec7cb5",
            // "#F1ADD0",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.9,
            0.7
          ]
        }}
        filter={[
          "all",
          ["!=", ["get", "Market"], "ALASKA"],
          ["!=", ["get", "Market"], "HAWAII HI"],
        ]}
      />
      
      {/* Market Outline Layer */}
      <Layer
        id="market-outline"
        type="line"
        paint={{
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
        }}
        filter={[
          "all",
          ["!=", ["get", "Market"], "ALASKA"],
          ["!=", ["get", "Market"], "HAWAII HI"],
        ]}
      />
    </Source>
  );
};

export default MarketLayer;
