import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL || "https://barba-corte.onrender.com";

const api = axios.create({
  baseURL: apiUrl,
});
// Interceptor para injetar o token em todas as chamadas
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@barba-corte:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
