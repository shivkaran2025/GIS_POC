// import React, { useEffect, useState, useCallback, useRef } from "react";
// import MapGL from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";
// import bbox from "@turf/bbox";
// import {
//   getMarketRegions,
//   getSiteLocationsByCoordinates,
//   getCdcNeighborhoods
// } from "../../services/apiService";

// import MarketLayer from "./MarketLayer";
// import SiteLayer from "./SiteLayer";
// import MapTooltip from "./MapTooltip";
// import NeighborhoodLayer from "./NeighborhoodLayer";

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
//   const [Neighborhoodata, setNeighborhoodata] = useState(null);
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
//     const radius =
//       Math.max(
//         bounds.getNorth() - bounds.getSouth(),
//         bounds.getEast() - bounds.getWest()
//       ) / 2;

//     return { centerLat, centerLng, radius, bounds };
//   }, []);

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getCdcNeighborhoods();
//         console.log(data);
//         setNeighborhoodata(data);
//       } catch (err) {
//         console.error("Error fetching CDC Neighborhoods:", err);
//       }
//     })();
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
//             console.log(currentView);
//             console.log("Neighborhood layer triggered");
//             const data = await getCdcNeighborhoods();
//             if (data) setNeighborhoodata(data);
//             console.log("nbr",data);
//             setLoading(false);
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

//   useEffect(() => {
//   const map = mapRef.current?.getMap();
//   if (!map) return;

//   const updateTooltipPosition = () => {
//     if (tooltip.visible && tooltip.content?.properties?.site_id) {
//       const site = siteData?.sites?.find(
//         (s) => s.site_id === tooltip.content.properties.site_id
//       );
//       if (site) {
//         const lat = parseFloat(site.s_site_latitude);
//         const lng = parseFloat(site.s_site_longitude);
//         const point = map.project([lng, lat]);
//         setTooltip((prev) => ({
//           ...prev,
//           x: point.x,
//           y: point.y,
//         }));
//       }
//     }
//   };

//   map.on("move", updateTooltipPosition);
//   return () => {
//     map.off("move", updateTooltipPosition);
//   };
// }, [tooltip.visible, tooltip.content, siteData]);


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
//         {currentView === "neighborhood" && <NeighborhoodLayer data={Neighborhoodata} />}
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



// import React, { useEffect, useState, useCallback, useRef } from "react";
// import MapGL from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";
// import bbox from "@turf/bbox";

// import { 
//   getMarketRegions, 
//   getSiteLocationsByCoordinates, 
//   getCdcNeighborhoods,
//   getCdcNeighborhoodsByBounds // Added this new import
// } from "../../services/apiService";

// import MarketLayer from "./MarketLayer";
// import SiteLayer from "./SiteLayer";
// import MapTooltip from "./MapTooltip";
// import NeighborhoodLayer from "./NeighborhoodLayer";

// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// const INITIAL_VIEW = {
//   longitude: -98,
//   latitude: 39,
//   zoom: 3.8,
// };

// const Map = () => {
//   const [marketData, setMarketData] = useState(null);
//   const [siteData, setSiteData] = useState(null);
//   const [Neighborhoodata, setNeighborhoodata] = useState(null);
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
//     return `${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(2)}`;
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

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getCdcNeighborhoods();
//         console.log(data);
//         setNeighborhoodata(data);
//       } catch (err) {
//         console.error("Error fetching CDC Neighborhoods:", err);
//       }
//     })();
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

//   // NEW: Handler for neighborhood pan/drag
//   const handleNeighborhoodViewMove = useCallback(async () => {
//     if (currentView !== "neighborhood") return;
    
//     const map = mapRef.current?.getMap();
//     if (!map) return;
    
//     try {
//       const bounds = map.getBounds();
//       const boundsData = {
//         north: bounds.getNorth(),
//         south: bounds.getSouth(),
//         east: bounds.getEast(),
//         west: bounds.getWest()
//       };
      
//       console.log("Updating neighborhoods for new bounds:", boundsData);
//       setLoading(true);
      
//       const data = await getCdcNeighborhoodsByBounds(boundsData);
//       if (data && data.features) {
//         setNeighborhoodata(data);
//         console.log(`Updated neighborhood data, features: ${data.features.length}`);
//       }
//     } catch (error) {
//       console.error("Error updating neighborhood data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentView]);

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
//             console.log("Switching to neighborhood view - fetching bounds data");
//             setLoading(true);
            
//             try {
//               // UPDATED: Get current map bounds for viewport-based loading
//               const map = mapRef.current?.getMap();
//               if (map) {
//                 const bounds = map.getBounds();
//                 const boundsData = {
//                   north: bounds.getNorth(),
//                   south: bounds.getSouth(),
//                   east: bounds.getEast(),
//                   west: bounds.getWest()
//                 };
                
//                 console.log("Current viewport bounds:", boundsData);
                
//                 // Fetch only neighborhoods within current bounds
//                 const data = await getCdcNeighborhoodsByBounds(boundsData);
//                 console.log("CDC Neighborhoods data received:", data);
                
//                 if (data && data.features) {
//                   setNeighborhoodata(data);
//                   console.log(`Neighborhood data set successfully, features: ${data.features.length}`);
//                 } else {
//                   console.warn("No neighborhood data received for current bounds");
//                   // Fallback to old method if bounds API fails
//                   const fallbackData = await getCdcNeighborhoods();
//                   if (fallbackData) setNeighborhoodata(fallbackData);
//                 }
//               }
//             } catch (error) {
//               console.error("Error fetching neighborhood data:", error);
//               // Fallback to old method on error
//               try {
//                 const fallbackData = await getCdcNeighborhoods();
//                 if (fallbackData) setNeighborhoodata(fallbackData);
//               } catch (fallbackError) {
//                 console.error("Fallback also failed:", fallbackError);
//               }
//             }
//             setLoading(false);
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

//   useEffect(() => {
//     const map = mapRef.current?.getMap();
//     if (!map) return;

//     const updateTooltipPosition = () => {
//       if (tooltip.visible && tooltip.content?.properties?.site_id) {
//         const site = siteData?.sites?.find(
//           (s) => s.site_id === tooltip.content.properties.site_id
//         );
//         if (site) {
//           const lat = parseFloat(site.s_site_latitude);
//           const lng = parseFloat(site.s_site_longitude);
//           const point = map.project([lng, lat]);
//           setTooltip((prev) => ({
//             ...prev,
//             x: point.x,
//             y: point.y,
//           }));
//         }
//       }
//     };

//     map.on("move", updateTooltipPosition);
//     return () => {
//       map.off("move", updateTooltipPosition);
//     };
//   }, [tooltip.visible, tooltip.content, siteData]);

//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <MapGL
//         ref={mapRef}
//         initialViewState={INITIAL_VIEW}
//         style={{ width: "100%", height: "100%" }}
//         mapStyle={MAP_STYLE}
//         onMoveEnd={handleMove}
//         onDragEnd={currentView === "neighborhood" ? handleNeighborhoodViewMove : handleMapDrag}
//         interactiveLayerIds={["market-fill"]}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         onClick={handleMarketClick}
//       >
//         {currentView === "market" && <MarketLayer marketData={marketData} />}
//         {currentView === "neighborhood" && <NeighborhoodLayer data={Neighborhoodata} />}
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


//-----------------------------------------------------------

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import MapGL from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";
// import bbox from "@turf/bbox";

// import { 
//   getMarketRegions, 
//   getSiteLocationsByCoordinates, 
//   getCdcNeighborhoods,
//   getCdcNeighborhoodsByBounds // Added this new import
// } from "../../services/apiService";

// import MarketLayer from "./MarketLayer";
// import SiteLayer from "./SiteLayer";
// import MapTooltip from "./MapTooltip";
// import NeighborhoodLayer from "./NeighborhoodLayer";

// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// const INITIAL_VIEW = {
//   longitude: -98,
//   latitude: 39,
//   zoom: 3.8,
// };

// const Map = () => {
//   const [marketData, setMarketData] = useState(null);
//   const [siteData, setSiteData] = useState(null);
//   const [Neighborhoodata, setNeighborhoodata] = useState(null);
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
  
//   // NEW: Add neighborhood cache and debouncing
//   const neighborhoodCacheRef = useRef({});
//   const debounceTimerRef = useRef(null);

//   // Cache key functions
//   const makeCacheKey = (centerLat, centerLng, radius) => {
//     return `${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(2)}`;
//   };

//   // NEW: Make neighborhood cache key from bounds
//   const makeNeighborhoodCacheKey = (north, south, east, west) => {
//     return `${north.toFixed(3)}_${south.toFixed(3)}_${east.toFixed(3)}_${west.toFixed(3)}`;
//   };

//   // Initial market data load
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

//   // Load initial neighborhood data (fallback)
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getCdcNeighborhoods();
//         console.log("Initial neighborhood data loaded:", data?.features?.length);
//         // Don't set it immediately, let the bounds-based loading handle it
//       } catch (err) {
//         console.error("Error fetching CDC Neighborhoods:", err);
//       }
//     })();
//   }, []);

//   // NEW: Optimized neighborhood loading with caching
//   const loadNeighborhoodsByBounds = useCallback(async (boundsData) => {
//     const { north, south, east, west } = boundsData;
//     const cacheKey = makeNeighborhoodCacheKey(north, south, east, west);
    
//     console.log("Checking neighborhood cache for:", cacheKey);
    
//     // Check cache first
//     if (neighborhoodCacheRef.current[cacheKey]) {
//       console.log("Using cached neighborhood data");
//       setNeighborhoodata(neighborhoodCacheRef.current[cacheKey]);
//       return;
//     }

//     console.log("Loading new neighborhood data for bounds:", boundsData);
//     setLoading(true);
    
//     try {
//       const data = await getCdcNeighborhoodsByBounds(boundsData);
      
//       if (data && data.features) {
//         console.log(`Loaded ${data.features.length} neighborhoods`);
//         setNeighborhoodata(data);
//         // Cache the result
//         neighborhoodCacheRef.current[cacheKey] = data;
//       } else {
//         console.warn("No neighborhood data received, using fallback");
//         // Fallback to all neighborhoods
//         const fallbackData = await getCdcNeighborhoods();
//         if (fallbackData) {
//           setNeighborhoodata(fallbackData);
//           neighborhoodCacheRef.current[cacheKey] = fallbackData;
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching neighborhood data:", error);
//       // Fallback on error
//       try {
//         const fallbackData = await getCdcNeighborhoods();
//         if (fallbackData) {
//           setNeighborhoodata(fallbackData);
//           neighborhoodCacheRef.current[cacheKey] = fallbackData;
//         }
//       } catch (fallbackError) {
//         console.error("Fallback also failed:", fallbackError);
//       }
//     } finally {
//       setLoading(false);
//     }
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

//   // NEW: Debounced neighborhood view move handler
//   const handleNeighborhoodViewMove = useCallback(async () => {
//     if (currentView !== "neighborhood") return;
    
//     const map = mapRef.current?.getMap();
//     if (!map) return;
    
//     // Clear previous debounce timer
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }
    
//     // Debounce the API call by 300ms
//     debounceTimerRef.current = setTimeout(async () => {
//       const bounds = map.getBounds();
//       const boundsData = {
//         north: bounds.getNorth(),
//         south: bounds.getSouth(),
//         east: bounds.getEast(),
//         west: bounds.getWest()
//       };
      
//       await loadNeighborhoodsByBounds(boundsData);
//     }, 300);
//   }, [currentView, loadNeighborhoodsByBounds]);

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
//             console.log("Switching to neighborhood view");
            
//             // Get current map bounds for viewport-based loading
//             const map = mapRef.current?.getMap();
//             if (map) {
//               const bounds = map.getBounds();
//               const boundsData = {
//                 north: bounds.getNorth(),
//                 south: bounds.getSouth(),
//                 east: bounds.getEast(),
//                 west: bounds.getWest()
//               };
              
//               await loadNeighborhoodsByBounds(boundsData);
//             }
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
//     [currentView, getBoundsData, loadNeighborhoodsByBounds]
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

//   useEffect(() => {
//     const map = mapRef.current?.getMap();
//     if (!map) return;

//     const updateTooltipPosition = () => {
//       if (tooltip.visible && tooltip.content?.properties?.site_id) {
//         const site = siteData?.sites?.find(
//           (s) => s.site_id === tooltip.content.properties.site_id
//         );
//         if (site) {
//           const lat = parseFloat(site.s_site_latitude);
//           const lng = parseFloat(site.s_site_longitude);
//           const point = map.project([lng, lat]);
//           setTooltip((prev) => ({
//             ...prev,
//             x: point.x,
//             y: point.y,
//           }));
//         }
//       }
//     };

//     map.on("move", updateTooltipPosition);
//     return () => {
//       map.off("move", updateTooltipPosition);
//     };
//   }, [tooltip.visible, tooltip.content, siteData]);

//   // Cleanup debounce timer on unmount
//   useEffect(() => {
//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//     };
//   }, []);

//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <MapGL
//         ref={mapRef}
//         initialViewState={INITIAL_VIEW}
//         style={{ width: "100%", height: "100%" }}
//         mapStyle={MAP_STYLE}
//         onMoveEnd={handleMove}
//         onDragEnd={currentView === "neighborhood" ? handleNeighborhoodViewMove : handleMapDrag}
//         interactiveLayerIds={["market-fill"]}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         onClick={handleMarketClick}
//       >
//         {currentView === "market" && <MarketLayer marketData={marketData} />}
//         {currentView === "neighborhood" && <NeighborhoodLayer data={Neighborhoodata} />}
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

//       {/* Cache status indicator */}
//       <div
//         style={{
//           position: "absolute",
//           top: "10px",
//           right: "10px",
//           backgroundColor: "rgba(255, 255, 255, 0.9)",
//           padding: "8px 12px",
//           borderRadius: "4px",
//           fontSize: "12px",
//           zIndex: 1000,
//         }}
//       >
//         <div>View: <strong>{currentView}</strong></div>
//         {currentView === "neighborhood" && (
//           <div>
//             Features: {Neighborhoodata?.features?.length || 0}
//             <br />
//             Cache: {Object.keys(neighborhoodCacheRef.current).length} areas
//           </div>
//         )}
//         {currentView === "site" && (
//           <div>Sites: {siteData?.sites?.length || 0}</div>
//         )}
//       </div>

//       {loading && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "rgba(0, 123, 255, 0.9)",
//             color: "white",
//             padding: "16px 24px",
//             borderRadius: "8px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//             zIndex: 1002,
//             fontWeight: "bold",
//           }}
//         >
//           <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
//             <div style={{
//               width: '20px', 
//               height: '20px', 
//               border: '2px solid #ffffff40', 
//               borderTop: '2px solid #ffffff', 
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite'
//             }}></div>
//             Loading {currentView === 'neighborhood' ? 'Neighborhoods' : 'Data'}...
//           </div>
//         </div>
//       )}
      
//       <style jsx>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Map;

//-------------------------------------------------------------------------
import React, { useEffect, useState, useCallback, useRef } from "react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";

import { 
  getMarketRegions, 
  getSiteLocationsByCoordinates, 
  getZipCodes,
  getZipCodesByBounds
} from "../../services/apiService";

import MarketLayer from "./MarketLayer";
import SiteLayer from "./SiteLayer";
import MapTooltip from "./MapTooltip";
import NeighborhoodLayer from "./NeighborhoodLayer"; // Will show ZIP codes now

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW = {
  longitude: -98,
  latitude: 39,
  zoom: 3.8,
};

const Map = () => {
  const [marketData, setMarketData] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [zipCodeData, setZipCodeData] = useState(null);
  const [currentView, setCurrentView] = useState("market");
  const [loading, setLoading] = useState(false);

  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });

  // All useRef declarations
  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);
  const siteCacheRef = useRef({});
  const zipCodeCacheRef = useRef({});
  const debounceTimerRef = useRef(null);

  // Cache and utility functions
  const makeCacheKey = (centerLat, centerLng, radius) => {
    return `${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(2)}`;
  };

  const makeZipCodeCacheKey = (north, south, east, west) => {
    return `${north.toFixed(3)}_${south.toFixed(3)}_${east.toFixed(3)}_${west.toFixed(3)}`;
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

  // Market click handler
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
        map.zoomTo(10, { duration: 1000 });
      }
    });

    setCurrentView("site");
  }, []);

  const getBoundsData = useCallback((mapInstance) => {
    const bounds = mapInstance.getBounds();
    const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
    const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
    const radius = Math.max(
      bounds.getNorth() - bounds.getSouth(),
      bounds.getEast() - bounds.getWest()
    ) / 2;

    return { centerLat, centerLng, radius, bounds };
  }, []);

  // ZIP code loading with auto-fit bounds
  const loadZipCodesByBounds = useCallback(async (boundsData) => {
    const { north, south, east, west } = boundsData;
    const cacheKey = makeZipCodeCacheKey(north, south, east, west);
    
    console.log("📦 Checking ZIP code cache for:", cacheKey);
    
    if (zipCodeCacheRef.current[cacheKey]) {
      console.log("✅ Using cached ZIP code data");
      setZipCodeData(zipCodeCacheRef.current[cacheKey]);
      return;
    }

    console.log("🌐 Loading new ZIP code data for bounds:", boundsData);
    setLoading(true);
    
    try {
      const data = await getZipCodesByBounds ? await getZipCodesByBounds(boundsData) : await getZipCodes();
      
      console.log("📊 Received ZIP code data:", data);
      
      if (data && data.features) {
        console.log(`✅ Loaded ${data.features.length} ZIP codes`);
        setZipCodeData(data);
        zipCodeCacheRef.current[cacheKey] = data;
        
        // Auto-fit to ZIP codes bounds on first load
        if (Object.keys(zipCodeCacheRef.current).length === 1) {
          setTimeout(() => {
            const map = mapRef.current?.getMap();
            if (map && data.features.length > 0) {
              try {
                const combinedFeature = {
                  type: "FeatureCollection",
                  features: data.features
                };
                
                const bounds = bbox(combinedFeature);
                console.log("📏 Auto-fitting to ZIP codes bounds:", bounds);
                
                // ✅ FIXED: Correct bounds format [west, south, east, north]
                map.fitBounds(
                  [[bounds[0], bounds[1]], [bounds[1], bounds[2]]], 
                  { padding: 100, duration: 2000 }
                );
              } catch (bboxError) {
                console.warn("⚠️ Error calculating bounds:", bboxError);
              }
            }
          }, 1000);
        }
        
      } else {
        console.warn("⚠️ No ZIP code data received");
        const fallbackData = await getZipCodes();
        if (fallbackData && fallbackData.features) {
          setZipCodeData(fallbackData);
          zipCodeCacheRef.current[cacheKey] = fallbackData;
        }
      }
    } catch (error) {
      console.error("❌ Error fetching ZIP code data:", error);
      try {
        const fallbackData = await getZipCodes();
        if (fallbackData && fallbackData.features) {
          setZipCodeData(fallbackData);
          zipCodeCacheRef.current[cacheKey] = fallbackData;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Site data loading
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

  // Debounced ZIP code movement
  const handleZipCodeViewMove = useCallback(async () => {
    if (currentView !== "zipcode") return;
    
    const map = mapRef.current?.getMap();
    if (!map) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(async () => {
      const bounds = map.getBounds();
      const boundsData = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      
      await loadZipCodesByBounds(boundsData);
    }, 300);
  }, [currentView, loadZipCodesByBounds]);

  // ✅ MAIN ZOOM-BASED VIEW SWITCHING
  const handleMove = useCallback(
    async (evt) => {
      const zoom = evt.viewState.zoom;
      console.log("🔍 Current zoom level:", zoom, "- Current view:", currentView);

      try {
        if (zoom < 5) {
          // Market view
          if (currentView !== "market") {
            console.log("📍 Switching to MARKET view");
            setCurrentView("market");
            setLoading(true);
            const data = await getMarketRegions();
            if (data) setMarketData(data);
            setLoading(false);
          }
        } else if (zoom >= 5 && zoom <= 9) {
          // ZIP code view
          if (currentView !== "zipcode") {
            console.log("📍 Switching to ZIPCODE view");
            setCurrentView("zipcode");
            
            const map = mapRef.current?.getMap();
            if (map) {
              const bounds = map.getBounds();
              const boundsData = {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
              };
              
              console.log("📍 Map bounds:", boundsData);
              await loadZipCodesByBounds(boundsData);
            }
          }
        } else if (zoom > 9) {
          // Site view
          if (currentView !== "site") {
            console.log("📍 Switching to SITE view");
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
        console.error("❌ Error in handleMove:", error);
        setLoading(false);
      }
    },
    [currentView, getBoundsData, loadZipCodesByBounds]
  );

  // Mouse interaction handlers
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

  // Tooltip position updates
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

  // Cleanup
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
        onDragEnd={currentView === "zipcode" ? handleZipCodeViewMove : handleMapDrag}
        interactiveLayerIds={["market-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleMarketClick}
      >
        {/* ✅ ALL THREE LAYERS MAINTAINED */}
        {currentView === "market" && <MarketLayer marketData={marketData} />}
        {currentView === "zipcode" && <NeighborhoodLayer data={zipCodeData} />}
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

      {/* Enhanced status indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "13px",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
          minWidth: "220px"
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          <strong style={{ color: "#2196f3" }}>🗺️ Multi-Layer Map Status</strong>
        </div>
        
        <div style={{ fontSize: "12px", lineHeight: "1.4", marginBottom: "8px" }}>
          <div><strong>Current View:</strong> <span style={{
            color: currentView === "market" ? "#9c27b0" : 
                  currentView === "zipcode" ? "#ff5722" : "#4caf50",
            textTransform: "uppercase",
            fontWeight: "bold"
          }}>{currentView}</span></div>
          <div><strong>Status:</strong> {loading ? "Loading..." : "Ready"}</div>
        </div>

        {/* View-specific stats */}
        {currentView === "zipcode" && (
          <div style={{ fontSize: "11px", marginBottom: "8px", padding: "6px", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
            <div><strong>ZIP Codes:</strong> {zipCodeData?.features?.length || 0}</div>
            <div><strong>Cache:</strong> {Object.keys(zipCodeCacheRef.current).length} areas</div>
          </div>
        )}
        
        {currentView === "site" && (
          <div style={{ fontSize: "11px", marginBottom: "8px", padding: "6px", backgroundColor: "#e8f5e8", borderRadius: "4px" }}>
            <div><strong>Sites:</strong> {siteData?.sites?.length || 0}</div>
            <div><strong>Cache:</strong> {Object.keys(siteCacheRef.current).length} areas</div>
          </div>
        )}
        
        {currentView === "market" && (
          <div style={{ fontSize: "11px", marginBottom: "8px", padding: "6px", backgroundColor: "#f3e5f5", borderRadius: "4px" }}>
            <div><strong>Markets:</strong> {marketData?.features?.length || 0}</div>
          </div>
        )}

        {/* Debug button - only for ZIP codes */}
        {currentView === "zipcode" && zipCodeData?.features?.length > 0 && (
          <button
            onClick={() => {
              const firstFeature = zipCodeData.features[0];
              console.log("🔍 Debug info:");
              console.log("First feature:", firstFeature);
              console.log("Properties:", firstFeature.properties);
              
              if (firstFeature.geometry) {
                try {
                  const bounds = bbox(firstFeature);
                  const map = mapRef.current?.getMap();
                  if (map) {
                    // ✅ FIXED: Correct bounds format
                    map.fitBounds(
                      [[bounds[0], bounds[1]], [bounds[1], bounds[2]]], 
                      { padding: 100, duration: 1000 }
                    );
                  }
                } catch (e) {
                  console.error("Error zooming to feature:", e);
                }
              }
            }}
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              backgroundColor: "#ff5722",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%"
            }}
          >
            🔍 Debug First ZIP Code
          </button>
        )}

        {/* Zoom level guide */}
        <div style={{ fontSize: "10px", marginTop: "8px", color: "#666", borderTop: "1px solid #eee", paddingTop: "6px" }}>
          <div><strong>Zoom Guide:</strong></div>
          <div>• &lt; 5: Markets</div>
          <div>• 5-9: ZIP Codes</div>
          <div>• &gt; 9: Sites</div>
        </div>
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 123, 255, 0.95)",
            color: "white",
            padding: "20px 30px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 1002,
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '24px', 
              height: '24px', 
              border: '3px solid rgba(255,255,255,0.3)', 
              borderTop: '3px solid #ffffff', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>
              Loading {currentView === 'zipcode' ? 'ZIP Codes' : 
                     currentView === 'site' ? 'Sites' : 'Map Data'}...
            </span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Map;
