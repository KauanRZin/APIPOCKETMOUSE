import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const generateToken = (userId: number, email: string): string => {
  const secret = process.env.JWT_SECRET || "default_secret";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ userId, email }, secret, { expiresIn });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = req.body.name || req.body.nome;
    const email = req.body.email;
    const password = req.body.password || req.body.senha;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Este email já está cadastrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      include: {
        profiles: {
          orderBy: { id: "asc" },
        },
      },
    });

    const token = generateToken(user.id, user.email);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profiles: user.profiles,
      },
      profiles: user.profiles,
      token,
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno ao registrar usuário" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email;
    const password = req.body.password || req.body.senha;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profiles: {
          orderBy: { id: "asc" },
        },
      },
    });
    if (!user || !user.password) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profiles: user.profiles,
      },
      profiles: user.profiles,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno ao realizar login" });
  }
};

/**
 * Login com Google (Não prioridade - estrutura pronta)
 * Aceita um `idToken` do Google (validado via endpoint do Google)
 * ou dados diretos `{ googleId, email, name }` para facilitar testes.
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    let { googleId, email, name, idToken } = req.body;

    if (idToken) {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (!response.ok) {
        res.status(401).json({ error: "Token do Google inválido" });
        return;
      }
      const payload = (await response.json()) as {
        sub: string;
        email: string;
        name?: string;
      };
      googleId = payload.sub;
      email = payload.email;
      name = payload.name || email.split("@")[0];
    }

    if (!email || !googleId) {
      res.status(400).json({
        error: "Envie um idToken do Google ou { googleId, email, name }",
      });
      return;
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: {
        profiles: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          googleId,
        },
        include: {
          profiles: {
            orderBy: { id: "asc" },
          },
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: {
          profiles: {
            orderBy: { id: "asc" },
          },
        },
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profiles: user.profiles,
      },
      profiles: user.profiles,
      token,
    });
  } catch (error) {
    console.error("Erro no login Google:", error);
    res.status(500).json({ error: "Erro interno no login com Google" });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        profiles: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno ao buscar dados do usuário" });
  }
};
