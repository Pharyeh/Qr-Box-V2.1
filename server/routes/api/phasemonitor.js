import express from 'express';
import { scanPhaseMonitor } from '../../controllers/phasemonitor.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await scanPhaseMonitor(req, res, false);
  } catch (err) {
    console.error('PhaseMonitor error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { phase, assetClass, bias } = req.query;
    let data = await scanPhaseMonitor(req, res, true);

    if (phase && phase !== 'All') {
      data = data.filter(item => item.phase === phase);
    }
    if (assetClass && assetClass !== 'All') {
      data = data.filter(item => item.assetClass === assetClass);
    }
    if (bias && bias !== 'All') {
      data = data.filter(item => item.bias === bias);
    }

    res.json(data);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Phase history timeline endpoint
router.get('/history', (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json([]);
  try {
    const historyPath = path.join(__dirname, '../../phase-history.json');
    if (!fs.existsSync(historyPath)) return res.json([]);
    const raw = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const entries = [];
    // If symbol has a timeline array, return it; else, fallback to single entry
    if (raw[symbol]?.timeline && Array.isArray(raw[symbol].timeline)) {
      raw[symbol].timeline.forEach(e => entries.push({ phase: e.phase, timestamp: e.timestamp }));
    } else if (raw[symbol]) {
      entries.push({ phase: raw[symbol].phase, timestamp: raw[symbol].timestamp });
    }
    res.json(entries);
  } catch (e) {
    res.status(500).json([]);
  }
});

export default router;
