import * as authService from "./auth.service.js";
export async function register(req, res) {
    try {
        const user = await authService.register(req.body);
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(400).json({
            message,
        });
    }
}
export async function login(req, res) {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json({
            message: "Connexion réussie",
            ...result,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(401).json({
            message,
        });
    }
}
export async function me(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const user = await authService.getCurrentUser(req.user.id);
        return res.status(200).json({
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(404).json({
            message,
        });
    }
}
//# sourceMappingURL=auth.controller.js.map