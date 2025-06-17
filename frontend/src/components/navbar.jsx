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
    <nav className="bg-slate-100 text-gray-700 shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-5"> {/* Slightly reduced gap */}
        <button
          onClick={() => navigate("/home")}
          className="text-2xl font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md hover:-translate-y-0.5"
        >
          CodeX
        </button> 
        <Link to="/home" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">Home</Link>
        <Link to="/submissions" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">Submissions</Link>
        <Link to="/leaderboard" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">Leaderboard</Link>
        <Link to="/discuss" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">Discuss</Link>
        {isAdmin && (
          <Link to="/admin/problems" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">
            Manage Problems
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3"> {/* Slightly reduced gap */}
        {!isLoggedIn && (
          <>
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 px-4 py-2 rounded-full hover:bg-blue-100 hover:shadow-md hover:-translate-y-0.5">
              Register
            </Link>
            <Link to="/login" className="font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 px-4 py-2 rounded-full hover:shadow-md hover:-translate-y-0.5">
              Login
            </Link>
          </>
        )}
        {isLoggedIn && (
          <>
            <Link to="/profile" className="font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block">
              Profile
            </Link>
            <button onClick={handleLogout} className="font-medium text-sm bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all duration-200 px-4 py-2 rounded-full hover:shadow-md hover:-translate-y-0.5">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;