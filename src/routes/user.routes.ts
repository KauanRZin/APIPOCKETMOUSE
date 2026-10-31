import { Router } from "express";
import { listUsers, getUserById } from "../controllers/user.controller";

const router = Router();

// Rotas públicas (sem JWT) para listar todos os usuários e buscar por ID
router.get("/", listUsers);
router.get("/:id", getUserById);

export default router;
