import { Router } from "express";
import {
  getAllHorarios,
  importScheduleFromPDF,
  verificarDisponibilidadSalon,
  verificarDisponibilidadProfesor,
  crearHorarioManual,
  actualizarHorario,
  eliminarHorario,
} from "../controllers/horariosController";
import { uploadPDF } from "../config/multer";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Obtener todos los horarios
router.get("/", authenticateToken, getAllHorarios);

// Verificar disponibilidad de salón
router.get("/disponibilidad-salon/:id_salon", authenticateToken, verificarDisponibilidadSalon);

// Verificar disponibilidad de profesor
router.get("/disponibilidad-profesor/:cedula", authenticateToken, verificarDisponibilidadProfesor);

// Crear horario manualmente
router.post("/", authenticateToken, crearHorarioManual);

// Actualizar horario
router.put("/:id", authenticateToken, actualizarHorario);

// Eliminar horario
router.delete("/:id", authenticateToken, eliminarHorario);

// Importar horarios desde PDF
router.post("/import", authenticateToken, uploadPDF.single("file"), importScheduleFromPDF);

export default router;
