'use client'

import React, { useState, useEffect, useRef } from 'react';
import { LocationProvider } from '@/app/contexts/stp_priority/LocationContext';
import { DrainLocationProvider } from '@/app/contexts/stp_priority/DrainLocationContext';
import { CategoryProvider } from '@/app/contexts/stp_priority/CategoryContext';
import { DrainCategoryProvider } from '@/app/contexts/stp_priority/DrainCategoryContext';
import { MapProvider } from '@/app/contexts/stp_priority/MapContext';
import LocationSelector from '@/app/dss/RWM/WWT/stp_priority/components/locations';
import DrainLocationSelector from '@/app/dss/RWM/WWT/stp_priority/components/DrainLocationSelector';
import CategorySelector from '@/app/dss/RWM/WWT/stp_priority/components/Category';
import DrainCategorySelector from '@/app/dss/RWM/WWT/stp_priority/components/DrainCategorySelector';
import { useLocation } from '@/app/contexts/stp_priority/LocationContext';
import { useDrainLocation } from '@/app/contexts/stp_priority/DrainLocationContext';
import { useCategory } from '@/app/contexts/stp_priority/CategoryContext';
import { useDrainCategory } from '@/app/contexts/stp_priority/DrainCategoryContext';
import MapView from '@/app/dss/RWM/WWT/stp_priority/components/openlayer';
import { useMap } from '@/app/contexts/stp_priority/MapContext';
import { CategorySlider } from './components/weight_slider';
import { DrainCategorySlider } from './components/DrainCategorySlider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Selection Mode Type
type SelectionMode = 'region' | 'drain';

const MainContent = () => {
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('region');
  
  // State to force map reset
  const [mapKey, setMapKey] = useState(0);

  const [showRankings, setShowRankings] = useState(false);
  const [showTier, setShowTier] = useState(false);
  const [showResults, setShowResults] = useState(false); 
  
  // Get contexts based on the selection mode
  const { 
    selectedCategories: regionSelectedCategories, 
    selectAllCategories: regionSelectAllCategories,
    clearAllCategories: regionClearAllCategories, 
    stpProcess: regionStpProcess,
    setStpProcess: setRegionStpProcess
  } = useCategory();
  
  const { 
    selectedCategories: drainSelectedCategories, 
    selectAllCategories: drainSelectAllCategories,
    clearAllCategories: drainClearAllCategories, 
    stpProcess: drainStpProcess,
    setStpProcess: setDrainStpProcess
  } = useDrainCategory();
  
  // Get the appropriate context variables based on selection mode
  const selectedCategories = selectionMode === 'region' ? regionSelectedCategories : drainSelectedCategories;
  const stpProcess = selectionMode === 'region' ? regionStpProcess : drainStpProcess;
  
  const { 
    selectionsLocked: regionSelectionsLocked, 
    confirmSelections: regionConfirmSelections, 
    resetSelections: regionResetSelections 
  } = useLocation();
  
  const { 
    selectionsLocked: drainSelectionsLocked, 
    confirmSelections: drainConfirmSelections, 
    resetSelections: drainResetSelections 
  } = useDrainLocation();
  
  // Get the current selections locked state based on the mode
  const selectionsLocked = selectionMode === 'region' ? regionSelectionsLocked : drainSelectionsLocked;
  
  const { setstpOperation, resetMapState, resetMapView } = useMap();
  const [showCategories, setShowCategories] = useState(false);
  
  useEffect(() => {
    setShowCategories(selectionsLocked);
  }, [selectionsLocked]);
  
  // Handle confirm button click based on the selection mode
  const handleConfirm = () => {
    if (selectionMode === 'region') {
      const result = regionConfirmSelections();
    } else {
      const result = drainConfirmSelections();
    }
  };
  
  // Completely reset everything in the application
  const resetEverything = () => {
    // Reset both location selections
    regionResetSelections();
    drainResetSelections();
    
    // Clear all categories in both modes
    if (typeof regionClearAllCategories === 'function') {
      regionClearAllCategories();
    }
    
    if (typeof drainClearAllCategories === 'function') {
      drainClearAllCategories();
    }
    
    // Reset map state and view completely
    if (typeof resetMapState === 'function') {
      resetMapState();
    }
    
    if (typeof resetMapView === 'function') {
      resetMapView();
    }
    
    // Reset any operation in progress
    if (selectionMode === 'region') {
      setRegionStpProcess(false);
    } else {
      setDrainStpProcess(false);
    }
    
    // Force remount of the map component to ensure a fresh state
    setMapKey(prevKey => prevKey + 1);
    
    // Reset any other UI state
    setShowCategories(false);
    setShowRankings(false);
    setShowTier(false);
    setShowResults(false);
  };
  
  // Handle reset button click based on the selection mode
  const handleReset = () => {
    if (selectionMode === 'region') {
      regionResetSelections();
    } else {
      drainResetSelections();
    }
  };
  
  const handleSubmit = () => {
    if (selectedCategories.length < 1) {
      toast.error("Please select at least one category", {
        position: "top-center",
      });
    } else {
      // Set the appropriate process state based on mode
      if (selectionMode === 'region') {
        setRegionStpProcess(true);
      } else {
        setDrainStpProcess(true);
      }
      
      setstpOperation(true);
    }
  };
  
  const handleShowRankings = () => {
    setShowRankings(!showRankings);
  };
  
  const toggleSelectorView = () => {
    setShowTier(!showTier);
  };

  // Handle selection mode change - modified to allow switching at any time
  const handleSelectionModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value as SelectionMode;
    
    // If we're already in the selected mode, do nothing
    if (newMode === selectionMode) {
      return;
    }
    
    // Reset absolutely everything
    resetEverything();
    
    // Change the mode
    setSelectionMode(newMode);
    
    // Always start with fresh state
    setShowCategories(false);
    
    // Show a toast notification to inform the user
    toast.info(`Switched to ${newMode === 'region' ? 'Region' : 'Drain'} Based mode. All selections have been reset.`, {
      position: "top-center",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">
            Site Priority
          </h1>
          <p className="text-blue-100 mt-2">
            Analyze and prioritize locations based on multiple criteria
          </p>
        </div>
      </header>
      
      <main className="px-4 py-8">
        {/* Selection Mode Radio Buttons - NOW OUTSIDE THE SECTION */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <label className={`inline-flex items-center justify-center px-6 py-3 text-sm font-medium border ${
              selectionMode === 'region' 
                ? 'bg-blue-600 text-white border-blue-600 z-10' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-l-lg cursor-pointer transition-colors duration-200`}>
              <input
                type="radio"
                className="absolute opacity-0 w-0 h-0"
                name="selection-mode"
                value="region"
                checked={selectionMode === 'region'}
                onChange={handleSelectionModeChange}
              />
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Region Based
              </span>
            </label>
            <label className={`inline-flex items-center justify-center px-6 py-3 text-sm font-medium border ${
              selectionMode === 'drain' 
                ? 'bg-blue-600 text-white border-blue-600 z-10' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-r-lg cursor-pointer transition-colors duration-200`}>
              <input
                type="radio"
                className="absolute opacity-0 w-0 h-0"
                name="selection-mode"
                value="drain"
                checked={selectionMode === 'drain'}
                onChange={handleSelectionModeChange}
              />
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Drain Based
              </span>
            </label>
          </div>
        </div>

        {/* Changed from grid-cols-2 to grid-cols-3 to create a 2:1 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Main content area - Now spans 8/12 columns on large screens */}
          <div className="lg:col-span-4 space-y-4">
            {/* Selection Components Section */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">Selection Criteria</h2>
              </div>
              
              <div className="p-6">
                {/* Selection Components with improved styling */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {selectionMode === 'region' ? (
                    <LocationSelector />
                  ) : (
                    <DrainLocationSelector />
                  )}
                </div>
                
                {/* Categories Section - Only shown after confirmation */}
                {showCategories && (
                  <div className="animate-fadeIn">
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {selectionMode === 'region' ? (
                        <CategorySelector />
                      ) : (
                        <DrainCategorySelector />
                      )}
                    </div>
                    
                    {/* Submit Button only (Reset button removed) */}
                    <div className="flex justify-start mt-8">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={stpProcess}
                        className={`px-8 py-3 rounded-full font-medium shadow-md ${
                          stpProcess 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                        } flex items-center transition duration-200`}
                      >
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Submit Analysis
                        </>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
          
          {/* Map and Slider area - Now spans 4/12 columns on large screens */}
          <div className="lg:col-span-4 space-y-4">
            {/* Map Section with Larger Height */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Larger Map Component - Key forces complete recreation of component */}
              <div className="w-full p-4 md:min-h-[500px]">
                <MapView key={`map-${mapKey}`} />
              </div>
            </section>
            
            {/* Category Influence Sliders in a separate box below the map */}
            {showCategories && selectedCategories.length > 0 && (
              <section className="bg-white rounded-xl shadow-md overflow-hidden animate-fadeIn">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectionMode === 'region' ? 'Category Influences' : 'Drain Analysis Influences'}
                  </h2>
                </div>
                {selectionMode === 'region' ? (
                  <CategorySlider />
                ) : (
                  <DrainCategorySlider />
                )}
              </section>
            )}
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

// Main App component that provides the context
const Home = () => {
  return (
    <LocationProvider>
      <DrainLocationProvider>
        <CategoryProvider>
          <DrainCategoryProvider>
            <MapProvider>
              <MainContent />
            </MapProvider>
          </DrainCategoryProvider>
        </CategoryProvider>
      </DrainLocationProvider>
    </LocationProvider>
  );
};

export default Home;