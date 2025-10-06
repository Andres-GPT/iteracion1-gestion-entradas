import { api } from "../config/axios";

// traer todos
export const getUsuarios = () => api.get("/usuarios");

// traer un usuario
export const getUsuario = (id: string) => api.get(`/usuarios/${id}`);

// crear
export const createUsuario = (data: any) => api.post("/usuarios", data);

// actualizar
export const updateUsuario = (id: string, data: any) => api.put(`/usuarios/${id}`, data);

// eliminar
export const deleteUsuario = (id: string) => api.delete(`/usuarios/${id}`);

// importar profesores
export const importProfesores = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/usuarios/import/profesores", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// importar estudiantes
export const importEstudiantes = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/usuarios/import/estudiantes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
