const rateLimit = require('express-rate-limit');
const {
  getTradeLogs,
  setTradeLogs,
  addTradeLog,
  deleteTradeLogById
} = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/TradeLogs
const fetchLogs = async (req, res) => {
  try {
    const logs = getTradeLogs();
    res.json({ logs });
  } catch (err) {
    console.error('[server ERROR]: fetchLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch trade logs' });
  }
};

// POST /api/TradeLogs/add
// {
//   "symbol": "SPX",
//   "type": "Long",
//   "date": "2024-05-20T14:00:00Z",
//   "entry": 4500,
//   "exit": 4550,
//   "riskReward": "1:3",
//   "status": "Closed",
//   "pnl": "+1.12%"
// }
const addLog = async (req, res) => {
  try {
    const { symbol, type, date, entry, exit, riskReward, status, pnl } = req.body;

    if (!symbol || !type || !date || !entry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const log = {
      _id: `${symbol}-${Date.now()}`,
      symbol,
      type,
      date,
      entry,
      exit: exit ?? null,
      riskReward: riskReward ?? '',
      status: status ?? 'Open',
      pnl: pnl ?? '0%'
    };

    addTradeLog(log);
    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error('[server ERROR]: addLog error:', err);
    res.status(500).json({ error: 'Failed to add trade log' });
  }
};

// POST /api/TradeLogs/delete
// { "id": "SPX-1716220383481" }
const deleteLog = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing log ID' });

    deleteTradeLogById(id);
    res.status(200).json({ success: true, deleted: id });
  } catch (err) {
    console.error('[server ERROR]: deleteLog error:', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
};

module.exports = {
  rateLimiter,
  fetchLogs,
  addLog,
  deleteLog
};
