// server/routes/api/tradeideas.js
import express from 'express';
import { getTradeIdeas } from '../../controllers/tradeideas.js';

const router = express.Router();

router.get('/', getTradeIdeas);

export default router;
