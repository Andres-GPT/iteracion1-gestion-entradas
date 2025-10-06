import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/db";
import Usuario from "./Usuario";
import Materia from "./materias.model";
import PeriodoAcademico from "./periodos_academicos"; // Asumiendo que existe
import Horario from "./horarios.model";

// Definir los atributos del modelo
interface GrupoAttributes {
  id_grupo: number;
  id_materia: number;
  id_periodo: number;
  codigo_grupo: string;
  id_profesor: string;
}

type GrupoCreationAttributes = Optional<GrupoAttributes, "id_grupo">;

class Grupo
  extends Model<GrupoAttributes, GrupoCreationAttributes>
  implements GrupoAttributes
{
  public id_grupo!: number;
  public id_materia!: number;
  public id_periodo!: number;
  public codigo_grupo!: string;
  public id_profesor!: string;

  // Métodos de relación (para autocompletado de TypeScript)
  public readonly materia?: Materia;
  public readonly periodo?: PeriodoAcademico;
  public readonly profesor?: Usuario;
  public readonly horarios?: Horario[];
}

Grupo.init(
  {
    id_grupo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_materia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_periodo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo_grupo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    id_profesor: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "grupos",
    timestamps: false,
  }
);

// Relaciones
Grupo.belongsTo(Materia, {
  foreignKey: "id_materia",
  targetKey: "id_materia",
  as: "materia",
});

Grupo.belongsTo(PeriodoAcademico, {
  foreignKey: "id_periodo",
  targetKey: "id_periodo",
  as: "periodo",
});

Grupo.belongsTo(Usuario, {
  foreignKey: "id_profesor",
  targetKey: "cedula",
  as: "profesor",
});

// Relación inversa
Materia.hasMany(Grupo, {
  foreignKey: "id_materia",
  sourceKey: "id_materia",
  as: "grupos",
});

PeriodoAcademico.hasMany(Grupo, {
  foreignKey: "id_periodo",
  sourceKey: "id_periodo",
  as: "grupos",
});

Usuario.hasMany(Grupo, {
  foreignKey: "id_profesor",
  sourceKey: "cedula",
  as: "grupos",
});

export default Grupo;
