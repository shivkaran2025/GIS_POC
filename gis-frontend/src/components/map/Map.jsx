// // Map.jsx
// import React, { useRef, useEffect, useState, useCallback } from "react";
// import * as d3 from "d3";
// import { useMapData } from "../../hooks/useMapData";
// import MarketRegionLayer from "./MarketRegionLayer";
// import SiteLocationLayer from "./SiteLocationLayer";
// import MapTooltip from "./MapTooltip";

// const Map = ({ width = 800, height = 500, minZoom = 1, maxZoom = 50 }) => {
//   const svgRef = useRef();
//   const containerRef = useRef();
//   const [tooltip, setTooltip] = useState({
//     visible: false,
//     content: null,
//     x: 0,
//     y: 0,
//   });
//   const [transform, setTransform] = useState(d3.zoomIdentity);
//   const [containerDimensions, setContainerDimensions] = useState({
//     width: width,
//     height: height,
//   });

//   const { currentData, currentView, loading, loadDataByZoomLevel } = useMapData();

//   // Resize listener
//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const rect = containerRef.current.getBoundingClientRect();
//         setContainerDimensions({
//           width: rect.width || 800,
//           height: rect.height || 500,
//         });
//       }
//     };
//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   const handleZoom = useCallback(
//     (event) => {
//       const { transform: newTransform } = event;
//       setTransform(newTransform);

//       const zoomLevel = newTransform.k;

//       // Convert screen bounds to lat/lng bounds
//       const projection = d3.geoAlbersUsa()
//         .translate([containerDimensions.width / 2, containerDimensions.height / 2])
//         .scale(containerDimensions.width);

//       const invert = projection.invert;

//       if (invert) {
//         const nw = invert([0, 0]); // top-left corner
//         const se = invert([containerDimensions.width, containerDimensions.height]); // bottom-right corner

//         if (nw && se) {
//           const bounds = [
//             [nw[0], nw[1]], // [lng, lat]
//             [se[0], se[1]],
//           ];
//           loadDataByZoomLevel(zoomLevel, bounds);
//         } else {
//           loadDataByZoomLevel(zoomLevel);
//         }
//       } else {
//         loadDataByZoomLevel(zoomLevel);
//       }
//     },
//     [loadDataByZoomLevel, containerDimensions.width, containerDimensions.height]
//   );

//   const handleFeatureHover = useCallback((event, feature) => {
//     setTooltip({
//       visible: true,
//       content: feature,
//       x: event.pageX,
//       y: event.pageY,
//     });
//   }, []);

//   const handleFeatureLeave = useCallback(() => {
//     setTooltip({ visible: false, content: null, x: 0, y: 0 });
//   }, []);

//   const handleReset = useCallback(() => {
//     const svg = d3.select(svgRef.current);
//     svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
//   }, []);

//   // Setup zoom
//   useEffect(() => {
//     const svg = d3.select(svgRef.current);
//     svg.on(".zoom", null);

//     svg
//       .attr("viewBox", `0 0 ${containerDimensions.width} ${containerDimensions.height}`)
//       .attr("width", "100%")
//       .attr("height", "100%")
//       .style("cursor", "grab");

//     const zoom = d3
//       .zoom()
//       .scaleExtent([minZoom, maxZoom])
//       .translateExtent([[0, 0], [containerDimensions.width, containerDimensions.height]])
//       .on("zoom", handleZoom);

//     svg.call(zoom);

//     svg.on("dblclick.zoom", null);
//     svg.on("dblclick", function (event) {
//       event.preventDefault();
//       handleReset();
//     });

//     return () => {
//       svg.on(".zoom", null);
//       svg.on("dblclick", null);
//     };
//   }, [
//     containerDimensions.width,
//     containerDimensions.height,
//     minZoom,
//     maxZoom,
//     handleZoom,
//     handleReset,
//   ]);

//   return (
//     <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
//       <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
//         <g className="content-group">
//           {currentView === "market" && currentData && (
//             <MarketRegionLayer
//               width={containerDimensions.width}
//               height={containerDimensions.height}
//               onFeatureHover={handleFeatureHover}
//               onFeatureLeave={handleFeatureLeave}
//               transform={transform}
//               data={currentData}
//               strokeWidth={1}
//               strokeColor="#fff"
//               fillColor="#69b3a2"
//             />
//           )}

//           {currentView === "site" && currentData && (
//             <SiteLocationLayer
//               width={containerDimensions.width}
//               height={containerDimensions.height}
//               data={currentData}
//               transform={transform}
//               onFeatureHover={handleFeatureHover}
//               onFeatureLeave={handleFeatureLeave}
//             />
//           )}
//         </g>
//       </svg>

//       <MapTooltip visible={tooltip.visible} content={tooltip.content} x={tooltip.x} y={tooltip.y} />

//       {loading && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "rgba(255, 255, 255, 0.9)",
//             padding: "16px 24px",
//             borderRadius: "8px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//             zIndex: 1002,
//           }}
//         >
//           Loading...
//         </div>
//       )}
//     </div>
//   );
// };

// export default Map;
import React, { useEffect, useState, useCallback, useRef } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  getMarketRegions,
  getSiteLocationsByCoordinates,
} from "../../services/apiService";
import MapTooltip from "./MapTooltip";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const INITIAL_VIEW = {
  longitude: -98,
  latitude: 39,
  zoom: 3.5,
};

const MapLibreComponent = () => {
  const [marketData, setMarketData] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [currentView, setCurrentView] = useState("market");
  const [loading, setLoading] = useState(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });

  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);

  // fetch market regions initially
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getMarketRegions();
      if (data) setMarketData(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleMove = useCallback(
    async (evt) => {
      const zoom = evt.viewState.zoom;

      if (zoom < 8) {
        if (currentView !== "market") {
          setCurrentView("market");
          const data = await getMarketRegions();
          if (data) setMarketData(data);
        }
      } else {
        if (currentView !== "site") {
          setCurrentView("site");

          const bounds = evt.target.getBounds();
          const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
          const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
          const radius =
            Math.max(
              bounds.getNorth() - bounds.getSouth(),
              bounds.getEast() - bounds.getWest()
            ) / 2;

          const data = await getSiteLocationsByCoordinates(
            centerLat,
            centerLng,
            radius
          );
          if (data) setSiteData(data);
        }
      }
    },
    [currentView]
  );

  const handleMouseMove = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) {
      // Hide tooltip when no features
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    const feature = evt.features.find(
      (f) => f.layer && f.layer.id === "market-fill"
    );

    const map =
      mapRef.current && mapRef.current.getMap ? mapRef.current.getMap() : null;

    if (!feature || !map) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Update hover state for styling
    const newId = feature.id;
    const prevId = hoveredFeatureIdRef.current;
    if (prevId !== null && prevId !== undefined && prevId !== newId) {
      try {
        map.setFeatureState({ source: "market", id: prevId }, { hover: false });
      } catch (_) {}
    }
    if (newId !== null && newId !== undefined) {
      try {
        map.setFeatureState({ source: "market", id: newId }, { hover: true });
        hoveredFeatureIdRef.current = newId;
      } catch (_) {}
    }

    // Update tooltip
    setTooltip({
      visible: true,
      content: feature,
      x: evt.point.x,
      y: evt.point.y,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map =
      mapRef.current && mapRef.current.getMap ? mapRef.current.getMap() : null;
    const prevId = hoveredFeatureIdRef.current;

    if (map && prevId !== null && prevId !== undefined) {
      try {
        map.setFeatureState({ source: "market", id: prevId }, { hover: false });
      } catch (_) {}
    }

    hoveredFeatureIdRef.current = null;

    // Hide tooltip
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onMoveEnd={handleMove}
        interactiveLayerIds={["market-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Market regions layer */}
        {currentView === "market" && marketData && (
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
                "fill-color": "#69b3a2",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.65,
                  0.35,
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
                "line-width": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  2,
                  1,
                ],
              }}
              filter={[
                "all",
                ["!=", ["get", "Market"], "ALASKA"],
                ["!=", ["get", "Market"], "HAWAII HI"],
              ]}
            />
          </Source>
        )}

        {/* Site locations as dark grey markers - REPLACED CIRCLE LAYER */}
        {currentView === "site" &&
          siteData &&
          siteData.sites &&
          siteData.sites.map((site, index) => {
            const lat = parseFloat(site.s_site_latitude);
            const lng = parseFloat(site.s_site_longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={`${site.site_id}-${index}`}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "#333333", // Dark grey
                    border: "2px solid white",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      content: { properties: { site_id: site.site_id } },
                      x: e.pageX,
                      y: e.pageY,
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip((prev) => ({ ...prev, visible: false }));
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(45deg)",
                    }}
                  />
                </div>
              </Marker>
            );
          })}
      </Map>

      {/* Tooltip Component */}
      <MapTooltip
        visible={tooltip.visible}
        content={tooltip.content}
        x={tooltip.x}
        y={tooltip.y}
      />

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "12px 20px",
            borderRadius: "6px",
            zIndex: 999,
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default MapLibreComponent;
