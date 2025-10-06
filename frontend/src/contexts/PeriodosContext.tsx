import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import * as periodoService from "../services/periodoService";

interface Periodo {
  id_periodo: number;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "abierto" | "cerrado" | "planificado";
}

interface PeriodosContextType {
  periodos: Periodo[];
  loading: boolean;
  error: string | null;
  fetchPeriodos: () => Promise<void>;
  createPeriodo: (periodo: any) => Promise<void>;
  abrirPeriodo: (id: number) => Promise<void>;
  cerrarPeriodo: (id: number) => Promise<void>;
  clearError: () => void;
}

const PeriodosContext = createContext<PeriodosContextType | undefined>(undefined);

export function PeriodosProvider({ children }: { children: ReactNode }) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await periodoService.getPeriodos();
      setPeriodos(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar períodos");
      console.error("Error fetching periodos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPeriodo = async (periodo: any) => {
    try {
      setLoading(true);
      setError(null);
      await periodoService.createPeriodo(periodo);
      await fetchPeriodos(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear período");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const abrirPeriodo = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await periodoService.abrirPeriodo(id);
      await fetchPeriodos(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al abrir período");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cerrarPeriodo = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await periodoService.cerrarPeriodo(id);
      await fetchPeriodos(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cerrar período");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    periodos,
    loading,
    error,
    fetchPeriodos,
    createPeriodo,
    abrirPeriodo,
    cerrarPeriodo,
    clearError,
  };

  return <PeriodosContext.Provider value={value}>{children}</PeriodosContext.Provider>;
}

export function usePeriodos() {
  const context = useContext(PeriodosContext);
  if (context === undefined) {
    throw new Error("usePeriodos must be used within a PeriodosProvider");
  }
  return context;
}
