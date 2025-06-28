const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries by user
    },
    problemNumber: {
        type: Number,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    verdict: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Submission', submissionSchema);