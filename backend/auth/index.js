const express = require('express');
const app = express();
const {DBConnection}= require("../database/db");
const user = require('../model/user');//importing user model from mongodb
const Problem = require('../model/problem');//importing problem model from mongodb
const bcrypt = require("bcryptjs");
const cors = require('cors');
const jwt = require('jsonwebtoken');
app.use(cors());
DBConnection();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - simple test endpoint
app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});

// Utility function to check password strength
function isStrongPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  }

// Registration route - registers a new user
app.post("/register",async (req,res)=> {
   try{ 
    // Extract user details from request body
    const {firstname , lastname ,email , password} =req.body;
    // Validate that all required fields are provided
    if(!(firstname && lastname && email && password)){
        return res.status(400).send("please enter all the information");
    }
    // Check if a user with the same email already exists
    const existingUser= await user.findOne({email});
    if(existingUser){
        return res.status(400).send("user already exist");
    }

    // Validate password strength (at least 6 chars, one uppercase letter, one number)
    if (!isStrongPassword(password))   {
      return res.status(400).send("Password must be at least 6 characters long and include at least one uppercase letter and one number.");
    }

    // Hash the password before saving to database for security
    const hashedPassword= await bcrypt.hash(password,10);

    // Create and save the new user in the database with default role 'user'
    const newuser = await user.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: "user" 
    });

    // Generate JWT token for the user with 1 hour expiration
    const token = jwt.sign({ id: newuser._id , email, role: newuser.role }, process.env.SECRET_KEY,
    {expiresIn : '1h'}
    );

    // Attach token to user object and remove password from response
    newuser.token=token;
    newuser.password = undefined;

    // Send success response with user info and token
    res.status(200).json({message : 'You have succesfully registered!',user : newuser})

   }
   catch(error){
    // Log error details for debugging
    console.error("Register route error:", error);
    // Send generic error response with error message
    res.status(500).json({ message: "something went wrong", error: error.message });
   }
});

// Login route - authenticates a user and returns a token
app.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate that both email and password are provided
    if (!(email && password)) {
      return res.status(400).send("Please enter all the information");
    }

    // Find user by email
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    // Compare provided password with hashed password in database
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate JWT token valid for 24 hours
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Return token and user info excluding password
    res.status(200).json({
      message: "You have successfully logged in!",
      user: {
        id: existingUser._id,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: existingUser.email,
        role: existingUser.role,
        token: token,
      },
    });
  } catch (error) {
    // Log and send error details on failure
    console.error("Login route error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// Middleware to authenticate admin users based on JWT token
const adminAuth = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.headers.authorization;
  // Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  // Extract token from header
  const token = authHeader.split(" ")[1];

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Check if user role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Attach decoded user info to request object for downstream use
    req.user = decoded; 
    next();
  } catch (err) {
    // Token verification failed
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Admin route to get a confirmation message and user info after admin auth
app.get("/admin/problems", adminAuth, (req, res) => {
  res.status(200).json({ message: "Admin access granted", user: req.user });
});



// Admin route to create a new problem
app.post("/admin/problems", adminAuth, async (req, res) => {
  try {
    // Extract problem details from request body
    const { title, description, input, output, difficulty, tags, hiddenTestCases } = req.body;

    // Validate required fields
    if (!(title && description && input && output && difficulty)) {
      return res.status(400).json({ message: "Please provide title, description, input, output, and difficulty" });
    }

    // Find the last problem to determine next problem number
    const lastProblem = await Problem.findOne().sort({ problemNumber: -1 }).exec();
    const newProblemNumber = lastProblem ? lastProblem.problemNumber + 1 : 1;

    // Process tags input: convert comma-separated string to array or handle array input
    let tagsArray = [];
    if (tags && typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) { // Handle if tags are already an array (less likely from current frontend)
      tagsArray = tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }

    // Create new problem document
    const newProblem = new Problem({
      problemNumber: newProblemNumber,
      title,
      description,
      input,
      output,
      difficulty,
      tags: tagsArray, // Use the processed array
      hiddenTestCases: hiddenTestCases || []
    });

    // Save new problem to database
    await newProblem.save();
    // Send created problem as response
    res.status(201).json(newProblem);
  } catch (error) {
    // Log and send error if problem creation fails
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Failed to create problem", error: error.message });
  }
});

// Admin route to delete a problem by its problem number
app.delete('/admin/problems/:problemNumber', adminAuth, async (req, res) => {
    try {
      // Parse problem number from URL parameter
      const problemNumber = parseInt(req.params.problemNumber, 10);
      if (isNaN(problemNumber)) {
        return res.status(400).json({ message: 'Invalid problem number' });
      }
  
      // Find and delete the problem document
      const deleted = await Problem.findOneAndDelete({ problemNumber });
  
      if (!deleted) {
        return res.status(404).json({ message: 'Problem not found' });
      }
  
      // Send success message
      res.status(200).json({ message: `Problem deleted successfully.` });
    } catch (error) {
      // Log and send error on failure
      console.error('Error deleting problem:', error);
      res.status(500).json({ message: 'Failed to delete problem', error: error.message });
    }
  });

// Public route to get a single problem by problem number
app.get('/problems/:problemNumber', async (req, res) => {
  try {
    // Parse problem number parameter
    const problemNumber = parseInt(req.params.problemNumber, 10);
    if (isNaN(problemNumber)) {
      return res.status(400).json({ message: 'Invalid problem number' });
    }

    // Find problem by problem number
    const problem = await Problem.findOne({ problemNumber }).exec();

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Return problem data
    res.json(problem);
  } catch (error) {
    // Log and send error on failure
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Failed to fetch problem', error: error.message });
  }
});

// Public route to get all problems sorted by problem number ascending
app.get('/problems', async (req, res) => {
    try {
      const problems = await Problem.find().sort({ problemNumber: 1 }); // Sorted ascending
      res.status(200).json(problems);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

// Route to submit code for evaluation against hidden test cases
app.post('/submit', async (req, res) => {
    // Extract code, language (default cpp), and problemNumber from request body
    const { code, language = 'cpp', problemNumber } = req.body;
  
    // 1. Validate that code and problemNumber are provided
    if (!code || !problemNumber) {
      return res.status(400).json({ message: 'Code and problem number are required' });
    }
  
    // 2. Retrieve problem details and hidden test cases from database
    const problem = await Problem.findOne({ problemNumber }).exec();
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
  
    const testCases = problem.hiddenTestCases || [];
    let allPassed = true;
    const results = [];
  
    // 3. Run submitted code against each hidden test case using an external compiler backend
    for (const test of testCases) {
      // Send code and test input to compiler service
      const runResponse = await axios.post('http://localhost:8000/run', {
        code,
        input: test.input,
        language
      });
  
      // Trim outputs for accurate comparison
      const actualOutput = (runResponse.data.output || '').trim();
      const expectedOutput = test.output.trim();
      const passed = actualOutput === expectedOutput;
  
      // Collect individual test case result
      results.push({
        input: test.input,
        expected: expectedOutput,
        received: actualOutput,
        passed
      });
  
      // Track overall pass status
      if (!passed) allPassed = false;
    }
  
    // 4. Send back final verdict and detailed test case results
    res.status(200).json({
      verdict: allPassed ? 'Accepted' : 'Wrong Answer',
      results
    });
  });

// Start server and listen on configured port
app.listen(process.env.PORT, () => { 
    console.log(`server is listening on port ${process.env.PORT}!`);
});