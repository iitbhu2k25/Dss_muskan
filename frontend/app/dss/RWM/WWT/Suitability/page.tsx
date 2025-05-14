'use client'
import React, { useState, useEffect } from 'react';
import LocationSelection from './components/locations';
import MapComponent from './components/openlayer';
import ConditioningFactors from './components/conditioningFactors';
import ConstraintFactors from './components/constraintFactors';
import ConditioningFactorSlider from './components/conditioningFactorSlider';
import { LocationProvider, useLocation } from '../../../../contexts/Suitability/locationContext';
import { MapProvider } from '../../../../contexts/Suitability/Mapcontext';
import { ConditioningFactorsProvider, useConditioningFactors } from '../../../../contexts/Suitability/conditioningContext';
import { ConstraintFactorsProvider, useConstraintFactors } from '../../../../contexts/Suitability/constraintContext';
import { ConditioningFactor } from '../../../../contexts/Suitability/conditioningContext';
import { ConstraintFactor } from '../../../../contexts/Suitability/constraintContext';

// Create a wrapper component to directly access context data
const AnalysisSubmitWrapper = ({ 
  mode,
  selectedConditioningFactors, 
  selectedConstraintFactors 
}: { 
  mode: 'region' | 'drain',
  selectedConditioningFactors: ConditioningFactor[], 
  selectedConstraintFactors: ConstraintFactor[] 
}) => {
  const { factors: allConditioningFactors } = useConditioningFactors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmitAnalysis = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      console.log('Submitting analysis...');
      
      // Get the selected conditioning factors with their CURRENT weights from the context
      const selectedConditioningWithCurrentWeights = selectedConditioningFactors.map(selectedFactor => {
        // Find the factor in the context to get its current weight
        const factorWithCurrentWeight = allConditioningFactors.find(f => f.id === selectedFactor.id);
        return {
          id: selectedFactor.id,
          weight: factorWithCurrentWeight?.weight || selectedFactor.weight
        };
      });
      
      // For constraint factors, we only need to send the IDs
      const constraintFactorIds = selectedConstraintFactors.map(factor => factor.id);
      
      // Prepare the payload for the API
      const payload = {
        mode: mode,
        conditioningFactors: selectedConditioningWithCurrentWeights,
        constraintFactors: constraintFactorIds
      };
      
      console.log('Sending payload to backend:', payload);
      
      // Make the API call to the backend
      const response = await fetch('/api/suitability-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Analysis submitted successfully:', data);
      
      setSubmitResult({
        success: true,
        message: 'Analysis submitted successfully!'
      });
      
    } catch (error) {
      console.error('Error submitting analysis:', error);
      
      setSubmitResult({
        success: false,
        message: `Failed to submit analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-6">
      <button
        onClick={handleSubmitAnalysis}
        disabled={isSubmitting}
        className={`w-[200px] ${isSubmitting 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700'} 
          text-white py-3 px-5 rounded-md font-medium text-lg transition-colors`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Analysis'}
      </button>
      
      {/* Show result message if any */}
      {submitResult && (
        <div className={`mt-4 p-3 rounded ${submitResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {submitResult.message}
        </div>
      )}
    </div>
  );
};

const SiteSuitabilityApp: React.FC = () => {
  const [mode, setMode] = useState<'region' | 'drain'>('region');
  const [selectedConditioningFactors, setSelectedConditioningFactors] = useState<ConditioningFactor[]>([]);
  const [selectedConstraintFactors, setSelectedConstraintFactors] = useState<ConstraintFactor[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-8">
        <h1 className="text-xl font-semibold mb-1">STP Site Suitability</h1>
      </header>

      <div className="p-4 flex-grow">
        {/* Radio Buttons */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-md shadow-md p-4">
            <label className="mr-6">
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
          <ConditioningFactorsProvider>
            <ConstraintFactorsProvider>
              <div className="flex flex-col md:flex-row gap-4">
                <LocationProvider
                  onLocationsChange={(locations) => {
                    console.log('Locations changed:', locations);
                  }}
                >
                  <MapProvider>
                    <div className="w-full md:w-1/2 space-y-4">
                      <LocationSelection />

                      <ConditioningFactors 
                        onFactorsChange={(factors) => setSelectedConditioningFactors(factors)} 
                      />

                      <ConstraintFactors 
                        onFactorsChange={(factors) => setSelectedConstraintFactors(factors)} 
                      />

                      {/* Submit button now wrapped in context-aware component */}
                      <AnalysisSubmitWrapper 
                        mode={mode}
                        selectedConditioningFactors={selectedConditioningFactors}
                        selectedConstraintFactors={selectedConstraintFactors}
                      />
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col">
                      {/* Map with responsive height */}
                      <div className="bg-white rounded-md shadow-md p-2 h-[600px] md:h-[600px] lg:h-[650px] xl:h-[800px]">
                        <MapComponent />
                      </div>
                      {/* Conditioning Factor Slider */}
                      {selectedConditioningFactors.length > 0 && (
                        <div className="bg-white rounded-md shadow-md p-4 mt-4 mb-8">
                          <ConditioningFactorSlider 
                            selectedFactors={selectedConditioningFactors} 
                          />
                        </div>
                      )}
                    </div>
                  </MapProvider>
                </LocationProvider>
              </div>
            </ConstraintFactorsProvider>
          </ConditioningFactorsProvider>
        )}
      </div>
    </div>
  );
};

export default SiteSuitabilityApp;