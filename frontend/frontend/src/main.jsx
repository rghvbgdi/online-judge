import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './register.jsx';
import Login from './login.jsx';
import Home from './home.jsx';
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import ProblemDetails from './components/problemdetails.jsx';  // new component to display problem details with dynamic route parameter
import AdminProblems from './adminproblems.jsx'; // adjust the path if the file is in a different folder
import NotFound from './notFound.jsx';
import './index.css';


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
            <Route path="/navbar" element={<Navbar />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/problems" element={<AdminProblems />} />
            <Route path="/admin/problems" element={<AdminProblems />} /> {/* Admin problems management */}
            <Route path="/home/:problemNumber" element={<ProblemDetails />} />  {/* dynamic route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
);
