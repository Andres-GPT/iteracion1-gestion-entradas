import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/db";
import Horario from "./horarios.model";

// Definir los atributos del modelo
interface SalonAttributes {
  id_salon: number;
  codigo: string;
  nombre: string | null;
  capacidad: number | null;
  estado: "activo" | "inactivo";
}

type SalonCreationAttributes = Optional<
  SalonAttributes,
  "id_salon" | "nombre" | "capacidad" | "estado"
>;

class Salon
  extends Model<SalonAttributes, SalonCreationAttributes>
  implements SalonAttributes
{
  public id_salon!: number;
  public codigo!: string;
  public nombre!: string | null;
  public capacidad!: number | null;
  public estado!: "activo" | "inactivo";

  // Métodos de relación (para autocompletado de TypeScript)
  public readonly horarios?: Horario[];
}

Salon.init(
  {
    id_salon: {
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
      allowNull: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo"),
      allowNull: true,
      defaultValue: "activo",
    },
  },
  {
    sequelize,
    tableName: "salones",
    timestamps: false,
  }
);
export default Salon;
