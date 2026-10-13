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
            cours: true,
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
    const questionIdsUniques = new Set(questionIds);
    if (questionIdsUniques.size !== questionIds.length) {
        throw new Error("Une question ne peut recevoir qu'une seule réponse");
    }
    let nombreBonnesReponses = 0;
    // Réponses qui seront enregistrées ensuite
    const reponsesAEnregistrer = [];
    // 7. Vérifier chaque réponse envoyée
    for (const reponse of reponses) {
        const question = evaluation.questions.find((question) => question.id === reponse.questionId);
        if (!question) {
            throw new Error("Une des questions n'appartient pas à cette évaluation");
        }
        const choix = question.choix.find((choix) => choix.id === reponse.choixId);
        if (!choix) {
            throw new Error("Un des choix n'appartient pas à la question indiquée");
        }
        if (choix.correct) {
            nombreBonnesReponses++;
        }
        reponsesAEnregistrer.push({
            questionId: question.id,
            choixId: choix.id,
        });
    }
    // 8. Calcul de la note sur 20
    const noteBrute = (nombreBonnesReponses /
        evaluation.questions.length) *
        20;
    // Exemple : 13.333333 devient 13.33
    const note = Math.round(noteBrute * 100) / 100;
    // 9. Enregistrer la soumission ET toutes les réponses
    // dans une seule transaction logique Prisma
    const soumission = await prisma.soumissionEvaluation.create({
        data: {
            inscriptionId: inscription.id,
            evaluationId,
            note,
            reponses: {
                create: reponsesAEnregistrer.map((reponse) => ({
                    questionId: reponse.questionId,
                    choixId: reponse.choixId,
                })),
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
            bonnesReponses: nombreBonnesReponses,
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