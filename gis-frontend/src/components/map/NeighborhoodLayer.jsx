// // Enhanced NeighborhoodLayer.js
// import React, { useEffect } from "react";
// import { Source, Layer } from "react-map-gl/maplibre";

// const NeighborhoodLayer = ({ data }) => {
//   // Debugging console logs
//   useEffect(() => {
//     console.log("NeighborhoodLayer received data:", data);
//     if (data) {
//       console.log("Data type:", data.type);
//       console.log("Features count:", data.features?.length || 0);
//       if (data.features && data.features.length > 0) {
//         console.log("First feature:", data.features[0]);
//       }
//     }
//   }, [data]);

//   if (!data) {
//     console.log("No data provided to NeighborhoodLayer");
//     return null;
//   }

//   // Improved data normalization
//   const geojsonData = (() => {
//     try {
//       if (data.type === "FeatureCollection") {
//         return data;
//       }
      
//       let features = [];
//       if (Array.isArray(data.features)) {
//         features = data.features;
//       } else if (data.feature) {
//         features = [data.feature];
//       } else if (Array.isArray(data)) {
//         features = data;
//       }
      
//       const normalized = {
//         type: "FeatureCollection",
//         features: features.filter(feature =>
//           feature &&
//           feature.type === "Feature" &&
//           feature.geometry &&
//           (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon")
//         )
//       };
      
//       console.log("Normalized GeoJSON:", normalized);
//       console.log("Valid features:", normalized.features.length);
      
//       return normalized;
//     } catch (error) {
//       console.error("Error normalizing GeoJSON data:", error);
//       return { type: "FeatureCollection", features: [] };
//     }
//   })();

//   if (!geojsonData.features || geojsonData.features.length === 0) {
//     console.warn("No valid polygon features found in neighborhood data");
//     return null;
//   }

//   const fillLayer = {
//     id: "neighborhood-fill",
//     type: "fill",
//     source: "neighborhood",
//     paint: {
//       "fill-color": "#0080ff",
//       "fill-opacity": 0.4,
//     },
//   };

//   const lineLayer = {
//     id: "neighborhood-line",
//     type: "line",
//     source: "neighborhood",
//     paint: {
//       "line-color": "#004080",
//       "line-width": 2,
//     },
//   };

//   return (
//     <Source id="neighborhood" type="geojson" data={geojsonData}>
//       <Layer {...fillLayer} />
//       <Layer {...lineLayer} />
//     </Source>
//   );
// };

// export default NeighborhoodLayer;


import React, { useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

const NeighborhoodLayer = ({ data }) => {
  useEffect(() => {
    console.log("🏠 NeighborhoodLayer received:", data);
    if (data && data.features) {
      console.log(`📊 Features count: ${data.features.length}`);
      console.log("📍 Sample feature:", data.features[0]);
    }
  }, [data]);

  // Early returns with logging
  if (!data) {
    console.warn("⚠️ No data provided");
    return null;
  }

  if (!data.features || data.features.length === 0) {
    console.warn("⚠️ No features in data");
    return null;
  }

  // Filter valid polygon features
  const validFeatures = data.features.filter(feature => {
    const isValid = feature && 
      feature.type === "Feature" && 
      feature.geometry && 
      (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon");
    
    if (!isValid) {
      console.warn("⚠️ Invalid feature:", feature);
    }
    return isValid;
  });

  console.log(`✅ Valid features: ${validFeatures.length} out of ${data.features.length}`);

  if (validFeatures.length === 0) {
    console.error("❌ No valid polygon features found!");
    return null;
  }

  const geojsonData = {
    type: "FeatureCollection",
    features: validFeatures
  };

  const fillLayer = {
    id: "zipcode-fill",
    type: "fill",
    source: "zipcode",
    paint: {
      "fill-color": "#ff5722", // Bright orange
      "fill-opacity": 0.6,
    },
  };

  const lineLayer = {
    id: "zipcode-line",
    type: "line",
    source: "zipcode",
    paint: {
      "line-color": "#d32f2f", // Dark red
      "line-width": 2,
    },
  };

  console.log("🎨 Rendering layers...");

  return (
    <Source id="zipcode" type="geojson" data={geojsonData}>
      <Layer {...fillLayer} />
      <Layer {...lineLayer} />
    </Source>
  );
};

export default NeighborhoodLayer;

