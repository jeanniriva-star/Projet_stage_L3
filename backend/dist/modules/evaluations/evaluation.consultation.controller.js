import * as evaluationService from "./evaluation.service.js";
function lirePagination(req) {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const page = typeof pageRaw === "string"
        ? Number(pageRaw)
        : 1;
    const limit = typeof limitRaw === "string"
        ? Number(limitRaw)
        : 10;
    if (!Number.isInteger(page) || page < 1) {
        return {
            erreur: "Le numéro de page doit être un entier supérieur ou égal à 1",
        };
    }
    if (!Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100) {
        return {
            erreur: "La limite doit être comprise entre 1 et 100",
        };
    }
    return { page, limit };
}
// ======================================================
// RÉSULTATS D'UNE ÉVALUATION
// ======================================================
export async function getResultatsEvaluation(req, res) {
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
        const pagination = lirePagination(req);
        if ("erreur" in pagination) {
            return res.status(400).json({
                message: pagination.erreur,
            });
        }
        const { page, limit } = pagination;
        const searchRaw = req.query.search;
        const noteMinRaw = req.query.noteMin;
        const noteMaxRaw = req.query.noteMax;
        const search = typeof searchRaw === "string"
            ? searchRaw.trim()
            : undefined;
        let noteMin;
        let noteMax;
        if (noteMinRaw !== undefined) {
            if (typeof noteMinRaw !== "string") {
                return res.status(400).json({
                    message: "La note minimale est invalide",
                });
            }
            noteMin = Number(noteMinRaw);
            if (!Number.isFinite(noteMin) ||
                noteMin < 0 ||
                noteMin > 20) {
                return res.status(400).json({
                    message: "La note minimale doit être comprise entre 0 et 20",
                });
            }
        }
        if (noteMaxRaw !== undefined) {
            if (typeof noteMaxRaw !== "string") {
                return res.status(400).json({
                    message: "La note maximale est invalide",
                });
            }
            noteMax = Number(noteMaxRaw);
            if (!Number.isFinite(noteMax) ||
                noteMax < 0 ||
                noteMax > 20) {
                return res.status(400).json({
                    message: "La note maximale doit être comprise entre 0 et 20",
                });
            }
        }
        if (noteMin !== undefined &&
            noteMax !== undefined &&
            noteMin > noteMax) {
            return res.status(400).json({
                message: "La note minimale ne peut pas être supérieure à la note maximale",
            });
        }
        const resultats = await evaluationService.getResultatsEvaluation(evaluationId, req.user.id, req.user.role, {
            page,
            limit,
            ...(search && {
                search,
            }),
            ...(noteMin !== undefined && {
                noteMin,
            }),
            ...(noteMax !== undefined && {
                noteMax,
            }),
        });
        return res.status(200).json(resultats);
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
// ======================================================
// LISTE DES ÉVALUATIONS D'UNE FORMATION
// ======================================================
export async function getEvaluationsByFormation(req, res) {
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
        const pagination = lirePagination(req);
        if ("erreur" in pagination) {
            return res.status(400).json({
                message: pagination.erreur,
            });
        }
        const { page, limit } = pagination;
        const searchRaw = req.query.search;
        const typeRaw = req.query.type;
        const search = typeof searchRaw === "string"
            ? searchRaw.trim()
            : undefined;
        const typesAutorises = [
            "QCM",
            "DEVOIR",
        ];
        let type;
        if (typeRaw !== undefined) {
            if (typeof typeRaw !== "string" ||
                !typesAutorises.includes(typeRaw)) {
                return res.status(400).json({
                    message: "Type d'évaluation invalide",
                });
            }
            type = typeRaw;
        }
        const resultat = await evaluationService.getEvaluationsByFormation({
            formationId,
            userId: req.user.id,
            role: req.user.role,
            page,
            limit,
            ...(search && {
                search,
            }),
            ...(type && {
                type,
            }),
        });
        return res.status(200).json(resultat);
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
// ======================================================
// DÉTAIL D'UNE ÉVALUATION
// ======================================================
export async function getEvaluationDetail(req, res) {
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
        const evaluation = await evaluationService.getEvaluationDetail(evaluationId, req.user.id, req.user.role);
        return res.status(200).json({
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
//# sourceMappingURL=evaluation.consultation.controller.js.map