// server/utils/symbolMapping.js
import { COT_MAP } from './cotMapping.js';

export const SYMBOL_MAP = {
  // Forex
  EURUSD: { oanda: 'EUR_USD', yahoo: 'EURUSD=X', tradingview: 'OANDA:EURUSD', assetClass: 'Forex', cotKey: COT_MAP['EURUSD'] },
  GBPUSD: { oanda: 'GBP_USD', yahoo: 'GBPUSD=X', tradingview: 'OANDA:GBPUSD', assetClass: 'Forex', cotKey: COT_MAP['GBPUSD'] },
  USDJPY: { oanda: 'USD_JPY', yahoo: 'USDJPY=X', tradingview: 'OANDA:USDJPY', assetClass: 'Forex', cotKey: COT_MAP['USDJPY'] },
  AUDUSD: { oanda: 'AUD_USD', yahoo: 'AUDUSD=X', tradingview: 'OANDA:AUDUSD', assetClass: 'Forex', cotKey: COT_MAP['AUDUSD'] },
  NZDUSD: { oanda: 'NZD_USD', yahoo: 'NZDUSD=X', tradingview: 'OANDA:NZDUSD', assetClass: 'Forex', cotKey: COT_MAP['NZDUSD'] },
  USDCAD: { oanda: 'USD_CAD', yahoo: 'USDCAD=X', tradingview: 'OANDA:USDCAD', assetClass: 'Forex', cotKey: COT_MAP['USDCAD'] },
  USDCHF: { oanda: 'USD_CHF', yahoo: 'USDCHF=X', tradingview: 'OANDA:USDCHF', assetClass: 'Forex', cotKey: COT_MAP['USDCHF'] },
  EURGBP: { oanda: 'EUR_GBP', yahoo: 'EURGBP=X', tradingview: 'OANDA:EURGBP', assetClass: 'Forex', cotKey: COT_MAP['EURGBP'] },
  EURJPY: { oanda: 'EUR_JPY', yahoo: 'EURJPY=X', tradingview: 'OANDA:EURJPY', assetClass: 'Forex', cotKey: COT_MAP['EURJPY'] },
  GBPJPY: { oanda: 'GBP_JPY', yahoo: 'GBPJPY=X', tradingview: 'OANDA:GBPJPY', assetClass: 'Forex', cotKey: COT_MAP['GBPJPY'] },
  CHFJPY: { oanda: 'CHF_JPY', yahoo: 'CHFJPY=X', tradingview: 'OANDA:CHFJPY', assetClass: 'Forex', cotKey: COT_MAP['CHFJPY'] },

  // Metals
  XAUUSD: { oanda: 'XAU_USD', yahoo: 'GC=F', tradingview: 'OANDA:XAUUSD', assetClass: 'Commodities', cotKey: COT_MAP['XAUUSD'] },
  XAGUSD: { oanda: 'XAG_USD', yahoo: 'SI=F', tradingview: 'OANDA:XAGUSD', assetClass: 'Commodities', cotKey: COT_MAP['XAGUSD'] },

  // Energy
  WTICOUSD: { oanda: 'WTICO_USD', yahoo: 'CL=F', tradingview: 'OANDA:WTICOUSD', assetClass: 'Commodities', cotKey: COT_MAP['WTICOUSD'] },
  NATGASUSD: { oanda: 'NATGAS_USD', yahoo: 'NG=F', tradingview: 'OANDA:NATGASUSD', assetClass: 'Commodities', cotKey: COT_MAP['NATGASUSD'] },

  // Indices
  SPX500USD: { oanda: 'SPX500_USD', yahoo: 'ES=F', tradingview: 'OANDA:SPX500USD', assetClass: 'Indices', cotKey: COT_MAP['SPX500USD'] },
  NAS100USD: { oanda: 'NAS100_USD', yahoo: 'NQ=F', tradingview: 'OANDA:NAS100USD', assetClass: 'Indices', cotKey: COT_MAP['NAS100USD'] },
  US30USD: { oanda: 'US30_USD', yahoo: 'YM=F', tradingview: 'OANDA:US30USD', assetClass: 'Indices', cotKey: COT_MAP['US30USD'] },
  US2000USD: { oanda: 'US2000_USD', yahoo: 'RTY=F', tradingview: 'OANDA:US2000USD', assetClass: 'Indices', cotKey: COT_MAP['US2000USD'] },

  // Commodities (additional)
  COPPERUSD: { yahoo: 'HG=F', tradingview: 'OANDA:COPPERUSD', assetClass: 'Commodities', cotKey: COT_MAP['COPPERUSD'] },
  PLATINUMUSD: { yahoo: 'PL=F', tradingview: 'OANDA:PLATINUMUSD', assetClass: 'Commodities', cotKey: COT_MAP['PLATINUMUSD'] },
  PALLADIUMUSD: { yahoo: 'PA=F', tradingview: 'OANDA:PALLADIUMUSD', assetClass: 'Commodities', cotKey: COT_MAP['PALLADIUMUSD'] },
  CORNUSD: { yahoo: 'ZC=F', tradingview: 'OANDA:CORNUSD', assetClass: 'Commodities', cotKey: COT_MAP['CORNUSD'] },
  WHEATUSD: { yahoo: 'ZW=F', tradingview: 'OANDA:WHEATUSD', assetClass: 'Commodities', cotKey: COT_MAP['WHEATUSD'] },
  SOYBEANUSD: { yahoo: 'ZS=F', tradingview: 'OANDA:SOYBEANUSD', assetClass: 'Commodities', cotKey: COT_MAP['SOYBEANUSD'] },
  COFFEEUSD: { yahoo: 'KC=F', tradingview: 'OANDA:COFFEEUSD', assetClass: 'Commodities', cotKey: COT_MAP['COFFEEUSD'] },
  COCOAUSD: { yahoo: 'CC=F', tradingview: 'OANDA:COCOAUSD', assetClass: 'Commodities', cotKey: COT_MAP['COCOAUSD'] },
  SUGARUSD: { yahoo: 'SB=F', tradingview: 'OANDA:SUGARUSD', assetClass: 'Commodities', cotKey: COT_MAP['SUGARUSD'] },
  COTTONUSD: { yahoo: 'CT=F', tradingview: 'OANDA:COTTONUSD', assetClass: 'Commodities', cotKey: COT_MAP['COTTONUSD'] },
  OJUICEUSD: { yahoo: 'OJ=F', tradingview: 'OANDA:OJUICEUSD', assetClass: 'Commodities', cotKey: COT_MAP['OJUICEUSD'] },

  // Crypto
  BTCUSD: { oanda: 'BTC_USD', yahoo: 'BTC-USD', tradingview: 'CRYPTO:BTCUSD', assetClass: 'Crypto', cotKey: COT_MAP['BTCUSD'] },
  ETHUSD: { oanda: 'ETH_USD', yahoo: 'ETH-USD', tradingview: 'CRYPTO:ETHUSD', assetClass: 'Crypto', cotKey: COT_MAP['ETHUSD'] },
  LTCUSD: { oanda: 'LTC_USD', yahoo: 'LTC-USD', tradingview: 'CRYPTO:LTCUSD', assetClass: 'Crypto', cotKey: COT_MAP['LTCUSD'] },

  // Rates
  USB10YUSD: { oanda: 'USB10Y_USD', yahoo: 'ZN=F', tradingview: 'OANDA:USB10YUSD', assetClass: 'Interest Rates', cotKey: COT_MAP['USB10YUSD'] },
  USB30YUSD: { oanda: 'USB30Y_USD', yahoo: 'ZB=F', tradingview: 'OANDA:USB30YUSD', assetClass: 'Interest Rates', cotKey: COT_MAP['USB30YUSD'] },
  USB05YUSD: { oanda: 'USB05Y_USD', yahoo: 'ZF=F', tradingview: 'OANDA:USB05YUSD', assetClass: 'Interest Rates', cotKey: COT_MAP['USB05YUSD'] },

  // Stocks
  ADT: { yahoo: 'ADT', tradingview: 'NYSE:ADT', assetClass: 'Stocks', cotKey: COT_MAP['ADT'] },
  SAN: { yahoo: 'SAN', tradingview: 'NYSE:SAN', assetClass: 'Stocks', cotKey: COT_MAP['SAN'] },
  COMP: { yahoo: 'COMP', tradingview: 'NYSE:COMP', assetClass: 'Stocks', cotKey: COT_MAP['COMP'] },
  HL: { yahoo: 'HL', tradingview: 'NYSE:HL', assetClass: 'Stocks', cotKey: COT_MAP['HL'] },
  STLA: { yahoo: 'STLA', tradingview: 'NYSE:STLA', assetClass: 'Stocks', cotKey: COT_MAP['STLA'] },
  VALE: { yahoo: 'VALE', tradingview: 'NYSE:VALE', assetClass: 'Stocks', cotKey: COT_MAP['VALE'] },
  NU: { yahoo: 'NU', tradingview: 'NYSE:NU', assetClass: 'Stocks', cotKey: COT_MAP['NU'] },
  TDOC: { yahoo: 'TDOC', tradingview: 'NYSE:TDOC', assetClass: 'Stocks', cotKey: COT_MAP['TDOC'] },
  USEG: { yahoo: 'USEG', tradingview: 'NYSE:USEG', assetClass: 'Stocks', cotKey: COT_MAP['USEG'] },
  ICON: { yahoo: 'ICON', tradingview: 'NYSE:ICON', assetClass: 'Stocks', cotKey: COT_MAP['ICON'] },
  INDO: { yahoo: 'INDO', tradingview: 'NYSE:INDO', assetClass: 'Stocks', cotKey: COT_MAP['INDO'] },
  SBET: { yahoo: 'SBET', tradingview: 'NYSE:SBET', assetClass: 'Stocks', cotKey: COT_MAP['SBET'] },
  OKLO: { yahoo: 'OKLO', tradingview: 'NYSE:OKLO', assetClass: 'Stocks', cotKey: COT_MAP['OKLO'] },
  LTBR: { yahoo: 'LTBR', tradingview: 'NYSE:LTBR', assetClass: 'Stocks', cotKey: COT_MAP['LTBR'] },
  UEC: { yahoo: 'UEC', tradingview: 'NYSE:UEC', assetClass: 'Stocks', cotKey: COT_MAP['UEC'] },
  F: { yahoo: 'F', tradingview: 'NYSE:F', assetClass: 'Stocks', cotKey: COT_MAP['F'] },
  RIVN: { yahoo: 'RIVN', tradingview: 'NYSE:RIVN', assetClass: 'Stocks', cotKey: COT_MAP['RIVN'] },
  SIGA: { yahoo: 'SIGA', tradingview: 'NYSE:SIGA', assetClass: 'Stocks', cotKey: COT_MAP['SIGA'] },
  ACHR: { yahoo: 'ACHR', tradingview: 'NYSE:ACHR', assetClass: 'Stocks', cotKey: COT_MAP['ACHR'] },
  BLDE: { yahoo: 'BLDE', tradingview: 'NYSE:BLDE', assetClass: 'Stocks', cotKey: COT_MAP['BLDE'] },
  BZUN: { yahoo: 'BZUN', tradingview: 'NYSE:BZUN', assetClass: 'Stocks', cotKey: COT_MAP['BZUN'] },
  PLBY: { yahoo: 'PLBY', tradingview: 'NYSE:PLBY', assetClass: 'Stocks', cotKey: COT_MAP['PLBY'] },
  PRCH: { yahoo: 'PRCH', tradingview: 'NYSE:PRCH', assetClass: 'Stocks', cotKey: COT_MAP['PRCH'] },
};
