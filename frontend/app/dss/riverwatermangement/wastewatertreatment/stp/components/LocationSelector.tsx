
"use client";

import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface LocationItem {
  id: number;
  name: string;
}

interface District extends LocationItem {
  stateId: number;
}

interface SubDistrict extends LocationItem {
  districtId: number;
}

interface Village extends LocationItem {
  subDistrictId: number;
  population: number;
}

interface LocationSelectorProps {
  onConfirm?: (selectedData: {
    villages: Village[];
    subDistricts: SubDistrict[];
    totalPopulation: number;
  }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onConfirm }) => {
  // States for dropdown data
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  
  // Sample tiers data (static as in original)
  const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5', 'Tier 6'];
  const urbanDistricts = ['Urban District 1', 'Urban District 2', 'Urban District 3'];
  const urbanSubDistricts = ['Urban Sub-District 1', 'Urban Sub-District 2'];
  const towns = ['Town 1', 'Town 2', 'Town 3'];
  
  // Selected values
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<string[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  
  // State for dropdowns visibility
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isSubDistrictDropdownOpen, setIsSubDistrictDropdownOpen] = useState(false);
  const [isVillageDropdownOpen, setIsVillageDropdownOpen] = useState(false);
  const [isUrbanDistrictDropdownOpen, setIsUrbanDistrictDropdownOpen] = useState(false);
  const [isUrbanSubDistrictDropdownOpen, setIsUrbanSubDistrictDropdownOpen] = useState(false);
  const [isTownDropdownOpen, setIsTownDropdownOpen] = useState(false);
  
  // New state to track if selections are locked after confirmation
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  
  // District search filter
  const [districtSearchFilter, setDistrictSearchFilter] = useState<string>('');
  const [subDistrictSearchFilter, setSubDistrictSearchFilter] = useState<string>('');
  const [villageSearchFilter, setVillageSearchFilter] = useState<string>('');

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:9000/api/basic/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        const stateData: LocationItem[] = data.map((state: any) => ({
          id: state.state_code,
          name: state.state_name
        }));
        
        setStates(stateData);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async (): Promise<void> => {
        console.log('Fetching districts for state:', selectedState);
        try {
          const response = await fetch('http://localhost:9000/api/basic/district/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ state_code: selectedState }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const districtData: LocationItem[] = data.map((district: any) => ({
            id: district.district_code,
            name: district.district_name
          }));
          const mappedDistricts: District[] = districtData.map(district => ({ 
            ...district, 
            stateId: parseInt(selectedState) 
          }));
          
          setDistricts(mappedDistricts);
          setSelectedDistricts([]);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistricts([]);
    }
    // Reset dependent dropdowns
    setSubDistricts([]);
    setSelectedSubDistricts([]);
    setVillages([]);
    setSelectedVillages([]);
    // Reset total population when state changes
    setTotalPopulation(0);
  }, [selectedState]);

  // Fetch sub-districts when districts change
  useEffect(() => {
    if (selectedDistricts.length > 0) {
      const fetchSubDistricts = async (): Promise<void> => {
        try {
          const response = await fetch('http://localhost:9000/api/basic/subdistrict/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ district_code: selectedDistricts }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const subDistrictData: LocationItem[] = data.map((subDistrict: any) => ({
            id: subDistrict.subdistrict_code,
            name: subDistrict.subdistrict_name
          }));
          
          // Assuming each subdistrict is associated with a district
          const mappedSubDistricts: SubDistrict[] = subDistrictData.map(subdistrict => ({ 
            ...subdistrict, 
            districtId: parseInt(selectedDistricts[0]) // This is simplified and might need adjustment
          }));

          setSubDistricts(mappedSubDistricts);
          setSelectedSubDistricts([]);
        } catch (error) {
          console.error('Error fetching sub-districts:', error);
        }
      };
      fetchSubDistricts();
    } else {
      setSubDistricts([]);
      setSelectedSubDistricts([]);
    }
    // Reset dependent dropdowns
    setVillages([]);
    setSelectedVillages([]);
    // Reset total population when districts change
    setTotalPopulation(0);
  }, [selectedDistricts]);

  // Fetch villages when sub-districts change
  useEffect(() => {
    if (selectedSubDistricts.length > 0) {
      const fetchVillages = async (): Promise<void> => {
        try{
          const response = await fetch('http://localhost:9000/api/basic/village/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ subdistrict_code: selectedSubDistricts }),
            }
          );
          const data = await response.json();
          console.log('API response data:', data);
          const villageData: Village[] = data.map((village: any) => ({
            id: village.village_code,
            name: village.village_name,
            subDistrictId: parseInt(selectedSubDistricts[0]),
            population: village.population_2011 || 0
          }));
          setVillages(villageData);
          setSelectedVillages([]);
        } catch (error) {
          console.error('Error fetching villages:', error);
          setVillages([]);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
      setSelectedVillages([]);
    }
    // Reset total population when sub-districts change
    setTotalPopulation(0);
  }, [selectedSubDistricts]);

  // Calculate total population when selected villages change
  useEffect(() => {
    if (selectedVillages.length > 0) {
      // Filter to get only selected villages
      const selectedVillageObjects = villages.filter(village => 
        selectedVillages.includes(village.id.toString())
      );
      
      // Calculate total population
      const total = selectedVillageObjects.reduce(
        (sum, village) => sum + village.population, 
        0
      );
      
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [selectedVillages, villages]);

  // Handle state selection
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectionsLocked) {
      setSelectedState(e.target.value);
    }
  };

  // Handle district selection/deselection
  const toggleDistrictSelection = (districtId: string): void => {
    if (selectionsLocked) return;
    
    setSelectedDistricts(prevSelection => {
      if (prevSelection.includes(districtId)) {
        return prevSelection.filter(id => id !== districtId);
      } else {
        return [...prevSelection, districtId];
      }
    });
  };

  // Handle sub-district selection/deselection
  const toggleSubDistrictSelection = (subDistrictId: string): void => {
    if (selectionsLocked) return;
    
    setSelectedSubDistricts(prevSelection => {
      if (prevSelection.includes(subDistrictId)) {
        return prevSelection.filter(id => id !== subDistrictId);
      } else {
        return [...prevSelection, subDistrictId];
      }
    });
  };

  // Handle village selection/deselection
  const toggleVillageSelection = (villageId: string): void => {
    if (selectionsLocked) return;
    
    setSelectedVillages(prevSelection => {
      if (prevSelection.includes(villageId)) {
        return prevSelection.filter(id => id !== villageId);
      } else {
        return [...prevSelection, villageId];
      }
    });
  };

  // Handle form reset
  const handleReset = (): void => {
    setSelectedState('');
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
  };

  // Handle confirm - lock the selections and pass data to parent
  const handleConfirm = (): void => {
    if (selectedVillages.length > 0) {
      setSelectionsLocked(true);
      
      // Get the full objects for selected villages and subdistricts
      const selectedVillageObjects = villages.filter(village => 
        selectedVillages.includes(village.id.toString())
      );
      
      const selectedSubDistrictObjects = subDistricts.filter(subDistrict => 
        selectedSubDistricts.includes(subDistrict.id.toString())
      );
      
      // Pass the data to parent component if callback exists
      if (onConfirm) {
        onConfirm({
          villages: selectedVillageObjects,
          subDistricts: selectedSubDistrictObjects,
          totalPopulation: totalPopulation
        });
      }
    }
  };

  // Filter districts based on search input
  const filteredDistricts = districts.filter(district => 
    district.name.toLowerCase().includes(districtSearchFilter.toLowerCase())
  );

  // Filter sub-districts based on search input
  const filteredSubDistricts = subDistricts.filter(subDistrict => 
    subDistrict.name.toLowerCase().includes(subDistrictSearchFilter.toLowerCase())
  );

  // Filter villages based on search input
  const filteredVillages = villages.filter(village => 
    village.name.toLowerCase().includes(villageSearchFilter.toLowerCase())
  );
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="bg-blue-600 text-white p-3 rounded-t-lg w-auto">
        <h3 className="text-lg font-semibold">
          <i className="fas fa-map-marker-alt mr-2 h-[30px]"></i>Site Priority and Suitability
        </h3>
      </div>
      <div className="p-4">
        {/* Rural Section - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* State Dropdown */}
          <div>
            <label htmlFor="state-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              State:
            </label>
            <select
              id="state-dropdown"
              className="block w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedState}
              onChange={handleStateChange}
              disabled={selectionsLocked}
            >
              <option value="">--Choose a State--</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label htmlFor="district-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              District:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={!selectedState || selectionsLocked}
              >
                {selectedDistricts.length > 0 
                  ? `${selectedDistricts.length} District(s) Selected` 
                  : '--Choose Districts--'}
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search districts..."
                      value={districtSearchFilter}
                      onChange={(e) => setDistrictSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1">
                    {filteredDistricts.map((district) => (
                      <div key={district.id} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          id={`district-${district.id}`}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedDistricts.includes(district.id.toString())}
                          onChange={() => toggleDistrictSelection(district.id.toString())}
                          disabled={selectionsLocked}
                        />
                        <label htmlFor={`district-${district.id}`} className="ml-2 block text-sm text-gray-900">
                          {district.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-District Dropdown */}
          <div>
            <label htmlFor="sub-district-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              Sub-District:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubDistrictDropdownOpen(!isSubDistrictDropdownOpen)}
                className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={selectedDistricts.length === 0 || selectionsLocked}
              >
                {selectedSubDistricts.length > 0 
                  ? `${selectedSubDistricts.length} Sub-District(s) Selected` 
                  : '--Choose Sub-Districts--'}
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isSubDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search sub-districts..."
                      value={subDistrictSearchFilter}
                      onChange={(e) => setSubDistrictSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1">
                    {filteredSubDistricts.map((subDistrict) => (
                      <div key={subDistrict.id} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          id={`sub-district-${subDistrict.id}`}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedSubDistricts.includes(subDistrict.id.toString())}
                          onChange={() => toggleSubDistrictSelection(subDistrict.id.toString())}
                          disabled={selectionsLocked}
                        />
                        <label htmlFor={`sub-district-${subDistrict.id}`} className="ml-2 block text-sm text-gray-900">
                          {subDistrict.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Village Dropdown */}
          <div>
            <label htmlFor="village-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              Village:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVillageDropdownOpen(!isVillageDropdownOpen)}
                className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={selectedSubDistricts.length === 0 || selectionsLocked}
              >
                {selectedVillages.length > 0 
                  ? `${selectedVillages.length} Village(s) Selected` 
                  : '--Choose Villages--'}
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isVillageDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search villages..."
                      value={villageSearchFilter}
                      onChange={(e) => setVillageSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1">
                    {filteredVillages.map((village) => (
                      <div key={village.id} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          id={`village-${village.id}`}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedVillages.includes(village.id.toString())}
                          onChange={() => toggleVillageSelection(village.id.toString())}
                          disabled={selectionsLocked}
                        />
                        <label htmlFor={`village-${village.id}`} className="ml-2 block text-sm text-gray-900">
                          {village.name} (Pop: {village.population.toLocaleString()})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display selected values and population */}
        {/* {selectedVillages.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-md mb-4 text-sm">
            <p><span className="font-medium">Total Population:</span> {totalPopulation.toLocaleString()}</p>
            {selectionsLocked && (
              <p className="mt-1 text-green-600 font-medium">Selections confirmed and locked</p>
            )}
          </div>
        )} */}

        {/* Action buttons */}
        <div className="flex space-x-4 mb-4">
          <button 
            className={`${
              selectedVillages.length > 0 && !selectionsLocked 
                ? 'bg-blue-500 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            onClick={handleConfirm}
            disabled={selectedVillages.length === 0 || selectionsLocked}
          >
            Confirm
          </button>
          <button 
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Urban Section - Second Row (Keeping original structure) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Tier Dropdown */}
          <div>
            <label htmlFor="tier-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              Tier:
            </label>
            <select
              id="tier-dropdown"
              className="block w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">--Choose a Tier--</option>
              {tiers.map((tier, index) => (
                <option key={index} value={tier}>{tier}</option>
              ))}
            </select>
          </div>

          {/* Urban State Dropdown */}
          <div>
            <label htmlFor="urban-state-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              State:
            </label>
            <select
              id="urban-state-dropdown"
              className="block w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">--Choose a State--</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>

          {/* Urban District Dropdown */}
          <div>
            <label htmlFor="district-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              District:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={!selectedState || selectionsLocked}
              >
                {selectedDistricts.length > 0 
                  ? `${selectedDistricts.length} District(s) Selected` 
                  : '--Choose Districts--'}
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search districts..."
                      value={districtSearchFilter}
                      onChange={(e) => setDistrictSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1">
                    {filteredDistricts.map((district) => (
                      <div key={district.id} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          id={`district-${district.id}`}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedDistricts.includes(district.id.toString())}
                          onChange={() => toggleDistrictSelection(district.id.toString())}
                          disabled={selectionsLocked}
                        />
                        <label htmlFor={`district-${district.id}`} className="ml-2 block text-sm text-gray-900">
                          {district.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Urban Sub-District Dropdown */}
          <div>
            <label htmlFor="urban-sub-district-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
              Sub-District:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUrbanSubDistrictDropdownOpen(!isUrbanSubDistrictDropdownOpen)}
                className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                --Choose Sub-Districts--
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isUrbanSubDistrictDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search sub-districts..."
                    />
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1">
                    {urbanSubDistricts.map((subDistrict, index) => (
                      <div key={index} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          id={`urban-sub-district-${index}`}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`urban-sub-district-${index}`} className="ml-2 block text-sm text-gray-900">
                          {subDistrict}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

       {/* Town Dropdown */}
      <div>
            <label htmlFor="town-dropdown" className="block text-sm font-medium text-gray-700 mb-1">
               Town:
            </label>
            <div className="relative">
              <button
                type="button"
               onClick={() => setIsTownDropdownOpen(!isTownDropdownOpen)}
               className="flex justify-between items-center w-full rounded-md border border-blue-500 py-1.5 px-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                --Choose Towns--
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
              
               {isTownDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                <div className="sticky top-0 z-10 bg-white p-2">
                     <input
                       type="text"
                       className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                       placeholder="Search towns..."
                     />
                   </div>
                   <div className="border-t border-gray-200"></div>
                   <div className="py-1">
                     {towns.map((town, index) => (
                       <div key={index} className="flex items-center px-3 py-1.5 hover:bg-gray-100">
                         <input
                           type="checkbox"
                           id={`town-${index}`}
                           className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                         />
                         <label htmlFor={`town-${index}`} className="ml-2 block text-sm text-gray-900">
                           {town}
                         </label>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default LocationSelector;