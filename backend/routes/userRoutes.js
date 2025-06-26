const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userAuth } = require('../middleware/authMiddleware');

router.get('/solved-problems', userAuth, userController.getSolvedProblems);

module.exports = router;