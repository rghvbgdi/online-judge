// Load environment variables from .env file located in the same directory as this script
require('dotenv').config({ path: __dirname + '/.env' });

// Import required modules
const express = require('express'); // Express framework for building the API server
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const app = express();

// Import route modules
const compilerRoutes = require('./routes/compilerRoutes');

app.use(cors({
  origin: 'http://65.0.108.208:5173', // Allow requests from your frontend origin
  credentials: true, // Allow cookies to be sent and received
}));
app.use(cookieParser());
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Basic health check endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('Hello, this is the Online Compiler Server at port 8000!');
});

// Use compiler route module
// Any DB operations within compilerRoutes will now make HTTP requests to the backend service.
app.use('/', compilerRoutes); // Mount compiler routes at the root path

// Start the Express server on the port specified in environment or default to 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});