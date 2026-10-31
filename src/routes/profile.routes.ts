import { Router } from "express";
import {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas de perfis exigem autenticação JWT
router.use(authMiddleware);

router.get("/", listProfiles);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);

export default router;
