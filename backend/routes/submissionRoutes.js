const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { userAuth } = require('../middleware/authMiddleware');

// This endpoint is called by the compiler service to update solved status
router.post('/verdict', userAuth, submissionController.updateSolvedProblem);

module.exports = router;