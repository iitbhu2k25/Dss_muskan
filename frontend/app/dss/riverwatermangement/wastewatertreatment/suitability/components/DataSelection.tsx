'use client';

import React, { useState, useEffect } from 'react';

export interface Dataset {
  id: string;
  name: string;
  type: string; // 'constraints_factors' or 'conditioning_factors' or 'stp_files'
  description: string;
  isUserUploaded?: boolean;
  fileType?: string; // 'shp', 'tif', 'tiff'
  format?: string; // 'Raster' or 'Vector'
  coordinateSystem?: string; // e.g., 'EPSG:4326'
  resolution?: string; // e.g., '30m x 30m'
  geometryType?: string; // e.g., 'Point', 'LineString', 'Polygon'
  path?: string; // Path to the file on the server
}

interface DataSelectionProps {
  onSelectDatasets: (datasets: Dataset[]) => void;
  onConstraintsChange?: (constraintIds: string[]) => void;
  onConditionsChange?: (conditioningIds: string[]) => void;
  onDisplayVectors?: (vectorData: any) => void; // New prop for handling vector display
  onDisplayRasters?: (rasterPaths: string[]) => void; // New prop for handling raster display
}

export default function DataSelectionPart({ 
  onSelectDatasets, 
  onConstraintsChange, 
  onConditionsChange,
  onDisplayVectors,
  onDisplayRasters,
}: DataSelectionProps) {
  // State
  const [dataSource, setDataSource] = useState<'existing' | 'upload'>('existing');
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([]);
  const [selectedConditioningIds, setSelectedConditioningIds] = useState<string[]>([]);
  const [uploadedDatasets, setUploadedDatasets] = useState<Dataset[]>([]);
  // Changed from string to array to allow multiple categories
  const [uploadCategories, setUploadCategories] = useState<Array<'constraints_factors' | 'conditioning_factors'>>(['constraints_factors']);
  const [fileInput, setFileInput] = useState<string>('');
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);
  const [isLoadingConstraints, setIsLoadingConstraints] = useState<boolean>(true);
  const [isLoadingConditioning, setIsLoadingConditioning] = useState<boolean>(true);
  const [constraintsFiles, setConstraintsFiles] = useState<Dataset[]>([]);
  const [conditioningFiles, setConditioningFiles] = useState<Dataset[]>([]);
  const [isLoadingVectors, setIsLoadingVectors] = useState<boolean>(false);
  const [isLoadingRasters, setIsLoadingRasters] = useState<boolean>(false);
  
  // Combined datasets
  const allConstraints = [...constraintsFiles, ...uploadedDatasets.filter(d => d.type === 'constraints_factors')];
  const allConditioning = [...conditioningFiles, ...uploadedDatasets.filter(d => d.type === 'conditioning_factors')];

  // Fetch constraints files from backend
  useEffect(() => {
    const fetchConstraintsFiles = async () => {
      try {
        setIsLoadingConstraints(true);
        const response = await fetch('http://localhost:9000/api/stp_suitability/constraints-factors/');
        if (!response.ok) {
          throw new Error('Failed to fetch constraints files');
        }
        const data = await response.json();
        const filteredFiles = data.filter((file: Dataset) =>
          ['shp', 'tif', 'tiff'].includes(file.fileType?.toLowerCase() || '')
        );
        setConstraintsFiles(filteredFiles);
      } catch (error) {
        console.error('Error fetching constraints files:', error);
      } finally {
        setIsLoadingConstraints(false);
      }
    };
    
    fetchConstraintsFiles();
  }, []);
  
  // Fetch conditioning files from backend
  useEffect(() => {
    const fetchConditioningFiles = async () => {
      try {
        setIsLoadingConditioning(true);
        const response = await fetch('http://localhost:9000/api/stp_suitability/conditioning-factors/');
        if (!response.ok) {
          throw new Error('Failed to fetch conditioning files');
        }
        const data = await response.json();
        const filteredFiles = data.filter((file: Dataset) =>
          ['shp', 'tif', 'tiff'].includes(file.fileType?.toLowerCase() || '')
        );
        setConditioningFiles(filteredFiles);
      } catch (error) {
        console.error('Error fetching conditioning files:', error);
      } finally {
        setIsLoadingConditioning(false);
      }
    };
    
    fetchConditioningFiles();
  }, []);
  
  // Handlers
  const handleConstraintToggle = (id: string) => {
    const newSelection = selectedConstraintIds.includes(id)
      ? selectedConstraintIds.filter(constraintId => constraintId !== id)
      : [...selectedConstraintIds, id];
    
    setSelectedConstraintIds(newSelection);
    updateSelectedDatasets(newSelection, selectedConditioningIds);
    onConstraintsChange?.(newSelection);
  };
  
  const handleConditioningToggle = (id: string) => {
    const newSelection = selectedConditioningIds.includes(id)
      ? selectedConditioningIds.filter(conditioningId => conditioningId !== id)
      : [...selectedConditioningIds, id];
    
    setSelectedConditioningIds(newSelection);
    updateSelectedDatasets(selectedConstraintIds, newSelection);
    onConditionsChange?.(newSelection);
  };
  
  const updateSelectedDatasets = (constraintIds: string[], conditioningIds: string[]) => {
    const selectedConstraints = allConstraints.filter(dataset => constraintIds.includes(dataset.id));
    const selectedConditioning = allConditioning.filter(dataset => conditioningIds.includes(dataset.id));
    onSelectDatasets([...selectedConstraints, ...selectedConditioning]);
  };
  
  // Updated to handle multiple categories
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fileInput.trim() === '' || uploadCategories.length === 0) return;
    
    const fileExtension = fileInput.split('.').pop()?.toLowerCase();
    if (!['shp', 'tif', 'tiff'].includes(fileExtension || '')) {
      alert('Only .shp and .tif/.tiff files are allowed.');
      return;
    }
    
    // Determine format based on file extension
    let format = "Other";
    if (fileExtension === 'shp') format = "Vector";
    if (['tif', 'tiff'].includes(fileExtension || '')) format = "Raster";
    
    // Create a dataset for each selected category
    const timestamp = Date.now();
    const newDatasets = uploadCategories.map(category => ({
      id: `uploaded-${timestamp}-${category}`,
      name: fileInput,
      type: category,
      description: `User uploaded ${category} dataset`,
      isUserUploaded: true,
      fileType: fileExtension || 'unknown',
      format: format,
      coordinateSystem: '',
      resolution: format === 'Raster' ? '' : 'N/A',
      geometryType: format === 'Vector' ? 'Unknown' : 'N/A'
    }));
    
    setUploadedDatasets([...uploadedDatasets, ...newDatasets]);
    setFileInput('');
  };

  // Helper for toggling categories in checkbox
  const toggleCategory = (category: 'constraints_factors' | 'conditioning_factors') => {
    if (uploadCategories.includes(category)) {
      // Remove category if it exists (but don't allow empty array)
      const newCategories = uploadCategories.filter(cat => cat !== category);
      setUploadCategories(newCategories.length > 0 ? newCategories : [category]);
    } else {
      // Add category if it doesn't exist
      setUploadCategories([...uploadCategories, category]);
    }
  };

  // New handler for displaying vectors
  const handleDisplayVectors = async () => {
    const selectedDatasets = getAllSelectedDatasets();
    const vectorDatasets = selectedDatasets.filter(dataset => 
      dataset.format === 'Vector' || dataset.fileType === 'shp'
    );
    
    if (vectorDatasets.length === 0) {
      alert('No vector datasets selected. Please select at least one shapefile.');
      return;
    }
    
    setIsLoadingVectors(true);
    
    try {
      // Prepare the paths to send to the backend
      const vectorPaths = vectorDatasets.map(dataset => ({
        id: dataset.id,
        // Use filePath property from the API response, not path
        path: dataset.filePath || dataset.path
      }));
      
      console.log('Sending vector paths to backend:', vectorPaths);
      
      // Send request to backend to get GeoJSON data
      const response = await fetch('http://localhost:9000/api/stp_suitability/vector-geojson/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vectors: vectorPaths })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vector data');
      }
      
      const geoJsonData = await response.json();
      
      // Check for errors in the response
      const errors = Object.entries(geoJsonData)
        .filter(([_, value]) => value.error)
        .map(([id, value]) => `${id}: ${value.error}`);
        
      if (errors.length > 0) {
        console.warn('Some vectors failed to load:', errors);
        // Only alert if ALL vectors failed
        if (errors.length === vectorPaths.length) {
          alert(`Error loading vector data: ${errors.join(', ')}`);
          return;
        }
      }
      
      // Call the callback function with the GeoJSON data that loaded successfully
      const successfulData = Object.fromEntries(
        Object.entries(geoJsonData).filter(([_, value]) => !value.error)
      );
      
      if (Object.keys(successfulData).length > 0) {
        onDisplayVectors?.(successfulData);
        console.log('Vector data fetched successfully:', successfulData);
      } else {
        alert('No vector data was successfully loaded.');
      }
    } catch (error) {
      console.error('Error fetching vector data:', error);
      alert('Error fetching vector data. Please try again.');
    } finally {
      setIsLoadingVectors(false);
    }
  };
  
  // New handler for displaying rasters
  const handleDisplayRasters = async () => {
    const selectedDatasets = getAllSelectedDatasets();
    const rasterDatasets = selectedDatasets.filter(dataset => 
      dataset.format === 'Raster' || ['tif', 'tiff'].includes(dataset.fileType || '')
    );
    
    if (rasterDatasets.length === 0) {
      alert('No raster datasets selected. Please select at least one TIF/TIFF file.');
      return;
    }
    
    setIsLoadingRasters(true);
    
    try {
      // Prepare the paths to send to the backend
      const rasterPaths = rasterDatasets.map(dataset => 
        dataset.path || `/path/to/${dataset.name}` // Use the actual path if available
      );
      
      // Call the callback function with the raster paths
      onDisplayRasters?.(rasterPaths);
      
      console.log('Raster paths prepared:', rasterPaths);
    } catch (error) {
      console.error('Error preparing raster data:', error);
      alert('Error preparing raster data. Please try again.');
    } finally {
      setIsLoadingRasters(false);
    }
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

  // Get geometry type display, handling empty values
  const getGeometryTypeDisplay = (file: Dataset) => {
    // Only show geometry type for vector files
    if (file.format !== 'Vector' && file.fileType !== 'shp') return 'N/A';
    return file.geometryType || 'Not specified';
  };

  // Get category display name
  const getCategoryDisplay = (type: string) => {
    switch(type) {
      case 'constraints_factors':
        return 'Constraint';
      case 'conditioning_factors':
        return 'Conditioning';
      default:
        return type;
    }
  };

  // Render files as a table
  const renderFilesTable = (files: Dataset[], selectedIds: string[], toggleHandler: (id: string) => void, type: string) => {
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
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Geometry Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-gray-500 text-sm text-center">
                  No {type} files available
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className={selectedIds.includes(file.id) ? "bg-green-50" : ""}>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={`file-${file.id}`}
                        checked={selectedIds.includes(file.id)}
                        onChange={() => toggleHandler(file.id)}
                        className="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`file-${file.id}`} className="ml-3 cursor-pointer">
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
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getGeometryTypeDisplay(file)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Get all selected datasets for the combined table
  const getAllSelectedDatasets = () => {
    const selectedConstraints = allConstraints.filter(c => selectedConstraintIds.includes(c.id));
    const selectedConditioning = allConditioning.filter(c => selectedConditioningIds.includes(c.id));
    return [...selectedConstraints, ...selectedConditioning];
  };

  // Count selected vectors and rasters
  const getSelectedCounts = () => {
    const selectedDatasets = getAllSelectedDatasets();
    const vectorCount = selectedDatasets.filter(d => 
      d.format === 'Vector' || d.fileType === 'shp'
    ).length;
    const rasterCount = selectedDatasets.filter(d => 
      d.format === 'Raster' || ['tif', 'tiff'].includes(d.fileType || '')
    ).length;
    
    return { vectorCount, rasterCount };
  };

  const { vectorCount, rasterCount } = getSelectedCounts();

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
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Conditioning Factors</h3>
            {isLoadingConditioning ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading conditioning factors...
              </div>
            ) : (
              renderFilesTable(allConditioning, selectedConditioningIds, handleConditioningToggle, "conditioning factors")
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Constraints Factors</h3>
            {isLoadingConstraints ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading constraints factors...
              </div>
            ) : (
              renderFilesTable(allConstraints, selectedConstraintIds, handleConstraintToggle, "constraints factors")
            )}
          </div>
        </div>
      )}
      
      {/* Upload New Data - UPDATED with checkboxes instead of radio buttons */}
      {dataSource === 'upload' && (
        <div className="mb-4">
          <form onSubmit={handleFileUpload} className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (Select one or both)
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-red-600 rounded"
                    name="uploadCategory-constraints"
                    checked={uploadCategories.includes('constraints_factors')}
                    onChange={() => toggleCategory('constraints_factors')}
                  />
                  <span className="ml-2">Constraints</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-purple-600 rounded"
                    name="uploadCategory-conditioning"
                    checked={uploadCategories.includes('conditioning_factors')}
                    onChange={() => toggleCategory('conditioning_factors')}
                  />
                  <span className="ml-2">Conditioning</span>
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
                  accept=".shp,.tif,.tiff"
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
              <p className="text-xs text-gray-500 mt-1">Only .shp and .tif/.tiff files are allowed</p>
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={fileInput === ''}
            >
              Upload
            </button>
          </form>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Conditioning Factors</h3>
            {isLoadingConditioning ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading conditioning factors...
              </div>
            ) : (
              renderFilesTable(allConditioning, selectedConditioningIds, handleConditioningToggle, "conditioning factors")
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Constraints Factors</h3>
            {isLoadingConstraints ? (
              <div className="p-3 text-gray-500 text-sm flex items-center justify-center border rounded-md">
                <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading constraints factors...
              </div>
            ) : (
              renderFilesTable(allConstraints, selectedConstraintIds, handleConstraintToggle, "constraints factors")
            )}
          </div>
        </div>
      )}
      
      {/* Selected Items Summary - Combined Table */}
      <div className="mt-6 bg-gray-50 p-3 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">Selected Datasets</h3>
        
        <div className="mb-4">
          {getAllSelectedDatasets().length === 0 ? (
            <div className="text-sm text-gray-500 italic">No datasets selected</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-1">File</th>
                    <th className="text-left p-1">Category</th>
                    <th className="text-left p-1">Format</th>
                    <th className="text-left p-1">Coordinate</th>
                    <th className="text-left p-1">Resolution</th>
                    <th className="text-left p-1">Geometry Type</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllSelectedDatasets().map(dataset => (
                    <tr key={dataset.id} className="border-t border-gray-200">
                      <td className="p-1">
                        <span className="mr-1">{getFileIcon(dataset.fileType)}</span>
                        {dataset.name}
                        {dataset.isUserUploaded && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Uploaded</span>
                        )}
                      </td>
                      <td className="p-1">
                        <span className={dataset.type === 'constraints_factors' ? 'text-red-600' : 'text-purple-600'}>
                          {getCategoryDisplay(dataset.type)}
                        </span>
                      </td>
                      <td className="p-1">{getFormatDisplay(dataset)}</td>
                      <td className="p-1">{getCoordinateDisplay(dataset)}</td>
                      <td className="p-1">{getResolutionDisplay(dataset)}</td>
                      <td className="p-1">{getGeometryTypeDisplay(dataset)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedConstraintIds.length} constraints, 
              {selectedConditioningIds.length} conditioning factors
              ({vectorCount} vectors, {rasterCount} rasters)
            </span>
          </div>
          <div className="flex space-x-2">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
              onClick={handleDisplayVectors}
              disabled={vectorCount === 0 || isLoadingVectors}
            >
              {isLoadingVectors ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <span>Display Vectors</span>
                </>
              )}
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
              onClick={handleDisplayRasters}
              disabled={rasterCount === 0 || isLoadingRasters}
            >
              {isLoadingRasters ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <span>Display Rasters</span>
                </>
              )}
            </button>
          </div>
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
              Please select at least one dataset from either Constraints or Conditioning Factors before proceeding.
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

export function getGeometryType(dataset: Dataset): string {
  if (dataset.format !== 'Vector' && dataset.fileType !== 'shp') return 'N/A';
  return dataset.geometryType || 'Not specified';
}