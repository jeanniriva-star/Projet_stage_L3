import jwt, {} from "jsonwebtoken";
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET est introuvable dans .env");
    }
    return secret;
}
export function authenticate(req, res, next) {
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
        const decoded = jwt.verify(token, getJwtSecret());
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
    }
    catch {
        return res.status(401).json({
            message: "Token invalide ou expiré",
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map