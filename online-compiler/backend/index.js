// Load environment variables from .env file located in the same directory as this script
require('dotenv').config({ path: __dirname + '/.env' });

// Import required modules for server setup and file operations
const express = require('express'); // Express framework for building the API server
const fs = require('fs/promises'); // File system promises API for async file operations
const generateFile = require('./generateFile.js'); // Utility to generate temporary code files
const executeCpp = require('./executeCpp.js'); // Function to compile and execute C++ code
const generateInputFile = require('./generateInputFile.js'); // Utility to generate temporary input files
const { DBConnection } = require('../../backend/database/db.js'); // Database connection utility
const Problem = require('../../backend/model/problem.js'); // Mongoose model representing problem schema

// Initialize Express app and configure middleware for CORS and body parsing
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const app = express();
app.use(cors()); // Allow requests from different origins
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Establish connection to MongoDB database
DBConnection();

// Route to run submitted code with optional custom input (for testing purposes)
app.post('/run', async (req, res) => {
  // Extract language, code, and input from request body; default language to 'cpp'
  const { language = 'cpp', code, input } = req.body;

  // Validate that code is provided; return 400 error if missing
  if (!code) {
    return res.status(400).json({ success: false, error: 'code is required' });
  }

  // Generate temporary files for code and input to be used during execution
  const filePath = generateFile(language, code);
  const inputFilePath = generateInputFile(input);

  try {
    // Compile and execute the code with the provided input file
    const output = await executeCpp(filePath, inputFilePath);

    // Respond with the output produced by the code execution
    res.json({ output });
  } catch (error) {
    // Respond with a formatted error message to show in the frontend output box
    return res.status(200).json({
      output: `❌ ${
        error.type === 'compile'
          ? 'Compile Error'
          : error.type === 'timeout'
          ? 'Time Limit Exceeded'
          : 'Runtime Error'
      }:\n${error.message}`,
    });
  } finally {
    // Cleanup: remove the temporary code file
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete code file:", err.message);
    }

    // Cleanup: remove the temporary input file
    try {
      await fs.unlink(inputFilePath);
    } catch (err) {
      console.error("Failed to delete input file:", err.message);
    }
  }
});

// Route to submit code for evaluation against hidden test cases stored in the database
app.post('/submit', async (req, res) => {
  // Extract code, language, and problemNumber from the request body
  const { code, language, problemNumber } = req.body;

  // Validate that all required fields are present; return 400 error if any are missing
  if (!code || !language || !problemNumber) {
    return res.status(400).json({ error: 'Missing code, language, or problemNumber' });
  }

  try {
    // Retrieve the problem document from the database using the problem number
    const problem = await Problem.findOne({ problemNumber });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    console.log("Problem found:", problem);
 
    // Iterate through each hidden test case associated with the problem
    for (const test of problem.hiddenTestCases) {
      console.log("Processing test case:", test.input);
      // Generate temporary files for the submitted code and the test case input
      const filePath = generateFile(language, code);
      const inputFilePath = generateInputFile(test.input);

      try {
        const output = await executeCpp(filePath, inputFilePath);
        console.log("Output received from executeCpp");

        const expected = test.output.trim();
        const userOutput = output.trim();

        const normalize = str => str.trim().replace(/\s+/g, ' ');
        console.log("Expected:", expected);
        console.log("User Output:", userOutput);
        console.log("Normalized Expected:", normalize(expected));
        console.log("Normalized User Output:", normalize(userOutput));

        if (normalize(expected) !== normalize(userOutput)) {
          return res.json({ verdict: "❌ Wrong Answer" });
        }
      } catch (err) {
        console.error("Error during executeCpp in /submit:", err);
        return res.status(500).json({ verdict: "❌ Runtime Error", error: err.message });
      } finally {
        // Cleanup: remove temporary code and input files for this test case
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Failed to delete code file:", err.message);
        }

        try {
          await fs.unlink(inputFilePath);
        } catch (err) {
          console.error("Failed to delete input file:", err.message);
        }
      }
    }

    // If all test cases pass, return Accepted verdict
    return res.json({ verdict: "✅ Accepted" });
  } catch (error) {
    // Log any unexpected server errors and respond with a 500 error
    console.error("Submission error:", error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Basic health check endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('Hello, this is the Online Compiler Server at port 8000!');
});


// Start the Express server on the port specified in environment or default to 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});