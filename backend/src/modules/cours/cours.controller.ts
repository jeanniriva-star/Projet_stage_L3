import type { Request, Response } from "express";
import * as coursService from "./cours.service.js";
import prisma from "../../config/prisma.js";

export async function createCours(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const formationId = req.params.formationId;
    const { titre, description, ordre } = req.body;

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

    if (!Number.isInteger(ordre) || ordre < 1) {
      return res.status(400).json({
        message: "L'ordre doit être un entier supérieur ou égal à 1",
      });
    }

    const cours = await coursService.createCours(
      {
        titre,
        description,
        ordre,
        formationId,
      },
      req.user.id,
      req.user.role
    );

    return res.status(201).json({
      message: "Cours créé avec succès",
      cours,
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

export async function getCoursByFormation(
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
      await coursService.getCoursByFormationPagines({
        formationId,
        userId: req.user.id,
        role: req.user.role,
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

    if (message === "Formation introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("pas autorisé") ||
      message.includes("affecté") ||
      message.includes("inscription") ||
      message.includes("Inscription")
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

export async function getCoursById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const coursId = req.params.id;

    if (typeof coursId !== "string") {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    const cours = await coursService.getCoursById(
      coursId,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      cours,
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

export async function updateCours(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const coursId = req.params.id;
    const { titre, description, ordre } = req.body;

    if (typeof coursId !== "string") {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    if (
      titre === undefined &&
      description === undefined &&
      ordre === undefined
    ) {
      return res.status(400).json({
        message: "Aucune modification fournie",
      });
    }

    if (titre !== undefined && typeof titre !== "string") {
      return res.status(400).json({
        message: "Le titre doit être une chaîne de caractères",
      });
    }

    if (
      ordre !== undefined &&
      (!Number.isInteger(ordre) || ordre < 1)
    ) {
      return res.status(400).json({
        message: "L'ordre doit être un entier supérieur ou égal à 1",
      });
    }

    const cours = await coursService.updateCours(
      coursId,
      {
        titre,
        description,
        ordre,
      },
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: "Cours modifié avec succès",
      cours,
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

export async function deleteCours(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const coursId = req.params.id;

    if (typeof coursId !== "string") {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    await coursService.deleteCours(
      coursId,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: "Cours supprimé avec succès",
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
export async function getMesCoursFormateur(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const cours =
      await coursService.getMesCoursFormateur(
        req.user.id
      );

    return res.status(200).json({
      cours,
    });
  } catch (error) {
    console.error(
      "Erreur getMesCoursFormateur :",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Erreur interne du serveur",
    });
  }
}