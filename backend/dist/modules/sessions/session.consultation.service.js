import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
export async function getSessionsByFormation(params) {
    const { formationId, userId, role, page, limit, search, statut } = params;
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
    if (role === "FORMATEUR") {
        await verifierAccesFormation(userId, role, formationId);
    }
    else if (role !== "ADMIN") {
        throw new Error("Vous n'êtes pas autorisé à consulter ces sessions");
    }
    const where = {
        formationId,
        ...(statut !== undefined && {
            statut,
        }),
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
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
        prisma.session.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                dateDebut: "desc",
            },
            select: {
                id: true,
                titre: true,
                description: true,
                dateDebut: true,
                dateFin: true,
                formationId: true,
                createdAt: true,
                statut: true,
                startedAt: true,
                endedAt: true,
                _count: {
                    select: {
                        presences: true,
                    },
                },
            },
        }),
        prisma.session.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        formation,
        sessions,
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
// ======================================================
// MES SESSIONS (APPRENANT)
// ======================================================
export async function getMesSessions(userId, role) {
    if (role !== "APPRENANT") {
        throw new Error("Seul un apprenant peut consulter ses sessions");
    }
    return prisma.session.findMany({
        where: {
            formation: {
                inscriptions: {
                    some: {
                        apprenantId: userId,
                        statut: "VALIDEE",
                    },
                },
            },
        },
        orderBy: {
            dateDebut: "asc",
        },
        select: {
            id: true,
            titre: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            statut: true,
            startedAt: true,
            endedAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
}
// ======================================================
// DÉTAIL D'UNE SESSION
// ======================================================
export async function getSessionById(sessionId, userId, role) {
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            formationId: true,
            createdAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
            _count: {
                select: {
                    presences: true,
                },
            },
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    if (role === "FORMATEUR") {
        await verifierAccesFormation(userId, role, session.formationId);
    }
    else if (role !== "ADMIN") {
        throw new Error("Vous n'êtes pas autorisé à consulter cette session");
    }
    return session;
}
// ======================================================
// PRÉSENCES D'UNE SESSION
// ======================================================
export async function getPresencesSession(sessionId, userId, role) {
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            titre: true,
            statut: true,
            formationId: true,
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    if (session.statut !== "TERMINEE") {
        throw new Error("La liste des présences est disponible uniquement après la fin de la session");
    }
    // ====================================================
    // APPRENANT : uniquement sa propre présence
    // ====================================================
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, session.formationId);
        const presence = await prisma.presence.findFirst({
            where: {
                sessionId,
                inscription: {
                    apprenantId: userId,
                },
            },
            select: {
                id: true,
                present: true,
                dateMarquage: true,
            },
        });
        return {
            session: {
                id: session.id,
                titre: session.titre,
                statut: session.statut,
            },
            maPresence: {
                present: presence?.present ?? false,
                dateMarquage: presence?.dateMarquage ?? null,
            },
        };
    }
    // ====================================================
    // FORMATEUR
    // ====================================================
    if (role === "FORMATEUR") {
        await verifierAccesFormation(userId, role, session.formationId);
    }
    // ====================================================
    // ADMIN / sécurité
    // ====================================================
    if (role !== "ADMIN" && role !== "FORMATEUR") {
        throw new Error("Vous n'êtes pas autorisé à consulter les présences");
    }
    // ====================================================
    // FORMATEUR / ADMIN : liste complète
    // ====================================================
    const presences = await prisma.presence.findMany({
        where: {
            sessionId,
        },
        orderBy: [
            {
                present: "desc",
            },
            {
                inscription: {
                    apprenant: {
                        nom: "asc",
                    },
                },
            },
        ],
        select: {
            id: true,
            present: true,
            dateMarquage: true,
            inscription: {
                select: {
                    id: true,
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
    });
    const presents = presences.filter((presence) => presence.present);
    const absents = presences.filter((presence) => !presence.present);
    return {
        session: {
            id: session.id,
            titre: session.titre,
            statut: session.statut,
        },
        statistiques: {
            total: presences.length,
            presents: presents.length,
            absents: absents.length,
        },
        presences,
    };
}
//# sourceMappingURL=session.consultation.service.js.map