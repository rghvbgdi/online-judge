const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { adminAuth } = require('../middleware/authMiddleware');


// Admin routes
router.get('/admin', adminAuth, problemController.getAdminStatus); // Confirmation for admin access
router.post('/admin', adminAuth, problemController.createProblem);
router.post('/admin/bulk', adminAuth, problemController.createProblemsBulk);
router.delete('/admin/:problemNumber', adminAuth, problemController.deleteProblem);

// Public routes
router.get('/', problemController.getAllProblems);
router.get('/:problemNumber', problemController.getProblemByNumber);

module.exports = router;