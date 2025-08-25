import React, { useEffect, useState, useCallback, useRef } from "react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";

import {
  getMarketRegions,
  getSiteLocationsByCoordinates,
  getCdcNeighborhoodsByBounds,
} from "../../services/apiService";

import MarketLayer from "./MarketLayer";
import NeighborhoodLayer from "./NeighborhoodLayer";
import SiteLayer from "./SiteLayer";
import MapTooltip from "./MapTooltip";
import MapHeader from "./MapHeader";
import MapControls from "./MapControls";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW = {
  longitude: -98,
  latitude: 41,
  zoom: 3.5,
};

const ZOOM_LEVELS = {
  NATIONAL: { min: 0, max: 5 },
  MARKET: { min: 5, max: 7 },
  NEIGHBORHOOD: { min: 8, max: 9.5 },
  SITE: { min: 9.5, max: 22 }
};

const EnhancedMap = ({ onMarketSelect, onNeighborhoodSelect, onViewChange  }) => {
  const [currentView, setCurrentView] = useState("NATIONAL");
  const [currentMarket, setCurrentMarket] = useState(null);
  const [currentNeighborhoods, setCurrentNeighborhoods] = useState([]);
  
  const [marketData, setMarketData] = useState(null);
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [siteData, setSiteData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });
  const [isManualTransition, setIsManualTransition] = useState(false);
  const [isControlHovered, setIsControlHovered] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  console.log("currentView", currentView);

  const mapRef = useRef(null);
  const hoveredFeatureIdRef = useRef(null);
  const siteCacheRef = useRef({});
  const neighborhoodCacheRef = useRef({});

  // Cache key functions
  const makeSiteCacheKey = (centerLat, centerLng, radius) => {
    return `site_${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(2)}`;
  };

  const makeNeighborhoodCacheKey = (north, south, east, west) => {
    return `neighborhood_${north.toFixed(3)}_${south.toFixed(3)}_${east.toFixed(3)}_${west.toFixed(3)}`;
  };

  // Initial market data load
  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true);
      try {
        const data = await getMarketRegions();
        if (data) setMarketData(data);
        console.log("loadMarketData", data);
      } catch (error) {
        console.error("Error loading market data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMarketData();
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

  // Load neighborhoods for current market area
  const loadNeighborhoods = useCallback(async (bounds) => {
    const { north, south, east, west } = bounds;
    const cacheKey = makeNeighborhoodCacheKey(north, south, east, west);

    if (neighborhoodCacheRef.current[cacheKey]) {
      setNeighborhoodData(neighborhoodCacheRef.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const data = await getCdcNeighborhoodsByBounds({ north, south, east, west });
      if (data) {
        console.log("loadNeighborhoods", data);
        setNeighborhoodData(data);
        neighborhoodCacheRef.current[cacheKey] = data;
      }
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle market click to zoom into market
  const handleMarketClick = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) return;

    const feature = evt.features[0];
    console.log("handleMarketClick", feature, evt);
    if (!feature || feature.layer.id !== "market-fill") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const marketName = feature.properties.Market;

    // 🔥 Send marketId to parent
    if (onMarketSelect) {
      onMarketSelect(marketName);
    }

    
    // If we're already in MARKET view and clicking on the same market, zoom to neighborhood level
    if (currentView === "MARKET" && currentMarket === marketName) {
      // Set manual transition flag to prevent handleMove from overriding
      setIsManualTransition(true);
      
      // Zoom to neighborhood level for this market
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 20, duration: 1000 }
      );

      map.once("moveend", async () => {
        // Zoom to neighborhood level
        const targetZoom = Math.max(ZOOM_LEVELS.NEIGHBORHOOD.min, map.getZoom());
        map.zoomTo(targetZoom, { duration: 800 });
        
        // Load neighborhoods for the current area after zoom
        const bounds = map.getBounds();
        await loadNeighborhoods({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
        
        // Clear manual transition flag after transition is complete
        setTimeout(() => setIsManualTransition(false), 500);
      });

      setCurrentView("NEIGHBORHOOD");
      return;
    }

    // If we're in NATIONAL view, zoom to market level
    setIsManualTransition(true);
    setCurrentMarket(marketName);

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 20, duration: 1000 }
    );

    map.once("moveend", () => {
      // Ensure we're at market zoom level
      const targetZoom = Math.max(ZOOM_LEVELS.MARKET.min, map.getZoom());
      map.zoomTo(targetZoom, { duration: 800 });
      
      // Clear manual transition flag after transition is complete
      setTimeout(() => setIsManualTransition(false), 500);
    });

    setCurrentView("MARKET");
  }, [currentView, currentMarket, loadNeighborhoods]);

  // Load sites for current area
  const loadSites = useCallback(async (centerLat, centerLng, radius) => {
    const cacheKey = makeSiteCacheKey(centerLat, centerLng, radius);

    if (siteCacheRef.current[cacheKey]) {
      setSiteData(siteCacheRef.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const data = await getSiteLocationsByCoordinates(centerLat, centerLng, radius);
      if (data) {
        // console.log("getSiteLocationsByCoordinates", data, siteData);
        setSiteData(data);
        siteCacheRef.current[cacheKey] = data;
      }
    } catch (error) {
      console.error("Error loading sites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle neighborhood click to zoom into neighborhood area
  const handleNeighborhoodClick = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) return;

    const feature = evt.features[0];
    if (!feature || feature.layer.id !== "neighborhood-fill") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const neighborhoodName = feature.properties.neighborhood_name;

    const neighborhoodId = feature.properties.ID
    console.log("neighborhood", neighborhoodId);

    if (onNeighborhoodSelect) {
      onNeighborhoodSelect(neighborhoodId);
    }
    
    // Set manual transition flag to prevent handleMove from overriding
    setIsManualTransition(true);
    setCurrentNeighborhoods([neighborhoodName]);

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50, duration: 1000 }
    );

    map.once("moveend", async () => {
      // Ensure we're at site zoom level - zoom to a level clearly within SITE range
      const targetZoom = Math.max(ZOOM_LEVELS.SITE.min + 0.5, map.getZoom());
      map.zoomTo(targetZoom, { duration: 800 });
      
      // Load sites for the current area after zoom
      const { centerLat, centerLng, radius } = getBoundsData(map);
      await loadSites(centerLat, centerLng, radius);
      
      // Clear manual transition flag after transition is complete
      setTimeout(() => setIsManualTransition(false), 500);
    });

    setCurrentView("SITE");
  }, [getBoundsData, loadSites]);

  // Unified handler for map movement and data loading
  const handleMapChange = useCallback(async (evt) => {
    // Skip if we're in the middle of a manual transition
    if (isManualTransition) {
      return;
    }

    const zoom = evt.viewState?.zoom || evt.target.getZoom();
    const map = evt.target;
    console.log("handleMapChange", zoom, currentView, evt.type);

    try {
      // Determine target view based on zoom level
      let targetView = currentView;
      if (zoom < ZOOM_LEVELS.NATIONAL.max) {
        targetView = "NATIONAL";
      } else if (zoom >= ZOOM_LEVELS.MARKET.min && zoom <= ZOOM_LEVELS.MARKET.max) {
        targetView = "MARKET";
      } else if (zoom >= ZOOM_LEVELS.NEIGHBORHOOD.min && zoom <= ZOOM_LEVELS.NEIGHBORHOOD.max) {
        targetView = "NEIGHBORHOOD";
      } else if (zoom >= ZOOM_LEVELS.SITE.min) {
        targetView = "SITE";
      }

      // Handle view transitions
      if (targetView !== currentView) {
        console.log(`View transition: ${currentView} → ${targetView}`);
         setCurrentView(targetView);

        if (onViewChange) {
          onViewChange(targetView, { marketId: currentMarket, neighborhoodIds: currentNeighborhoods });
        }
        if (targetView === "NATIONAL") {
          setCurrentView("NATIONAL");
          setCurrentMarket(null);
          setCurrentNeighborhoods([]);
          setNeighborhoodData(null);
          setSiteData(null);
        } else if (targetView === "MARKET") {
          setCurrentView("MARKET");
          setCurrentNeighborhoods([]);
          setSiteData(null);
        } else if (targetView === "NEIGHBORHOOD") {
          setCurrentView("NEIGHBORHOOD");
          setSiteData(null);
        } else if (targetView === "SITE") {
          setCurrentView("SITE");
        }
      }

      // Load data for current view (whether view changed or just area changed)
      const bounds = map.getBounds();
      if (targetView === "MARKET" || targetView === "NEIGHBORHOOD") {
        await loadNeighborhoods({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      } else if (targetView === "SITE") {
        const { centerLat, centerLng, radius } = getBoundsData(map);
        await loadSites(centerLat, centerLng, radius);
      }
    } catch (error) {
      console.error("Error in handleMapChange:", error);
      setLoading(false);
    }
  }, [currentView, loadNeighborhoods, loadSites, getBoundsData, isManualTransition]);

  // Handle mouse interactions for tooltips
  const handleMouseMove = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    const feature = evt.features[0];
    const map = mapRef.current?.getMap();

    if (!feature || !map) {
      setTooltip((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Handle hover effects for different layers
    const newId = feature.id;
    const prevId = hoveredFeatureIdRef.current;

    if (prevId !== null && prevId !== newId) {
      try {
        if (feature.layer.id === "market-fill") {
          map.setFeatureState({ source: "market", id: prevId }, { hover: false });
        } else if (feature.layer.id === "neighborhood-fill") {
          map.setFeatureState({ source: "neighborhood", id: prevId }, { hover: false });
        }
      } catch {}
    }
    
    if (newId !== null) {
      try {
        if (feature.layer.id === "market-fill") {
          map.setFeatureState({ source: "market", id: newId }, { hover: true });
        } else if (feature.layer.id === "neighborhood-fill") {
          map.setFeatureState({ source: "neighborhood", id: newId }, { hover: true });
        }
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
        map.setFeatureState({ source: "neighborhood", id: prevId }, { hover: false });
      } catch {}
    }
    hoveredFeatureIdRef.current = null;
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Get current view info for header
  const getViewInfo = () => {
    switch (currentView) {
      case "NATIONAL":
        return {
          title: "NATIONAL",
          subtitle: `${marketData?.features?.length || 0} MARKETS`,
          description: "United States"
        };
      case "MARKET":
        return {
          title: currentMarket || "MARKET",
          subtitle: `${neighborhoodData?.features?.length || 0} NEIGHBORHOODS`,
          description: "Market View"
        };
      case "NEIGHBORHOOD":
        return {
          title: "NEIGHBORHOODS",
          subtitle: `${neighborhoodData?.features?.length || 0} AREAS`,
          description: "Hexagonal Grid"
        };
      case "SITE":
        return {
          title: "SITES",
          subtitle: `${siteData?.sites?.length || 0} TOWERS`,
          description: currentNeighborhoods.length > 0 ? `Neighborhood: ${currentNeighborhoods.join(", ")}` : "Site View"
        };
      default:
        return { title: "", subtitle: "", description: "" };
    }
  };

  // Reset view to national level
  const handleResetView = useCallback(() => {
    setCurrentView("NATIONAL");
    setCurrentMarket(null);
    setCurrentNeighborhoods([]);
    setNeighborhoodData(null);
    setSiteData(null);
  }, []);

  // Handle control hover to hide tooltip
  const handleControlHover = useCallback((isHovered) => {
    setIsControlHovered(isHovered);
    if (isHovered) {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  }, []);

  // Handle header hover to hide tooltip
  const handleHeaderHover = useCallback((isHovered) => {
    setIsHeaderHovered(isHovered);
    if (isHovered) {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onMoveEnd={handleMapChange}
        onDragEnd={handleMapChange}
        interactiveLayerIds={["market-fill", "neighborhood-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={currentView === "NATIONAL" || currentView === "MARKET" ? handleMarketClick : 
                currentView === "NEIGHBORHOOD" ? handleNeighborhoodClick : undefined}
      >
        {/* Market Layer - Visible for national and market views */}
        {(currentView === "NATIONAL" || currentView === "MARKET") && <MarketLayer marketData={marketData} />}
        
        {/* Neighborhood Layer - Visible for market and neighborhood views */}
        {(currentView === "NEIGHBORHOOD") && (
          <NeighborhoodLayer neighborhoodData={neighborhoodData} />
        )}
        
        {/* Site Layer - Visible for site view */}
        {currentView === "SITE" && <SiteLayer siteData={siteData} setTooltip={setTooltip} />}
      </MapGL>

      {/* Map Header */}
      <MapHeader viewInfo={getViewInfo()} onHeaderHover={handleHeaderHover} />

      {/* Map Controls */}
      <MapControls mapRef={mapRef} onResetView={handleResetView} onControlHover={handleControlHover} />

      {/* Tooltip */}
      <MapTooltip
        visible={tooltip.visible && !isControlHovered && !isHeaderHovered}
        content={tooltip.content}
        x={tooltip.x}
        y={tooltip.y}
      />

      {/* Loading Indicator */}
      {loading && currentView !== "SITE" && (
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
            Loading {currentView.toLowerCase()} data...
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

export default EnhancedMap;
