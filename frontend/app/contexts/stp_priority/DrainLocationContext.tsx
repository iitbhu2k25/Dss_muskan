'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for the drain location data
export interface River {
  id: string | number;
  name: string;
}

export interface Stretch {
  id: string | number;
  name: string;
  riverId: string | number;
}

export interface Drain {
  id: string | number;
  name: string;
  stretchId: string | number;
  flowRate: number;
}

// Interface for selections return data
export interface DrainSelectionsData {
  drains: Drain[];
  totalFlowRate: number;
}

// Define the context type
interface DrainLocationContextType {
  rivers: River[];
  stretches: Stretch[];
  drains: Drain[];
  selectedRiver: string | null;
  selectedStretch: string | null;
  selectedDrains: string[];
  totalFlowRate: number;
  selectionsLocked: boolean;
  isLoading: boolean;
  handleRiverChange: (riverId: string) => void;
  setSelectedStretch: (stretchId: string) => void;
  setSelectedDrains: (drainIds: string[]) => void;
  confirmSelections: () => DrainSelectionsData | null;
  resetSelections: () => void;
}

// Props for the DrainLocationProvider component
interface DrainLocationProviderProps {
  children: ReactNode;
}

// Create the drain location context with default values
const DrainLocationContext = createContext<DrainLocationContextType>({
  rivers: [],
  stretches: [],
  drains: [],
  selectedRiver: null,
  selectedStretch: null,
  selectedDrains: [],
  totalFlowRate: 0,
  selectionsLocked: false,
  isLoading: false,
  handleRiverChange: () => {},
  setSelectedStretch: () => {},
  setSelectedDrains: () => {},
  confirmSelections: () => null,
  resetSelections: () => {},
});

// Create the provider component
export const DrainLocationProvider: React.FC<DrainLocationProviderProps> = ({ children }) => {
  // State for location data
  const [rivers, setRivers] = useState<River[]>([]);
  const [stretches, setStretches] = useState<Stretch[]>([]);
  const [drains, setDrains] = useState<Drain[]>([]);
  
  // State for selected locations
  const [selectedRiver, setSelectedRiver] = useState<string | null>(null);
  const [selectedStretch, setSelectedStretch] = useState<string | null>(null);
  const [selectedDrains, setSelectedDrains] = useState<string[]>([]);
  
  // State for additional information
  const [totalFlowRate, setTotalFlowRate] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mock data loading - replace with actual API calls
  useEffect(() => {
    const fetchRivers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_rivers?all_data=true');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const riverData: River[] = data.map((river: any) => ({
          id: river.id,
          name: river.name
        }));
        
        setRivers(riverData);
      } catch (error) {
        console.error('Error fetching rivers:', error);
        // For demonstration, add some mock data if API fails
        setRivers([
          { id: '1', name: 'Ganga River' },
          { id: '2', name: 'Yamuna River' },
          { id: '3', name: 'Brahmaputra River' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRivers();
  }, []);
  
  // Load stretches when river is selected
  useEffect(() => {
    if (!selectedRiver) {
      setStretches([]);
      return;
    }
    
    const fetchStretches = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_stretches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            river: selectedRiver,
            all_data: true, 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const stretchData: Stretch[] = data.map((stretch: any) => ({
          id: stretch.id,
          name: stretch.name,
          riverId: selectedRiver
        }));
        
        setStretches(stretchData);
      } catch (error) {
        console.error('Error fetching stretches:', error);
        // For demonstration, add some mock data if API fails
        setStretches([
          { id: '1', name: 'Upper Stretch', riverId: selectedRiver },
          { id: '2', name: 'Middle Stretch', riverId: selectedRiver },
          { id: '3', name: 'Lower Stretch', riverId: selectedRiver }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStretches();
    
    // Reset dependent selections
    setSelectedStretch(null);
    setSelectedDrains([]);
    setTotalFlowRate(0);
  }, [selectedRiver]);
  
  // Load drains when stretch is selected
  useEffect(() => {
    if (!selectedStretch) {
      setDrains([]);
      return;
    }
    
    setIsLoading(true);
    
    const fetchDrains = async () => {
      try {
        const response = await fetch('http://localhost:7000/api/stp/get_drains/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            stretch: selectedStretch 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const drainData: Drain[] = data.map((drain: any) => ({
          id: drain.id,
          name: drain.name,
          stretchId: selectedStretch,
          flowRate: drain.flowRate || Math.floor(Math.random() * 1000)
        }));
        
        setDrains(drainData);
      } catch (error) {
        console.error('Error fetching drains:', error);
        // For demonstration, add some mock data if API fails
        setDrains([
          { id: '1', name: 'Drain A', stretchId: selectedStretch, flowRate: 450 },
          { id: '2', name: 'Drain B', stretchId: selectedStretch, flowRate: 320 },
          { id: '3', name: 'Drain C', stretchId: selectedStretch, flowRate: 780 },
          { id: '4', name: 'Drain D', stretchId: selectedStretch, flowRate: 560 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrains();
    
    // Reset dependent selections
    setSelectedDrains([]);
    setTotalFlowRate(0);
  }, [selectedStretch]);
  
  // Calculate total flow rate based on selected drains
  useEffect(() => {
    if (selectedDrains.length > 0) {
      // Filter to get only selected drains
      const selectedDrainObjects = drains.filter(drain => 
        selectedDrains.includes(drain.id.toString())
      );
      
      // Calculate total flow rate
      const total = selectedDrainObjects.reduce(
        (sum, drain) => sum + drain.flowRate, 
        0
      );
      
      setTotalFlowRate(total);
    } else {
      setTotalFlowRate(0);
    }
  }, [selectedDrains, drains]);
  
  // Handle river selection
  const handleRiverChange = (riverId: string): void => {
    setSelectedRiver(riverId);
    setSelectedStretch(null);
    setSelectedDrains([]);
    setSelectionsLocked(false);
  };
  
  // Lock selections and return selected data
  const confirmSelections = (): DrainSelectionsData | null => {
    if (selectedDrains.length === 0) {
      return null;
    }
    
    const selectedDrainObjects = drains.filter(drain => 
      selectedDrains.includes(drain.id.toString())
    );
    
    setSelectionsLocked(true);
    
    return {
      drains: selectedDrainObjects,
      totalFlowRate
    };
  };
  
  // Reset all selections
  const resetSelections = (): void => {
    setSelectedRiver(null);
    setSelectedStretch(null);
    setSelectedDrains([]);
    setTotalFlowRate(0);
    setSelectionsLocked(false);
  };
  
  // Context value
  const contextValue: DrainLocationContextType = {
    rivers,
    stretches,
    drains,
    selectedRiver,
    selectedStretch,
    selectedDrains,
    totalFlowRate,
    selectionsLocked,
    isLoading,
    handleRiverChange,
    setSelectedStretch,
    setSelectedDrains,
    confirmSelections,
    resetSelections
  };
  
  return (
    <DrainLocationContext.Provider value={contextValue}>
      {children}
    </DrainLocationContext.Provider>
  );
};

// Custom hook to use the drain location context
export const useDrainLocation = (): DrainLocationContextType => {
  const context = useContext(DrainLocationContext);
  if (context === undefined) {
    throw new Error('useDrainLocation must be used within a DrainLocationProvider');
  }
  return context;
};