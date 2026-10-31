import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

interface TokenPayload {
  userId: number;
  email: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido ou formato inválido" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "default_secret";

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
