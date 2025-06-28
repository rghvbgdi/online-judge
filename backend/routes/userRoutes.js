const express = require('express');
const router = express.Router();
const { getUserStats, getSolvedProblems, getPublicProfile } = require('../controllers/userController');
const { userAuth } = require('../middleware/authMiddleware');

// @route   GET /api/user/stats
// @desc    Get statistics (infographics data) for the logged-in user
// @access  Private
router.get('/stats', userAuth, getUserStats);

// @route   GET /api/user/solved
// @desc    Get a lightweight list of solved problem numbers for the logged-in user
// @access  Private
router.get('/solved', userAuth, getSolvedProblems);

// @route   GET /api/user/profile/:userId
// @desc    Get public profile data for a user
// @access  Public
router.get('/profile/:userId', getPublicProfile);

module.exports = router;