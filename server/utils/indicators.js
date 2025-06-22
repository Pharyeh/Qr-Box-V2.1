// Indicator and scoring utilities extracted from controllers

export function calculateATR(candles, period = 14) {
  const trs = candles.slice(1).map((c, i) => {
    const prev = candles[i];
    return Math.max(
      c.high - c.low,
      Math.abs(c.high - prev.close),
      Math.abs(c.low - prev.close)
    );
  });
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}

export function calculateStructureScore(candles) {
  const range = Math.max(...candles.map(c => c.high)) - Math.min(...candles.map(c => c.low));
  const avgBody = candles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / candles.length;
  return range > 0 ? +(avgBody / range).toFixed(3) : 0;
}

export function calculateVolatilityScore(candles) {
  const closes = candles.map(c => c.close);
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / closes.length;
  return +(Math.sqrt(variance) / mean).toFixed(4);
}

export function calculateReflex(candles) {
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const raw = (latest.close - prev.close) / prev.close;
  return Math.abs(raw) < 0.001 ? 0 : +raw.toFixed(3);
}

export function wasCompressing(candles, threshold = 0.015) {
  const vol = calculateVolatilityScore(candles.slice(-10));
  return vol < threshold;
}

export function determinePhase(isBreakout, baseLow, baseHigh, close, atr, reflex, structure, volatility) {
  const phase4Threshold = baseLow - 0.3 * atr;
  const meetsPhase3Conditions =
    close >= baseLow + 0.5 * (baseHigh - baseLow) &&
    reflex > 0.01 &&
    structure > 0.18 &&
    volatility < 0.02;

  if (isBreakout) return 'Phase 2';
  if (close <= phase4Threshold) return 'Phase 4';
  if (meetsPhase3Conditions) return 'Phase 3';
  return 'Phase 1';
}

export function classifyBias(phase, reflex) {
  if (Math.abs(reflex) < 0.0015) return 'Neutral';
  if (phase === 'Phase 2' || phase === 'Phase 3') return reflex > 0 ? 'Bullish' : 'Bearish';
  if (phase === 'Phase 4') return reflex < 0 ? 'Bearish' : 'Bullish';
  return 'Neutral';
}

export function determinePlayType(phase, reflex, volatility, structure) {
  if (phase === 'Phase 2') {
    if (reflex > 0 && volatility < 0.015 && structure > 0.2) return 'Breakout';
    if (reflex < 0 && structure > 0.25) return 'Breakdown';
    if (structure > 0.3) return 'Expansion';
  }
  if (phase === 'Phase 3') return reflex < 0 ? 'Exhaustion' : 'Continuation';
  if (phase === 'Phase 4') return reflex < 0 ? 'Reversal' : 'Deadcat Bounce';
  return 'Unknown';
}

export function formatDuration(msDiff) {
  const minutes = Math.floor(msDiff / (1000 * 60));
  const hours = Math.floor(msDiff / (1000 * 60 * 60));
  const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

// Range Breakout/Zone utilities
export function extractZone(candles, width = 0.10) {
  const high = Math.max(...candles.map(c => c.high));
  const low = Math.min(...candles.map(c => c.low));
  const range = high - low;
  return {
    top: high,
    bottom: high - range * width,
    btop: low + range * width,
    bbot: low,
  };
}

export function isInsideZone(price, top, bottom) {
  return price <= top && price >= bottom;
}

export function calcScore({ reflex, structure, volatility, cotScore }) {
  return +(reflex * 100 + structure * 50 - volatility * 30 + cotScore).toFixed(1);
}

export function gradeScore(score) {
  if (score > 90) return 'A+';
  if (score > 80) return 'A';
  if (score > 70) return 'B';
  if (score > 60) return 'C';
  return 'D';
} 