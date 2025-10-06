import axios from "axios";

// Crear instancia de Axios con configuración base
export const api = axios.create({
  baseURL: "http://localhost:4444",
});

// Interceptor para agregar el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta globalmente (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido, podrías redirigir al login aquí
    if (error.response?.status === 401) {
      console.error("Token inválido o expirado");
      // Opcional: limpiar localStorage y redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
