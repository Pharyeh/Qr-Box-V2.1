const rateLimit = require('express-rate-limit');
const axios = require('axios'); // Optional for live external data

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// In-memory mock cache — replace with DB or API fetch
const equityMap = {
  SPX: { price: 4510.32, volume: 3800000, change: 0.45, updated: new Date().toISOString() },
  GLD: { price: 1962.55, volume: 920000, change: -0.22, updated: new Date().toISOString() },
  BTC: { price: 65200, volume: 210000, change: 1.4, updated: new Date().toISOString() }
};

// GET /api/equity?symbol=SPX
const getEquityData = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol query parameter is required' });
    }

    const equity = equityMap[symbol.toUpperCase()];
    if (!equity) {
      return res.status(404).json({ error: `Equity ${symbol} not found` });
    }

    res.json({ symbol: symbol.toUpperCase(), ...equity });
  } catch (err) {
    console.error('[server ERROR]: equity fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch equity data' });
  }
};

// POST /api/equity/update
// { symbol: "SPX", price: 4522.15, volume: 4000000, change: 0.6 }
const updateEquityData = async (req, res) => {
  try {
    const { symbol, price, volume, change } = req.body;

    if (!symbol || typeof price !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid payload' });
    }

    equityMap[symbol.toUpperCase()] = {
      price,
      volume: volume ?? null,
      change: change ?? null,
      updated: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: equityMap[symbol.toUpperCase()] });
  } catch (err) {
    console.error('[server ERROR]: equity update failed:', err);
    res.status(500).json({ error: 'Failed to update equity data' });
  }
};

module.exports = {
  rateLimiter,
  getEquityData,
  updateEquityData
};
