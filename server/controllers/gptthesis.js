import dotenv from 'dotenv';
dotenv.config();

import { getYahooCandles } from '../utils/getYahooCandles.js';
import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import {
  calculateATR,
  isBreakout,
  isBreakdown,
  calculateStructureScore,
  calculateReflexPressure,
  calculateVolatilityScore
} from '../utils/metricUtils.js';

import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateGptThesis(req, res) {
  const querySymbol = req.query.symbol;
  const symbols = querySymbol ? [querySymbol] : Object.keys(SYMBOL_MAP);
  const thesisResults = [];

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

      const score = reflex + structure;

      const bias = today.close > recent.at(-1).close
        ? 'Bullish'
        : today.close < recent.at(-1).close
        ? 'Bearish'
        : 'Neutral';

      const isPhase2 = isBreakout(today, recentHigh, atr) && structure > 0.25 && reflex > 0.3;

      if (isPhase2) {
        const prompt = `
You are a trading strategist. Analyze the following market setup:

- Symbol: ${symbol}
- Phase: Phase 2 (Breakout)
- Bias: ${bias}
- Reflex Pressure: ${reflex.toFixed(2)}
- Structure Score: ${structure.toFixed(2)}
- Volatility Score: ${volatility.toFixed(2)}
- ATR: ${atr.toFixed(2)}
- Composite Score: ${score.toFixed(2)}

Tasks:
1. Write a concise trade thesis explaining the opportunity.
2. Provide commentary from:
   - Execution Risk Manager
   - Macro Strategist
   - Behavioral Coach

Respond in a clean, scannable format.
        `.trim();

        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }]
        });

        thesisResults.push({
          symbol,
          phase: 'Phase 2',
          bias,
          reflex: reflex.toFixed(2),
          structure: structure.toFixed(2),
          volatility: volatility.toFixed(2),
          atr: atr.toFixed(2),
          score: score.toFixed(2),
          thesis: completion.choices[0].message.content
        });

      } else {
        thesisResults.push({
          symbol,
          phase: 'Phase 1',
          reflex: reflex.toFixed(2),
          structure: structure.toFixed(2),
          volatility: volatility.toFixed(2),
          atr: atr.toFixed(2),
          bias,
          score: score.toFixed(2),
          thesis: `⚠️ No valid breakout setup detected. Thesis not generated. (Requires breakout + structure > 0.25 + reflex > 0.3)`
        });
      }

    } catch (err) {
      console.warn(`⚠️ GPT Error for ${symbol}:`, err.message);
    }
  }

  const sorted = thesisResults.sort((a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0));
  res.json(sorted);
}
