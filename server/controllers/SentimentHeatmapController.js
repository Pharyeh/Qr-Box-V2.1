const rateLimit = require('express-rate-limit');

// In-memory heatmap sentiment scores (can be updated via API)
const sentimentScores = [
  {
    symbol: 'SPX',
    sentiment: 'Bullish',
    confidence: 85,
    lastUpdated: new Date().toISOString(),
    sources: ['Twitter', 'Volume', 'News'],
    sentimentScore: 0.78
  },
  {
    symbol: 'GLD',
    sentiment: 'Neutral',
    confidence: 66,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    sources: ['News'],
    sentimentScore: 0.10
  },
  {
    symbol: 'BTC',
    sentiment: 'Bearish',
    confidence: 72,
    lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    sources: ['Reddit', 'Volume'],
    sentimentScore: -0.65
  }
];

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/heatmap
const getHeatmapData = async (req, res) => {
  try {
    res.json({ assets: sentimentScores });
  } catch (err) {
    console.error('[server ERROR]: heatmap fetch failed:', err);
    res.status(500).json({ error: 'Failed to retrieve sentiment heatmap' });
  }
};

module.exports = {
  rateLimiter,
  getHeatmapData
};
