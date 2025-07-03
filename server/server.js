import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
import { config } from 'dotenv';
config({ path: envPath });
console.log('Does .env exist?', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  console.log('Contents of .env:', fs.readFileSync(envPath, 'utf-8'));
} else {
  console.log('.env file not found at', envPath);
}
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.slice(0, 6) + '...' : undefined);
console.log('OANDA_API_KEY:', process.env.OANDA_API_KEY);
console.log('OANDA_ACCOUNT_ID:', process.env.OANDA_ACCOUNT_ID);
console.log('OANDA_BASE_URL:', process.env.OANDA_BASE_URL);
console.log('All env vars:', process.env);

import express from 'express';
import cors from 'cors';
import { getPhaseMonitorData } from './controllers/phasemonitor.js';
import cron from 'node-cron';
import { fetchCOT } from './utils/fetchCOT.js';

// Route imports
import phaseMonitorRoute from './routes/api/phasemonitor.js';
import tradeIdeasRoute from './routes/api/tradeideas.js';
import gptThesisRoute from './routes/api/gptthesis.js';
import { loadPhaseHistory } from './utils/phaseHistory.js';

const app = express();
app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api/phasemonitor', phaseMonitorRoute);
app.use('/api/tradeideas', tradeIdeasRoute);
app.use('/api/gptthesis', gptThesisRoute);
// app.use('/api/settings', settingsRoute);
// app.use('/api/rangebreakout', rangeBreakoutRoute);

// Base endpoint
app.get('/', (req, res) => {
  res.send('🧠 QR Box Options API running');
});

// Start server
const PORT = process.env.PORT || 5001;
loadPhaseHistory();  // Initialize phase history on startup

// Change COT autofetch to every Saturday at 6am
cron.schedule('0 6 * * 6', async () => {
  console.log('[COT] Auto-fetching latest COT data...');
  try {
    await fetchCOT();
    console.log('[COT] Fetch complete.');
  } catch (e) {
    console.error('[COT] Auto-fetch error:', e);
  }
});

// Start periodic phase monitor scan (every 5 minutes)
// setInterval(async () => {
//   console.log('[PhaseMonitor] Scheduled scan started');
//   try {
//     await getPhaseMonitorData();
//     console.log('[PhaseMonitor] Scheduled scan completed');
//   } catch (err) {
//     console.error('[PhaseMonitor] Scheduled scan error:', err);
//   }
// }, 300000);

app.listen(PORT, () => {
  console.log(`🚀 QR Box Options server live on http://localhost:${PORT}`);
});
