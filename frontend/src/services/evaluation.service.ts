import api from "../api/axios";

export interface EvaluationApprenant {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM" | "DEVOIR";
  createdAt: string;

  cours: {
    id: string;
    titre: string;
    formation: {
      id: string;
      titre: string;
    };
  };

  soumissions: {
    id: string;
    note: number | null;
    dateSoumission: string | null;
  }[];
}

export async function getMesEvaluations() {
  const response = await api.get<{
    evaluations: EvaluationApprenant[];
  }>("/evaluations/mes-evaluations");

  return response.data.evaluations;
}
export interface QCMChoix {
  id: string;
  texte: string;
}

export interface QCMQuestion {
  id: string;
  contenu: string;
  choix: QCMChoix[];
}

export interface QCM {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM";

ours: {
    id: string;
    titre: string;
    formationId: string;
  };

  questions: QCMQuestion[];
}

export interface ReponseQCM {
  questionId: string;
  choixId: string;
}
export async function getQCM(evaluationId: string) {
  const response = await api.get<{ evaluation: QCM }>(
    `/evaluations/${evaluationId}/qcm`
  );

  return response.data.evaluation;
}

export async function soumettreQCM(
  evaluationId: string,
  reponses: ReponseQCM[]
) {
  const response = await api.post(
    `/evaluations/${evaluationId}/soumissions`,
    {
      reponses,
    }
  );

  return response.data;
}

export interface ResultatApprenant {
  id: string;
  note: number | null;
  dateSoumission: string | null;

  evaluation: {
    id: string;
    titre: string;
    type: "QCM" | "DEVOIR";

    cours: {
      id: string;
      titre: string;

      formation: {
        id: string;
        titre: string;
      };
    };
  };
}
export async function getMesResultats() {
  const response = await api.get<{
    resultats: ResultatApprenant[];
  }>("/evaluations/mes-resultats");

  return response.data.resultats;
}

export interface EvaluationFormateur {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM" | "DEVOIR";

  cours: {
    id: string;
    titre: string;
    formationId: string;
  };

  _count?: {
    questions: number;
    soumissions: number;
  };
}

export async function getEvaluationsFormation(
  formationId: string
) {
  const response = await api.get<{
    evaluations: EvaluationFormateur[];
  }>(`/formations/${formationId}/evaluations`);

  return response.data.evaluations;
}

export interface CreateEvaluationData {
  titre: string;
  description?: string;
}

export async function createEvaluationQCM(
  coursId: string,
  data: CreateEvaluationData
) {
  const response = await api.post(
    `/cours/${coursId}/evaluations`,
    data
  );

  return response.data;
}

export interface ChoixFormateur {
  id: string;
  texte: string;
  correct?: boolean;
}

export interface QuestionFormateur {
  id: string;
  contenu: string;
  choix: ChoixFormateur[];
}

export interface EvaluationDetailFormateur {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM" | "DEVOIR";

  cours: {
    id: string;
    titre: string;
    formationId: string;
  };

  questions: QuestionFormateur[];
}

export interface CreateQuestionData {
  contenu: string;

  choix: {
    texte: string;
    correct: boolean;
  }[];
}

export async function getEvaluationFormateur(
  evaluationId: string
) {
  const response = await api.get<{
    evaluation: EvaluationDetailFormateur;
  }>(`/evaluations/${evaluationId}`);

  return response.data.evaluation;
}

export async function ajouterQuestionQCM(
  evaluationId: string,
  data: CreateQuestionData
) {
  const response = await api.post(
    `/evaluations/${evaluationId}/questions`,
    data
  );

  return response.data;
}

export interface UpdateQuestionData {
  contenu: string;

  choix: {
    texte: string;
    correct: boolean;
  }[];
}

export async function modifierQuestionQCM(
  questionId: string,
  data: UpdateQuestionData
) {
  const response = await api.patch(
    `/questions/${questionId}`,
    data
  );

  return response.data;
}

export async function supprimerQuestionQCM(
  questionId: string
) {
  const response = await api.delete(
    `/questions/${questionId}`
  );

  return response.data;
}

export interface EvaluationDetailFormateur {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM" | "DEVOIR";

  createdAt: string;

  nombreQuestions: number;
  nombreSoumissions: number;
  verrouille: boolean;

  cours: {
    id: string;
    titre: string;
    formationId: string;
  };

  questions: QuestionFormateur[];
}

export interface EvaluationDetailAdmin {
  id: string;
  titre: string;
  description: string | null;
  type: "QCM" | "DEVOIR";
  createdAt: string;

  cours: {
    id: string;
    titre: string;
    formationId: string;

    formation: {
      id: string;
      titre: string;
    };
  };

  questions: {
    id: string;
    contenu: string;

    choix: {
      id: string;
      texte: string;
      correct: boolean;
    }[];
  }[];

  nombreQuestions: number;
  nombreSoumissions: number;
  verrouille: boolean;
}

export async function getEvaluationDetailAdmin(
  evaluationId: string
) {
  const response =
    await api.get<{
      evaluation: EvaluationDetailAdmin;
    }>(
      `/evaluations/${evaluationId}`
    );

  return response.data.evaluation;
}

export interface ResultatEvaluationAdmin {
  id: string;
  note: number | null;
  dateSoumission: string;

  inscription: {
    apprenant: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

export interface ResultatsEvaluationAdminResponse {
  evaluation: {
    id: string;
    titre: string;
    type: "QCM" | "DEVOIR";

    cours: {
      id: string;
      titre: string;
    };
  };

  soumissions: ResultatEvaluationAdmin[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function getResultatsEvaluationAdmin(
  evaluationId: string,
  page = 1,
  limit = 10,
  search = "",
  noteMin?: number,
  noteMax?: number
) {
  const response =
    await api.get<ResultatsEvaluationAdminResponse>(
      `/evaluations/${evaluationId}/resultats`,
      {
        params: {
          page,
          limit,

          ...(search.trim() && {
            search: search.trim(),
          }),

          ...(noteMin !== undefined && {
            noteMin,
          }),

          ...(noteMax !== undefined && {
            noteMax,
          }),
        },
      }
    );

  return response.data;
}