import { Router } from "express";
import { getGruposActivos } from "../controllers/gruposController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Obtener grupos activos del período actual
router.get("/activos", authenticateToken, getGruposActivos);

export default router;
