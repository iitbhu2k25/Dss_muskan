'use client'
import React from 'react';
import { MultiSelect } from './Multiselect';
import { useDrainLocation, Drain } from '@/app/contexts/stp_priority/DrainLocationContext';

interface DrainLocationSelectorProps {
  onConfirm?: (selectedData: {
    drains: Drain[];
    totalFlowRate: number;
  }) => void;
  onReset?: () => void;
}

const DrainLocationSelector: React.FC<DrainLocationSelectorProps> = ({ onConfirm, onReset }) => {
  // Use the drain location context
  const { 
    rivers,
    stretches,
    drains,
    selectedRiver,
    selectedStretch,
    selectedDrains,
    selectionsLocked,
    isLoading,
    handleRiverChange,
    setSelectedStretch,
    setSelectedDrains,
    confirmSelections,
    resetSelections
  } = useDrainLocation();
  
  // Handle river selection from select input
  const handleRiverSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectionsLocked) {
      handleRiverChange(e.target.value);
    }
  };
  
  // Handle stretch selection from select input
  const handleStretchSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectionsLocked) {
      setSelectedStretch(e.target.value);
    }
  };
  
  // Handle multi-select changes for drains
  const handleDrainsChange = (selectedIds: string[]): void => {
    if (!selectionsLocked) {
      setSelectedDrains(selectedIds);
    }
  };
  
  // Handle confirm button click
  const handleConfirm = (): void => {
    if (selectedDrains.length > 0 && !selectionsLocked) {
      const selectedData = confirmSelections();
      
      // Call the onConfirm prop to notify parent component
      if (onConfirm && selectedData) {
        onConfirm(selectedData);
      }
    }
  };
  
  // Handle reset button click
  const handleReset = (): void => {
    resetSelections();
    
    // Call the onReset prop to notify parent component
    if (onReset) {
      onReset();
    }
  };
  
  // Format drain display to include flow rate
  const formatDrainDisplay = (drain: Drain): string => {
    return `${drain.name} (Flow Rate: ${drain.flowRate} m³/s)`;
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* River Dropdown */}
        <div>
          <label htmlFor="river-dropdown" className="block text-sm font-semibold text-gray-700 mb-2">
            River:
          </label>
          <select
            id="river-dropdown"
            className="w-full p-2 text-sm border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedRiver || ''}
            onChange={handleRiverSelect}
            disabled={selectionsLocked || isLoading}
          >
            <option value="">--Choose a River--</option>
            {rivers.map(river => (
              <option key={river.id} value={river.id.toString()}>
                {river.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stretch Dropdown */}
        <div>
          <label htmlFor="stretch-dropdown" className="block text-sm font-semibold text-gray-700 mb-2">
            Stretch:
          </label>
          <select
            id="stretch-dropdown"
            className="w-full p-2 text-sm border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedStretch || ''}
            onChange={handleStretchSelect}
            disabled={!selectedRiver || selectionsLocked || isLoading}
          >
            <option value="">--Choose a Stretch--</option>
            {stretches.map(stretch => (
              <option key={stretch.id} value={stretch.id.toString()}>
                {stretch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drains Multiselect */}
        <MultiSelect
          items={drains}
          selectedItems={selectedDrains}
          onSelectionChange={handleDrainsChange}
          label="Drain"
          placeholder="--Choose Drains--"
          disabled={!selectedStretch || selectionsLocked || isLoading}
          displayPattern={formatDrainDisplay}
        />
      </div>

      {/* Display selected values for demonstration */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">Selected Drainage System</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-medium">River:</span> {rivers.find(r => r.id.toString() === selectedRiver)?.name || 'None'}</p>
          <p><span className="font-medium">Stretch:</span> {stretches.find(s => s.id.toString() === selectedStretch)?.name || 'None'}</p>
          <p><span className="font-medium">Drains:</span> {selectedDrains.length > 0 
            ? (selectedDrains.length === drains.length 
              ? 'All Drains' 
              : drains.filter(d => selectedDrains.includes(d.id.toString())).map(d => d.name).join(', '))
            : 'None'}</p>
          {selectionsLocked && (
            <p className="mt-2 text-green-600 font-medium">Selections confirmed and locked</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4 mt-4">
        <button 
          className={`${
            selectedDrains.length > 0 && !selectionsLocked 
              ? 'bg-blue-500 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          onClick={handleConfirm}
          disabled={selectedDrains.length === 0 || selectionsLocked || isLoading}
        >
          Confirm
        </button>
        <button 
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-blue-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default DrainLocationSelector;