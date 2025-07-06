const express = require('express');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
const cookieParser = require('cookie-parser');
const {DBConnection}= require("./database/db");
const cors = require('cors');


app.use(cors({
  origin: 'http://65.0.108.208:5173', // or wherever your frontend runs
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - simple test endpoint
app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});

// Await DB connection before starting the server
(async () => {
  await DBConnection();

  // Import route modules AFTER DB connection is established
  const authRoutes = require('./routes/authRoutes');
  const problemRoutes = require('./routes/problemRoutes');
  const userRoutes = require('./routes/userRoutes');
  const submissionRoutes = require('./routes/submissionRoutes');
  const leaderboardRoutes =require('./routes/leaderboardRoutes') ; // Import the new leaderboard routes
  const geminiRoutes = require('./routes/geminiRoutes');
  // Use route modules
  app.use('/api/auth', authRoutes); // e.g., /api/auth/register, /api/auth/login
  app.use('/api/problems', problemRoutes); // e.g., /api/problems, /api/problems/:problemNumber, /api/problems/admin
  app.use('/api/user', userRoutes); // e.g., /api/user/solved-problems
  app.use('/api/submission', submissionRoutes); // e.g., /api/submission/verdict
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/gemini', geminiRoutes);
  // Start server and listen on configured port
  app.listen(process.env.PORT, () => {
      console.log(`server is listening on port ${process.env.PORT}!`);
  });
})();