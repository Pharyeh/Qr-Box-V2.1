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
  const { getPhaseMonitorData } = await import('./phasemonitor.js');
  const results = await getPhaseMonitorData(false);

  const tradeIdeas = [];

  for (const item of results) {
    try {
      if (!item) continue;
      // Only include Phase 2 (breakout) or Phase 1.8 Pre-Breakout Watch
      const isBreakout = item.phase === 'Phase 2';
      const isPreBreakout = item.phase === 'Phase 1.8' && item.setupType && item.setupType.startsWith('Pre-Breakout');
      if (!isBreakout && !isPreBreakout) continue;

      const meta = SYMBOL_MAP[item.symbol];
      const assetClass = meta?.assetClass || 'Unknown';
      let candles = null;

      if (assetClass === 'Stocks') {
        candles = await getYahooCandles(item.symbol, '1d');
        if (!candles || candles.length < 100) {
          try {
            const { getTingoCandles } = await import('../utils/getTingoCandles.js');
            candles = await getTingoCandles(item.symbol, 250);
          } catch (e) {
            console.warn(`[TradeIdeas] ${item.symbol}: Tiingo fallback failed (${e.message})`);
          }
        }
      } else {
        candles = await getOandaCandles(item.symbol, 'D', 250);
      }

      if (!candles || candles.length < 100) {
        console.warn(`[TradeIdeas] ${item.symbol}: Not enough candles`);
        continue;
      }

      const score = calculateScore(item);
      const volWarning = item.volatility >= 0.015;
      const cotWarning = item.cotBias === 'No COT' || item.cotBias === 'Neutral';

      tradeIdeas.push({
        symbol: item.symbol,
        phase: item.phase,
        bias: item.bias,
        reflex: item.reflex,
        structure: item.structure,
        volatility: item.volatility,
        cotBias: item.cotBias,
        cotScore: item.cotScore ?? null,
        score,
        grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C',
        rr: item.levels?.rr || 0,
        cotWarning,
        volWarning,
        breakout: isBreakout,
        setupType: item.setupType,
        breakoutDirection: item.breakoutDirection,
        assetClass,
        priceSource: item.priceSource,
        sparkline: item.sparkline
      });

    } catch (err) {
      console.error(`[TradeIdeas] ${item.symbol}: Error generating idea`, err);
    }
  }

  tradeIdeas.sort((a, b) => b.score - a.score);
  return tradeIdeas;
}

export async function getTradeIdeas(req, res) {
  try {
    const ideas = await buildTradeIdeas();
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
