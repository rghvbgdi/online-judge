import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fetchUserStats, logout as logoutAPI } from "../apis/auth";
   
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location to trigger re-checks on navigation 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkLoginAndAdminStatus = async () => {
        try {
          // This single API call checks if the user is logged in and gets their role.
          const response = await fetchUserStats();
          setIsLoggedIn(true);
          setIsAdmin(response.data.role === 'admin');
        } catch (error) {
          // If the request fails (e.g., 401 Unauthorized), the user is not logged in.
          setIsLoggedIn(false);
          setIsAdmin(false);
        }  
      };

      checkLoginAndAdminStatus();
    }, [location]); // Re-run this effect whenever the location (URL) changes

    const handleLogout = async () => {
        try {
            await logoutAPI(); // Call backend to clear HttpOnly cookie
        } catch (error) {
            console.error("Logout failed on backend:", error);
        } finally {
            // Update local state on logout
            setIsLoggedIn(false);
            setIsAdmin(false);
            navigate("/login"); // Redirect to login page
        }
    };

    return (
        <nav className="bg-gray-900 text-gray-100 shadow-xl border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate("/home")}
                    className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
                >
                    CodeAlly
                </button> 
                <Link
                    to="/home"
                    className={`font-medium transition-all duration-200 px-3 py-2 ${
                        location.pathname === "/home"
                            ? "text-blue-400"
                            : "text-gray-300 hover:text-blue-400"
                    }`}
                >
                    Home
                </Link>
                <Link
                    to="/problems"
                    className={`font-medium transition-all duration-200 px-3 py-2 ${
                        location.pathname === "/problems"
                            ? "text-blue-400"
                            : "text-gray-300 hover:text-blue-400"
                    }`}
                >
                    Problems
                </Link>
                
                <Link
                    to="/onlinecompiler"
                    className={`font-medium transition-all duration-200 px-3 py-2 ${
                        location.pathname === "/onlinecompiler"
                            ? "text-blue-400"
                            : "text-gray-300 hover:text-blue-400"
                    }`}
                >
                    Online Compiler
                </Link>
                <Link
                    to="/leaderboard"
                    className={`font-medium transition-all duration-200 px-3 py-2 ${
                        location.pathname === "/leaderboard"
                            ? "text-blue-400"
                            : "text-gray-300 hover:text-blue-400"
                    }`}
                >
                    Leaderboard
                </Link>
                {isAdmin && (
                    <Link
                        to="/admin/problems"
                        className={`font-medium transition-all duration-200 px-3 py-2 ${
                            location.pathname === "/admin/problems"
                                ? "text-blue-400"
                                : "text-gray-300 hover:text-blue-400"
                        }`}
                    >
                        Manage Problems
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-3">
                {!isLoggedIn && (
                    <>
                        <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-all duration-200 px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-500">
                            Register
                        </Link>
                        <Link to="/login" className="font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 px-4 py-2 rounded-lg shadow-lg">
                            Login
                        </Link>
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <Link
                            to="/profile"
                            className={`font-medium transition-all duration-200 px-3 py-2 ${
                                location.pathname === "/profile"
                                    ? "text-blue-400"
                                    : "text-gray-300 hover:text-blue-400"
                            }`}
                        >
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-all duration-200 px-4 py-2 rounded-lg shadow-lg">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;