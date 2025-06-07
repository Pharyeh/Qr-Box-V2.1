// server/server.js

import 'dotenv/config';

import dotenv from 'dotenv';
dotenv.config();

console.log('OPENAI_API_KEY (top of file):', process.env.OPENAI_API_KEY);

import express from 'express';
import cors from 'cors';

import phaseMonitorRoutes from './routes/api/phasemonitor.js';
import tradeIdeasRoutes from './routes/api/tradeideas.js';
import gptThesisRoutes from './routes/api/gptthesis.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/phasemonitor', phaseMonitorRoutes);
app.use('/api/tradeideas', tradeIdeasRoutes);
app.use('/api/gptthesis', gptThesisRoutes);

app.listen(PORT, () => {
  console.log(`🚀 QR Box server running on http://localhost:${PORT}`);
});
