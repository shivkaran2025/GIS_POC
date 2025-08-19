// SiteLocationLayer.jsx
import React, { useMemo } from "react";
import * as d3 from "d3";

const SiteLocationLayer = ({
  data,
  transform,
  onFeatureHover,
  onFeatureLeave,
  width = 800,
  height = 500,
}) => {
  // Projection always runs
  const projection = useMemo(() => {
    return d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(width);
  }, [width, height]);

  if (!data || !data.sites || data.sites.length === 0) return null;

  return (
    <g
      className="site-location-layer"
      transform={transform ? transform.toString() : undefined}
    >
      {data.sites.map((site, idx) => {
        const lat = parseFloat(site.s_site_latitude);
        const lng = parseFloat(site.s_site_longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        const coords = projection([lng, lat]);
        if (!coords) return null;

        return (
          <circle
            key={`site-${idx}`}
            cx={coords[0]}
            cy={coords[1]}
            r={3 / (transform ? transform.k : 1)}
            fill="red"
            stroke="white"
            strokeWidth={0.8 / (transform ? transform.k : 1)}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => onFeatureHover(e, site)}
            onMouseLeave={onFeatureLeave}
            onMouseMove={(e) => onFeatureHover(e, site)}
          />
        );
      })}
    </g>
  );
};

export default SiteLocationLayer;






