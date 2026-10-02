import prisma from "../../config/prisma.js";
import { verifierAccesFormation } from "../affectations/affectation.service.js";
import { verifierInscriptionValidee } from "../inscriptions/inscription.service.js";
export async function creerExercice(coursId, data, userId, role) {
    const cours = await prisma.cours.findUnique({ where: { id: coursId } });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // Seul un formateur affecté à la formation (ou l'admin) peut ajouter un exercice
    await verifierAccesFormation(userId, role, cours.formationId);
    return prisma.exercice.create({
        data: {
            titre: data.titre,
            description: data.description,
            type: data.type,
            url: data.url,
            coursId,
        },
        select: {
            id: true,
            titre: true,
            description: true,
            type: true,
            url: true,
            createdAt: true,
            cours: {
                select: { id: true, titre: true, formationId: true },
            },
        },
    });
}
export async function getExercicesParCours(coursId, userId, role) {
    const cours = await prisma.cours.findUnique({ where: { id: coursId } });
    if (!cours) {
        throw new Error("Cours introuvable");
    }
    // L'apprenant doit être inscrit et validé ; formateur/admin doit être affecté
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, cours.formationId);
    }
    else {
        await verifierAccesFormation(userId, role, cours.formationId);
    }
    return prisma.exercice.findMany({
        where: { coursId },
        select: {
            id: true,
            titre: true,
            description: true,
            type: true,
            url: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
}
export async function getExerciceForDownload(exerciceId, userId, role) {
    const exercice = await prisma.exercice.findUnique({
        where: { id: exerciceId },
        select: {
            id: true,
            titre: true,
            url: true,
            cours: { select: { id: true, formationId: true } },
        },
    });
    if (!exercice) {
        throw new Error("Exercice introuvable");
    }
    if (role === "APPRENANT") {
        await verifierInscriptionValidee(userId, exercice.cours.formationId);
    }
    else {
        await verifierAccesFormation(userId, role, exercice.cours.formationId);
    }
    return exercice;
}
export async function supprimerExercice(exerciceId, userId, role) {
    const exercice = await prisma.exercice.findUnique({
        where: { id: exerciceId },
        include: { cours: true },
    });
    if (!exercice) {
        throw new Error("Exercice introuvable");
    }
    await verifierAccesFormation(userId, role, exercice.cours.formationId);
    await prisma.exercice.delete({ where: { id: exerciceId } });
    return exercice;
}
//# sourceMappingURL=exercice.service.js.map