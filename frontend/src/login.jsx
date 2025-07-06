import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, forgotPassword } from "./apis/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      setSuccess("Welcome back!");
      setTimeout(() => {
        navigate("/home");
      }, 300); // Short delay ensures cookie is registered
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
      setSuccess("");
      setIsLoading(false);
    }
  };

  const handleForgotPasswordToggle = () => {
    setShowForgotPassword(!showForgotPassword);
    setResetEmail("");
    setResetMessage("");
    setError("");
    setSuccess("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    if (!resetEmail) {
      setResetMessage("Please enter your email address.");
      return;
    }
    try {
      await forgotPassword(resetEmail);
      setResetMessage("Reset link sent to your email if account exists.");
    } catch {
      setResetMessage("Unable to send reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-500 ease-out">
          {/* Form container with smooth height transition */}
          <div className={`transition-all duration-500 ease-out ${showForgotPassword ? 'transform' : ''}`}>
            <form onSubmit={showForgotPassword ? handleResetPassword : handleLogin} className="p-8 space-y-6">
              
              {/* Header section */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {showForgotPassword ? "Reset Password" : "Welcome Back"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {showForgotPassword ? "Enter your email to reset password" : "Sign in to continue to your account"}
                </p>
              </div>

              {/* Login Form */}
              {!showForgotPassword && (
                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L12 12m-3.228-3.228l-1.415-1.414M12 12l2.121 2.121m-2.121-2.121l2.121-2.121" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPasswordToggle}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password Form */}
              {showForgotPassword && (
                <div className="space-y-5">
                  <div className="relative group">
                    <input
                      type="email"
                      name="resetEmail"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {(error || success || resetMessage) && (
                <div className="space-y-3">
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in slide-in-from-top-2 duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm animate-in slide-in-from-top-2 duration-300">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{success}</span>
                    </div>
                  )}
                  
                  {resetMessage && (
                    <div className={`flex items-center gap-3 p-3 border rounded-lg text-sm animate-in slide-in-from-top-2 duration-300 ${
                      resetMessage.includes('sent') 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                    }`}>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {resetMessage.includes('sent') ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span>{resetMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {showForgotPassword 
                  ? "Send Reset Link" 
                  : isLoading 
                    ? "Signing in..." 
                    : "Sign In"
                }
              </button>

              {/* Footer Actions */}
              {showForgotPassword ? (
                <button
                  type="button"
                  onClick={handleForgotPasswordToggle}
                  className="w-full text-center text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  ← Back to sign in
                </button>
              ) : (
                <div className="text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;