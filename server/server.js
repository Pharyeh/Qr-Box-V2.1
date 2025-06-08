import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import phaseMonitorRoute from './routes/api/phasemonitor.js';
import tradeIdeasRoute from './routes/api/tradeideas.js';
import gptThesisRoute from './routes/api/gptthesis.js';

const app = express();
app.use(cors());
app.use(express.json());

// ROUTE REGISTRATION
app.use('/api/phasemonitor', phaseMonitorRoute);
app.use('/api/tradeideas', tradeIdeasRoute);
app.use('/api/gptthesis', gptThesisRoute);

// BASE ENDPOINT
app.get('/', (req, res) => {
  res.send('🧠 QR Box Options API running');
});

// START SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 QR Box Options server live on http://localhost:${PORT}`);
});
