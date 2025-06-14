// Darvas Box detection engine for QR Box

/**
 * Detect Darvas Boxes and breakouts in price data.
 * @param {Array} candles - Array of {open, high, low, close, time} objects, oldest to newest.
 * @param {Object} options - { consolidationBars, maxBoxes, cooldownBars, symbol, assetClass }
 * @returns {Array} Darvas boxes: { start, end, top, bottom, direction, breakoutBar, isFreshBreakout }
 */
export function detectDarvasBoxes(candles, options = {}) {
  const {
    consolidationBars = 5,
    maxBoxes = 5,
    cooldownBars = 2,
    symbol = '',
    assetClass = ''
  } = options;

  if (!candles || candles.length < consolidationBars + 2) return [];

  const boxes = [];
  let curTop = null, curBot = null, curStart = null, curEnd = null;
  let inBox = false, barsSinceHigh = 0, lastBreakoutBar = -Infinity;

  for (let i = 1; i < candles.length; ++i) {
    const c = candles[i];
    if ((curTop === null || c.high > curTop) && i > lastBreakoutBar + cooldownBars) {
      curTop = c.high;
      curBot = c.low;
      curStart = i;
      barsSinceHigh = 0;
      inBox = true;
    } else {
      barsSinceHigh++;
      if (c.low < curBot) curBot = c.low;
      if (inBox && barsSinceHigh >= consolidationBars) {
        curEnd = i;
        boxes.unshift({
          start: curStart,
          end: curEnd,
          top: curTop,
          bottom: curBot,
          direction: 0,
          breakoutBar: null,
          isFreshBreakout: false,
          symbol,
          assetClass
        });
        if (boxes.length > maxBoxes) boxes.pop();
        curTop = curBot = curStart = curEnd = null;
        inBox = false;
        barsSinceHigh = 0;
      }
    }
  }

  // Detect breakouts
  for (let i = 0; i < boxes.length; ++i) {
    const box = boxes[i];
    const endIdx = box.end;
    if (endIdx + 1 >= candles.length || box.direction !== 0) continue;

    const after = candles[endIdx + 1];
    const atrCandles = candles.slice(Math.max(0, endIdx - 13), endIdx + 2);
    const atr = atrCandles.slice(1).map((c, j) => {
      const prev = atrCandles[j];
      return Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close));
    }).reduce((a, b) => a + b, 0) / Math.max(1, atrCandles.length - 1);

    const buffer = (assetClass === 'Forex') ? 0.1 * atr : 0;

    if (after.close > box.top + buffer) {
      if (
        assetClass !== 'Forex' ||
        (candles[endIdx + 2] && candles[endIdx + 2].close > box.top + buffer)
      ) {
        box.direction = 1;
        box.breakoutBar = endIdx + 1;
        box.isFreshBreakout = (endIdx + 1 === candles.length - 1);
        lastBreakoutBar = endIdx + 1;
      }
    } else if (after.close < box.bottom - buffer) {
      if (
        assetClass !== 'Forex' ||
        (candles[endIdx + 2] && candles[endIdx + 2].close < box.bottom - buffer)
      ) {
        box.direction = -1;
        box.breakoutBar = endIdx + 1;
        box.isFreshBreakout = (endIdx + 1 === candles.length - 1);
        lastBreakoutBar = endIdx + 1;
      }
    }
  }

  return boxes;
}
