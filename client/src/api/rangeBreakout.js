import API_BASE from '../config/api';

export async function fetchRangeBreakouts() {
  const res = await fetch(`${API_BASE}/api/rangebreakout`);
  if (!res.ok) throw new Error('Failed to fetch range breakout data');
  return await res.json();
} 