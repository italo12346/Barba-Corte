import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL || "https://barba-corte.onrender.com";

const api = axios.create({
  baseURL: apiUrl,
});

export default api;