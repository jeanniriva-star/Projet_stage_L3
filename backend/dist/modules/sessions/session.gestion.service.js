import { randomUUID } from "node:crypto";
import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { getJaasRoomName } from "./jaas.service.js";
export async function createSession(data, userId, role) {
    if (role !== "FORMATEUR") {
        throw new Error("Seul un formateur peut créer une session");
    }
    await verifierAccesFormation(userId, role, data.formationId);
    if (data.dateFin <= data.dateDebut) {
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
    const nouvelleDateDebut = data.dateDebut ?? session.dateDebut;
    const nouvelleDateFin = data.dateFin ?? session.dateFin;
    if (nouvelleDateFin <= nouvelleDateDebut) {
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
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.dateDebut !== undefined && {
                dateDebut: data.dateDebut,
            }),
            ...(data.dateFin !== undefined && {
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
// ======================================================
// SUPPRESSION
// ======================================================
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
    if (session._count.presences > 0) {
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
//# sourceMappingURL=session.gestion.service.js.map