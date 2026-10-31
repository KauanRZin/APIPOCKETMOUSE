import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const MIN_SENSITIVITY = 0.1;
const MAX_SENSITIVITY = 3.0;

/**
 * Converte e valida a sensibilidade:
 * Aceita números (1.0, 1.25, 1.5, 3) ou strings ("normal", "1.25", "1,50", "3x")
 * Limite: até 3.0 (3x)
 */
const parseSensitivity = (raw: unknown): number | null => {
  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  if (typeof raw === "string") {
    const cleaned = raw.trim().toLowerCase();
    if (cleaned === "normal") {
      return 1.0;
    }
    const normalized = cleaned.replace(/x$/i, "").replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isNaN(parsed) || parsed < MIN_SENSITIVITY || parsed > MAX_SENSITIVITY) {
      return null;
    }
    return Math.round(parsed * 100) / 100;
  }

  if (typeof raw === "number") {
    if (Number.isNaN(raw) || raw < MIN_SENSITIVITY || raw > MAX_SENSITIVITY) {
      return null;
    }
    return Math.round(raw * 100) / 100;
  }

  return null;
};

export const listProfiles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const profiles = await prisma.mouseProfile.findMany({
      where: { userId: req.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(profiles);
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    res.status(500).json({ error: "Erro ao listar perfis de sensibilidade" });
  }
};

export const createProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const name = req.body.name || req.body.nome;
    const rawSensitivity =
      req.body.sensitivity !== undefined
        ? req.body.sensitivity
        : req.body.sensibilidade;

    if (!name) {
      res.status(400).json({
        error: "O nome do perfil (ex: 'Casa') é obrigatório",
      });
      return;
    }

    const sensitivity =
      rawSensitivity === undefined ? 1.0 : parseSensitivity(rawSensitivity);

    if (sensitivity === null) {
      res.status(400).json({
        error:
          "Sensibilidade inválida. Envie um valor entre 0.1 e 3.0 (ex: 1.0 para normal, 1.25, 1.50, até 3.0 / '3x')",
      });
      return;
    }

    const profile = await prisma.mouseProfile.create({
      data: {
        userId: req.userId!,
        name: String(name),
        sensitivity,
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("Erro ao criar perfil:", error);
    res.status(500).json({ error: "Erro ao criar perfil de sensibilidade" });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const name = req.body.name || req.body.nome;
    const rawSensitivity =
      req.body.sensitivity !== undefined
        ? req.body.sensitivity
        : req.body.sensibilidade;

    const existing = await prisma.mouseProfile.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    let sensitivity: number | undefined;
    if (rawSensitivity !== undefined) {
      const parsed = parseSensitivity(rawSensitivity);
      if (parsed === null) {
        res.status(400).json({
          error:
            "Sensibilidade inválida. Envie um valor entre 0.1 e 3.0 (ex: 1.0 para normal, 1.25, 1.50, até 3.0 / '3x')",
        });
        return;
      }
      sensitivity = parsed;
    }

    const updated = await prisma.mouseProfile.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name) } : {}),
        ...(sensitivity !== undefined ? { sensitivity } : {}),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil de sensibilidade" });
  }
};

export const deleteProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.mouseProfile.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    await prisma.mouseProfile.delete({ where: { id } });

    res.json({ message: "Perfil removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar perfil:", error);
    res.status(500).json({ error: "Erro ao remover perfil de sensibilidade" });
  }
};
