import React, { useState } from "react";
import { Marker } from "react-map-gl/maplibre";

const SiteLayer = ({ siteData }) => {
  const [hoveredSite, setHoveredSite] = useState(null);

  if (!siteData || !siteData.sites) return null;

  return (
    <>
      {siteData.sites.map((site, index) => {
        const lat = parseFloat(site.s_site_latitude);
        const lng = parseFloat(site.s_site_longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        const isHovered = hoveredSite === site.site_id;

        return (
          <Marker
            key={`${site.site_id}-${index}`}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    marginBottom: "6px", // marker ke upar spacing
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  Site: {site.site_id}
                </div>
              )}

              {/* Marker shape */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#333333",
                  border: "2px solid white",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredSite(site.site_id)}
                onMouseLeave={() => setHoveredSite(null)}
              >
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                  }}
                />
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
};

export default SiteLayer;
