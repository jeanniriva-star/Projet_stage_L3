import api from "../api/axios";

export interface InscriptionApprenant {
  id: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
  dateInscription: string;
  formation: {
    id: string;
    titre: string;
    description: string | null;
    prix: string;
  };
}

export async function getMesFormations() {
const response = await api.get<{
  inscriptions: InscriptionApprenant[];
}>("/inscriptions/mes-inscriptions");

return response.data.inscriptions;
}