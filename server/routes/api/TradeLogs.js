const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  fetchLogs,
  addLog,
  deleteLog
} = require('../../controllers/tradeLogsController');

router.get('/', rateLimiter, fetchLogs);
router.post('/add', rateLimiter, addLog);
router.post('/delete', rateLimiter, deleteLog);

module.exports = router;
