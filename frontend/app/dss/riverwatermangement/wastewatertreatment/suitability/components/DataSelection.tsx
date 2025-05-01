'use client';

import React, { useState, useEffect } from 'react';

export interface Dataset {
  id: string;
  name: string;
  type: string; // 'constraints' or 'conditions' or 'stp_files'
  description: string;
  isUserUploaded?: boolean;
  fileType?: string; // For STP files: 'shp', 'tif', 'tiff'
  format?: string; // 'Raster' or 'Vector'
  coordinateSystem?: string; // e.g., 'EPSG:4326'
  resolution?: string; // e.g., '30m x 30m'
}

interface DataSelectionProps {
  onSelectDatasets: (datasets: Dataset[]) => void;
  onConstraintsChange?: (constraintIds: string[]) => void;
  onConditionsChange?: (conditionIds: string[]) => void;
  onStpFilesChange?: (stpFileIds: string[]) => void;
}

export default function DataSelectionPart({ 
  onSelectDatasets, 
  onConstraintsChange, 
  onConditionsChange,
  onStpFilesChange
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
  const [selectedStpFileIds, setSelectedStpFileIds] = useState<string[]>([]);
  const [uploadedDatasets, setUploadedDatasets] = useState<Dataset[]>([]);
  const [uploadCategory, setUploadCategory] = useState<'constraints' | 'conditions' | 'stp_files'>('constraints');
  const [fileInput, setFileInput] = useState<string>('');
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);
  const [stpFiles, setStpFiles] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Combined datasets
  const allConstraints = [...existingConstraints, ...uploadedDatasets.filter(d => d.type === 'constraints')];
  const allConditions = [...existingConditions, ...uploadedDatasets.filter(d => d.type === 'conditions')];
  const allStpFiles = [...stpFiles, ...uploadedDatasets.filter(d => d.type === 'stp_files')]
    .filter(d => ['shp', 'tif', 'tiff'].includes(d.fileType?.toLowerCase() || ''));

  // Fetch STP files from backend
  useEffect(() => {
    const fetchStpFiles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:9000/api/stp_suitability/stp-files/');
        if (!response.ok) {
          throw new Error('Failed to fetch STP files');
        }
        const data = await response.json();
        const filteredStpFiles = data.filter((file: Dataset) =>
          ['shp', 'tif', 'tiff'].includes(file.fileType?.toLowerCase() || '')
        );
        setStpFiles(filteredStpFiles);
      } catch (error) {
        console.error('Error fetching STP files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStpFiles();
  }, []);
  
  // Handlers
  const handleConstraintToggle = (id: string) => {
    const newSelection = selectedConstraintIds.includes(id)
      ? selectedConstraintIds.filter(constraintId => constraintId !== id)
      : [...selectedConstraintIds, id];
    
    setSelectedConstraintIds(newSelection);
    updateSelectedDatasets(newSelection, selectedConditionIds, selectedStpFileIds);
    onConstraintsChange?.(newSelection);
  };
  
  const handleConditionToggle = (id: string) => {
    const newSelection = selectedConditionIds.includes(id)
      ? selectedConditionIds.filter(conditionId => conditionId !== id)
      : [...selectedConditionIds, id];
    
    setSelectedConditionIds(newSelection);
    updateSelectedDatasets(selectedConstraintIds, newSelection, selectedStpFileIds);
    onConditionsChange?.(newSelection);
  };

  const handleStpFileToggle = (id: string) => {
    const newSelection = selectedStpFileIds.includes(id)
      ? selectedStpFileIds.filter(stpFileId => stpFileId !== id)
      : [...selectedStpFileIds, id];
    
    setSelectedStpFileIds(newSelection);
    updateSelectedDatasets(selectedConstraintIds, selectedConditionIds, newSelection);
    onStpFilesChange?.(newSelection);
  };
  
  const updateSelectedDatasets = (constraintIds: string[], conditionIds: string[], stpFileIds: string[]) => {
    const selectedConstraints = allConstraints.filter(dataset => constraintIds.includes(dataset.id));
    const selectedConditions = allConditions.filter(dataset => conditionIds.includes(dataset.id));
    const selectedStpFiles = allStpFiles.filter(dataset => stpFileIds.includes(dataset.id));
    onSelectDatasets([...selectedConstraints, ...selectedConditions, ...selectedStpFiles]);
  };
  
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fileInput.trim() === '') return;
    
    const fileExtension = fileInput.split('.').pop()?.toLowerCase();
    if (uploadCategory === 'stp_files' && !['shp', 'tif', 'tiff'].includes(fileExtension || '')) {
      alert('Only .shp and .tif/.tiff files are allowed for STP Files.');
      return;
    }
    
    // Determine format based on file extension
    let format = "Other";
    if (fileExtension === 'shp') format = "Vector";
    if (['tif', 'tiff'].includes(fileExtension || '')) format = "Raster";
    
    // For uploaded files, don't set default metadata values
    // The user might set these later or they'll be extracted when the file is processed
    const newDataset: Dataset = {
      id: `uploaded-${Date.now()}`,
      name: fileInput,
      type: uploadCategory,
      description: `User uploaded ${uploadCategory} dataset`,
      isUserUploaded: true,
      fileType: fileExtension || 'unknown',
      format: format,
      // Leave coordinateSystem and resolution empty for uploaded files
      coordinateSystem: '',
      resolution: format === 'Raster' ? '' : 'N/A'
    };
    
    setUploadedDatasets([...uploadedDatasets, newDataset]);
    setFileInput('');
  };

  const handleApplySelection = () => {
    if (selectedConstraintIds.length === 0 && selectedConditionIds.length === 0 && selectedStpFileIds.length === 0) {
      setShowValidationPopup(true);
    } else {
      console.log('Selection applied:', {
        constraints: allConstraints.filter(c => selectedConstraintIds.includes(c.id)),
        conditions: allConditions.filter(c => selectedConditionIds.includes(c.id)),
        stpFiles: allStpFiles.filter(f => selectedStpFileIds.includes(f.id))
      });
    }
  };
  
  const hasSelectedData = () => {
    return selectedConstraintIds.length > 0 || selectedConditionIds.length > 0 || selectedStpFileIds.length > 0;
  };

  const getFileIcon = (fileType?: string) => {
    switch(fileType?.toLowerCase()) {
      case 'shp':
        return '📊';
      case 'tif':
      case 'tiff':
        return '🗺️';
      default:
        return '📄';
    }
  };

  // Get format display value based on file data
  const getFormatDisplay = (file: Dataset) => {
    if (file.format) return file.format;
    if (file.fileType === 'shp') return 'Vector';
    if (['tif', 'tiff'].includes(file.fileType || '')) return 'Raster';
    return 'Other';
  };

  // Get coordinate system display, handling empty values
  const getCoordinateDisplay = (file: Dataset) => {
    return file.coordinateSystem || 'Not specified';
  };

  // Get resolution display, handling empty values
  const getResolutionDisplay = (file: Dataset) => {
    if (file.format === 'Vector' || file.fileType === 'shp') return 'N/A';
    return file.resolution || 'Not specified';
  };

  // Render STP Files as a table
  const renderStpFilesTable = (files: Dataset[]) => {
    return (
      <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinate
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-gray-500 text-sm text-center">
                  No STP files available
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className={selectedStpFileIds.includes(file.id) ? "bg-green-50" : ""}>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={`stp-file-${file.id}`}
                        checked={selectedStpFileIds.includes(file.id)}
                        onChange={() => handleStpFileToggle(file.id)}
                        className="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`stp-file-${file.id}`} className="ml-3 cursor-pointer">
                        <div className="flex items-center">
                          <span className="mr-2">{getFileIcon(file.fileType)}</span>
                          <span className="font-medium text-gray-700">{file.name}</span>
                          {file.isUserUploaded && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                          )}
                        </div>
                      </label>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getFormatDisplay(file)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getCoordinateDisplay(file)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getResolutionDisplay(file)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
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

          <div className="mb-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">STP Suitability Files</h3>
            {isLoading ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading STP files...
              </div>
            ) : (
              renderStpFilesTable(allStpFiles)
            )}
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
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-600"
                    name="uploadCategory"
                    checked={uploadCategory === 'stp_files'}
                    onChange={() => setUploadCategory('stp_files')}
                  />
                  <span className="ml-2">STP Files</span>
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
                  accept={uploadCategory === 'stp_files' ? '.shp,.tif,.tiff' : '*'}
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
              {uploadCategory === 'stp_files' && (
                <p className="text-xs text-gray-500 mt-1">Only .shp and .tif/.tiff files are allowed</p>
              )}
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

          <div className="mb-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">STP Suitability Files</h3>
            {isLoading ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading STP files...
              </div>
            ) : (
              renderStpFilesTable(allStpFiles)
            )}
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

        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-600">STP Files:</h4>
          <div className="text-sm text-gray-500">
            {selectedStpFileIds.length === 0 ? (
              <span className="italic">None selected</span>
            ) : (
              <div className="mt-2">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-1">File</th>
                      <th className="text-left p-1">Format</th>
                      <th className="text-left p-1">Coordinate</th>
                      <th className="text-left p-1">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStpFiles
                      .filter(f => selectedStpFileIds.includes(f.id))
                      .map(f => (
                        <tr key={f.id} className="border-t border-gray-200">
                          <td className="p-1">
                            <span className="mr-1">{getFileIcon(f.fileType)}</span>
                            {f.name}
                          </td>
                          <td className="p-1">
                            {getFormatDisplay(f)}
                          </td>
                          <td className="p-1">{getCoordinateDisplay(f)}</td>
                          <td className="p-1">{getResolutionDisplay(f)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedConstraintIds.length} constraints, 
              {selectedConditionIds.length} conditions, 
              {selectedStpFileIds.length} STP files
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

export function getDatasetFormat(dataset: Dataset): string {
  if (dataset.format) return dataset.format;
  if (dataset.fileType === 'shp') return 'Vector';
  if (['tif', 'tiff'].includes(dataset.fileType || '')) return 'Raster';
  return 'Other';
}

export function getDatasetIcon(fileType?: string): string {
  switch(fileType?.toLowerCase()) {
    case 'shp':
      return '📊';
    case 'tif':
    case 'tiff':
      return '🗺️';
    default:
      return '📄';
  }
}