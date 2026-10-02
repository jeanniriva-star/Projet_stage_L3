import prisma from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";

import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";

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

interface ChoixInput {
  texte: string;
  correct: boolean;
}

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

  // 5. Au moins deux choix
  if (data.choix.length < 2) {
    throw new Error(
      "Une question QCM doit contenir au moins deux choix"
    );
  }

  // 6. Exactement une bonne réponse
  const nombreBonnesReponses = data.choix.filter(
    (choix) => choix.correct
  ).length;

  if (nombreBonnesReponses !== 1) {
    throw new Error(
      "Une question doit contenir exactement une bonne réponse"
    );
  }

  // 7. Créer la question et ses choix
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

export async function getQCMForApprenant(
  evaluationId: string,
  apprenantId: string
) {
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },

    select: {
      id: true,
      titre: true,
      description: true,
      type: true,

      cours: {
        select: {
          id: true,
          titre: true,
          formationId: true,
        },
      },

      questions: {
        select: {
          id: true,
          contenu: true,

          choix: {
            select: {
              id: true,
              texte: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  if (evaluation.type !== "QCM") {
    throw new Error("Cette évaluation n'est pas un QCM");
  }

  await verifierInscriptionValidee(
    apprenantId,
    evaluation.cours.formationId
  );

  return evaluation;
}

interface ReponseQCMInput {
  questionId: string;
  choixId: string;
}

export async function soumettreQCM(
  evaluationId: string,
  apprenantId: string,
  reponses: ReponseQCMInput[]
) {
  // 1. Récupérer l'évaluation avec ses questions et ses choix
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },

    include: {
      cours: true,

      questions: {
        include: {
          choix: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  if (evaluation.type !== "QCM") {
    throw new Error("Cette évaluation n'est pas un QCM");
  }

  if (evaluation.questions.length === 0) {
    throw new Error("Cette évaluation ne contient aucune question");
  }

  // 2. Vérifier que l'apprenant est bien inscrit
  // et que son inscription est VALIDEE
  await verifierInscriptionValidee(
    apprenantId,
    evaluation.cours.formationId
  );

  // 3. Récupérer l'inscription
  const inscription = await prisma.inscription.findUnique({
    where: {
      apprenantId_formationId: {
        apprenantId,
        formationId: evaluation.cours.formationId,
      },
    },
  });

  if (!inscription) {
    throw new Error("Inscription introuvable");
  }

  // 4. Empêcher une deuxième soumission
  const soumissionExistante =
    await prisma.soumissionEvaluation.findUnique({
      where: {
        inscriptionId_evaluationId: {
          inscriptionId: inscription.id,
          evaluationId,
        },
      },
    });

  if (soumissionExistante) {
    throw new Error(
      "Vous avez déjà soumis cette évaluation"
    );
  }

  // 5. Toutes les questions doivent recevoir une réponse
  if (reponses.length !== evaluation.questions.length) {
    throw new Error(
      "Vous devez répondre à toutes les questions"
    );
  }

  // 6. Refuser les questions envoyées plusieurs fois
  const questionIds = reponses.map(
    (reponse) => reponse.questionId
  );

  const questionIdsUniques = new Set(questionIds);

  if (questionIdsUniques.size !== questionIds.length) {
    throw new Error(
      "Une question ne peut recevoir qu'une seule réponse"
    );
  }

  let nombreBonnesReponses = 0;

  // Réponses qui seront enregistrées ensuite
  const reponsesAEnregistrer: ReponseQCMInput[] = [];

  // 7. Vérifier chaque réponse envoyée
  for (const reponse of reponses) {
    const question = evaluation.questions.find(
      (question) => question.id === reponse.questionId
    );

    if (!question) {
      throw new Error(
        "Une des questions n'appartient pas à cette évaluation"
      );
    }

    const choix = question.choix.find(
      (choix) => choix.id === reponse.choixId
    );

    if (!choix) {
      throw new Error(
        "Un des choix n'appartient pas à la question indiquée"
      );
    }

    if (choix.correct) {
      nombreBonnesReponses++;
    }

    reponsesAEnregistrer.push({
      questionId: question.id,
      choixId: choix.id,
    });
  }

  // 8. Calcul de la note sur 20
  const noteBrute =
    (nombreBonnesReponses /
      evaluation.questions.length) *
    20;

  // Exemple : 13.333333 devient 13.33
  const note = Math.round(noteBrute * 100) / 100;

  // 9. Enregistrer la soumission ET toutes les réponses
  // dans une seule transaction logique Prisma
  const soumission =
    await prisma.soumissionEvaluation.create({
      data: {
        inscriptionId: inscription.id,
        evaluationId,
        note,

        reponses: {
          create: reponsesAEnregistrer.map(
            (reponse) => ({
              questionId: reponse.questionId,
              choixId: reponse.choixId,
            })
          ),
        },
      },

      select: {
        id: true,
        evaluationId: true,
        note: true,
        dateSoumission: true,

        evaluation: {
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
              },
            },
          },
        },
      },
    });

  return {
    soumission,
    resultat: {
      nombreQuestions: evaluation.questions.length,
      bonnesReponses: nombreBonnesReponses,
      noteSur20: note,
    },
  };
}

export async function getMesResultats(
  apprenantId: string
) {
  return prisma.soumissionEvaluation.findMany({
    where: {
      inscription: {
        apprenantId,
      },
    },

    orderBy: {
      dateSoumission: "desc",
    },

    select: {
      id: true,
      note: true,
      dateSoumission: true,

      evaluation: {
        select: {
          id: true,
          titre: true,
          type: true,

          cours: {
            select: {
              id: true,
              titre: true,

              formation: {
                select: {
                  id: true,
                  titre: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getResultatsEvaluation(
  evaluationId: string,
  userId: string,
  role: Role,
  options: GetResultatsEvaluationOptions = {}
) {
  const {
    page = 1,
    limit = 10,
    search,
    noteMin,
    noteMax,
  } = options;

  const evaluation = await prisma.evaluation.findUnique({
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

  // FORMATEUR : uniquement ses formations
  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      evaluation.cours.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter ces résultats"
    );
  }

  const skip = (page - 1) * limit;

  const where = {
    evaluationId,

    ...((noteMin !== undefined ||
      noteMax !== undefined) && {
      note: {
        ...(noteMin !== undefined && {
          gte: noteMin,
        }),

        ...(noteMax !== undefined && {
          lte: noteMax,
        }),
      },
    }),

    ...(search !== undefined &&
      search.trim() !== "" && {
        inscription: {
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
            ],
          },
        },
      }),
  };

  const [soumissions, total] = await Promise.all([
    prisma.soumissionEvaluation.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        dateSoumission: "desc",
      },

      select: {
        id: true,
        note: true,
        dateSoumission: true,

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
    }),

    prisma.soumissionEvaluation.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    evaluation: {
      id: evaluation.id,
      titre: evaluation.titre,
      type: evaluation.type,

      cours: {
        id: evaluation.cours.id,
        titre: evaluation.cours.titre,
      },
    },

    soumissions,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
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

interface UpdateQuestionData {
  contenu?: string;
  choix?: {
    texte: string;
    correct: boolean;
  }[];
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
      "Impossible de modifier cette question car l'évaluation possède déjà des soumissions"
    );
  }

  if (data.choix !== undefined) {
    if (data.choix.length < 2) {
      throw new Error(
        "Une question QCM doit contenir au moins deux choix"
      );
    }

    const nombreBonnesReponses =
      data.choix.filter(
        (choix) => choix.correct
      ).length;

    if (nombreBonnesReponses !== 1) {
      throw new Error(
        "Une question doit contenir exactement une bonne réponse"
      );
    }
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
      "Impossible de supprimer cette question car l'évaluation possède déjà des soumissions"
    );
  }

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

interface GetEvaluationsFormationParams {
  formationId: string;
  userId: string;
  role: Role;
  page: number;
  limit: number;
  search?: string;
  type?: "QCM" | "DEVOIR";
}

export async function getEvaluationsByFormation(
  params: GetEvaluationsFormationParams
) {
  const {
    formationId,
    userId,
    role,
    page,
    limit,
    search,
    type,
  } = params;

  // 1. Vérifier que la formation existe
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

  // 2. Contrôle des droits
  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter ces évaluations"
    );
  }

  const skip = (page - 1) * limit;

  // 3. Filtres
  const where = {
    cours: {
      formationId,
    },

    ...(type !== undefined && {
      type,
    }),

    ...(search !== undefined &&
      search.trim() !== "" && {
        OR: [
          {
            titre: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          },
          {
            cours: {
              formationId,
              titre: {
                contains: search.trim(),
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
  };

  // 4. Liste + nombre total
  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
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
            ordre: true,
          },
        },

        _count: {
          select: {
            questions: true,
            soumissions: true,
          },
        },
      },
    }),

    prisma.evaluation.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    formation,

    evaluations,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

interface GetResultatsEvaluationOptions {
  page?: number;
  limit?: number;
  search?: string;
  noteMin?: number;
  noteMax?: number;
}
export async function getEvaluationDetail(
  evaluationId: string,
  userId: string,
  role: Role
) {
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
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

          formation: {
            select: {
              id: true,
              titre: true,
            },
          },
        },
      },

      questions: {
        select: {
          id: true,
          contenu: true,

          choix: {
            select: {
              id: true,
              texte: true,
              correct: true,
            },
          },
        },
      },

      _count: {
        select: {
          questions: true,
          soumissions: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error("Évaluation introuvable");
  }

  if (role === "FORMATEUR") {
    await verifierAccesFormation(
      userId,
      role,
      evaluation.cours.formationId
    );
  } else if (role !== "ADMIN") {
    throw new Error(
      "Vous n'êtes pas autorisé à consulter cette évaluation"
    );
  }

  return {
    id: evaluation.id,
    titre: evaluation.titre,
    description: evaluation.description,
    type: evaluation.type,
    createdAt: evaluation.createdAt,

    cours: evaluation.cours,

    questions: evaluation.questions,

    nombreQuestions:
      evaluation._count.questions,

    nombreSoumissions:
      evaluation._count.soumissions,

    // Très utile pour React :
    // si true, les questions ne doivent plus être modifiées.
    verrouille:
      evaluation._count.soumissions > 0,
  };
}
export async function getMesEvaluations(
  apprenantId: string
) {
  return prisma.evaluation.findMany({
    where: {
      cours: {
        formation: {
          inscriptions: {
            some: {
              apprenantId,
              statut: "VALIDEE",
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
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

          formation: {
            select: {
              id: true,
              titre: true,
            },
          },
        },
      },

      soumissions: {
        where: {
          inscription: {
            apprenantId,
          },
        },

        select: {
          id: true,
          note: true,
          dateSoumission: true,
        },
      },
    },
  });
}
