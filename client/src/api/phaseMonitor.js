import API_BASE from '../config/api';

export async function fetchPhaseMonitor() {
  const res = await fetch(`${API_BASE}/api/phasemonitor?timeframe=1d`);
  if (!res.ok) throw new Error('Failed to fetch phase monitor data');
  return await res.json();
} 