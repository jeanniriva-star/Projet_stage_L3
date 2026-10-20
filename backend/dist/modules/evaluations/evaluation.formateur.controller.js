import * as evaluationService from "./evaluation.service.js";
// ======================================================
// ÉVALUATIONS
// ======================================================
export async function createEvaluationQCM(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const coursId = req.params.coursId;
        const { titre, description } = req.body;
        if (typeof coursId !== "string") {
            return res.status(400).json({
                message: "Identifiant du cours invalide",
            });
        }
        if (!titre || typeof titre !== "string") {
            return res.status(400).json({
                message: "Le titre est obligatoire",
            });
        }
        const evaluation = await evaluationService.createEvaluationQCM({
            titre,
            description,
            coursId,
        }, req.user.id, req.user.role);
        return res.status(201).json({
            message: "Évaluation QCM créée avec succès",
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
export async function updateEvaluation(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const evaluationId = req.params.evaluationId;
        const { titre, description } = req.body;
        if (typeof evaluationId !== "string") {
            return res.status(400).json({
                message: "Identifiant d'évaluation invalide",
            });
        }
        if (titre === undefined &&
            description === undefined) {
            return res.status(400).json({
                message: "Aucune modification n'a été fournie",
            });
        }
        if (titre !== undefined &&
            (typeof titre !== "string" ||
                titre.trim() === "")) {
            return res.status(400).json({
                message: "Le titre est invalide",
            });
        }
        if (description !== undefined &&
            description !== null &&
            typeof description !== "string") {
            return res.status(400).json({
                message: "La description est invalide",
            });
        }
        const evaluation = await evaluationService.updateEvaluation(evaluationId, {
            ...(titre !== undefined && {
                titre: titre.trim(),
            }),
            ...(description !== undefined && {
                description,
            }),
        }, req.user.id, req.user.role);
        return res.status(200).json({
            message: "Évaluation modifiée avec succès",
            evaluation,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Évaluation introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("Seul un formateur") ||
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
export async function deleteEvaluation(req, res) {
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
        const resultat = await evaluationService.deleteEvaluation(evaluationId, req.user.id, req.user.role);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Évaluation introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("Seul un formateur") ||
            message.includes("affecté")) {
            return res.status(403).json({
                message,
            });
        }
        if (message.startsWith("Impossible de supprimer cette évaluation")) {
            return res.status(409).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
// ======================================================
// QUESTIONS
// ======================================================
export async function addQuestion(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const evaluationId = req.params.evaluationId;
        const { contenu, choix } = req.body;
        if (typeof evaluationId !== "string") {
            return res.status(400).json({
                message: "Identifiant d'évaluation invalide",
            });
        }
        if (!contenu || typeof contenu !== "string") {
            return res.status(400).json({
                message: "Le contenu de la question est obligatoire",
            });
        }
        if (!Array.isArray(choix)) {
            return res.status(400).json({
                message: "Les choix doivent être fournis sous forme de tableau",
            });
        }
        const question = await evaluationService.addQuestion({
            evaluationId,
            contenu,
            choix,
        }, req.user.id, req.user.role);
        return res.status(201).json({
            message: "Question ajoutée avec succès",
            question,
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
export async function updateQuestion(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const questionId = req.params.questionId;
        const { contenu, choix } = req.body;
        if (typeof questionId !== "string") {
            return res.status(400).json({
                message: "Identifiant de question invalide",
            });
        }
        if (contenu === undefined &&
            choix === undefined) {
            return res.status(400).json({
                message: "Aucune modification n'a été fournie",
            });
        }
        if (contenu !== undefined &&
            (typeof contenu !== "string" ||
                contenu.trim() === "")) {
            return res.status(400).json({
                message: "Le contenu de la question est invalide",
            });
        }
        if (choix !== undefined) {
            if (!Array.isArray(choix)) {
                return res.status(400).json({
                    message: "Les choix doivent être fournis sous forme de tableau",
                });
            }
            const choixInvalides = choix.some((item) => {
                if (typeof item !== "object" ||
                    item === null) {
                    return true;
                }
                const choixItem = item;
                return (typeof choixItem.texte !== "string" ||
                    choixItem.texte.trim() === "" ||
                    typeof choixItem.correct !== "boolean");
            });
            if (choixInvalides) {
                return res.status(400).json({
                    message: "Chaque choix doit contenir un texte valide et un champ correct booléen",
                });
            }
        }
        const question = await evaluationService.updateQuestion(questionId, {
            ...(contenu !== undefined && {
                contenu: contenu.trim(),
            }),
            ...(choix !== undefined && {
                choix: choix.map((item) => ({
                    texte: item.texte.trim(),
                    correct: item.correct,
                })),
            }),
        }, req.user.id, req.user.role);
        return res.status(200).json({
            message: "Question modifiée avec succès",
            question,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Question introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("Seul un formateur") ||
            message.includes("affecté")) {
            return res.status(403).json({
                message,
            });
        }
        if (message.includes("au moins deux choix") ||
            message.includes("au moins une bonne réponse")) {
            return res.status(400).json({
                message,
            });
        }
        if (message.startsWith("Impossible de modifier cette question")) {
            return res.status(409).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function deleteQuestion(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const questionId = req.params.questionId;
        if (typeof questionId !== "string") {
            return res.status(400).json({
                message: "Identifiant de question invalide",
            });
        }
        const resultat = await evaluationService.deleteQuestion(questionId, req.user.id, req.user.role);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Question introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message.includes("Seul un formateur") ||
            message.includes("affecté")) {
            return res.status(403).json({
                message,
            });
        }
        if (message.startsWith("Impossible de supprimer cette question")) {
            return res.status(409).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
//# sourceMappingURL=evaluation.formateur.controller.js.map