export async function safeFetch(fetchFn, symbol, ...args) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 seconds max
    const result = await fetchFn(symbol, ...args, { signal: controller.signal });
    clearTimeout(timeout);
    if (!result || result.length < 10) throw new Error('Empty or bad candle data');
    return result;
  } catch (err) {
    console.warn(`[SafeFetch] ${symbol}: ${err.message}`);
    return null;
  }
} 