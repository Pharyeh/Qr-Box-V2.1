import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COT_PATH = path.join(__dirname, 'cot-latest.json');

export function loadCOTSentiment(symbol) {
  if (!fs.existsSync(COT_PATH)) return { cotBias: 'No COT', cotScore: null };

  const data = JSON.parse(fs.readFileSync(COT_PATH, 'utf8'));
  const entry = data[symbol];
  if (!entry || !entry.netNonComm) return { cotBias: 'Neutral', cotScore: null };

  const score = entry.netNonComm;

  let label = 'Neutral';
  if (score >= 80000) label = 'Extreme Bullish';
  else if (score >= 50000) label = 'Strong Bullish';
  else if (score >= 20000) label = 'Bullish';
  else if (score <= -80000) label = 'Extreme Bearish';
  else if (score <= -50000) label = 'Strong Bearish';
  else if (score <= -20000) label = 'Bearish';

  return {
    cotBias: label,
    cotScore: score,
  };
}
