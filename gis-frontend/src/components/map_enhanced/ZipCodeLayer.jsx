import React, { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { hexGrid, bbox, booleanPointInPolygon, centroid } from "@turf/turf";

const ZipCodeLayer = ({ zipData }) => {
  if (!zipData || zipData.length === 0) {
    console.log("ZIPData 1", zipData);
  }
  // Generate hexagonal grid from ZIP data
  const hexGridData = useMemo(() => {
    // If no ZIP data, create a default hexagonal grid for the Denver area (based on your bounds)
    if (!zipData || !zipData.features || zipData.features.length === 0) {
      console.log("No ZIP data, creating default grid");
      // Default bounds for Denver area (from your log data)
      const defaultBounds = [-105.57878792007787, 39.50778897935396, -104.17896000879531, 40.2489804141691];
      const [minX, minY, maxX, maxY] = defaultBounds;
      
      const cellSide = 0.01; // Larger hexagons for better visibility
      const hexGridData = hexGrid([minX, minY, maxX, maxY], cellSide, { units: 'degrees' });
      
      // Generate sample data for visualization
      const enhancedFeatures = hexGridData.features.map((hex, index) => {
        const hexCenter = centroid(hex).geometry.coordinates;
        // Create more varied density data
        const baseDensity = Math.abs(Math.sin(hexCenter[0] * 50) * Math.cos(hexCenter[1] * 50)) * 100;
        const randomVariation = Math.random() * 50;
        const density = Math.min(100, baseDensity + randomVariation);
        
        // Some hexagons will have no sites (empty)
        const isEmpty = Math.random() < 0.3;
        
        return {
          ...hex,
          properties: {
            ...hex.properties,
            id: `hex-${index}`,
            zip_codes: isEmpty ? [] : [`9800${Math.floor(Math.random() * 10)}`],
            zip_code: isEmpty ? null : `9800${Math.floor(Math.random() * 10)}`,
            site_count: isEmpty ? 0 : Math.max(1, Math.floor(density / 10)),
            zip_count: isEmpty ? 0 : 1,
            density: isEmpty ? 0 : density,
            performance: isEmpty ? 0 : Math.random() * 20 + 10,
            isEmpty: isEmpty
          }
        };
      });
      
      return {
        type: "FeatureCollection",
        features: enhancedFeatures
      };
    }

    try {
      // Get the bounding box of all ZIP features
      const bounds = bbox(zipData);
      const [minX, minY, maxX, maxY] = bounds;
      
      // Create hexagonal grid with appropriate cell size
      const cellSide = 0.01; // Adjust this for hexagon size
      const hexGridData = hexGrid([minX, minY, maxX, maxY], cellSide, { units: 'degrees' });
      
      // Merge ZIP data with hex grid using proper spatial operations
      const enhancedFeatures = hexGridData.features.map((hex, index) => {
        const hexCenter = centroid(hex).geometry.coordinates;
        
        // Find ZIP polygons that contain the hex center or intersect with the hex
        const intersectingZips = zipData.features.filter(zip => {
          try {
            // Check if hex center is within the ZIP polygon
            const hexPoint = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: hexCenter
              }
            };
            return booleanPointInPolygon(hexPoint, zip);
          } catch (error) {
            // Fallback to distance-based approach if spatial operation fails
            if (zip.geometry && zip.geometry.coordinates && zip.geometry.coordinates[0]) {
              const zipCoords = zip.geometry.coordinates[0];
              // Find the closest point in the ZIP polygon to hex center
              let minDistance = Infinity;
              zipCoords.forEach(coord => {
                const distance = Math.sqrt(
                  Math.pow(coord[0] - hexCenter[0], 2) + 
                  Math.pow(coord[1] - hexCenter[1], 2)
                );
                minDistance = Math.min(minDistance, distance);
              });
              return minDistance < cellSide;
            }
            return false;
          }
        });
        
        // Calculate aggregated properties
        const totalSites = intersectingZips.reduce((sum, zip) => {
          // If your data has site_count property, use it
          return sum + (zip.properties?.site_count || 1);
        }, 0);
        
        const zipCodes = intersectingZips.map(zip => 
          zip.properties?.ID || zip.properties?.zip_code || zip.properties?.ZIPCODE
        ).filter(Boolean);
        
        // Generate density based on number of intersecting features and location
        let density = 0;
        if (intersectingZips.length > 0) {
          const baseDensity = intersectingZips.length * 20; // Base density from feature count
          const locationVariation = Math.abs(Math.sin(hexCenter[0] * 30) * Math.cos(hexCenter[1] * 30)) * 30;
          density = Math.min(100, baseDensity + locationVariation + Math.random() * 20);
        }
        
        const isEmpty = intersectingZips.length === 0;
        
        return {
          ...hex,
          properties: {
            ...hex.properties,
            id: `hex-${index}`,
            zip_codes: zipCodes,
            zip_code: zipCodes.length > 0 ? zipCodes[0] : null,
            site_count: totalSites || (isEmpty ? 0 : Math.max(1, Math.floor(density / 15))),
            zip_count: intersectingZips.length,
            density: density,
            performance: isEmpty ? 0 : Math.random() * 20 + 10,
            isEmpty: isEmpty
          }
        };
      });
      
      // Filter out hexagons with no data for cleaner visualization
      const filteredFeatures = enhancedFeatures.filter(hex => 
        hex.properties.zip_count > 0 || hex.properties.site_count > 0
      );
      
      return {
        type: "FeatureCollection",
        features: filteredFeatures
      };
    } catch (error) {
      console.error("Error generating hex grid:", error);
      return zipData; // Fallback to original data
    }
  }, [zipData]);

  if (!hexGridData) return null;

  console.log("Generated hex grid data:", hexGridData);

  return (
    <Source
      id="zip-hex"
      type="geojson"
      data={hexGridData}
      generateId={true}
    >
      {/* Hexagon Fill Layer - Main visualization */}
      <Layer
        id="zip-hex-fill"
        type="fill"
        paint={{
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#ffffff", // White on hover like in your image
            [
              "case",
              ["==", ["get", "site_count"], 0],
              "rgba(0,0,0,0)", // Transparent for empty hexagons
              [
                "interpolate",
                ["linear"],
                ["get", "density"],
                0, "#f8f9fa",      // Very light for low density
                20, "#e9ecef",     // Light gray
                40, "#adb5bd",     // Medium gray  
                60, "#6c757d",     // Darker gray
                80, "#495057",     // Dark gray
                100, "#343a40"     // Very dark gray - matches your image
              ]
            ]
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.9, // High opacity on hover
            [
              "case", 
              ["==", ["get", "site_count"], 0],
              0, // Invisible for empty hexagons
              0.8 // Normal opacity for filled hexagons
            ]
          ]
        }}
      />
      
      {/* Hexagon Outline Layer */}
      <Layer
        id="zip-hex-outline"
        type="line"
        paint={{
          "line-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#007bff", // Blue outline on hover
            [
              "case",
              ["==", ["get", "site_count"], 0],
              "rgba(0,0,0,0)", // No outline for empty hexagons
              "#ffffff" // White outline like in your image
            ]
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2, // Thicker on hover
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              8, 0.5,
              12, 1,
              16, 1.5
            ]
          ],
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            [
              "case",
              ["==", ["get", "site_count"], 0],
              0, // No outline for empty hexagons
              0.6
            ]
          ]
        }}
      />
      
      {/* Site Count Labels - only show for hexagons with sites */}
      <Layer
        id="zip-hex-labels"
        type="symbol"
        layout={{
          "text-field": [
            "case",
            [">", ["get", "site_count"], 0],
            ["to-string", ["get", "site_count"]],
            "" // Empty string for hexagons with no sites
          ],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 10,
            12, 14,
            16, 18
          ],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "text-anchor": "center",
          "text-justify": "center"
        }}
        paint={{
          "text-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#000000", // Black text on hover (white background)
            [
              "case",
              [">", ["get", "density"], 50],
              "#ffffff", // White text on dark hexagons
              "#000000"  // Black text on light hexagons
            ]
          ],
          "text-halo-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#ffffff",
            [
              "case",
              [">", ["get", "density"], 50],
              "#000000", // Dark halo on light text
              "#ffffff"  // Light halo on dark text
            ]
          ],
          "text-halo-width": 1,
          "text-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              8, 0.7,
              12, 0.9,
              16, 1
            ]
          ]
        }}
        filter={[">", ["get", "site_count"], 0]} // Only show labels for hexagons with sites
      />
    </Source>
  );
};

export default ZipCodeLayer;