import prisma from "../../config/prisma.js";

export async function getDashboardAdmin() {
  const [
    nombreUtilisateurs,
    nombreFormateurs,
    nombreApprenants,
    nombreFormations,
    inscriptionsEnAttente,
    nombreSessions,
    nombreEvaluations,
  ] = await Promise.all([
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
  ]);

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
  };
}

export async function getDashboardFormateur(
  formateurId: string
) {
  const maintenant = new Date();

  const [
    nombreFormations,
    inscriptions,
    nombreSessions,
    nombreEvaluations,
    prochainesSessions,
  ] = await Promise.all([
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

export async function getDashboardApprenant(
  apprenantId: string
) {
  const maintenant = new Date();

  const [
    nombreFormations,
    nombreInscriptions,
    inscriptionsValidees,
    inscriptionsEnAttente,
    inscriptionsRefusees,
    nombrePresences,
    evaluationsSoumises,
    prochainesSessions,
  ] = await Promise.all([
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

export async function getFormateurDashboard(formateurId: string) {
  const formations = await prisma.affectationFormateur.findMany({
    where: {
      formateurId,
    },
    select: {
      formationId: true,
    },
  });

  const formationIds = formations.map(
    (item) => item.formationId
  );

  const [
    totalFormations,
    totalCours,
    totalSessions,
    totalEvaluations,
    prochainesSessions,
  ] = await Promise.all([
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