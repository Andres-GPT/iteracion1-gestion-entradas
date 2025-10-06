import { DataTypes, Model } from "sequelize";
import db from "../db/db";
import Rol from "./Rol";

interface UsuarioAttributes {
  cedula: string;
  codigo?: string;
  id_rol: number;
  nombre: string;
  correo: string;
  telefono: string;
  password_hash: string;
  token_recuperacion?: string;
  estado?: "activo" | "inactivo";
  creado_en?: Date;
}

class Usuario extends Model<UsuarioAttributes> implements UsuarioAttributes {
  public cedula!: string;
  public codigo?: string;
  public id_rol!: number;
  public nombre!: string;
  public correo!: string;
  public telefono!: string;
  public password_hash!: string;
  public token_recuperacion?: string;
  public estado!: "activo" | "inactivo";
  public creado_en!: Date;
}

Usuario.init(
  {
    cedula: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id_rol",
      },
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
    },
    token_recuperacion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo"),
      defaultValue: "activo",
    },
    creado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: false,
  }
);

Usuario.belongsTo(Rol, { foreignKey: "id_rol", as: "rol" });
Rol.hasMany(Usuario, { foreignKey: "id_rol", as: "usuarios" });

export default Usuario;
