import React, { createContext } from "react";

interface PortfolioContextType {
  portfolio: any;
  loadingPrices: Record<string, boolean>;
  addTransaction: (type: string, assetId: string, data: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updatePortfolioName: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);
