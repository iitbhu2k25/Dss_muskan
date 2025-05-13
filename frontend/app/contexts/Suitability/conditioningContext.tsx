'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConditioningFactor {
  id: string;
  selected: boolean;
  weight: number;
  category: string;
  fileName: string; 
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
        console.log('Fetching conditioning factors...');
        const response = await fetch('http://localhost:7000/api/stp_sutability/get_sutability_by_category?category=condition&all_data=true');
        const data = await response.json();
        
        console.log('API Response Data:', data);
        
        const formattedData: ConditioningFactor[] = data.map((item: any) => ({
          id: item.id.toString(),
          selected: false,
          weight: item.weight || 1,
          category: item.category || 'General',
          fileName: item.fileName || item.file_name || `${item.name}.pdf`
        }));
        
        console.log('Formatted Conditioning Factors:', formattedData);
        
        setFactors(formattedData);
      } catch (error) {
        console.error('Error fetching conditioning factors:', error);
        setFactors([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFactors();
  }, []);

  const updateFactors = (newFactors: ConditioningFactor[]) => {
    console.log('Updating factors:', newFactors);
    setFactors(newFactors);
    
    // Log selected factors with ID and weight
    const selectedFactors = newFactors.filter(factor => factor.selected);
    if (selectedFactors.length > 0) {
      console.log('Currently selected factors with IDs and weights:', 
        selectedFactors.map(f => ({ id: f.id, fileName: f.fileName, weight: f.weight }))
      );
    }
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