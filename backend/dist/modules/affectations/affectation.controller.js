import * as affectationService from "./affectation.service.js";
export async function createAffectation(req, res) {
    try {
        const { formationId, formateurId } = req.body;
        if (!formationId || !formateurId) {
            return res.status(400).json({
                message: "formationId et formateurId sont obligatoires",
            });
        }
        const affectation = await affectationService.createAffectation({
            formationId,
            formateurId,
        });
        return res.status(201).json({
            message: "Formateur affecté avec succès",
            affectation,
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
export async function getAffectationsByFormation(req, res) {
    try {
        const formationId = req.params.formationId;
        if (typeof formationId !== "string") {
            return res.status(400).json({
                message: "Identifiant de formation invalide",
            });
        }
        const affectations = await affectationService.getAffectationsByFormation(formationId);
        return res.status(200).json({
            affectations,
        });
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
        return res.status(500).json({
            message,
        });
    }
}
export async function getMesFormationsFormateur(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const affectations = await affectationService.getAffectationsByFormateur(req.user.id);
        return res.status(200).json({
            affectations,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message === "Cet utilisateur n'est pas un formateur") {
            return res.status(400).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function deleteAffectation(req, res) {
    try {
        const affectationId = req.params.id;
        if (typeof affectationId !== "string") {
            return res.status(400).json({
                message: "Identifiant d'affectation invalide",
            });
        }
        const resultat = await affectationService.deleteAffectation(affectationId);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Affectation introuvable") {
            return res.status(404).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function getAffectations(req, res) {
    try {
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
        const resultat = await affectationService.getAffectationsPaginees({
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
        return res.status(500).json({
            message,
        });
    }
}
//# sourceMappingURL=affectation.controller.js.map