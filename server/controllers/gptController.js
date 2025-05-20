const rateLimit = require('express-rate-limit');
const {
  getGptOverview,
  setGptOverview,
  getGptThesis,
  setGptThesis
} = require('../stateHolder');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// GET /api/gpt
const getThesis = async (req, res) => {
  try {
    res.json({
      overview: getGptOverview(),
      thesis: getGptThesis()
    });
  } catch (err) {
    console.error('[server ERROR]: GPT fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve GPT summary' });
  }
};

// POST /api/gpt/update
// { thesis: "...", overview: "..." }
const updateThesis = async (req, res) => {
  try {
    const { thesis, overview } = req.body;

    if (!thesis && !overview) {
      return res.status(400).json({ error: 'Missing overview or thesis' });
    }

    if (thesis) setGptThesis(thesis);
    if (overview) setGptOverview(overview);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[server ERROR]: GPT update failed:', err);
    res.status(500).json({ error: 'Failed to update GPT content' });
  }
};

module.exports = {
  rateLimiter,
  getThesis,
  updateThesis
};
