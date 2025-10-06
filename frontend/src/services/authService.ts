import { api } from "../config/axios";

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      cedula: number;
      codigo?: number;
      nombre: string;
      correo: string;
      telefono: string;
      rol: string;
    };
  };
}

// Login
export const login = (credentials: LoginCredentials) =>
  api.post<LoginResponse>("/api/auth/login", credentials);

// Logout
export const logout = () => api.post("/api/auth/logout");

// Password recovery
export const forgotPassword = (correo: string) =>
  api.post("/api/auth/forgot-password", { correo });

export const verifyResetToken = (token: string) =>
  api.get(`/api/auth/verify-reset-token/${token}`);

export const resetPassword = (token: string, nueva_password: string) =>
  api.post("/api/auth/reset-password", { token, nueva_password });

// Token management
export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

// User data management
export const saveUserData = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUserData = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
  localStorage.removeItem("user");
};
