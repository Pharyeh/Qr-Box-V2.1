import { createContext, useState } from 'react';

export const AssetFilterContext = createContext();

export function AssetFilterProvider({ children }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  return (
    <AssetFilterContext.Provider value={{ selectedAssets, setSelectedAssets }}>
      {children}
    </AssetFilterContext.Provider>
  );
}
