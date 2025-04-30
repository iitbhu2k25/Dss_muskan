'use client';

import React, { useState } from 'react';

export interface Dataset {
  id: string;
  name: string;
  type: string; // 'constraints' or 'conditions'
  description: string;
  isUserUploaded?: boolean;
}

interface DataSelectionProps {
  onSelectDatasets: (datasets: Dataset[]) => void;
  onConstraintsChange?: (constraintIds: string[]) => void;
  onConditionsChange?: (conditionIds: string[]) => void;
}

export default function DataSelectionPart({ 
  onSelectDatasets, 
  onConstraintsChange, 
  onConditionsChange 
}: DataSelectionProps) {
  // Sample existing data
  const existingConstraints: Dataset[] = [
    { id: 'water', name: 'Water Bodies', type: 'constraints', description: 'Areas with water bodies' },
    { id: 'roads', name: 'Roads', type: 'constraints', description: 'Areas near major roads' },
    { id: 'prone', name: 'Flood Prone Area', type: 'constraints', description: 'Prone Areas' },
    { id: 'slope', name: 'Steep Slopes', type: 'constraints', description: 'Areas with slope > 15%' },
    { id: 'forest', name: 'Forest', type: 'constraints', description: 'Forest > 15%' },
    { id: 'GWD', name: 'Ground Water Depth', type: 'constraints', description: 'Areas with low ground water depth' },
    { id: 'airport', name: 'Airport', type: 'constraints', description: ' Areas near airports ' },
    { id: 'asi sites', name: 'ASI Sites', type: 'constraints', description: 'Areas near ASI sites' },
    { id: 'soiltexture', name: 'Soil Texture', type: 'constraints', description: 'Areas with specific soil texture' },
    { id: 'wetland', name: 'Wetland', type: 'constraints', description: ' Areas with wetland' },
    { id: 'existingSTPs', name: 'Existing STPs', type: 'constraints', description: 'Areas with existing STPs' },
    { id: 'builduparea', name: 'Buildup Areas', type: 'constraints', description: ' Areas with buildup areas  ' },
    
  ];
  
  const existingConditions: Dataset[] = [
    { id: 'elevation', name: 'Elevation', type: 'conditions', description: 'Higher elevation areas' },
    { id: 'soilQuality', name: 'Soil Quality', type: 'conditions', description: 'Areas with good soil quality' },
    { id: 'slopeGentle', name: 'Slope', type: 'conditions', description: 'Areas with gentle slopes' },
    { id: 'lithology', name: 'Lithology', type: 'conditions', description: 'Areas with specific lithology' },
    { id: 'distancfrombuildupland', name: 'Distance from Buildup Land', type: 'conditions', description: 'Areas with specific distance from buildup land' },
    { id: 'geomorphology', name: 'Geomorphology', type: 'conditions', description: 'Areas with specific geomorphology' },
    { id: 'lulc', name: 'Land Use/Land Cover', type: 'conditions', description: 'Areas with specific land use/land cover' },
    { id: 'populationdensity', name: 'Population Density', type: 'conditions', description: 'Areas with specific population density' },
    { id: 'groundwaterquality', name: 'Groundwater Quality', type: 'conditions', description: 'Areas with specific groundwater quality' },
    { id: 'drains', name: 'Drains', type: 'conditions', description: 'Areas with specific drains' },
    
  ];
  
  // State
  const [dataSource, setDataSource] = useState<'existing' | 'upload'>('existing');
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([]);
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>([]);
  const [uploadedDatasets, setUploadedDatasets] = useState<Dataset[]>([]);
  const [uploadCategory, setUploadCategory] = useState<'constraints' | 'conditions'>('constraints');
  const [fileInput, setFileInput] = useState<string>('');
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);
  
  // Combined datasets
  const allConstraints = [...existingConstraints, ...uploadedDatasets.filter(d => d.type === 'constraints')];
  const allConditions = [...existingConditions, ...uploadedDatasets.filter(d => d.type === 'conditions')];
  
  // Handlers
  const handleConstraintToggle = (id: string) => {
    const newSelection = selectedConstraintIds.includes(id)
      ? selectedConstraintIds.filter(constraintId => constraintId !== id)
      : [...selectedConstraintIds, id];
    
    setSelectedConstraintIds(newSelection);
    updateSelectedDatasets(newSelection, selectedConditionIds);
    onConstraintsChange?.(newSelection);
  };
  
  const handleConditionToggle = (id: string) => {
    const newSelection = selectedConditionIds.includes(id)
      ? selectedConditionIds.filter(conditionId => conditionId !== id)
      : [...selectedConditionIds, id];
    
    setSelectedConditionIds(newSelection);
    updateSelectedDatasets(selectedConstraintIds, newSelection);
    onConditionsChange?.(newSelection);
  };
  
  const updateSelectedDatasets = (constraintIds: string[], conditionIds: string[]) => {
    const selectedConstraints = allConstraints.filter(dataset => constraintIds.includes(dataset.id));
    const selectedConditions = allConditions.filter(dataset => conditionIds.includes(dataset.id));
    onSelectDatasets([...selectedConstraints, ...selectedConditions]);
  };
  
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fileInput.trim() === '') return;
    
    // In a real application, you would handle the actual file upload here
    // For this example, we're just simulating adding the file to our list
    const newDataset: Dataset = {
      id: `uploaded-${Date.now()}`,
      name: fileInput,
      type: uploadCategory,
      description: `User uploaded ${uploadCategory} dataset`,
      isUserUploaded: true
    };
    
    setUploadedDatasets([...uploadedDatasets, newDataset]);
    setFileInput('');
  };

  const handleApplySelection = () => {
    if (selectedConstraintIds.length === 0 && selectedConditionIds.length === 0) {
      // Show validation popup if no datasets are selected
      setShowValidationPopup(true);
    } else {
      // Process the selection (in a real app, this might navigate to the next step)
      console.log('Selection applied:', {
        constraints: allConstraints.filter(c => selectedConstraintIds.includes(c.id)),
        conditions: allConditions.filter(c => selectedConditionIds.includes(c.id))
      });
    }
  };
  
  // Method to check if any data is selected - can be called from parent
  // This is exported for use in page.tsx
  const hasSelectedData = () => {
    return selectedConstraintIds.length > 0 || selectedConditionIds.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-cyan-600">Data Selection</h2>
      
      {/* Data Source Selection */}
      <div className="mb-4">
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-cyan-600"
              name="dataSource"
              checked={dataSource === 'existing'}
              onChange={() => setDataSource('existing')}
            />
            <span className="ml-2">Select Existing</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-cyan-600"
              name="dataSource"
              checked={dataSource === 'upload'}
              onChange={() => setDataSource('upload')}
            />
            <span className="ml-2">Upload New</span>
          </label>
        </div>
      </div>
      
      {/* Existing Data Selection */}
      {dataSource === 'existing' && (
        <div className="mb-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Conditioning Factors</h3>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto border rounded-md">
              {allConditions.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm">No conditions available</div>
              ) : (
                allConditions.map((condition) => (
                  <div key={condition.id} className="py-3 px-3 flex items-start">
                    <input
                      type="checkbox"
                      id={`condition-${condition.id}`}
                      checked={selectedConditionIds.includes(condition.id)}
                      onChange={() => handleConditionToggle(condition.id)}
                      className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`condition-${condition.id}`} className="ml-3 cursor-pointer">
                      <div className="font-medium text-gray-700 flex items-center">
                        {condition.name}
                        {condition.isUserUploaded && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {condition.description}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mb-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Constraints Factors</h3>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto border rounded-md">
              {allConstraints.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm">No constraints available</div>
              ) : (
                allConstraints.map((constraint) => (
                  <div key={constraint.id} className="py-3 px-3 flex items-start">
                    <input
                      type="checkbox"
                      id={`constraint-${constraint.id}`}
                      checked={selectedConstraintIds.includes(constraint.id)}
                      onChange={() => handleConstraintToggle(constraint.id)}
                      className="h-4 w-4 mt-1 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`constraint-${constraint.id}`} className="ml-3 cursor-pointer">
                      <div className="font-medium text-gray-700 flex items-center">
                        {constraint.name}
                        {constraint.isUserUploaded && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {constraint.description}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Upload New Data */}
      {dataSource === 'upload' && (
        <div className="mb-4">
          <form onSubmit={handleFileUpload} className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-red-600"
                    name="uploadCategory"
                    checked={uploadCategory === 'constraints'}
                    onChange={() => setUploadCategory('constraints')}
                  />
                  <span className="ml-2">Constraints</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-purple-600"
                    name="uploadCategory"
                    checked={uploadCategory === 'conditions'}
                    onChange={() => setUploadCategory('conditions')}
                  />
                  <span className="ml-2">Conditions</span>
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select File
              </label>
              <div className="flex">
                <input
                  type="file"
                  className="hidden"
                  id="fileUpload"
                  onChange={(e) => e.target.files && setFileInput(e.target.files[0].name)}
                />
                <input
                  type="text"
                  className="flex-grow border border-gray-300 rounded-l-md px-3 py-2"
                  placeholder="No file selected"
                  value={fileInput}
                  readOnly
                />
                <label
                  htmlFor="fileUpload"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-r-md cursor-pointer"
                >
                  Browse
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={fileInput === ''}
            >
              Upload
            </button>
          </form>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Conditioning Factors</h3>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto border rounded-md">
              {allConditions.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm">No conditions available</div>
              ) : (
                allConditions.map((condition) => (
                  <div key={condition.id} className="py-3 px-3 flex items-start">
                    <input
                      type="checkbox"
                      id={`upload-condition-${condition.id}`}
                      checked={selectedConditionIds.includes(condition.id)}
                      onChange={() => handleConditionToggle(condition.id)}
                      className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`upload-condition-${condition.id}`} className="ml-3 cursor-pointer">
                      <div className="font-medium text-gray-700 flex items-center">
                        {condition.name}
                        {condition.isUserUploaded && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {condition.description}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Constraints Factors</h3>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto border rounded-md">
              {allConstraints.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm">No constraints available</div>
              ) : (
                allConstraints.map((constraint) => (
                  <div key={constraint.id} className="py-3 px-3 flex items-start">
                    <input
                      type="checkbox"
                      id={`upload-constraint-${constraint.id}`}
                      checked={selectedConstraintIds.includes(constraint.id)}
                      onChange={() => handleConstraintToggle(constraint.id)}
                      className="h-4 w-4 mt-1 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`upload-constraint-${constraint.id}`} className="ml-3 cursor-pointer">
                      <div className="font-medium text-gray-700 flex items-center">
                        {constraint.name}
                        {constraint.isUserUploaded && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {constraint.description}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Items Summary */}
      <div className="mt-6 bg-gray-50 p-3 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">Selected Datasets</h3>
        
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-600">Constraints:</h4>
          <div className="text-sm text-gray-500">
            {selectedConstraintIds.length === 0 ? (
              <span className="italic">None selected</span>
            ) : (
              <ul className="list-disc pl-5">
                {allConstraints
                  .filter(c => selectedConstraintIds.includes(c.id))
                  .map(c => (
                    <li key={c.id}>{c.name}</li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-600">Conditions:</h4>
          <div className="text-sm text-gray-500">
            {selectedConditionIds.length === 0 ? (
              <span className="italic">None selected</span>
            ) : (
              <ul className="list-disc pl-5">
                {allConditions
                  .filter(c => selectedConditionIds.includes(c.id))
                  .map(c => (
                    <li key={c.id}>{c.name}</li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedConstraintIds.length} constraints, 
              {selectedConditionIds.length} conditions
            </span>
          </div>
          <button 
            className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            onClick={handleApplySelection}
          >
            Apply Selection
          </button>
        </div>
      </div>
      
      {/* Validation Popup */}
      {showValidationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium">Selection Required</h3>
            </div>
            <p className="mb-4 text-gray-600">
              Please select at least one dataset from either Constraints or Conditions before proceeding.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowValidationPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function hasSelectedData(datasets: Dataset[]): boolean {
  return datasets.length > 0;
}