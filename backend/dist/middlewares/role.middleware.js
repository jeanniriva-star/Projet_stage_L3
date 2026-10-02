export function authorize(...allowedRoles) {
    return (req, res, next) => {
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
//# sourceMappingURL=role.middleware.js.map