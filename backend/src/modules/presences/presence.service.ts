import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";

export async function marquerPresence(
  apprenantId: string,
  sessionId: string
) {
  // Vérifier que la session existe
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  // Vérifier que l'apprenant est inscrit et validé
  // dans la formation de cette session
  const inscription = await prisma.inscription.findUnique({
    where: {
      apprenantId_formationId: {
        apprenantId,
        formationId: session.formationId,
      },
    },
  });

  if (!inscription) {
    throw new Error(
      "Vous n'êtes pas inscrit à cette formation"
    );
  }

  if (inscription.statut !== "VALIDEE") {
    throw new Error(
      "Votre inscription à cette formation n'est pas validée"
    );
  }

  // Upsert évite de créer plusieurs présences
  // pour le même apprenant et la même session
  return prisma.presence.upsert({
    where: {
      inscriptionId_sessionId: {
        inscriptionId: inscription.id,
        sessionId,
      },
    },

    update: {
      present: true,
      dateMarquage: new Date(),
    },

    create: {
      inscriptionId: inscription.id,
      sessionId,
      present: true,
      dateMarquage: new Date(),
    },

    select: {
      id: true,
      present: true,
      dateMarquage: true,

      session: {
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
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function getPresencesBySession(
  sessionId: string,
  userId: string,
  role: Role
) {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      session.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error("Accès interdit");
  }

  return prisma.presence.findMany({
    where: {
      sessionId,
      present: true,
    },
    select: {
      id: true,
      present: true,
      dateMarquage: true,

      inscription: {
        select: {
          apprenant: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
            },
          },
        },
      },
    },
    orderBy: {
      dateMarquage: "asc",
    },
  });
}

export async function getMesPresences(
  apprenantId: string
) {
  return prisma.presence.findMany({
    where: {
      inscription: {
        apprenantId,
      },
      present: true,
    },

    orderBy: {
      dateMarquage: "desc",
    },

    select: {
      id: true,
      present: true,
      dateMarquage: true,

      session: {
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
      },
    },
  });
}

export async function getStatistiquesPresenceFormation(
  formationId: string,
  userId: string,
  role: Role
) {
  const formation = await prisma.formation.findUnique({
    where: {
      id: formationId,
    },

    select: {
      id: true,
      titre: true,
    },
  });

  if (!formation) {
    throw new Error("Formation introuvable");
  }

  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter ces statistiques"
    );
  }

  const maintenant = new Date();

  const inscriptions = await prisma.inscription.findMany({
    where: {
      formationId,
      statut: "VALIDEE",
    },

    select: {
      id: true,
      dateInscription: true,

      apprenant: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },

      presences: {
        where: {
          present: true,

          session: {
            formationId,
            dateFin: {
              lte: maintenant,
            },
          },
        },

        select: {
          sessionId: true,
        },
      },
    },
  });

  const sessionsTerminees =
    await prisma.session.findMany({
      where: {
        formationId,

        dateFin: {
          lte: maintenant,
        },
      },

      select: {
        id: true,
        dateDebut: true,
      },
    });

  const apprenants = inscriptions.map(
    (inscription) => {
      // On ne pénalise pas l'apprenant pour les sessions
      // qui ont eu lieu avant son inscription.
      const sessionsACompter =
        sessionsTerminees.filter(
          (session) =>
            session.dateDebut >=
            inscription.dateInscription
        );

      const idsSessionsACompter = new Set(
        sessionsACompter.map(
          (session) => session.id
        )
      );

      const nombrePresences =
        inscription.presences.filter(
          (presence) =>
            idsSessionsACompter.has(
              presence.sessionId
            )
        ).length;

      const nombreSessions =
        sessionsACompter.length;

      const tauxPresence =
        nombreSessions === 0
          ? 0
          : Math.round(
              (nombrePresences /
                nombreSessions) *
                10000
            ) / 100;

      return {
        apprenant: inscription.apprenant,
        nombreSessions,
        nombrePresences,
        nombreAbsences:
          nombreSessions - nombrePresences,
        tauxPresence,
      };
    }
  );

  return {
    formation,
    nombreSessionsTerminees:
      sessionsTerminees.length,
    nombreApprenants: apprenants.length,
    apprenants,
  };
}

interface GetPresencesSessionParams {
  sessionId: string;
  userId: string;
  role: Role;
  page: number;
  limit: number;
  search?: string;
}

export async function getPresencesBySessionPaginees(
  params: GetPresencesSessionParams
) {
  const {
    sessionId,
    userId,
    role,
    page,
    limit,
    search,
  } = params;

  // 1. Vérifier la session
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },

    select: {
      id: true,
      titre: true,
      dateDebut: true,
      dateFin: true,
      formationId: true,

      formation: {
        select: {
          id: true,
          titre: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  // 2. Contrôle d'accès
  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      session.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter les présences"
    );
  }

  const maintenant = new Date();
  const sessionTerminee =
    maintenant > session.dateFin;

 
  const whereInscriptions = {
    formationId: session.formationId,
    statut: "VALIDEE" as const,

    dateInscription: {
      lte: session.dateDebut,
    },

    ...(search !== undefined &&
      search.trim() !== "" && {
        apprenant: {
          OR: [
            {
              nom: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
            {
              prenom: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
            {
              telephone: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          ],
        },
      }),
  };

  const skip = (page - 1) * limit;

  const [
    inscriptions,
    totalFiltre,
    totalAttendus,
    totalPresents,
  ] = await Promise.all([
    prisma.inscription.findMany({
      where: whereInscriptions,

      skip,
      take: limit,

      orderBy: {
        dateInscription: "asc",
      },

      select: {
        id: true,
        dateInscription: true,

        apprenant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
          },
        },

        presences: {
          where: {
            sessionId,
          },

          select: {
            id: true,
            present: true,
            dateMarquage: true,
          },
        },
      },
    }),

    // Total après recherche
    prisma.inscription.count({
      where: whereInscriptions,
    }),

    // Tous les apprenants qui devaient participer
    prisma.inscription.count({
      where: {
        formationId: session.formationId,
        statut: "VALIDEE",

        dateInscription: {
          lte: session.dateDebut,
        },
      },
    }),

    // Présents parmi les apprenants concernés
    prisma.presence.count({
      where: {
        sessionId,
        present: true,

        inscription: {
          formationId: session.formationId,
          statut: "VALIDEE",

          dateInscription: {
            lte: session.dateDebut,
          },
        },
      },
    }),
  ]);

  const apprenants = inscriptions.map(
    (inscription) => {
      const presence =
        inscription.presences[0];

      let statut:
        | "PRESENT"
        | "ABSENT"
        | "NON_MARQUE";

      if (presence?.present === true) {
        statut = "PRESENT";
      } else if (sessionTerminee) {
        statut = "ABSENT";
      } else {
        statut = "NON_MARQUE";
      }

      return {
        inscriptionId: inscription.id,
        apprenant: inscription.apprenant,
        statut,

        presence: presence
          ? {
              id: presence.id,
              dateMarquage:
                presence.dateMarquage,
            }
          : null,
      };
    }
  );

  const totalAbsents =
    sessionTerminee
      ? Math.max(
          totalAttendus - totalPresents,
          0
        )
      : 0;

  const totalNonMarques =
    sessionTerminee
      ? 0
      : Math.max(
          totalAttendus - totalPresents,
          0
        );

  const totalPages =
    Math.ceil(totalFiltre / limit);

  return {
    session: {
      id: session.id,
      titre: session.titre,
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      terminee: sessionTerminee,
      formation: session.formation,
    },

    statistiques: {
      attendus: totalAttendus,
      presents: totalPresents,
      absents: totalAbsents,
      nonMarques: totalNonMarques,
    },

    apprenants,

    pagination: {
      page,
      limit,
      total: totalFiltre,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

