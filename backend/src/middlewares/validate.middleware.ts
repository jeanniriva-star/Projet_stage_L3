import type { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: z.flattenError(result.error).fieldErrors,
      });
    }

    req.body = result.data; // données nettoyées (espaces retirés, etc.)
    next();
  };