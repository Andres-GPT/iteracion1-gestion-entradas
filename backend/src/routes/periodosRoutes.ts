import { Router } from "express";
import { getPeriodos, getPeriodo, createPeriodo, updatePeriodo, deletePeriodo, abrirPeriodo } from "../controllers/periodosController";

const router = Router();

router.get("/", getPeriodos);
router.get("/:id", getPeriodo);
router.post("/", createPeriodo);
router.put("/:id", updatePeriodo);
router.patch("/:id", abrirPeriodo);
router.delete("/:id", deletePeriodo);

export default router;