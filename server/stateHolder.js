const state = {
  // Market scanning
  scannedAssets: 0,
  phase2Assets: [],
  phase4Assets: [],

  // Trade system logs
  tradeLogs: [],

  // Replay timeline events
  replayEvents: [],

  // Live alerts and triggers
  liveTriggers: [],

  // GPT-based summaries/theses
  gptOverview: '',
  gptThesis: '',

  // System metrics
  systemMetrics: {
    uptime: 99.95,
    memoryUsage: 72,
    cpuLoad: 36,
    responseTime: 110
  },

  // Sync meta
  lastSync: new Date().toISOString()
};

// Internal memory for asset sentiment
const assetSentimentMap = {};

// Asset Sentiment Methods
function getAssetSentiment(symbol) {
  if (!symbol) return Object.values(assetSentimentMap);
  return assetSentimentMap[symbol];
}

function setAssetSentiment(sentiments) {
  sentiments.forEach(s => {
    assetSentimentMap[s.symbol] = s;
  });
}

function updateAssetSentiment({ symbol, bias, score, timestamp }) {
  assetSentimentMap[symbol] = { symbol, bias, score, timestamp };
}

// Replay Timeline Control
function setReplayEvents(events) {
  state.replayEvents = events;
}

// Module Exports
module.exports = {
  getState: () => state,

  // Market scan
  updateScannedAssets: (count) => { state.scannedAssets = count; },
  setPhase2Assets: (arr) => { state.phase2Assets = arr; },
  setPhase4Assets: (arr) => { state.phase4Assets = arr; },

  // Trade logs
  getTradeLogs: () => state.tradeLogs,
  setTradeLogs: (logs) => { state.tradeLogs = logs; },
  addTradeLog: (entry) => { state.tradeLogs.push(entry); },
  deleteTradeLogById: (id) => {
    state.tradeLogs = state.tradeLogs.filter(t => t._id !== id);
  },

  // Replay timeline
  getReplayEvents: () => state.replayEvents,
  addReplayEvent: (evt) => { state.replayEvents.push(evt); },
  setReplayEvents,

  // Triggers
  getLiveTriggers: () => state.liveTriggers,
  setLiveTriggers: (arr) => { state.liveTriggers = arr; },

  // GPT summaries
  getGptOverview: () => state.gptOverview,
  setGptOverview: (txt) => { state.gptOverview = txt; },
  getGptThesis: () => state.gptThesis,
  setGptThesis: (txt) => { state.gptThesis = txt; },

  // Metrics
  getMetrics: () => ({
    scannedAssets: state.scannedAssets,
    phase2Count: state.phase2Assets.length,
    phase4Count: state.phase4Assets.length,
    lastSync: state.lastSync,
    ...state.systemMetrics
  }),
  updateSystemMetrics: (metrics) => {
    state.systemMetrics = { ...state.systemMetrics, ...metrics };
  },
  syncTimestamp: () => {
    state.lastSync = new Date().toISOString();
  },

  // Asset Sentiment
  getAssetSentiment,
  setAssetSentiment,
  updateAssetSentiment
};
