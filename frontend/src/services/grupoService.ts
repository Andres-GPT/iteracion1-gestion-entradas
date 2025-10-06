import api from "../config/axios";

/**
 * Obtiene los grupos activos del período actual
 */
export const getGruposActivos = () => {
  return api.get("/grupos/activos");
};
