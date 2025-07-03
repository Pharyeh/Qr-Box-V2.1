import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COT_PATH = path.join(__dirname, 'cot-latest.json');

export function loadCOTSentiment(symbol) {
  if (!fs.existsSync(COT_PATH)) return { cotBias: 'No COT', cotScore: null };

  const data = JSON.parse(fs.readFileSync(COT_PATH, 'utf8'));
  const entry = data[symbol];
  if (!entry || typeof entry.netNonComm !== 'number') return { cotBias: 'No COT', cotScore: null };

  return {
    cotBias: entry.cotSentiment || 'Neutral',
    cotScore: entry.cotScore || entry.netNonComm,
  };
}
