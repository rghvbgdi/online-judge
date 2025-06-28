const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compilerController');
const { compilerUserAuth } = require('../middleware/compilerAuthMiddleware');

// Route to run submitted code with optional custom input (for testing purposes)
router.post('/run', compilerController.runCode);

// Route to submit code for evaluation against hidden test cases stored in the database
router.post('/submit', compilerUserAuth, compilerController.submitCode);

module.exports = router;