import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Role } from "../generated/prisma/enums.js";

interface TokenPayload extends JwtPayload {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET est introuvable dans .env");
  }

  return secret;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token d'authentification manquant",
    });
  }

  const token = authorization.slice(7).trim();

if (!token) {
  return res.status(401).json({
    message: "Token d'authentification manquant",
  });
}

  try {
   const decoded = jwt.verify(
  token,
  getJwtSecret()
) as unknown as TokenPayload;

if (!decoded.id || !decoded.role) {
  return res.status(401).json({
    message: "Contenu du token invalide",
  });
}

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
}