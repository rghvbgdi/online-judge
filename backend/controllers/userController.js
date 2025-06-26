const user = require('../model/user');

// Endpoint to fetch solved problems for the authenticated user
exports.getSolvedProblems = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await user.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ solvedProblems: currentUser.solvedProblems });
    } catch (error) {
        console.error('Error fetching solved problems:', error);
        res.status(500).json({ message: 'Failed to fetch solved problems', error: error.message });
    }
};