import express from 'express';
import { getTradeIdeas } from '../../controllers/tradeideas.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await getTradeIdeas(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
