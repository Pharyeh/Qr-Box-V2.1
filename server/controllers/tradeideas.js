// server/controllers/tradeideas.js
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import { SYMBOL_MAP } from '../utils/symbolMapping.js';

function calculateScore(item) {
  let score = 0;

  if (item.structure > 0.25) score += 40;
  else if (item.structure > 0.2) score += 30;
  else if (item.structure > 0.15) score += 20;
  else score += 10;

  if (item.reflex > 0.03) score += 30;
  else if (item.reflex > 0.02) score += 20;
  else if (item.reflex > 0.01) score += 10;

  if (item.volatility < 0.01) score += 10;
  else if (item.volatility < 0.015) score += 5;

  if (item.bias === item.cotBias) score += 10;
  else if (item.cotBias !== 'Neutral' && item.cotBias !== 'No COT') score += 5;

  score += item.freshnessScore || 0;

  const rr = item.levels?.rr || 0;
  if (rr >= 2.5) score += 10;
  else if (rr >= 2.0) score += 5;

  if (item.bias === 'Bullish' && item.reflex > 0.05) score += 5;
  if (item.bias === 'Bearish' && item.volatility > 0.02) score -= 5;

  return score;
}

export async function buildTradeIdeas() {
  // 🚫 Proprietary trade idea generation logic removed for public demo.
  // This function would normally analyze market data and generate trade ideas.
  // For demo purposes, we return static or random data.
  return [
    {
      symbol: 'EURUSD',
      phase: 'Demo Phase',
      bias: 'Neutral',
      reflex: 50,
      structure: 50,
      volatility: 0.01,
      cotBias: 'Neutral',
      cotScore: 50,
      score: 75,
      grade: 'B',
      rr: 1.5,
      cotWarning: false,
      volWarning: false,
      breakout: false,
      setupType: 'Demo',
      breakoutDirection: 'None',
      assetClass: 'FX',
      priceSource: 'Demo',
      sparkline: []
    }
  ];
}

export async function getTradeIdeas(req, res) {
  try {
    const ideas = await buildTradeIdeas();
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
