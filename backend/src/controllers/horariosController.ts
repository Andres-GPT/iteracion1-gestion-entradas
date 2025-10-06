import { Request, Response } from "express";
import { Op } from "sequelize";
import { callScheduleAPI, processScheduleData } from "../services/scheduleProcessor";
import Horario from "../models/horarios.model";
import Grupo from "../models/grupos.model";
import Materia from "../models/materias.model";
import Salon from "../models/salones.model";
import Usuario from "../models/Usuario";
import PeriodoAcademico from "../models/periodos_academicos";
import fs from "fs";

/**
 * Obtiene todos los horarios con información completa
 */
export const getAllHorarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const horarios = await Horario.findAll({
      include: [
        {
          model: Grupo,
          as: "grupo",
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
        },
        {
          model: Salon,
          as: "salon",
          attributes: ["id_salon", "codigo", "nombre"],
        },
      ],
      order: [["dia_semana", "ASC"], ["hora_inicio", "ASC"]],
    });

    res.json({
      success: true,
      message: "Horarios obtenidos exitosamente",
      data: horarios,
    });
  } catch (error: any) {
    console.error("Error al obtener horarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener horarios",
    });
  }
};

/**
 * Verifica disponibilidad de un salón en un horario específico
 */
export const verificarDisponibilidadSalon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_salon } = req.params;
    const { dia, hora_inicio, hora_fin, id_periodo, id_horario_excluir } = req.query;

    if (!dia || !hora_inicio || !hora_fin || !id_periodo) {
      res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos: dia, hora_inicio, hora_fin, id_periodo",
      });
      return;
    }

    // Buscar conflictos
    const whereClause: any = {
      id_salon: parseInt(id_salon),
      dia_semana: dia,
    };

    // Excluir el horario actual si estamos editando
    if (id_horario_excluir) {
      whereClause.id_horario = { [Op.ne]: parseInt(id_horario_excluir as string) };
    }

    const conflictos = await Horario.findAll({
      where: whereClause,
      include: [
        {
          model: Grupo,
          as: "grupo",
          where: { id_periodo: parseInt(id_periodo as string) },
          include: [
            { model: Materia, as: "materia", attributes: ["codigo", "nombre"] },
            { model: Usuario, as: "profesor", attributes: ["codigo", "nombre"] },
          ],
        },
      ],
    });

    // Verificar traslapes
    const hayConflicto = conflictos.some((h) => {
      const inicio1 = h.hora_inicio;
      const fin1 = h.hora_fin;
      const inicio2 = hora_inicio as string;
      const fin2 = hora_fin as string;

      // Traslape: (inicio1 < fin2) && (inicio2 < fin1)
      return inicio1 < fin2 && inicio2 < fin1;
    });

    res.json({
      success: true,
      disponible: !hayConflicto,
      conflictos: hayConflicto ? conflictos : [],
    });
  } catch (error: any) {
    console.error("Error al verificar disponibilidad de salón:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar disponibilidad",
    });
  }
};

/**
 * Verifica disponibilidad de un profesor en un horario específico
 */
export const verificarDisponibilidadProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cedula } = req.params;
    const { dia, hora_inicio, hora_fin, id_periodo, id_horario_excluir } = req.query;

    if (!dia || !hora_inicio || !hora_fin || !id_periodo) {
      res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos: dia, hora_inicio, hora_fin, id_periodo",
      });
      return;
    }

    // Buscar grupos del profesor en el período
    const gruposProfesor = await Grupo.findAll({
      where: {
        id_profesor: cedula,
        id_periodo: parseInt(id_periodo as string),
      },
      attributes: ["id_grupo"],
    });

    const idsGrupos = gruposProfesor.map((g) => g.id_grupo);

    if (idsGrupos.length === 0) {
      res.json({ success: true, disponible: true, conflictos: [] });
      return;
    }

    const whereClause: any = {
      id_grupo: { [Op.in]: idsGrupos },
      dia_semana: dia,
    };

    if (id_horario_excluir) {
      whereClause.id_horario = { [Op.ne]: parseInt(id_horario_excluir as string) };
    }

    const conflictos = await Horario.findAll({
      where: whereClause,
      include: [
        {
          model: Grupo,
          as: "grupo",
          include: [
            { model: Materia, as: "materia", attributes: ["codigo", "nombre"] },
          ],
        },
        { model: Salon, as: "salon", attributes: ["codigo", "nombre"] },
      ],
    });

    const hayConflicto = conflictos.some((h) => {
      const inicio1 = h.hora_inicio;
      const fin1 = h.hora_fin;
      const inicio2 = hora_inicio as string;
      const fin2 = hora_fin as string;
      return inicio1 < fin2 && inicio2 < fin1;
    });

    res.json({
      success: true,
      disponible: !hayConflicto,
      conflictos: hayConflicto ? conflictos : [],
    });
  } catch (error: any) {
    console.error("Error al verificar disponibilidad de profesor:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar disponibilidad",
    });
  }
};

/**
 * Crea un horario manualmente
 */
export const crearHorarioManual = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_grupo, id_salon, dia_semana, hora_inicio, hora_fin, cedula_profesor } = req.body;

    if (!id_grupo || !id_salon || !dia_semana || !hora_inicio || !hora_fin) {
      res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
      return;
    }

    // Si se proporciona un profesor diferente, actualizar el grupo temporalmente
    if (cedula_profesor) {
      const grupo = await Grupo.findByPk(id_grupo);
      if (grupo && grupo.id_profesor !== cedula_profesor) {
        await grupo.update({ id_profesor: cedula_profesor });
      }
    }

    // Crear el horario
    const nuevoHorario = await Horario.create({
      id_grupo,
      id_salon,
      dia_semana,
      hora_inicio,
      hora_fin,
    });

    // Obtener el horario completo con relaciones
    const horarioCompleto = await Horario.findByPk(nuevoHorario.id_horario, {
      include: [
        {
          model: Grupo,
          as: "grupo",
          include: [
            { model: Materia, as: "materia" },
            { model: Usuario, as: "profesor" },
            { model: PeriodoAcademico, as: "periodo" },
          ],
        },
        { model: Salon, as: "salon" },
      ],
    });

    res.json({
      success: true,
      message: "Horario creado exitosamente",
      data: horarioCompleto,
    });
  } catch (error: any) {
    console.error("Error al crear horario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear horario",
    });
  }
};

/**
 * Actualiza un horario existente
 */
export const actualizarHorario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { id_salon, dia_semana, hora_inicio, hora_fin } = req.body;

    const horario = await Horario.findByPk(id);

    if (!horario) {
      res.status(404).json({
        success: false,
        message: "Horario no encontrado",
      });
      return;
    }

    await horario.update({
      id_salon: id_salon || horario.id_salon,
      dia_semana: dia_semana || horario.dia_semana,
      hora_inicio: hora_inicio || horario.hora_inicio,
      hora_fin: hora_fin || horario.hora_fin,
    });

    // Obtener horario actualizado con relaciones
    const horarioActualizado = await Horario.findByPk(id, {
      include: [
        {
          model: Grupo,
          as: "grupo",
          include: [
            { model: Materia, as: "materia" },
            { model: Usuario, as: "profesor" },
            { model: PeriodoAcademico, as: "periodo" },
          ],
        },
        { model: Salon, as: "salon" },
      ],
    });

    res.json({
      success: true,
      message: "Horario actualizado exitosamente",
      data: horarioActualizado,
    });
  } catch (error: any) {
    console.error("Error al actualizar horario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar horario",
    });
  }
};

/**
 * Elimina un horario
 */
export const eliminarHorario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const horario = await Horario.findByPk(id);

    if (!horario) {
      res.status(404).json({
        success: false,
        message: "Horario no encontrado",
      });
      return;
    }

    await horario.destroy();

    res.json({
      success: true,
      message: "Horario eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar horario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar horario",
    });
  }
};

/**
 * Importa horarios desde un PDF procesado por API externa
 */
export const importScheduleFromPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No se proporcionó ningún archivo PDF",
      });
      return;
    }

    const filePath = req.file.path;

    // Llamar a la API externa para procesar el PDF
    const scheduleData = await callScheduleAPI(filePath);

    // Procesar el JSON y poblar la base de datos
    const result = await processScheduleData(scheduleData);

    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "Horarios importados exitosamente",
      data: {
        materiasCreadas: result.materiasCreadas,
        gruposCreados: result.gruposCreados,
        horariosCreados: result.horariosCreados,
        advertencias: result.advertencias,
      },
    });
  } catch (error: any) {
    // Eliminar archivo temporal en caso de error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error al importar horarios:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al procesar el archivo PDF",
    });
  }
};
