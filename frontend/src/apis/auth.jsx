import axios from "axios";
const API = axios.create({
    baseURL: 'http://localhost:3000',
});

const CompilerAPI = axios.create({
  baseURL: 'http://localhost:8000',
});

export const login = async (email, password) => {
    return await API.post('/login', { email, password });
};

export const fetchProblemByNumber = async (problemNumber) => {
    return await API.get(`/problems/${problemNumber}`);
  };

export const register = async (firstname, lastname, email, password) => {
    return await API.post('/register', { firstname, lastname, email, password });
};

export const fetchAllProblems = async () => {
    return await API.get(`/problems`);
  };

export const createProblem = async (formData, token) => {
    return await API.post('/admin/problems', formData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteProblem = async (problemNumber, token) => {
    return await API.delete(`/admin/problems/${problemNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const checkAdminStatus = async (token) => {
    return await API.get('/admin/problems', {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const runCode = async (code, input, language = 'cpp') => {
  return await CompilerAPI.post('/run', { code, input, language });
};