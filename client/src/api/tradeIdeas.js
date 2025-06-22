import API_BASE from '../config/api';

export async function fetchTradeIdeas() {
  const res = await fetch(`${API_BASE}/api/tradeideas?timeframe=1d`);
  if (!res.ok) throw new Error('Failed to fetch trade ideas data');
  return await res.json();
} 