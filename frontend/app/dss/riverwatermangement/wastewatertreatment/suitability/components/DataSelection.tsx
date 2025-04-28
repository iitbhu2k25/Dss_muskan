'use client';

import React, { useState } from 'react';

// Mock data types
interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'constraints' | 'conditions';
  createdAt: string;
}

// Mock datasets for demonstration
const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Soil Conditions',
    description: 'Soil quality and composition data for the target area',
    type: 'conditions',
    createdAt: '2023-05-15'
  },
  {
    id: '2',
    name: 'Watershed Boundaries',
    description: 'Defined boundaries of local watersheds',
    type: 'constraints',
    createdAt: '2023-06-22'
  },
  {
    id: '3',
    name: 'Water Quality Measurements',
    description: 'pH, dissolved oxygen, and other water quality metrics',
    type: 'conditions',
    createdAt: '2023-07-10'
  },
  {
    id: '4',
    name: 'Protected Areas',
    description: 'Environmentally protected regions and conservation zones',
    type: 'constraints',
    createdAt: '2023-08-05'
  },
];

// Constraint and conditioning factors based on the image
const constraintFactors = [
  { id: 'water-body', label: 'Water Body' },
  { id: 'flood-prone-area', label: 'Flood Prone Area' },
  { id: 'forest', label: 'Forest' },
  { id: 'road', label: 'Road' },
  { id: 'slope-constraint', label: 'Slope' },
  { id: 'ground-water-depth', label: 'Ground Water Depth' },
  { id: 'adi-sites', label: 'ADI Sites' },
  { id: 'airport', label: 'Airport' },
  { id: 'soil-texture-constraint', label: 'Soil Texture' },
  { id: 'wetland', label: 'Wetland' },
  { id: 'existing-stps', label: 'Existing STPs' },
  { id: 'built-up-area', label: 'Built-up Area' }
];

const conditioningFactors = [
  { id: 'lithology', label: 'Lithology' },
  { id: 'soil-type', label: 'Soil Type' },
  { id: 'slope-condition', label: 'Slope' },
  { id: 'distance-from-built-up', label: 'Distance from Built-up Land' },
  { id: 'geomorphology', label: 'Geomorphology' },
  { id: 'lulc', label: 'LULC' },
  { id: 'population-density', label: 'Population Density' },
  { id: 'groundwater-quality', label: 'Groundwater Quality' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'drains', label: 'Drains' }
];

interface DataSelectionPartProps {
  onSelectDatasets?: (datasets: Dataset[]) => void;
  onConstraintsChange?: (constraintIds: string[]) => void;
  onConditionsChange?: (conditionIds: string[]) => void;
}

export type { Dataset };

export default function DataSelectionPart({ 
  onSelectDatasets, 
  onConstraintsChange,
  onConditionsChange 
}: DataSelectionPartProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'constraints' | 'conditions'>('all');
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [dataSource, setDataSource] = useState<'existing' | 'upload'>('existing');
  const [categoryType, setCategoryType] = useState<'constraints' | 'conditions'>('constraints');
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>(['flood-prone-area', 'forest', 'adi-sites', 'airport', 'wetland', 'existing-stps', 'built-up-area']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['soil-type', 'lulc', 'population-density', 'elevation', 'drains']);
  const [showDatasetList, setShowDatasetList] = useState(true);

  // Filter datasets based on search term and filter selection
  const filteredDatasets = mockDatasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || dataset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle dataset selection/deselection
  const toggleDatasetSelection = (dataset: Dataset) => {
    const isSelected = selectedDatasets.some(d => d.id === dataset.id);
    let updatedSelection;
    
    if (isSelected) {
      updatedSelection = selectedDatasets.filter(d => d.id !== dataset.id);
    } else {
      updatedSelection = [...selectedDatasets, dataset];
    }
    
    setSelectedDatasets(updatedSelection);
    
    // Call the parent callback if provided
    if (onSelectDatasets) {
      onSelectDatasets(updatedSelection);
    }
  };

  // Toggle constraint factor selection
  const toggleConstraint = (id: string) => {
    const updatedConstraints = selectedConstraints.includes(id)
      ? selectedConstraints.filter(item => item !== id)
      : [...selectedConstraints, id];
    
    setSelectedConstraints(updatedConstraints);
    
    if (onConstraintsChange) {
      onConstraintsChange(updatedConstraints);
    }
  };

  // Toggle conditioning factor selection
  const toggleCondition = (id: string) => {
    const updatedConditions = selectedConditions.includes(id)
      ? selectedConditions.filter(item => item !== id)
      : [...selectedConditions, id];
    
    setSelectedConditions(updatedConditions);
    
    if (onConditionsChange) {
      onConditionsChange(updatedConditions);
    }
  };

  // Handle file upload (mock function)
  const handleFileUpload = () => {
    console.log('File upload functionality would be implemented here');
  };

  return (
    <div className="border rounded-lg p-4">
      {/* Data Source Selection */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Select Data Source :</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="dataSource"
              checked={dataSource === 'existing'}
              onChange={() => {
                setDataSource('existing');
                setShowDatasetList(true);
              }}
              className="mr-2"
            />
            Select Existing
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="dataSource"
              checked={dataSource === 'upload'}
              onChange={() => {
                setDataSource('upload');
                setShowDatasetList(false);
              }}
              className="mr-2"
            />
            Upload New
          </label>
        </div>
      </div>
      
      {/* Category Type Selection (only for upload) */}
      {dataSource === 'upload' && (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Select Category Type:</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="categoryType"
                checked={categoryType === 'constraints'}
                onChange={() => setCategoryType('constraints')}
                className="mr-2"
              />
              Constraints factor Type Data
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="categoryType"
                checked={categoryType === 'conditions'}
                onChange={() => setCategoryType('conditions')}
                className="mr-2"
              />
              Conditioning factor Type Data
            </label>
          </div>
          
          <div className="mt-2 flex">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Browse Data"
                className="w-full border px-3 py-2 rounded-md"
                readOnly
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleFileUpload}
              className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Upload
            </button>
          </div>
        </div>
      )}
      
      {/* Dataset List (only when selecting existing) */}
      {dataSource === 'existing' && showDatasetList && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-2/3">
              <label htmlFor="search-datasets" className="block text-sm font-medium text-gray-700 mb-1">
                Search Datasets
              </label>
              <input
                id="search-datasets"
                type="text"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-1/3">
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                id="filter-type"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'constraints' | 'conditions')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="constraints">Constraints</option>
                <option value="conditions">Conditions</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b flex">
              <div className="w-8"></div>
              <div className="flex-1 font-medium">Name</div>
              <div className="flex-1 hidden sm:block font-medium">Description</div>
              <div className="w-24 text-center hidden sm:block font-medium">Type</div>
            </div>
            
            {filteredDatasets.length > 0 ? (
              <div className="divide-y">
                {filteredDatasets.map((dataset) => {
                  const isSelected = selectedDatasets.some(d => d.id === dataset.id);
                  return (
                    <div 
                      key={dataset.id} 
                      className={`px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleDatasetSelection(dataset)}
                    >
                      <div className="w-8">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}} // Handled by the div click
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 font-medium">{dataset.name}</div>
                      <div className="flex-1 text-gray-600 hidden sm:block text-sm">{dataset.description}</div>
                      <div className="w-24 text-center hidden sm:block">
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            dataset.type === 'constraints' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {dataset.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No datasets found matching your search criteria.
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{selectedDatasets.length}</span> dataset{selectedDatasets.length !== 1 ? 's' : ''} selected
            </div>
            
            <button 
              onClick={() => setSelectedDatasets([])}
              disabled={selectedDatasets.length === 0}
              className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm ${
                selectedDatasets.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      {/* Constraint Factors */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Constraint Factors :</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {constraintFactors.map(factor => (
            <div key={factor.id} className="flex items-center">
              <input
                type="checkbox"
                id={factor.id}
                checked={selectedConstraints.includes(factor.id)}
                onChange={() => toggleConstraint(factor.id)}
                className="mr-2"
              />
              <label htmlFor={factor.id} className="text-sm">{factor.label}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Conditioning Factors */}
      <div>
        <h3 className="text-md font-semibold mb-2">Conditioning Factors :</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {conditioningFactors.map(factor => (
            <div key={factor.id} className="flex items-center">
              <input
                type="checkbox"
                id={factor.id}
                checked={selectedConditions.includes(factor.id)}
                onChange={() => toggleCondition(factor.id)}
                className="mr-2"
              />
              <label htmlFor={factor.id} className="text-sm">{factor.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}