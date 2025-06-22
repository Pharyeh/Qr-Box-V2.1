console.log('--- SERVER STARTING ---');

import { config } from 'dotenv';
config();

function mask(value) {
  return value ? '***' : 'unset';
}

console.log('OPENAI_API_KEY:', mask(process.env.OPENAI_API_KEY));
console.log('OANDA_API_KEY:', mask(process.env.OANDA_API_KEY));
console.log('OANDA_ACCOUNT_ID:', process.env.OANDA_ACCOUNT_ID || 'unset');
console.log('OANDA_BASE_URL:', process.env.OANDA_BASE_URL || 'unset');

import express from 'express';
import cors from 'cors';

// Route imports
import phaseMonitorRoute from './routes/api/phasemonitor.js';
import tradeIdeasRoute from './routes/api/tradeideas.js';
import gptThesisRoute from './routes/api/gptthesis.js';
import rangeBreakoutRoute from './routes/api/rangebreakout.js';
import { loadPhaseHistory } from './utils/phaseHistory.js';

const app = express();
app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api/phasemonitor', phaseMonitorRoute);
app.use('/api/tradeideas', tradeIdeasRoute);
app.use('/api/gptthesis', gptThesisRoute);
app.use('/api/rangebreakout', rangeBreakoutRoute);

// Base endpoint
app.get('/', (req, res) => {
  res.send('🧠 QR Box Options API running');
});

// Start server
const PORT = process.env.PORT || 5001;
loadPhaseHistory();  // Initialize phase history on startup
app.listen(PORT, () => {
  console.log(`🚀 QR Box Options server live on http://localhost:${PORT}`);
});
