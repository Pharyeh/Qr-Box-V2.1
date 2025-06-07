// server/routes/api/phasemonitor.js
import express from 'express';
import { scanPhaseMonitor } from '../../controllers/phasemonitor.js';

const router = express.Router();

router.get('/', scanPhaseMonitor);

export default router;
