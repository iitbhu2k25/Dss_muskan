// components/input.tsx
import React, { useState, useRef, useEffect } from 'react';

interface InputProps {
  activeTab: string;
}

const Input: React.FC<InputProps> = ({ activeTab }) => {
  const [selectionType, setSelectionType] = useState('');
  const [selectedWell, setSelectedWell] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [interpolationMethod, setInterpolationMethod] = useState('');
  const [parameter, setParameter] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [contourInterval, setContourInterval] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Sample data for existing wells
  const existingWells = [
    { id: 'well-1', name: 'Well Group A' },
    { id: 'well-2', name: 'Well Group B' },
    { id: 'well-3', name: 'North Region Wells' },
    { id: 'well-4', name: 'South Region Wells' },
    { id: 'well-5', name: 'Monitoring Wells 2023' }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = () => {
    if (selectionType === 'browse' && selectedFile) {
      // Simulate upload process
      setIsUploading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
      }, 1500);
    }
  };

  const handlePlot = () => {
    // Placeholder for plot functionality
    console.log('Plotting data...');
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowInfoTooltip(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderWellSelection = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Selection of Wells</label>
      <select 
        className="w-full p-2 border rounded-md text-sm"
        value={selectionType}
        onChange={(e) => {
          setSelectionType(e.target.value);
          setSelectedWell('');
          setSelectedFile(null);
          setUploadSuccess(false);
        }}
      >
        <option value="">Select an option...</option>
        <option value="current">Select Existing</option>
        <option value="browse">Add New Data</option>
      </select>
      
      {selectionType === 'current' && (
        <div className="mt-2">
          <select 
            className="w-full p-2 border rounded-md text-sm"
            value={selectedWell}
            onChange={(e) => setSelectedWell(e.target.value)}
          >
            <option value="">Select well group...</option>
            {existingWells.map(well => (
              <option key={well.id} value={well.id}>{well.name}</option>
            ))}
          </select>
          
          {selectedWell && (
            <div className="flex gap-2 mt-2">
              <button className="bg-blue-500 text-white text-sm py-1 px-3 rounded-md flex items-center">
                <span>Upload</span>
                <span className="ml-1 bg-white text-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-xs">✓</span>
              </button>
              <button 
                className="bg-blue-500 text-white text-sm py-1 px-3 rounded-md flex items-center"
                onClick={handlePlot}
              >
                <span>Plot</span>
              </button>
            </div>
          )}
        </div>
      )}
      
      {selectionType === 'browse' && (
        <div className="mt-2">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <div className="flex flex-col items-center justify-center">
              <svg 
                className="w-8 h-8 text-gray-400 mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              
              <p className="text-sm text-gray-500 mb-2">
                {selectedFile ? selectedFile.name : 'Drag and drop file here or click to browse'}
              </p>
              
              <label className="bg-blue-50 text-blue-600 text-sm py-1 px-3 rounded-md cursor-pointer hover:bg-blue-100">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls,.shp,.shx,.dbf"
                  onChange={handleFileChange}
                />
              </label>
              
              <div className="flex items-center mt-1 relative">
                <p className="text-xs text-gray-400">
                  Supports: CSV, Excel files, Shapefiles
                </p>
                <div className="relative ml-1" ref={tooltipRef}>
                  <button 
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                    aria-label="File information"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                  
                  {showInfoTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white shadow-lg rounded-md p-3 z-10 border border-gray-200">
                      <div className="text-xs">
                        <h4 className="font-semibold text-gray-800 mb-1">Required File Format:</h4>
                        <ul className="list-disc pl-4 text-gray-600 mb-2">
                          <li>File types: .csv, .xlsx, .xls, .shp (with .shx and .dbf)</li>
                          <li>Max size: 10MB</li>
                        </ul>
                        <h4 className="font-semibold text-gray-800 mb-1">Required Columns:</h4>
                        <ul className="list-disc pl-4 text-gray-600">
                          <li>Well ID (text): Unique identifier</li>
                          <li>Latitude (number): Decimal degrees</li>
                          <li>Longitude (number): Decimal degrees</li>
                          <li>Elevation (number): Meters above sea level</li>
                          <li>Measurement (number): Value in meters</li>
                          <li>Date (YYYY-MM-DD): Measurement date</li>
                        </ul>
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <a href="#" className="text-blue-500 hover:underline">Download template</a>
                        </div>
                      </div>
                      {/* Arrow pointing down */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {selectedFile && (
            <div className="mt-2">
              <div className="flex gap-2">
                <button 
                  className={`flex-1 text-white text-sm py-1 px-3 rounded-md flex items-center justify-center ${
                    isUploading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span>Upload</span>
                      {uploadSuccess && (
                        <span className="ml-1 bg-white text-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-xs">✓</span>
                      )}
                    </>
                  )}
                </button>
                
                {uploadSuccess && (
                  <button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md flex items-center justify-center"
                    onClick={handlePlot}
                  >
                    <span>Plot</span>
                  </button>
                )}
              </div>
              
              {uploadSuccess && (
                <p className="text-xs text-green-600 mt-1 text-center">
                  File successfully uploaded!
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderGroundwaterContour = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Groundwater Contour</h3>
      
      {renderWellSelection()}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Method of Interpolation</label>
        <select 
          className="w-full p-2 border rounded-md text-sm"
          value={interpolationMethod}
          onChange={(e) => setInterpolationMethod(e.target.value)}
        >
          <option value="">Select Method...</option>
          <option value="idw">Inverse Distance Weighted</option>
          <option value="kriging">Kriging</option>
          <option value="spline">Spline</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Choose Parameter</label>
        <select 
          className="w-full p-2 border rounded-md text-sm"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
        >
          <option value="">Select Parameter...</option>
          <option value="gwl">Groundwater Level</option>
          <option value="conductivity">Conductivity</option>
          <option value="tds">Total Dissolved Solids</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
        <select 
          className="w-full p-2 border rounded-md text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year...</option>
          <option value="2011">2011</option>
          <option value="2012">2012</option>
          <option value="2013">2013</option>
          <option value="2014">2014</option>
          <option value="2015">2015</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Contour Interval (meters)</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded-md text-sm"
          placeholder="Enter interval (e.g., 5)"
          value={contourInterval}
          onChange={(e) => setContourInterval(e.target.value)}
          min="0.1"
          step="0.1"
        />
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
        Apply
      </button>
    </div>
  );

  const renderGroundwaterTrend = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Groundwater Trend</h3>
      
      {renderWellSelection()}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Method for Computing Trend</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Method...</option>
          <option value="linear">Mann-Kendall Test</option>
          <option value="mann">Sen’sSlope Estimator</option>
          <option value="moving">Change Point Analysis</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Period...</option>
          <option value="5years">Last 5 Years</option>
          <option value="10years">Last 10 Years</option>
          <option value="all">All Available Data</option>
        </select>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
        Apply
      </button>
    </div>
  );

  const renderTimeSeriesAnalysis = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Time Series Analysis</h3>
      
      {renderWellSelection()}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Method</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Method...</option>
          <option value="arima">ARIMA Model</option>
          <option value="seasonal">Seasonal Decomposition</option>
          <option value="spectral">Spectral Analysis</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Period</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Period...</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
        </select>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-2">
        Calculate
      </button>
      
      <button className="w-full bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md">
        Advanced Options
      </button>
    </div>
  );

  const renderGroundwaterRecharge = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Groundwater Recharge</h3>
      
      {renderWellSelection()}
      
      <div className="mb-4">
        <h4 className="font-medium text-blue-600 mb-2">Recharge Water Demand</h4>
        <select className="w-full p-2 border rounded-md text-sm mb-2">
          <option value="">Select Analysis Type...</option>
          <option value="rainfall">Rainfall-Recharge Analysis</option>
          <option value="waterbalance">Water Balance Method</option>
          <option value="baseflow">Baseflow Separation</option>
        </select>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Period</label>
          <select className="w-full p-2 border rounded-md text-sm">
            <option value="">Select Period...</option>
            <option value="current">Current Year</option>
            <option value="5years">Last 5 Years Average</option>
            <option value="historical">Historical Average</option>
          </select>
        </div>
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-4">
          Update
        </button>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
        Compute Result
      </button>
    </div>
  );

  // Render the appropriate input form based on the active tab
  const renderInputForm = () => {
    switch (activeTab) {
      case 'groundwater-contour':
        return renderGroundwaterContour();
      case 'groundwater-trend':
        return renderGroundwaterTrend();
      case 'time-series-analysis':
        return renderTimeSeriesAnalysis();
      case 'groundwater-recharge':
        return renderGroundwaterRecharge();
      default:
        return renderGroundwaterContour();
    }
  };

  return (
    <div className="h-full overflow-auto flex flex-col">
      {renderInputForm()}
    </div>
  );
};

export default Input;