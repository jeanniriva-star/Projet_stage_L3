import type { Request, Response } from "express";
import * as formationService from "./formation.service.js";

export async function createFormation(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const { titre, description } = req.body;

    if (!titre) {
      return res.status(400).json({
        message: "Le titre est obligatoire",
      });
    }

    const formation = await formationService.createFormation({
      titre,
      description,
      createurId: req.user.id,
    });

    return res.status(201).json({
      message: "Formation créée avec succès",
      formation,
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

export async function getFormations(
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
      await formationService.getFormationsPagines({
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

export async function getFormationById(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Identifiant de formation invalide",
      });
    }

    const formation =
      await formationService.getFormationById(id);

    return res.status(200).json({
      formation,
    });
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

    return res.status(500).json({
      message,
    });
  }
}

export async function updateFormation(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;
    const { titre, description } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Identifiant de formation invalide",
      });
    }

    if (
      titre === undefined &&
      description === undefined
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

    const formation =
      await formationService.updateFormation(
        id,
        {
          ...(titre !== undefined && {
            titre: titre.trim(),
          }),

          ...(description !== undefined && {
            description,
          }),
        }
      );

    return res.status(200).json({
      message:
        "Formation modifiée avec succès",
      formation,
    });
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

    return res.status(500).json({
      message,
    });
  }
}

export async function deleteFormation(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Identifiant de formation invalide",
      });
    }

    const result =
      await formationService.deleteFormation(id);

    return res.status(200).json(result);
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
      message.startsWith(
        "Impossible de supprimer cette formation"
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