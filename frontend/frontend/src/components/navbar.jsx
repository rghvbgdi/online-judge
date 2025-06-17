import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAdminStatus } from "../apis/auth";

const Navbar = () => {
    const isLoggedIn = Boolean(localStorage.getItem("token"));
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkAdmin = async () => {
        try {
          const token = localStorage.getItem("token");
          await checkAdminStatus(token);
          setIsAdmin(true);
        } catch {
          setIsAdmin(false);
        }
      };

      if (isLoggedIn) checkAdmin();
    }, [isLoggedIn]);

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
        {isAdmin && (
          <Link to="/admin/problems" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
            Manage Problems
          </Link>
        )}
      </div>
      <div className="flex gap-4 items-center ml-auto">
        {!isLoggedIn && (
          <>
            <Link to="/register" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Register
            </Link>
            <Link to="/login" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Login
            </Link>
          </>
        )}
        {isLoggedIn && (
          <>
            <Link to="/profile" className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Profile
            </Link>
            <button onClick={handleLogout} className="hover:-translate-y-1 transition-transform duration-200 hover:bg-white/20 rounded-md px-2 py-1">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;