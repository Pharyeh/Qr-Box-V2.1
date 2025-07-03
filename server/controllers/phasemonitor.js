// server/controllers/phasemonitor.js
import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import { getTingoCandles } from '../utils/getTingoCandles.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  calculateATR,
  calculateStructureScore,
  calculateVolatilityScore,
  calculateReflex,
  classifyBias
} from '../utils/indicators.js';
import { loadCOTSentiment } from '../utils/loadCOTSentiment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let phaseMonitorCache = null;
let phaseMonitorCacheTime = 0;
const PHASE_MONITOR_CACHE_DURATION = 30 * 1000;

function getTimeframeForAsset(assetClass) {
  return '1h';
}

function mapTimeframeToOanda(timeframe) {
  const map = { '1m': 'M1', '5m': 'M5', '15m': 'M15', '30m': 'M30', '1h': 'H1', '4h': 'H4', '1d': 'D', '1wk': 'W' };
  return map[timeframe] || 'D';
}

export async function getPhaseMonitorData(forceRefresh = false) {
  // 🚫 Proprietary phase detection logic removed for public demo.
  // This function would normally analyze market data and return phase information.
  // For demo purposes, we return static or random data.
  return [
    {
      symbol: 'EURUSD',
      phase: 'Demo Phase',
      reflex: 50,
      structure: 50,
      notes: 'Demo data only. Real logic is private.'
    },
    {
      symbol: 'GBPUSD',
      phase: 'Demo Phase',
      reflex: 50,
      structure: 50,
      notes: 'Demo data only. Real logic is private.'
    }
  ];
}

export async function scanPhaseMonitor(req, res, returnRaw = false) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    if (forceRefresh) phaseMonitorCache = null;
    const results = await getPhaseMonitorData(forceRefresh);
    if (returnRaw) return results;
    res.json(results);
  } catch (err) {
    console.error('[PhaseMonitor] Error:', err);
    if (returnRaw) return { error: err.message };
    res.status(500).json({ error: err.message });
  }
}
