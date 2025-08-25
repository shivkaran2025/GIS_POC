import React from "react";

const INITIAL_VIEW = {
  longitude: -98,
  latitude: 41,
  zoom: 3.5,
};

const MapControls = ({ mapRef, onResetView, onControlHover, onGlobeClick}) => {
  const handleZoomIn = () => {
    const map = mapRef?.current?.getMap();
    if (map) {
      const currentZoom = map.getZoom();
      map.zoomTo(currentZoom + 1, { duration: 300 });
    }
  };

  const handleZoomOut = () => {
    const map = mapRef?.current?.getMap();
    if (map) {
      const currentZoom = map.getZoom();
      map.zoomTo(currentZoom - 1, { duration: 300 });
    }
  };

  const handleCompass = () => {
    console.log("Compass clicked");
  };

  const handleGlobe = () => {
    const map = mapRef?.current?.getMap();
    if (map) {
      map.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        duration: 1000
      });
      
      // Call the parent's reset view function if provided
      if (onGlobeClick) {
        onGlobeClick();
      } else if (onResetView) {
        onResetView();
      }
    }
  };

  const handleControlMouseEnter = () => {
    if (onControlHover) {
      onControlHover(true);
    }
  };

  const handleControlMouseLeave = () => {
    if (onControlHover) {
      onControlHover(false);
    }
  };

  return (
    <>
      {/* Zoom Controls - Bottom Right */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Compass */}
        {/* <button
          onClick={handleCompass}
          onMouseEnter={handleControlMouseEnter}
          onMouseLeave={handleControlMouseLeave}
          style={{
            width: "40px",
            height: "40px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px 8px 0 0",
            borderBottom: "1px solid #e0e0e0",
          }}
          title="Reset North"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="#333"
            />
          </svg>
        </button> */}
        
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          onMouseEnter={handleControlMouseEnter}
          onMouseLeave={handleControlMouseLeave}
          style={{
            width: "40px",
            height: "40px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
          title="Zoom In"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              fill="#333"
            />
          </svg>
        </button>
        
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          onMouseEnter={handleControlMouseEnter}
          onMouseLeave={handleControlMouseLeave}
          style={{
            width: "40px",
            height: "40px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0 0 8px 8px",
          }}
          title="Zoom Out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 13H5V11H19V13Z"
              fill="#333"
            />
          </svg>
        </button>
      </div>

      {/* Globe Control - Top Right */}
      <button
        onClick={handleGlobe}
        onMouseEnter={handleControlMouseEnter}
        onMouseLeave={handleControlMouseLeave}
        style={{
          position: "absolute",
          top: "80px",
          right: "20px",
          width: "40px",
          height: "40px",
          border: "none",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
        }}
        title="Globe View"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"
            fill="#333"
          />
        </svg>
      </button>
    </>
  );
};

export default MapControls;
