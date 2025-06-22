import express from 'express';
import { getDualZoneBreakouts } from '../../controllers/rangebreakout.js';

const router = express.Router();

router.get('/', getDualZoneBreakouts);

export default router; 