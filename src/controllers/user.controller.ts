import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        googleId: true,
        profiles: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro interno ao listar usuários" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ error: "ID de usuário inválido" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        googleId: true,
        profiles: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
};
