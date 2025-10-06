// index.ts
import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import db from "./db/db";

import authRoutes from "./routes/authRoutes";
import usuariosRoutes from "./routes/usuariosRoutes";
import periodosRoutes from "./routes/periodosRoutes";
import salonesRoutes from "./routes/salonesRoutes";
import horariosRoutes from "./routes/horariosRoutes";
import gruposRoutes from "./routes/gruposRoutes";

import "./models/Usuario";
import "./models/Rol";

const app: Application = express();

// Middleware CORS
app.use(
  cors({
    origin: "*",
  })
);

// Otros middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
db.authenticate()
  .then(() => console.log("Database connection successful"))
  .catch((error) => console.log("Connection error:", error));

// Sincronización de modelos
// db.sync()
//   .then(() => console.log("Database synchronized"))
//   .catch((error) => console.log("Error synchronizing database:", error));

// Rutas
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/periodos", periodosRoutes);
app.use("/salones", salonesRoutes);
app.use("/horarios", horariosRoutes);
app.use("/grupos", gruposRoutes);

// Puerto
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4444;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
