import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchTradeIdeas as fetchTradeIdeasAPI } from '../api/tradeIdeas';

const SymbolContext = createContext();

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
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasSetDefault = useRef(false);

  // Trade Ideas State
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [loadingTradeIdeas, setLoadingTradeIdeas] = useState(true);
  const [errorTradeIdeas, setErrorTradeIdeas] = useState(null);

  // Timeframe State (default to 1d)
  const [timeframe, setTimeframe] = useState('1d');

  // Expose fetchSymbols for manual/auto refresh
  const fetchSymbols = async (opts = {}) => {
    const { silent = false } = opts;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(`/api/phasemonitor?refresh=true&timeframe=${timeframe}`);
      if (!res.ok) throw new Error(`Failed to fetch assets: ${res.status} ${res.statusText}`);
      const json = await res.json();
      setSymbolsData(json);
    } catch (err) {
      setSymbolsData([]);
      setError(err.message || 'Failed to load data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch Trade Ideas
  const fetchTradeIdeas = async (opts = {}) => {
    const { silent = false } = opts;
    try {
      if (!silent) setLoadingTradeIdeas(true);
      setErrorTradeIdeas(null);
      const json = await fetchTradeIdeasAPI();
      setTradeIdeas(Array.isArray(json) ? json : []);
    } catch (err) {
      setTradeIdeas([]);
      setErrorTradeIdeas(err.message || 'Failed to load trade ideas');
    } finally {
      if (!silent) setLoadingTradeIdeas(false);
    }
  };

  useEffect(() => {
    fetchSymbols();
    const interval = setInterval(() => fetchSymbols({ silent: true }), 60000); // silent background refresh
    return () => clearInterval(interval);
  }, [timeframe]);

  useEffect(() => {
    fetchTradeIdeas();
    const interval = setInterval(() => fetchTradeIdeas({ silent: true }), 60000); // silent background refresh
    return () => clearInterval(interval);
  }, [timeframe]);

  const normalizedSymbolsData = symbolsData.map(row => ({
    ...row,
    assetClass: normalizeClass(row.assetClass)
  }));

  return (
    <SymbolContext.Provider value={{
      symbolsData: normalizedSymbolsData,
      setSymbolsData,
      selectedSymbol,
      setSelectedSymbol,
      loading,
      error,
      fetchSymbols, // expose for manual refresh
      tradeIdeas,
      loadingTradeIdeas,
      errorTradeIdeas,
      fetchTradeIdeas, // expose for manual refresh
      timeframe,
      setTimeframe
    }}>
      {children}
    </SymbolContext.Provider>
  );
}

export function useSymbolContext() {
  return useContext(SymbolContext);
}
