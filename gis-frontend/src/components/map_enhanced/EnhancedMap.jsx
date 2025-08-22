import React, { useEffect, useState, useCallback, useRef } from "react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";
import { hexGrid } from "@turf/turf";

import {
  getMarketRegions,
  getSiteLocationsByCoordinates,
  getCdcNeighborhoodsByBounds,
} from "../../services/apiService";

import MarketLayer from "./MarketLayer";
import ZipCodeLayer from "./ZipCodeLayer";
import SiteLayer from "./SiteLayer";
import MapTooltip from "./MapTooltip";
import MapHeader from "./MapHeader";
import MapControls from "./MapControls";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW = {
  longitude: -98,
  latitude: 39,
  zoom: 3.8,
};

const ZOOM_LEVELS = {
  NATIONAL: { min: 0, max: 5 },
  MARKET: { min: 5, max: 8 },
  ZIP: { min: 8, max: 11 },
  SITE: { min: 11, max: 22 }
};

const EnhancedMap = () => {
  const [currentView, setCurrentView] = useState("NATIONAL");
  const [currentMarket, setCurrentMarket] = useState(null);
  const [currentZipCodes, setCurrentZipCodes] = useState([]);
  
  const [marketData, setMarketData] = useState(null);
  const [zipData, setZipData] = useState(null);
  const [siteData, setSiteData] = useState(null);
  
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
  const zipCacheRef = useRef({});

  // Cache key functions
  const makeSiteCacheKey = (centerLat, centerLng, radius) => {
    return `site_${centerLat.toFixed(2)}_${centerLng.toFixed(2)}_${radius.toFixed(2)}`;
  };

  const makeZipCacheKey = (north, south, east, west) => {
    return `zip_${north.toFixed(3)}_${south.toFixed(3)}_${east.toFixed(3)}_${west.toFixed(3)}`;
  };

  // Initial market data load
  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true);
      try {
        const data = await getMarketRegions();
        if (data) setMarketData(data);
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

  // Handle market click to zoom into market
  const handleMarketClick = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) return;

    const feature = evt.features[0];
    if (!feature || feature.layer.id !== "market-fill") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const marketName = feature.properties.Market;
    setCurrentMarket(marketName);

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50, duration: 1000 }
    );

    map.once("moveend", () => {
      if (map.getZoom() < ZOOM_LEVELS.MARKET.min) {
        map.zoomTo(ZOOM_LEVELS.MARKET.min, { duration: 800 });
      }
    });

    setCurrentView("MARKET");
  }, []);

  // Handle ZIP code click to zoom into ZIP area
  const handleZipClick = useCallback((evt) => {
    if (!evt.features || evt.features.length === 0) return;

    const feature = evt.features[0];
    if (!feature || feature.layer.id !== "zip-fill") return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const zipCode = feature.properties.zip_code;
    setCurrentZipCodes([zipCode]);

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 50, duration: 1000 }
    );

    map.once("moveend", () => {
      if (map.getZoom() < ZOOM_LEVELS.SITE.min) {
        map.zoomTo(ZOOM_LEVELS.SITE.min, { duration: 800 });
      }
    });

    setCurrentView("SITE");
  }, []);

  // Load ZIP codes for current market area
  const loadZipCodes = useCallback(async (bounds) => {
    const { north, south, east, west } = bounds;
    const cacheKey = makeZipCacheKey(north, south, east, west);

    if (zipCacheRef.current[cacheKey]) {
      setZipData(zipCacheRef.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const data = await getCdcNeighborhoodsByBounds({ north, south, east, west });
      if (data) {
        setZipData(data);
        zipCacheRef.current[cacheKey] = data;
      }
    } catch (error) {
      console.error("Error loading ZIP codes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        setSiteData(data);
        siteCacheRef.current[cacheKey] = data;
      }
    } catch (error) {
      console.error("Error loading sites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle map movement and zoom changes
  const handleMove = useCallback(async (evt) => {
    const zoom = evt.viewState.zoom;
    const map = evt.target;

    try {
      if (zoom < ZOOM_LEVELS.NATIONAL.max) {
        if (currentView !== "NATIONAL") {
          setCurrentView("NATIONAL");
          setCurrentMarket(null);
          setCurrentZipCodes([]);
          setZipData(null);
          setSiteData(null);
        }
      } else if (zoom >= ZOOM_LEVELS.MARKET.min && zoom <= ZOOM_LEVELS.MARKET.max) {
        if (currentView !== "MARKET") {
          setCurrentView("MARKET");
          setCurrentZipCodes([]);
          setSiteData(null);
          
          // Load ZIP codes for current market area
          const bounds = map.getBounds();
          await loadZipCodes({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      } else if (zoom >= ZOOM_LEVELS.ZIP.min && zoom <= ZOOM_LEVELS.ZIP.max) {
        if (currentView !== "ZIP") {
          setCurrentView("ZIP");
          setSiteData(null);
          
          // Load ZIP codes for current area
          const bounds = map.getBounds();
          await loadZipCodes({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      } else if (zoom >= ZOOM_LEVELS.SITE.min) {
        if (currentView !== "SITE") {
          setCurrentView("SITE");
          
          // Load sites for current area
          const { centerLat, centerLng, radius } = getBoundsData(map);
          await loadSites(centerLat, centerLng, radius);
        }
      }
    } catch (error) {
      console.error("Error in handleMove:", error);
      setLoading(false);
    }
  }, [currentView, loadZipCodes, loadSites, getBoundsData]);

  // Handle map drag to reload data for new area
  const handleMapDrag = useCallback(async (evt) => {
    const map = evt.target;
    const zoom = map.getZoom();

    try {
      if (zoom >= ZOOM_LEVELS.MARKET.min && zoom <= ZOOM_LEVELS.MARKET.max) {
        const bounds = map.getBounds();
        await loadZipCodes({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      } else if (zoom >= ZOOM_LEVELS.ZIP.min && zoom <= ZOOM_LEVELS.ZIP.max) {
        const bounds = map.getBounds();
        await loadZipCodes({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      } else if (zoom >= ZOOM_LEVELS.SITE.min) {
        const { centerLat, centerLng, radius } = getBoundsData(map);
        await loadSites(centerLat, centerLng, radius);
      }
    } catch (error) {
      console.error("Error in handleMapDrag:", error);
    }
  }, [loadZipCodes, loadSites, getBoundsData]);

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
        } else if (feature.layer.id === "zip-fill") {
          map.setFeatureState({ source: "zip", id: prevId }, { hover: false });
        }
      } catch {}
    }
    
    if (newId !== null) {
      try {
        if (feature.layer.id === "market-fill") {
          map.setFeatureState({ source: "market", id: newId }, { hover: true });
        } else if (feature.layer.id === "zip-fill") {
          map.setFeatureState({ source: "zip", id: newId }, { hover: true });
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
        map.setFeatureState({ source: "zip", id: prevId }, { hover: false });
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
          subtitle: `${zipData?.features?.length || 0} ZIP CODES`,
          description: "Market View"
        };
      case "ZIP":
        return {
          title: "ZIP CODES",
          subtitle: `${zipData?.features?.length || 0} AREAS`,
          description: "Hexagonal Grid"
        };
      case "SITE":
        return {
          title: "SITES",
          subtitle: `${siteData?.sites?.length || 0} TOWERS`,
          description: currentZipCodes.length > 0 ? `ZIP: ${currentZipCodes.join(", ")}` : "Site View"
        };
      default:
        return { title: "", subtitle: "", description: "" };
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onMoveEnd={handleMove}
        onDragEnd={handleMapDrag}
        interactiveLayerIds={["market-fill", "zip-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={currentView === "NATIONAL" ? handleMarketClick : 
                currentView === "MARKET" || currentView === "ZIP" ? handleZipClick : undefined}
      >
        {/* Market Layer - Always visible for national view */}
        {currentView === "NATIONAL" && <MarketLayer marketData={marketData} />}
        
        {/* ZIP Code Layer - Visible for market and zip views */}
        {(currentView === "MARKET" || currentView === "ZIP") && (
          <ZipCodeLayer zipData={zipData} />
        )}
        
        {/* Site Layer - Visible for site view */}
        {currentView === "SITE" && <SiteLayer siteData={siteData} setTooltip={setTooltip} />}
      </MapGL>

      {/* Map Header */}
      <MapHeader viewInfo={getViewInfo()} />

      {/* Map Controls */}
      <MapControls />

      {/* Tooltip */}
      <MapTooltip
        visible={tooltip.visible}
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
