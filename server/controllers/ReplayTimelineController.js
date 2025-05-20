const rateLimit = require('express-rate-limit');
const { getReplayEvents, addReplayEvent } = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/ReplayTimeline — Only Phase 1–4 signals
const getTimeline = async (req, res) => {
  try {
    const allEvents = getReplayEvents();

    // Filter only those with valid phase (1–4)
    const timeline = allEvents.filter(e =>
      ['1', '2', '3', '4'].includes(String(e.phase))
    );

    const stats = {
      totalEvents: timeline.length,
      symbols: timeline.reduce((acc, event) => {
        acc[event.symbol] = (acc[event.symbol] || 0) + 1;
        return acc;
      }, {}),
      phases: timeline.reduce((acc, event) => {
        acc[event.phase] = (acc[event.phase] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        timeline,
        statistics: stats,
        metadata: {
          startDate: timeline.at(-1)?.timestamp,
          endDate: timeline[0]?.timestamp,
          totalEvents: timeline.length,
          source: 'phase-signals',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('[server ERROR]: getTimeline (phase-only) error:', error);
    res.status(500).json({ error: 'Failed to fetch phase timeline' });
  }
};

// POST /api/ReplayTimeline/add
const addEvent = async (req, res) => {
  try {
    const { event } = req.body;

    if (!event || !event.timestamp || !event.symbol) {
      return res.status(400).json({ error: 'Invalid event payload' });
    }

    addReplayEvent(event);
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('[server ERROR]: addReplayEvent failed:', error);
    res.status(500).json({ error: 'Failed to store replay event' });
  }
};

module.exports = {
  rateLimiter,
  getTimeline,
  addEvent
};
