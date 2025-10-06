// src/db/db.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Opción para base de datos local
const sequelize = new Sequelize(
  process.env.DB as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    define: {
      timestamps: false,
    },
  }
);

export default sequelize;