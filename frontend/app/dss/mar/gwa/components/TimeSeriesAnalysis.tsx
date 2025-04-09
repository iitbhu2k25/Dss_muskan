import React, { useState, useRef, useEffect } from 'react';

interface TimeSeriesAnalysisProps {
  activeTab: string;
}

const TimeSeriesAnalysis: React.FC<TimeSeriesAnalysisProps> = ({ activeTab }) => {
  // State for data selection
  const [selectionType, setSelectionType] = useState('');
  const [selectedWell, setSelectedWell] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for forecasting methods
  const [forecastingMethods, setForecastingMethods] = useState({
    linearRegression: false,
    decisionTree: false,
    lstm: false
  });
  
  // State for tooltip
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Sample data for existing wells
  const existingWells = [
    { id: 'well-1', name: 'Well Group A' },
    { id: 'well-2', name: 'Well Group B' },
    { id: 'well-3', name: 'North Region Wells' },
    { id: 'well-4', name: 'South Region Wells' },
    { id: 'well-5', name: 'Monitoring Wells 2023' },
    { id: 'well-6', name: 'Monitoring hjhfg' }
  ];

  // Reset selection state when activeTab changes
  useEffect(() => {
    // Reset all selection-related states when tab changes
    setSelectionType('');
    setSelectedWell('');
    setSelectedFile(null);
    setUploadSuccess(false);
  }, [activeTab]);

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

  const handleForecastingMethodChange = (method: string) => {
    setForecastingMethods(prev => ({
      ...prev,
      [method]: !prev[method as keyof typeof prev]
    }));
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

  // Forecasting
  const renderForecasting = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Forecasting</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Choose method:</label>

        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={forecastingMethods.linearRegression}
              onChange={() => handleForecastingMethodChange('linearRegression')}
            />
            Linear Regression
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={forecastingMethods.decisionTree}
              onChange={() => handleForecastingMethodChange('decisionTree')}
            />
            Decision Tree
          </label>
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={forecastingMethods.lstm}
              onChange={() => handleForecastingMethodChange('lstm')}
            />
            LSTM
          </label>
        </div>
      </div>
      
      {/* Forecasting Methods Section in Horizontal Scroll */}
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {/* Linear Regression */}
        {forecastingMethods.linearRegression && (
          <div className="min-w-[320px] max-w-[320px] h-[500px] overflow-y-auto p-3 border border-blue-200 rounded-md bg-blue-50">
            <h4 className="font-medium text-blue-700 mb-2">Linear Regression Settings</h4>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Data Range</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="">Select Range...</option>
                <option value="1year">Last 1 Year</option>
                <option value="2years">Last 2 Years</option>
                <option value="5years">Last 5 Years</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Prediction Horizon</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="">Select Horizon...</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Parameters</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 p-2 border rounded-md text-sm"
                  placeholder="Confidence Level (%)"
                  min="1"
                  max="99"
                  defaultValue="95"
                />
                <input type="checkbox" id="intercept" className="hidden" />
                <label htmlFor="intercept" className="flex items-center text-sm bg-white border rounded-md px-2 cursor-pointer">
                  <span className="mr-1">Include Intercept</span>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                </label>
              </div>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-4 rounded-md">
              Run Linear Regression
            </button>
          </div>
        )}

        {/* Decision Tree */}
        {forecastingMethods.decisionTree && (
          <div className="min-w-[320px] max-w-[320px] h-[500px] overflow-y-auto p-3 border border-green-200 rounded-md bg-green-50">
            <h4 className="font-medium text-green-700 mb-2">Decision Tree Settings</h4>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tree Depth</label>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="3"
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shallow (1)</span>
                <span>Deep (10)</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature Selection</label>
              <div className="space-y-1 max-h-28 overflow-y-auto p-2 border rounded-md bg-white">
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  Groundwater Level
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  Precipitation
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" defaultChecked />
                  Temperature
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" />
                  Soil Moisture
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" />
                  Evapotranspiration
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-1" />
                  Pumping Rate
                </label>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cross-Validation</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option value="5">5-fold</option>
                  <option value="10">10-fold</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Samples Split</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-sm"
                  min="2"
                  defaultValue="2"
                />
              </div>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-4 rounded-md">
              Run Decision Tree
            </button>
          </div>
        )}

        {/* LSTM */}
        {forecastingMethods.lstm && (
          <div className="min-w-[320px] max-w-[320px] h-[500px] overflow-y-auto p-3 border border-purple-200 rounded-md bg-purple-50">
            <h4 className="font-medium text-purple-700 mb-2">LSTM Neural Network Settings</h4>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Network Architecture</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Layers</label>
                  <select className="w-full p-2 border rounded-md text-sm" defaultValue="2">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Units/Layer</label>
                  <select className="w-full p-2 border rounded-md text-sm" defaultValue="64">
                    <option value="32">32</option>
                    <option value="64">64</option>
                    <option value="128">128</option>
                    <option value="256">256</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Parameters</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Epochs</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md text-sm"
                    min="1"
                    defaultValue="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Batch Size</label>
                  <select className="w-full p-2 border rounded-md text-sm" defaultValue="32">
                    <option value="16">16</option>
                    <option value="32">32</option>
                    <option value="64">64</option>
                    <option value="128">128</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sequence Length (Timesteps)</label>
              <input
                type="range"
                min="1"
                max="24"
                defaultValue="12"
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 month</span>
                <span>24 months</span>
              </div>
            </div>

            <div className="mb-3 flex gap-2">
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-2 rounded-md">
                Train Model
              </button>
              <button className="flex-1 bg-purple-100 text-purple-700 border border-purple-300 text-sm py-1 px-2 rounded-md">
                Load Pretrained
              </button>
            </div>

            <div className="text-xs text-gray-500 italic">
              Note: LSTM training may take several minutes depending on data size and complexity.
            </div>
          </div>
        )}
      </div>
      
      {(forecastingMethods.linearRegression || forecastingMethods.decisionTree || forecastingMethods.lstm) && (
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mt-2">
          Compare Selected Methods
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full overflow-auto flex flex-col">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Well Points</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select all well points</option>
          <option value="3months">Select well points from the map</option>
        </select>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-2">
        Calculate
      </button>
      
      {renderForecasting()}         
    </div>
  );
};

export default TimeSeriesAnalysis;