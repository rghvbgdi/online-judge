import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './register.jsx';
import Login from './login.jsx';
import Home from './home.jsx';
import ProblemList from './problemlist.jsx';
import Navbar from "./components/navbar.jsx";
import ProblemDetails from './components/problemdetails.jsx';  // new component to display problem details with dynamic route parameter
import AdminProblems from './adminproblems.jsx'; // adjust the path if the file is in a different folder
import NotFound from './notFound.jsx';
import ProfilePage from './profile.jsx'; // Import the new ProfilePage component
import './index.css';
import Leaderboard from './Leaderboard.jsx';
import OnlineCompiler from './onlinecompiler.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard/>}/>
            <Route path="/admin/problems" element={<AdminProblems />} /> {/* Admin problems management */}
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:problemNumber" element={<ProblemDetails />} />  {/* dynamic route */}
            <Route path="/profile" element={<ProfilePage />} /> {/* Route for logged-in user's own profile */}
            <Route path="/profile/:userId" element={<ProfilePage />} /> {/* Route for public profiles */}
            <Route path="*" element={<NotFound />} />
            <Route path="/OnlineCompiler" element={<OnlineCompiler/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  </StrictMode>
);
