const User = require('../model/user');

/**
 * @desc    Get user leaderboard, sorted by score
 * @route   GET /api/leaderboard
 * @access  Public
 */
exports.getLeaderboard = async (req, res) => {
  try {
    // Use a highly efficient MongoDB Aggregation Pipeline to calculate the leaderboard.
    // This is much faster and uses less memory than fetching all users and problems into the app.
    const leaderboardData = await User.aggregate([
      // Stage 1: Join users with their solved problems' details.
      // The collection name for problems is 'problems' (pluralized from the 'Problem' model).
      {
        $lookup: {
          from: 'problems', // The collection name for problems
          localField: 'solvedProblems', // Field in the users collection
          foreignField: 'problemNumber', // Field in the problems collection
          as: 'solvedProblemDetails', // The new array field with joined documents
        },
      },
      // Stage 2: Project the required fields and calculate score/counts.
      {
        $project: {
          _id: 0, // Exclude the default _id
          userId: '$_id', // Include the user's ID for a stable key in the frontend
          // The user schema has firstname and lastname. We'll construct a full name.
          username: { $concat: ['$firstname', ' ', '$lastname'] },
          // Use $ifNull to handle cases where 'solvedProblemDetails' might be null or missing,
          // preventing the $size operator from causing an error. It defaults to an empty array.
          problemsSolved: { $size: { $ifNull: ['$solvedProblemDetails', []] } },
          score: { $sum: '$solvedProblemDetails.difficulty' },
        },
      },
      // Stage 3: Sort by score in descending order.
      {
        $sort: { score: -1 },
      },
    ]);

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
