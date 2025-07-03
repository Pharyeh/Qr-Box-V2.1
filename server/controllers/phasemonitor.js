// server/controllers/phasemonitor.js
import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import { getTingoCandles } from '../utils/getTingoCandles.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  calculateATR,
  calculateStructureScore,
  calculateVolatilityScore,
  calculateReflex,
  classifyBias
} from '../utils/indicators.js';
import { loadCOTSentiment } from '../utils/loadCOTSentiment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let phaseMonitorCache = null;
let phaseMonitorCacheTime = 0;
const PHASE_MONITOR_CACHE_DURATION = 30 * 1000;

function getTimeframeForAsset(assetClass) {
  return '1h';
}

function mapTimeframeToOanda(timeframe) {
  const map = { '1m': 'M1', '5m': 'M5', '15m': 'M15', '30m': 'M30', '1h': 'H1', '4h': 'H4', '1d': 'D', '1wk': 'W' };
  return map[timeframe] || 'D';
}

export async function getPhaseMonitorData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && phaseMonitorCache && (now - phaseMonitorCacheTime < PHASE_MONITOR_CACHE_DURATION)) return phaseMonitorCache;

  const results = await Promise.all(
    Object.entries(SYMBOL_MAP).map(async ([symbol, meta]) => {
      try {
        const timeframe = getTimeframeForAsset(meta.assetClass);
        let candles = null;
        let source = 'Unknown';

        if (meta.assetClass === 'Stocks') {
          candles = await getYahooCandles(symbol, timeframe);
          source = 'Yahoo';
          if (!candles || candles.length < 22) {
            candles = await getTingoCandles(symbol, 250);
            source = 'Tiingo';
          }
        } else {
          const granularity = mapTimeframeToOanda(timeframe);
          candles = await getOandaCandles(symbol, granularity, 250);
          source = 'OANDA';
        }

        if (!candles || candles.length < 22) return null;

        const recent = candles.slice(-6); // last 5 completed candles + current
        const current = recent.at(-1);
        const base = recent.slice(0, -1); // last 5 completed candles
        const lastClosed = base.at(-1); // most recent fully closed candle

        const rangeHigh = Math.max(...base.map(c => c.high));
        const rangeLow = Math.min(...base.map(c => c.low));
        const rangeWidth = rangeHigh - rangeLow;
        const atr = calculateATR(base);
        const structure = calculateStructureScore(base);
        const reflex = calculateReflex(base); // use only closed candles
        const volatility = calculateVolatilityScore(base);
        const body = Math.abs(lastClosed.close - lastClosed.open);
        const isFullBody = body > 0.15 * rangeWidth;
        const closeAboveHigh = lastClosed.close >= rangeHigh * 0.998; // within 0.2% of range high
        const fadeOut = lastClosed.high > rangeHigh && lastClosed.close < rangeHigh;

        const timeInZone = base.filter(c =>
          c.high <= rangeHigh * 1.01 && c.low >= rangeLow * 0.99
        ).length;

        let phase = 'Phase 1';
        let breakoutStatus = 'Coiling';
        let notes = '';
        let fadeRisk = false;
        let bias = 'Neutral';
        let setupType = '';
        let breakoutInfo = null; // Track breakout state for Phase 3/4
        let isPreBreakout = false; // Flag for pre-breakout state
        let breakoutStrengthScore = null;
        let expansionRatio = null;
        let wasPhase2Recently = false;
        let timeSinceBreakout = null;
        let isBreakoutBar = false;

        // Attach COT sentiment at the top so it's always available
        let cotBias = '--';
        let cotScore = null;
        if (meta.cotKey) {
          const cot = loadCOTSentiment(meta.cotKey);
          cotBias = cot.cotBias;
          cotScore = cot.cotScore;
        }

        let breakoutDirectionInfo = null;

        if (timeInZone > 30) {
          phase = 'Phase 1.5';
          breakoutStatus = 'Stale Compression';
          notes = 'Price has coiled >30 candles in range. Watch for fade.';
        }

        const validBreakout = closeAboveHigh && isFullBody && reflex > 0.001;

        // Debug Phase 2 criteria
        if (closeAboveHigh) {
          console.log(`    [PHASE2 DEBUG] ${symbol}: closeAboveHigh=true, isFullBody=${isFullBody} (body=${body.toFixed(4)}, rangeWidth=${rangeWidth.toFixed(4)}, ratio=${(body/rangeWidth).toFixed(4)}), reflex=${reflex.toFixed(4)} > 0.001 = ${reflex > 0.001}`);
        }

        // Tightened Pre-Breakout Watch logic for both Bullish (near high) and Bearish (near low)
        const pctAwayHigh = Number((rangeHigh - lastClosed.close) / rangeHigh);
        const pctAwayLow = Number((lastClosed.close - rangeLow) / rangeLow);
        const priceNearRangeHigh = pctAwayHigh >= 0 && pctAwayHigh <= 0.03; // within 3%
        const priceNearRangeLow = pctAwayLow >= 0 && pctAwayLow <= 0.03;   // within 3%
        const minTimeInZone = timeInZone >= 2; // at least 2 bars
        const reflexOkBull = reflex > 0.003;
        const reflexOkBear = reflex < -0.003;
        const structureOk = structure > 0.08;
        // Body clustering: last 3 bodies > 0.15 of candle range
        const last3 = base.slice(-4, -1); // last 3 completed candles
        const recentClosesNearTop = last3.every(c => (rangeHigh - c.close) < 0.07 * rangeHigh);
        const recentClosesNearLow = last3.every(c => (c.close - rangeLow) < 0.07 * rangeLow);
        const bodyClustering = last3.every(c => {
          const body = Math.abs(c.close - c.open);
          const candleRange = c.high - c.low;
          return candleRange > 0 && (body / candleRange) > 0.15;
        });
        let debug = {
          priceNearRangeHigh,
          priceNearRangeLow,
          pctAwayHigh: +(pctAwayHigh * 100).toFixed(2),
          pctAwayLow: +(pctAwayLow * 100).toFixed(2),
          minTimeInZone,
          reflexOkBull,
          reflexOkBear,
          structureOk,
          recentClosesNearTop,
          recentClosesNearLow,
          bodyClustering,
          timeInZone,
          reflex,
          structure,
          last3Closes: last3.map(c => c.close),
          last3Bodies: last3.map(c => Math.abs(c.close - c.open)),
          last3Ranges: last3.map(c => c.high - c.low),
        };
        console.log(`    [DEBUG] Debug object priceNearRangeHigh: ${debug.priceNearRangeHigh}`);
        let failedCriteria = [];
        if (!priceNearRangeHigh) failedCriteria.push('priceNearRangeHigh');
        if (!priceNearRangeLow) failedCriteria.push('priceNearRangeLow');
        if (!minTimeInZone) failedCriteria.push('minTimeInZone');
        if (!structureOk) failedCriteria.push('structureOk');
        if (!bodyClustering) failedCriteria.push('bodyClustering');
        if (!recentClosesNearTop) failedCriteria.push('recentClosesNearTop');
        if (!recentClosesNearLow) failedCriteria.push('recentClosesNearLow');
        debug.failedCriteria = failedCriteria;
        if (
          ((priceNearRangeHigh && reflexOkBull && recentClosesNearTop) ||
           (priceNearRangeLow && reflexOkBear && recentClosesNearLow)) &&
          minTimeInZone &&
          structureOk &&
          bodyClustering
        ) {
          phase = 'Phase 1.8';
          breakoutStatus = 'Pre-Breakout Watch';
          let breakoutDirection = 'Unknown';
          let directionConfidence = 'Low';
          let reflexDirection = 'Neutral';
          let cotAlignment = 'Unknown';
          let pricePosition = '';
          let structureStrength = structure > 0.15 ? 'Strong' : structure > 0.10 ? 'Moderate' : 'Weak';
          if (priceNearRangeHigh) {
            // Bullish Pre-Breakout
            reflexDirection = reflex > 0.01 ? 'Bullish' : reflex > 0.005 ? 'Moderately Bullish' : 'Weak Bullish';
            cotAlignment = cotBias && cotBias !== 'No COT' && cotBias !== '--' ? 
              (cotBias.includes('Bullish') ? 'Bullish' : cotBias.includes('Bearish') ? 'Bearish' : 'Neutral') : 'Unknown';
            pricePosition = pctAwayHigh < 0.01 ? 'Very Near High' : pctAwayHigh < 0.025 ? 'Near High' : 'Moderately Near High';
            if (reflex > 0.01 && cotAlignment === 'Bullish') {
              breakoutDirection = 'Bullish';
              directionConfidence = 'High';
            } else if (reflex > 0.005 && (cotAlignment === 'Bullish' || cotAlignment === 'Neutral')) {
              breakoutDirection = 'Bullish';
              directionConfidence = 'Medium';
            } else if (reflex > 0.002) {
              breakoutDirection = 'Bullish';
              directionConfidence = 'Low';
            } else {
              breakoutDirection = 'Weak Bullish';
              directionConfidence = 'Low';
            }
            notes = `Pre-breakout setup: ${breakoutDirection} (${directionConfidence} confidence). Reflex: ${reflexDirection}, COT: ${cotAlignment}, Position: ${pricePosition}, Structure: ${structureStrength}.`;
            setupType = `Pre-Breakout ${breakoutDirection}`;
          } else if (priceNearRangeLow) {
            // Bearish Pre-Breakout
            reflexDirection = reflex < -0.01 ? 'Bearish' : reflex < -0.005 ? 'Moderately Bearish' : 'Weak Bearish';
            cotAlignment = cotBias && cotBias !== 'No COT' && cotBias !== '--' ? 
              (cotBias.includes('Bearish') ? 'Bearish' : cotBias.includes('Bullish') ? 'Bullish' : 'Neutral') : 'Unknown';
            pricePosition = pctAwayLow < 0.01 ? 'Very Near Low' : pctAwayLow < 0.025 ? 'Near Low' : 'Moderately Near Low';
            if (reflex < -0.01 && cotAlignment === 'Bearish') {
              breakoutDirection = 'Bearish';
              directionConfidence = 'High';
            } else if (reflex < -0.005 && (cotAlignment === 'Bearish' || cotAlignment === 'Neutral')) {
              breakoutDirection = 'Bearish';
              directionConfidence = 'Medium';
            } else if (reflex < -0.002) {
              breakoutDirection = 'Bearish';
              directionConfidence = 'Low';
            } else {
              breakoutDirection = 'Weak Bearish';
              directionConfidence = 'Low';
            }
            notes = `Pre-breakout setup: ${breakoutDirection} (${directionConfidence} confidence). Reflex: ${reflexDirection}, COT: ${cotAlignment}, Position: ${pricePosition}, Structure: ${structureStrength}.`;
            setupType = `Pre-Breakout ${breakoutDirection}`;
          }
          breakoutDirectionInfo = {
            direction: breakoutDirection,
            confidence: directionConfidence,
            reflexDirection,
            cotAlignment,
            pricePosition,
            structureStrength
          };
        }

        // Set isPreBreakout flag
        isPreBreakout = phase === 'Phase 1.8' && setupType && setupType.startsWith('Pre-Breakout');

        // Phase 1: Coiling (default state) - only if not Phase 1.8, 2, 3, or 4
        if (!validBreakout && phase === 'Phase 1') {
          phase = 'Phase 1';
          breakoutStatus = 'Coiling';
          notes = '';
          setupType = '';
          breakoutInfo = null; // Reset breakout tracking
        }

        // Phase 2: Confirmed Breakout
        if (validBreakout) {
          phase = 'Phase 2';
          breakoutStatus = 'Confirmed Breakout';
          notes = 'Clean close above range with reflex confirmation.';
          
          // Store breakout info for Phase 3/4 tracking
          breakoutInfo = {
            level: rangeHigh,
            direction: 'bullish',
            barIndex: base.length - 1,
            price: lastClosed.close
          };
        }
        // Phase 3: Trend Continuation (was Phase 2 recently, still above breakout)
        else if (breakoutInfo && breakoutInfo.direction === 'bullish') {
          const barsSinceBreakout = base.length - 1 - breakoutInfo.barIndex;
          const priceAboveBreakout = lastClosed.close >= breakoutInfo.level * 0.998; // 0.2% buffer
          const noStrongReversal = reflex > -0.003; // not strongly bearish
          const structureOk = structure > 0.08;
          
          // Debug Phase 3 criteria
          if (barsSinceBreakout <= 5) {
            console.log(`    [PHASE3 DEBUG] ${symbol}: barsSinceBreakout=${barsSinceBreakout} <= 5, priceAboveBreakout=${priceAboveBreakout} (current=${lastClosed.close.toFixed(4)}, breakout=${breakoutInfo.level.toFixed(4)}), noStrongReversal=${noStrongReversal} (reflex=${reflex.toFixed(4)}), structureOk=${structureOk} (structure=${structure.toFixed(4)})`);
          }
          
          if (barsSinceBreakout <= 5 && priceAboveBreakout && noStrongReversal && structureOk) {
            phase = 'Phase 3';
            breakoutStatus = 'Trend Continuation';
            notes = `Trend continuation: Price above breakout (${breakoutInfo.level.toFixed(4)}), bars since breakout: ${barsSinceBreakout}, reflex: ${reflex.toFixed(4)}, structure: ${structure.toFixed(4)}.`;
          }
        }
        // Phase 4: Fade/Failure (breakout failed, price back inside range)
        else if (breakoutInfo && breakoutInfo.direction === 'bullish') {
          const priceBackInside = lastClosed.close < breakoutInfo.level * 0.998;
          const strongReversal = reflex < -0.003; // strongly bearish
          const weakStructure = structure < 0.08;
          
          // Debug Phase 4 criteria
          console.log(`    [PHASE4 DEBUG] ${symbol}: priceBackInside=${priceBackInside} (current=${lastClosed.close.toFixed(4)}, breakout=${breakoutInfo.level.toFixed(4)}), strongReversal=${strongReversal} (reflex=${reflex.toFixed(4)}), weakStructure=${weakStructure} (structure=${structure.toFixed(4)})`);
          
          if (priceBackInside || strongReversal || weakStructure) {
            phase = 'Phase 4';
            breakoutStatus = 'Fade/Failure';
            const reasons = [];
            if (priceBackInside) reasons.push('Price back inside range');
            if (strongReversal) reasons.push('Strong bearish reversal');
            if (weakStructure) reasons.push('Weak structure');
            notes = `Fade/Failure: ${reasons.join(', ')}. Breakout level: ${breakoutInfo.level.toFixed(4)}, current: ${lastClosed.close.toFixed(4)}, reflex: ${reflex.toFixed(4)}, structure: ${structure.toFixed(4)}.`;
            
            // Reset breakout info after fade
            breakoutInfo = null;
          }
        }
        // Additional fade and breakdown logic
        else if (fadeOut && timeInZone >= 10) {
          phase = 'Phase 3';
          breakoutStatus = 'Failed Breakout – Fade';
          notes = 'Breakout failed; price rejected back inside range.';
          setupType = '';
          fadeRisk = true;
        } else if (reflex < -0.01 && lastClosed.close < rangeLow) {
          phase = 'Phase 4';
          breakoutStatus = 'Confirmed Breakdown';
          notes = 'Price broke below support with bearish reflex.';
          setupType = '';
        }

        const structureStrength = rangeWidth < 2 * atr
          ? 'Structured'
          : rangeWidth > 3 * atr
            ? 'Noisy'
            : 'Normal';

        // Compute reflex history for smoothing bias
        const reflexHistory = [];
        for (let i = base.length - 3; i < base.length; i++) {
          if (i > 0) {
            const r = (base[i].close - base[i - 1].close) / base[i - 1].close;
            reflexHistory.push(+r.toFixed(3));
          }
        }
        bias = classifyBias(phase, reflex, reflexHistory);

        // Console debug output for terminal viewing
        console.log(`\n[DEBUG] ${symbol} (${meta.assetClass}):`);
        console.log(`  Phase: ${phase} | Status: ${breakoutStatus} | Setup: ${setupType}`);
        console.log(`  Price: ${lastClosed.close.toFixed(4)} | Range: ${rangeLow.toFixed(4)}-${rangeHigh.toFixed(4)} | Time in Zone: ${timeInZone}`);
        console.log(`  Reflex: ${reflex.toFixed(4)} | Structure: ${structure.toFixed(4)} | Volatility: ${volatility.toFixed(4)}`);
        console.log(`  Debug Criteria:`);
        console.log(`    Price Near Range High: ${priceNearRangeHigh} (${debug.pctAwayHigh}% away, raw: ${pctAwayHigh})`);
        console.log(`    Price Near Range Low: ${priceNearRangeLow} (${debug.pctAwayLow}% away, raw: ${pctAwayLow})`);
        console.log(`    Min Time in Zone: ${minTimeInZone} (${timeInZone} bars)`);
        console.log(`    Reflex OK: ${reflexOkBull} (${reflex.toFixed(4)})`);
        console.log(`    Structure OK: ${structureOk} (${structure.toFixed(4)})`);
        console.log(`    Recent Closes Near Top: ${recentClosesNearTop}`);
        console.log(`    Recent Closes Near Low: ${recentClosesNearLow}`);
        console.log(`    Body Clustering: ${bodyClustering}`);
        console.log(`  Failed Criteria: ${failedCriteria.length > 0 ? failedCriteria.join(', ') : 'None'}`);
        console.log(`  Last 3 Closes: [${last3.map(c => c.close.toFixed(4)).join(', ')}]`);
        console.log(`  Last 3 Bodies: [${last3.map(c => Math.abs(c.close - c.open).toFixed(4)).join(', ')}]`);
        console.log(`  Last 3 Ranges: [${last3.map(c => (c.high - c.low).toFixed(4)).join(', ')}]`);
        console.log(`  Notes: ${notes}`);

        // === Phase Diagnostics (Universal) ===
        console.log(`\n🧭 [PHASE DIAGNOSTIC] ${symbol} (${meta.assetClass})`);
        console.log(`  ➤ Phase: ${phase} | Status: ${breakoutStatus}`);
        console.log(`  ➤ Close: ${lastClosed.close.toFixed(4)} | Range: ${rangeLow.toFixed(4)} - ${rangeHigh.toFixed(4)} | Time in Zone: ${timeInZone}`);
        console.log(`  ➤ Body: ${body.toFixed(4)} (${(body / rangeWidth * 100).toFixed(2)}% of range) | Reflex: ${reflex.toFixed(4)} | Structure: ${structure.toFixed(4)} | Volatility: ${volatility.toFixed(4)} | ATR: ${atr.toFixed(4)}`);
        console.log(`  ➤ COT Bias: ${cotBias} | SetupType: ${setupType}`);
        console.log(`  ➤ Breakdown Flags: fadeOut=${fadeOut}, reflex<-0.01=${reflex < -0.01}, close<rangeLow=${lastClosed.close < rangeLow}`);

        if (phase === 'Phase 1.8') {
          console.log(`  🟡 Phase 1.8 Diagnostic: Near Breakout Conditions`);
          console.log(`    - Close Above High: ${closeAboveHigh}`);
          console.log(`    - Is Full Body: ${isFullBody}`);
          console.log(`    - Reflex > 0.001: ${reflex > 0.001}`);
          console.log(`    - Failed Criteria for Phase 2: ${failedCriteria.length ? failedCriteria.join(', ') : 'None — may promote soon'}`);
        }
        if (phase === 'Phase 2') {
          console.log(`  🟢 Phase 2 Confirmed:`);
          console.log(`    - Valid Breakout Detected`);
          console.log(`    - Body: ${body.toFixed(4)}, Reflex: ${reflex.toFixed(4)}, Structure: ${structure.toFixed(4)}`);
        }
        if (phase === 'Phase 3') {
          console.log(`  🔵 Phase 3 Continuation Detected:`);
          console.log(`    - Bars Since Breakout: ${breakoutInfo ? base.length - 1 - breakoutInfo.barIndex : 'N/A'}`);
          console.log(`    - Price Still Above Breakout: ${lastClosed.close >= (breakoutInfo?.level || 0) * 0.998}`);
        }
        if (phase === 'Phase 4') {
          console.log(`  🔴 Phase 4 Detected:`);
          console.log(`    - Price Below Range or Strong Reversal`);
          console.log(`    - Reflex: ${reflex.toFixed(4)} | Structure: ${structure.toFixed(4)}`);
        }
        if (phase === 'Phase 1' && breakoutStatus === 'Stale Compression') {
          console.log(`  🟠 Stale Compression (Phase 1.5) Warning:`);
          console.log(`    - Time in Range: ${timeInZone}`);
        }
        if (phase === 'Phase 1' && breakoutStatus === 'Coiling') {
          console.log(`  🟤 Neutral Coil:`);
          console.log(`    - No breakout attempts detected`);
        }

        console.log(`  ➤ Final Notes: ${notes}`);

        return {
          symbol,
          phase,
          bias,
          reflex: +reflex,
          structure: +structure,
          volatility: +volatility,
          atr: +atr,
          rangeHigh,
          rangeLow,
          close: lastClosed.close,
          open: lastClosed.open,
          timeInZone,
          status: breakoutStatus,
          notes,
          structureStrength,
          fadeRisk,
          priceSource: source,
          timeframe,
          sparkline: recent.slice(-10).map(c => c.close),
          setupType: setupType || '--',
          cotBias,
          cotScore,
          assetClass: meta.assetClass || 'Unclassified',
          debug,
          breakoutDirection: breakoutDirectionInfo || null,
          isPreBreakout,
          breakoutStrengthScore: breakoutStrengthScore ?? null,
          expansionRatio: expansionRatio ?? null,
          wasPhase2Recently: wasPhase2Recently ?? false,
          timeSinceBreakout: timeSinceBreakout ?? null,
          isBreakoutBar: isBreakoutBar ?? false,
        };
      } catch (err) {
        console.error(`[PhaseMonitor] Error for ${symbol}:`, err.message);
        return null;
      }
    })
  );

  phaseMonitorCache = results.filter(Boolean);
  phaseMonitorCacheTime = now;
  
  // Summary statistics
  const phaseCounts = {};
  const setupCounts = {};
  phaseMonitorCache.forEach(result => {
    phaseCounts[result.phase] = (phaseCounts[result.phase] || 0) + 1;
    if (result.setupType) {
      setupCounts[result.setupType] = (setupCounts[result.setupType] || 0) + 1;
    }
  });
  
  console.log(`\n[SUMMARY] Phase Distribution:`);
  Object.entries(phaseCounts).forEach(([phase, count]) => {
    console.log(`  ${phase}: ${count} assets`);
  });
  
  if (Object.keys(setupCounts).length > 0) {
    console.log(`\n[SUMMARY] Setup Distribution:`);
    Object.entries(setupCounts).forEach(([setup, count]) => {
      console.log(`  ${setup}: ${count} assets`);
    });
  }
  
  console.log(`\n[SUMMARY] Total Assets Processed: ${phaseMonitorCache.length}`);
  
  return phaseMonitorCache;
}

export async function scanPhaseMonitor(req, res, returnRaw = false) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    if (forceRefresh) phaseMonitorCache = null;
    const results = await getPhaseMonitorData(forceRefresh);
    if (returnRaw) return results;
    res.json(results);
  } catch (err) {
    console.error('[PhaseMonitor] Error:', err);
    if (returnRaw) return { error: err.message };
    res.status(500).json({ error: err.message });
  }
}
