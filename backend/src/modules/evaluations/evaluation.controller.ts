import type { Request, Response } from "express";
import * as evaluationService from "./evaluation.service.js";

export async function createEvaluationQCM(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const coursId = req.params.coursId;
    const { titre, description } = req.body;

    if (typeof coursId !== "string") {
      return res.status(400).json({
        message: "Identifiant du cours invalide",
      });
    }

    if (!titre || typeof titre !== "string") {
      return res.status(400).json({
        message: "Le titre est obligatoire",
      });
    }

    const evaluation =
      await evaluationService.createEvaluationQCM(
        {
          titre,
          description,
          coursId,
        },
        req.user.id,
        req.user.role
      );

    return res.status(201).json({
      message: "Évaluation QCM créée avec succès",
      evaluation,
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

export async function addQuestion(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;
    const { contenu, choix } = req.body;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    if (!contenu || typeof contenu !== "string") {
      return res.status(400).json({
        message: "Le contenu de la question est obligatoire",
      });
    }

    if (!Array.isArray(choix)) {
      return res.status(400).json({
        message: "Les choix doivent être fournis sous forme de tableau",
      });
    }

    const question = await evaluationService.addQuestion(
      {
        evaluationId,
        contenu,
        choix,
      },
      req.user.id,
      req.user.role
    );

    return res.status(201).json({
      message: "Question ajoutée avec succès",
      question,
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

export async function getQCMForApprenant(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    const evaluation =
      await evaluationService.getQCMForApprenant(
        evaluationId,
        req.user.id
      );

    return res.status(200).json({
      evaluation,
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

export async function soumettreQCM(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;
    const { reponses } = req.body;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    if (!Array.isArray(reponses) || reponses.length === 0) {
      return res.status(400).json({
        message: "Les réponses sont obligatoires",
      });
    }

    // Vérifier la structure de chaque réponse
    const reponsesInvalides = reponses.some(
      (reponse) =>
        typeof reponse !== "object" ||
        reponse === null ||
        typeof reponse.questionId !== "string" ||
        typeof reponse.choixId !== "string"
    );

    if (reponsesInvalides) {
      return res.status(400).json({
        message:
          "Chaque réponse doit contenir un questionId et un choixId valides",
      });
    }

    const resultat =
      await evaluationService.soumettreQCM(
        evaluationId,
        req.user.id,
        reponses
      );

    return res.status(201).json({
      message: "QCM soumis avec succès",
      ...resultat,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (
      message === "Vous avez déjà soumis cette évaluation"
    ) {
      return res.status(409).json({
        message,
      });
    }

    if (
      message.includes("inscription") ||
      message.includes("Inscription")
    ) {
      return res.status(403).json({
        message,
      });
    }

    return res.status(400).json({
      message,
    });
  }
}

export async function getMesResultats(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const resultats =
      await evaluationService.getMesResultats(
        req.user.id
      );

    return res.status(200).json({
      resultats,
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

export async function getResultatsEvaluation(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const searchRaw = req.query.search;
    const noteMinRaw = req.query.noteMin;
    const noteMaxRaw = req.query.noteMax;

    const page =
      typeof pageRaw === "string"
        ? Number(pageRaw)
        : 1;

    const limit =
      typeof limitRaw === "string"
        ? Number(limitRaw)
        : 10;

    if (!Number.isInteger(page) || page < 1) {
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

    let noteMin: number | undefined;
    let noteMax: number | undefined;

    if (noteMinRaw !== undefined) {
      if (typeof noteMinRaw !== "string") {
        return res.status(400).json({
          message: "La note minimale est invalide",
        });
      }

      noteMin = Number(noteMinRaw);

      if (
        !Number.isFinite(noteMin) ||
        noteMin < 0 ||
        noteMin > 20
      ) {
        return res.status(400).json({
          message:
            "La note minimale doit être comprise entre 0 et 20",
        });
      }
    }

    if (noteMaxRaw !== undefined) {
      if (typeof noteMaxRaw !== "string") {
        return res.status(400).json({
          message: "La note maximale est invalide",
        });
      }

      noteMax = Number(noteMaxRaw);

      if (
        !Number.isFinite(noteMax) ||
        noteMax < 0 ||
        noteMax > 20
      ) {
        return res.status(400).json({
          message:
            "La note maximale doit être comprise entre 0 et 20",
        });
      }
    }

    if (
      noteMin !== undefined &&
      noteMax !== undefined &&
      noteMin > noteMax
    ) {
      return res.status(400).json({
        message:
          "La note minimale ne peut pas être supérieure à la note maximale",
      });
    }

    const resultats =
      await evaluationService.getResultatsEvaluation(
        evaluationId,
        req.user.id,
        req.user.role,
        {
          page,
          limit,

          ...(search && {
            search,
          }),

          ...(noteMin !== undefined && {
            noteMin,
          }),

          ...(noteMax !== undefined && {
            noteMax,
          }),
        }
      );

    return res.status(200).json(resultats);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Évaluation introuvable") {
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

export async function updateEvaluation(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;
    const { titre, description } = req.body;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    if (
      titre === undefined &&
      description === undefined
    ) {
      return res.status(400).json({
        message: "Aucune modification n'a été fournie",
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

    const evaluation =
      await evaluationService.updateEvaluation(
        evaluationId,
        {
          ...(titre !== undefined && {
            titre: titre.trim(),
          }),

          ...(description !== undefined && {
            description,
          }),
        },
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      message: "Évaluation modifiée avec succès",
      evaluation,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Évaluation introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("Seul un formateur") ||
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

export async function deleteEvaluation(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    const resultat =
      await evaluationService.deleteEvaluation(
        evaluationId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json(resultat);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Évaluation introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("Seul un formateur") ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message.startsWith(
        "Impossible de supprimer cette évaluation"
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

export async function updateQuestion(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const questionId = req.params.questionId;
    const { contenu, choix } = req.body;

    if (typeof questionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de question invalide",
      });
    }

    if (
      contenu === undefined &&
      choix === undefined
    ) {
      return res.status(400).json({
        message: "Aucune modification n'a été fournie",
      });
    }

    if (
      contenu !== undefined &&
      (typeof contenu !== "string" ||
        contenu.trim() === "")
    ) {
      return res.status(400).json({
        message: "Le contenu de la question est invalide",
      });
    }

   if (choix !== undefined) {
  if (!Array.isArray(choix)) {
    return res.status(400).json({
      message:
        "Les choix doivent être fournis sous forme de tableau",
    });
  }

  const choixInvalides = choix.some(
    (item: unknown) => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return true;
      }

      const choixItem = item as {
        texte?: unknown;
        correct?: unknown;
      };

      return (
        typeof choixItem.texte !== "string" ||
        choixItem.texte.trim() === "" ||
        typeof choixItem.correct !== "boolean"
      );
    }
  );

  if (choixInvalides) {
    return res.status(400).json({
      message:
        "Chaque choix doit contenir un texte valide et un champ correct booléen",
    });
  }
}

   const question =
  await evaluationService.updateQuestion(
    questionId,
    {
      ...(contenu !== undefined && {
        contenu: contenu.trim(),
      }),

      ...(choix !== undefined && {
        choix: choix.map(
          (item: {
            texte: string;
            correct: boolean;
          }) => ({
            texte: item.texte.trim(),
            correct: item.correct,
          })
        ),
      }),
    },
    req.user.id,
    req.user.role
  );

    return res.status(200).json({
      message: "Question modifiée avec succès",
      question,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Question introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("Seul un formateur") ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message.includes("au moins deux choix") ||
      message.includes("exactement une bonne réponse")
    ) {
      return res.status(400).json({
        message,
      });
    }

    if (
      message.startsWith(
        "Impossible de modifier cette question"
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

export async function deleteQuestion(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const questionId = req.params.questionId;

    if (typeof questionId !== "string") {
      return res.status(400).json({
        message: "Identifiant de question invalide",
      });
    }

    const resultat =
      await evaluationService.deleteQuestion(
        questionId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json(resultat);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Question introuvable") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes("Seul un formateur") ||
      message.includes("affecté")
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message.startsWith(
        "Impossible de supprimer cette question"
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

export async function getEvaluationsByFormation(
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
    const typeRaw = req.query.type;

    const page =
      typeof pageRaw === "string"
        ? Number(pageRaw)
        : 1;

    const limit =
      typeof limitRaw === "string"
        ? Number(limitRaw)
        : 10;

    if (!Number.isInteger(page) || page < 1) {
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

    const typesAutorises = [
      "QCM",
      "DEVOIR",
    ] as const;

    let type:
      | "QCM"
      | "DEVOIR"
      | undefined;

    if (typeRaw !== undefined) {
      if (
        typeof typeRaw !== "string" ||
        !typesAutorises.includes(
          typeRaw as "QCM" | "DEVOIR"
        )
      ) {
        return res.status(400).json({
          message: "Type d'évaluation invalide",
        });
      }

      type = typeRaw as "QCM" | "DEVOIR";
    }

    const resultat =
      await evaluationService.getEvaluationsByFormation({
        formationId,
        userId: req.user.id,
        role: req.user.role,
        page,
        limit,

        ...(search && {
          search,
        }),

        ...(type && {
          type,
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

export async function getEvaluationDetail(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluationId = req.params.evaluationId;

    if (typeof evaluationId !== "string") {
      return res.status(400).json({
        message: "Identifiant d'évaluation invalide",
      });
    }

    const evaluation =
      await evaluationService.getEvaluationDetail(
        evaluationId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      evaluation,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    if (message === "Évaluation introuvable") {
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
export async function getMesEvaluations(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const evaluations =
      await evaluationService.getMesEvaluations(
        req.user.id
      );

    return res.status(200).json({
      evaluations,
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