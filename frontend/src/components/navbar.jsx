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
    <nav className="bg-slate-100 text-gray-700 shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-5"> {/* Slightly reduced gap */}
        <button
          onClick={() => navigate("/home")}
          className="text-2xl font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md hover:-translate-y-0.5"
        >
          CodeX
        </button> 
        <Link
          to="/home"
          className={`font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block ${
            location.pathname === "/home"
              ? "underline underline-offset-4 decoration-2 decoration-blue-600"
              : ""
          }`}
        >
          Home
        </Link>
        <Link
          to="/leaderboard"
          className={`font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block ${
            location.pathname === "/leaderboard"
              ? "underline underline-offset-4 decoration-2 decoration-blue-600"
              : ""
          }`}
        >
          Leaderboard
        </Link>
        {isAdmin && (
          <Link
            to="/admin/problems"
            className={`font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block ${
              location.pathname === "/admin/problems"
                ? "underline underline-offset-4 decoration-2 decoration-blue-600"
                : ""
            }`}
          >
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
            <Link
              to="/profile"
              className={`font-medium hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 block ${
                location.pathname === "/profile"
                  ? "underline underline-offset-4 decoration-2 decoration-blue-600"
                  : ""
              }`}
            >
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