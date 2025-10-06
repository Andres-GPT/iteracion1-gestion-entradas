import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/db";
import Grupo from "./grupos.model";
import Salon from "./salones.model";

// Definir los atributos del modelo
interface HorarioAttributes {
  id_horario: number;
  id_grupo: number;
  id_salon: number;
  dia_semana:
    | "Lunes"
    | "Martes"
    | "Miércoles"
    | "Jueves"
    | "Viernes"
    | "Sábado";
  hora_inicio: string;
  hora_fin: string;
}

type HorarioCreationAttributes = Optional<HorarioAttributes, "id_horario">;

class Horario
  extends Model<HorarioAttributes, HorarioCreationAttributes>
  implements HorarioAttributes
{
  public id_horario!: number;
  public id_grupo!: number;
  public id_salon!: number;
  public dia_semana!:
    | "Lunes"
    | "Martes"
    | "Miércoles"
    | "Jueves"
    | "Viernes"
    | "Sábado";
  public hora_inicio!: string;
  public hora_fin!: string;

  // Métodos de relación (para autocompletado de TypeScript)
  public readonly grupo?: Grupo;
  public readonly salon?: Salon;
}

Horario.init(
  {
    id_horario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_grupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_salon: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dia_semana: {
      type: DataTypes.ENUM(
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
      ),
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "horarios",
    timestamps: false,
  }
);

// Relaciones
Horario.belongsTo(Grupo, {
  foreignKey: "id_grupo",
  targetKey: "id_grupo",
  as: "grupo",
});

Horario.belongsTo(Salon, {
  foreignKey: "id_salon",
  targetKey: "id_salon",
  as: "salon",
});

// Relación inversa
Grupo.hasMany(Horario, {
  foreignKey: "id_grupo",
  sourceKey: "id_grupo",
  as: "horarios",
});

Salon.hasMany(Horario, {
  foreignKey: "id_salon",
  sourceKey: "id_salon",
  as: "horarios",
});

export default Horario;
