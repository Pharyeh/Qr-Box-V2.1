const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Internal placeholder — replace with model-fed logic or scanned data
let quantumMetrics = {
  confidenceDelta: 8.4,
  correlation: 0.62,
  shiftProbability: 76,
  volatilitySpread: "2.5x sector baseline",
  lastUpdated: new Date().toISOString()
};

// GET /api/quantumMetric
const getQuantumMetrics = async (req, res) => {
  try {
    res.json(quantumMetrics);
  } catch (err) {
    console.error('[server ERROR]: quantum metrics fetch failed:', err);
    res.status(500).json({ error: 'Failed to load quantum metrics' });
  }
};

// POST /api/quantumMetric/update
// { confidenceDelta, correlation, shiftProbability, volatilitySpread }
const updateQuantumMetrics = async (req, res) => {
  try {
    const { confidenceDelta, correlation, shiftProbability, volatilitySpread } = req.body;

    if (
      typeof confidenceDelta !== 'number' ||
      typeof correlation !== 'number' ||
      typeof shiftProbability !== 'number' ||
      typeof volatilitySpread !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    quantumMetrics = {
      confidenceDelta,
      correlation,
      shiftProbability,
      volatilitySpread,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({ success: true, metrics: quantumMetrics });
  } catch (err) {
    console.error('[server ERROR]: quantum metric update failed:', err);
    res.status(500).json({ error: 'Failed to update quantum metrics' });
  }
};

module.exports = {
  rateLimiter,
  getQuantumMetrics,
  updateQuantumMetrics
};
