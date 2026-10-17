import { randomBytes } from "node:crypto";
import prisma from "../../config/prisma.js";
import { updateStatutInscription } from "../inscriptions/inscription.service.js";
import { confirmerTransaction, initierTransaction, normaliserTelephone, } from "./paiement.provider.js";
const DUREE_CODE_MINUTES = 5;
// ======================================================
// OUTILS
// ======================================================
const selectPaiement = {
    id: true,
    reference: true,
    montant: true,
    devise: true,
    methode: true,
    telephone: true,
    statut: true,
    motifEchec: true,
    expireAt: true,
    confirmeAt: true,
    createdAt: true,
    inscription: {
        select: {
            id: true,
            statut: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                },
            },
        },
    },
};
function genererReference() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffixe = randomBytes(3).toString("hex").toUpperCase();
    return `PAY-${date}-${suffixe}`;
}
// Exemple : 0341234567 devient 034•••••67
function masquerTelephone(telephone) {
    return `${telephone.slice(0, 3)}•••••${telephone.slice(-2)}`;
}
// Ne jamais renvoyer le numéro complet à l'interface
function versPublic(paiement) {
    const { telephone, ...reste } = paiement;
    return {
        ...reste,
        telephone: masquerTelephone(telephone),
    };
}
export async function initierPaiement(apprenantId, data) {
    // Même clé d'idempotence : on renvoie le paiement déjà créé
    if (data.cleIdempotence) {
        const existant = await prisma.paiement.findFirst({
            where: {
                cleIdempotence: data.cleIdempotence,
                inscription: {
                    apprenantId,
                },
            },
            select: selectPaiement,
        });
        if (existant) {
            return {
                paiement: versPublic(existant),
                message: "Ce paiement a déjà été initié",
            };
        }
    }
    const inscription = await prisma.inscription.findUnique({
        where: {
            apprenantId_formationId: {
                apprenantId,
                formationId: data.formationId,
            },
        },
        select: {
            id: true,
            statut: true,
            formation: {
                select: {
                    id: true,
                    titre: true,
                    prix: true,
                },
            },
        },
    });
    if (!inscription) {
        throw new Error("Inscription introuvable : inscrivez-vous d'abord à la formation");
    }
    if (inscription.statut !== "EN_ATTENTE") {
        throw new Error("Cette inscription n'est plus en attente : paiement impossible");
    }
    // Le montant vient toujours de la base, jamais de l'interface
    const montant = Number(inscription.formation.prix);
    if (!(montant > 0)) {
        throw new Error("Aucun paiement requis pour cette formation");
    }
    const reference = genererReference();
    // Appel au fournisseur simulé (il valide le numéro)
    const transaction = await initierTransaction({
        reference,
        montant,
        devise: "MGA",
        methode: data.methode,
        telephone: data.telephone,
    });
    const expireAt = new Date(Date.now() + DUREE_CODE_MINUTES * 60 * 1000);
    const paiement = await prisma.$transaction(async (tx) => {
        // Un seul paiement en attente à la fois pour une inscription
        await tx.paiement.updateMany({
            where: {
                inscriptionId: inscription.id,
                statut: "EN_ATTENTE",
            },
            data: {
                statut: "ANNULE",
                motifEchec: "Remplacé par un nouveau paiement",
            },
        });
        return tx.paiement.create({
            data: {
                reference,
                cleIdempotence: data.cleIdempotence,
                inscriptionId: inscription.id,
                montant,
                devise: "MGA",
                methode: data.methode,
                telephone: normaliserTelephone(data.telephone),
                transactionId: transaction.transactionId,
                expireAt,
            },
            select: selectPaiement,
        });
    });
    return {
        paiement: versPublic(paiement),
        message: transaction.message,
        // Présent seulement en développement (simule le SMS)
        ...(transaction.codeSimulation && {
            codeSimulation: transaction.codeSimulation,
        }),
    };
}
// ======================================================
// CONFIRMER UN PAIEMENT
// ======================================================
export async function confirmerPaiement(apprenantId, paiementId, code) {
    const paiement = await prisma.paiement.findFirst({
        where: {
            id: paiementId,
            inscription: {
                apprenantId,
            },
        },
        select: {
            id: true,
            statut: true,
            methode: true,
            telephone: true,
            transactionId: true,
            expireAt: true,
            inscriptionId: true,
            inscription: {
                select: {
                    statut: true,
                },
            },
        },
    });
    if (!paiement) {
        throw new Error("Paiement introuvable");
    }
    if (paiement.statut !== "EN_ATTENTE") {
        throw new Error("Ce paiement a déjà été traité");
    }
    if (paiement.inscription.statut !== "EN_ATTENTE") {
        throw new Error("Cette inscription n'est plus en attente : paiement impossible");
    }
    if (paiement.expireAt < new Date()) {
        await prisma.paiement.update({
            where: {
                id: paiementId,
            },
            data: {
                statut: "ECHOUE",
                motifEchec: "Code de confirmation expiré",
            },
        });
        throw new Error("Le code de confirmation a expiré : recommencez le paiement");
    }
    if (!paiement.transactionId) {
        throw new Error("Transaction invalide");
    }
    const resultat = await confirmerTransaction({
        transactionId: paiement.transactionId,
        methode: paiement.methode,
        telephone: paiement.telephone,
        code,
    });
    if (resultat.statut === "CODE_INVALIDE") {
        throw new Error("Code de confirmation incorrect");
    }
    // Le fournisseur refuse le paiement (solde insuffisant, etc.)
    if (resultat.statut === "ECHOUE") {
        const echoue = await prisma.paiement.update({
            where: {
                id: paiementId,
            },
            data: {
                statut: "ECHOUE",
                motifEchec: resultat.motif,
            },
            select: selectPaiement,
        });
        return {
            paiement: versPublic(echoue),
            message: `Paiement refusé : ${resultat.motif}`,
        };
    }
    // Paiement réussi : on le marque, puis on valide l'inscription
    const reussi = await prisma.paiement.update({
        where: {
            id: paiementId,
        },
        data: {
            statut: "REUSSI",
            confirmeAt: new Date(),
        },
        select: selectPaiement,
    });
    // Réutilise votre logique existante (statut + email de validation)
    await updateStatutInscription(paiement.inscriptionId, "VALIDEE");
    return {
        paiement: versPublic({
            ...reussi,
            inscription: {
                ...reussi.inscription,
                statut: "VALIDEE",
            },
        }),
        message: "Paiement réussi : votre inscription est validée",
    };
}
// ======================================================
// CONSULTER
// ======================================================
export async function getPaiementById(paiementId, userId, role) {
    let where;
    if (role === "ADMIN") {
        where = { id: paiementId };
    }
    else if (role === "APPRENANT") {
        where = {
            id: paiementId,
            inscription: {
                apprenantId: userId,
            },
        };
    }
    else {
        throw new Error("Vous n'êtes pas autorisé à consulter ce paiement");
    }
    const paiement = await prisma.paiement.findFirst({
        where,
        select: selectPaiement,
    });
    if (!paiement) {
        throw new Error("Paiement introuvable");
    }
    return versPublic(paiement);
}
export async function getMesPaiements(apprenantId) {
    const paiements = await prisma.paiement.findMany({
        where: {
            inscription: {
                apprenantId,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        select: selectPaiement,
    });
    return paiements.map(versPublic);
}
// ======================================================
// ADMIN : LISTE DES PAIEMENTS
// ======================================================
const selectPaiementAdmin = {
    id: true,
    reference: true,
    montant: true,
    devise: true,
    methode: true,
    telephone: true,
    statut: true,
    motifEchec: true,
    createdAt: true,
    confirmeAt: true,
    inscription: {
        select: {
            id: true,
            statut: true,
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
    },
};
export async function getPaiementsAdmin(params) {
    const { page, limit, search, statut, methode } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(statut !== undefined && {
            statut,
        }),
        ...(methode !== undefined && {
            methode,
        }),
        ...(search !== undefined &&
            search.trim() !== "" && {
            OR: [
                {
                    reference: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    inscription: {
                        apprenant: {
                            nom: {
                                contains: search.trim(),
                                mode: "insensitive",
                            },
                        },
                    },
                },
                {
                    inscription: {
                        apprenant: {
                            prenom: {
                                contains: search.trim(),
                                mode: "insensitive",
                            },
                        },
                    },
                },
                {
                    inscription: {
                        apprenant: {
                            email: {
                                contains: search.trim(),
                                mode: "insensitive",
                            },
                        },
                    },
                },
                {
                    inscription: {
                        formation: {
                            titre: {
                                contains: search.trim(),
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ],
        }),
    };
    const [paiements, total, groupes] = await Promise.all([
        prisma.paiement.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: selectPaiementAdmin,
        }),
        prisma.paiement.count({
            where,
        }),
        // Statistiques globales, indépendantes des filtres
        prisma.paiement.groupBy({
            by: ["statut"],
            _count: {
                _all: true,
            },
            _sum: {
                montant: true,
            },
        }),
    ]);
    const stats = {
        totalEncaisse: 0,
        reussis: 0,
        echoues: 0,
        enAttente: 0,
        annules: 0,
    };
    for (const groupe of groupes) {
        const nombre = groupe._count._all;
        if (groupe.statut === "REUSSI") {
            stats.reussis = nombre;
            stats.totalEncaisse = Number(groupe._sum.montant ?? 0);
        }
        else if (groupe.statut === "ECHOUE") {
            stats.echoues = nombre;
        }
        else if (groupe.statut === "EN_ATTENTE") {
            stats.enAttente = nombre;
        }
        else if (groupe.statut === "ANNULE") {
            stats.annules = nombre;
        }
    }
    const totalPages = Math.ceil(total / limit);
    return {
        paiements: paiements.map(versPublic),
        stats,
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
//# sourceMappingURL=paiement.service.js.map