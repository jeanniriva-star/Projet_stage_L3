import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";

import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";

import {
  createJaasToken,
  getJaasDomain,
  getJaasRoomName,
} from "./jaas.service.js";

// ======================================================
// REJOINDRE UNE SESSION
// ======================================================

export async function joinSession(
  sessionId: string,
  userId: string,
  role: Role
) {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },

    select: {
      id: true,
      titre: true,
      roomName: true,
      dateDebut: true,
      dateFin: true,
      formationId: true,
      statut: true,
      startedAt: true,
      endedAt: true,
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  if (session.statut === "NON_DEMARREE") {
    throw new Error(
      "La visioconférence n'a pas encore été démarrée par le formateur"
    );
  }

  if (session.statut === "TERMINEE") {
    throw new Error("Cette visioconférence est terminée");
  }

  let moderator = false;

  if (role === "FORMATEUR") {
    await verifierAccesFormation(userId, role, session.formationId);

    moderator = true;
  } else if (role === "APPRENANT") {
    await verifierInscriptionValidee(userId, session.formationId);

    const inscription = await prisma.inscription.findUnique({
      where: {
        apprenantId_formationId: {
          apprenantId: userId,
          formationId: session.formationId,
        },
      },

      select: {
        id: true,
        statut: true,
      },
    });

    if (!inscription) {
      throw new Error("Inscription introuvable");
    }

    if (inscription.statut !== "VALIDEE") {
      throw new Error("Votre inscription n'est pas validée");
    }

    await prisma.presence.upsert({
      where: {
        inscriptionId_sessionId: {
          inscriptionId: inscription.id,
          sessionId: session.id,
        },
      },

      update: {
        present: true,
      },

      create: {
        inscriptionId: inscription.id,
        sessionId: session.id,
        present: true,
      },
    });

    moderator = false;
  } else {
    throw new Error("Vous n'êtes pas autorisé à rejoindre cette session");
  }

  const utilisateur = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
    },
  });

  if (!utilisateur) {
    throw new Error("Utilisateur introuvable");
  }

  const jaasRoomName = getJaasRoomName(session.roomName);

  const jaasToken = createJaasToken({
    userId: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    roomName: session.roomName,
    moderator,
  });

  const domain = getJaasDomain();

  return {
    sessionId: session.id,
    titre: session.titre,
    statut: session.statut,
    roomName: jaasRoomName,
    domain,
    jwt: jaasToken,
    moderator,
    jitsiUrl: `https://${domain}/${jaasRoomName}`,
    dateDebut: session.dateDebut,
    dateFin: session.dateFin,
    startedAt: session.startedAt,
  };
}

// ======================================================
// DÉMARRER UNE SESSION
// ======================================================

export async function startSession(
  sessionId: string,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error("Seul un formateur peut démarrer une session");
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },

    select: {
      id: true,
      titre: true,
      roomName: true,
      dateDebut: true,
      dateFin: true,
      formationId: true,
      statut: true,
      startedAt: true,
      endedAt: true,
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  await verifierAccesFormation(userId, role, session.formationId);

  if (session.statut === "EN_COURS") {
    throw new Error("Cette session est déjà en cours");
  }

  if (session.statut === "TERMINEE") {
    throw new Error("Cette session est déjà terminée");
  }

  const maintenant = new Date();

  const sessionMiseAJour = await prisma.session.update({
    where: {
      id: sessionId,
    },

    data: {
      statut: "EN_COURS",
      startedAt: maintenant,
      endedAt: null,
    },

    select: {
      id: true,
      titre: true,
      roomName: true,
      statut: true,
      startedAt: true,
      dateDebut: true,
      dateFin: true,
    },
  });

  const domain = getJaasDomain();

  const roomName = getJaasRoomName(sessionMiseAJour.roomName);

  return {
    ...sessionMiseAJour,

    roomName,

    domain,

    jitsiUrl: `https://${domain}/${roomName}`,
  };
}

// ======================================================
// TERMINER UNE SESSION
// ======================================================

export async function endSession(
  sessionId: string,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error("Seul un formateur peut terminer une session");
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },

    select: {
      id: true,
      formationId: true,
      statut: true,
    },
  });

  if (!session) {
    throw new Error("Session introuvable");
  }

  await verifierAccesFormation(userId, role, session.formationId);

  if (session.statut === "NON_DEMARREE") {
    throw new Error("Cette session n'a pas encore démarré");
  }

  if (session.statut === "TERMINEE") {
    throw new Error("Cette session est déjà terminée");
  }

  return prisma.$transaction(async (tx) => {
    const inscriptions = await tx.inscription.findMany({
      where: {
        formationId: session.formationId,
        statut: "VALIDEE",
      },

      select: {
        id: true,
      },
    });

    const presencesExistantes = await tx.presence.findMany({
      where: {
        sessionId,
      },

      select: {
        inscriptionId: true,
      },
    });

    const inscriptionsAvecPresence = new Set(
      presencesExistantes.map((presence) => presence.inscriptionId)
    );

    const inscriptionsAbsentes = inscriptions.filter(
      (inscription) => !inscriptionsAvecPresence.has(inscription.id)
    );

    if (inscriptionsAbsentes.length > 0) {
      await tx.presence.createMany({
        data: inscriptionsAbsentes.map((inscription) => ({
          inscriptionId: inscription.id,
          sessionId,
          present: false,
        })),

        skipDuplicates: true,
      });
    }

    return tx.session.update({
      where: {
        id: sessionId,
      },

      data: {
        statut: "TERMINEE",
        endedAt: new Date(),
      },

      select: {
        id: true,
        titre: true,
        statut: true,
        startedAt: true,
        endedAt: true,
      },
    });
  });
}