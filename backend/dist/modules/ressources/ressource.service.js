import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
export async function createRessource(data, userId, role) {
    // Vérifier que le cours existe
    const cours = await prisma.cours.findUnique({
        where: {
            id: data.coursId,
        },
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // Vérifier que l'ADMIN ou le FORMATEUR
    // a le droit de gérer cette formation
    await verifierAccesFormation(userId, role, cours.formationId);
    return prisma.ressourcePedagogique.create({
        data: {
            nom: data.nom,
            type: data.type,
            url: data.url,
            coursId: data.coursId,
        },
        select: {
            id: true,
            nom: true,
            type: true,
            url: true,
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
export async function getRessourcesByCours(coursId, userId, role) {
    const cours = await prisma.cours.findUnique({
        where: {
            id: coursId,
        },
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, cours.formationId);
    }
    else {
        await verifierAccesFormation(userId, role, cours.formationId);
    }
    return prisma.ressourcePedagogique.findMany({
        where: {
            coursId,
        },
        select: {
            id: true,
            nom: true,
            type: true,
            url: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function updateRessource(ressourceId, data, userId, role) {
    const ressource = await prisma.ressourcePedagogique.findUnique({
        where: {
            id: ressourceId,
        },
        include: {
            cours: true,
        },
    });
    if (!ressource) {
        throw new Error("Ressource introuvable");
    }
    await verifierAccesFormation(userId, role, ressource.cours.formationId);
    return prisma.ressourcePedagogique.update({
        where: {
            id: ressourceId,
        },
        data: {
            nom: data.nom,
            type: data.type,
            url: data.url,
        },
        select: {
            id: true,
            nom: true,
            type: true,
            url: true,
            createdAt: true,
            cours: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
}
export async function deleteRessource(ressourceId, userId, role) {
    const ressource = await prisma.ressourcePedagogique.findUnique({
        where: {
            id: ressourceId,
        },
        include: {
            cours: true,
        },
    });
    if (!ressource) {
        throw new Error("Ressource introuvable");
    }
    await verifierAccesFormation(userId, role, ressource.cours.formationId);
    await prisma.ressourcePedagogique.delete({
        where: {
            id: ressourceId,
        },
    });
    return ressource;
}
export async function getRessourcesByCoursPaginees(params) {
    const { coursId, userId, role, page, limit, search, type, } = params;
    // Vérifier que le cours existe
    const cours = await prisma.cours.findUnique({
        where: {
            id: coursId,
        },
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
    });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // Contrôle d'accès
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, cours.formationId);
    }
    else {
        await verifierAccesFormation(userId, role, cours.formationId);
    }
    const skip = (page - 1) * limit;
    const where = {
        coursId,
        ...(type !== undefined &&
            type.trim() !== "" && {
            type: {
                equals: type.trim(),
                mode: "insensitive",
            },
        }),
        ...(search !== undefined &&
            search.trim() !== "" && {
            OR: [
                {
                    nom: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    type: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    url: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
            ],
        }),
    };
    const [ressources, totalFiltre, totalRessources, ressourcesParType,] = await Promise.all([
        // Ressources correspondant aux filtres actuels
        prisma.ressourcePedagogique.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                nom: true,
                type: true,
                url: true,
                coursId: true,
                createdAt: true,
            },
        }),
        // Nombre de ressources correspondant
        // à la recherche / au filtre actuel
        prisma.ressourcePedagogique.count({
            where,
        }),
        // Nombre total de ressources du cours
        prisma.ressourcePedagogique.count({
            where: {
                coursId,
            },
        }),
        // Nombre de ressources par type
        prisma.ressourcePedagogique.groupBy({
            by: ["type"],
            where: {
                coursId,
            },
            _count: {
                _all: true,
            },
        }),
    ]);
    const parType = {};
    for (const item of ressourcesParType) {
        const typeNormalise = item.type.trim().toUpperCase();
        parType[typeNormalise] =
            (parType[typeNormalise] ?? 0) +
                item._count._all;
    }
    const totalPages = Math.ceil(totalFiltre / limit);
    return {
        cours: {
            id: cours.id,
            titre: cours.titre,
            formation: {
                id: cours.formation.id,
                titre: cours.formation.titre,
            },
        },
        statistiques: {
            total: totalRessources,
            parType,
        },
        ressources,
        pagination: {
            page,
            limit,
            total: totalFiltre,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
}
export async function getRessourceForDownload(ressourceId, userId, role) {
    const ressource = await prisma.ressourcePedagogique.findUnique({
        where: {
            id: ressourceId,
        },
        select: {
            id: true,
            nom: true,
            type: true,
            url: true,
            cours: {
                select: {
                    id: true,
                    formationId: true,
                },
            },
        },
    });
    if (!ressource) {
        throw new Error("Ressource introuvable");
    }
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, ressource.cours.formationId);
    }
    else {
        await verifierAccesFormation(userId, role, ressource.cours.formationId);
    }
    return ressource;
}
//# sourceMappingURL=ressource.service.js.map