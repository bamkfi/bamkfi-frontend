'use client';

import { createContext, useContext } from 'react';

export interface DataContextType {
  bamkRuneData?: {
    curPrice: number;
    changePrice: number;
    capUSD: string;
  };
  bamkRune2Data?: {
    floorUnitPrice: {
      formatted: string
    }
  };
  nusdInfoData?: { minted: string };
  nusdRuneData?: { amount: string };
  btcPriceData?: { bitcoin: { usd: number } };
  susdeBackingUSDValue?: number;
  apy?: number;
  bestHeightData?: { height: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children, data }: { children: React.ReactNode; data: DataContextType }) => (
  <DataContext.Provider value={data}>{children}</DataContext.Provider>
);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
