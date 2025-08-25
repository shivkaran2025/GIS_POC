import React from "react";

const MapTooltip = ({ visible, content, x, y }) => {
  if (!visible || !content) return null;

  const getTooltipContent = () => {
    const properties = content.properties;
    
    if (properties.site_id) {
      // Site tooltip
      return (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            {properties.site_id}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <div>Technology: {properties.technology || "5G"}</div>
            <div>Status: {properties.status || "Active"}</div>
            <div>Location: {properties.latitude}, {properties.longitude}</div>
          </div>
        </div>
      );
    } else if (properties.Market) {
      // Market tooltip
      return (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            {properties.Market}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <div>Sites: {properties.site_count || 0}</div>
            <div>Region: {properties.Region || "Unknown"}</div>
          </div>
        </div>
      );
         } else if (properties.neighborhood_name) {
       // Neighborhood tooltip
       return (
         <div>
           <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
             Hexagonal Area
           </div>
           <div style={{ fontSize: "12px", color: "#666" }}>
             <div>Neighborhood: {properties.neighborhood_name}</div>
             <div>Sites: {properties.site_count || 0}</div>
             <div>Density: {properties.density ? `${properties.density.toFixed(1)}%` : "N/A"}</div>
             <div>Performance: {properties.performance ? `${properties.performance.toFixed(1)}` : "N/A"}</div>
           </div>
         </div>
       );
    } else if (properties.ZCTA5CE10) {
      // ZIP code tooltip
      return (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            ZIP Code
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <div>ZIP: {properties.ZCTA5CE10}</div>
            <div>State: {properties.STATEFP10 || "N/A"}</div>
            <div>GEOID: {properties.GEOID10 || "N/A"}</div>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ fontSize: "12px" }}>
        {JSON.stringify(properties, null, 2)}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x + 10,
        top: y - 10,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        pointerEvents: "none",
        zIndex: 1001,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        maxWidth: "250px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {getTooltipContent()}
      
      {/* Arrow pointer */}
      <div
        style={{
          position: "absolute",
          left: "-6px",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "6px solid rgba(0, 0, 0, 0.9)",
        }}
      />
    </div>
  );
};

export default MapTooltip;
