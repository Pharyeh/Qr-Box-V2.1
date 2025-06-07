import React, { createContext, useContext, useState } from 'react';

const SymbolContext = createContext();

export function SymbolProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  return (
    <SymbolContext.Provider value={{ selectedSymbol, setSelectedSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
}

export function useSymbol() {
  return useContext(SymbolContext);
} 