import { Router } from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);

// Rutas de recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;
