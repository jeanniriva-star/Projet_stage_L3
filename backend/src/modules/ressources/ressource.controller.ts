import type {
  Request,
  Response,
} from "express";

import path from "node:path";
import fs from "node:fs";

import * as ressourceService from "./ressource.service.js";

function supprimerFichierLocal(
  url: string
) {
  if (
    !url.startsWith(
      "/uploads/ressources/"
    )
  ) {
    return;
  }

  const filename =
    path.basename(url);

  const filePath =
    path.resolve(
      process.cwd(),
      "uploads",
      "ressources",
      filename
    );

  if (
    fs.existsSync(filePath)
  ) {
    fs.unlinkSync(filePath);
  }
}

export async function createRessource(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const coursId =
      req.params.coursId;

    const {
      nom,
      type,
      url,
    } = req.body;

    if (
      typeof coursId !==
      "string"
    ) {
      return res.status(400).json({
        message:
          "Identifiant du cours invalide",
      });
    }

    if (
      !nom ||
      !type ||
      !url
    ) {
      return res.status(400).json({
        message:
          "nom, type et url sont obligatoires",
      });
    }

    const ressource =
      await ressourceService.createRessource(
        {
          nom,
          type,
          url,
          coursId,
        },
        req.user.id,
        req.user.role
      );

    return res.status(201).json({
      message:
        "Ressource créée avec succès",

      ressource,
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

export async function uploadRessourceFichier(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      /*
       * Multer peut déjà avoir enregistré
       * le fichier avant cette vérification.
       */
      if (req.file) {
        supprimerFichierLocal(
          `/uploads/ressources/${req.file.filename}`
        );
      }

      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const coursId =
      req.params.coursId;

    if (
      typeof coursId !==
      "string"
    ) {
      if (req.file) {
        supprimerFichierLocal(
          `/uploads/ressources/${req.file.filename}`
        );
      }

      return res.status(400).json({
        message:
          "Identifiant du cours invalide",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "Aucun fichier reçu",
      });
    }

    const nom =
      typeof req.body.nom ===
        "string" &&
      req.body.nom.trim() !== ""
        ? req.body.nom.trim()
        : req.file.originalname;

    const extension =
      path
        .extname(
          req.file.originalname
        )
        .toLowerCase();

    let type =
      "DOCUMENT";

    if (
      extension === ".pdf"
    ) {
      type = "PDF";
    } else if (
      extension === ".ppt" ||
      extension === ".pptx"
    ) {
      type = "POWERPOINT";
    } else if (
      extension === ".doc" ||
      extension === ".docx"
    ) {
      type = "WORD";
    }

    const url =
      `/uploads/ressources/${req.file.filename}`;

    try {
      const ressource =
        await ressourceService.createRessource(
          {
            nom,
            type,
            url,
            coursId,
          },
          req.user.id,
          req.user.role
        );

      return res.status(201).json({
        message:
          "Fichier ajouté avec succès",

        ressource,
      });
    } catch (error) {
      /*
       * Si Prisma ou la vérification
       * d'accès échoue après l'upload,
       * on retire le fichier physique.
       */
      supprimerFichierLocal(
        url
      );

      throw error;
    }
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

export async function getRessourcesByCours(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const coursId =
      req.params.coursId;

    if (
      typeof coursId !==
      "string"
    ) {
      return res.status(400).json({
        message:
          "Identifiant de cours invalide",
      });
    }

    const pageRaw =
      req.query.page;

    const limitRaw =
      req.query.limit;

    const searchRaw =
      req.query.search;

    const typeRaw =
      req.query.type;

    const page =
      typeof pageRaw ===
      "string"
        ? Number(pageRaw)
        : 1;

    const limit =
      typeof limitRaw ===
      "string"
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
      typeof searchRaw ===
      "string"
        ? searchRaw.trim()
        : undefined;

    const type =
      typeof typeRaw ===
      "string"
        ? typeRaw.trim()
        : undefined;

    const resultat =
      await ressourceService.getRessourcesByCoursPaginees(
        {
          coursId,

          userId:
            req.user.id,

          role:
            req.user.role,

          page,
          limit,

          ...(search && {
            search,
          }),

          ...(type && {
            type,
          }),
        }
      );

    return res.status(200).json(
      resultat
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (
      message ===
      "Cours introuvable"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes(
        "pas autorisé"
      ) ||
      message.includes(
        "affecté"
      ) ||
      message
        .toLowerCase()
        .includes(
          "inscription"
        )
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

export async function updateRessource(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const ressourceId =
      req.params.id;

    const {
      nom,
      type,
      url,
    } = req.body;

    if (
      typeof ressourceId !==
      "string"
    ) {
      return res.status(400).json({
        message:
          "Identifiant de ressource invalide",
      });
    }

    if (
      nom === undefined &&
      type === undefined &&
      url === undefined
    ) {
      return res.status(400).json({
        message:
          "Aucune modification fournie",
      });
    }

    const ressource =
      await ressourceService.updateRessource(
        ressourceId,
        {
          nom,
          type,
          url,
        },
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      message:
        "Ressource modifiée avec succès",

      ressource,
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

export async function deleteRessource(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const ressourceId =
      req.params.id;

    if (
      typeof ressourceId !==
      "string"
    ) {
      return res.status(400).json({
        message:
          "Identifiant de ressource invalide",
      });
    }

    const ressource =
      await ressourceService.deleteRessource(
        ressourceId,
        req.user.id,
        req.user.role
      );

    /*
     * Après suppression en base,
     * supprimer aussi le fichier local
     * s'il s'agit d'un upload.
     */
    try {
      supprimerFichierLocal(
        ressource.url
      );
    } catch (fileError) {
      console.error(
        "Impossible de supprimer le fichier physique :",
        fileError
      );
    }

    return res.status(200).json({
      message:
        "Ressource supprimée avec succès",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (
      message ===
      "Ressource introuvable"
    ) {
      return res.status(404).json({
        message,
      });
    }

    return res.status(403).json({
      message,
    });
  }
}

export async function downloadRessource(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Non authentifié",
      });
    }

    const ressourceId =
      req.params.id;

    if (
      typeof ressourceId !==
      "string"
    ) {
      return res.status(400).json({
        message:
          "Identifiant de ressource invalide",
      });
    }

    const ressource =
      await ressourceService.getRessourceForDownload(
        ressourceId,
        req.user.id,
        req.user.role
      );

    if (
      !ressource.url.startsWith(
        "/uploads/ressources/"
      )
    ) {
      return res.status(400).json({
        message:
          "Cette ressource n'est pas un fichier téléchargeable",
      });
    }

    const filename =
      path.basename(
        ressource.url
      );

    const filePath =
      path.resolve(
        process.cwd(),
        "uploads",
        "ressources",
        filename
      );

    if (
      !fs.existsSync(
        filePath
      )
    ) {
      return res.status(404).json({
        message:
          "Le fichier physique est introuvable",
      });
    }

    /*
     * Garder l'extension réelle
     * du fichier stocké.
     */
    const extension =
      path.extname(
        filename
      );

    const nomTelechargement =
      path.extname(
        ressource.nom
      )
        ? ressource.nom
        : `${ressource.nom}${extension}`;

    return res.download(
      filePath,
      nomTelechargement
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (
      message ===
      "Ressource introuvable"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message
        .toLowerCase()
        .includes(
          "inscription"
        ) ||
      message
        .toLowerCase()
        .includes(
          "autorisé"
        ) ||
      message
        .toLowerCase()
        .includes(
          "affect"
        )
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