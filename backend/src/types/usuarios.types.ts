export interface CreateUserInput {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  id_rol: number;
  codigo?: string;
}

export interface UpdateUserInput {
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
  id_rol: number;
  codigo?: string;
}
