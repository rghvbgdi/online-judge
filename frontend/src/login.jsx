import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./apis/auth";

const Login = () => {
const [email , setEmail]= useState("");
const [password , setPassword]= useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const navigate = useNavigate();


const handleLogin = async () => {
  try {
    const response = await login( email,password);


    const token = response.data.user.token;
   
    localStorage.setItem("token", token);
    setError("");
    setSuccess("Logged in successfully!");
    console.log(response.data);
    navigate('/home');
    
  } catch (error) {
    setError("Invalid credentials");
    console.log("we are encountering the error:", error);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white border rounded-lg shadow-md">
        <div className="text-2xl font-bold mb-6 text-center">Login</div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value ={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value = {password}
            onChange = {(e)=>setPassword(e.target.value)}
            className="w-full p-3 border mb-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

{error && <p className="text-red-500 text-sm">{error}</p>}
{success && <p className="text-green-500 text-sm">{success}</p>}
            <button
              type="button"
              className="text-right mb-2 text-sm text-blue-500 hover:underline"
            >
              Forgot password?
            </button>

          <button
            type="submit"
            onClick = {handleLogin}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;