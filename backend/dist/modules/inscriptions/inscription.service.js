import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { sendInscriptionValideeEmail, sendInscriptionRefuseeEmail, } from "../../services/email.service.js";
export async function createInscription(apprenantId, formationId) {
    // Vérifier que la formation existe
    const formation = await prisma.formation.findUnique({
        where: {
            id: formationId,
        },
    });
    if (!formation) {
        throw new Error("Formation introuvable");
    }
    // Vérifier si l'apprenant est déjà inscrit
    const existingInscription = await prisma.inscription.findUnique({
        where: {
            apprenantId_formationId: {
                apprenantId,
                formationId,
            },
        },
    });
    if (existingInscription) {
        throw new Error("Vous êtes déjà inscrit à cette formation");
    }
    return prisma.inscription.create({
        data: {
            apprenantId,
            formationId,
            statut: "EN_ATTENTE",
        },
        select: {
            id: true,
            statut: true,
            dateInscription: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                    description: true,
                },
            },
            apprenant: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                },
            },
        },
    });
}
export async function getInscriptionsEnAttente(params) {
    const { page, limit, search, } = params;
    const skip = (page - 1) * limit;
    const where = {
        statut: "EN_ATTENTE",
        ...(search !== undefined &&
            search.trim() !== "" && {
            OR: [
                {
                    apprenant: {
                        nom: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                },
                {
                    apprenant: {
                        prenom: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                },
                {
                    apprenant: {
                        email: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                },
                {
                    formation: {
                        titre: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                },
            ],
        }),
    };
    const [inscriptions, total,] = await Promise.all([
        prisma.inscription.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                dateInscription: "desc",
            },
            select: {
                id: true,
                statut: true,
                dateInscription: true,
                apprenant: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true,
                    },
                },
                formation: {
                    select: {
                        id: true,
                        titre: true,
                        description: true,
                    },
                },
            },
        }),
        prisma.inscription.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        inscriptions,
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
export async function updateStatutInscription(inscriptionId, statut) {
    const inscription = await prisma.inscription.findUnique({
        where: {
            id: inscriptionId,
        },
    });
    if (!inscription) {
        throw new Error("Inscription introuvable");
    }
    if (inscription.statut !== "EN_ATTENTE") {
        throw new Error("Cette inscription a déjà été traitée");
    }
    if (statut !== "VALIDEE" && statut !== "REFUSEE") {
        throw new Error("Statut invalide");
    }
    const inscriptionMiseAJour = await prisma.inscription.update({
        where: {
            id: inscriptionId,
        },
        data: {
            statut,
        },
        select: {
            id: true,
            statut: true,
            dateInscription: true,
            apprenant: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                },
            },
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
    try {
        if (statut === "VALIDEE") {
            await sendInscriptionValideeEmail(inscriptionMiseAJour.apprenant.email, inscriptionMiseAJour.apprenant.prenom, inscriptionMiseAJour.formation.titre);
        }
        if (statut === "REFUSEE") {
            await sendInscriptionRefuseeEmail(inscriptionMiseAJour.apprenant.email, inscriptionMiseAJour.apprenant.prenom, inscriptionMiseAJour.formation.titre);
        }
    }
    catch (error) {
        console.error("Erreur lors de l'envoi de l'email d'inscription :", error);
    }
    return inscriptionMiseAJour;
}
export async function verifierInscriptionValidee(apprenantId, formationId) {
    const inscription = await prisma.inscription.findUnique({
        where: {
            apprenantId_formationId: {
                apprenantId,
                formationId,
            },
        },
    });
    if (!inscription) {
        throw new Error("Vous n'êtes pas inscrit à cette formation");
    }
    if (inscription.statut !== "VALIDEE") {
        throw new Error("Votre inscription à cette formation n'est pas validée");
    }
    return true;
}
export async function getMesInscriptions(apprenantId) {
    return prisma.inscription.findMany({
        where: {
            apprenantId,
        },
        orderBy: {
            dateInscription: "desc",
        },
        select: {
            id: true,
            statut: true,
            dateInscription: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                    description: true,
                    _count: {
                        select: {
                            cours: true,
                            sessions: true,
                        },
                    },
                },
            },
        },
    });
}
export async function getInscriptionsByFormation(params) {
    const { formationId, userId, role, page, limit, search, statut, } = params;
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
    // ADMIN : accès à toutes les formations
    // FORMATEUR : uniquement ses formations
    if (role === "FORMATEUR") {
        await verifierAccesFormation(userId, role, formationId);
    }
    else if (role !== "ADMIN") {
        throw new Error("Vous n'êtes pas autorisé à consulter ces inscriptions");
    }
    const skip = (page - 1) * limit;
    const where = {
        formationId,
        ...(statut !== undefined && {
            statut,
        }),
        ...(search !== undefined &&
            search.trim() !== "" && {
            apprenant: {
                OR: [
                    {
                        nom: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                    {
                        prenom: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                    {
                        telephone: {
                            contains: search.trim(),
                            mode: "insensitive",
                        },
                    },
                ],
            },
        }),
    };
    const [inscriptions, total,] = await Promise.all([
        prisma.inscription.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                dateInscription: "desc",
            },
            select: {
                id: true,
                statut: true,
                dateInscription: true,
                apprenant: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true,
                    },
                },
            },
        }),
        prisma.inscription.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        formation,
        inscriptions,
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
//# sourceMappingURL=inscription.service.js.map