'use client'
import React, { useState, useEffect } from 'react';
import { useConditioningFactors, ConditioningFactor } from '../../../../../contexts/Suitability/conditioningContext';

interface ConditioningFactorSliderProps {
  selectedFactors: ConditioningFactor[];
}

const ConditioningFactorSlider: React.FC<ConditioningFactorSliderProps> = ({ selectedFactors }) => {
  const { factors, updateFactors } = useConditioningFactors();
  // Local state to track current weights for immediate UI updates
  const [localWeights, setLocalWeights] = useState<{[key: string]: number}>({});
  
  // Initialize local weights from selected factors when component mounts or selection changes
  useEffect(() => {
    const initialWeights: {[key: string]: number} = {};
    selectedFactors.forEach(factor => {
      initialWeights[factor.id] = factor.weight;
    });
    setLocalWeights(initialWeights);
    
    // Calculate total weight for logging
    if (selectedFactors.length > 0) {
      const totalWeight = selectedFactors.reduce((sum, factor) => sum + factor.weight, 0);
      console.log('Total weight of selected factors:', totalWeight);
    }
  }, [selectedFactors]);

  // If no factors are selected, show a message
  if (selectedFactors.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select conditioning factors to adjust their weights
      </div>
    );
  }

  const handleWeightChange = (id: string, weight: number) => {
    // Update local state immediately for UI responsiveness
    setLocalWeights(prev => ({
      ...prev,
      [id]: weight
    }));
    
    // Update the global context state
    const updatedFactors = factors.map(factor => 
      factor.id === id ? { ...factor, weight } : factor
    );
    updateFactors(updatedFactors);
    
    console.log(`Changed weight for factor ID ${id} to ${weight}`);
  };
  
  // Helper function to get current weight (from local state or fallback to factor weight)
  const getWeight = (factorId: string): number => {
    return localWeights[factorId] !== undefined ? localWeights[factorId] : 
      selectedFactors.find(f => f.id === factorId)?.weight || 1;
  };
  
  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Percentage Influence</h3>
      
      <div className="space-y-5">
        {selectedFactors.map((factor) => (
          <div key={factor.id} className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-blue-600 truncate max-w-[70%]">
                {factor.fileName}
              </span>
              <span className="text-sm font-bold">
                {getWeight(factor.id)}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 w-24 text-left">
                <span className="font-medium">1</span> (Least Important)
              </div>
              
              <div className="relative flex-1">
                {/* Custom slider track with gradient */}
                <div className="absolute h-2 w-full rounded-lg bg-gradient-to-r from-blue-100 to-blue-600"></div>
                
                {/* Tick marks for reference points */}
                <div className="absolute w-full flex justify-between px-1 -mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-0.5 bg-gray-300"></div>
                  ))}
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={getWeight(factor.id)}
                  onChange={(e) => handleWeightChange(factor.id, parseInt(e.target.value))}
                  className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                  style={{
                    // Custom thumb styling that's compatible with the slider functionality
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                  aria-label={`Adjust importance of ${factor.fileName} from 1 (least important) to 10 (most important)`}
                />
              </div>
              
              <div className="text-xs text-gray-500 w-24 text-right">
                <span className="font-medium">10</span> (Most Important)
              </div>
            </div>
            
            {/* Visual scale indicators */}
            <div className="flex justify-between mt-1 px-24">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-blue-100"></div>
                <span className="text-xs text-gray-400">Low</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                <span className="text-xs text-gray-400">Medium</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="text-xs text-gray-400">High</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600 border-l-4 border-blue-400">
        <p className="font-medium mb-1">How to use:</p>
        <p>Drag the sliders to adjust the importance of each conditioning factor. Higher values (closer to 10) give more weight to that factor in the suitability analysis.</p>
        <p className="mt-2 text-xs text-gray-500">Total weight: {Object.values(localWeights).reduce((sum, weight) => sum + weight, 0)}</p>
      </div>
    </div>
  );
};

export default ConditioningFactorSlider;