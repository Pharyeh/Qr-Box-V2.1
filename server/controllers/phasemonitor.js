import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getPhaseInfo, updatePhaseInfo, loadPhaseCache, savePhaseCache } from '../utils/phaseHistory.js';
import { detectDarvasBoxes } from '../utils/darvasBox.js';
import cotData from '../utils/cot-latest.json' assert { type: 'json' };
import { calculateATR, calculateStructureScore, calculateVolatilityScore, calculateReflex, wasCompressing, determinePhase, classifyBias, determinePlayType, formatDuration } from '../utils/indicators.js';

let phaseCache = loadPhaseCache();

function wasCompressing(candles, threshold = 0.015) {
  const vol = calculateVolatilityScore(candles.slice(-10));
  return vol < threshold;
}

function determinePhase(isBreakout, baseLow, baseHigh, close, atr, reflex, structure, volatility) {
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

function classifyBias(phase, reflex) {
  if (Math.abs(reflex) < 0.0015) return 'Neutral';
  if (phase === 'Phase 2' || phase === 'Phase 3') return reflex > 0 ? 'Bullish' : 'Bearish';
  if (phase === 'Phase 4') return reflex < 0 ? 'Bearish' : 'Bullish';
  return 'Neutral';
}

function determinePlayType(phase, reflex, volatility, structure) {
  if (phase === 'Phase 2') {
    if (reflex > 0 && volatility < 0.015 && structure > 0.2) return 'Breakout';
    if (reflex < 0 && structure > 0.25) return 'Breakdown';
    if (structure > 0.3) return 'Expansion';
  }
  if (phase === 'Phase 3') return reflex < 0 ? 'Exhaustion' : 'Continuation';
  if (phase === 'Phase 4') return reflex < 0 ? 'Reversal' : 'Deadcat Bounce';
  return 'Unknown';
}

export async function getPhaseMonitorData(timeframe = '1d') {
  const now = new Date();
  const symbols = Object.keys(SYMBOL_MAP);
  const results = await Promise.all(symbols.map(async (symbol) => {
    const meta = SYMBOL_MAP[symbol];
    let candles, dataSource, priceSymbol;
    let oandaData = await getOandaCandles(symbol, timeframe, 24);
    candles = oandaData;
    dataSource = 'OANDA';
    priceSymbol = meta.oanda || symbol;
    if (!oandaData || oandaData.length === 0) {
      candles = await getYahooCandles(symbol, timeframe.toLowerCase());
      dataSource = 'YahooFinance';
      priceSymbol = SYMBOL_MAP[symbol]?.yahoo || symbol;
    } else if (oandaData[0]?.dataSource) {
      dataSource = oandaData[0].dataSource;
      priceSymbol = meta.oanda || symbol;
    }
    if (!candles || candles.length < 20) {
      return null;
    }
    const baseCandles = candles.slice(-21, -1);
    const recent = candles[candles.length - 1];
    const baseHigh = Math.max(...baseCandles.map(c => c.high));
    const baseLow = Math.min(...baseCandles.map(c => c.low));
    const atr = calculateATR(baseCandles);
    const structure = calculateStructureScore(baseCandles);
    const reflex = calculateReflex(candles);
    const volatility = calculateVolatilityScore(baseCandles);
    const darvasBoxes = detectDarvasBoxes(candles, { symbol, assetClass: meta.assetClass });
    const lastBox = darvasBoxes?.[0];
    const compressed = wasCompressing(baseCandles);
    let isBreakout = false;
    if (lastBox?.isFreshBreakout && lastBox.direction === 1 && compressed) {
      isBreakout = true;
    } else if (reflex > 0.008 && structure > 0.08) {
      isBreakout = true;
    } else if (meta.assetClass === 'Stocks' && reflex > 0.02 && structure > 0.12) {
      isBreakout = true;
    } else if (meta.assetClass === 'Forex' && compressed && reflex > 0.006 && structure > 0.08) {
      isBreakout = true;
    }
    let phase = determinePhase(isBreakout, baseLow, baseHigh, recent.close, atr, reflex, structure, volatility);
    let sticky = false;
    const lastScan = phaseCache[symbol] || {};
    if (lastScan.phase === 'Phase 3' && phase === 'Phase 1') {
      const elapsedMs = now - (lastScan.timestamp || now);
      if (elapsedMs < 2 * 60 * 60 * 1000) {
        phase = 'Phase 3';
        sticky = true;
      }
    }
    if (lastScan.phase === 'Phase 2' && phase === 'Phase 1') {
      const elapsedMs = now - (lastScan.timestamp || now);
      if (elapsedMs < 30 * 60 * 1000) {
        phase = 'Phase 2';
        sticky = true;
      }
    }
    phaseCache[symbol] = {
      phase,
      timestamp: now,
      bias: classifyBias(phase, reflex),
    };
    savePhaseCache(phaseCache);
    const bias = classifyBias(phase, reflex);
    const entry = lastBox?.top || recent.close;
    let stop = 'N/A', tp1 = 'N/A', tp2 = 'N/A', rr = 0;
    if (!isNaN(entry)) {
      const sl = bias === 'Bearish' ? entry + atr : entry - atr;
      const take1 = bias === 'Bearish' ? entry - atr : entry + atr;
      const take2 = bias === 'Bearish' ? entry - 2 * atr : entry + 2 * atr;
      stop = sl.toFixed(5);
      tp1 = take1.toFixed(5);
      tp2 = take2.toFixed(5);
      rr = Math.abs((take1 - entry) / (entry - sl));
    }
    const msDiff = now - (lastScan.timestamp || now);
    const freshnessScore = msDiff <= 3 * 60 * 60 * 1000 ? 10 : msDiff <= 6 * 60 * 60 * 1000 ? 5 : 0;
    const playType = determinePlayType(phase, reflex, volatility, structure);
    // --- COT LOGIC ---
    const cotKey = meta.cotKey;
    const cotEntry = cotData[cotKey];
    let cotBias = cotEntry?.cotSentiment || 'Neutral';
    let cotScore = typeof cotEntry?.cotScore === 'number' ? cotEntry.cotScore : 0;
    if (meta.invertCot) {
      cotScore = -cotScore;
      if (cotBias === 'Bullish') cotBias = 'Bearish';
      else if (cotBias === 'Bearish') cotBias = 'Bullish';
      else if (cotBias === 'Strong Bullish') cotBias = 'Strong Bearish';
      else if (cotBias === 'Strong Bearish') cotBias = 'Strong Bullish';
    }
    // --- PHASE HISTORY PERSISTENCE ---
    if (lastScan.phase !== phase) {
      updatePhaseInfo(symbol, phase);
    }
    const phaseInfo = getPhaseInfo(symbol, phase);
    const durationInPhase = phaseInfo.durationInPhase;
    const isNew = phaseInfo.isNew;
    const lastPhase = lastScan.phase || phase;
    const result = {
      symbol,
      phase,
      lastPhase,
      bias,
      reflex,
      volatility,
      structure,
      sticky,
      cotBias,
      cotScore: +cotScore.toFixed(2),
      freshnessScore,
      durationInPhase: typeof durationInPhase === 'number' ? `${durationInPhase}h` : formatDuration(msDiff),
      isNew,
      source: dataSource,
      priceSource: dataSource,
      priceSymbol,
      assetClass: meta.assetClass || 'Unclassified',
      levels: {
        entry: entry.toString(),
        stop,
        tp1,
        tp2,
        rr: +rr.toFixed(2)
      },
      playType,
    };
    result.lastPhase = result.lastPhase || result.phase;
    return result;
  }));
  return results.filter(Boolean);
}

export async function scanPhaseMonitor(req, res, returnRaw = false, timeframe = '1d') {
  try {
    // Check for required API credentials
    if (!process.env.OANDA_API_KEY || !process.env.OANDA_ACCOUNT_ID) {
      const msg = 'OANDA API credentials are missing. Please set OANDA_API_KEY and OANDA_ACCOUNT_ID.';
      if (returnRaw) return { error: msg };
      return res.status(500).json({ error: msg });
    }
    const results = await getPhaseMonitorData(timeframe);
    if (returnRaw) return results;
    res.json(results);
  } catch (err) {
    console.error('[PhaseMonitor] Error:', err);
    if (returnRaw) return { error: err.message };
    res.status(500).json({ error: err.message });
  }
}
