import React from "react";

const MapTooltip = ({ visible, content, x, y, style = {} }) => {
  if (!visible || !content) return null;

  const getTooltipContent = (data) => {
    if (!data) return "";

    const properties = data.properties || data;

    if (properties.Market) {
      return properties.Market;
    } else if (properties.NEIGHBORHOOD_NAME) {
      return properties.NEIGHBORHOOD_NAME;
    } else if (properties.site_id) {
      return `Site: ${properties.site_id}`;
    }

    return "";
  };

  return (
    <div
      className="map-tooltip"
      style={{
        position: "fixed",
        left: x + 10,
        top: y - 10,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        pointerEvents: "none",
        zIndex: 1001,
        whiteSpace: "nowrap",
        transform: "translateY(-50%)",
        ...style,
      }}
    >
      {getTooltipContent(content)}
    </div>
  );
};

export default MapTooltip;
