const express = require('express');
const logger = require('./logger');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: Allow frontend access (local testing)
app.use(require('cors')({
  origin: 'http://localhost:3000',
  credentials: true
}));

// __ Logging ____________________________________________
app.use(logger);

// __ Active API Routes __________________________________
app.use('/api/quantumMetric', require('./routes/api/quantumMetric'));
app.use('/api/confidenceTrend', require('./routes/api/confidenceTrend'));
app.use('/api/TradeLogs', require('./routes/api/TradeLogs'));
app.use('/api/assetSentiment', require('./routes/api/assetSentiment'));
app.use('/api/liveTriggers', require('./routes/api/liveTriggers'));
app.use('/api/PhaseWatchlist', require('./routes/api/PhaseWatchlist'));
app.use('/api/ReplayTimeline', require('./routes/api/ReplayTimeline'));
app.use('/api/edgeDecayTracker', require('./routes/api/edgeDecayTracker'));
app.use('/api/gpt', require('./routes/api/gpt'));
app.use('/api/heatmap', require('./routes/api/heatmap'));
app.use('/api/MetricsBar', require('./routes/api/MetricsBar'));

// __ Serve React Frontend _______________________________
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;
