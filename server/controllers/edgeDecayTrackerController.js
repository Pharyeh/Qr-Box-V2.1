const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// In-memory list of decaying trade signals
const decayingSignals = [];

// Utility to apply basic decay logic over time
function applySignalDecay(signalList) {
  const now = Date.now();
  return signalList.map((sig) => {
    const minutesOld = (now - new Date(sig.lastSeen).getTime()) / (1000 * 60);
    const decayRate = 2; // percent per minute
    const decayPercent = Math.min(100, Math.round(minutesOld * decayRate));
    return {
      ...sig,
      decayPercent
    };
  });
}

// GET /api/edgeDecayTracker
const getDecay = async (req, res) => {
  try {
    const result = applySignalDecay(decayingSignals);
    res.json({ decay: result });
  } catch (err) {
    console.error('[server ERROR]: edgeDecayTracker get error:', err);
    res.status(500).json({ error: 'Failed to fetch decay signals' });
  }
};

// POST /api/edgeDecayTracker/add
// {
//   "symbol": "SPX",
//   "phase": "2",
//   "strength": 80,
//   "lastSeen": "2024-05-20T14:30:00Z"
// }
const addSignal = async (req, res) => {
  try {
    const { symbol, phase, strength, lastSeen } = req.body;

    if (!symbol || !phase || typeof strength !== 'number' || !lastSeen) {
      return res.status(400).json({ error: 'Invalid signal payload' });
    }

    const newSignal = { symbol, phase, strength, lastSeen };
    decayingSignals.push(newSignal);
    res.status(201).json({ success: true, signal: newSignal });
  } catch (err) {
    console.error('[server ERROR]: edgeDecayTracker add error:', err);
    res.status(500).json({ error: 'Failed to add decay signal' });
  }
};

// POST /api/edgeDecayTracker/reset
const resetSignals = async (req, res) => {
  decayingSignals.length = 0;
  res.status(200).json({ success: true, cleared: true });
};

module.exports = {
  rateLimiter,
  getDecay,
  addSignal,
  resetSignals
};
