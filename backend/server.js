const express = require('express');
const app = express();
const {DBConnection}= require("./database/db");
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const userRoutes = require('./routes/userRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Middleware
app.use(cors());
DBConnection();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - simple test endpoint
app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});

// Use route modules
app.use('/api/auth', authRoutes); // e.g., /api/auth/register, /api/auth/login
app.use('/api/problems', problemRoutes); // e.g., /api/problems, /api/problems/:problemNumber, /api/problems/admin
app.use('/api/user', userRoutes); // e.g., /api/user/solved-problems
app.use('/api/submission', submissionRoutes); // e.g., /api/submission/verdict

// Start server and listen on configured port
app.listen(process.env.PORT, () => { 
    console.log(`server is listening on port ${process.env.PORT}!`);
});