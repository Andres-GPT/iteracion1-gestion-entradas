export interface RegisterRequest {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  password: string;
  id_rol: number;
  codigo?: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface TokenPayload {
  cedula: string;
  codigo?: string;
  correo: string;
  id_rol: number;
  nombre: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      cedula: string;
      codigo?: string;
      nombre: string;
      correo: string;
      telefono: string;
      rol: string;
    };
  };
}
