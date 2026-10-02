import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/enums.js";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    next();
  };
}