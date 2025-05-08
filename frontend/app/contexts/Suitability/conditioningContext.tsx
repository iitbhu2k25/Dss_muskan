'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConditioningFactor {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  weight: number;
  category: string;
}

interface ConditioningFactorsContextType {
  factors: ConditioningFactor[];
  loading: boolean;
  updateFactors: (newFactors: ConditioningFactor[]) => void;
}

const ConditioningFactorsContext = createContext<ConditioningFactorsContextType | undefined>(undefined);

export const ConditioningFactorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [factors, setFactors] = useState<ConditioningFactor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFactors = async () => {
      setLoading(true);
      try {
        // Uncomment and update with your actual API endpoint
        const response = await fetch('http://localhost:7000/api/stp/get_conditioning_factors');
        const data = await response.json();
        
        // Transform the data to match your ConditioningFactor interface if needed
        const formattedData: ConditioningFactor[] = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          selected: false, // Default to not selected
          weight: item.weight || 1, // Default weight
          category: item.category || 'General'
        }));
        
        setFactors(formattedData);
      } catch (error) {
        console.error('Error fetching conditioning factors:', error);
        // Set to empty array in case of error
        setFactors([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFactors();
  }, []);

   

  const updateFactors = (newFactors: ConditioningFactor[]) => {
    setFactors(newFactors);
  };

  return (
    <ConditioningFactorsContext.Provider value={{ factors, loading, updateFactors }}>
      {children}
    </ConditioningFactorsContext.Provider>
  );
};

export const useConditioningFactors = () => {
  const context = useContext(ConditioningFactorsContext);
  if (!context) {
    throw new Error('useConditioningFactors must be used within a ConditioningFactorsProvider');
  }
  return context;
};