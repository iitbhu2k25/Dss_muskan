'use client';
import React, { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  activeTab: string;
}

const LeafletMapPreview: React.FC<MapPreviewProps> = ({ activeTab }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [layerControls, setLayerControls] = useState<any>(null);
  const [drawControl, setDrawControl] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showCompass, setShowCompass] = useState<boolean>(true);
  const compassRef = useRef<any>(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.id = 'leaflet-css';
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCSS.crossOrigin = '';
      document.head.appendChild(leafletCSS);
    }

    // Load Leaflet Draw CSS
    if (!document.getElementById('leaflet-draw-css')) {
      const leafletDrawCSS = document.createElement('link');
      leafletDrawCSS.id = 'leaflet-draw-css';
      leafletDrawCSS.rel = 'stylesheet';
      leafletDrawCSS.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
      document.head.appendChild(leafletDrawCSS);
    }

    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if (!window.L) {
          const leafletScript = document.createElement('script');
          leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          leafletScript.crossOrigin = '';
          leafletScript.onload = () => resolve();
          document.body.appendChild(leafletScript);
        } else {
          resolve();
        }
      });
    };

    const loadLeafletDraw = () => {
      return new Promise<void>((resolve) => {
        if (window.L && !window.L.Draw) {
          const leafletDrawScript = document.createElement('script');
          leafletDrawScript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
          leafletDrawScript.onload = () => resolve();
          document.body.appendChild(leafletDrawScript);
        } else if (window.L && window.L.Draw) {
          resolve();
        }
      });
    };

    const setupMap = async () => {
      await loadLeaflet();
      await loadLeafletDraw();
      initializeMap();
    };

    setupMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L) return;
    if (mapInstance) return;

    const map = window.L.map(mapContainerRef.current).setView([22.9734, 78.6569], 5);

    const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });

    const topoLayer = window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap'
    });

    const googleStreets = window.L.tileLayer('http://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google'
    });

    const googleHybrid = window.L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google'
    });

    const googleTerrain = window.L.tileLayer('http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google'
    });
    
    const googleTraffic = window.L.tileLayer('https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; <a href="https://www.google.com/maps">Google Traffic</a>',
    });
    
    const baseMaps = {
      "Google Traffic": googleTraffic, // Moved to the top so it's the first option in the control
      "OpenStreetMap": osmLayer,
      "Satellite (Esri)": satelliteLayer,
      "Topographic": topoLayer,
      "Google Streets": googleStreets,
      "Google Hybrid": googleHybrid,
      "Google Terrain": googleTerrain
    };

    // Add Google Traffic as the default layer
    googleTraffic.addTo(map);

    const controls = window.L.control.layers(baseMaps, {});
    controls.addTo(map);

    // Create feature group for drawn items
    const drawnItems = new window.L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add drawing controls
    const drawControlOptions = {
      position: 'topright',
      draw: {
        polyline: {
          shapeOptions: {
            color: '#f357a1',
            weight: 3
          }
        },
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#3388ff'
          }
        },
        circle: {
          shapeOptions: {
            color: '#662d91'
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#ff9800'
          }
        },
        marker: true
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    };

    const drawControl = new window.L.Control.Draw(drawControlOptions);
    map.addControl(drawControl);

    // Handle created items
    map.on('draw:created', function (e: any) {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      // Make the layer selectable
      layer.on('click', function() {
        selectFeature(layer);
        
        // If it's a marker, show coordinates
        if (layer instanceof window.L.Marker) {
          const latLng = layer.getLatLng();
          setCoordinates(`Marker at: ${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`);
        }
      });
      
      // Re-enable drawing tools after a shape is created
      drawControl.setDrawingOptions(drawControlOptions.draw);
      map.addControl(drawControl);
    });

    // Update coordinates on mouse move
    map.on('mousemove', function(e: any) {
      const { lat, lng } = e.latlng;
      setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });

    // Add compass (North arrow)
    const compassControl = window.L.control({position: 'topright'});
    compassControl.onAdd = function() {
      const div = window.L.DomUtil.create('div', 'compass-control');
      div.innerHTML = `
        <div style="background-color: white; padding: 5px; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
          <svg width="30" height="30" viewBox="0 0 100 100">
            <polygon points="50,0 40,40 50,30 60,40" fill="#e74c3c" />
            <polygon points="50,100 40,60 50,70 60,60" fill="#3498db" />
          </svg>
        </div>
      `;
      compassRef.current = div;
      return div;
    };
    compassControl.addTo(map);

    // Add button to clear all drawn items
    const clearControl = window.L.control({position: 'bottomright'});
    clearControl.onAdd = function() {
      const div = window.L.DomUtil.create('div', 'clear-control');
      div.innerHTML = `
        <button style="background-color: white; padding: 5px 10px; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.3); cursor: pointer;">
          Clear All
        </button>
      `;
      div.onclick = function() {
        drawnItems.clearLayers();
        setSelectedFeature(null);
        setCoordinates('');
      };
      return div;
    };
    clearControl.addTo(map);

    // Toggle compass button
    const toggleCompassControl = window.L.control({position: 'bottomright'});
    toggleCompassControl.onAdd = function() {
      const div = window.L.DomUtil.create('div', 'toggle-compass-control');
      div.innerHTML = `
        <button style="background-color: white; padding: 5px 10px; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.3); cursor: pointer; margin-bottom: 10px;">
          Toggle Compass
        </button>
      `;
      div.onclick = function() {
        const newShowCompass = !showCompass;
        setShowCompass(newShowCompass);
        if (compassRef.current) {
          compassRef.current.style.display = newShowCompass ? 'block' : 'none';
        }
      };
      return div;
    };
    toggleCompassControl.addTo(map);

    // Fix for draw control events
    map.on('draw:drawstart', function() {
      // Disable layer selection while drawing to avoid conflicts
      map.off('click');
    });
    
    map.on('draw:drawstop', function() {
      // Re-enable layer selection after drawing is complete
      map.on('click', function(e: any) {
        // Check if the click is on an existing feature
        const clickPoint = e.latlng;
        let clickedLayer = null;
        
        drawnItems.eachLayer(function(layer: any) {
          // For polygons, polylines, circles, rectangles
          if (layer.getBounds && layer.contains && layer.contains(clickPoint)) {
            clickedLayer = layer;
          }
          // For markers
          else if (layer.getLatLng && layer.getLatLng().distanceTo(clickPoint) < 20) {
            clickedLayer = layer;
          }
        });
        
        if (clickedLayer) {
          selectFeature(clickedLayer);
        }
      });
    });

    setMapInstance(map);
    setLayerControls(controls);
    setDrawControl(drawControl);
  };

  // Function to select a feature and deselect others
  const selectFeature = (layer: any) => {
    // Reset previously selected feature
    if (selectedFeature) {
      if (selectedFeature.setStyle) {
        selectedFeature.setStyle({
          weight: 3,
          color: selectedFeature.options.color || '#3388ff',
          opacity: 1,
          fillOpacity: 0.2
        });
      }
    }

    // Set new selected feature
    setSelectedFeature(layer);
    
    // Apply active style to selected feature
    if (layer.setStyle) {
      layer.setStyle({
        weight: 5,
        color: '#ff0000',
        opacity: 1,
        fillOpacity: 0.4
      });
    }
    
    // If it's a marker, we can't set style but we can update its icon
    if (layer instanceof window.L.Marker) {
      // You could use a different icon for selected markers here
    }
  };

  // Effect to handle compass visibility changes
  useEffect(() => {
    if (compassRef.current) {
      compassRef.current.style.display = showCompass ? 'block' : 'none';
    }
  }, [showCompass]);

  useEffect(() => {
    if (!mapInstance || !layerControls) return;

    mapInstance.eachLayer((layer: any) => {
      if (layer._url === undefined || layer._url.indexOf('tile') === -1) {
        mapInstance.removeLayer(layer);
      }
    });
  }, [activeTab, mapInstance, layerControls]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-[700px] border rounded-md overflow-hidden shadow-md"
      />
      <div className="mt-2 p-2 bg-gray-100 rounded-md">
        <p className="text-sm font-medium">Coordinates: {coordinates}</p>
        {selectedFeature && (
          <p className="text-sm font-medium mt-1 text-blue-600">
            Feature selected: {selectedFeature instanceof window.L.Marker 
              ? 'Marker' 
              : selectedFeature instanceof window.L.Polygon 
                ? 'Polygon' 
                : selectedFeature instanceof window.L.Polyline 
                  ? 'Line' 
                  : selectedFeature instanceof window.L.Circle 
                    ? 'Circle' 
                    : selectedFeature instanceof window.L.Rectangle 
                      ? 'Rectangle' 
                      : 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );
};

export default LeafletMapPreview;