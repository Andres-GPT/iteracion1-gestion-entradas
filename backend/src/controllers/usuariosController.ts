import { Request, Response } from "express";

import bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import fs from "fs";

import Usuario from "../models/Usuario";
import Rol from "../models/Rol";
import { CreateUserInput, UpdateUserInput } from "../types/usuarios.types";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await Usuario.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, cedula, correo, telefono, id_rol, codigo }: CreateUserInput = req.body;

    // Validaciones básicas
    if (!nombre || !cedula || !correo || !telefono || !id_rol) {
      res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser enviados",
      });
      return;
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash("1111", saltRounds);

    // Crear usuario en BD
    const newUser = await Usuario.create({
      cedula,
      codigo: codigo || undefined,
      nombre,
      correo,
      telefono,
      password_hash,
      id_rol,
      estado: "activo",
      creado_en: new Date(),
    });

    // Buscar usuario con rol incluido
    const usuarioConRol = await Usuario.findByPk(newUser.cedula, {
      include: [{ model: Rol, as: "rol" }],
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: usuarioConRol,
    });
  } catch (error) {
    console.error("Error en createUsuario:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cedula } = req.params;
    const { nombre, correo, telefono, password, id_rol, codigo }:UpdateUserInput = req.body;

    const user = await Usuario.findByPk(cedula);
    if (!user) {
      res.status(404).json({
        success: false,
        message: `Usuario con cédula ${cedula} no encontrado`,
      });
      return;
    }

    if (nombre !== undefined) user.nombre = nombre;
    if (correo !== undefined) user.correo = correo;
    if (telefono !== undefined) user.telefono = telefono;
    if (id_rol !== undefined) user.id_rol = id_rol;
    if (codigo !== undefined) user.codigo = codigo;

    if (password !== undefined) {
      const saltRounds = 12;
      user.password_hash = await bcrypt.hash(password, saltRounds);
    }

    await user.save();

    const usuarioConRol = await Usuario.findByPk(user.cedula, {
      include: [{ model: Rol, as: "rol" }],
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: usuarioConRol,
    });
  } catch (error) {
    console.error("Error en editUser:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await Usuario.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Toggle estado between "activo" and "inactivo"
    user.estado = user.estado === "activo" ? "inactivo" : "activo";
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// Importar profesores desde Excel
export const importProfesores = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No se ha proporcionado un archivo"
      });
      return;
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const resultados = {
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[]
    };

    // Obtener el ID del rol "Profesor"
    const rolProfesor = await Rol.findOne({ where: { nombre: "Profesor" } });
    if (!rolProfesor) {
      res.status(500).json({
        success: false,
        message: "No se encontró el rol de Profesor en la base de datos"
      });
      return;
    }

    // Procesar cada fila
    for (const row of data as any[]) {
      try {
        const cedula = row["Documento"] ? row["Documento"].toString() : null;
        const codigo = row["Código Docente"] ? row["Código Docente"].toString() : null;
        const nombre = row["Nombre Docente"];
        const correo = row["Correo Institucional"];
        const telefono = row["Celular"] ? row["Celular"].toString() : null;

        // Validar campos requeridos
        if (!cedula || !nombre || !correo) {
          resultados.errores++;
          resultados.detalles.push({
            fila: data.indexOf(row) + 2,
            error: "Faltan campos requeridos (Documento, Nombre, Correo Institucional)"
          });
          continue;
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findByPk(cedula);

        if (usuarioExistente) {
          // Actualizar usuario existente
          await usuarioExistente.update({
            codigo,
            nombre,
            correo,
            telefono,
            id_rol: rolProfesor.id_rol
          });
          resultados.actualizados++;
        } else {
          // Crear nuevo usuario con contraseña por defecto "1111"
          const password_hash = await bcrypt.hash("1111", 12);

          await Usuario.create({
            cedula,
            codigo,
            nombre,
            correo,
            telefono,
            id_rol: rolProfesor.id_rol,
            password_hash,
            estado: "activo"
          });
          resultados.creados++;
        }
      } catch (error: any) {
        resultados.errores++;
        resultados.detalles.push({
          fila: data.indexOf(row) + 2,
          error: error.message
        });
      }
    }

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Importación completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      data: resultados
    });
  } catch (error: any) {
    // Eliminar archivo temporal si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error al importar profesores",
      error: error.message
    });
  }
};

// Importar estudiantes desde Excel
export const importEstudiantes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No se ha proporcionado un archivo"
      });
      return;
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const resultados = {
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[]
    };

    // Obtener el ID del rol "Estudiante"
    const rolEstudiante = await Rol.findOne({ where: { nombre: "Estudiante" } });
    if (!rolEstudiante) {
      res.status(500).json({
        success: false,
        message: "No se encontró el rol de Estudiante en la base de datos"
      });
      return;
    }

    // Procesar cada fila
    for (const row of data as any[]) {
      try {
        const cedula = row["Documento"] ? row["Documento"].toString() : null;
        const codigo = row["Codigo Alumno"] ? row["Codigo Alumno"].toString() : null;
        const nombre = row["Nombre Alumno"];
        const correo = row["Email Institucional"];
        const telefono = row["Celular"] ? row["Celular"].toString() : null;

        // Validar campos requeridos
        if (!cedula || !nombre || !correo) {
          resultados.errores++;
          resultados.detalles.push({
            fila: data.indexOf(row) + 2,
            error: "Faltan campos requeridos (Documento, Nombre Alumno, Email Institucional)"
          });
          continue;
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findByPk(cedula);

        if (usuarioExistente) {
          // Actualizar usuario existente
          await usuarioExistente.update({
            codigo,
            nombre,
            correo,
            telefono,
            id_rol: rolEstudiante.id_rol
          });
          resultados.actualizados++;
        } else {
          // Crear nuevo usuario con contraseña por defecto "1111"
          const password_hash = await bcrypt.hash("1111", 12);

          await Usuario.create({
            cedula,
            codigo,
            nombre,
            correo,
            telefono,
            id_rol: rolEstudiante.id_rol,
            password_hash,
            estado: "activo"
          });
          resultados.creados++;
        }
      } catch (error: any) {
        resultados.errores++;
        resultados.detalles.push({
          fila: data.indexOf(row) + 2,
          error: error.message
        });
      }
    }

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Importación completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      data: resultados
    });
  } catch (error: any) {
    // Eliminar archivo temporal si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error al importar estudiantes",
      error: error.message
    });
  }
};
