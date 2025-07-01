const express = require('express');
const router = express.Router();
const { getGeminiFeedback } = require('../controllers/geminiController');

// Optional: Add auth middleware if you want feedback only for logged-in users
// const { authenticate } = require('../middleware/authMiddleware');
// router.post('/feedback', authenticate, getGeminiFeedback);

router.post('/feedback', getGeminiFeedback);

module.exports = router;