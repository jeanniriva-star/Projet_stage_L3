import type { Request, Response } from "express";
import * as sessionService from "./session.service.js";
import type { StatutSession } from "../../generated/prisma/client.js";

export async function createSession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const formationId = req.params.formationId;
    const { titre, description, dateDebut, dateFin } = req.body;

    if (typeof formationId !== "string") {
      return res.status(400).json({
        message: "Identifiant de formation invalide",
      });
    }

    if (!titre || typeof titre !== "string") {
      return res.status(400).json({
        message: "Le titre est obligatoire",
      });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Les dates fournies sont invalides",
      });
    }

    const session = await sessionService.createSession(
      {
        titre,
        description,
        dateDebut: debut,
        dateFin: fin,
        formationId,
      },
      req.user.id,
      req.user.role
    );

    return res.status(201).json({
      message: "Session créée avec succès",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(403).json({
      message,
    });
  }
}
export async function getSessionsByFormation(
  req: Request,
  res: Response
) {
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

    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const searchRaw = req.query.search;
    const statutRaw = req.query.statut;

    const page =
      typeof pageRaw === "string"
        ? Number(pageRaw)
        : 1;

    const limit =
      typeof limitRaw === "string"
        ? Number(limitRaw)
        : 10;

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        message:
          "Le numéro de page doit être un entier supérieur ou égal à 1",
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message:
          "La limite doit être comprise entre 1 et 100",
      });
    }

    const search =
      typeof searchRaw === "string"
        ? searchRaw.trim()
        : undefined;

    const statutsAutorises = [
      "NON_DEMAREE",
      "EN_COURS",
      "TERMINEE",
    ] as const;

   let statut:
  | "NON_DEMARREE"
  | "EN_COURS"
  | "TERMINEE"
  | undefined;

    if (statutRaw !== undefined) {
      if (
        typeof statutRaw !== "string" ||
        !statutsAutorises.includes(
          statutRaw as
            | "NON_DEMAREE"
            | "EN_COURS"
            | "TERMINEE"
        )
      ) {
        return res.status(400).json({
          message: "Statut de session invalide",
        });
      }

      statut = statutRaw as
  | "NON_DEMARREE"
  | "EN_COURS"
  | "TERMINEE";
    }

    const resultat =
      await sessionService.getSessionsByFormation({
        formationId,
        userId: req.user.id,
        role: req.user.role,
        page,
        limit,

        ...(search && {
          search,
        }),

        ...(statut && {
          statut,
        }),
      });

    return res.status(200).json(resultat);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Formation introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("pas autorisé") ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}
export async function joinSession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    const result = await sessionService.joinSession(
      sessionId,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: "Accès à la session autorisé",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(403).json({
      message,
    });
  }
}

export async function getMesSessions(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessions =
      await sessionService.getMesSessions(
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      sessions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (
      message ===
      "Seul un apprenant peut consulter ses sessions"
    ) {
      return res.status(403).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

export async function getSessionById(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    const session = await sessionService.getSessionById(
      sessionId,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Session introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("pas autorisé") ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

export async function updateSession(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;
    const {
      titre,
      description,
      dateDebut,
      dateFin,
    } = req.body;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    if (
      titre === undefined &&
      description === undefined &&
      dateDebut === undefined &&
      dateFin === undefined
    ) {
      return res.status(400).json({
        message:
          "Aucune modification n'a été fournie",
      });
    }

    if (
      titre !== undefined &&
      (typeof titre !== "string" ||
        titre.trim() === "")
    ) {
      return res.status(400).json({
        message: "Le titre est invalide",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "La description est invalide",
      });
    }

    let nouvelleDateDebut: Date | undefined;
    let nouvelleDateFin: Date | undefined;

    if (dateDebut !== undefined) {
      if (typeof dateDebut !== "string") {
        return res.status(400).json({
          message: "La date de début est invalide",
        });
      }

      nouvelleDateDebut = new Date(dateDebut);

      if (
        Number.isNaN(
          nouvelleDateDebut.getTime()
        )
      ) {
        return res.status(400).json({
          message: "La date de début est invalide",
        });
      }
    }

    if (dateFin !== undefined) {
      if (typeof dateFin !== "string") {
        return res.status(400).json({
          message: "La date de fin est invalide",
        });
      }

      nouvelleDateFin = new Date(dateFin);

      if (
        Number.isNaN(
          nouvelleDateFin.getTime()
        )
      ) {
        return res.status(400).json({
          message: "La date de fin est invalide",
        });
      }
    }

    const session = await sessionService.updateSession(
      sessionId,
      {
        ...(titre !== undefined && {
          titre: titre.trim(),
        }),

        ...(description !== undefined && {
          description,
        }),

        ...(nouvelleDateDebut !== undefined && {
          dateDebut: nouvelleDateDebut,
        }),

        ...(nouvelleDateFin !== undefined && {
          dateFin: nouvelleDateFin,
        }),
      },
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: "Session modifiée avec succès",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Session introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
        "Seul un formateur peut modifier une session" ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "La date de fin doit être postérieure à la date de début"
    ) {
      return res.status(400).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

export async function deleteSession(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    const resultat =
      await sessionService.deleteSession(
        sessionId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json(resultat);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Session introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
        "Seul un formateur peut supprimer une session" ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message.startsWith(
        "Impossible de supprimer cette session"
      )
    ) {
      return res.status(409).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

export async function startSession(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    const session =
      await sessionService.startSession(
        sessionId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      message:
        "Visioconférence démarrée avec succès",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(403).json({
      message,
    });
  }
}

export async function endSession(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de session invalide",
      });
    }

    const session =
      await sessionService.endSession(
        sessionId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      message:
        "Visioconférence terminée avec succès",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(403).json({
      message,
    });
  }
}

export async function getPresencesSession(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const id = req.params.id;

if (typeof id !== "string") {
  return res.status(400).json({
    message: "Identifiant de session invalide",
  });
}

    if (!id) {
      return res.status(400).json({
        message:
          "Identifiant de session manquant",
      });
    }

    const resultat =
      await sessionService.getPresencesSession(
        id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json(
      resultat
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(400).json({
      message,
    });
  }
}