import { Router } from "express";
import {
  getSalones,
  getSalon,
  createSalon,
  updateSalon,
  toggleSalonEstado,
} from "../controllers/salonesController";

const router = Router();

router.get("/", getSalones);
router.get("/:id", getSalon);
router.post("/", createSalon);
router.put("/:id", updateSalon);
router.patch("/:id/toggle", toggleSalonEstado);

export default router;
