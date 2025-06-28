const User = require('../model/user');
const Submission = require('../model/submission'); // Import the new model

exports.updateVerdict = async (req, res) => {
    const { problemNumber, verdict, code, language } = req.body; // Add code and language
    const userId = req.user.id; // Get userId from authenticated token

    if (!problemNumber || !verdict || !code || !language) {
        return res.status(400).json({ message: 'Problem number, verdict, code, and language are required.' });
    }

    // Always create a submission record
    try {
        await Submission.create({
            userId,
            problemNumber,
            verdict,
            code,
            language,
        });
    } catch (error) {
        console.error('Error creating submission record:', error);
        // We can still proceed to update the solved list even if this fails, but we should log it.
    }

    if (verdict === 'Accepted') {
        try {
            // Use $addToSet to add the problemNumber to the array only if it's not already present.
            // This prevents duplicates and is more efficient than finding the user first.
            await User.findByIdAndUpdate(userId, { $addToSet: { solvedProblems: problemNumber } });
            return res.status(200).json({ message: 'User solved problems updated and submission recorded.' });
        } catch (error) {
            console.error('Error updating user solved problems:', error);
            return res.status(500).json({ message: 'Internal server error while updating solved problems.' });
        }
    }

    // If the verdict is not "Accepted", we just confirm the submission was recorded.
    return res.status(200).json({ message: 'Submission recorded.' });
};