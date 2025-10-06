import { Request, Response } from "express";
import Grupo from "../models/grupos.model";
import Materia from "../models/materias.model";
import Usuario from "../models/Usuario";
import PeriodoAcademico from "../models/periodos_academicos";

/**
 * Obtiene los grupos activos del período actual (abierto o planificado)
 */
export const getGruposActivos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar período abierto o planificado
    let periodo = await PeriodoAcademico.findOne({
      where: { estado: "abierto" },
      order: [["id_periodo", "ASC"]],
    });

    if (!periodo) {
      periodo = await PeriodoAcademico.findOne({
        where: { estado: "planificado" },
        order: [["id_periodo", "ASC"]],
      });
    }

    if (!periodo) {
      res.json({
        success: true,
        message: "No hay períodos activos",
        data: {
          periodo: null,
          grupos: [],
        },
      });
      return;
    }

    // Obtener grupos del período
    const grupos = await Grupo.findAll({
      where: { id_periodo: periodo.id_periodo },
      include: [
        {
          model: Materia,
          as: "materia",
          attributes: ["id_materia", "codigo", "nombre"],
        },
        {
          model: Usuario,
          as: "profesor",
          attributes: ["cedula", "codigo", "nombre"],
        },
        {
          model: PeriodoAcademico,
          as: "periodo",
          attributes: ["id_periodo", "codigo", "estado"],
        },
      ],
      order: [
        [{ model: Materia, as: "materia" }, "nombre", "ASC"],
        ["codigo_grupo", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: {
        periodo,
        grupos,
      },
    });
  } catch (error: any) {
    console.error("Error al obtener grupos activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener grupos activos",
    });
  }
};
