import { DataTypes, Model, Optional } from "sequelize";
import db from "../db/db";

interface PeriodoAcademicoAttributes {
  id_periodo: number;
  codigo: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: "abierto" | "cerrado" | "planificado";
}

// Al crear, no es necesario pasar id_periodo
type PeriodoAcademicoCreationAttributes = Optional<PeriodoAcademicoAttributes, "id_periodo">;

class PeriodoAcademico extends Model<
  PeriodoAcademicoAttributes,
  PeriodoAcademicoCreationAttributes
> implements PeriodoAcademicoAttributes {
  public id_periodo!: number;
  public codigo!: string;
  public fecha_inicio!: Date;
  public fecha_fin!: Date;
  public estado!: "abierto" | "cerrado" | "planificado";
}

PeriodoAcademico.init(
  {
    id_periodo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("abierto", "cerrado","planificado"),
      allowNull: false,
      defaultValue: "planificado",
    },
  },
  {
    sequelize: db,
    modelName: "PeriodoAcademico",
    tableName: "periodos_academicos",
    timestamps: false,
  }
);

export default PeriodoAcademico;
