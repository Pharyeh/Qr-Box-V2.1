import express from 'express';
import { scanPhaseMonitor } from '../../controllers/phasemonitor.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await scanPhaseMonitor(req, res, false);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const raw = await scanPhaseMonitor(req, res, true);
    res.json(raw); // Add CSV export logic if needed
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
