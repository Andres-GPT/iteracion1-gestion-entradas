import { Request, Response } from "express";
import Salon from "../models/salones.model";
import { CreateSalonInput, UpdateSalonInput } from "../types/salones.types";

export const getSalones = async (req: Request, res: Response) => {
  try {
    const salones = await Salon.findAll();
    res.json({
      success: true,
      message: "Salones obtenidos exitosamente",
      data: salones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener salones",
    });
  }
};

export const getSalon = async (req: Request, res: Response) => {
  try {
    const salon = await Salon.findByPk(req.params.id);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salón no encontrado",
      });
    }
    res.json({
      success: true,
      message: "Salón obtenido exitosamente",
      data: salon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener salón",
    });
  }
};

export const createSalon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { codigo, nombre, capacidad }: CreateSalonInput = req.body;

    // Validaciones básicas
    if (!codigo) {
      res.status(400).json({
        success: false,
        message: "El código del salón es requerido",
      });
      return;
    }

    // Validar que no exista un salón con el mismo código
    const salonExistente = await Salon.findOne({
      where: { codigo },
    });

    if (salonExistente) {
      res.status(400).json({
        success: false,
        message: "El código del salón ya existe",
      });
      return;
    }

    // Crear salón en BD
    const newSalon = await Salon.create({
      codigo,
      nombre: nombre || null,
      capacidad: capacidad || null,
      estado: "activo",
    });

    res.status(201).json({
      success: true,
      message: "Salón creado exitosamente",
      data: newSalon,
    });
  } catch (error) {
    console.error("Error en createSalon:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const updateSalon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { codigo, nombre, capacidad, estado }: UpdateSalonInput = req.body;

    const salon = await Salon.findByPk(id);
    if (!salon) {
      res.status(404).json({
        success: false,
        message: `Salón con id ${id} no encontrado`,
      });
      return;
    }

    // Si se está cambiando el código, verificar que no exista otro salón con ese código
    if (codigo !== undefined && codigo !== salon.codigo) {
      const salonConMismoCodigo = await Salon.findOne({
        where: { codigo },
      });

      if (salonConMismoCodigo) {
        res.status(400).json({
          success: false,
          message: "El código del salón ya existe",
        });
        return;
      }
    }

    if (codigo !== undefined) salon.codigo = codigo;
    if (nombre !== undefined) salon.nombre = nombre;
    if (capacidad !== undefined) salon.capacidad = capacidad;
    if (estado !== undefined) salon.estado = estado;

    await salon.save();

    res.status(200).json({
      success: true,
      message: "Salón actualizado exitosamente",
      data: salon,
    });
  } catch (error) {
    console.error("Error en updateSalon:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const toggleSalonEstado = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const salon = await Salon.findByPk(id);
    if (!salon) {
      res.status(404).json({
        success: false,
        message: `Salón con id ${id} no encontrado`,
      });
      return;
    }

    // Toggle estado
    salon.estado = salon.estado === "activo" ? "inactivo" : "activo";
    await salon.save();

    res.status(200).json({
      success: true,
      message: `Salón ${salon.estado === "activo" ? "activado" : "desactivado"} exitosamente`,
      data: salon,
    });
  } catch (error) {
    console.error("Error en toggleSalonEstado:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};
