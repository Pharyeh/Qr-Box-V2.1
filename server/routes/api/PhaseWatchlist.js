const express = require('express');
const router = express.Router();
const { rateLimiter, getPhaseWatchlist } = require('../../controllers/PhaseWatchlistController');

router.get('/', rateLimiter, getPhaseWatchlist);

module.exports = router;
