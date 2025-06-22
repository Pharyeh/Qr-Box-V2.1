import { scanPhaseMonitor } from './phasemonitor.js';

function calculateScore(item) {
  let score = 0;

  // Structure Score (0–40)
  if (item.structure > 0.25) score += 40;
  else if (item.structure > 0.2) score += 30;
  else if (item.structure > 0.15) score += 20;
  else score += 10;

  // Reflex Score (0–30)
  if (item.reflex > 0.03) score += 30;
  else if (item.reflex > 0.02) score += 20;
  else if (item.reflex > 0.01) score += 10;

  // Volatility Score (0–10)
  if (item.volatility < 0.01) score += 10;
  else if (item.volatility < 0.015) score += 5;

  // COT Bias Alignment (0–10)
  if (item.bias === item.cotBias) score += 10;
  else if (item.cotBias !== 'Neutral' && item.cotBias !== 'No COT') score += 5;

  // Freshness (0–10)
  score += item.freshnessScore || 0;

  // Reward-to-Risk Score (0–10)
  const rr = item.levels?.rr || 0;
  if (rr >= 2.5) score += 10;
  else if (rr >= 2.0) score += 5;

  // Optional Bias Reinforcement (+5 or -5)
  if (item.bias === 'Bullish' && item.reflex > 0.05) score += 5;
  if (item.bias === 'Bearish' && item.volatility > 0.02) score -= 5;

  return score;
}

function isValidCompression(volatility, threshold = 0.015) {
  return volatility < threshold;
}

function parseHours(durationStr) {
  if (!durationStr) return 999;
  if (durationStr.endsWith('m')) return 0;
  if (durationStr.endsWith('h')) return parseInt(durationStr);
  if (durationStr.endsWith('d')) return parseInt(durationStr) * 24;
  return 999;
}

export async function buildTradeIdeas(timeframe = '1d') {
  const h4Results = await scanPhaseMonitor({}, {}, true, timeframe);
  const tradeIdeas = [];

  for (const item of h4Results) {
    const hours = parseHours(item.durationInPhase);
    const score = calculateScore(item);
    const cotWarning = item.cotBias === 'No COT' || item.cotBias === 'Neutral';
    const volWarning = item.volatility >= 0.015;

    if (item.phase === 'Phase 2' && hours >= 0 && hours <= 6) {
      console.log(`[TradeIdeas] ✅ Including`, {
        symbol: item.symbol,
        hours,
        reflex: item.reflex,
        structure: item.structure,
        volatility: item.volatility,
        assetClass: item.assetClass
      });

      tradeIdeas.push({
        symbol: item.symbol,
        phase: item.phase,
        bias: item.bias,
        reflex: item.reflex,
        structure: item.structure,
        volatility: item.volatility,
        isNew: item.isNew,
        durationInPhase: item.durationInPhase,
        assetClass: item.assetClass,
        playType: item.playType || 'Unknown',
        cotBias: item.cotBias,
        cotScore: item.cotScore ?? null,
        score,
        grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C',
        rr: item.levels?.rr || 0,
        cotWarning,
        volWarning,
        freshBreakout: hours === 0,
        breakout: true,
        source: item.source,
        priceSource: item.priceSource,
        priceSymbol: item.priceSymbol
      });
    }
  }

  console.log(`🧠 Trade ideas filtered: ${tradeIdeas.length}`);
  tradeIdeas.sort((a, b) => b.score - a.score);
  return tradeIdeas;
}

export async function getTradeIdeas(req, res) {
  try {
    const timeframe = req.query.timeframe || '1d';
    const tradeIdeas = await buildTradeIdeas(timeframe);
    res.json(tradeIdeas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
