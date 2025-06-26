const Problem = require('../model/problem');

// Admin route to get a confirmation message and user info after admin auth
exports.getAdminStatus = (req, res) => {
    res.status(200).json({ message: "Admin access granted", user: req.user });
};

// Admin route to create a new problem
exports.createProblem = async (req, res) => {
    try {
        const { title, description, input, output, difficulty, tags, hiddenTestCases } = req.body;

        if (!(title && description && input && output && difficulty)) {
            return res.status(400).json({ message: "Please provide title, description, input, output, and difficulty" });
        }

        const lastProblem = await Problem.findOne().sort({ problemNumber: -1 }).exec();
        const newProblemNumber = lastProblem ? lastProblem.problemNumber + 1 : 1;

        let tagsArray = [];
        if (tags && typeof tags === 'string') {
            tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(tags)) {
            tagsArray = tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
        }

        const newProblem = new Problem({
            problemNumber: newProblemNumber,
            title,
            description,
            input,
            output,
            difficulty,
            tags: tagsArray,
            hiddenTestCases: hiddenTestCases || []
        });

        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (error) {
        console.error("Error creating problem:", error);
        res.status(500).json({ message: "Failed to create problem", error: error.message });
    }
};

// Admin route to delete a problem by its problem number
exports.deleteProblem = async (req, res) => {
    try {
        const problemNumber = parseInt(req.params.problemNumber, 10);
        if (isNaN(problemNumber)) {
            return res.status(400).json({ message: 'Invalid problem number' });
        }

        const deleted = await Problem.findOneAndDelete({ problemNumber });

        if (!deleted) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ message: `Problem deleted successfully.` });
    } catch (error) {
        console.error('Error deleting problem:', error);
        res.status(500).json({ message: 'Failed to delete problem', error: error.message });
    }
};

// Public route to get a single problem by problem number
exports.getProblemByNumber = async (req, res) => {
    try {
        const problemNumber = parseInt(req.params.problemNumber, 10);
        if (isNaN(problemNumber)) {
            return res.status(400).json({ message: 'Invalid problem number' });
        }

        const problem = await Problem.findOne({ problemNumber }).exec();

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(problem);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ message: 'Failed to fetch problem', error: error.message });
    }
};

// Public route to get all problems sorted by problem number ascending
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find().sort({ problemNumber: 1 });
        res.status(200).json(problems);
    } catch (error) {
        console.error("Failed to fetch problems:", error);
        res.status(500).json({ message: "Failed to fetch problems" });
    }
};