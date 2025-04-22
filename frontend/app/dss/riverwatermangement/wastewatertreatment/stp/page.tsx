"use client";

import { useEffect, useState } from 'react';
import LocationSelector from './components/LocationSelector';
import CategorySelector from './components/CategorySelector';
import Map from './components/Map';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Function to handle form submission
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // This would be replaced with actual API data
      setHeaders(['Location', 'Score', 'Rank', 'Category']);
      setResults([
        { location: 'Sample Location 1', score: 85, rank: 1, category: 'High' },
        { location: 'Sample Location 2', score: 72, rank: 2, category: 'Medium' },
        { location: 'Sample Location 3', score: 65, rank: 3, category: 'Medium' },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleRanking = (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement ranking functionality
    console.log('Ranking button clicked');
  };

  return (
    <main className="container mx-auto py-4 ml-20">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-2">Loading data...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - 2/3 width on medium screens and above */}
        <div className="md:w-2/3 space-y-4">
          {/* Location Selector Component */}
          <LocationSelector />
          
          {/* Category Selector Component */}
          <CategorySelector />
          
          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold shadow-sm"
          >
            Submit
          </button>
          
          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm mt-4">
              <div className="bg-gray-100 p-3 rounded-t-lg border-b">
                <h3 className="text-lg font-semibold">
                  <i className="fas fa-table mr-2"></i>Results
                </h3>
              </div>
              <div className="p-3">
                <div className="max-h-52 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header, index) => (
                          <th 
                            key={index}
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <td 
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {cell as React.ReactNode}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Ranking Button */}
          <button 
            onClick={handleRanking}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-sm mt-4"
          >
            Ranking
          </button>
        </div>
        
        {/* Right panel - 1/3 width on medium screens and above */}
        <div className="md:w-1/3 h-[600px]">
          <Map />
        </div>
      </div>
    </main>
  );
}
