import Usuario from "../models/Usuario";
import Rol from "../models/Rol";

export class AuthValidator {
  static async validateRolExists(id_rol: number): Promise<void> {
    const rolExiste = await Rol.findByPk(id_rol);
    if (!rolExiste) {
      throw new Error("El rol especificado no existe");
    }
  }

  static async validateCedulaUnique(cedula: string): Promise<void> {
    const cedulaExiste = await Usuario.findByPk(cedula);
    if (cedulaExiste) {
      throw new Error("La cedula ya está registrada");
    }
  }

  static async validateCorreoUnique(correo: string): Promise<void> {
    const correoExiste = await Usuario.findOne({ where: { correo } });
    if (correoExiste) {
      throw new Error("El correo ya está registrado");
    }
  }

  static async validateCodigoUnique(codigo?: string): Promise<void> {
    if (codigo) {
      const codigoExiste = await Usuario.findOne({ where: { codigo } });
      if (codigoExiste) {
        throw new Error("El código ya está registrado");
      }
    }
  }

  static async validateRegisterData(data: {
    cedula: string;
    correo: string;
    id_rol: number;
    codigo?: string;
  }): Promise<void> {
    await this.validateRolExists(data.id_rol);
    await this.validateCedulaUnique(data.cedula);
    await this.validateCorreoUnique(data.correo);
    await this.validateCodigoUnique(data.codigo);
  }
}
