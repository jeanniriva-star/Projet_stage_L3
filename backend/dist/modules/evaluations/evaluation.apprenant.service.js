import prisma from "../../config/prisma.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
// ======================================================
// QCM À PASSER
// ======================================================
export async function getQCMForApprenant(evaluationId, apprenantId) {
    const evaluation = await prisma.evaluation.findUnique({
        where: {
            id: evaluationId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            type: true,
            cours: {
                select: {
                    id: true,
                    titre: true,
                    formationId: true,
                },
            },
            questions: {
                select: {
                    id: true,
                    contenu: true,
                    choix: {
                        select: {
                            id: true,
                            texte: true,
                        },
                    },
                },
            },
        },
    });
    if (!evaluation) {
        throw new Error("Évaluation introuvable");
    }
    if (evaluation.type !== "QCM") {
        throw new Error("Cette évaluation n'est pas un QCM");
    }
    await verifierInscriptionValidee(apprenantId, evaluation.cours.formationId);
    return evaluation;
}
export async function soumettreQCM(evaluationId, apprenantId, reponses) {
    // 1. Récupérer l'évaluation avec ses questions et ses choix
    const evaluation = await prisma.evaluation.findUnique({
        where: {
            id: evaluationId,
        },
        include: {
            cours: {
                include: {
                    formation: {
                        select: {
                            statut: true,
                        },
                    },
                },
            },
            questions: {
                include: {
                    choix: true,
                },
            },
        },
    });
    if (!evaluation) {
        throw new Error("Évaluation introuvable");
    }
    if (evaluation.type !== "QCM") {
        throw new Error("Cette évaluation n'est pas un QCM");
    }
    if (evaluation.cours.formation.statut === "TERMINEE") {
        throw new Error("Cette formation est terminée : les évaluations sont fermées");
    }
    if (evaluation.questions.length === 0) {
        throw new Error("Cette évaluation ne contient aucune question");
    }
    // 2. Vérifier que l'apprenant est bien inscrit
    // et que son inscription est VALIDEE
    await verifierInscriptionValidee(apprenantId, evaluation.cours.formationId);
    // 3. Récupérer l'inscription
    const inscription = await prisma.inscription.findUnique({
        where: {
            apprenantId_formationId: {
                apprenantId,
                formationId: evaluation.cours.formationId,
            },
        },
    });
    if (!inscription) {
        throw new Error("Inscription introuvable");
    }
    // 4. Empêcher une deuxième soumission
    const soumissionExistante = await prisma.soumissionEvaluation.findUnique({
        where: {
            inscriptionId_evaluationId: {
                inscriptionId: inscription.id,
                evaluationId,
            },
        },
    });
    if (soumissionExistante) {
        throw new Error("Vous avez déjà soumis cette évaluation");
    }
    // 5. Toutes les questions doivent recevoir une réponse
    if (reponses.length !== evaluation.questions.length) {
        throw new Error("Vous devez répondre à toutes les questions");
    }
    // 6. Refuser les questions envoyées plusieurs fois
    const questionIds = reponses.map((reponse) => reponse.questionId);
    if (new Set(questionIds).size !== questionIds.length) {
        throw new Error("Une question ne peut apparaître qu'une seule fois");
    }
    let pointsTotal = 0;
    let questionsReussies = 0;
    // Une ligne par choix coché
    const reponsesAEnregistrer = [];
    // 7. Vérifier et corriger chaque question
    for (const reponse of reponses) {
        const question = evaluation.questions.find((question) => question.id === reponse.questionId);
        if (!question) {
            throw new Error("Une des questions n'appartient pas à cette évaluation");
        }
        if (reponse.choixIds.length === 0) {
            throw new Error("Chaque question doit avoir au moins un choix sélectionné");
        }
        const choixCoches = new Set(reponse.choixIds);
        if (choixCoches.size !== reponse.choixIds.length) {
            throw new Error("Un choix ne peut être sélectionné qu'une seule fois");
        }
        const choixDeLaQuestion = new Set(question.choix.map((choix) => choix.id));
        for (const choixId of choixCoches) {
            if (!choixDeLaQuestion.has(choixId)) {
                throw new Error("Un des choix n'appartient pas à la question indiquée");
            }
        }
        // Barème proportionnel : chaque bonne réponse cochée rapporte
        // 1 / (nombre de bonnes réponses) de point, chaque mauvaise
        // réponse cochée en retire autant (sans descendre sous 0).
        const bonsChoixIds = question.choix
            .filter((choix) => choix.correct)
            .map((choix) => choix.id);
        const bonsCoches = bonsChoixIds.filter((id) => choixCoches.has(id)).length;
        const mauvaisCoches = choixCoches.size - bonsCoches;
        const pointsQuestion = bonsChoixIds.length === 0
            ? 0
            : Math.max(0, (bonsCoches - mauvaisCoches) / bonsChoixIds.length);
        pointsTotal += pointsQuestion;
        // Question entièrement juste : toutes les bonnes, aucune mauvaise
        if (bonsCoches === bonsChoixIds.length &&
            mauvaisCoches === 0) {
            questionsReussies++;
        }
        for (const choixId of choixCoches) {
            reponsesAEnregistrer.push({
                questionId: question.id,
                choixId,
            });
        }
    }
    const noteBrute = (pointsTotal / evaluation.questions.length) * 20;
    // Exemple : 13.333333 devient 13.33
    const note = Math.round(noteBrute * 100) / 100;
    // 9. Enregistrer la soumission ET toutes les réponses
    const soumission = await prisma.soumissionEvaluation.create({
        data: {
            inscriptionId: inscription.id,
            evaluationId,
            note,
            reponses: {
                create: reponsesAEnregistrer,
            },
        },
        select: {
            id: true,
            evaluationId: true,
            note: true,
            dateSoumission: true,
            evaluation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
            inscription: {
                select: {
                    apprenant: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            },
        },
    });
    return {
        soumission,
        resultat: {
            nombreQuestions: evaluation.questions.length,
            pointsObtenus: Math.round(pointsTotal * 100) / 100,
            bonnesReponses: questionsReussies,
            noteSur20: note,
        },
    };
}
// ======================================================
// MES RÉSULTATS
// ======================================================
export async function getMesResultats(apprenantId) {
    return prisma.soumissionEvaluation.findMany({
        where: {
            inscription: {
                apprenantId,
            },
        },
        orderBy: {
            dateSoumission: "desc",
        },
        select: {
            id: true,
            note: true,
            dateSoumission: true,
            evaluation: {
                select: {
                    id: true,
                    titre: true,
                    type: true,
                    cours: {
                        select: {
                            id: true,
                            titre: true,
                            formation: {
                                select: {
                                    id: true,
                                    titre: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}
// ======================================================
// MES ÉVALUATIONS
// ======================================================
export async function getMesEvaluations(apprenantId) {
    return prisma.evaluation.findMany({
        where: {
            cours: {
                formation: {
                    inscriptions: {
                        some: {
                            apprenantId,
                            statut: "VALIDEE",
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            titre: true,
            description: true,
            type: true,
            createdAt: true,
            cours: {
                select: {
                    id: true,
                    titre: true,
                    formation: {
                        select: {
                            id: true,
                            titre: true,
                        },
                    },
                },
            },
            soumissions: {
                where: {
                    inscription: {
                        apprenantId,
                    },
                },
                select: {
                    id: true,
                    note: true,
                    dateSoumission: true,
                },
            },
        },
    });
}
//# sourceMappingURL=evaluation.apprenant.service.js.map