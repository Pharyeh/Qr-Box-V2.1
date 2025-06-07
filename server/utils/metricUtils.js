// server/utils/metricUtils.js

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

export function calculateReflexPressure(recent, today) {
  const body = Math.abs(today.close - today.open);
  const range = today.high - today.low || 1;
  return body / range;
}

export function calculateStructureScore(candles) {
  const scores = candles.map(c => {
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low || 1;
    return body / range;
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function calculateVolatilityScore(candles) {
  const ranges = candles.map(c => c.high - c.low);
  const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
  const stdDev = Math.sqrt(
    ranges.map(r => Math.pow(r - avgRange, 2)).reduce((a, b) => a + b, 0) / ranges.length
  );
  return stdDev / (avgRange || 1);
}

export function isBreakout(today, recentHigh, atr) {
  return today.high > recentHigh + 0.1 * atr;
}

export function isBreakdown(today, recentLow, atr) {
  return today.low < recentLow - 0.1 * atr;
}
