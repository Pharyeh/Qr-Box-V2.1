import yahooFinance from 'yahoo-finance2';
yahooFinance.suppressNotices(['ripHistorical']);

const symbolMap = {
  'XAUUSD=X': 'GC=F',
  'XAGUSD=X': 'SI=F',
  'DJI': '^DJI',
  'IXIC': '^IXIC',
  'SPX': '^GSPC',
  'FTSE': '^FTSE',
  'N225': '^N225',
};

function toUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

export async function getYahooCandles(symbol) {
  try {
    const yahooSymbol = symbolMap[symbol] || symbol;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const result = await yahooFinance.chart(yahooSymbol, {
      period1: toUnix(startDate), // ✅ converted to UNIX timestamp
      period2: toUnix(endDate),
      interval: '1d'
    });

    if (!result.quotes || result.quotes.length === 0) {
      console.error(`[YahooFinance ERROR] ${symbol}: No data available`);
      return null;
    }

    return result.quotes.map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume
    }));
  } catch (error) {
    console.error(`[YahooFinance ERROR] ${symbol}:`, error.message);
    return null;
  }
}
