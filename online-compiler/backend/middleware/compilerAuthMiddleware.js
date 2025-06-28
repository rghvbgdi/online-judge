const jwt = require('jsonwebtoken');

// Ensure the SECRET_KEY is loaded from the .env file.
const MAIN_BACKEND_SECRET_KEY = process.env.SECRET_KEY;
if (!MAIN_BACKEND_SECRET_KEY) {
  // This will crash the server on startup if the key is missing, which is good for debugging.
  throw new Error('FATAL ERROR: SECRET_KEY is not defined in the environment variables for the compiler service.');
}

// Middleware to authenticate user from frontend submission (in compiler service)
const compilerUserAuth = (req, res, next) => {
  const token = req.cookies.token; // Read token from cookies
  if (!token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  try {
    const decoded = jwt.verify(token, MAIN_BACKEND_SECRET_KEY);
    req.user = decoded; // Attach decoded user info (id, email, role)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { compilerUserAuth };