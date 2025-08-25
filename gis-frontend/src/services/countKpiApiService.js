const BASE_URL = "http://localhost:5000";

// Helper function to handle fetch requests
async function apiRequest(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}/api/kpi/count${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }
    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
}

// ------- Count APIs -------

export const getCountSiteById = (siteId) =>
  apiRequest(`/site/${encodeURIComponent(siteId)}`);

export const getCountHexById = (hexId) =>
  apiRequest(`/hex/${encodeURIComponent(hexId)}`);

export const getCountNeighborhoodById = (neighborhoodId) =>
  apiRequest(`/neighborhood/${encodeURIComponent(neighborhoodId)}`);

export const getCountZipById = (zipId) => 
  apiRequest(`/zip/${encodeURIComponent(zipId)}`);

export const getCountMarketById = (marketId) => 
  apiRequest(`/market/${encodeURIComponent(marketId)}`);

// ------- Generic Count API -------
export const getCountByTypeId = (type, id) => 
  apiRequest(`/${type}/${encodeURIComponent(id)}`);
