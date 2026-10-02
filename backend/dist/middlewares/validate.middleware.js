import { z, ZodType } from "zod";
export const validate = (schema) => (req, res, next) => {
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
//# sourceMappingURL=validate.middleware.js.map