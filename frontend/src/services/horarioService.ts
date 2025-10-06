import api from "../config/axios";

/**
 * Obtiene todos los horarios con información completa
 */
export const getAllHorarios = () => {
  return api.get("/horarios");
};

/**
 * Verifica disponibilidad de un salón
 */
export const verificarDisponibilidadSalon = (
  id_salon: number,
  params: { dia: string; hora_inicio: string; hora_fin: string; id_periodo: number; id_horario_excluir?: number }
) => {
  return api.get(`/horarios/disponibilidad-salon/${id_salon}`, { params });
};

/**
 * Verifica disponibilidad de un profesor
 */
export const verificarDisponibilidadProfesor = (
  cedula: string,
  params: { dia: string; hora_inicio: string; hora_fin: string; id_periodo: number; id_horario_excluir?: number }
) => {
  return api.get(`/horarios/disponibilidad-profesor/${cedula}`, { params });
};

/**
 * Crea un horario manualmente
 */
export const crearHorario = (data: {
  id_grupo: number;
  id_salon: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  cedula_profesor?: string;
}) => {
  return api.post("/horarios", data);
};

/**
 * Actualiza un horario existente
 */
export const actualizarHorario = (
  id: number,
  data: { id_salon?: number; dia_semana?: string; hora_inicio?: string; hora_fin?: string }
) => {
  return api.put(`/horarios/${id}`, data);
};

/**
 * Elimina un horario
 */
export const eliminarHorario = (id: number) => {
  return api.delete(`/horarios/${id}`);
};

/**
 * Importa horarios desde un archivo PDF
 */
export const importSchedulePDF = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/horarios/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
