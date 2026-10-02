import * as presenceService from "./presence.service.js";
export async function marquerPresence(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const sessionId = req.params.id;
        if (typeof sessionId !== "string") {
            return res.status(400).json({
                message: "Identifiant de session invalide",
            });
        }
        const presence = await presenceService.marquerPresence(req.user.id, sessionId);
        return res.status(200).json({
            message: "Présence enregistrée avec succès",
            presence,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(403).json({
            message,
        });
    }
}
export async function getPresencesBySession(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const sessionId = req.params.id;
        if (typeof sessionId !== "string") {
            return res.status(400).json({
                message: "Identifiant de session invalide",
            });
        }
        const pageRaw = req.query.page;
        const limitRaw = req.query.limit;
        const searchRaw = req.query.search;
        const page = typeof pageRaw === "string"
            ? Number(pageRaw)
            : 1;
        const limit = typeof limitRaw === "string"
            ? Number(limitRaw)
            : 10;
        if (!Number.isInteger(page) ||
            page < 1) {
            return res.status(400).json({
                message: "Le numéro de page doit être un entier supérieur ou égal à 1",
            });
        }
        if (!Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100) {
            return res.status(400).json({
                message: "La limite doit être comprise entre 1 et 100",
            });
        }
        const search = typeof searchRaw === "string"
            ? searchRaw.trim()
            : undefined;
        const resultat = await presenceService.getPresencesBySessionPaginees({
            sessionId,
            userId: req.user.id,
            role: req.user.role,
            page,
            limit,
            ...(search && {
                search,
            }),
        });
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Session introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("pas autorisé") ||
            message.includes("affecté")) {
            return res.status(403).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function getMesPresences(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const presences = await presenceService.getMesPresences(req.user.id);
        return res.status(200).json({
            presences,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
export async function getStatistiquesPresenceFormation(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const formationId = req.params.formationId;
        if (typeof formationId !== "string") {
            return res.status(400).json({
                message: "Identifiant de formation invalide",
            });
        }
        const statistiques = await presenceService.getStatistiquesPresenceFormation(formationId, req.user.id, req.user.role);
        return res.status(200).json(statistiques);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Formation introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("pas autorisé") ||
            message.includes("affecté")) {
            return res.status(403).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
//# sourceMappingURL=presence.controller.js.map