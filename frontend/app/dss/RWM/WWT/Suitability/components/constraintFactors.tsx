'use client'
import React, { useEffect } from 'react';
import { useConstraintFactors, ConstraintFactor } from '../../../../../contexts/Suitability/constraintContext';

interface ConstraintFactorsProps {
  onFactorsChange?: (factors: ConstraintFactor[]) => void;
}

const ConstraintFactors: React.FC<ConstraintFactorsProps> = ({ onFactorsChange }) => {
  const { factors, loading, updateFactors } = useConstraintFactors();

  useEffect(() => {
    console.log('Current constraint factors in component:', factors);
  }, [factors]);

  const factorsByCategory: Record<string, ConstraintFactor[]> = React.useMemo(() => {
    return factors.reduce((acc: Record<string, ConstraintFactor[]>, factor) => {
      const category = factor.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(factor);
      return acc;
    }, {});
  }, [factors]);

  const handleFactorToggle = (id: string) => {
    console.log('Toggling constraint factor with ID:', id);
    const updatedFactors = factors.map(factor => 
      factor.id === id ? { ...factor, selected: !factor.selected } : factor
    );
    updateFactors(updatedFactors);
    onFactorsChange?.(updatedFactors.filter(f => f.selected));
  };

  const handleSelectAllCategory = (category: string, select: boolean) => {
    console.log(`${select ? 'Selecting' : 'Deselecting'} all constraint factors in category:`, category);
    const updatedFactors = factors.map(factor => 
      factor.category === category ? { ...factor, selected: select } : factor
    );
    updateFactors(updatedFactors);
    onFactorsChange?.(updatedFactors.filter(f => f.selected));
  };

  console.log('ConstraintFactors component rendering with factors count:', factors.length);

  return (
    <div className="bg-white rounded-md shadow-md p-6 mt-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Constraint Factors</h2>
      {loading ? (
        <div className="py-4 text-center text-gray-500">Loading constraint factors...</div>
      ) : factors.length === 0 ? (
        <div className="py-4 text-center text-gray-500">No constraint factors available. Add API implementation to fetch data.</div>
      ) : (
        <>
          {Object.entries(factorsByCategory).map(([category, categoryFactors]) => (
            <div key={category} className="mb-8">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-base font-medium text-gray-700">{category}</h3>
                <div className="flex gap-2">
                  <button 
                    className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                    onClick={() => handleSelectAllCategory(category, true)}
                  >
                    Select All
                  </button>
                  <button 
                    className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
                    onClick={() => handleSelectAllCategory(category, false)}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {categoryFactors.map(factor => (
                  <div 
                    key={factor.id} 
                    className={`rounded-lg border p-3 transition-all ${
                      factor.selected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow'
                    }`}
                  >
                    <label className="flex items-start cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={factor.selected}
                        onChange={() => handleFactorToggle(factor.id)}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          
                        </div>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm text-black-600 font-medium truncate">
                            {factor.fileName}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ConstraintFactors;