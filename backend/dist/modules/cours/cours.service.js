import prisma from "../../config/prisma.js";
import { verifierAccesFormation, getAffectationsByFormateur } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
export async function createCours(data, userId, role) {
    await verifierAccesFormation(userId, role, data.formationId);
    return prisma.cours.create({
        data: {
            titre: data.titre,
            description: data.description,
            ordre: data.ordre,
            formationId: data.formationId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            ordre: true,
            createdAt: true,
            updatedAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
}
export async function getCoursByFormation(formationId, userId, role) {
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, formationId);
    }
    else {
        await verifierAccesFormation(userId, role, formationId);
    }
    return prisma.cours.findMany({
        where: {
            formationId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            ordre: true,
            createdAt: true,
            updatedAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
        orderBy: {
            ordre: "asc",
        },
    });
}
export async function getCoursById(coursId, userId, role) {
    const cours = await prisma.cours.findUnique({
        where: {
            id: coursId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            ordre: true,
            formationId: true,
            createdAt: true,
            updatedAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    await verifierAccesFormation(userId, role, cours.formationId);
    return cours;
}
export async function updateCours(coursId, data, userId, role) {
    // 1. Vérifier que le cours existe
    const cours = await prisma.cours.findUnique({
        where: {
            id: coursId,
        },
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // 2. Vérifier que l'utilisateur a accès à la formation
    await verifierAccesFormation(userId, role, cours.formationId);
    // 3. Modifier le cours
    return prisma.cours.update({
        where: {
            id: coursId,
        },
        data: {
            titre: data.titre,
            description: data.description,
            ordre: data.ordre,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            ordre: true,
            formationId: true,
            createdAt: true,
            updatedAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
}
export async function deleteCours(coursId, userId, role) {
    const cours = await prisma.cours.findUnique({
        where: {
            id: coursId,
        },
        include: {
            _count: {
                select: {
                    ressources: true,
                    evaluations: true,
                    progressionCours: true,
                },
            },
        },
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // Vérifie ADMIN ou FORMATEUR affecté à la formation
    await verifierAccesFormation(userId, role, cours.formationId);
    // Évite une suppression dangereuse
    if (cours._count.ressources > 0 ||
        cours._count.evaluations > 0 ||
        cours._count.progressionCours > 0) {
        throw new Error("Impossible de supprimer ce cours car il contient déjà des données associées");
    }
    await prisma.cours.delete({
        where: {
            id: coursId,
        },
    });
}
export async function getCoursByFormationPagines(params) {
    const { formationId, userId, role, page, limit, search, } = params;
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
    // Contrôle d'accès
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, formationId);
    }
    else {
        await verifierAccesFormation(userId, role, formationId);
    }
    const skip = (page - 1) * limit;
    const where = {
        formationId,
        ...(search !== undefined &&
            search.trim() !== "" && {
            OR: [
                {
                    titre: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
            ],
        }),
    };
    const [cours, total] = await Promise.all([
        prisma.cours.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                ordre: "asc",
            },
            select: {
                id: true,
                titre: true,
                description: true,
                ordre: true,
                formationId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        ressources: true,
                        evaluations: true,
                        progressionCours: true,
                    },
                },
            },
        }),
        prisma.cours.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        formation,
        cours,
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
export async function getMesCoursFormateur(formateurId) {
    const affectations = await getAffectationsByFormateur(formateurId);
    const formationIds = affectations.map((affectation) => affectation.formation.id);
    if (formationIds.length === 0) {
        return [];
    }
    const cours = await prisma.cours.findMany({
        where: {
            formationId: {
                in: formationIds,
            },
        },
        orderBy: {
            ordre: "asc",
        },
        select: {
            id: true,
            titre: true,
            description: true,
            ordre: true,
            formationId: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
            _count: {
                select: {
                    ressources: true,
                    evaluations: true,
                },
            },
        },
    });
    return cours;
}
//# sourceMappingURL=cours.service.js.map