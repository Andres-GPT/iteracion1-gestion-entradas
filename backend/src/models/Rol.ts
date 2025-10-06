import { DataTypes, Model } from "sequelize";
import db from "../db/db";

interface RolAttributes {
    id_rol?: number;
    nombre: 'Director Programa' | 'Director Departamento' | 'Profesor' | 'Amigo Académico' | 'Estudiante' | 'Visitante' | 'Vigilante';
}

class Rol extends Model<RolAttributes> implements RolAttributes {
    public id_rol!: number;
    public nombre!: 'Director Programa' | 'Director Departamento' | 'Profesor' | 'Amigo Académico' | 'Estudiante' | 'Visitante' | 'Vigilante';
}

Rol.init(
    {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.ENUM(
                'Director Programa',
                'Director Departamento',
                'Profesor',
                'Amigo Académico',
                'Estudiante',
                'Visitante',
                'Vigilante'
            ),
            allowNull: false
        },
    },
    {
        sequelize: db,
        modelName: 'Rol',
        tableName: 'roles',
        timestamps: false,
    }
);

export default Rol;