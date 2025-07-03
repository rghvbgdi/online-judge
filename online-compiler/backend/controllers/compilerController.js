const fs = require('fs/promises'); // File system promises API for async file operations
const generateFile = require('../generateFile.js'); // Utility to generate temporary code files
const executeCpp = require('../executeCpp.js'); // Function to compile and execute C++ code
const generateInputFile = require('../generateInputFile.js'); // Utility to generate temporary input files
const axios = require('axios');

// Route to run submitted code with optional custom input (for testing purposes)
exports.runCode = async (req, res) => {
  const { language = 'cpp', code, input } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'code is required' });
  }

  const filePath = await generateFile(language, code);
  const inputFilePath = await generateInputFile(input);

  try {
    const output = await executeCpp(filePath, inputFilePath);
    res.json({ output });
  } catch (error) {
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
};

// Route to submit code for evaluation against hidden test cases stored in the database
exports.submitCode = async (req, res) => {
  const { code, language, problemNumber } = req.body;

  if (!code || !language || !problemNumber) {
    return res.status(400).json({ error: 'Missing code, language, or problemNumber' });
  }
  const userId = req.user.id;

  // Helper function to report the submission result to the main backend
  const reportVerdictToBackend = async (verdict) => {
    try {
      const cookie = req.headers.cookie;
      // We require axios here to avoid circular dependency issues if it were at the top level
      const axios = require('axios');
      await axios.post(`${process.env.MAIN_BACKEND_API_URL}/api/submission/verdict`, {
        problemNumber: problemNumber,
        verdict: verdict,
        code: code,
        language: language,
      }, { headers: { 'Cookie': cookie } });
    } catch (error) {
      console.error('Error calling main backend to update verdict:', error.response?.data || error.message);
    }
  };

  let problem;
  try {
    const cookie = req.headers.cookie;
    const problemRes = await axios.get(`${process.env.MAIN_BACKEND_API_URL}/api/problems/${problemNumber}`, {
      headers: { Cookie: cookie }
    });
    problem = problemRes.data;
  } catch (error) {
    console.error('Error fetching problem from main backend:', error.response?.data || error.message);
    return res.status(404).json({ error: 'Problem not found' });
  }

  try {
    for (const [index, test] of problem.hiddenTestCases.entries()) { // Iterate through each hidden test case with its index
      const filePath = await generateFile(language, code);
      const inputFilePath = await generateInputFile(test.input);

      try {
        const output = await executeCpp(filePath, inputFilePath);

        const normalizeOutput = (str) => {
          const trimmedStr = str.trim();
          const lines = trimmedStr.split(/\r?\n/).filter(line => line.length > 0);
          const normalizedLines = lines.map(line => line.trim().replace(/\s+/g, ' '));
          return normalizedLines.join('\n');
        };

        const expectedNormalized = normalizeOutput(test.output);
        const userOutputNormalized = normalizeOutput(output);

        if (expectedNormalized !== userOutputNormalized) {
          const verdict = "❌ Wrong Answer";
          await reportVerdictToBackend(verdict);
          return res.json({
            verdict: verdict,
            testCaseNumber: index + 1, // Add the 1-based test case number
            failedTestCase: {
              input: test.input,
              expectedOutput: test.output,
              actualOutput: output,
            },
          });
        }
      } catch (err) {
        console.error("Error during executeCpp in /submit:", err);
        const errorVerdict = `❌ ${
          err.type === 'compile'
            ? 'Compile Error'
            : err.type === 'timeout'
            ? 'Time Limit Exceeded'
            : 'Runtime Error'
        }:\n${err.message}`;
        await reportVerdictToBackend(errorVerdict);
        return res.status(200).json({ // Keep 200 status for compiler-specific errors
          output: errorVerdict, // Format message like /runCode
        });
      } finally {
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

    const verdict = "Accepted";
    await reportVerdictToBackend(verdict);
    return res.json({ verdict: `✅ ${verdict}` }); // Send clean verdict to backend, but decorated verdict to frontend
  } catch (error) {
    // Log the full error object to get a stack trace
    console.error("Submission error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};