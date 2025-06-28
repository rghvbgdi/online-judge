const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    problemNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      default: '',
    },
    output: {
      type: String,
      default: '',
    },
    hiddenTestCases: {
      type: [
        {
          input: { type: String, required: true },
          output: { type: String, default: '' }, // Removed required: true
        },
      ],
      default: [],
    },
    difficulty: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
);

module.exports = mongoose.model("Problem", problemSchema);