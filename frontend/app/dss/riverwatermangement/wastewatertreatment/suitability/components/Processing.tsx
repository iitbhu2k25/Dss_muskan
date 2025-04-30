'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dataset } from './DataSelection';

interface ProcessingProps {
  selectedDatasets: Dataset[];
  selectedConstraints: string[];
  savedInterpolationData?: SavedInterpolationData[];
}

interface SavedInterpolationData {
  fileName: string;
  dataset: Dataset | null;
  interpolationMethod: string;
  parameter: string;
  projection?: string;
}

interface ProcessedData {
  fileName: string;
  dataset: Dataset | null;
  process: string;
  projection: string;
}

export default function ProcessingPart({ selectedDatasets, selectedConstraints, savedInterpolationData = [] }: ProcessingProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projectionSystem, setProjectionSystem] = useState<string>('');
  const [gridSizeX, setGridSizeX] = useState<number | undefined>(undefined);
  const [gridSizeY, setGridSizeY] = useState<number | undefined>(undefined);
  const [resamplingMethod, setResamplingMethod] = useState<string>('');
  const [resampleGridSizeX, setResampleGridSizeX] = useState<number | undefined>(undefined);
  const [resampleGridSizeY, setResampleGridSizeY] = useState<number | undefined>(undefined);
  const [classificationClasses, setClassificationClasses] = useState<number | undefined>(undefined);
  const [reclassificationTable, setReclassificationTable] = useState<{ oldValue: string; newValue: string }[]>([]);
  const [normalizationMethod, setNormalizationMethod] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepProcessedData, setStepProcessedData] = useState<{ [key: number]: ProcessedData[] }>({});
  const [currentSelectedDataset, setCurrentSelectedDataset] = useState<Dataset | null>(null);

  // References for each step section
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Define steps for navigation
  const steps = [
    { id: 1, name: 'Projection', ref: step1Ref },
    { id: 2, name: 'Resampling', ref: step2Ref },
    { id: 3, name: 'Reclassification', ref: step3Ref },
    { id: 4, name: 'Normalization', ref: step4Ref },
  ];

  // Sample constraint data for display
  const constraints = [
    { id: 'water', name: 'Water Bodies', color: 'blue' },
    { id: 'roads', name: 'Roads', color: 'gray' },
    { id: 'protected', name: 'Protected Areas', color: 'green' },
    { id: 'slope', name: 'Steep Slopes', color: 'brown' },
  ];

  // Filter constraints based on selected IDs
  const activeConstraints = constraints.filter((c) => selectedConstraints.includes(c.id));

  // Update reclassification table based on classificationClasses
  useEffect(() => {
    if (classificationClasses !== undefined && classificationClasses >= 2 && classificationClasses <= 10) {
      const newTable = Array.from({ length: classificationClasses }, () => ({
        oldValue: '',
        newValue: '',
      }));
      setReclassificationTable(newTable);
    } else {
      setReclassificationTable([]);
    }
  }, [classificationClasses]);

  // Handle step navigation click
  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    const stepRef = steps.find((step) => step.id === stepId)?.ref;
    if (stepRef?.current) {
      stepRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Proceed button for each step
  const handleProceed = (currentStep: number, nextStep: number) => {
    // Validation for current step
    if (currentStep === 1) {
      if (!projectionSystem) {
        alert('Please select a coordinate system.');
        return;
      }
      if (gridSizeX === undefined || gridSizeY === undefined) {
        alert('Please enter grid sizes for X and Y.');
        return;
      }
    } else if (currentStep === 2) {
      if (!resamplingMethod) {
        alert('Please select a resampling method.');
        return;
      }
      if (resampleGridSizeX === undefined || resampleGridSizeY === undefined) {
        alert('Please enter grid sizes for X and Y.');
        return;
      }
    } else if (currentStep === 3) {
      if (classificationClasses === undefined || classificationClasses < 2) {
        alert('Please enter a valid number of classes (minimum 2).');
        return;
      }
      if (reclassificationTable.some((row) => !row.oldValue || !row.newValue)) {
        alert('Please fill all old and new values in the reclassification table.');
        return;
      }
    } else if (currentStep === 4) {
      if (!normalizationMethod) {
        alert('Please select a normalization method.');
        return;
      }
    }

    const newProcessedData: ProcessedData[] = [
      ...selectedDatasets.map((dataset) => ({
        fileName: dataset.name,
        dataset,
        process: getProcessName(currentStep),
        projection: projectionSystem || 'EPSG:4326',
      })),
      ...savedInterpolationData.map((data) => ({
        fileName: data.fileName,
        dataset: data.dataset,
        process: getProcessName(currentStep),
        projection: data.projection || projectionSystem || 'EPSG:4326',
      })),
    ];

    // Update step-specific processed data
    setStepProcessedData((prev) => ({
      ...prev,
      [currentStep]: newProcessedData,
    }));

    // Mark step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    // Move to next step
    setCurrentStep(nextStep);

    // Scroll to the next step
    const nextStepRef = steps.find((step) => step.id === nextStep)?.ref;
    if (nextStepRef?.current) {
      nextStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Display button for Reclassification
  const handleDisplay = () => {
    alert('Display functionality to be implemented.');
    // Placeholder for actual display logic
  };

  // Get process name for table title
  const getProcessName = (step: number) => {
    switch (step) {
      case 1:
        return 'Projection Completed';
      case 2:
        return 'Resampling Completed';
      case 3:
        return 'Reclassification Completed';
      case 4:
        return 'Normalization Completed';
      default:
        return '';
    }
  };

  // Handle reclassification table updates
  const updateReclassificationTable = (index: number, field: 'oldValue' | 'newValue', value: string) => {
    const updatedTable = [...reclassificationTable];
    updatedTable[index][field] = value;
    setReclassificationTable(updatedTable);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-green-600">Processing Tools</h2>

      {selectedDatasets.length === 0 ? (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
          Please go back and select datasets first
        </div>
      ) : (
        <>
          {/* Datasets & Constraints Section */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Datasets & Constraints</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm font-medium mb-1 text-gray-600">Selected Datasets</p>
                {selectedDatasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">{dataset.name}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm font-medium mb-1 text-gray-600">Selected Constraints</p>
                {activeConstraints.length > 0 ? (
                  activeConstraints.map((constraint) => (
                    <div key={constraint.id} className="flex items-center mb-1">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: constraint.color }}
                      ></div>
                      <span className="text-sm">{constraint.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No constraints selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2 text-gray-700">Processing Steps</h3>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-300">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center py-2 rounded-md cursor-pointer ${
                    step.id === currentStep
                      ? 'bg-green-500 text-white'
                      : step.id < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <span className="text-sm font-medium">
                    Step {step.id}: {step.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Current Step: {currentStep} of {steps.length}
            </p>
          </div>

          {/* Step 1: Projection */}
          <div ref={step1Ref} className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Step 1: Projection</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinate System</label>
                <select
                  value={projectionSystem}
                  onChange={(e) => setProjectionSystem(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
                  <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
                  <option value="EPSG:3395">World Mercator (EPSG:3395)</option>
                  <option value="EPSG:32633">UTM Zone 33N (EPSG:32633)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size X (meters)</label>
                <input
                  type="number"
                  value={gridSizeX ?? ''}
                  onChange={(e) => setGridSizeX(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="10"
                  step="10"
                  placeholder="Enter grid size X"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size Y (meters)</label>
                <input
                  type="number"
                  value={gridSizeY ?? ''}
                  onChange={(e) => setGridSizeY(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="10"
                  step="10"
                  placeholder="Enter grid size Y"
                />
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={() => handleProceed(1, 2)}
              >
                Proceed
              </button>
            </div>
            {completedSteps.has(1) && stepProcessedData[1]?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">{getProcessName(1)}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border">File Name</th>
                        <th className="px-4 py-2 border">Dataset</th>
                        <th className="px-4 py-2 border">Process</th>
                        <th className="px-4 py-2 border">Projection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepProcessedData[1]
                        .filter((data) => !currentSelectedDataset || data.dataset?.id !== currentSelectedDataset.id)
                        .map((data, index) => (
                          <tr key={`processed-1-${index}`} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{data.fileName}</td>
                            <td className="px-4 py-2 border">{data.dataset?.name || 'None'}</td>
                            <td className="px-4 py-2 border">{data.process}</td>
                            <td className="px-4 py-2 border">{data.projection}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Resampling */}
          <div ref={step2Ref} className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Step 2: Resampling</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resampling Method</label>
                <select
                  value={resamplingMethod}
                  onChange={(e) => setResamplingMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="nearest">Nearest Neighbor</option>
                  <option value="bilinear">Bilinear</option>
                  <option value="cubic">Cubic</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size X (meters)</label>
                <input
                  type="number"
                  value={resampleGridSizeX ?? ''}
                  onChange={(e) => setResampleGridSizeX(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="10"
                  step="10"
                  placeholder="Enter grid size X"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size Y (meters)</label>
                <input
                  type="number"
                  value={resampleGridSizeY ?? ''}
                  onChange={(e) => setResampleGridSizeY(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="10"
                  step="10"
                  placeholder="Enter grid size Y"
                />
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={() => handleProceed(2, 3)}
              >
                Proceed
              </button>
            </div>
            {completedSteps.has(2) && stepProcessedData[2]?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">{getProcessName(2)}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border">File Name</th>
                        <th className="px-4 py-2 border">Dataset</th>
                        <th className="px-4 py-2 border">Process</th>
                        <th className="px-4 py-2 border">Projection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepProcessedData[2]
                        .filter((data) => !currentSelectedDataset || data.dataset?.id !== currentSelectedDataset.id)
                        .map((data, index) => (
                          <tr key={`processed-2-${index}`} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{data.fileName}</td>
                            <td className="px-4 py-2 border">{data.dataset?.name || 'None'}</td>
                            <td className="px-4 py-2 border">{data.process}</td>
                            <td className="px-4 py-2 border">{data.projection}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Reclassification */}
          <div ref={step3Ref} className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Step 3: Reclassification</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Classes</label>
                <input
                  type="number"
                  value={classificationClasses ?? ''}
                  onChange={(e) => setClassificationClasses(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="2"
                  max="10"
                  placeholder="Enter number of classes"
                />
              </div>
              {reclassificationTable.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reclassification Table</label>
                  <div className="border border-gray-300 rounded-md p-2">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Old Value</span>
                      <span className="text-sm font-medium text-gray-600">New Value</span>
                    </div>
                    {reclassificationTable.map((row, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={row.oldValue}
                          onChange={(e) => updateReclassificationTable(index, 'oldValue', e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Old Value"
                        />
                        <input
                          type="text"
                          value={row.newValue}
                          onChange={(e) => updateReclassificationTable(index, 'newValue', e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="New Value"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => handleProceed(3, 4)}
                >
                  Proceed
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleDisplay}
                >
                  Display
                </button>
              </div>
            </div>
            {completedSteps.has(3) && stepProcessedData[3]?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">{getProcessName(3)}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border">File Name</th>
                        <th className="px-4 py-2 border">Dataset</th>
                        <th className="px-4 py-2 border">Process</th>
                        <th className="px-4 py-2 border">Projection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepProcessedData[3]
                        .filter((data) => !currentSelectedDataset || data.dataset?.id !== currentSelectedDataset.id)
                        .map((data, index) => (
                          <tr key={`processed-3-${index}`} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{data.fileName}</td>
                            <td className="px-4 py-2 border">{data.dataset?.name || 'None'}</td>
                            <td className="px-4 py-2 border">{data.process}</td>
                            <td className="px-4 py-2 border">{data.projection}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Normalization */}
          <div ref={step4Ref} className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Step 4: Normalization</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Normalization Method</label>
                <select
                  value={normalizationMethod}
                  onChange={(e) => setNormalizationMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="minmax">Min-Max</option>
                  <option value="zscore">Z-Score</option>
                  <option value="log">Logarithmic</option>
                </select>
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={() => handleProceed(4, 4)}
              >
                Proceed
              </button>
            </div>
            {completedSteps.has(4) && stepProcessedData[4]?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">{getProcessName(4)}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border">File Name</th>
                        <th className="px-4 py-2 border">Dataset</th>
                        <th className="px-4 py-2 border">Process</th>
                        <th className="px-4 py-2 border">Projection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepProcessedData[4]
                        .filter((data) => !currentSelectedDataset || data.dataset?.id !== currentSelectedDataset.id)
                        .map((data, index) => (
                          <tr key={`processed-4-${index}`} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{data.fileName}</td>
                            <td className="px-4 py-2 border">{data.dataset?.name || 'None'}</td>
                            <td className="px-4 py-2 border">{data.process}</td>
                            <td className="px-4 py-2 border">{data.projection}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}