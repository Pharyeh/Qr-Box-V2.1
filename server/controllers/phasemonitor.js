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

export async function scanPhaseMonitor(req, res) {
  const result = [];
  const symbols = Object.keys(SYMBOL_MAP);
  const toScan = req.query.symbol ? [req.query.symbol] : symbols;

  for (const symbol of toScan) {
    try {
      const candles = await getYahooCandles(symbol);
      if (!candles || candles.length < 23) continue;

      const recent = candles.slice(-22, -1);
      const today = candles.at(-1);
      const atr = calculateATR(candles);

      const reflex = calculateReflexPressure(recent, today);
      const volatility = calculateVolatilityScore(recent);
      const structure = calculateStructureScore(recent);

      const recentHigh = Math.max(...recent.map(c => c.high));
      const recentLow = Math.min(...recent.map(c => c.low));

      let phase = 'Phase 1';

      if (isBreakout(today, recentHigh, atr) && structure > 0.25 && reflex > 0.3) {
        phase = 'Phase 2';
      } else if (isBreakdown(today, recentLow, atr) && structure > 0.25 && reflex < -0.3) {
        phase = 'Phase 4';
      } else if (reflex > 1.5 && volatility > 0.7) {
        phase = 'Phase 3';
      }

      const bias = today.close > recent.at(-1).close
        ? 'Bullish'
        : today.close < recent.at(-1).close
        ? 'Bearish'
        : 'Neutral';

      const score = reflex + structure;

      result.push({
        symbol,
        phase,
        reflex: reflex.toFixed(2),
        volatility: volatility.toFixed(2),
        structure: structure.toFixed(2),
        score: score.toFixed(2),
        lastClose: today.close.toFixed(2),
        bias,
      });
    } catch (err) {
      console.warn(`⚠️ [${symbol}] failed: ${err.message}`);
    }
  }

  res.json(result);
}
