'use client';

import React from 'react';

interface MapPartProps {
  // You can add props for map data or configuration
  mapUrl?: string;
  onExportPng?: () => void;
  onExportLayer?: () => void;
}

export default function MapPart({ 
  mapUrl = '/api/placeholder/600/400',
  onExportPng,
  onExportLayer
}: MapPartProps) {
  
  // Handle export as PNG
  const handleExportPng = () => {
    console.log('Exporting as PNG');
    if (onExportPng) {
      onExportPng();
    }
  };
  
  // Handle export as Layer
  const handleExportLayer = () => {
    console.log('Exporting as Layer');
    if (onExportLayer) {
      onExportLayer();
    }
  };
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-md font-semibold mb-2">Visualization :</h3>
      <div className="w-full h-64 bg-blue-50 border rounded-lg flex items-center justify-center mb-4">
        <img 
          src={mapUrl} 
          alt="Map visualization" 
          className="max-w-full max-h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          onClick={handleExportPng}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
        >
          Export as PNG
        </button>
        <button 
          onClick={handleExportLayer}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
        >
          Export as Layer
        </button>
      </div>
    </div>
  );
}