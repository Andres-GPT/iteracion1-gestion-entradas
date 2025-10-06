export interface CreateSalonInput {
  codigo: string;
  nombre?: string | null;
  capacidad?: number | null;
}

export interface UpdateSalonInput {
  codigo?: string;
  nombre?: string | null;
  capacidad?: number | null;
  estado?: "activo" | "inactivo";
}
