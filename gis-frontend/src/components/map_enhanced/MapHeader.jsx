import React from "react";

const MapHeader = ({ viewInfo }) => {
  const { title, subtitle, description } = viewInfo;

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        left: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "16px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        minWidth: "200px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#333333",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#e20074",
          marginBottom: "4px",
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#666666",
          fontStyle: "italic",
        }}
      >
        {description}
      </div>
    </div>
  );
};

export default MapHeader;
