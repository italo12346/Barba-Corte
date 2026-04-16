import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: apiUrl,
} );

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@barba-corte:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
