const os = require('os');
const rateLimit = require('express-rate-limit');
const { getMetrics, syncTimestamp, updateSystemMetrics } = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/MetricsBar
const getMetricsData = async (req, res) => {
  try {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const cpuLoad = Math.round(os.loadavg()[0] * 100); // 1-minute load average

    updateSystemMetrics({
      memoryUsage,
      cpuLoad,
      responseTime: Math.floor(Math.random() * 20) + 100 // Simulated ping time
    });

    syncTimestamp();

    const snapshot = getMetrics();

    res.json(snapshot);
  } catch (err) {
    console.error('[server ERROR]: metrics fetch failed:', err);
    res.status(500).json({ error: 'Failed to retrieve system metrics' });
  }
};

module.exports = {
  rateLimiter,
  getMetrics: getMetricsData
};
