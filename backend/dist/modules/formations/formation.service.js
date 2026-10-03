import prisma from "../../config/prisma.js";
export async function createFormation(data) {
    return prisma.formation.create({
        data: {
            titre: data.titre,
            description: data.description,
            prix: data.prix,
            createurId: data.createurId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
            createdAt: true,
            updatedAt: true,
            createur: {
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
export async function getFormations() {
    return prisma.formation.findMany({
        select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
            createdAt: true,
            updatedAt: true,
            createur: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
// Détail d'une formation
export async function getFormationById(id) {
    const formation = await prisma.formation.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
            createdAt: true,
            updatedAt: true,
            createur: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    cours: true,
                    sessions: true,
                    affectations: true,
                    inscriptions: true,
                },
            },
        },
    });
    if (!formation) {
        throw new Error("Formation introuvable");
    }
    return formation;
}
// Modification d'une formation
export async function updateFormation(id, data) {
    const formation = await prisma.formation.findUnique({
        where: {
            id,
        },
    });
    if (!formation) {
        throw new Error("Formation introuvable");
    }
    return prisma.formation.update({
        where: {
            id,
        },
        data: {
            ...(data.titre !== undefined && {
                titre: data.titre,
            }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.prix !== undefined && {
                prix: data.prix,
            }),
        },
        select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
// Suppression sécurisée d'une formation
export async function deleteFormation(id) {
    const formation = await prisma.formation.findUnique({
        where: {
            id,
        },
        include: {
            _count: {
                select: {
                    cours: true,
                    sessions: true,
                    affectations: true,
                    inscriptions: true,
                },
            },
        },
    });
    if (!formation) {
        throw new Error("Formation introuvable");
    }
    const contientDesDonnees = formation._count.cours > 0 ||
        formation._count.sessions > 0 ||
        formation._count.affectations > 0 ||
        formation._count.inscriptions > 0;
    if (contientDesDonnees) {
        throw new Error("Impossible de supprimer cette formation car elle contient encore des cours, sessions, affectations ou inscriptions");
    }
    await prisma.formation.delete({
        where: {
            id,
        },
    });
    return {
        message: "Formation supprimée avec succès",
    };
}
export async function getFormationsPagines(params) {
    const { page, limit, search, } = params;
    const skip = (page - 1) * limit;
    const where = {
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
    const [formations, total,] = await Promise.all([
        prisma.formation.findMany({
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
                prix: true,
                createdAt: true,
                updatedAt: true,
                createur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        cours: true,
                        sessions: true,
                        affectations: true,
                        inscriptions: true,
                    },
                },
            },
        }),
        prisma.formation.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        formations,
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
//# sourceMappingURL=formation.service.js.map