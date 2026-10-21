import prisma from "../../config/prisma.js";
function arrondir(valeur) {
    return Math.round(valeur * 100) / 100;
}
function moyenne(valeurs) {
    return valeurs.length > 0
        ? arrondir(valeurs.reduce((somme, valeur) => somme + valeur, 0) /
            valeurs.length)
        : null;
}
function extraireNotes(soumissions) {
    return soumissions
        .map((soumission) => soumission.note)
        .filter((note) => note !== null);
}
export async function getDashboardAdmin() {
    const [nombreUtilisateurs, nombreFormateurs, nombreApprenants, nombreFormations, inscriptionsEnAttente, nombreSessions, nombreEvaluations, formationsBrutes,] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                role: "FORMATEUR",
            },
        }),
        prisma.user.count({
            where: {
                role: "APPRENANT",
            },
        }),
        prisma.formation.count(),
        prisma.inscription.count({
            where: {
                statut: "EN_ATTENTE",
            },
        }),
        prisma.session.count(),
        prisma.evaluation.count(),
        // Données brutes pour les statistiques par formation
        prisma.formation.findMany({
            select: {
                id: true,
                titre: true,
                inscriptions: {
                    where: {
                        statut: "VALIDEE",
                    },
                    select: {
                        apprenant: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                            },
                        },
                        soumissions: {
                            select: {
                                note: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);
    const statsFormations = formationsBrutes
        .map((formation) => {
        // Toutes les notes de QCM de la formation
        const toutesLesNotes = formation.inscriptions.flatMap((inscription) => extraireNotes(inscription.soumissions));
        // Progression : moyenne des QCM de chaque apprenant
        // (seulement ceux qui ont passé au moins un QCM)
        const apprenants = formation.inscriptions
            .map((inscription) => {
            const notes = extraireNotes(inscription.soumissions);
            return {
                id: inscription.apprenant.id,
                nom: inscription.apprenant.nom,
                prenom: inscription.apprenant.prenom,
                nombreQcm: notes.length,
                moyenne: moyenne(notes),
            };
        })
            .filter((apprenant) => apprenant.moyenne !== null)
            .sort((a, b) => (b.moyenne ?? 0) - (a.moyenne ?? 0));
        return {
            id: formation.id,
            titre: formation.titre,
            inscritsValides: formation.inscriptions.length,
            nombreSoumissions: toutesLesNotes.length,
            noteMoyenne: moyenne(toutesLesNotes),
            apprenants,
        };
    })
        // Les plus suivies en premier
        .sort((a, b) => b.inscritsValides - a.inscritsValides);
    return {
        utilisateurs: {
            total: nombreUtilisateurs,
            formateurs: nombreFormateurs,
            apprenants: nombreApprenants,
        },
        formations: nombreFormations,
        inscriptions: {
            enAttente: inscriptionsEnAttente,
        },
        sessions: nombreSessions,
        evaluations: nombreEvaluations,
        statsFormations,
    };
}
export async function getDashboardFormateur(formateurId) {
    const maintenant = new Date();
    const [nombreFormations, inscriptions, nombreSessions, nombreEvaluations, prochainesSessions,] = await Promise.all([
        // Formations auxquelles le formateur est affecté
        prisma.formation.count({
            where: {
                affectations: {
                    some: {
                        formateurId,
                    },
                },
            },
        }),
        // Apprenants validés dans ses formations
        prisma.inscription.findMany({
            where: {
                statut: "VALIDEE",
                formation: {
                    affectations: {
                        some: {
                            formateurId,
                        },
                    },
                },
            },
            distinct: ["apprenantId"],
            select: {
                apprenantId: true,
            },
        }),
        // Nombre total de sessions de ses formations
        prisma.session.count({
            where: {
                formation: {
                    affectations: {
                        some: {
                            formateurId,
                        },
                    },
                },
            },
        }),
        // Nombre d'évaluations dans ses formations
        prisma.evaluation.count({
            where: {
                cours: {
                    formation: {
                        affectations: {
                            some: {
                                formateurId,
                            },
                        },
                    },
                },
            },
        }),
        // Prochaines sessions
        prisma.session.findMany({
            where: {
                dateDebut: {
                    gt: maintenant,
                },
                formation: {
                    affectations: {
                        some: {
                            formateurId,
                        },
                    },
                },
            },
            orderBy: {
                dateDebut: "asc",
            },
            take: 5,
            select: {
                id: true,
                titre: true,
                dateDebut: true,
                dateFin: true,
                formation: {
                    select: {
                        id: true,
                        titre: true,
                    },
                },
            },
        }),
    ]);
    return {
        formations: nombreFormations,
        apprenants: inscriptions.length,
        sessions: nombreSessions,
        evaluations: nombreEvaluations,
        prochainesSessions,
    };
}
export async function getDashboardApprenant(apprenantId) {
    const maintenant = new Date();
    const [nombreFormations, nombreInscriptions, inscriptionsValidees, inscriptionsEnAttente, inscriptionsRefusees, nombrePresences, evaluationsSoumises, prochainesSessions,] = await Promise.all([
        // Nombre de formations réellement accessibles
        prisma.inscription.count({
            where: {
                apprenantId,
                statut: "VALIDEE",
            },
        }),
        // Toutes les inscriptions
        prisma.inscription.count({
            where: {
                apprenantId,
            },
        }),
        prisma.inscription.count({
            where: {
                apprenantId,
                statut: "VALIDEE",
            },
        }),
        prisma.inscription.count({
            where: {
                apprenantId,
                statut: "EN_ATTENTE",
            },
        }),
        prisma.inscription.count({
            where: {
                apprenantId,
                statut: "REFUSEE",
            },
        }),
        // Présences enregistrées
        prisma.presence.count({
            where: {
                present: true,
                inscription: {
                    apprenantId,
                },
            },
        }),
        // Nombre de QCM / évaluations déjà soumis
        prisma.soumissionEvaluation.count({
            where: {
                inscription: {
                    apprenantId,
                },
            },
        }),
        // Prochaines sessions des formations validées
        prisma.session.findMany({
            where: {
                dateDebut: {
                    gt: maintenant,
                },
                formation: {
                    inscriptions: {
                        some: {
                            apprenantId,
                            statut: "VALIDEE",
                        },
                    },
                },
            },
            orderBy: {
                dateDebut: "asc",
            },
            take: 5,
            select: {
                id: true,
                titre: true,
                description: true,
                dateDebut: true,
                dateFin: true,
                formation: {
                    select: {
                        id: true,
                        titre: true,
                    },
                },
            },
        }),
    ]);
    return {
        formations: nombreFormations,
        inscriptions: {
            total: nombreInscriptions,
            validees: inscriptionsValidees,
            enAttente: inscriptionsEnAttente,
            refusees: inscriptionsRefusees,
        },
        presences: nombrePresences,
        evaluationsSoumises,
        prochainesSessions,
    };
}
export async function getFormateurDashboard(formateurId) {
    const formations = await prisma.affectationFormateur.findMany({
        where: {
            formateurId,
        },
        select: {
            formationId: true,
        },
    });
    const formationIds = formations.map((item) => item.formationId);
    const [totalFormations, totalCours, totalSessions, totalEvaluations, prochainesSessions,] = await Promise.all([
        prisma.formation.count({
            where: {
                id: {
                    in: formationIds,
                },
            },
        }),
        prisma.cours.count({
            where: {
                formationId: {
                    in: formationIds,
                },
            },
        }),
        prisma.session.count({
            where: {
                formationId: {
                    in: formationIds,
                },
            },
        }),
        prisma.evaluation.count({
            where: {
                cours: {
                    formationId: {
                        in: formationIds,
                    },
                },
            },
        }),
        prisma.session.findMany({
            where: {
                formationId: {
                    in: formationIds,
                },
                statut: {
                    in: ["NON_DEMARREE", "EN_COURS"],
                },
            },
            orderBy: {
                dateDebut: "asc",
            },
            take: 5,
            select: {
                id: true,
                titre: true,
                dateDebut: true,
                dateFin: true,
                statut: true,
                formation: {
                    select: {
                        id: true,
                        titre: true,
                    },
                },
            },
        }),
    ]);
    return {
        statistiques: {
            formations: totalFormations,
            cours: totalCours,
            sessions: totalSessions,
            evaluations: totalEvaluations,
        },
        prochainesSessions,
    };
}
//# sourceMappingURL=dashboard.service.js.map