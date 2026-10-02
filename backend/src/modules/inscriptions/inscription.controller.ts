import type { Request, Response } from "express";
import * as inscriptionService from "./inscription.service.js";

export async function createInscription(req: Request, res: Response) {
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

    const inscription = await inscriptionService.createInscription(
      req.user.id,
      formationId
    );

    return res.status(201).json({
      message: "Demande d'inscription envoyée avec succès",
      inscription,
    });
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

export async function getInscriptionsEnAttente(
  req: Request,
  res: Response
) {
  try {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const searchRaw = req.query.search;

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

    const resultat =
      await inscriptionService.getInscriptionsEnAttente({
        page,
        limit,

        ...(search && {
          search,
        }),
      });

    return res.status(200).json(resultat);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}

export async function updateStatutInscription(
  req: Request,
  res: Response
) {
  try {
    const inscriptionId = req.params.id;
    const { statut } = req.body;

    if (typeof inscriptionId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'inscription invalide",
      });
    }

    if (statut !== "VALIDEE" && statut !== "REFUSEE") {
      return res.status(400).json({
        message: "Le statut doit être VALIDEE ou REFUSEE",
      });
    }

    const inscription =
      await inscriptionService.updateStatutInscription(
        inscriptionId,
        statut
      );

    return res.status(200).json({
      message: `Inscription ${statut.toLowerCase()} avec succès`,
      inscription,
    });
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

export async function getMesInscriptions(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const inscriptions =
      await inscriptionService.getMesInscriptions(
        req.user.id
      );

    return res.status(200).json({
      inscriptions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}
export async function getInscriptionsByFormation(
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
      "EN_ATTENTE",
      "VALIDEE",
      "REFUSEE",
    ] as const;

    let statut:
      | "EN_ATTENTE"
      | "VALIDEE"
      | "REFUSEE"
      | undefined;

    if (statutRaw !== undefined) {
      if (
        typeof statutRaw !== "string" ||
        !statutsAutorises.includes(
          statutRaw as
            | "EN_ATTENTE"
            | "VALIDEE"
            | "REFUSEE"
        )
      ) {
        return res.status(400).json({
          message: "Statut d'inscription invalide",
        });
      }

      statut = statutRaw as
        | "EN_ATTENTE"
        | "VALIDEE"
        | "REFUSEE";
    }

    const resultat =
      await inscriptionService.getInscriptionsByFormation({
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