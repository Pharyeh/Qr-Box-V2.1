import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths relative to the utils directory
const PHASE_HISTORY_PATH = path.join(__dirname, '..', 'phase-history.json');
const PHASE_HISTORY_TRADEIDEAS_PATH = path.join(__dirname, '..', 'phase-history-tradeideas.json');
const PHASE_HISTORY_GPTTHESIS_PATH = path.join(__dirname, '..', 'phase-history-gptthesis.json');
const PHASE_HISTORY_DATA_PATH = path.join(__dirname, '..', 'data', 'phase-history.json');
const PHASE_CACHE_PATH = path.join(__dirname, '..', 'phase-cache.json');

let phaseHistory = {};

// Load existing history on startup
export function loadPhaseHistory() {
  try {
    // Load main phase history
    if (fs.existsSync(PHASE_HISTORY_PATH)) {
      const data = fs.readFileSync(PHASE_HISTORY_PATH, 'utf-8');
      phaseHistory = JSON.parse(data);
    }

    // Merge trade ideas history
    if (fs.existsSync(PHASE_HISTORY_TRADEIDEAS_PATH)) {
      const data = fs.readFileSync(PHASE_HISTORY_TRADEIDEAS_PATH, 'utf-8');
      const tradeIdeas = JSON.parse(data);
      Object.assign(phaseHistory, tradeIdeas);
    }

    // Merge GPT thesis history
    if (fs.existsSync(PHASE_HISTORY_GPTTHESIS_PATH)) {
      const data = fs.readFileSync(PHASE_HISTORY_GPTTHESIS_PATH, 'utf-8');
      const gptThesis = JSON.parse(data);
      Object.assign(phaseHistory, gptThesis);
    }

    // Merge data phase history
    if (fs.existsSync(PHASE_HISTORY_DATA_PATH)) {
      const data = fs.readFileSync(PHASE_HISTORY_DATA_PATH, 'utf-8');
      const dataPhase = JSON.parse(data);
      // Convert enteredAt to timestamp for consistency
      Object.entries(dataPhase).forEach(([symbol, info]) => {
        if (info.enteredAt) {
          phaseHistory[symbol] = {
            phase: info.phase,
            timestamp: info.enteredAt
          };
        }
      });
    }

    console.log(`[PhaseHistory] Loaded ${Object.keys(phaseHistory).length} entries`);
  } catch (err) {
    console.error('[PhaseHistory] Failed to load:', err);
    phaseHistory = {};
  }
}

// Save new data to disk after every update
function savePhaseHistory() {
  try {
    fs.writeFileSync(PHASE_HISTORY_PATH, JSON.stringify(phaseHistory, null, 2));
  } catch (err) {
    console.error('[PhaseHistory] Failed to save:', err);
  }
}

// Retrieve current phase info
export function getPhaseInfo(symbol, currentPhase) {
  const info = phaseHistory[symbol];
  if (!info) {
    return {
      durationInPhase: 0,
      isNew: true
    };
  }
  
  const now = Date.now();
  const timestamp = info.timestamp || info.enteredAt;
  const durationInPhase = timestamp ? Math.floor((now - timestamp) / (1000 * 60 * 60)) : 0;
  
  return {
    ...info,
    durationInPhase,
    isNew: info.phase !== currentPhase
  };
}

// Update + persist phase info
export function updatePhaseInfo(symbol, phase) {
  const now = Date.now();
  if (!phaseHistory[symbol] || phaseHistory[symbol].phase !== phase) {
    // Append to timeline
    if (!phaseHistory[symbol]) phaseHistory[symbol] = {};
    if (!Array.isArray(phaseHistory[symbol].timeline)) phaseHistory[symbol].timeline = [];
    phaseHistory[symbol].timeline.push({ phase, timestamp: now });
    // Update current phase and timestamp
    phaseHistory[symbol].phase = phase;
    phaseHistory[symbol].timestamp = now;
    phaseHistory[symbol].lastUpdate = now;
    savePhaseHistory();
    console.log(`[PhaseHistory] Updated ${symbol} → ${phase}`);
  }
}

// Add phaseCache persistence
export function loadPhaseCache() {
  try {
    if (fs.existsSync(PHASE_CACHE_PATH)) {
      const data = fs.readFileSync(PHASE_CACHE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[PhaseCache] Failed to load:', err);
  }
  return {};
}

export function savePhaseCache(cache) {
  try {
    fs.writeFileSync(PHASE_CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error('[PhaseCache] Failed to save:', err);
  }
}
