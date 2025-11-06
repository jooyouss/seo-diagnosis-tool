import React, { createContext, useContext, useState } from 'react';

export interface DiagnoseResult {
  basic?: any;
  seoElements?: any;
  techSeo?: any;
  accessibility?: any;
  report?: any;
  url?: string;
}

interface DiagnoseContextType {
  result: DiagnoseResult | null;
  setResult: (r: DiagnoseResult | null) => void;
}

const DiagnoseContext = createContext<DiagnoseContextType>({
  result: null,
  setResult: () => {},
});

export const useDiagnose = () => useContext(DiagnoseContext);

export const DiagnoseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  return (
    <DiagnoseContext.Provider value={{ result, setResult }}>
      {children}
    </DiagnoseContext.Provider>
  );
}; 