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
  primaryLayer: string;
  secondaryLayer: string | null;
  layerFilter: string | null;
  layerFilterValue: number[] | null;
  selectedLocations: {
    state: string;
    districts: string[];
    subDistricts: string[];
  };
  baseMapType: 'osm' | 'satellite' | 'terrain';
  setBaseMapType: (type: 'osm' | 'satellite' | 'terrain') => void;
  setPrimaryLayer: (layer: string) => void;
  setSecondaryLayer: (layer: string | null) => void;
  syncLayersWithLocation: () => void;
  isMapLoading: boolean;
  zoomToFeature: (featureId: number | string, layerName: string) => void;
  resetMapView: () => void;
  LAYER_NAMES: typeof LAYER_NAMES;
}

// Props for the MapProvider component
interface MapProviderProps {
  children: ReactNode;
}

// Create the map context with default values
const MapContext = createContext<MapContextType>({
  primaryLayer: LAYER_NAMES.STATE,
  secondaryLayer: null,
  layerFilter: null,
  layerFilterValue: null,
  selectedLocations: {
    state: '',
    districts: [],
    subDistricts: []
  },
  baseMapType: 'osm',
  setBaseMapType: () => {},
  setPrimaryLayer: () => {},
  setSecondaryLayer: () => {},
  syncLayersWithLocation: () => {},
  isMapLoading: false,
  zoomToFeature: () => {},
  resetMapView: () => {},
  LAYER_NAMES
});

// Create the provider component
export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  // State for layer management
  const [primaryLayer, setPrimaryLayer] = useState<string>(LAYER_NAMES.STATE);
  const [secondaryLayer, setSecondaryLayer] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<string|null>(null);
  const [layerFilterValue, setLayerFilterValue] = useState<number[]|null>(null);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  
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

  // Function to reset map view (zoom to default)
  const resetMapView = (): void => {
    console.log("Map view reset requested");
  };

  // Function to zoom to a specific feature
  const zoomToFeature = (featureId: number | string, layerName: string): void => {
    console.log(`Zoom to feature ${featureId} in layer ${layerName} requested`);
  };

  // Synchronize layers based on location selections
  const syncLayersWithLocation = (): void => {
    setIsMapLoading(true);
    
    // Default to showing states
    let primary: string = LAYER_NAMES.STATE;
    let secondary: string | null = null;
    let filter: string | null = null;
    let filterValue: number[] | null = null;
    
    // Logic for determining which layers to show based on selection state
    if (selectedSubDistricts.length > 0) {
      secondary = LAYER_NAMES.SUB_DISTRICT;
      filter = 'id';
      filterValue = selectedSubDistricts;
      console.log("Setting layer to SUB_DISTRICT, filtering by:", selectedSubDistricts);
    }
    else if (selectedDistricts.length > 0) {
      secondary = LAYER_NAMES.DISTRICT;
      filter = 'id';
      filterValue = selectedDistricts;
      console.log("Setting layer to DISTRICT, filtering by:", selectedDistricts);
    }
    else if (selectedState) {
      secondary = LAYER_NAMES.STATE;
      filter = 'id';
      filterValue = [selectedState];
      console.log("Setting layer to STATE, filtering by:", selectedState);
    }

    // Update state with new layer configuration
    setPrimaryLayer(primary);
    setSecondaryLayer(secondary);
    setLayerFilter(filter);
    setLayerFilterValue(filterValue);
    setIsMapLoading(false);
  };

  // Effect for state selection
  useEffect(() => {
    if (selectedState !== null) {
      // Find state name from the ID
      const stateName = states.find(s => s.id === selectedState)?.name || '';
      console.log("STATE SELECTED:", selectedState, stateName);
      
      // Update the selectedLocations with the state name
      setSelectedLocations(prev => ({
        ...prev,
        state: stateName
      }));
    } else {
      // Reset state selection
      console.log("NO STATE SELECTED");
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
      
      console.log("DISTRICTS SELECTED:", selectedDistricts, districtNames);
      
      // Update the selectedLocations with the district names
      setSelectedLocations(prev => ({
        ...prev,
        districts: districtNames
      }));
    } else {
      // Reset district selection
      console.log("NO DISTRICTS SELECTED");
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
        console.log("SUBDISTRICTS SELECTED AND LOCKED:", selectedSubDistricts, subDistrictNames);
      } else {
        console.log("SUBDISTRICTS SELECTED BUT NOT LOCKED:", selectedSubDistricts, subDistrictNames);
      }
      
      // Update the selectedLocations with the subdistrict names
      setSelectedLocations(prev => ({
        ...prev,
        subDistricts: subDistrictNames
      }));
    } else {
      // Reset subdistrict selection
      console.log("NO SUBDISTRICTS SELECTED");
      setSelectedLocations(prev => ({
        ...prev,
        subDistricts: []
      }));
    }
  }, [selectedSubDistricts, subDistricts, selectionsLocked]);

  // Listen for changes in location selection and update layers accordingly
  useEffect(() => {
    syncLayersWithLocation();
  }, [
    selectedState,
    selectedDistricts.length,
    selectedSubDistricts.length,
  ]);

  // Context value - combines both approaches
  const contextValue: MapContextType = {
    primaryLayer,
    secondaryLayer,
    layerFilter,
    layerFilterValue,
    selectedLocations,
    baseMapType,
    setBaseMapType,
    setPrimaryLayer,
    setSecondaryLayer,
    syncLayersWithLocation,
    isMapLoading,
    zoomToFeature,
    resetMapView,
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