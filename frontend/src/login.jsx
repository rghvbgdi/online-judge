import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "./apis/auth"; // Already imported, no change needed here.

const Login = () => {
const [email , setEmail]= useState("");
const [password , setPassword]= useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [isLoading, setIsLoading] = useState(false);
const navigate = useNavigate();


const handleLogin = async () => {
  setIsLoading(true);
  setError(""); // Clear previous errors
  try {
    await login( email,password);
    // The token is now in an HttpOnly cookie, no need to handle it here.
    setSuccess("Logged in successfully!");
    // Navigate to home after a short delay to show success message
    setTimeout(() => {
      navigate('/home');
    }, 1000);
    
  } catch (error) {
    // Provide more specific feedback based on the error from the backend
    setError(error.response?.data?.message || error.response?.data || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl space-y-6 border border-gray-200">
        <div className="text-3xl font-bold mb-8 text-center text-gray-800">Welcome Back!</div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value ={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />
          <input
            type="password"
            placeholder="Password"
            value = {password}
            onChange = {(e)=>setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />

          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm font-medium text-center">{success}</p>}

          <div className="text-right">
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            onClick = {handleLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;