'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConstraintFactor {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  category: string;
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
        // Fetch constraint factors from API
        const response = await fetch('http://localhost:7000/api/stp/get_constraint_factors');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match your ConstraintFactor interface if needed
        const formattedData: ConstraintFactor[] = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          selected: false, // Default to not selected
          category: item.category || 'General'
        }));
        
        setFactors(formattedData);
      } catch (error) {
        console.error('Error fetching constraint factors:', error);
        // Set to empty array in case of error
        setFactors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFactors();
  }, []);

  const updateFactors = (newFactors: ConstraintFactor[]) => {
    setFactors(newFactors);
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