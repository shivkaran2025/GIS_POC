import React from "react";

const BoundaryLegend = ({ 
  selectedMarketBoundary, 
  selectedZipBoundary, 
  selectedNeighborhoodBoundary 
}) => {
  const hasBoundary = selectedMarketBoundary || selectedZipBoundary || selectedNeighborhoodBoundary;

  if (!hasBoundary) return null;

  const getBoundaryType = () => {
    if (selectedMarketBoundary) return "Market";
    if (selectedZipBoundary) return "ZIP Code";
    if (selectedNeighborhoodBoundary) return "Neighborhood";
    return "";
  };

  const getBoundaryColor = () => {
    if (selectedMarketBoundary) return "#e20074"; // Pink
    if (selectedZipBoundary) return "#28a745"; // Green
    if (selectedNeighborhoodBoundary) return "#fd7e14"; // Orange
    return "#e20074";
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        fontSize: "12px",
        zIndex: 1000,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        maxWidth: "200px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
        Selected {getBoundaryType()} Boundary
      </div>
             <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
         <div
           style={{
             width: "20px",
             height: "2px",
             backgroundColor: getBoundaryColor(),
             borderTop: `1px dashed ${getBoundaryColor()}`,
           }}
         />
         <span style={{ color: "#666", fontSize: "11px" }}>
           Data outside this boundary belongs to other areas
         </span>
       </div>
       <div style={{ color: "#999", fontSize: "10px", fontStyle: "italic" }}>
         Dashed {getBoundaryType().toLowerCase()} line shows the selected area boundary
       </div>
    </div>
  );
};

export default BoundaryLegend;
