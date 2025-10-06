import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as authService from "../services/authService";

interface User {
  cedula: number;
  codigo?: number;
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    const savedToken = authService.getToken();
    const savedUser = authService.getUserData();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login({ correo, password });

      if (response.data.success && response.data.data) {
        const { token: newToken, user: userData } = response.data.data;

        // Guardar en estado
        setToken(newToken);
        setUser(userData);

        // Guardar en localStorage
        authService.saveToken(newToken);
        authService.saveUserData(userData);
      } else {
        throw new Error(response.data.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al iniciar sesión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      // Limpiar estado
      setUser(null);
      setToken(null);
      setError(null);

      // Limpiar localStorage
      authService.removeToken();
      authService.removeUserData();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
