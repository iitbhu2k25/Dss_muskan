'use client';

import { useState, useEffect, RefObject } from 'react';
import { Dataset, ProcessedData } from './ProcessingPart';

interface InterpolationStepProps {
  stepRef: RefObject<HTMLDivElement>;
  selectedDatasets: Dataset[];
  interpolatedData: ProcessedData[];
  setInterpolatedData: (data: ProcessedData[]) => void;
  handleProceed: (currentStep: number, nextStep: number, newProcessedData: ProcessedData[]) => void;
  stepProcessedData: ProcessedData[];
  currentSelectedDataset: Dataset | null;
}

export default function InterpolationStep({
  stepRef,
  selectedDatasets,
  interpolatedData,
  setInterpolatedData,
  handleProceed,
  stepProcessedData,
  currentSelectedDataset,
}: InterpolationStepProps) {
  const [interpolationMethod, setInterpolationMethod] = useState('');
  const [selectedShapefiles, setSelectedShapefiles] = useState<string[]>([]);
  const [shapefileAttributes, setShapefileAttributes] = useState<{ [key: string]: string[] }>({});
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  // Find related DBF file for a shapefile
  const findRelatedDbfFile = (shapefile: Dataset, allDatasets: Dataset[]) => {
    // Get base name of the shapefile (without extension)
    const baseNameParts = shapefile.name.split('.');
    baseNameParts.pop(); // Remove extension
    const baseName = baseNameParts.join('.');
    
    // Look for a DBF file with the same base name
    return allDatasets.find(dataset => {
      const lowerFileName = dataset.name.toLowerCase();
      return lowerFileName.endsWith('.dbf') && 
             lowerFileName.startsWith(baseName.toLowerCase());
    });
  };

  // Fetch shapefile attributes when selected files change
  useEffect(() => {
    const fetchAttributes = async () => {
      // Create a new list of loading states
      const newLoadingStates = { ...isLoading };
      
      // Get the newly selected shapefile IDs
      const newlySelectedIds = selectedShapefiles.filter(id => !Object.keys(shapefileAttributes).includes(id));
      
      // Set loading state for new selections
      newlySelectedIds.forEach(id => {
        newLoadingStates[id] = true;
      });
      setIsLoading(newLoadingStates);
      
      // Only fetch for newly selected shapefiles
      if (newlySelectedIds.length === 0) return;
      
      const formData = new FormData();
      
      // Log selected files for debugging
      console.log("Selected shapefiles:", newlySelectedIds);
      console.log("All datasets:", selectedDatasets.map(d => ({ id: d.id, name: d.name })));
      
      // Get the shapefiles to send
      const shapefilesToSend = selectedDatasets
        .filter((d) => newlySelectedIds.includes(d.id));
      
      console.log("Shapefiles to send:", shapefilesToSend);
      
      // For each shapefile, send both the shapefile and its associated DBF file if available
      shapefilesToSend.forEach((shapefile) => {
        if (shapefile.file instanceof File) {
          console.log("Appending shapefile:", shapefile.name);
          formData.append('files', shapefile.file, shapefile.name);
          
          // Try to find associated DBF file
          const dbfFile = findRelatedDbfFile(shapefile, selectedDatasets);
          if (dbfFile && dbfFile.file instanceof File) {
            console.log("Appending associated DBF file:", dbfFile.name);
            formData.append('files', dbfFile.file, dbfFile.name);
          } else {
            console.log("No associated DBF file found for:", shapefile.name);
            
            // Alternative: Create file IDs to send for server-side lookup
            const fileId = shapefile.id;
            if (!formData.has('fileIds')) {
              formData.append('fileIds', fileId);
            } else {
              const existingIds = formData.get('fileIds') as string;
              formData.set('fileIds', `${existingIds},${fileId}`);
            }
          }
        }
      });

      try {
        console.log("Sending request to backend...");
        console.log("FormData entries:", [...formData.entries()].map(([key, value]) => {
          return { key, value: value instanceof File ? `File: ${value.name}` : value };
        }));
        
        const response = await fetch('http://localhost:9000/api/stp_suitability/get-multiple-attributes/', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("Response from backend:", result);

        if (result.attributes) {
          const newAttributes = { ...shapefileAttributes };
          
          // Try different matching strategies for each file
          Object.entries(result.attributes).forEach(([fileName, attrs]) => {
            console.log(`Processing attributes for file: ${fileName}`);
            
            // Try different matching strategies
            let matchedDataset = null;
            
            // Strategy 1: Exact name match
            matchedDataset = selectedDatasets.find(d => d.name === fileName);
            
            // Strategy 2: Match with extension
            if (!matchedDataset) {
              matchedDataset = selectedDatasets.find(d => d.name === `${fileName}.shp`);
            }
            
            // Strategy 3: Match by basename
            if (!matchedDataset) {
              const fileBaseName = fileName.split('.')[0];
              matchedDataset = selectedDatasets.find(d => {
                const datasetBaseName = d.name.split('.')[0];
                return datasetBaseName === fileBaseName;
              });
            }
            
            // Strategy 4: Match by name within filename
            if (!matchedDataset) {
              matchedDataset = selectedDatasets.find(d => {
                const datasetBaseName = d.name.split('.')[0];
                return fileName.includes(datasetBaseName);
              });
            }
            
            if (matchedDataset) {
              console.log(`Found matching dataset: ${matchedDataset.id} for file: ${fileName}`);
              newAttributes[matchedDataset.id] = Array.isArray(attrs) ? attrs : [];
              
              // Update loading state
              newLoadingStates[matchedDataset.id] = false;
            } else {
              console.log(`No matching dataset found for file: ${fileName}`);
              
              // Try one last approach - match to any of the newly selected IDs
              // that don't have attributes yet
              const unmatchedIds = newlySelectedIds.filter(id => !newAttributes[id]);
              if (unmatchedIds.length > 0) {
                const firstUnmatchedId = unmatchedIds[0];
                console.log(`Forcing match to first unmatched ID: ${firstUnmatchedId}`);
                newAttributes[firstUnmatchedId] = Array.isArray(attrs) ? attrs : [];
                newLoadingStates[firstUnmatchedId] = false;
              }
            }
          });
          
          console.log("Setting shapefile attributes:", newAttributes);
          setShapefileAttributes(newAttributes);
          
          // Update loading states for any files that didn't get attributes
          selectedShapefiles.forEach(id => {
            if (newLoadingStates[id] && !newAttributes[id]) {
              newLoadingStates[id] = false;
            }
          });
          setIsLoading(newLoadingStates);
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
        
        // Reset loading state on error
        const resetLoadingStates = { ...newLoadingStates };
        Object.keys(resetLoadingStates).forEach(key => {
          resetLoadingStates[key] = false;
        });
        setIsLoading(resetLoadingStates);
      }
    };

    fetchAttributes();
  }, [selectedShapefiles, selectedDatasets]);

  // Rest of your component code remains the same...
  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case 'shp': return '📊';
      case 'tif':
      case 'tiff': return '🗺️';
      default: return '📄';
    }
  };

  const getFormatDisplay = (file: Dataset) => {
    if (file.format) return file.format;
    if (file.fileType === 'shp') return 'Vector';
    if (['tif', 'tiff'].includes(file.fileType || '')) return 'Raster';
    return 'Other';
  };

  const handleShapefileSelection = (datasetId: string) => {
    setSelectedShapefiles((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleAttributeSelection = (datasetId: string, attribute: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [datasetId]: attribute,
    }));
  };

  const handleApplyInterpolation = () => {
    if (!interpolationMethod) {
      alert('Please select an interpolation method.');
      return;
    }

    if (selectedShapefiles.length === 0) {
      alert('Please select at least one shapefile.');
      return;
    }

    if (selectedShapefiles.some((id) => !selectedAttributes[id])) {
      alert('Please select an attribute for each selected shapefile.');
      return;
    }

    const newInterpolatedData = selectedShapefiles.map((id) => {
      const dataset = selectedDatasets.find((d) => d.id === id);
      return {
        fileName: dataset?.name || 'Interpolated_' + id,
        dataset,
        process: 'Interpolation Completed',
        projection: 'EPSG:4326',
      };
    });

    setInterpolatedData([...interpolatedData, ...newInterpolatedData]);
  };

  const handleProceedClick = () => {
    if (interpolatedData.length === 0 && selectedShapefiles.length > 0) {
      alert('Please apply interpolation before proceeding.');
      return;
    }

    const newProcessedData = [
      ...selectedDatasets.map((dataset) => ({
        fileName: dataset.name,
        dataset,
        process: 'Interpolation Completed',
        projection: 'EPSG:4326',
      })),
      ...interpolatedData,
    ];

    handleProceed(1, 2, newProcessedData);
  };

  return (
    <div ref={stepRef} className="mb-4">
      <h3 className="font-medium mb-2 text-gray-700">Step 1: Interpolation</h3>
      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Select Shapefiles</h4>
          <table className="w-full border">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-2 py-1 text-left">Select</th>
                <th className="px-2 py-1 text-left">File</th>
                <th className="px-2 py-1 text-left">Format</th>
              </tr>
            </thead>
            <tbody>
              {selectedDatasets.filter((d) => d.fileType === 'shp').map((dataset) => (
                <tr key={dataset.id}>
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedShapefiles.includes(dataset.id)}
                      onChange={() => handleShapefileSelection(dataset.id)}
                    />
                  </td>
                  <td className="px-2 py-2 flex items-center">
                    <span className="mr-2">{getFileIcon(dataset.fileType)}</span>
                    {dataset.name}
                  </td>
                  <td className="px-2 py-2">{getFormatDisplay(dataset)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">Interpolation Method</label>
          <select
            value={interpolationMethod}
            onChange={(e) => setInterpolationMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select...</option>
            <option value="idw">IDW</option>
            <option value="kriging">Kriging</option>
            <option value="spline">Spline</option>
          </select>
        </div>

        {selectedShapefiles.length > 0 && (
          <div className="mb-4">
            {selectedShapefiles.map((id) => {
              const dataset = selectedDatasets.find((d) => d.id === id);
              return (
                <div key={id} className="mb-2">
                  <label className="block text-sm mb-1 font-medium">
                    Attributes for {dataset?.name}
                  </label>
                  <select
                    value={selectedAttributes[id] || ''}
                    onChange={(e) => handleAttributeSelection(id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={isLoading[id]}
                  >
                    <option value="">
                      {isLoading[id] ? 'Loading attributes...' : 'Select...'}
                    </option>
                    {shapefileAttributes[id]?.length === 0 && !isLoading[id] && (
                      <option value="" disabled>
                        No attributes found
                      </option>
                    )}
                    {shapefileAttributes[id]?.map((attr) => (
                      <option key={attr} value={attr}>{attr}</option>
                    ))}
                  </select>
                  {isLoading[id] && (
                    <div className="mt-1 text-sm text-blue-500">
                      Loading attributes...
                    </div>
                  )}
                  {!isLoading[id] && shapefileAttributes[id]?.length === 0 && (
                    <div className="mt-1 text-sm text-red-500">
                      No attributes found. Please check the shapefile.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded" 
            onClick={handleApplyInterpolation}
            disabled={Object.values(isLoading).some(v => v)}
          >
            Apply
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded" 
            onClick={handleProceedClick}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}