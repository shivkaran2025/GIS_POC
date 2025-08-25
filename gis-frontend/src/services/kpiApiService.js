const BASE_URL = "http://localhost:5000"; 

// Helper function to handle fetch requests
async function apiRequest(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}/api/kpi${endpoint}`);
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

// ------- Market APIs -------
export const getMarketKpiById = (id) => apiRequest(`/market/${id}`);
export const getMarketKpiByMarketId = (marketId) =>
  apiRequest(`/market/market_id/${marketId}`);

// ------- Zip APIs -------
export const getZipKpiById = (id) => apiRequest(`/zip/${id}`);
export const getZipKpiByZipId = (zipId) =>
  apiRequest(`/zip/zip_id/${zipId}`);

// ------- Hex APIs -------
export const getHexKpiById = (id) => apiRequest(`/hex/${id}`);
export const getHexKpiByHexId = (hexId) =>
  apiRequest(`/hex/hex_id/${hexId}`);

// ------- Neighborhood APIs -------
export const getNeighborhoodKpiById = (id) => apiRequest(`/neighborhood/${id}`);
export const getNeighborhoodKpiByNeighborhoodId = (neighborhoodId) =>
  apiRequest(`/neighborhood/neighborhood_id/${neighborhoodId}`);

// ------- Site APIs -------
export const getSiteKpiById = (id) => apiRequest(`/site/${id}`);
export const getSiteKpiBySiteId = (siteId) =>
  apiRequest(`/site/site_id/${siteId}`);

// ------- Generic APIs -------
export const getKpiByTypeId = (kpiType, idType, idValue) =>
  apiRequest(`/${kpiType}/${idType}_id/${idValue}`);

export const getKpiById = (kpiType, id) =>
  apiRequest(`/${kpiType}/${id}`);
