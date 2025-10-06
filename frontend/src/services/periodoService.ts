import { api } from "../config/axios";

// Traer todos los periodos
export const getPeriodos = () => api.get("/periodos");

// Traer un periodo
export const getPeriodo = (id: number) => api.get(`/periodos/${id}`);

// Crear periodo
export const createPeriodo = (data: any) => api.post("/periodos", data);

// Actualizar periodo
export const updatePeriodo = (id: number, data: any) => api.put(`/periodos/${id}`, data);

// Abrir periodo (cambia estado a "abierto")
export const abrirPeriodo = (id: number) => api.patch(`/periodos/${id}`);

// Cerrar periodo (cambia estado a "cerrado")
export const cerrarPeriodo = (id: number) => api.delete(`/periodos/${id}`);
