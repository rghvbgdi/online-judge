const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();

// This will handle GET requests to /api/leaderboard/
router.get('/', getLeaderboard);

module.exports = router;