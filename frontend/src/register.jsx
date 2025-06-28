import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./apis/auth";

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(
        formData.firstname,
        formData.lastname,
        formData.email,
        formData.password
      );

      setSuccess("Registered successfully! Redirecting to login...");
      setError("");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data || "Something went wrong");
      setSuccess("");
      setLoading(false);
      console.error("Registration error:", error);
    }
  };
  // setLoading is now handled by the button's disabled state, no need for finally block
  // if we want the button to re-enable on success before navigation.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6 border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
          Create an Account
          </h2>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />

          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
          />

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm font-medium text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;