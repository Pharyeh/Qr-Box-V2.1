const rateLimit = require('express-rate-limit');
const {
  getAssetSentiment,
  setAssetSentiment,
  updateAssetSentiment
} = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/assetSentiment?symbol=GLD
const getSentiment = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (symbol) {
      const data = getAssetSentiment(symbol);
      if (!data) {
        return res.status(404).json({ error: `No sentiment found for ${symbol}` });
      }
      res.json({ sentiment: data });
    } else {
      const all = getAssetSentiment();
      res.json({ sentiments: all });
    }
  } catch (err) {
    console.error('[server ERROR]: getSentiment error:', err);
    res.status(500).json({ error: 'Failed to fetch asset sentiment' });
  }
};

// POST /api/assetSentiment/update
// { symbol: "GLD", bias: "Bullish", score: 72 }
const updateSentiment = async (req, res) => {
  try {
    const { symbol, bias, score } = req.body;

    if (!symbol || !bias || typeof score !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields: symbol, bias, and score'
      });
    }

    const newSentiment = {
      symbol,
      bias,
      score: Math.min(Math.max(score, 0), 100),
      timestamp: new Date().toISOString()
    };

    updateAssetSentiment(newSentiment);
    res.status(200).json({ success: true, sentiment: newSentiment });
  } catch (err) {
    console.error('[server ERROR]: updateSentiment error:', err);
    res.status(500).json({ error: 'Failed to update sentiment' });
  }
};

// POST /api/assetSentiment/set
// { sentiments: [ {symbol, bias, score} ] }
const setSentiments = async (req, res) => {
  try {
    const { sentiments } = req.body;

    if (!Array.isArray(sentiments)) {
      return res.status(400).json({ error: 'Invalid input array' });
    }

    const parsed = sentiments.map(s => ({
      symbol: s.symbol,
      bias: s.bias,
      score: Math.min(Math.max(s.score, 0), 100),
      timestamp: new Date().toISOString()
    }));

    setAssetSentiment(parsed);
    res.status(200).json({ success: true, count: parsed.length });
  } catch (err) {
    console.error('[server ERROR]: setSentiments error:', err);
    res.status(500).json({ error: 'Failed to set asset sentiments' });
  }
};

module.exports = {
  rateLimiter,
  getSentiment,
  updateSentiment,
  setSentiments
};
