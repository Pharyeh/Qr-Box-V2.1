// Indicator and scoring utilities extracted from controllers

// 🚫 Proprietary indicator and scoring logic removed for public demo.
// All functions below return static or random values for demonstration purposes only.

export function calculateATR(candles, period = 14) {
  // Placeholder: return static value
  return 0.01;
}

export function calculateStructureScore(candles) {
  // Placeholder: return static value
  return 0.2;
}

export function calculateVolatilityScore(candles) {
  // Placeholder: return static value
  return 0.01;
}

export function calculateReflex(candles) {
  // Placeholder: return static value
  return 0.01;
}

export function wasCompressing(candles, threshold = 0.015) {
  // Placeholder: return static value
  return false;
}

export function determinePhase(isBreakout, baseLow, baseHigh, close, atr, reflex, structure, volatility) {
  // Placeholder: return static value
  return 'Phase 1';
}

export function classifyBias(phase, reflex, reflexHistory = []) {
  // Placeholder: return static value
  return 'Neutral';
}

export function determinePlayType(phase, reflex, volatility, structure) {
  // Placeholder: return static value
  return 'Unknown';
}

export function formatDuration(msDiff) {
  // Placeholder: return static value
  return '0m';
}

// Range Breakout/Zone utilities
export function extractZone(candles, width = 0.10) {
  // Placeholder: return static zone
  return {
    top: 1.1000,
    bottom: 1.0900,
    btop: 1.0950,
    bbot: 1.0920
  };
}

export function isInsideZone(price, top, bottom) {
  // Placeholder: return static value
  return false;
}

export function calcScore({ reflex, structure, volatility, cotScore }) {
  // Placeholder: return static value
  return 50;
}

export function gradeScore(score) {
  // Placeholder: return static value
  return 'B';
} 