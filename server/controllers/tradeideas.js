import { scanPhaseMonitor } from './phasemonitor.js';

function calculateScore(item) {
  let score = 0;

  // Structure (0–40)
  if (item.structure > 0.25) score += 40;
  else if (item.structure > 0.2) score += 30;
  else if (item.structure > 0.15) score += 20;
  else score += 10;

  // Reflex (0–30)
  if (item.reflex > 0.03) score += 30;
  else if (item.reflex > 0.02) score += 20;
  else if (item.reflex > 0.01) score += 10;

  // Volatility (lower is better, 0–10)
  if (item.volatility < 0.01) score += 10;
  else if (item.volatility < 0.015) score += 5;

  // COT alignment (0–10)
  if (item.bias === item.cotBias) score += 10;
  else if (item.cotBias !== 'Neutral' && item.cotBias !== 'No COT') score += 5;

  // Fresh breakout (0–10)
  if (item.phase === 'Phase 2' && item.isNew) score += 10;

  return score;
}

export async function getTradeIdeas(req, res) {
  try {
    const scanResults = await scanPhaseMonitor(req, res, true);
    const tradeIdeas = [];

    for (const item of scanResults) {
      const hours = parseInt(item.durationInPhase?.replace('h', '') || '999', 10);
      const score = calculateScore(item);

      if (item.phase === 'Phase 2' && hours <= 3) {
        tradeIdeas.push({
          symbol: item.symbol,
          phase: item.phase,
          bias: item.bias,
          reflex: item.reflex,
          volatility: item.volatility,
          structure: item.structure,
          isNew: item.isNew,
          durationInPhase: item.durationInPhase,
          source: item.source,
          assetClass: item.assetClass,
          cotBias: item.cotBias,
          cotScore: item.cotScore ?? null,
          score,
          grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C',
        });
      }
    }

    tradeIdeas.sort((a, b) => b.score - a.score);
    res.json(tradeIdeas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
