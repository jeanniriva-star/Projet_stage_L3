import * as evaluationService from "./evaluation.service.js";
// ======================================================
// QCM À PASSER
// ======================================================
export async function getQCMForApprenant(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const evaluationId = req.params.evaluationId;
        if (typeof evaluationId !== "string") {
            return res.status(400).json({
                message: "Identifiant d'évaluation invalide",
            });
        }
        const evaluation = await evaluationService.getQCMForApprenant(evaluationId, req.user.id);
        return res.status(200).json({
            evaluation,
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
// ======================================================
// SOUMISSION D'UN QCM
// ======================================================
export async function soumettreQCM(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const evaluationId = req.params.evaluationId;
        const { reponses } = req.body;
        if (typeof evaluationId !== "string") {
            return res.status(400).json({
                message: "Identifiant d'évaluation invalide",
            });
        }
        if (!Array.isArray(reponses) || reponses.length === 0) {
            return res.status(400).json({
                message: "Les réponses sont obligatoires",
            });
        }
        // Vérifier la structure de chaque réponse
        const reponsesInvalides = reponses.some((reponse) => typeof reponse !== "object" ||
            reponse === null ||
            typeof reponse.questionId !== "string" ||
            typeof reponse.choixId !== "string");
        if (reponsesInvalides) {
            return res.status(400).json({
                message: "Chaque réponse doit contenir un questionId et un choixId valides",
            });
        }
        const resultat = await evaluationService.soumettreQCM(evaluationId, req.user.id, reponses);
        return res.status(201).json({
            message: "QCM soumis avec succès",
            ...resultat,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Vous avez déjà soumis cette évaluation") {
            return res.status(409).json({
                message,
            });
        }
        if (message.includes("inscription") ||
            message.includes("Inscription")) {
            return res.status(403).json({
                message,
            });
        }
        return res.status(400).json({
            message,
        });
    }
}
// ======================================================
// MES RÉSULTATS
// ======================================================
export async function getMesResultats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const resultats = await evaluationService.getMesResultats(req.user.id);
        return res.status(200).json({
            resultats,
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
// ======================================================
// MES ÉVALUATIONS
// ======================================================
export async function getMesEvaluations(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const evaluations = await evaluationService.getMesEvaluations(req.user.id);
        return res.status(200).json({
            evaluations,
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
//# sourceMappingURL=evaluation.apprenant.controller.js.map