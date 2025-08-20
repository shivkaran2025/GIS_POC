import React from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const MarketLayer = ({ marketData }) => {
  if (!marketData) return null;

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
        }}
        filter={[
          "all",
          ["!=", ["get", "Market"], "ALASKA"],
          ["!=", ["get", "Market"], "HAWAII HI"],
        ]}
      />
      <Layer
        id="market-outline"
        type="line"
        paint={{
          "line-color": "#ffffff",
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
