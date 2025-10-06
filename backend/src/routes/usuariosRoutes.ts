import { Router } from "express";
import { getUsers, getUser, createUser, updateUser, deleteUser, importProfesores, importEstudiantes } from "../controllers/usuariosController";
import { upload } from "../config/multer";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:cedula", updateUser);
router.delete("/:id", deleteUser);

// Rutas de importación
router.post("/import/profesores", upload.single("file"), importProfesores);
router.post("/import/estudiantes", upload.single("file"), importEstudiantes);

export default router;