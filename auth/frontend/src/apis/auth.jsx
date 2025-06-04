import axios from "axios";
const API = axios.create({
    baseURL: 'http://localhost:3000',
});

export const login = async (email, password) => {
    return await API.post('/login', { email, password });
};

export const register = async (firstname, lastname, email, password) => {
    return await API.post('/register', { firstname, lastname, email, password });
};