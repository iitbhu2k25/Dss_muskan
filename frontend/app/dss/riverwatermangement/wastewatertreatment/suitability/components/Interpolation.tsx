// 'use client';

// import React, { useState } from 'react';
// import { Dataset } from './DataSelection';

// interface InterpolationProps {
//   selectedDatasets: Dataset[];
//   onSaveData?: (savedData: SavedInterpolationData[]) => void;
// }

// interface SavedInterpolationData {
//   fileName: string;
//   dataset: Dataset | null;
//   interpolationMethod: string;
//   parameter: string;
// }

// export default function InterpolationPart({ selectedDatasets, onSaveData }: InterpolationProps) {
//   const [showDatasetDropdown, setShowDatasetDropdown] = useState<boolean>(false);
//   const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
//   const [interpolationMethod, setInterpolationMethod] = useState<string>('idw');
//   const [parameter, setParameter] = useState<string>('elevation');
//   const [showSaveInput, setShowSaveInput] = useState<boolean>(false);
//   const [fileName, setFileName] = useState<string>('');
//   const [savedData, setSavedData] = useState<SavedInterpolationData[]>([]);
//   const [hasSavedData, setHasSavedData] = useState<boolean>(false);
//   const [selectedForProcessing, setSelectedForProcessing] = useState<Set<string>>(new Set());

//   const handleDatasetSelect = (dataset: Dataset) => {
//     setSelectedDataset(dataset);
//     setShowDatasetDropdown(false);
//   };

//   const handleSaveAs = () => {
//     setShowSaveInput(true);
//   };

//   const handleSaveConfirm = () => {
//     if (!fileName) {
//       alert('Please enter a file name');
//       return;
//     }

//     const newSavedData: SavedInterpolationData = {
//       fileName,
//       dataset: selectedDataset,
//       interpolationMethod,
//       parameter,
//     };

//     const updatedSavedData = [...savedData, newSavedData];
//     setSavedData(updatedSavedData);
//     setHasSavedData(true);

//     if (onSaveData) {
//       onSaveData(updatedSavedData);
//     }

//     setFileName('');
//     setShowSaveInput(false);
//     alert(`Interpolation result saved as ${fileName}`);
//   };

//   const handleSaveCancel = () => {
//     setFileName('');
//     setShowSaveInput(false);
//   };

//   const handleDisplay = () => {
//     alert('Displaying interpolation result');
//   };

//   const handleCheckboxChange = (id: string) => {
//     setSelectedForProcessing((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   // Define parameter options based on file name
//   const parameterOptions = selectedDataset
//     ? [
//         { value: 'elevation', label: `${selectedDataset.name}_Elevation` },
//         { value: 'temperature', label: `${selectedDataset.name}_Temperature` },
//         { value: 'precipitation', label: `${selectedDataset.name}_Precipitation` },
//         { value: 'moisture', label: `${selectedDataset.name}_Moisture` },
//         { value: 'windspeed', label: `${selectedDataset.name}_WindSpeed` },
//       ]
//     : [];

//   // Define parameter label based on interpolation method
//   const parameterLabel = {
//     idw: 'Weight Attribute',
//     kriging: 'Variogram Attribute',
//     naturalNeighbor: 'Neighbor Attribute',
//     spline: 'Smoothness Attribute',
//   }[interpolationMethod];

//   return (
//     <div className="bg-white rounded-lg shadow p-4">
//       <h2 className="text-lg font-semibold mb-4 text-blue-600">Interpolation Parameters</h2>

//       {selectedDatasets.length === 0 ? (
//         <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
//           Please go back and select datasets first
//         </div>
//       ) : (
//         <>
//           <div className="mb-4 relative">
//             <h3 className="font-medium mb-2 text-gray-700">1. Select Point Data</h3>
//             <div
//               className="bg-gray-50 p-3 rounded-md flex items-center justify-between cursor-pointer border border-gray-300"
//               onClick={() => setShowDatasetDropdown(!showDatasetDropdown)}
//             >
//               {selectedDataset ? (
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
//                   <span>{selectedDataset.name}</span>
//                 </div>
//               ) : (
//                 <span className="text-gray-800">Select a dataset</span>
//               )}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 text-gray-500"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </div>
//             {showDatasetDropdown && (
//               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                 {selectedDatasets.map((dataset) => (
//                   <div
//                     key={dataset.id}
//                     className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
//                     onClick={() => handleDatasetSelect(dataset)}
//                   >
//                     <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
//                     <span className="text-sm">{dataset.name}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {selectedDataset && (
//             <>
//               <div className="mb-4">
//                 <h3 className="font-medium mb-2 text-gray-700">2. Choose Parameters</h3>
//                 <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Interpolation Method</label>
//                     <select
//                       value={interpolationMethod}
//                       onChange={(e) => setInterpolationMethod(e.target.value)}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="idw">Inverse Distance Weighted (IDW)</option>
//                       <option value="kriging">Kriging</option>
//                       <option value="naturalNeighbor">Natural Neighbor</option>
//                       <option value="spline">Spline</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{parameterLabel}</label>
//                     <select
//                       value={parameter}
//                       onChange={(e) => setParameter(e.target.value)}
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       {parameterOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           <div className="mt-6">
//             <div className="flex justify-center space-x-4 mb-2">
//               <button
//                 className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-32"
//                 onClick={handleSaveAs}
//               >
//                 Save As
//               </button>
//               <button
//                 className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-32"
//                 onClick={handleDisplay}
//               >
//                 Display
//               </button>
//             </div>

//             {showSaveInput && (
//               <div className="mt-2 p-3 border border-gray-300 rounded-md bg-white shadow-md mx-auto max-w-md">
//                 <h4 className="text-sm font-medium mb-2">Enter file name:</h4>
//                 <div className="flex items-center">
//                   <input
//                     type="text"
//                     value={fileName}
//                     onChange={(e) => setFileName(e.target.value)}
//                     placeholder="Enter file name"
//                     className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   <div className="flex ml-2">
//                     <button
//                       className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400 text-sm mr-1"
//                       onClick={handleSaveCancel}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 text-sm"
//                       onClick={handleSaveConfirm}
//                     >
//                       Save
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {(selectedDatasets.length > 0 || hasSavedData) && (
//             <div className="mt-6">
//               <h3 className="text-md font-semibold mb-2 text-gray-700">Available Datasets and Saved Interpolation Data</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left text-gray-700 border border-gray-300">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-2 border">Select</th>
//                       <th className="px-4 py-2 border">File Name</th>
//                       <th className="px-4 py-2 border">Dataset</th>
//                       <th className="px-4 py-2 border">Method</th>
//                       <th className="px-4 py-2 border">Parameter</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedDatasets
//                       .filter((dataset) => !selectedDataset || dataset.id !== selectedDataset.id)
//                       .map((dataset, index) => (
//                         <tr key={`selected-${index}`} className="bg-gray-50">
//                           <td className="px-4 py-2 border">
//                             <input
//                               type="checkbox"
//                               checked={selectedForProcessing.has(`dataset-${dataset.id}`)}
//                               onChange={() => handleCheckboxChange(`dataset-${dataset.id}`)}
//                             />
//                           </td>
//                           <td className="px-4 py-2 border">{dataset.name}</td>
//                           <td className="px-4 py-2 border">{dataset.name}</td>
//                           <td className="px-4 py-2 border">N/A</td>
//                           <td className="px-4 py-2 border">N/A</td>
//                         </tr>
//                       ))}
//                     {savedData.map((data, index) => (
//                       <tr key={`saved-${index}`} className="hover:bg-gray-100">
//                         <td className="px-4 py-2 border">
//                           <input
//                             type="checkbox"
//                             checked={selectedForProcessing.has(`saved-${data.fileName}`)}
//                             onChange={() => handleCheckboxChange(`saved-${data.fileName}`)}
//                           />
//                         </td>
//                         <td className="px-4 py-2 border">{data.fileName}</td>
//                         <td className="px-4 py-2 border">{data.dataset?.name || 'None'}</td>
//                         <td className="px-4 py-2 border">{data.interpolationMethod.toUpperCase()}</td>
//                         <td className="px-4 py-2 border">{data.parameter}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }