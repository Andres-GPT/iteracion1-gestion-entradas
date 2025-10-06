import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/db";
import Grupo from "./grupos.model";

// Definir los atributos del modelo
interface MateriaAttributes {
  id_materia: number;
  codigo: string;
  nombre: string;
}

type MateriaCreationAttributes = Optional<MateriaAttributes, "id_materia">;

class Materia
  extends Model<MateriaAttributes, MateriaCreationAttributes>
  implements MateriaAttributes
{
  public id_materia!: number;
  public codigo!: string;
  public nombre!: string;

  // Métodos de relación (para autocompletado de TypeScript)
  public readonly grupos?: Grupo[];
}

Materia.init(
  {
    id_materia: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "materias",
    timestamps: false,
  }
);

export default Materia;
