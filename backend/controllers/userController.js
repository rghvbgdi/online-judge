const mongoose = require('mongoose');
const User = require('../model/user');

/**
 * A helper function to categorize problem difficulty.
 * This centralizes the logic for better readability and maintenance.
 */
const getDifficultyCategory = (difficulty) => {
    if (difficulty < 1200) return 'Easy';
    if (difficulty < 1600) return 'Medium';
    if (difficulty < 2000) return 'Hard';
    return 'Expert';
};

// Get statistics for the logged-in user
exports.getUserStats = async (req, res) => {
    console.log("👉 Inside getUserStats. User:", req.user);

    try {
        // Calculate the date one year ago from today
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // A single, efficient aggregation pipeline to fetch all user stats at once.
        // This replaces three separate database calls with one.
        const results = await User.aggregate([
            // 1. Find the specific user
            { $match: { _id: new mongoose.Types.ObjectId(req.user.id) } },
            // 2. Join with solved problem details
            {
                $lookup: {
                    from: 'problems',
                    localField: 'solvedProblems',
                    foreignField: 'problemNumber',
                    as: 'solvedProblemDetails',
                    // Project only the fields we need from the problems collection
                    pipeline: [{ $project: { _id: 0, problemNumber: 1, title: 1, difficulty: 1, tags: 1 } }]
                }
            },
            // 3. Join with recent submissions from the last year
            {
                $lookup: {
                    from: 'submissions',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [
                            { $eq: ['$userId', '$$userId'] },
                            { $gte: ['$createdAt', oneYearAgo] }
                        ] } } },
                        { $project: { _id: 0, createdAt: 1 } }
                    ],
                    as: 'recentSubmissions'
                }
            },
            // 4. Project the final shape of our data
            {
                $project: {
                    _id: 0,
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    joinedAt: '$createdAt',
                    role: 1, // Include the user's role in the response
                    solvedProblemDetails: 1,
                    recentSubmissions: 1,
                }
            }
        ]);

        // If no user is found, the results array will be empty
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userData = results[0];

        // Destructure the user data. The `...userInfo` part captures all other fields
        // like firstname, lastname, email, and joinedAt into a single object.
        const { solvedProblemDetails, recentSubmissions, ...userInfo } = userData;

        const solvedByDifficulty = {};
        const solvedByTag = {};
        solvedProblemDetails.forEach(problem => {
            const difficultyCategory = getDifficultyCategory(problem.difficulty);
            solvedByDifficulty[difficultyCategory] = (solvedByDifficulty[difficultyCategory] || 0) + 1;
            problem.tags.forEach(tag => {
                solvedByTag[tag] = (solvedByTag[tag] || 0) + 1;
            });
        });

        // Compute daily submission counts from recentSubmissions
        const submissionCounts = {};
        recentSubmissions.forEach(submission => {
            const dateStr = submission.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
            submissionCounts[dateStr] = (submissionCounts[dateStr] || 0) + 1;
        });

        // Format submission history as an array of { date, count }
        const submissionHistory = Object.entries(submissionCounts).map(([date, count]) => ({ date, count }));

        const solvedProblemsList = solvedProblemDetails.map(p => ({ problemNumber: p.problemNumber, title: p.title }));

        res.status(200).json({
            ...userInfo, // Spread the user info (firstname, lastname, etc.) into the response
            totalSolved: solvedProblemDetails.length,
            solvedByDifficulty,
            solvedByTag,
            solvedProblems: solvedProblemsList,
            submissionHistory
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get just the solved problem numbers for the logged-in user
exports.getSolvedProblems = async (req, res) => {
    try {
        // Use .lean() for a small performance boost as we only need to read data
        const user = await User.findById(req.user.id).select('solvedProblems').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Return only the array of solved problem numbers
        res.status(200).json(user.solvedProblems || []);
    } catch (error) {
        console.error('Error fetching solved problems:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        // Calculate the date one year ago from today
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const results = await User.aggregate([
            // 1. Find the specific user by their ID
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            // 2. Join with solved problem details
            {
                $lookup: {
                    from: 'problems',
                    localField: 'solvedProblems',
                    foreignField: 'problemNumber',
                    as: 'solvedProblemDetails',
                    pipeline: [{ $project: { _id: 0, problemNumber: 1, title: 1, difficulty: 1, tags: 1 } }]
                }
            },
            // 3. Join with recent submissions from the last year
            {
                $lookup: {
                    from: 'submissions',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [
                            { $eq: ['$userId', '$$userId'] },
                            { $gte: ['$createdAt', oneYearAgo] }
                        ] } } },
                        { $project: { _id: 0, createdAt: 1 } }
                    ],
                    as: 'recentSubmissions'
                }
            },
            // 4. Project only the data we want to be public (no email, no role)
            {
                $project: {
                    _id: 0,
                    firstname: 1,
                    lastname: 1,
                    joinedAt: '$createdAt',
                    solvedProblemDetails: 1,
                    recentSubmissions: 1,
                }
            }
        ]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userData = results[0];
        const { solvedProblemDetails, recentSubmissions, ...userInfo } = userData;

        const solvedByDifficulty = {};
        const solvedByTag = {};
        solvedProblemDetails.forEach(problem => {
            const difficultyCategory = getDifficultyCategory(problem.difficulty);
            solvedByDifficulty[difficultyCategory] = (solvedByDifficulty[difficultyCategory] || 0) + 1;
            problem.tags.forEach(tag => {
                solvedByTag[tag] = (solvedByTag[tag] || 0) + 1;
            });
        });

        // Compute daily submission counts from recentSubmissions
        const submissionCounts = {};
        recentSubmissions.forEach(submission => {
            const dateStr = submission.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
            submissionCounts[dateStr] = (submissionCounts[dateStr] || 0) + 1;
        });

        // Format submission history as an array of { date, count }
        const submissionHistory = Object.entries(submissionCounts).map(([date, count]) => ({ date, count }));

        const solvedProblemsList = solvedProblemDetails.map(p => ({ problemNumber: p.problemNumber, title: p.title }));

        res.status(200).json({
            ...userInfo,
            totalSolved: solvedProblemDetails.length,
            solvedByDifficulty,
            solvedByTag,
            solvedProblems: solvedProblemsList,
            submissionHistory
        });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};