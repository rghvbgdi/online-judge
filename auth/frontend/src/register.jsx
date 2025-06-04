import {useState} from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom"; 
import React from "react";
import { register } from "./apis/auth";
const Register = () =>{
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate(); 
const handleregister =  async  () =>{

    try {
        const response = await register(firstname, lastname, email, password);

        setSuccess("Registered successfully!");
        setError("");
        console.log(response.data);
        navigate('/login');
    }
    catch(error){
        setError(error.response?.data || "Something went wrong");
        setSuccess("");
        console.log("we are encountering the error:", error);
    }
}
return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md p-6 bg-white border rounded-lg shadow-md">
      <div className="text-2xl font-bold mb-6 text-center">Register</div>

      <div className="flex flex-col gap-4">

      <input 
      type ="text"
      placeholder = "First Name"
      value = {firstname}
      onChange ={(e) => setFirstname(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded"
     />

<input 
      type ="text"
      placeholder = "Last Name"
      value = {lastname}
      onChange ={(e) => setLastname(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded"
      />
      
      <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
          />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
      
          <button
            type="button"
            onClick={handleregister}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
          >
            register
            </button>
      
      </div>
      </div>
    </div>
);
};


export default Register;