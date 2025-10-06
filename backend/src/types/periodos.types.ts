export interface CreatePeriodoInput{
    codigo: string;
    fecha_inicio: Date;
    fecha_fin: Date;
}

export interface UpdatePeriodoInput{
    codigo: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: "abierto" | "cerrado" | "planificado";
}