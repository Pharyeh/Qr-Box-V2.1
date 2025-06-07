import { getYahooCandles } from '../utils/getYahooCandles.js';
import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import {
  calculateATR,
  isBreakout,
  isBreakdown,
  calculateStructureScore,
  calculateReflexPressure,
  calculateVolatilityScore,
} from '../utils/metricUtils.js';

export async function getTradeIdeas(req, res) {
  const result = [];
  const symbols = Object.keys(SYMBOL_MAP);

  for (const symbol of symbols) {
    try {
      const candles = await getYahooCandles(symbol);
      if (!candles || candles.length < 23) continue;

      const recent = candles.slice(-22, -1);
      const today = candles.at(-1);
      const atr = calculateATR(candles);

      const reflex = calculateReflexPressure(recent, today);
      const structure = calculateStructureScore(recent);
      const volatility = calculateVolatilityScore(recent);
      const recentHigh = Math.max(...recent.map(c => c.high));
      const recentLow = Math.min(...recent.map(c => c.low));

      // Phase 2 filtering only
      if (isBreakout(today, recentHigh, atr) && structure > 0.25 && reflex > 0.3) {
        const bias = today.close > recent.at(-1).close
          ? 'Bullish'
          : today.close < recent.at(-1).close
          ? 'Bearish'
          : 'Neutral';

        const score = reflex + structure;

        result.push({
          symbol,
          reflex: reflex.toFixed(2),
          structure: structure.toFixed(2),
          volatility: volatility.toFixed(2),
          lastClose: today.close.toFixed(2),
          score: score.toFixed(2),
          bias,
          phase: 'Phase 2',
        });
      }

    } catch (err) {
      console.warn(`⚠️ [${symbol}] trade idea failed: ${err.message}`);
    }
  }

  const sorted = result.sort((a, b) => b.reflex - a.reflex);
  res.json(sorted);
}
