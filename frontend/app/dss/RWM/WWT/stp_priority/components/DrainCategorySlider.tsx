'use client'
import React from 'react';
import { useDrainCategory } from '@/app/contexts/stp_priority/DrainCategoryContext';

export const DrainCategorySlider: React.FC = () => {
  const {
    categories,
    isSelected,
    getCategoryInfluence,
    getCategoryWeight,
    updateCategoryInfluence
  } = useDrainCategory();
  
  // Get only selected categories
  const selectedCategories = categories.filter(category => isSelected(category.RasterName));
  
  // If no categories are selected, show a message
  if (selectedCategories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No drain categories selected. Please select at least one category to adjust influences.
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-4">
        Adjust the influence of each category on the drain analysis. Higher values give more importance to a category.
      </p>
      
      <div className="space-y-5">
        {selectedCategories.map(category => {
          const influence = getCategoryInfluence(category.RasterName);
          const weight = getCategoryWeight(category.RasterName);
          
          return (
            <div key={category.id} className="mb-3">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <span className={`text-lg mr-2 ${category.color}`}>
                    <i className={`fas fa-${category.icon}`}></i>
                  </span>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-blue-600">
                    {influence.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    (Weight: {(weight * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={influence}
                  onChange={(e) => updateCategoryInfluence(category.RasterName, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low Influence</span>
                  <span>High Influence</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* <div className="mt-5 p-3 bg-blue-50 rounded-md">
        <h4 className="text-sm font-semibold text-blue-700 mb-1">Influence Distribution</h4>
        <div className="relative h-8 bg-gray-200 rounded-md overflow-hidden">
          {selectedCategories.map((category, index, array) => {
            // Calculate cumulative percentage for positioning
            const previousWidth = array
              .slice(0, index)
              .reduce((sum, cat) => sum + getCategoryWeight(cat.RasterName) * 100, 0);
            
            // Width based on weight percentage
            const width = getCategoryWeight(category.RasterName) * 100;
            
            return (
              <div
                key={category.id}
                className={`absolute top-0 bottom-0 ${category.color.replace('text-', 'bg-')}`}
                style={{
                  left: `${previousWidth}%`,
                  width: `${width}%`,
                }}
                title={`${category.name}: ${width.toFixed(2)}%`}
              ></div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {selectedCategories.map(category => (
            <div key={category.id} className="flex items-center text-xs">
              <span
                className={`inline-block w-3 h-3 mr-1 rounded-sm ${category.color.replace('text-', 'bg-')}`}
              ></span>
              <span className="truncate">{category.name}</span>
              <span className="ml-1 text-gray-500">
                {(getCategoryWeight(category.RasterName) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default DrainCategorySlider;