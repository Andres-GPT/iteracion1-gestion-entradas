import { api } from "../config/axios";

// Traer todos los salones
export const getSalones = () => api.get("/salones");

// Traer un salón
export const getSalon = (id: number) => api.get(`/salones/${id}`);

// Crear salón
export const createSalon = (data: any) => api.post("/salones", data);

// Actualizar salón
export const updateSalon = (id: number, data: any) => api.put(`/salones/${id}`, data);

// Toggle estado del salón (activar/desactivar)
export const toggleSalonEstado = (id: number) => api.patch(`/salones/${id}/toggle`);
