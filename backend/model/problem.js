const mongoose = require ('mongoose');

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
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports= mongoose.model('Problem', problemSchema);