'use client'
import React, { useState } from 'react';
import LocationSelection from './components/locations';
import MapComponent from './components/openlayer';
import ConditioningFactors from './components/conditioningFactors';
import ConstraintFactors from './components/constraintFactors';
import { LocationProvider } from '../../../../contexts/Suitability/locationContext';
import { ConditioningFactorsProvider } from '../../../../contexts/Suitability/conditioningContext';
import { ConstraintFactorsProvider } from '../../../../contexts/Suitability/constraintContext';

const SiteSuitabilityApp: React.FC = () => {
  const [mode, setMode] = useState<'region' | 'drain'>('region');

  const handleSubmitAnalysis = () => {
    console.log('Submitting analysis...');
    // Add your analysis submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <header className="bg-blue-600 text-white py-4 px-8">
        <h1 className="text-xl font-semibold mb-1">STP Site Suitability</h1>
      </header>

      <div className="p-4">
        {/* Radio Buttons */}
        <div className="flex justify-center mb-4 ">
          <div className="bg-white rounded-md shadow-md p-4">
            <label className="mr-6 ">
              <input
                type="radio"
                name="mode"
                value="region"
                checked={mode === 'region'}
                onChange={() => setMode('region')}
                className="mr-2"
              />
              Region based
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="drain"
                checked={mode === 'drain'}
                onChange={() => setMode('drain')}
                className="mr-2"
              />
              Drain based
            </label>
          </div>
        </div>


        {/* Show region-based UI if selected */}
        {mode === 'region' && (
          <div className="flex gap-4">
            <div className="w-1/2 space-y-4">
              <LocationProvider
                onLocationsChange={(locations) => {
                  console.log('Locations changed:', locations);
                }}
              >
                <LocationSelection />
              </LocationProvider>

              <ConditioningFactorsProvider>
                <ConditioningFactors />
              </ConditioningFactorsProvider>

              <ConstraintFactorsProvider>
                <ConstraintFactors />
              </ConstraintFactorsProvider>

              <div className="bg-white rounded-md shadow-md p-6">
                <button
                  onClick={handleSubmitAnalysis}
                  className="w-[200px] bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-md font-medium text-lg transition-colors"
                >
                  Submit Analysis
                </button>
              </div>
            </div>

            <div className="w-1/2">
              <MapComponent selectedLocations={{ state: '', districts: [], subDistricts: [] }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSuitabilityApp;
