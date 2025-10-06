import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario";
import Rol from "../models/Rol";
import { generateToken, verifyToken } from "../utils/jwt";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from "../types/auth.types";
import { AuthValidator } from "../validators/auth.validator";
import { sendEmail } from "../utils/sendEmail";
import { forgotPasswordTemplate } from "../utils/emailTemplates";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      cedula,
      correo,
      telefono,
      password,
      id_rol,
      codigo,
    }: RegisterRequest = req.body;

    if (!nombre || !cedula || !correo || !telefono || !password || !id_rol) {
      res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      } as AuthResponse);
      return;
    }

    await AuthValidator.validateRegisterData({
      cedula,
      correo,
      id_rol,
      codigo,
    });

    //Encriptar contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    //Crear usuario
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

    const usuarioConRol = await Usuario.findByPk(newUser.cedula, {
      include: [
        {
          model: Rol,
          as: "rol",
        },
      ],
    });

    const token = generateToken({
      cedula: newUser.cedula,
      codigo: newUser.codigo,
      correo: newUser.correo,
      id_rol: newUser.id_rol,
      nombre: newUser.nombre,
    });

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        token,
        user: {
          cedula: usuarioConRol!.cedula,
          codigo: usuarioConRol!.codigo,
          nombre: usuarioConRol!.nombre,
          correo: usuarioConRol!.correo,
          telefono: usuarioConRol!.telefono,
          rol: (usuarioConRol as any).rol.nombre,
        },
      },
    } as AuthResponse);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      } as AuthResponse);
      return;
    }

    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    } as AuthResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, password }: LoginRequest = req.body;

    if (!correo || !password) {
      res.status(400).json({
        success: false,
        message: "El correo y la contraseña con requeridos",
      } as AuthResponse);
      return;
    }

    const usuario = await Usuario.findOne({
      where: { correo },
      include: [
        {
          model: Rol,
          as: "rol",
        },
      ],
    });

    if (!usuario) {
      res.status(401).json({
        success: false,
        message: "El correo no se encuentra registrado en el sistema",
      } as AuthResponse);
      return;
    }

    if (usuario.estado !== "activo") {
      res.status(403).json({
        success: false,
        message:
          "Su usuario se encuentra en estado inactivo, escriba un correo a baudilioandresabso@ufps.edu.co para mayor información",
      } as AuthResponse);
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      } as AuthResponse);
      return;
    }

    const token = generateToken({
      cedula: usuario.cedula,
      codigo: usuario.codigo,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
    });

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: {
        token,
        user: {
          cedula: usuario.cedula,
          codigo: usuario.codigo,
          nombre: usuario.nombre,
          correo: usuario.correo,
          telefono: usuario.telefono,
          rol: (usuario as any).rol.nombre,
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Error al loguearse: ", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    } as AuthResponse);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
    });
  }
};

/**
 * Solicitud de recuperación de contraseña
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo } = req.body;

    if (!correo) {
      res.status(400).json({
        success: false,
        message: "El correo es requerido",
      });
      return;
    }

    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: "No existe un usuario registrado con ese correo",
      });
      return;
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = jwt.sign(
      { cedula: usuario.cedula, type: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Guardar token en la base de datos
    await usuario.update({ token_recuperacion: resetToken });

    // Crear link de recuperación (usando hash routing)
    const resetLink = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;

    // Enviar correo
    await sendEmail({
      to: correo,
      subject: "Restablecimiento de contraseña",
      html: forgotPasswordTemplate(usuario.nombre, resetLink),
    });

    res.status(200).json({
      success: true,
      message: "Por favor, revisa tu correo electrónico",
    });
  } catch (error: any) {
    console.error("Error en forgot password:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al procesar la solicitud",
    });
  }
};

/**
 * Verificar si el token de recuperación es válido
 */
export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token no proporcionado",
      });
      return;
    }

    // Verificar que el token sea válido JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
        valid: false,
      });
      return;
    }

    // Verificar que el usuario existe y tiene este token guardado
    const usuario = await Usuario.findOne({
      where: {
        cedula: decoded.cedula,
        token_recuperacion: token,
      },
    });

    if (!usuario) {
      res.status(400).json({
        success: false,
        message: "Token inválido o ya fue utilizado",
        valid: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: true,
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (error: any) {
    console.error("Error al verificar token:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar el token",
      valid: false,
    });
  }
};

/**
 * Restablecer contraseña con token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, nueva_password } = req.body;

    if (!token || !nueva_password) {
      res.status(400).json({
        success: false,
        message: "Token y nueva contraseña son requeridos",
      });
      return;
    }

    // Validar longitud de contraseña
    if (nueva_password.length < 6) {
      res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    // Verificar token JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
      return;
    }

    // Buscar usuario con el token
    const usuario = await Usuario.findOne({
      where: {
        cedula: decoded.cedula,
        token_recuperacion: token,
      },
    });

    if (!usuario) {
      res.status(400).json({
        success: false,
        message: "Token inválido o ya fue utilizado",
      });
      return;
    }

    // Hashear nueva contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(nueva_password, saltRounds);

    // Actualizar contraseña y limpiar token
    await usuario.update({
      password_hash,
      token_recuperacion: undefined,
    });

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al restablecer la contraseña",
    });
  }
};
