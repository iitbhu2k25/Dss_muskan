'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from './locationContext';

// Define layer name constants
const LAYER_NAMES = {
  STATE: "state_boundary",
  DISTRICT: "district_boundary",
  SUB_DISTRICT: "subdistrict_boundary",
};

// Type definitions for the context
interface MapContextType {
  selectedLocations: {
    state: string;
    districts: string[];
    subDistricts: string[];
  };
  baseMapType: 'osm' | 'satellite' | 'terrain';
  setBaseMapType: (type: 'osm' | 'satellite' | 'terrain') => void;
  LAYER_NAMES: typeof LAYER_NAMES;
}

// Props for the MapProvider component
interface MapProviderProps {
  children: ReactNode;
}

// Create the map context with default values
const MapContext = createContext<MapContextType>({
  selectedLocations: {
    state: '',
    districts: [],
    subDistricts: []
  },
  baseMapType: 'osm',
  setBaseMapType: () => {},
  LAYER_NAMES
});

// Create the provider component
export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  // State for map data - matching the existing MapComponent props
  const [selectedLocations, setSelectedLocations] = useState<{
    state: string;
    districts: string[];
    subDistricts: string[];
  }>({
    state: '',
    districts: [],
    subDistricts: []
  });
  
  // Base map type state
  const [baseMapType, setBaseMapType] = useState<'osm' | 'satellite' | 'terrain'>('osm');
  
  // Get location context data
  const {
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
    states,
    districts,
    subDistricts,
    selectionsLocked
  } = useLocation();

  // Effect for state selection
  useEffect(() => {
    if (selectedState !== null) {
      // Find state name from the ID
      const stateName = states.find(s => s.id === selectedState)?.name || '';
      console.log("🔵 STATE SELECTED:", selectedState, stateName);
      
      // Update the selectedLocations with the state name
      setSelectedLocations(prev => ({
        ...prev,
        state: stateName
      }));
    } else {
      // Reset state selection
      console.log("🔵 NO STATE SELECTED");
      setSelectedLocations(prev => ({
        ...prev,
        state: ''
      }));
    }
  }, [selectedState, states]);

  // Effect for district selection
  useEffect(() => {
    if (selectedDistricts.length > 0) {
      // Find district names from the IDs
      const districtNames = selectedDistricts.map(id => 
        districts.find(d => d.id === id)?.name || ''
      ).filter(Boolean);
      
      console.log("🟢 DISTRICTS SELECTED:", selectedDistricts, districtNames);
      
      // Update the selectedLocations with the district names
      setSelectedLocations(prev => ({
        ...prev,
        districts: districtNames
      }));
    } else {
      // Reset district selection
      console.log("🟢 NO DISTRICTS SELECTED");
      setSelectedLocations(prev => ({
        ...prev,
        districts: []
      }));
    }
  }, [selectedDistricts, districts]);

  // Effect for subdistrict selection
  useEffect(() => {
    if (selectedSubDistricts.length > 0) {
      // Find subdistrict names from the IDs
      const subDistrictNames = selectedSubDistricts.map(id => 
        subDistricts.find(sd => sd.id === id)?.name || ''
      ).filter(Boolean);
      
      if (selectionsLocked) {
        console.log("🟣 SUBDISTRICTS SELECTED AND LOCKED:", selectedSubDistricts, subDistrictNames);
      } else {
        console.log("🟣 SUBDISTRICTS SELECTED BUT NOT LOCKED:", selectedSubDistricts, subDistrictNames);
      }
      
      // Update the selectedLocations with the subdistrict names
      setSelectedLocations(prev => ({
        ...prev,
        subDistricts: subDistrictNames
      }));
    } else {
      // Reset subdistrict selection
      console.log("🟣 NO SUBDISTRICTS SELECTED");
      setSelectedLocations(prev => ({
        ...prev,
        subDistricts: []
      }));
    }
  }, [selectedSubDistricts, subDistricts, selectionsLocked]);

  // Context value - matches the props expected by your MapComponent
  const contextValue: MapContextType = {
    selectedLocations,
    baseMapType,
    setBaseMapType,
    LAYER_NAMES
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

// Custom hook to use the map context
export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};