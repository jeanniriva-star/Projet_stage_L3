import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";

import { verifierAccesFormation } from "../affectations/affectation.service.js";

// ======================================================
// OUTILS
// ======================================================

interface ChoixInput {
  texte: string;
  correct: boolean;
}

/**
 * Règle commune aux questions QCM :
 * au moins deux choix et exactement une bonne réponse.
 */
function validerChoixQCM(choix: ChoixInput[]) {
  if (choix.length < 2) {
    throw new Error(
      "Une question QCM doit contenir au moins deux choix"
    );
  }

  const nombreBonnesReponses = choix.filter(
    (item) => item.correct
  ).length;

  if (nombreBonnesReponses !== 1) {
    throw new Error(
      "Une question doit contenir exactement une bonne réponse"
    );
  }
}

/**
 * Charge une question et vérifie que le formateur y a accès
 * et que l'évaluation n'est pas verrouillée (aucune soumission).
 */
async function chargerQuestionModifiable(
  questionId: string,
  userId: string,
  role: Role,
  action: "modifier" | "supprimer"
) {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },

    include: {
      evaluation: {
        include: {
          cours: true,

          _count: {
            select: {
              soumissions: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question introuvable");
  }

  await verifierAccesFormation(
    userId,
    role,
    question.evaluation.cours.formationId
  );

  if (question.evaluation._count.soumissions > 0) {
    throw new Error(
      `Impossible de ${action} cette question car l'évaluation possède déjà des soumissions`
    );
  }

  return question;
}

// ======================================================
// ÉVALUATIONS
// ======================================================

interface CreateEvaluationData {
  titre: string;
  description?: string;
  coursId: string;
}

export async function createEvaluationQCM(
  data: CreateEvaluationData,
  userId: string,
  role: Role
) {
  // Seul un formateur gère les évaluations pédagogiques
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut créer une évaluation"
    );
  }

  // Vérifier que le cours existe
  const cours = await prisma.cours.findUnique({
    where: {
      id: data.coursId,
    },
  });

  if (!cours) {
    throw new Error("Cours introuvable");
  }

  // Vérifier que le formateur est affecté
  // à la formation de ce cours
  await verifierAccesFormation(
    userId,
    role,
    cours.formationId
  );

  return prisma.evaluation.create({
    data: {
      titre: data.titre,
      description: data.description,
      type: "QCM",
      coursId: data.coursId,
    },

    select: {
      id: true,
      titre: true,
      description: true,
      type: true,
      createdAt: true,

      cours: {
        select: {
          id: true,
          titre: true,
          formationId: true,
        },
      },
    },
  });
}

interface UpdateEvaluationData {
  titre?: string;
  description?: string | null;
}

export async function updateEvaluation(
  evaluationId: string,
  data: UpdateEvaluationData,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut modifier une évaluation"
    );
  }

  const evaluation =
    await prisma.evaluation.findUnique({
      where: {
        id: evaluationId,
      },

      include: {
        cours: true,
      },
    });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  await verifierAccesFormation(
    userId,
    role,
    evaluation.cours.formationId
  );

  return prisma.evaluation.update({
    where: {
      id: evaluationId,
    },

    data: {
      ...(data.titre !== undefined && {
        titre: data.titre,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),
    },

    select: {
      id: true,
      titre: true,
      description: true,
      type: true,
      coursId: true,
      createdAt: true,
    },
  });
}

export async function deleteEvaluation(
  evaluationId: string,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut supprimer une évaluation"
    );
  }

  const evaluation =
    await prisma.evaluation.findUnique({
      where: {
        id: evaluationId,
      },

      include: {
        cours: true,

        _count: {
          select: {
            soumissions: true,
          },
        },
      },
    });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  await verifierAccesFormation(
    userId,
    role,
    evaluation.cours.formationId
  );

  // Une évaluation déjà passée doit rester dans l'historique.
  if (evaluation._count.soumissions > 0) {
    throw new Error(
      "Impossible de supprimer cette évaluation car des apprenants l'ont déjà soumise"
    );
  }

  await prisma.$transaction(async (tx) => {
    // Supprimer d'abord les choix
    await tx.choix.deleteMany({
      where: {
        question: {
          evaluationId,
        },
      },
    });

    // Puis les questions
    await tx.question.deleteMany({
      where: {
        evaluationId,
      },
    });

    // Enfin l'évaluation
    await tx.evaluation.delete({
      where: {
        id: evaluationId,
      },
    });
  });

  return {
    message: "Évaluation supprimée avec succès",
  };
}

// ======================================================
// QUESTIONS
// ======================================================

interface CreateQuestionData {
  evaluationId: string;
  contenu: string;
  choix: ChoixInput[];
}

export async function addQuestion(
  data: CreateQuestionData,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut ajouter une question"
    );
  }

  // 1. Vérifier que l'évaluation existe
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: data.evaluationId,
    },

    include: {
      cours: true,

      _count: {
        select: {
          soumissions: true,
        },
      },
    },
  });

  // IMPORTANT : vérifier avant d'utiliser evaluation
  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  // 2. Vérifier qu'il s'agit bien d'un QCM
  if (evaluation.type !== "QCM") {
    throw new Error(
      "Cette évaluation n'est pas un QCM"
    );
  }

  // 3. Vérifier que le formateur est affecté
  await verifierAccesFormation(
    userId,
    role,
    evaluation.cours.formationId
  );

  // 4. Verrouiller le QCM s'il possède déjà une soumission
  if (evaluation._count.soumissions > 0) {
    throw new Error(
      "Impossible d'ajouter une question car l'évaluation possède déjà des soumissions"
    );
  }

  // 5. Au moins deux choix, exactement une bonne réponse
  validerChoixQCM(data.choix);

  // 6. Créer la question et ses choix
  return prisma.question.create({
    data: {
      contenu: data.contenu,
      evaluationId: data.evaluationId,

      choix: {
        create: data.choix.map((choix) => ({
          texte: choix.texte,
          correct: choix.correct,
        })),
      },
    },

    include: {
      choix: true,
    },
  });
}

interface UpdateQuestionData {
  contenu?: string;
  choix?: ChoixInput[];
}

export async function updateQuestion(
  questionId: string,
  data: UpdateQuestionData,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut modifier une question"
    );
  }

  await chargerQuestionModifiable(
    questionId,
    userId,
    role,
    "modifier"
  );

  if (data.choix !== undefined) {
    validerChoixQCM(data.choix);
  }

  return prisma.$transaction(async (tx) => {
    if (data.choix !== undefined) {
      await tx.choix.deleteMany({
        where: {
          questionId,
        },
      });

      await tx.choix.createMany({
        data: data.choix.map((choix) => ({
          texte: choix.texte,
          correct: choix.correct,
          questionId,
        })),
      });
    }

    return tx.question.update({
      where: {
        id: questionId,
      },

      data: {
        ...(data.contenu !== undefined && {
          contenu: data.contenu,
        }),
      },

      include: {
        choix: true,
      },
    });
  });
}

export async function deleteQuestion(
  questionId: string,
  userId: string,
  role: Role
) {
  if (role !== "FORMATEUR") {
    throw new Error(
      "Seul un formateur peut supprimer une question"
    );
  }

  await chargerQuestionModifiable(
    questionId,
    userId,
    role,
    "supprimer"
  );

  await prisma.$transaction(async (tx) => {
    await tx.choix.deleteMany({
      where: {
        questionId,
      },
    });

    await tx.question.delete({
      where: {
        id: questionId,
      },
    });
  });

  return {
    message: "Question supprimée avec succès",
  };
}