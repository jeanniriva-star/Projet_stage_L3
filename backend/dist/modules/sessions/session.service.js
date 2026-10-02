import { randomUUID } from "node:crypto";
import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
import { createJaasToken, getJaasDomain, getJaasRoomName, } from "./jaas.service.js";
export async function createSession(data, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut créer une session");
    }
    await verifierAccesFormation(userId, role, data.formationId);
    if (data.dateFin <=
        data.dateDebut) {
        throw new Error("La date de fin doit être postérieure à la date de début");
    }
    const roomName = `stage-l3-${randomUUID()}`;
    const session = await prisma.session.create({
        data: {
            titre: data.titre,
            description: data.description,
            dateDebut: data.dateDebut,
            dateFin: data.dateFin,
            roomName,
            formationId: data.formationId,
            statut: "NON_DEMARREE",
        },
        select: {
            id: true,
            titre: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            roomName: true,
            createdAt: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    });
    return {
        ...session,
        roomName: getJaasRoomName(session.roomName),
    };
}
export async function getSessionsByFormation(params) {
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
    const [sessions, total,] = await Promise.all([
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
            hasNextPage: page <
                totalPages,
        },
    };
}
export async function joinSession(sessionId, userId, role) {
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            titre: true,
            roomName: true,
            dateDebut: true,
            dateFin: true,
            formationId: true,
            statut: true,
            startedAt: true,
            endedAt: true,
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    if (session.statut ===
        "NON_DEMARREE") {
        throw new Error("La visioconférence n'a pas encore été démarrée par le formateur");
    }
    if (session.statut ===
        "TERMINEE") {
        throw new Error("Cette visioconférence est terminée");
    }
    let moderator = false;
    if (role === "FORMATEUR") {
        await verifierAccesFormation(userId, role, session.formationId);
        moderator = true;
    }
    else if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, session.formationId);
        const inscription = await prisma.inscription.findUnique({
            where: {
                apprenantId_formationId: {
                    apprenantId: userId,
                    formationId: session.formationId,
                },
            },
            select: {
                id: true,
                statut: true,
            },
        });
        if (!inscription) {
            throw new Error("Inscription introuvable");
        }
        if (inscription.statut !==
            "VALIDEE") {
            throw new Error("Votre inscription n'est pas validée");
        }
        await prisma.presence.upsert({
            where: {
                inscriptionId_sessionId: {
                    inscriptionId: inscription.id,
                    sessionId: session.id,
                },
            },
            update: {
                present: true,
            },
            create: {
                inscriptionId: inscription.id,
                sessionId: session.id,
                present: true,
            },
        });
        moderator = false;
    }
    else {
        throw new Error("Vous n'êtes pas autorisé à rejoindre cette session");
    }
    const utilisateur = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
        },
    });
    if (!utilisateur) {
        throw new Error("Utilisateur introuvable");
    }
    const jaasRoomName = getJaasRoomName(session.roomName);
    const jaasToken = createJaasToken({
        userId: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        roomName: session.roomName,
        moderator,
    });
    const domain = getJaasDomain();
    return {
        sessionId: session.id,
        titre: session.titre,
        statut: session.statut,
        roomName: jaasRoomName,
        domain,
        jwt: jaasToken,
        moderator,
        jitsiUrl: `https://${domain}/${jaasRoomName}`,
        dateDebut: session.dateDebut,
        dateFin: session.dateFin,
        startedAt: session.startedAt,
    };
}
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
export async function updateSession(sessionId, data, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut modifier une session");
    }
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    await verifierAccesFormation(userId, role, session.formationId);
    const nouvelleDateDebut = data.dateDebut ??
        session.dateDebut;
    const nouvelleDateFin = data.dateFin ??
        session.dateFin;
    if (nouvelleDateFin <=
        nouvelleDateDebut) {
        throw new Error("La date de fin doit être postérieure à la date de début");
    }
    return prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            ...(data.titre !== undefined && {
                titre: data.titre,
            }),
            ...(data.description !==
                undefined && {
                description: data.description,
            }),
            ...(data.dateDebut !==
                undefined && {
                dateDebut: data.dateDebut,
            }),
            ...(data.dateFin !==
                undefined && {
                dateFin: data.dateFin,
            }),
        },
        select: {
            id: true,
            titre: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            formationId: true,
            createdAt: true,
        },
    });
}
export async function deleteSession(sessionId, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut supprimer une session");
    }
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        include: {
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
    await verifierAccesFormation(userId, role, session.formationId);
    if (session._count.presences >
        0) {
        throw new Error("Impossible de supprimer cette session car des présences y sont déjà enregistrées");
    }
    await prisma.session.delete({
        where: {
            id: sessionId,
        },
    });
    return {
        message: "Session supprimée avec succès",
    };
}
export async function startSession(sessionId, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut démarrer une session");
    }
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            titre: true,
            roomName: true,
            dateDebut: true,
            dateFin: true,
            formationId: true,
            statut: true,
            startedAt: true,
            endedAt: true,
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    await verifierAccesFormation(userId, role, session.formationId);
    if (session.statut ===
        "EN_COURS") {
        throw new Error("Cette session est déjà en cours");
    }
    if (session.statut ===
        "TERMINEE") {
        throw new Error("Cette session est déjà terminée");
    }
    const maintenant = new Date();
    const sessionMiseAJour = await prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            statut: "EN_COURS",
            startedAt: maintenant,
            endedAt: null,
        },
        select: {
            id: true,
            titre: true,
            roomName: true,
            statut: true,
            startedAt: true,
            dateDebut: true,
            dateFin: true,
        },
    });
    const domain = getJaasDomain();
    const roomName = getJaasRoomName(sessionMiseAJour.roomName);
    return {
        ...sessionMiseAJour,
        roomName,
        domain,
        jitsiUrl: `https://${domain}/${roomName}`,
    };
}
export async function endSession(sessionId, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut terminer une session");
    }
    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        select: {
            id: true,
            formationId: true,
            statut: true,
        },
    });
    if (!session) {
        throw new Error("Session introuvable");
    }
    await verifierAccesFormation(userId, role, session.formationId);
    if (session.statut ===
        "NON_DEMARREE") {
        throw new Error("Cette session n'a pas encore démarré");
    }
    if (session.statut ===
        "TERMINEE") {
        throw new Error("Cette session est déjà terminée");
    }
    return prisma.$transaction(async (tx) => {
        const inscriptions = await tx.inscription.findMany({
            where: {
                formationId: session.formationId,
                statut: "VALIDEE",
            },
            select: {
                id: true,
            },
        });
        const presencesExistantes = await tx.presence.findMany({
            where: {
                sessionId,
            },
            select: {
                inscriptionId: true,
            },
        });
        const inscriptionsAvecPresence = new Set(presencesExistantes.map((presence) => presence.inscriptionId));
        const inscriptionsAbsentes = inscriptions.filter((inscription) => !inscriptionsAvecPresence.has(inscription.id));
        if (inscriptionsAbsentes.length >
            0) {
            await tx.presence.createMany({
                data: inscriptionsAbsentes.map((inscription) => ({
                    inscriptionId: inscription.id,
                    sessionId,
                    present: false,
                })),
                skipDuplicates: true,
            });
        }
        return tx.session.update({
            where: {
                id: sessionId,
            },
            data: {
                statut: "TERMINEE",
                endedAt: new Date(),
            },
            select: {
                id: true,
                titre: true,
                statut: true,
                startedAt: true,
                endedAt: true,
            },
        });
    });
}
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
    if (session.statut !==
        "TERMINEE") {
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
                present: presence?.present ??
                    false,
                dateMarquage: presence?.dateMarquage ??
                    null,
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
    if (role !== "ADMIN" &&
        role !== "FORMATEUR") {
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
//# sourceMappingURL=session.service.js.map