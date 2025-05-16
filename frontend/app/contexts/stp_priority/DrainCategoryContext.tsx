'use client'
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types
export interface DrainCategory {
  id: number;
  name: string;
  RasterName: string;
  icon: string;
  defaultInfluence: string;
  color: string;
}

// Interface for raster layer selection with added weight field
export interface SelectDrainRasterLayer {
  RasterName: string;
  Influence: string;
  weight?: string; // New field for weight calculation
}

interface DrainCategoryContextType {
  categories: DrainCategory[];
  selectedCategoryName: SelectDrainRasterLayer[];
  selectedCategories: SelectDrainRasterLayer[];
  toggleCategory: (RasterName: string) => void;
  updateCategoryInfluence: (RasterName: string, Influence: number) => void;
  selectAllCategories: () => void;
  clearAllCategories: () => void;
  isSelected: (RasterName: string) => boolean;
  getCategoryInfluence: (RasterName: string) => number;
  getCategoryWeight: (RasterName: string) => number;
  stpProcess: boolean;
  setStpProcess: (value: boolean) => void;
}

interface DrainCategoryProviderProps {
  children: ReactNode;
}

// Create context with default undefined value
const DrainCategoryContext = createContext<DrainCategoryContextType | undefined>(undefined);

// Available categories with their details - specific to drain-based analysis
const AVAILABLE_DRAIN_CATEGORIES: DrainCategory[] = [
  {
    id: 1,
    name: 'Flow Rate',
    RasterName: 'STP_Drain_Flow_Rate_Raster',
    icon: 'water',
    defaultInfluence: '3.75',
    color: 'text-blue-500'
  },
  {
    id: 2,
    name: 'Pollution Load',
    RasterName: 'STP_Drain_Pollution_Load_Raster',
    icon: 'biohazard',
    defaultInfluence: '3.10',
    color: 'text-red-500'
  },
  {
    id: 3,
    name: 'Discharge Point Elevation',
    RasterName: 'STP_Drain_Elevation_Raster',
    icon: 'mountain',
    defaultInfluence: '1.85',
    color: 'text-green-600'
  },
  {
    id: 4,
    name: 'Accessibility',
    RasterName: 'STP_Drain_Accessibility_Raster',
    icon: 'road',
    defaultInfluence: '1.40',
    color: 'text-yellow-500'
  },
  {
    id: 5,
    name: 'Land Availability',
    RasterName: 'STP_Drain_Land_Availability_Raster',
    icon: 'map',
    defaultInfluence: '1.20',
    color: 'text-purple-500'
  },
  {
    id: 6,
    name: 'Population Served',
    RasterName: 'STP_Drain_Population_Served_Raster',
    icon: 'users',
    defaultInfluence: '0.95',
    color: 'text-indigo-500'
  },
  {
    id: 7,
    name: 'Critical Infrastructure Proximity',
    RasterName: 'STP_Drain_Infrastructure_Proximity_Raster',
    icon: 'building',
    defaultInfluence: '0.65',
    color: 'text-gray-600'
  },
  {
    id: 8,
    name: 'Existing Treatment Capacity',
    RasterName: 'STP_Drain_Treatment_Capacity_Raster',
    icon: 'filter',
    defaultInfluence: '0.55',
    color: 'text-blue-400'
  }
];

// DrainCategory provider component
export const DrainCategoryProvider = ({ children }: DrainCategoryProviderProps) => {
  const [selectedCategoryName, setSelectedCategoryName] = useState<SelectDrainRasterLayer[]>([]);
  const [stpProcess, setStpProcess] = useState<boolean>(false);

  // Calculate weights for all selected categories
  const calculateWeights = (categories: SelectDrainRasterLayer[]): SelectDrainRasterLayer[] => {
    if (categories.length === 0) return [];
    
    // Calculate sum of all influences
    const totalInfluence = categories.reduce((sum, category) => {
      return sum + parseFloat(category.Influence);
    }, 0);
    
    // If sum is 0, assign equal weights
    if (totalInfluence === 0) {
      const equalWeight = (1 / categories.length).toFixed(4);
      return categories.map(category => ({
        ...category,
        weight: equalWeight
      }));
    }
    
    // Calculate weight for each category
    return categories.map(category => {
      const weight = (parseFloat(category.Influence) / totalInfluence).toFixed(4);
      return {
        ...category,
        weight
      };
    });
  };

  // Get selected category details for API with weights
  const getSelectedCategoryNames = (): SelectDrainRasterLayer[] => {
    const selectedCategories = AVAILABLE_DRAIN_CATEGORIES
      .filter(category => selectedCategoryName.some(item => item.RasterName === category.RasterName))
      .map(category => {
        // Find the custom Influence if it exists
        const customInfluence = selectedCategoryName.find(
          item => item.RasterName === category.RasterName
        )?.Influence;
        
        return {
          RasterName: category.RasterName,
          Influence: customInfluence || category.defaultInfluence
        };
      });
    
    // Calculate and add weights
    return calculateWeights(selectedCategories);
  };
  
  // Toggle a category selection
  const toggleCategory = (RasterName: string): void => {
    setSelectedCategoryName(prev => {
      // Find if the RasterName already exists in the selection
      const isSelected = prev.some(item => item.RasterName === RasterName);
      
      let newSelection;
      if (isSelected) {
        // Remove it if already selected
        newSelection = prev.filter(item => item.RasterName !== RasterName);
      } else {
        // Add it with defaultInfluence from the AVAILABLE_DRAIN_CATEGORIES
        const category = AVAILABLE_DRAIN_CATEGORIES.find(cat => cat.RasterName === RasterName);
        if (category) {
          newSelection = [...prev, { RasterName, Influence: category.defaultInfluence }];
        } else {
          newSelection = prev;
        }
      }
      
      // Recalculate weights after changing selection
      return calculateWeights(newSelection);
    });
  };
  
  // Update the Influence of a category (for slider)
  const updateCategoryInfluence = (RasterName: string, Influence: number): void => {
    // Ensure Influence is between 0 and 100
    const clampedInfluence = Math.min(Math.max(Influence, 0), 100);
    
    setSelectedCategoryName(prev => {
      let updatedCategories;
      const categoryIndex = prev.findIndex(item => item.RasterName === RasterName);
      
      if (categoryIndex !== -1) {
        // Update existing category Influence
        updatedCategories = [...prev];
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          Influence: clampedInfluence.toString()
        };
      } else {
        // Add category with custom Influence if not already selected
        const category = AVAILABLE_DRAIN_CATEGORIES.find(cat => cat.RasterName === RasterName);
        if (category) {
          updatedCategories = [...prev, { RasterName, Influence: clampedInfluence.toString() }];
        } else {
          updatedCategories = prev;
        }
      }
      
      // Recalculate weights after updating influence
      return calculateWeights(updatedCategories);
    });
  };
  
  // Get the current Influence of a category (for slider value)
  const getCategoryInfluence = (RasterName: string): number => {
    const selectedCategory = selectedCategoryName.find(item => item.RasterName === RasterName);
    if (selectedCategory) {
      return parseFloat(selectedCategory.Influence);
    }
    
    // Return default Influence if category not selected
    const defaultCategory = AVAILABLE_DRAIN_CATEGORIES.find(cat => cat.RasterName === RasterName);
    return defaultCategory ? parseFloat(defaultCategory.defaultInfluence) : 0;
  };
  
  // Get the current weight of a category
  const getCategoryWeight = (RasterName: string): number => {
    const selectedCategory = selectedCategoryName.find(item => item.RasterName === RasterName);
    if (selectedCategory && selectedCategory.weight) {
      return parseFloat(selectedCategory.weight);
    }
    return 0;
  };
  
  // Select all categories
  const selectAllCategories = (): void => {
    const allCategories = AVAILABLE_DRAIN_CATEGORIES.map(category => ({
      RasterName: category.RasterName,
      Influence: category.defaultInfluence
    }));
    
    // Calculate weights and update state
    setSelectedCategoryName(calculateWeights(allCategories));
  };
  
  // Clear all selected categories
  const clearAllCategories = (): void => {
    setSelectedCategoryName([]);
  };
  
  // Check if a category is selected
  const isSelected = (RasterName: string): boolean => {
    return selectedCategoryName.some(item => item.RasterName === RasterName);
  };
  
  // Context value
  const contextValue: DrainCategoryContextType = {
    categories: AVAILABLE_DRAIN_CATEGORIES,
    selectedCategoryName,
    selectedCategories: getSelectedCategoryNames(),
    toggleCategory,
    updateCategoryInfluence,
    selectAllCategories,
    clearAllCategories,
    isSelected,
    getCategoryInfluence,
    getCategoryWeight,
    stpProcess,
    setStpProcess
  };
  
  return (
    <DrainCategoryContext.Provider value={contextValue}>
      {children}
    </DrainCategoryContext.Provider>
  );
};

// Custom hook to use the drain category context
export const useDrainCategory = (): DrainCategoryContextType => {
  const context = useContext(DrainCategoryContext);
  if (context === undefined) {
    throw new Error('useDrainCategory must be used within a DrainCategoryProvider');
  }
  return context;
};