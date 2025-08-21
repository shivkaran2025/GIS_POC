const API_BASE_URL = "http://localhost:5000";

// Market Regions API
export const getMarketRegions = async (signal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/market-regions`, {
      signal,
    });
    if (!response.ok) throw new Error("Failed to fetch market regions");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching market regions:", error);
    return null;
  }
};

export const getMarketRegionById = async (marketName, signal) => {
  try {
    const encodedName = encodeURIComponent(marketName);
    const response = await fetch(
      `${API_BASE_URL}/api/market-regions/id/${encodedName}`,
      { signal }
    );
    if (!response.ok) throw new Error("Failed to fetch market region");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching market region:", error);
    return null;
  }
};

// CDC Neighborhoods API
export const getCdcNeighborhoods = async () => {
  try {
    const response = await fetch(`#`);
    // const response = await fetch(`${API_BASE_URL}/api/cdc-neighborhoods`);
    if (!response.ok) throw new Error("Failed to fetch CDC neighborhoods");
    return await response.json();
  } catch (error) {
    console.error("Error fetching CDC neighborhoods:", error);
    throw error;
  }
};

export const getCdcNeighborhoodById = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/cdc-neighborhoods/id/${id}`
    );
    if (!response.ok) throw new Error("Failed to fetch CDC neighborhood");
    return await response.json();
  } catch (error) {
    console.error("Error fetching CDC neighborhood:", error);
    throw error;
  }
};

// Add this function to your apiService.js

export const getCdcNeighborhoodsByBounds = async (bounds, signal) => {
  try {
    const { north, south, east, west } = bounds;
    const response = await fetch(
      `${API_BASE_URL}/api/cdc-neighborhoods/bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
      { signal }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching CDC neighborhoods by bounds:", error);
    return null;
  }
};

// Site Locations API
export const getSiteLocations = async (signal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/site-locations`, {
      signal,
    });
    if (!response.ok) throw new Error("Failed to fetch site locations");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching site locations:", error);
    throw error;
  }
};

export const getSiteLocationsByCoordinates = async (
  lat,
  lng,
  radius = 10,
  signal
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/site-locations/coordinates?lat=${lat}&lng=${lng}&radius=${radius}`,
      { signal }
    );
    if (!response.ok)
      throw new Error("Failed to fetch site locations by coordinates");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching site locations by coordinates:", error);
    return null;
  }
};

export const getSiteById = async (siteId, signal) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/site-locations/site/${siteId}`,
      { signal }
    );
    if (!response.ok) throw new Error("Failed to fetch site");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching site:", error);
    throw error;
  }
};

// Search API
export const search = async (query, dataset = "all", signal) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?q=${encodeURIComponent(
        query
      )}&dataset=${dataset}`,
      { signal }
    );
    if (!response.ok) throw new Error("Failed to search");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error searching:", error);
    throw error;
  }
};

// ZIP Codes API (NEW)
export const getZipCodes = async (signal) => {
  try {
    console.log("Fetching all ZIP codes");
    const response = await fetch(`${API_BASE_URL}/api/zip-codes`, { signal });
    if (!response.ok) throw new Error("Failed to fetch ZIP codes");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching ZIP codes:", error);
    throw error;
  }
};

export const getZipCodesByBounds = async (bounds, signal) => {
  try {
    const { north, south, east, west } = bounds;
    const response = await fetch(`#`, { signal });
    // const response = await fetch(
    //   `${API_BASE_URL}/api/zip-codes/bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
    //   { signal }
    // );
    if (!response.ok) throw new Error("Failed to fetch ZIP codes by bounds");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    console.error("Error fetching ZIP codes by bounds:", error);
    return null;
  }
};

// Helper function to get data by zoom level
// export const getDataByZoomLevel = async (zoomLevel, bounds = null, signal) => {
//   try {
//     if (zoomLevel < 30.0) {
//       return await getMarketRegions(signal);
//     } else {
//       if (bounds) {
//         const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
//         const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
//         const radius =
//           Math.max(
//             Math.abs(bounds[1][1] - bounds[0][1]),
//             Math.abs(bounds[1][0] - bounds[0][0])
//           ) / 2;
//         return await getSiteLocationsByCoordinates(
//           centerLat,
//           centerLng,
//           radius,
//           signal
//         );
//       }
//       return await getSiteLocations(signal);
//     }
//   } catch (error) {
//     if (error.name === "AbortError") return null;
//     console.error("Error getting data by zoom level:", error);
//     throw error;
//   }
// };
