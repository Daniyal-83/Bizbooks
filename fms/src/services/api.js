// src/services/api.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
});


export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);
export const getProfile = () => API.get("/users/profile");
export const logoutUser = () => API.post("/auth/logout");
