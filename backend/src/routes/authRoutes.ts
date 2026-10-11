import { Router } from "express";
import {
  adminPasswordLogin,
  finishGoogleOAuth,
  getCurrentUser,
  logout,
  startGoogleOAuth,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { adminLoginRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/admin/login", adminLoginRateLimiter, adminPasswordLogin);
router.get("/google", startGoogleOAuth);
router.get("/google/callback", finishGoogleOAuth);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
