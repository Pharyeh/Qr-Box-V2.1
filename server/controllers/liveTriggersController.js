const rateLimit = require('express-rate-limit');
const { getLiveTriggers, setLiveTriggers } = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/liveTriggers
const getTriggers = async (req, res) => {
  try {
    const triggers = getLiveTriggers();
    res.json({ triggers });
  } catch (err) {
    console.error('[server ERROR]: liveTriggers get error:', err);
    res.status(500).json({ error: 'Failed to fetch live triggers' });
  }
};

// POST /api/liveTriggers/set
// { triggers: [ { symbol, type, confidence, reason, detectedAt } ] }
const updateTriggers = async (req, res) => {
  try {
    const { triggers } = req.body;

    if (!Array.isArray(triggers)) {
      return res.status(400).json({ error: 'Invalid trigger payload' });
    }

    const formatted = triggers.map(t => ({
      symbol: t.symbol,
      type: t.type,
      confidence: t.confidence,
      reason: t.reason ?? 'N/A',
      detectedAt: t.detectedAt ?? new Date().toISOString()
    }));

    setLiveTriggers(formatted);
    res.status(200).json({ success: true, count: formatted.length });
  } catch (err) {
    console.error('[server ERROR]: liveTriggers update error:', err);
    res.status(500).json({ error: 'Failed to update live triggers' });
  }
};

module.exports = {
  rateLimiter,
  getTriggers,
  updateTriggers
};
