import React, { useState } from "react";
import { Marker } from "react-map-gl/maplibre";

const SiteLayer = ({ siteData, setTooltip }) => {
  const [hoveredSite, setHoveredSite] = useState(null);

  if (!siteData || !siteData.sites) return null;

  const handleSiteHover = (site, isHovering) => {
    setHoveredSite(isHovering ? site.site_id : null);
    
    if (setTooltip) {
      setTooltip({
        visible: isHovering,
        content: isHovering ? {
          properties: {
            site_id: site.site_id,
            site_name: site.site_name || site.site_id,
            latitude: site.s_site_latitude,
            longitude: site.s_site_longitude,
            technology: site.technology || "5G",
            status: site.status || "Active"
          }
        } : null,
        x: 0,
        y: 0
      });
    }
  };

  const getSiteStatusColor = (site) => {
    // Determine site status based on properties
    const hasIssues = site.issues && site.issues.length > 0;
    const isActive = site.status === "Active" || site.status === "ON_AIR";
    
    if (hasIssues) return "#dc3545"; // Red for issues
    if (isActive) return "#28a745"; // Green for active
    return "#6c757d"; // Gray for inactive
  };

  const getSiteIcon = (site) => {
    const statusColor = getSiteStatusColor(site);
    const hasIssues = site.issues && site.issues.length > 0;
    
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {/* Site Label */}
        {hoveredSite === site.site_id && (
          <div
            style={{
              marginBottom: "8px",
              backgroundColor: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{site.site_id}</div>
            <div style={{ fontSize: "10px", opacity: 0.8 }}>
              {site.technology || "5G"} • {site.status || "Active"}
            </div>
          </div>
        )}

        {/* Main Site Icon */}
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: statusColor,
            border: "3px solid white",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
            position: "relative",
            transition: "all 0.2s ease",
            transformOrigin: "center",
            ...(hoveredSite === site.site_id && {
              transform: "rotate(-45deg) scale(1.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            })
          }}
        >
          {/* Center dot */}
          <div
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: "white",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(45deg)",
            }}
          />
          
          {/* Issue indicator */}
          {hasIssues && (
            <div
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: "12px",
                height: "12px",
                backgroundColor: "#dc3545",
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {site.issues.length}
            </div>
          )}
        </div>

        {/* Site name below icon */}
        {hoveredSite === site.site_id && (
          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              fontWeight: "500",
              color: "#333",
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "2px 6px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {site.site_name || site.site_id}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {siteData.sites.map((site, index) => {
        const lat = parseFloat(site.s_site_latitude);
        const lng = parseFloat(site.s_site_longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={`${site.site_id}-${index}`}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
          >
            <div
              onMouseEnter={() => handleSiteHover(site, true)}
              onMouseLeave={() => handleSiteHover(site, false)}
            >
              {getSiteIcon(site)}
            </div>
          </Marker>
        );
      })}
    </>
  );
};

export default SiteLayer;
