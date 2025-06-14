import { SYMBOL_MAP } from './symbolMapping.js';

function getPhaseRulesForAsset(symbol) {
  const assetClass = SYMBOL_MAP[symbol]?.assetClass || 'Equity';

  switch (assetClass) {
    case 'Forex':
      return { reflexMin: 0.08, structureMin: 0.15, breakoutBuffer: 0.005 };
    case 'Crypto':
      return { reflexMin: 0.15, structureMin: 0.15, breakoutBuffer: 0.01 };
    case 'Futures':
      return { reflexMin: 0.1, structureMin: 0.2, breakoutBuffer: 0.01 };
    default:
      return { reflexMin: 0.25, structureMin: 0.2, breakoutBuffer: 0.0 }; // Equities, Penny Stocks
  }
}

export default getPhaseRulesForAsset;
