/**
 * Demo data for QR Box Demo
 * This provides sample data to showcase the application features
 */

export const demoPhaseData = [
  {
    symbol: 'EURUSD',
    phase: 'Accumulation',
    strength: 85,
    source: 'OANDA',
    lastUpdate: '2024-12-19T10:30:00Z',
    price: 1.0923,
    change: 0.0012,
    changePercent: 0.11
  },
  {
    symbol: 'GBPUSD',
    phase: 'Markup',
    strength: 92,
    source: 'OANDA',
    lastUpdate: '2024-12-19T10:30:00Z',
    price: 1.2654,
    change: -0.0023,
    changePercent: -0.18
  },
  {
    symbol: 'XAUUSD',
    phase: 'Distribution',
    strength: 78,
    source: 'YahooFinance',
    lastUpdate: '2024-12-19T10:30:00Z',
    price: 2045.50,
    change: 12.30,
    changePercent: 0.60
  },
  {
    symbol: 'BTCUSD',
    phase: 'Markdown',
    strength: 45,
    source: 'YahooFinance',
    lastUpdate: '2024-12-19T10:30:00Z',
    price: 43250,
    change: -1250,
    changePercent: -2.81
  },
  {
    symbol: 'SPX500USD',
    phase: 'Accumulation',
    strength: 88,
    source: 'YahooFinance',
    lastUpdate: '2024-12-19T10:30:00Z',
    price: 4725.80,
    change: 15.20,
    changePercent: 0.32
  }
];

export const demoTradeIdeas = [
  {
    id: 1,
    symbol: 'EURUSD',
    direction: 'BUY',
    entry: 1.0920,
    stopLoss: 1.0880,
    takeProfit: 1.0980,
    confidence: 85,
    reasoning: 'Strong accumulation phase with bullish momentum. Key support level holding.',
    riskReward: 1.5,
    timeframe: '4H'
  },
  {
    id: 2,
    symbol: 'XAUUSD',
    direction: 'SELL',
    entry: 2045.00,
    stopLoss: 2055.00,
    takeProfit: 2030.00,
    confidence: 72,
    reasoning: 'Distribution phase suggests potential reversal. Resistance level rejection.',
    riskReward: 1.5,
    timeframe: '1D'
  },
  {
    id: 3,
    symbol: 'GBPUSD',
    direction: 'BUY',
    entry: 1.2650,
    stopLoss: 1.2620,
    takeProfit: 1.2720,
    confidence: 91,
    reasoning: 'Markup phase with strong momentum. Breakout above key resistance.',
    riskReward: 2.0,
    timeframe: '1H'
  }
];

export const demoGPTThesis = {
  symbol: 'EURUSD',
  thesis: `Based on current market analysis, EURUSD is showing strong accumulation characteristics with institutional buying pressure evident in the 4-hour timeframe. The pair has established a solid support base around 1.0880-1.0900, with multiple tests confirming this level's strength.

Key factors supporting a bullish outlook:
- Accumulation phase strength: 85/100
- Volume profile showing institutional accumulation
- Technical indicators aligned for upside momentum
- Fundamental backdrop supportive of Euro strength

Risk factors to monitor:
- ECB policy decisions
- US economic data releases
- Geopolitical tensions in Europe

Recommended approach: Consider long positions on pullbacks to support levels with tight risk management.`,
  confidence: 85,
  lastUpdate: '2024-12-19T10:30:00Z',
  timeframes: ['1H', '4H', '1D'],
  keyLevels: {
    support: [1.0880, 1.0850, 1.0820],
    resistance: [1.0950, 1.0980, 1.1020]
  }
};

export const isDemoMode = () => {
  // Check if we're in demo mode (no API keys configured)
  return !process.env.REACT_APP_OPENAI_API_KEY && !process.env.REACT_APP_OANDA_API_KEY;
};

export const getDemoData = (type) => {
  switch (type) {
    case 'phase':
      return demoPhaseData;
    case 'tradeIdeas':
      return demoTradeIdeas;
    case 'gptThesis':
      return demoGPTThesis;
    default:
      return null;
  }
}; 