// import React, { useEffect, useState, useCallback, useRef } from "react";
// import MapGL from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";
// import bbox from "@turf/bbox";
// import {
//   getMarketRegions,
//   getSiteLocationsByCoordinates,
// } from "../../services/apiService";

// import MarketLayer from "./MarketLayer";
// import SiteLayer from "./SiteLayer";
// import MapTooltip from "./MapTooltip";

// const MAP_STYLE =
//   "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// const INITIAL_VIEW = {
//   longitude: -98,
//   latitude: 39,
//   zoom: 3.8,
// };

// const Map = () => {
//   const [marketData, setMarketData] = useState(null);
//   const [siteData, setSiteData] = useState(null);
//   const [currentView, setCurrentView] = useState("market");
//   const [loading, setLoading] = useState(false);

//   const [tooltip, setTooltip] = useState({
//     visible: false,
//     content: null,
//     x: 0,
//     y: 0,
//   });

//   const mapRef = useRef(null);
//   const hoveredFeatureIdRef = useRef(null);
//   const siteCacheRef = useRef({});

//   const makeCacheKey = (centerLat, centerLng, radius) => {
//     return `${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(
//       2
//     )}`;
//   };

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       const data = await getMarketRegions();
//       if (data) setMarketData(data);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   const handleMarketClick = useCallback((evt) => {
//     if (!evt.features || evt.features.length === 0) return;

//     const feature = evt.features[0];
//     if (!feature || feature.layer.id !== "market-fill") return;

//     const map = mapRef.current?.getMap();
//     if (!map) return;

//     const [minLng, minLat, maxLng, maxLat] = bbox(feature);
//     map.fitBounds(
//       [
//         [minLng, minLat],
//         [maxLng, maxLat],
//       ],
//       { padding: 50, duration: 1000 }
//     );

//     map.once("moveend", () => {
//       if (map.getZoom() < 10) {
//         map.zoomTo(10, { duration: 1000 });
//       }
//     });

//     setCurrentView("site");
//   }, []);

//   const getBoundsData = useCallback((mapInstance) => {
//     const bounds = mapInstance.getBounds();
//     const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
//     const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
//     const radius = Math.max(
//       bounds.getNorth() - bounds.getSouth(),
//       bounds.getEast() - bounds.getWest()
//     ) / 2;

//     return { centerLat, centerLng, radius, bounds };
//   }, []);

//   const handleMapDrag = useCallback(
//     async (evt) => {
//       if (currentView !== "site") return;

//       try {
//         const { centerLat, centerLng, radius } = getBoundsData(evt.target);
//         const cacheKey = makeCacheKey(centerLat, centerLng, radius);

//         if (siteCacheRef.current[cacheKey]) {
//           setSiteData(siteCacheRef.current[cacheKey]);
//           return;
//         }

//         setLoading(true);
//         const data = await getSiteLocationsByCoordinates(
//           centerLat,
//           centerLng,
//           radius
//         );
//         if (data) {
//           setSiteData(data);
//           siteCacheRef.current[cacheKey] = data;
//         }
//       } catch (error) {
//         console.error("Error fetching site data:", error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [currentView, getBoundsData]
//   );

//   const handleMove = useCallback(
//     async (evt) => {
//       const zoom = evt.viewState.zoom;

//       try {
//         if (zoom < 5) {
//           if (currentView !== "market") {
//             setCurrentView("market");
//             setLoading(true);
//             const data = await getMarketRegions();
//             if (data) setMarketData(data);
//             setLoading(false);
//           }
//         } else if (zoom >= 5 && zoom <= 9) {
//           if (currentView !== "neighborhood") {
//             setCurrentView("neighborhood");
//             console.log("Neighborhood layer triggered");
//           }
//         } else if (zoom > 9) {
//           if (currentView !== "site") {
//             setCurrentView("site");
//             const { centerLat, centerLng, radius } = getBoundsData(evt.target);
//             const cacheKey = makeCacheKey(centerLat, centerLng, radius);

//             if (siteCacheRef.current[cacheKey]) {
//               setSiteData(siteCacheRef.current[cacheKey]);
//               return;
//             }

//             setLoading(true);
//             const data = await getSiteLocationsByCoordinates(
//               centerLat,
//               centerLng,
//               radius
//             );
//             if (data) {
//               setSiteData(data);
//               siteCacheRef.current[cacheKey] = data;
//             }
//             setLoading(false);
//           }
//         }
//       } catch (error) {
//         console.error("Error in handleMove:", error);
//         setLoading(false);
//       }
//     },
//     [currentView, getBoundsData]
//   );

//   const handleMouseMove = useCallback((evt) => {
//     if (!evt.features || evt.features.length === 0) {
//       setTooltip((prev) => ({ ...prev, visible: false }));
//       return;
//     }

//     const feature = evt.features.find(
//       (f) => f.layer && f.layer.id === "market-fill"
//     );
//     const map = mapRef.current?.getMap();

//     if (!feature || !map) {
//       setTooltip((prev) => ({ ...prev, visible: false }));
//       return;
//     }

//     const newId = feature.id;
//     const prevId = hoveredFeatureIdRef.current;

//     if (prevId !== null && prevId !== newId) {
//       try {
//         map.setFeatureState({ source: "market", id: prevId }, { hover: false });
//       } catch {}
//     }
//     if (newId !== null) {
//       try {
//         map.setFeatureState({ source: "market", id: newId }, { hover: true });
//         hoveredFeatureIdRef.current = newId;
//       } catch {}
//     }

//     setTooltip({
//       visible: true,
//       content: feature,
//       x: evt.point.x,
//       y: evt.point.y,
//     });
//   }, []);

//   const handleMouseLeave = useCallback(() => {
//     const map = mapRef.current?.getMap();
//     const prevId = hoveredFeatureIdRef.current;

//     if (map && prevId !== null) {
//       try {
//         map.setFeatureState({ source: "market", id: prevId }, { hover: false });
//       } catch {}
//     }
//     hoveredFeatureIdRef.current = null;
//     setTooltip((prev) => ({ ...prev, visible: false }));
//   }, []);

//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <MapGL
//         ref={mapRef}
//         initialViewState={INITIAL_VIEW}
//         style={{ width: "100%", height: "100%" }}
//         mapStyle={MAP_STYLE}
//         onMoveEnd={handleMove}
//         onDragEnd={handleMapDrag}
//         interactiveLayerIds={["market-fill"]}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         onClick={handleMarketClick}
//       >
//         {currentView === "market" && <MarketLayer marketData={marketData} />}
//         {currentView === "site" && (
//           <SiteLayer siteData={siteData} setTooltip={setTooltip} />
//         )}
//       </MapGL>

//       <MapTooltip
//         visible={tooltip.visible}
//         content={tooltip.content}
//         x={tooltip.x}
//         y={tooltip.y}
//       />

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

//=========================================================================================================

import React, { useEffect, useState, useCallback, useRef } from "react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";

import {
  getMarketRegions,
  getSiteLocationsByCoordinates,
  getCdcNeighborhoods,
  getCdcNeighborhoodsByBounds,
} from "../../services/apiService";

import MarketLayer from "./MarketLayer";
import SiteLayer from "./SiteLayer";
import MapTooltip from "./MapTooltip";
import NeighborhoodLayer from "./NeighborhoodLayer";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW = {
  longitude: -98,
  latitude: 39,
  zoom: 3.8,
};

const Map = () => {
  const [marketData, setMarketData] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [Neighborhoodata, setNeighborhoodata] = useState(null);
  const [currentView, setCurrentView] = useState("market");
  const [loading, setLoading] = useState(false);

  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });

  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);
  const siteCacheRef = useRef({});

  // NEW: Add neighborhood cache and debouncing
  const neighborhoodCacheRef = useRef({});
  const debounceTimerRef = useRef(null);

  // Cache key functions
  const makeCacheKey = (centerLat, centerLng, radius) => {
    return `${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(
      2
    )}`;
  };

  // NEW: Make neighborhood cache key from bounds
  const makeNeighborhoodCacheKey = (north, south, east, west) => {
    return `${north.toFixed(3)}_${south.toFixed(3)}_${east.toFixed(
      3
    )}_${west.toFixed(3)}`;
  };

  // Initial market data load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getMarketRegions();
      if (data) setMarketData(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleMarketClick = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) return;

    const feature = evt.features[0];
    if (!feature || feature.layer.id !== "market-fill") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50, duration: 1000 }
    );

    map.once("moveend", () => {
      if (map.getZoom() < 10) {
        map.zoomTo(10, { duration: 800 });
      }
    });

    setCurrentView("site");
  }, []);

  const getBoundsData = useCallback((mapInstance) => {
    const bounds = mapInstance.getBounds();
    const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
    const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
    const radius =
      Math.max(
        bounds.getNorth() - bounds.getSouth(),
        bounds.getEast() - bounds.getWest()
      ) / 2;

    return { centerLat, centerLng, radius, bounds };
  }, []);

  // Load initial neighborhood data (fallback)
  useEffect(() => {
    (async () => {
      try {
        const data = await getCdcNeighborhoods();
        console.log(
          "Initial neighborhood data loaded:",
          data?.features?.length
        );
        // Don't set it immediately, let the bounds-based loading handle it
      } catch (err) {
        console.error("Error fetching CDC Neighborhoods:", err);
      }
    })();
  }, []);

  // NEW: Optimized neighborhood loading with caching
  const loadNeighborhoodsByBounds = useCallback(async (boundsData) => {
    const { north, south, east, west } = boundsData;
    const cacheKey = makeNeighborhoodCacheKey(north, south, east, west);

    console.log("Checking neighborhood cache for:", cacheKey);

    // Check cache first
    if (neighborhoodCacheRef.current[cacheKey]) {
      console.log("Using cached neighborhood data");
      setNeighborhoodata(neighborhoodCacheRef.current[cacheKey]);
      return;
    }

    console.log("Loading new neighborhood data for bounds:", boundsData);
    setLoading(true);

    try {
      const data = await getCdcNeighborhoodsByBounds(boundsData);

      if (data && data.features) {
        console.log(`Loaded ${data.features.length} neighborhoods`);
        setNeighborhoodata(data);
        // Cache the result
        neighborhoodCacheRef.current[cacheKey] = data;
      } else {
        console.warn("No neighborhood data received, using fallback");
        // Fallback to all neighborhoods
        const fallbackData = await getCdcNeighborhoods();
        if (fallbackData) {
          setNeighborhoodata(fallbackData);
          neighborhoodCacheRef.current[cacheKey] = fallbackData;
        }
      }
    } catch (error) {
      console.error("Error fetching neighborhood data:", error);
      // Fallback on error
      try {
        const fallbackData = await getCdcNeighborhoods();
        if (fallbackData) {
          setNeighborhoodata(fallbackData);
          neighborhoodCacheRef.current[cacheKey] = fallbackData;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMapDrag = useCallback(
    async (evt) => {
      if (currentView !== "site") return;

      try {
        const { centerLat, centerLng, radius } = getBoundsData(evt.target);
        const cacheKey = makeCacheKey(centerLat, centerLng, radius);

        if (siteCacheRef.current[cacheKey]) {
          setSiteData(siteCacheRef.current[cacheKey]);
          return;
        }

        setLoading(true);
        const data = await getSiteLocationsByCoordinates(
          centerLat,
          centerLng,
          radius
        );
        if (data) {
          setSiteData(data);
          siteCacheRef.current[cacheKey] = data;
        }
      } catch (error) {
        console.error("Error fetching site data:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentView, getBoundsData]
  );

  // NEW: Debounced neighborhood view move handler
  const handleNeighborhoodViewMove = useCallback(async () => {
    if (currentView !== "neighborhood") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the API call by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      const bounds = map.getBounds();
      const boundsData = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      await loadNeighborhoodsByBounds(boundsData);
    }, 300);
  }, [currentView, loadNeighborhoodsByBounds]);

  const handleMove = useCallback(
    async (evt) => {
      const zoom = evt.viewState.zoom;

      try {
        if (zoom < 5) {
          if (currentView !== "market") {
            setCurrentView("market");
            setLoading(true);
            const data = await getMarketRegions();
            if (data) setMarketData(data);
            setLoading(false);
          }
        } else if (zoom >= 5 && zoom <= 9) {
          if (currentView !== "neighborhood") {
            setCurrentView("neighborhood");
            console.log("Switching to neighborhood view");

            // Get current map bounds for viewport-based loading
            const map = mapRef.current?.getMap();
            if (map) {
              const bounds = map.getBounds();
              const boundsData = {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              };

              await loadNeighborhoodsByBounds(boundsData);
            }
          }
        } else if (zoom > 9) {
          if (currentView !== "site") {
            setCurrentView("site");
            const { centerLat, centerLng, radius } = getBoundsData(evt.target);
            const cacheKey = makeCacheKey(centerLat, centerLng, radius);

            if (siteCacheRef.current[cacheKey]) {
              setSiteData(siteCacheRef.current[cacheKey]);
              return;
            }

            setLoading(true);
            const data = await getSiteLocationsByCoordinates(
              centerLat,
              centerLng,
              radius
            );
            if (data) {
              setSiteData(data);
              siteCacheRef.current[cacheKey] = data;
            }
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in handleMove:", error);
        setLoading(false);
      }
    },
    [currentView, getBoundsData, loadNeighborhoodsByBounds]
  );

  const handleMouseMove = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    const feature = evt.features.find(
      (f) => f.layer && f.layer.id === "market-fill"
    );
    const map = mapRef.current?.getMap();

    if (!feature || !map) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    const newId = feature.id;
    const prevId = hoveredFeatureIdRef.current;

    if (prevId !== null && prevId !== newId) {
      try {
        map.setFeatureState({ source: "market", id: prevId }, { hover: false });
      } catch {}
    }
    if (newId !== null) {
      try {
        map.setFeatureState({ source: "market", id: newId }, { hover: true });
        hoveredFeatureIdRef.current = newId;
      } catch {}
    }

    setTooltip({
      visible: true,
      content: feature,
      x: evt.point.x,
      y: evt.point.y,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    const prevId = hoveredFeatureIdRef.current;

    if (map && prevId !== null) {
      try {
        map.setFeatureState({ source: "market", id: prevId }, { hover: false });
      } catch {}
    }
    hoveredFeatureIdRef.current = null;
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const updateTooltipPosition = () => {
      if (tooltip.visible && tooltip.content?.properties?.site_id) {
        const site = siteData?.sites?.find(
          (s) => s.site_id === tooltip.content.properties.site_id
        );
        if (site) {
          const lat = parseFloat(site.s_site_latitude);
          const lng = parseFloat(site.s_site_longitude);
          const point = map.project([lng, lat]);
          setTooltip((prev) => ({
            ...prev,
            x: point.x,
            y: point.y,
          }));
        }
      }
    };

    map.on("move", updateTooltipPosition);
    return () => {
      map.off("move", updateTooltipPosition);
    };
  }, [tooltip.visible, tooltip.content, siteData]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onMoveEnd={handleMove}
        onDragEnd={
          currentView === "neighborhood"
            ? handleNeighborhoodViewMove
            : handleMapDrag
        }
        interactiveLayerIds={["market-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleMarketClick}
      >
        {currentView === "market" && <MarketLayer marketData={marketData} />}
        {currentView === "neighborhood" && (
          <NeighborhoodLayer data={Neighborhoodata} />
        )}
        {currentView === "site" && (
          <SiteLayer siteData={siteData} setTooltip={setTooltip} />
        )}
      </MapGL>

      <MapTooltip
        visible={tooltip.visible}
        content={tooltip.content}
        x={tooltip.x}
        y={tooltip.y}
      />

      {/* Cache status indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        <div>
          View: <strong>{currentView}</strong>
        </div>
        {currentView === "neighborhood" && (
          <div>
            Features: {Neighborhoodata?.features?.length || 0}
            <br />
            Cache: {Object.keys(neighborhoodCacheRef.current).length} areas
          </div>
        )}
        {currentView === "site" && (
          <div>Sites: {siteData?.sites?.length || 0}</div>
        )}
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 123, 255, 0.9)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1002,
            fontWeight: "bold",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #ffffff40",
                borderTop: "2px solid #ffffff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            Loading {currentView === "neighborhood" ? "Neighborhoods" : "Data"}
            ...
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Map;
