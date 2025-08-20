import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getMarketRegions, 
  getSiteLocations, 
  getSiteLocationsByCoordinates,
  getCdcNeighborhoods
} from "../services/apiService";

export const useMapData = () => {
  const [currentView, setCurrentView] = useState("market");
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteCount, setSiteCount] = useState(0);

  // keep track of active request
  const abortRef = useRef(null);

  const cancelPrevious = () => {
    if (abortRef.current) {
      abortRef.current.abort(); // cancel old
    }
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };

  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const signal = cancelPrevious();
      const data = await getMarketRegions(signal);
      if (!data) return; // aborted
      setCurrentData(data);
      setCurrentView("market");
      setSiteCount(data.features?.length || 0);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load market data");
        console.error("Error loading market data:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNeighborhoodData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCdcNeighborhoods();
      setCurrentData(data);
      setCurrentView("neighborhood");
      setSiteCount(data.features?.length || 0);
    } catch (err) {
      setError("Failed to load neighborhood data");
      console.error("Error loading neighborhood data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSiteData = useCallback(async (bounds = null) => {
    try {
      setLoading(true);
      setError(null);
      const signal = cancelPrevious();

      let data;
      if (bounds) {
        const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
        const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
        const radius =
          Math.max(
            Math.abs(bounds[1][1] - bounds[0][1]),
            Math.abs(bounds[1][0] - bounds[0][0])
          ) / 2;
        data = await getSiteLocationsByCoordinates(centerLat, centerLng, radius, signal);
      } else {
        data = await getSiteLocations(signal);
      }

      if (!data) return; // aborted
      setCurrentData(data);
      setCurrentView("site");
      setSiteCount(data.sites?.length || data.count || 0);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load site data");
        console.error("Error loading site data:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDataByZoomLevel = useCallback(
    async (zoomLevel, bounds = null) => {
      if (zoomLevel < 30.0 && currentView !== "market") {
        await loadMarketData();
      } else if (zoomLevel >= 30.0 && currentView !== "site") {
        await loadSiteData(bounds);
      }
    },
    [currentView, loadMarketData, loadSiteData]
  );

  // Load initial data
  useEffect(() => {
    loadMarketData();
    return () => cancelPrevious(); // cleanup on unmount
  }, [loadMarketData]);

  return {
    currentView,
    currentData,
    loading,
    error,
    siteCount,
    loadMarketData,
    loadSiteData,
    loadNeighborhoodData,
    loadDataByZoomLevel,
  };
};
