const rateLimit = require('express-rate-limit');
const { getState } = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/PhaseWatchlist
const getPhaseWatchlist = async (req, res) => {
  try {
    const state = getState();
    const phase2 = state.phase2Assets || [];
    const phase4 = state.phase4Assets || [];

    res.json({ phase2, phase4 });
  } catch (err) {
    console.error('[server ERROR]: PhaseWatchlist fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch phase watchlist' });
  }
};

module.exports = {
  rateLimiter,
  getPhaseWatchlist
};
