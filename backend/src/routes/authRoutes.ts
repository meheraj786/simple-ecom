import { Router } from "express";
import {
  finishGoogleOAuth,
  getCurrentUser,
  logout,
  startGoogleOAuth,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/google", startGoogleOAuth);
router.get("/google/callback", finishGoogleOAuth);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
