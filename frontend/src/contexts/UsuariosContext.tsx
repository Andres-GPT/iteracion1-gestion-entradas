import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import * as usuarioService from "../services/usuarioService";

interface Usuario {
  cedula: number;
  codigo?: number;
  nombre: string;
  correo: string;
  telefono: string;
  id_rol: number;
  estado: "activo" | "inactivo";
  password_hash?: string;
}

interface UsuariosContextType {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
  createUsuario: (usuario: any) => Promise<void>;
  updateUsuario: (cedula: string, usuario: any) => Promise<void>;
  deleteUsuario: (cedula: string) => Promise<void>;
  clearError: () => void;
}

const UsuariosContext = createContext<UsuariosContextType | undefined>(undefined);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.getUsuarios();
      setUsuarios(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar usuarios");
      console.error("Error fetching usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = async (usuario: any) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.createUsuario(usuario);
      await fetchUsuarios(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (cedula: string, usuario: any) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.updateUsuario(cedula, usuario);
      await fetchUsuarios(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (cedula: string) => {
    try {
      setLoading(true);
      setError(null);
      await usuarioService.deleteUsuario(cedula);
      await fetchUsuarios(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    clearError,
  };

  return <UsuariosContext.Provider value={value}>{children}</UsuariosContext.Provider>;
}

export function useUsuarios() {
  const context = useContext(UsuariosContext);
  if (context === undefined) {
    throw new Error("useUsuarios must be used within a UsuariosProvider");
  }
  return context;
}
