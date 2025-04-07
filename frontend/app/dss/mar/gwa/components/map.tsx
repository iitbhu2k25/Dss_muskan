// mar/raster_visual/page.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  activeTab: string;
}

// Using a different name for the implementation to avoid duplicate definitions
const LeafletMapPreview: React.FC<MapPreviewProps> = ({ activeTab }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [layerControls, setLayerControls] = useState<any>(null);

  // Load Leaflet scripts and CSS dynamically
  useEffect(() => {
    // Only load scripts if they aren't already loaded
    if (!document.getElementById('leaflet-css')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.id = 'leaflet-css';
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCSS.crossOrigin = '';
      document.head.appendChild(leafletCSS);
    }

    if (!window.L) {
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletScript.crossOrigin = '';
      leafletScript.onload = initializeMap;
      document.body.appendChild(leafletScript);
    } else {
      // Leaflet is already loaded, initialize map directly
      initializeMap();
    }

    return () => {
      // Clean up map instance when component unmounts
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []); // Only run once on mount

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L) return;
  
    if (!mapInstance) {
      const map = window.L.map(mapContainerRef.current).setView([22.9734, 78.6569], 5);

  
      // Base layers
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
  
      const googleTraffic = window.L.tileLayer('http://mt1.google.com/vt/lyrs=h@221097413,traffic&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Traffic'
      });
  
      const baseMaps = {
        "OpenStreetMap": osmLayer,
        "Satellite (Esri)": satelliteLayer,
        "Topographic": topoLayer,
        "Google Streets": googleStreets,
        "Google Hybrid": googleHybrid,
        "Google Terrain": googleTerrain,
        "Google Traffic": googleTraffic,
      };
  
      // Set default layer
      googleTraffic.addTo(map);
  
      const controls = window.L.control.layers(baseMaps, {});
      controls.addTo(map);
  
      setMapInstance(map);
      setLayerControls(controls);
    }
  };
  

  // Update layers based on active tab
  useEffect(() => {
    if (!mapInstance || !layerControls) return;
    
    // Clear all overlay layers
    mapInstance.eachLayer((layer: any) => {
      if (layer._url === undefined || layer._url.indexOf('tile') === -1) {
        // Not a base tile layer, remove it
        mapInstance.removeLayer(layer);
      }
    });
  }, [activeTab, mapInstance, layerControls]);

    
    

  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 border rounded-md overflow-hidden" ref={mapContainerRef}>
        {/* Leaflet map will be rendered here */}
      </div>
    </div>
  );
};

// Export the renamed component, but keep the original export name
export default LeafletMapPreview;