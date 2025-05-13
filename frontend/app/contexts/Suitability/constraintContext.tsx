'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConstraintFactor {
  id: string;
  selected: boolean;
  category: string;
  fileName: string;
}

interface ConstraintFactorsContextType {
  factors: ConstraintFactor[];
  loading: boolean;
  updateFactors: (newFactors: ConstraintFactor[]) => void;
}

const ConstraintFactorsContext = createContext<ConstraintFactorsContextType | undefined>(undefined);

export const ConstraintFactorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [factors, setFactors] = useState<ConstraintFactor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFactors = async () => {
      setLoading(true);
      try {
        console.log('Fetching constraint factors...');
        const response = await fetch('http://localhost:7000/api/stp_sutability/get_sutability_by_category?category=constraint&all_data=true');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        
        const formattedData: ConstraintFactor[] = data.map((item: any) => ({
          id: item.id.toString(),
          selected: false,
          category: item.category || 'General',
          fileName: item.fileName || item.file_name || `${item.name}.pdf`
        }));
        
        console.log('Formatted Constraint Factors:', formattedData);
        setFactors(formattedData);
      } catch (error) {
        console.error('Error fetching constraint factors:', error);
        setFactors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFactors();
  }, []);

  const updateFactors = (newFactors: ConstraintFactor[]) => {
    console.log('Updating constraint factors:', newFactors);
    setFactors(newFactors);
    
    // Log selected factors with IDs
    const selectedFactors = newFactors.filter(factor => factor.selected);
    if (selectedFactors.length > 0) {
      console.log('Currently selected constraint factors with IDs:', 
        selectedFactors.map(f => ({ id: f.id, fileName: f.fileName }))
      );
    }
  };

  return (
    <ConstraintFactorsContext.Provider value={{ factors, loading, updateFactors }}>
      {children}
    </ConstraintFactorsContext.Provider>
  );
};

export const useConstraintFactors = () => {
  const context = useContext(ConstraintFactorsContext);
  if (!context) {
    throw new Error('useConstraintFactors must be used within a ConstraintFactorsProvider');
  }
  return context;
};