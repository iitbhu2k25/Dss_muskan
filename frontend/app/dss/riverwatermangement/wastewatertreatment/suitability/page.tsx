'use client';

import React, { useState } from 'react';
import DataSelectionPart, { Dataset } from './components/DataSelection';
import MapPart from './components/Map';

export default function SiteSuitabilityPage() {
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Handle dataset selection
  const handleDatasetSelection = (datasets: Dataset[]) => {
    setSelectedDatasets(datasets);
  };
  
  // Handle constraints change
  const handleConstraintsChange = (constraintIds: string[]) => {
    setSelectedConstraints(constraintIds);
  };
  
  // Handle conditions change
  const handleConditionsChange = (conditionIds: string[]) => {
    setSelectedConditions(conditionIds);
  };
  
  // Handle export as PNG
  const handleExportPng = () => {
    console.log('Exporting visualization as PNG');
    // Implement PNG export logic here
  };
  
  // Handle export as Layer
  const handleExportLayer = () => {
    console.log('Exporting visualization as Layer');
    // Implement Layer export logic here
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="container mx-5 mr-5 my-8 max-w-full">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="bg-cyan-400 p-2 text-center text-black font-semibold text-xl rounded-t-lg">
          Site Suitability
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center p-2 bg-gray-100 border-b">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className={`w-4 h-4 ${currentStep >= 1 ? 'bg-black' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs`}>1</div>
              <span className={`text-xs ml-1 ${currentStep >= 1 ? 'font-medium' : 'opacity-50'}`}>Data Selection</span>
            </div>
            <div className="border-t border-gray-400 w-8 mx-1"></div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${currentStep >= 2 ? 'bg-black' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs`}>2</div>
              <span className={`text-xs ml-1 ${currentStep >= 2 ? 'font-medium' : 'opacity-50'}`}>Processing</span>
            </div>
            <div className="border-t border-gray-400 w-8 mx-1"></div>
            <div className="flex items-center">
              <div className={`w-4 h-4 ${currentStep >= 3 ? 'bg-black' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs`}>3</div>
              <span className={`text-xs ml-1 ${currentStep >= 3 ? 'font-medium' : 'opacity-50'}`}>Weighted Overlay</span>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left Section */}
          <div className="left-section">
            <DataSelectionPart 
              onSelectDatasets={handleDatasetSelection}
              onConstraintsChange={handleConstraintsChange}
              onConditionsChange={handleConditionsChange}
            />
          </div>
          
          {/* Right Section */}
          <div className="right-section">
            <MapPart 
              onExportPng={handleExportPng}
              onExportLayer={handleExportLayer}
            />
          </div>
        </div>
        
        {/* Navigation Footer */}
        <div className="flex justify-between p-4 border-t">
          <button 
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md flex items-center ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-1">←</span> Previous
          </button>
          <button 
            onClick={handleNext}
            disabled={currentStep === 3}
            className={`px-4 py-2 rounded-md flex items-center ${
              currentStep === 3
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {currentStep === 3 ? 'Finish' : 'Next'} {currentStep < 3 && <span className="ml-1">→</span>}
          </button>
        </div>
      </div>
    </div>
  );
}