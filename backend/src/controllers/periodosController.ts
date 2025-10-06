import { Request, Response } from "express";

import PeriodoAcademico from "../models/periodos_academicos";
import {
  CreatePeriodoInput,
  UpdatePeriodoInput,
} from "../types/periodos.types";

export const getPeriodos = async (req: Request, res: Response) => {
  try {
    const periodos = await PeriodoAcademico.findAll();
    res.json(periodos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
};

export const getPeriodo = async (req: Request, res: Response) => {
  try {
    const periodo = await PeriodoAcademico.findByPk(req.params.id);
    if (!periodo) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }
    res.json(periodo);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener periodo" });
  }
};

export const createPeriodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { codigo, fecha_inicio, fecha_fin }: CreatePeriodoInput = req.body;

    // Validaciones básicas
    if (!codigo || !fecha_inicio || !fecha_fin) {
      res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser enviados",
      });
      return;
    }

    // Validar que no exista un periodo con el mismo código
    const periodoExistente = await PeriodoAcademico.findOne({
      where: { codigo }
      });

    if (periodoExistente) {
      res.status(400).json({
        success: false,
        message: "El código del periodo ya existe",
      });
      return;
    }

    // Crear periodo en BD
    const newPeriodo = await PeriodoAcademico.create({
      codigo,
      fecha_inicio,
      fecha_fin,
      estado: "planificado"
    });

    res.status(201).json({
      success: true,
      message: "Periodo creado exitosamente",
      data: newPeriodo,
    });
  } catch (error) {
    console.error("Error en createPeriodo:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const updatePeriodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { codigo, fecha_inicio, fecha_fin, estado }: UpdatePeriodoInput =
      req.body;

    const periodo = await PeriodoAcademico.findByPk(id);
    if (!periodo) {
      res.status(404).json({
        success: false,
        message: `Periodo con id ${id} no encontrado`,
      });
      return;
    }

    if (codigo !== undefined) periodo.codigo = codigo;
    if (fecha_inicio !== undefined) periodo.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) periodo.fecha_fin = fecha_fin;
    if (estado !== undefined) periodo.estado = estado;

    await periodo.save();

    res.status(200).json({
      success: true,
      message: "Periodo actualizado exitosamente",
      data: periodo,
    });
  } catch (error) {
    console.error("Error en editPeriodo:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const abrirPeriodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const periodo = await PeriodoAcademico.findByPk(id);
    if (!periodo) {
      res.status(404).json({
        success: false,
        message: `Periodo con id ${id} no encontrado`,
      });
      return;
    }

    periodo.estado = "abierto";

    await periodo.save();

    res.status(200).json({
      success: true,
      message: "Periodo actualizado exitosamente",
      data: periodo,
    });
  } catch (error) {
    console.error("Error en abrirPeriodo:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const deletePeriodo = async (req: Request, res: Response) => {
  try {
    const periodo = await PeriodoAcademico.findByPk(req.params.id);

    if (!periodo) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }

    periodo.estado = "cerrado";
    await periodo.save();
    res.json(periodo);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar periodo" });
  }
};
