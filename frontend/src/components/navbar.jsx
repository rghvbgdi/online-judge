import React from "react";
import { Link ,useNavigate } from "react-router-dom";

const Navbar = () => {
    const isLoggedIn = Boolean(localStorage.getItem("token"));
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4 text-white flex items-center">
      <div className="flex gap-8 items-center">
        <button
          onClick={() => navigate("/home")}
          className="hover:-translate-y-1 hover:bg-white/20 transition-transform duration-200 rounded-md px-2 py-1 cursor-pointer text-2xl font-bold"
        >
          CodeX
        </button> 
        <Link to="/home" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">Home</Link>
        <Link to="/submissions" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">Submissions</Link>
        <Link to="/leaderboard" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">Leaderboard</Link>
        <Link to="/discuss" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">Discuss</Link>
      </div>
      <div className="flex gap-4 items-center ml-auto">
        {!isLoggedIn && (
          <Link to="/login" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
            Login
          </Link> //if already logged in then i wont show the login button
        )}
        {isLoggedIn && (
          <>
            <Link to="/profile" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Profile
            </Link>
            <button onClick={handleLogout} className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Logout
            </button>
          </> // if not logged in then i will not show the profile and logout button
        )}
      </div>
    </nav>
  );
};
export default Navbar;