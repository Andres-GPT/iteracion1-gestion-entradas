import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Materia from "../models/materias.model";
import Grupo from "../models/grupos.model";
import Horario from "../models/horarios.model";
import Salon from "../models/salones.model";
import Usuario from "../models/Usuario";
import PeriodoAcademico from "../models/periodos_academicos";

interface CursoData {
  codigo: string;
  codigo_p: string;
  nombre: string;
  hora: string;
}

interface ScheduleJSON {
  [salon: string]: {
    [dia: string]: CursoData[];
  };
}

interface ProcessResult {
  materiasCreadas: number;
  gruposCreados: number;
  horariosCreados: number;
  advertencias: string[];
}

/**
 * Parsea un código de curso para extraer código de materia y grupo
 * Ejemplo: "1155605A" -> { codigoMateria: "1155605", codigoGrupo: "A" }
 */
function parseCodigoCurso(codigo: string): {
  codigoMateria: string;
  codigoGrupo: string;
} {
  const match = codigo.match(/^(\d+)([A-Z])$/);
  if (!match) {
    throw new Error(`Formato de código inválido: ${codigo}`);
  }
  return {
    codigoMateria: match[1],
    codigoGrupo: match[2],
  };
}

/**
 * Parsea un rango horario
 * Ejemplo: "08:00-10:00" -> { hora_inicio: "08:00:00", hora_fin: "10:00:00" }
 */
function parseHorario(horario: string): {
  hora_inicio: string;
  hora_fin: string;
} {
  const [inicio, fin] = horario.split("-");
  return {
    hora_inicio: `${inicio}:00`,
    hora_fin: `${fin}:00`,
  };
}

type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado";

/**
 * Normaliza el nombre del día para coincidir con el ENUM de la BD
 * Transforma "Miercoles" -> "Miércoles" y "Sabado" -> "Sábado"
 */
function normalizarDia(dia: string): DiaSemana {
  const mapasDias: { [key: string]: DiaSemana } = {
    Lunes: "Lunes",
    Martes: "Martes",
    Miercoles: "Miércoles",
    Jueves: "Jueves",
    Viernes: "Viernes",
    Sabado: "Sábado",
  };
  return mapasDias[dia] || "Lunes"; // Fallback a "Lunes" si no coincide
}

/**
 * Llama a la API externa para procesar el PDF
 */
export async function callScheduleAPI(filePath: string): Promise<ScheduleJSON> {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post<ScheduleJSON>(
    "http://localhost:8000/procesar-pdf",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  console.log("Respuesta de la API:", response.data);

  return response.data;
}

/**
 * Procesa el JSON de horarios y puebla la base de datos
 */
export async function processScheduleData(
  scheduleData: ScheduleJSON
): Promise<ProcessResult> {
  const result: ProcessResult = {
    materiasCreadas: 0,
    gruposCreados: 0,
    horariosCreados: 0,
    advertencias: [],
  };

  // Paso 1: Seleccionar el período académico
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
    throw new Error(
      "No hay períodos académicos disponibles (abierto o planificado)"
    );
  }

  // Paso 2: Extraer materias únicas y crear/actualizar en BD
  const materiasMap = new Map<string, { codigo: string; nombre: string }>();

  for (const codigoSalon in scheduleData) {
    for (const dia in scheduleData[codigoSalon]) {
      for (const curso of scheduleData[codigoSalon][dia]) {
        const { codigoMateria } = parseCodigoCurso(curso.codigo);
        if (!materiasMap.has(codigoMateria)) {
          materiasMap.set(codigoMateria, {
            codigo: codigoMateria,
            nombre: curso.nombre,
          });
        }
      }
    }
  }

  // Crear materias que no existen
  for (const [codigoMateria, datos] of materiasMap) {
    const [materia, created] = await Materia.findOrCreate({
      where: { codigo: codigoMateria },
      defaults: {
        codigo: datos.codigo,
        nombre: datos.nombre,
      },
    });

    if (created) {
      result.materiasCreadas++;
    }
  }

  // Paso 3: Crear grupos con FK a materias, profesores y período
  const gruposMap = new Map<string, number>(); // key: "codigoMateria-codigoGrupo" -> id_grupo

  for (const codigoSalon in scheduleData) {
    for (const dia in scheduleData[codigoSalon]) {
      for (const curso of scheduleData[codigoSalon][dia]) {
        const { codigoMateria, codigoGrupo } = parseCodigoCurso(curso.codigo);
        const key = `${codigoMateria}-${codigoGrupo}`;

        if (!gruposMap.has(key)) {
          // Verificar que la materia existe
          const materia = await Materia.findOne({
            where: { codigo: codigoMateria },
          });
          if (!materia) {
            result.advertencias.push(`Materia no encontrada: ${codigoMateria}`);
            continue;
          }

          // Verificar que el profesor existe y obtener su cédula
          const profesor = await Usuario.findOne({
            where: { codigo: curso.codigo_p },
          });
          if (!profesor) {
            result.advertencias.push(
              `Profesor no encontrado: ${curso.codigo_p} para grupo ${curso.codigo}`
            );
            console.log(
              `❌ Profesor NO encontrado: codigo=${curso.codigo_p} para materia ${curso.codigo}`
            );
            continue;
          } else {
            console.log(
              `✅ Profesor encontrado: codigo=${curso.codigo_p}, cedula=${profesor.cedula}, nombre=${profesor.nombre}`
            );
          }

          // Verificar si el grupo ya existe para evitar duplicados
          const grupoExistente = await Grupo.findOne({
            where: {
              id_materia: materia.id_materia,
              id_periodo: periodo.id_periodo,
              codigo_grupo: codigoGrupo,
            },
          });

          if (grupoExistente) {
            gruposMap.set(key, grupoExistente.id_grupo);
            console.log(
              `Grupo existente encontrado: ${key} -> ID: ${grupoExistente.id_grupo}`
            );
          } else {
            const grupo = await Grupo.create({
              id_materia: materia.id_materia,
              id_periodo: periodo.id_periodo,
              codigo_grupo: codigoGrupo,
              id_profesor: profesor.cedula, // Usar cédula en lugar de código
            });
            gruposMap.set(key, grupo.id_grupo);
            result.gruposCreados++;
            console.log(
              `Grupo creado: ${key} -> ID: ${grupo.id_grupo}, Profesor: ${profesor.cedula}`
            );
          }
        }
      }
    }
  }

  console.log(`Total de grupos en el mapa: ${gruposMap.size}`);

  // Paso 4: Crear horarios
  for (const codigoSalon in scheduleData) {
    // Verificar si el salón existe, si no, crearlo
    let salon = await Salon.findOne({ where: { codigo: codigoSalon } });
    if (!salon) {
      salon = await Salon.create({
        codigo: codigoSalon,
        nombre: codigoSalon,
        capacidad: 30,
        estado: "activo",
      });
    }

    for (const dia in scheduleData[codigoSalon]) {
      const diaNormalizado = normalizarDia(dia);

      for (const curso of scheduleData[codigoSalon][dia]) {
        const { codigoMateria, codigoGrupo } = parseCodigoCurso(curso.codigo);
        const key = `${codigoMateria}-${codigoGrupo}`;
        const id_grupo = gruposMap.get(key);

        if (!id_grupo) {
          result.advertencias.push(
            `Grupo no encontrado para crear horario: ${curso.codigo} en ${codigoSalon} - ${dia}`
          );
          continue;
        }

        const { hora_inicio, hora_fin } = parseHorario(curso.hora);

        // Verificar si el horario ya existe para evitar duplicados
        const horarioExistente = await Horario.findOne({
          where: {
            id_grupo,
            id_salon: salon.id_salon,
            dia_semana: diaNormalizado,
            hora_inicio,
            hora_fin,
          },
        });

        if (!horarioExistente) {
          await Horario.create({
            id_grupo,
            id_salon: salon.id_salon,
            dia_semana: diaNormalizado,
            hora_inicio,
            hora_fin,
          });
          result.horariosCreados++;
          console.log(
            `Horario creado: Grupo ${id_grupo}, Salón ${salon.codigo}, ${diaNormalizado} ${hora_inicio}-${hora_fin}`
          );
        } else {
          console.log(
            `Horario duplicado saltado: Grupo ${id_grupo}, Salón ${salon.codigo}, ${diaNormalizado}`
          );
        }
      }
    }
  }

  console.log(
    `Resultado final: ${result.materiasCreadas} materias, ${result.gruposCreados} grupos, ${result.horariosCreados} horarios`
  );
  return result;
}
