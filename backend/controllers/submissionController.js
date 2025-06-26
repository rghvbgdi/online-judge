const user = require('../model/user');

// Endpoint for compiler service to update solved problems
exports.updateSolvedProblem = async (req, res) => {
    try {
        const { userId, problemNumber, verdict } = req.body;

        // Security check: Ensure the user ID from the token matches the one sent in the body
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
        }

        if (verdict === 'Accepted') {
            const currentUser = await user.findById(userId);
            if (!currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Add problemNumber to solvedProblems if not already present
            if (!currentUser.solvedProblems.includes(problemNumber)) {
                currentUser.solvedProblems.push(problemNumber);
                await currentUser.save();
            }
            return res.status(200).json({ message: 'Problem marked as solved!' });
        }
        res.status(200).json({ message: 'Verdict received, no action taken for non-Accepted verdict.' });
    } catch (error) {
        console.error('Error processing solved problem update:', error);
        res.status(500).json({ message: 'Failed to update solved problem status', error: error.message });
    }
};