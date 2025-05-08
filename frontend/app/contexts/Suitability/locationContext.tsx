'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for the location data
export interface State {
  id: string | number;
  name: string;
}

export interface District {
  id: string | number;
  name: string;
  stateId: string | number;
}

export interface SubDistrict {
  id: string | number;
  name: string;
  districtId: string | number;
  population: number;
}

// Interface for selections return data
export interface SelectionsData {
  subDistricts: SubDistrict[];
  totalPopulation: number;
}

// Define the context type
interface LocationContextType {
  states: State[];
  districts: District[];
  subDistricts: SubDistrict[];
  selectedState: number | null;
  selectedDistricts: number[];
  selectedSubDistricts: number[];
  totalPopulation: number;
  selectionsLocked: boolean;
  isLoading: boolean;
  handleStateChange: (stateId: number) => void;
  setSelectedDistricts: (districtIds: number[]) => void;
  setSelectedSubDistricts: (subDistrictIds: number[]) => void;
  confirmSelections: () => SelectionsData | null;
  resetSelections: () => void;
}

// Props for the LocationProvider component
interface LocationProviderProps {
  children: ReactNode;
  onLocationsChange?: (locations: SelectionsData | null) => void;
}

// Create the location context with default values
const LocationContext = createContext<LocationContextType>({
  states: [],
  districts: [],
  subDistricts: [],
  selectedState: null,
  selectedDistricts: [],
  selectedSubDistricts: [],
  totalPopulation: 0,
  selectionsLocked: false,
  isLoading: false,
  handleStateChange: () => {},
  setSelectedDistricts: () => {},
  setSelectedSubDistricts: () => {},
  confirmSelections: () => null,
  resetSelections: () => {},
});

// Create the provider component
export const LocationProvider: React.FC<LocationProviderProps> = ({ children, onLocationsChange }) => {
  // State for location data
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  
  // State for selected locations
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<number[]>([]);
  
  // State for additional information
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch states from API
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_states?all_data=true');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const stateData: State[] = data.map((state: any) => ({
          id: state.id,
          name: state.name
        }));
        
        setStates(stateData);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStates();
  }, []);
  
  // Load districts when state is selected
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    
    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_districts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            state: selectedState,
            all_data: true, 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const districtData: District[] = data.map((district: any) => ({
          id: district.id,
          name: district.name,
          stateId: selectedState
        }));
        
        setDistricts(districtData);
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDistricts();
    
    // Reset dependent selections
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setTotalPopulation(0);
  }, [selectedState]);
  
  // Load sub-districts when districts are selected
  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setSubDistricts([]);
      return;
    }
    
    const fetchSubDistricts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_sub_districts/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            districts: selectedDistricts 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const subDistrictData: SubDistrict[] = data.map((subDistrict: any) => ({
          id: subDistrict.id,
          name: subDistrict.name,
          districtId: selectedDistricts[0], // This might need adjustment based on your data structure
          population: subDistrict.population || 0 // Added population to SubDistrict
        }));
        
        setSubDistricts(subDistrictData);
      } catch (error) {
        console.error('Error fetching sub-districts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubDistricts();
    
    // Reset dependent selections
    setSelectedSubDistricts([]);
    setTotalPopulation(0);
  }, [selectedDistricts]);
  
  // Calculate total population based on selected sub-districts
  useEffect(() => {
    if (selectedSubDistricts.length > 0) {
      // Filter to get only selected sub-districts
      const selectedSubDistrictObjects = subDistricts.filter(subDistrict => 
        selectedSubDistricts.includes(Number(subDistrict.id))
      );
      
      // Calculate total population
      const total = selectedSubDistrictObjects.reduce(
        (sum, subDistrict) => sum + subDistrict.population, 
        0
      );
      
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [selectedSubDistricts, subDistricts]);
  
  // Handle state selection
  const handleStateChange = (stateId: number): void => {
    setSelectedState(stateId);
    // Reset dependent selections
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectionsLocked(false);
  };
  
  // Lock selections and return selected data
  const confirmSelections = (): SelectionsData | null => {
    if (selectedSubDistricts.length === 0) {
      return null;
    }
    
    const selectedSubDistrictObjects = subDistricts.filter(subDistrict => 
      selectedSubDistricts.includes(Number(subDistrict.id))
    );
    
    const selectedData: SelectionsData = {
      subDistricts: selectedSubDistrictObjects,
      totalPopulation
    };
    
    setSelectionsLocked(true);
    
    // Call the onLocationsChange prop if it exists
    if (onLocationsChange) {
      onLocationsChange(selectedData);
    }
    
    return selectedData;
  };
  
  // Reset all selections
  const resetSelections = (): void => {
    setSelectedState(null);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
    
    // Notify parent component about the reset
    if (onLocationsChange) {
      onLocationsChange(null);
    }
  };
  
  // Context value
  const contextValue: LocationContextType = {
    states,
    districts,
    subDistricts,
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
    totalPopulation,
    selectionsLocked,
    isLoading,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    confirmSelections,
    resetSelections
  };
  
  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the location context
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};