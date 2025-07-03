// server/utils/symbolMapping.js
import { COT_MAP } from './cotMapping.js';

export const SYMBOL_MAP = {
  // Forex
  EURUSD: { oanda: 'EUR_USD', tingo: 'eurusd', assetClass: 'Forex', cotKey: 'EURUSD', tradingview: 'OANDA:EURUSD' },
  GBPUSD: { oanda: 'GBP_USD', tingo: 'gbpusd', assetClass: 'Forex', cotKey: 'GBPUSD', tradingview: 'OANDA:GBPUSD' },
  USDJPY: { oanda: 'USD_JPY', tingo: 'usdjpy', assetClass: 'Forex', cotKey: 'USDJPY', invertCot: true, tradingview: 'OANDA:USDJPY' },
  AUDUSD: { oanda: 'AUD_USD', tingo: 'audusd', assetClass: 'Forex', cotKey: 'AUDUSD', tradingview: 'OANDA:AUDUSD' },
  NZDUSD: { oanda: 'NZD_USD', tingo: 'nzdusd', assetClass: 'Forex', cotKey: 'NZDUSD', tradingview: 'OANDA:NZDUSD' },
  USDCAD: { oanda: 'USD_CAD', tingo: 'usdcad', assetClass: 'Forex', cotKey: 'USDCAD', invertCot: true, tradingview: 'OANDA:USDCAD' },
  USDCHF: { oanda: 'USD_CHF', tingo: 'usdchf', assetClass: 'Forex', cotKey: 'USDCHF', invertCot: true, tradingview: 'OANDA:USDCHF' },
  //EURGBP: { oanda: 'EUR_GBP', yahoo: 'EURGBP=X', tradingview: 'OANDA:EURGBP', tradovate: undefined, assetClass: 'Forex', cotKey: 'EURGBP' },
  //EURJPY: { oanda: 'EUR_JPY', yahoo: 'EURJPY=X', tradingview: 'OANDA:EURJPY', tradovate: undefined, assetClass: 'Forex', cotKey: 'EURJPY' },
  //GBPJPY: { oanda: 'GBP_JPY', yahoo: 'GBPJPY=X', tradingview: 'OANDA:GBPJPY', tradovate: undefined, assetClass: 'Forex', cotKey: 'GBPJPY' },
  //CHFJPY: { oanda: 'CHF_JPY', yahoo: 'CHFJPY=X', tradingview: 'OANDA:CHFJPY', tradovate: undefined, assetClass: 'Forex', cotKey: 'CHFJPY' },

  // Metals
  XAUUSD: { oanda: 'XAU_USD', tingo: 'xauusd', assetClass: 'Metals', cotKey: 'XAUUSD', tradingview: 'OANDA:XAUUSD' },
  XAGUSD: { oanda: 'XAG_USD', tingo: 'xagusd', assetClass: 'Metals', cotKey: 'XAGUSD', tradingview: 'OANDA:XAGUSD' },
  XPDUSD: { oanda: 'XPD_USD', tingo: 'xpdusd', assetClass: 'Metals', cotKey: 'XPDUSD', tradingview: 'OANDA:XPDUSD' },
  XPTUSD: { oanda: 'XPT_USD', tingo: 'xptusd', assetClass: 'Metals', cotKey: 'XPTUSD', tradingview: 'OANDA:XPTUSD' },
  XCU: { tingo: 'XCU', assetClass: 'Metals', tradingview: 'OANDA:XCUUSD' }, // Copper spot

  // Grains
  WHEATUSD: { oanda: 'WHEAT_USD', tingo: 'wheatusd', assetClass: 'Grains', cotKey: 'WHEATUSD', tradingview: 'OANDA:WHEATUSD' },
  SOYBNUSD: { oanda: 'SOYBN_USD', tingo: 'soybnusd', assetClass: 'Grains', cotKey: 'SOYBNUSD', tradingview: 'OANDA:SOYBNUSD' },
  CORNUSD: { oanda: 'CORN_USD', tingo: 'cornusd', assetClass: 'Grains', cotKey: 'CORNUSD', tradingview: 'OANDA:CORNUSD' },
  SOYBEANOIL: { tingo: 'SOYBEANOIL', assetClass: 'Grains', tradingview: 'OANDA:SOYBEANOILUSD' }, // Soybean Oil spot
  SOYBEANMEAL: { tingo: 'SOYBEANMEAL', assetClass: 'Grains', tradingview: 'OANDA:SOYBEANMEALUSD' }, // Soybean Meal spot

  // Agriculture
  BEEF: { tingo: 'BEEF', assetClass: 'Agriculture', tradingview: 'OANDA:BEEFUSD' }, // Beef spot (Live Cattle)
  LEANHOG: { tingo: 'LEANHOG', assetClass: 'Agriculture', tradingview: 'OANDA:LEANHOGUSD' }, // Lean Hog spot

  // Energy
  WTICOUSD: { oanda: 'WTICO_USD', tingo: 'wticousd', assetClass: 'Energy', cotKey: 'WTICOUSD', tradingview: 'OANDA:WTICOUSD' },
  NATGASUSD: { oanda: 'NATGAS_USD', tingo: 'natgasusd', assetClass: 'Energy', cotKey: 'NATGASUSD', tradingview: 'OANDA:NATGASUSD' },

  // Indices
  SPX500USD: { oanda: 'SPX500_USD', tingo: 'spx500usd', assetClass: 'Indices', cotKey: 'SPX500USD', tradingview: 'OANDA:SPX500USD' },
  NAS100USD: { oanda: 'NAS100_USD', tingo: 'nas100usd', assetClass: 'Indices', cotKey: 'NAS100USD', tradingview: 'OANDA:NAS100USD' },
  US30USD: { oanda: 'US30_USD', tingo: 'us30usd', assetClass: 'Indices', cotKey: 'US30USD', tradingview: 'OANDA:US30USD' },
  US2000USD: { oanda: 'US2000_USD', tingo: 'us2000usd', assetClass: 'Indices', cotKey: 'US2000USD', tradingview: 'OANDA:US2000USD' },

  // Crypto (Tradovate supports CME crypto futures)
  BTCUSD: { oanda: 'BTC_USD', tingo: 'btcusd', assetClass: 'Crypto', cotKey: 'BTCUSD', tradingview: 'BINANCE:BTCUSDT' },
  ETHUSD: { oanda: 'ETH_USD', tingo: 'ethusd', assetClass: 'Crypto', cotKey: 'ETHUSD', tradingview: 'BINANCE:ETHUSDT' },

  // Rates
  USB10YUSD: { oanda: 'USB10Y_USD', tingo: 'usb10yusd', assetClass: 'Interest Rates', cotKey: 'USB10YUSD', tradingview: 'OANDA:USB10YUSD' },
  USB30YUSD: { oanda: 'USB30Y_USD', tingo: 'usb30yusd', assetClass: 'Interest Rates', cotKey: 'USB30YUSD', tradingview: 'OANDA:USB30YUSD' },
  USB05YUSD: { oanda: 'USB05Y_USD', tingo: 'usb05yusd', assetClass: 'Interest Rates', cotKey: 'USB05YUSD', tradingview: 'OANDA:USB05YUSD' },
  USB02YUSD: { oanda: 'USB02Y_USD', tingo: 'usb02yusd', assetClass: 'Interest Rates', cotKey: 'USB02YUSD', tradingview: 'OANDA:USB02YUSD' },

  // Stocks
  // DT: { yahoo: 'ADT', tradingview: 'NYSE:ADT', assetClass: 'Stocks', cotKey: COT_MAP['ADT'] }, 
  // SAN: { yahoo: 'SAN', tradingview: 'NYSE:SAN', assetClass: 'Stocks', cotKey: COT_MAP['SAN'] },
  // COMP: { yahoo: 'COMP', tradingview: 'NYSE:COMP', assetClass: 'Stocks', cotKey: COT_MAP['COMP'] },
  // HL: { yahoo: 'HL', tradingview: 'NYSE:HL', assetClass: 'Stocks', cotKey: COT_MAP['HL'] },  
  // STLA: { yahoo: 'STLA', tradingview: 'NYSE:STLA', assetClass: 'Stocks', cotKey: COT_MAP['STLA'] },
  // VALE: { yahoo: 'VALE', tradingview: 'NYSE:VALE', assetClass: 'Stocks', cotKey: COT_MAP['VALE'] },
  // NU: { yahoo: 'NU', tradingview: 'NYSE:NU', assetClass: 'Stocks', cotKey: COT_MAP['NU'] },
  // TDOC: { yahoo: 'TDOC', tradingview: 'NYSE:TDOC', assetClass: 'Stocks', cotKey: COT_MAP['TDOC'] }, 
  // USEG: { yahoo: 'USEG', tradingview: 'AMEX:USEG', assetClass: 'Stocks', cotKey: COT_MAP['USEG'] },
  // ICON: { yahoo: 'ICON', tradingview: 'NASDAQ:ICNC', assetClass: 'Stocks', cotKey: COT_MAP['ICON'] },
  // INDO: { yahoo: 'INDO', tradingview: 'AMEX:INDO', assetClass: 'Stocks', cotKey: COT_MAP['INDO'] },
  // SBET: { yahoo: 'SBET', tradingview: 'OTC:SBET', assetClass: 'Stocks', cotKey: COT_MAP['SBET'] },
  // OKLO: { yahoo: 'OKLO', tradingview: 'NYSE:OKLO', assetClass: 'Stocks', cotKey: COT_MAP['OKLO'] },
  // RTBR: { yahoo: 'LTBR', tradingview: 'NASDAQ:LTBR', assetClass: 'Stocks', cotKey: COT_MAP['LTBR'] },
  // UEC: { yahoo: 'UEC', tradingview: 'AMEX:UEC', assetClass: 'Stocks', cotKey: COT_MAP['UEC'] },
  // F: { yahoo: 'F', tradingview: 'NYSE:F', assetClass: 'Stocks', cotKey: COT_MAP['F'] }, 
  // RIVN: { yahoo: 'RIVN', tradingview: 'NASDAQ:RIVN', assetClass: 'Stocks', cotKey: COT_MAP['RIVN'] },
  // SIGA: { yahoo: 'SIGA', tradingview: 'NASDAQ:SIGA', assetClass: 'Stocks', cotKey: COT_MAP['SIGA'] },
  // ACHR: { yahoo: 'ACHR', tradingview: 'NYSE:ACHR', assetClass: 'Stocks', cotKey: COT_MAP['ACHR'] }, 
  // BLDE: { yahoo: 'BLDE', tradingview: 'NASDAQ:BLDE', assetClass: 'Stocks', cotKey: COT_MAP['BLDE'] },
  // BZUN: { yahoo: 'BZUN', tradingview: 'NASDAQ:BZUN', assetClass: 'Stocks', cotKey: COT_MAP['BZUN'] },
  // PLBY: { yahoo: 'PLBY', tradingview: 'NASDAQ:PLBY', assetClass: 'Stocks', cotKey: COT_MAP['PLBY'] },
  // PRCH: { yahoo: 'PRCH', tradingview: 'NASDAQ:PRCH', assetClass: 'Stocks', cotKey: COT_MAP['PRCH'] },

  // --- RANDOM US STOCKS SAMPLE ---
  // AAPL: { yahoo: 'AAPL', tradingview: 'NASDAQ:AAPL', assetClass: 'Stocks', cotKey: null },
  // MSFT: { yahoo: 'MSFT', tradingview: 'NASDAQ:MSFT', assetClass: 'Stocks', cotKey: null },
  // TSLA: { yahoo: 'TSLA', tradingview: 'NASDAQ:TSLA', assetClass: 'Stocks', cotKey: null },
  // AMZN: { yahoo: 'AMZN', tradingview: 'NASDAQ:AMZN', assetClass: 'Stocks', cotKey: null },
  // NVDA: { yahoo: 'NVDA', tradingview: 'NASDAQ:NVDA', assetClass: 'Stocks', cotKey: null },
  // GOOGL: { yahoo: 'GOOGL', tradingview: 'NASDAQ:GOOGL', assetClass: 'Stocks', cotKey: null },
  // META: { yahoo: 'META', tradingview: 'NASDAQ:META', assetClass: 'Stocks', cotKey: null },
  // JPM: { yahoo: 'JPM', tradingview: 'NYSE:JPM', assetClass: 'Stocks', cotKey: null },
  // BAC: { yahoo: 'BAC', tradingview: 'NYSE:BAC', assetClass: 'Stocks', cotKey: null },
  // WMT: { yahoo: 'WMT', tradingview: 'NYSE:WMT', assetClass: 'Stocks', cotKey: null },
  // DIS: { yahoo: 'DIS', tradingview: 'NYSE:DIS', assetClass: 'Stocks', cotKey: null },
  // NFLX: { yahoo: 'NFLX', tradingview: 'NASDAQ:NFLX', assetClass: 'Stocks', cotKey: null },
  // INTC: { yahoo: 'INTC', tradingview: 'NASDAQ:INTC', assetClass: 'Stocks', cotKey: null },
  // PFE: { yahoo: 'PFE', tradingview: 'NYSE:PFE', assetClass: 'Stocks', cotKey: null },
  // T: { yahoo: 'T', tradingview: 'NYSE:T', assetClass: 'Stocks', cotKey: null },
  // VZ: { yahoo: 'VZ', tradingview: 'NYSE:VZ', assetClass: 'Stocks', cotKey: null },
  // BA: { yahoo: 'BA', tradingview: 'NYSE:BA', assetClass: 'Stocks', cotKey: null },
  // MCD: { yahoo: 'MCD', tradingview: 'NYSE:MCD', assetClass: 'Stocks', cotKey: null },
  // KO: { yahoo: 'KO', tradingview: 'NYSE:KO', assetClass: 'Stocks', cotKey: null },
  // NKE: { yahoo: 'NKE', tradingview: 'NYSE:NKE', assetClass: 'Stocks', cotKey: null },
  // SBUX: { yahoo: 'SBUX', tradingview: 'NASDAQ:SBUX', assetClass: 'Stocks', cotKey: null },
  // ORCL: { yahoo: 'ORCL', tradingview: 'NYSE:ORCL', assetClass: 'Stocks', cotKey: null },
  // CSCO: { yahoo: 'CSCO', tradingview: 'NASDAQ:CSCO', assetClass: 'Stocks', cotKey: null },
  // ABT: { yahoo: 'ABT', tradingview: 'NYSE:ABT', assetClass: 'Stocks', cotKey: null },
  // HON: { yahoo: 'HON', tradingview: 'NASDAQ:HON', assetClass: 'Stocks', cotKey: null },
  // QCOM: { yahoo: 'QCOM', tradingview: 'NASDAQ:QCOM', assetClass: 'Stocks', cotKey: null },
  // IBM: { yahoo: 'IBM', tradingview: 'NYSE:IBM', assetClass: 'Stocks', cotKey: null },
  // GE: { yahoo: 'GE', tradingview: 'NYSE:GE', assetClass: 'Stocks', cotKey: null },
  // GM: { yahoo: 'GM', tradingview: 'NYSE:GM', assetClass: 'Stocks', cotKey: null },
  // FDX: { yahoo: 'FDX', tradingview: 'NYSE:FDX', assetClass: 'Stocks', cotKey: null },
};
