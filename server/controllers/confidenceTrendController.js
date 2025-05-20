const rateLimit = require('express-rate-limit');

// Internal in-memory store
const trendHistory = [];

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/confidenceTrend
const getConfidenceTrend = async (req, res) => {
  try {
    res.json({ trend: trendHistory });
  } catch (err) {
    console.error('[server ERROR]: confidence trend fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch confidence trend' });
  }
};

// POST /api/confidenceTrend/update
// { date: "2024-05-20T14:00:00Z", confidence: 82 }
const addConfidencePoint = async (req, res) => {
  try {
    const { date, confidence } = req.body;

    if (!date || typeof confidence !== 'number') {
      return res.status(400).json({ error: 'Missing date or confidence' });
    }

    trendHistory.push({ date, confidence });
    res.status(201).json({ success: true, point: { date, confidence } });
  } catch (err) {
    console.error('[server ERROR]: trend update error:', err);
    res.status(500).json({ error: 'Failed to update trend data' });
  }
};

// POST /api/confidenceTrend/reset
const resetTrend = (req, res) => {
  trendHistory.length = 0;
  res.status(200).json({ success: true, cleared: true });
};

module.exports = {
  rateLimiter,
  getConfidenceTrend,
  addConfidencePoint,
  resetTrend
};
