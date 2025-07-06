import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ,
    withCredentials: true // IMPORTANT: This tells axios to send cookies
});

// The compiler service is still at 8000
const CompilerAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL2 ,
  withCredentials: true // IMPORTANT: This tells axios to send cookies
});

export const login = (email, password) => {
    return API.post('/api/auth/login', { email, password });
};

export const fetchProblemByNumber = (problemNumber) => {
    return API.get(`/api/problems/${problemNumber}`);
  };

export const register = (firstname, lastname, email, password) => {
    return API.post('/api/auth/register', { firstname, lastname, email, password });
};

export const fetchAllProblems = () => {
    return API.get(`/api/problems`);
  };

export const createProblem = (formData) => {
    return API.post('/api/problems/admin', formData);
};

export const deleteProblem = (problemNumber) => {
    return API.delete(`/api/problems/admin/${problemNumber}`);
};

export const checkAdminStatus = () => {
    return API.get('/api/problems/admin');
};

export const runCode = (code, input, language = 'cpp') => {
  return CompilerAPI.post('/run', { code, input, language });
};

export const submitCode = (code, language, problemNumber) => {
  return CompilerAPI.post('/submit', { code, language, problemNumber });
};

export const logout = () => {
    return API.post('/api/auth/logout');
};

export const fetchUserStats = () => API.get('/api/user/stats');

// New lightweight endpoint for fetching only solved problem numbers
export const fetchSolvedProblems = () => API.get('/api/user/solved');

export const fetchPublicProfile = (userId) => API.get(`/api/user/profile/${userId}`);


export const fetchLeaderboard = () => {
  // NOTE: This assumes your backend has a GET /api/leaderboard endpoint
  // that returns a sorted array of users.
  // Example user object: { username: 'user1', problemsSolved: 10, score: 1500 }
  return API.get('/api/leaderboard');
};

export const getAIFeedback = (data) => {
  return API.post('/api/gemini/feedback', data);
};


// Forgot password API call
export const forgotPassword = (email) => {
  return API.post('/api/auth/forgot-password', { email });
};