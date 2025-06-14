import express from 'express';
import { generateGptThesis, gptThesisFollowup } from '../../controllers/gptthesis.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await generateGptThesis(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/followup', async (req, res) => {
  try {
    await gptThesisFollowup(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
