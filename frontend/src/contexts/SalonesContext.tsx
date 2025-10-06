import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import * as salonService from "../services/salonService";

interface Salon {
  id_salon: number;
  codigo: string;
  nombre: string | null;
  capacidad: number | null;
  estado: "activo" | "inactivo";
}

interface SalonesContextType {
  salones: Salon[];
  loading: boolean;
  error: string | null;
  fetchSalones: () => Promise<void>;
  createSalon: (salon: any) => Promise<void>;
  updateSalon: (id: number, salon: any) => Promise<void>;
  toggleSalonEstado: (id: number) => Promise<void>;
  clearError: () => void;
}

const SalonesContext = createContext<SalonesContextType | undefined>(undefined);

export function SalonesProvider({ children }: { children: ReactNode }) {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await salonService.getSalones();
      setSalones(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar salones");
      console.error("Error fetching salones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSalon = async (salon: any) => {
    try {
      setLoading(true);
      setError(null);
      await salonService.createSalon(salon);
      await fetchSalones(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear salón");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalon = async (id: number, salon: any) => {
    try {
      setLoading(true);
      setError(null);
      await salonService.updateSalon(id, salon);
      await fetchSalones(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar salón");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleSalonEstado = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await salonService.toggleSalonEstado(id);
      await fetchSalones(); // Recargar lista
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar estado del salón");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    salones,
    loading,
    error,
    fetchSalones,
    createSalon,
    updateSalon,
    toggleSalonEstado,
    clearError,
  };

  return <SalonesContext.Provider value={value}>{children}</SalonesContext.Provider>;
}

export function useSalones() {
  const context = useContext(SalonesContext);
  if (context === undefined) {
    throw new Error("useSalones must be used within a SalonesProvider");
  }
  return context;
}
