import React, { createContext, useContext, useState, useEffect } from 'react';

const SymbolContext = createContext();

// Helper to normalize assetClass for consistent filtering
function normalizeClass(cls) {
  if (!cls) return 'Default';
  const clean = cls.trim().toLowerCase();
  if (clean === 'forex') return 'Forex';
  if (clean === 'commodities') return 'Commodities';
  if (clean === 'crypto') return 'Crypto';
  if (clean === 'indices') return 'Indices';
  if (clean === 'interest rates') return 'Interest Rates';
  if (clean === 'stocks') return 'Stocks';
  return 'Default';
}

export function SymbolProvider({ children }) {
  const [symbolsData, setSymbolsData] = useState([]);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isInitial = true;
    async function fetchData() {
      if (isInitial) setLoading(true);
      try {
        setError(null);
        const [symbolsRes, ideasRes] = await Promise.all([
          fetch('/api/phasemonitor'),
          fetch('/api/tradeideas'),
        ]);
        if (!symbolsRes.ok) throw new Error(`Failed to fetch assets: ${symbolsRes.status} ${symbolsRes.statusText}`);
        if (!ideasRes.ok) throw new Error(`Failed to fetch trade ideas: ${ideasRes.status} ${ideasRes.statusText}`);
        const symbolsJson = await symbolsRes.json();
        const ideasJson = await ideasRes.json();
        setSymbolsData(symbolsJson);
        setTradeIdeas(ideasJson);
      } catch (err) {
        setSymbolsData([]);
        setTradeIdeas([]);
        setError(err.message || 'Failed to load data');
      }
      if (isInitial) setLoading(false);
      isInitial = false;
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Normalize assetClass for consistent filtering
  const normalizedSymbolsData = symbolsData ? symbolsData.map(row => ({ ...row, assetClass: normalizeClass(row.assetClass) })) : [];
  const normalizedTradeIdeas = tradeIdeas ? tradeIdeas.map(row => ({ ...row, assetClass: normalizeClass(row.assetClass) })) : [];

  return (
    <SymbolContext.Provider value={{
      symbolsData: normalizedSymbolsData,
      tradeIdeas: normalizedTradeIdeas,
      selectedSymbol,
      setSelectedSymbol,
      loading,
      error
    }}>
      {children}
    </SymbolContext.Provider>
  );
}

export function useSymbolContext() {
  return useContext(SymbolContext);
} 