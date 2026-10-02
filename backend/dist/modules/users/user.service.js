import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
export async function getUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            adresse: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
export async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            adresse: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    return user;
}
export async function updateUserRole(id, role) {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    return prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            updatedAt: true,
        },
    });
}
export async function createUserByAdmin(data) {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("Email déjà utilisé");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            password: hashedPassword,
            telephone: data.telephone,
            adresse: data.adresse,
            role: data.role,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            adresse: true,
            role: true,
            createdAt: true,
        },
    });
}
export async function getMonProfil(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            adresse: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    return user;
}
export async function updateMonProfil(userId, data) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    // Si l'adresse email change, vérifier
    // qu'elle n'est pas déjà utilisée.
    if (data.email !== undefined &&
        data.email !== user.email) {
        const emailExiste = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if (emailExiste) {
            throw new Error("Cette adresse email est déjà utilisée");
        }
    }
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            ...(data.nom !== undefined && {
                nom: data.nom,
            }),
            ...(data.prenom !== undefined && {
                prenom: data.prenom,
            }),
            ...(data.email !== undefined && {
                email: data.email,
            }),
            ...(data.telephone !== undefined && {
                telephone: data.telephone,
            }),
            ...(data.adresse !== undefined && {
                adresse: data.adresse,
            }),
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            adresse: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
export async function changerMotDePasse(userId, ancienMotDePasse, nouveauMotDePasse) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    const motDePasseCorrect = await bcrypt.compare(ancienMotDePasse, user.password);
    if (!motDePasseCorrect) {
        throw new Error("L'ancien mot de passe est incorrect");
    }
    const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: nouveauHash,
        },
    });
    return {
        message: "Mot de passe modifié avec succès",
    };
}
export async function getUsersPagines(params) {
    const { page, limit, search, role, } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(role !== undefined && {
            role,
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
        }),
    };
    const [utilisateurs, total,] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                adresse: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.user.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        utilisateurs,
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
export async function checkUserDeletion(userId, currentUserId) {
    // Empêcher l'admin connecté de supprimer son propre compte
    if (userId === currentUserId) {
        throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            _count: {
                select: {
                    formationsCreees: true,
                    affectations: true,
                    inscriptions: true,
                },
            },
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    // ======================================================
    // APPRENANT
    // ======================================================
    if (user.role === "APPRENANT") {
        const inscriptions = await prisma.inscription.findMany({
            where: {
                apprenantId: userId,
            },
            select: {
                id: true,
                statut: true,
                formation: {
                    select: {
                        id: true,
                        titre: true,
                    },
                },
                _count: {
                    select: {
                        presences: true,
                        progressions: true,
                        soumissions: true,
                    },
                },
            },
        });
        let presences = 0;
        let progressions = 0;
        let soumissions = 0;
        for (const inscription of inscriptions) {
            presences +=
                inscription._count.presences;
            progressions +=
                inscription._count.progressions;
            soumissions +=
                inscription._count.soumissions;
        }
        return {
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
            },
            peutSupprimer: true,
            avertissement: inscriptions.length > 0
                ? "Cet apprenant possède encore des données liées à des formations."
                : null,
            dependances: {
                inscriptions: inscriptions.length,
                presences,
                progressions,
                soumissions,
            },
            details: {
                inscriptions: inscriptions.map((inscription) => ({
                    id: inscription.id,
                    statut: inscription.statut,
                    formation: inscription.formation,
                })),
            },
        };
    }
    // ======================================================
    // FORMATEUR
    // ======================================================
    if (user.role === "FORMATEUR") {
        const affectations = await prisma.affectationFormateur.findMany({
            where: {
                formateurId: userId,
            },
            select: {
                id: true,
                formation: {
                    select: {
                        id: true,
                        titre: true,
                    },
                },
            },
        });
        return {
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
            },
            peutSupprimer: true,
            avertissement: affectations.length > 0
                ? "Ce formateur est encore affecté à une ou plusieurs formations."
                : null,
            dependances: {
                affectations: affectations.length,
            },
            details: {
                affectations,
            },
        };
    }
    // ======================================================
    // ADMIN
    // ======================================================
    const formationsCreees = await prisma.formation.findMany({
        where: {
            createurId: userId,
        },
        select: {
            id: true,
            titre: true,
        },
    });
    const peutSupprimer = formationsCreees.length === 0;
    return {
        user: {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
        },
        peutSupprimer,
        raison: !peutSupprimer
            ? "Cet administrateur est encore créateur d'une ou plusieurs formations. Réaffectez d'abord ces formations avant de supprimer son compte."
            : null,
        dependances: {
            formationsCreees: formationsCreees.length,
        },
        details: {
            formationsCreees,
        },
    };
}
export async function deleteUser(userId, currentUserId) {
    if (userId === currentUserId) {
        throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
            _count: {
                select: {
                    formationsCreees: true,
                },
            },
        },
    });
    if (!user) {
        throw new Error("Utilisateur introuvable");
    }
    // ======================================================
    // ADMIN
    // ======================================================
    if (user.role === "ADMIN") {
        if (user._count.formationsCreees > 0) {
            throw new Error("Cet administrateur est encore créateur d'une ou plusieurs formations");
        }
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });
        return {
            message: "Administrateur supprimé avec succès",
        };
    }
    // ======================================================
    // FORMATEUR
    // ======================================================
    if (user.role === "FORMATEUR") {
        await prisma.$transaction(async (tx) => {
            await tx.affectationFormateur.deleteMany({
                where: {
                    formateurId: userId,
                },
            });
            await tx.user.delete({
                where: {
                    id: userId,
                },
            });
        });
        return {
            message: "Formateur supprimé avec succès",
        };
    }
    // ======================================================
    // APPRENANT
    // ======================================================
    await prisma.$transaction(async (tx) => {
        const inscriptions = await tx.inscription.findMany({
            where: {
                apprenantId: userId,
            },
            select: {
                id: true,
            },
        });
        const inscriptionIds = inscriptions.map((inscription) => inscription.id);
        if (inscriptionIds.length > 0) {
            const soumissions = await tx.soumissionEvaluation.findMany({
                where: {
                    inscriptionId: {
                        in: inscriptionIds,
                    },
                },
                select: {
                    id: true,
                },
            });
            const soumissionIds = soumissions.map((soumission) => soumission.id);
            // 1. REPONSES QCM
            if (soumissionIds.length > 0) {
                await tx.reponseQCM.deleteMany({
                    where: {
                        soumissionId: {
                            in: soumissionIds,
                        },
                    },
                });
            }
            // 2. SOUMISSIONS
            await tx.soumissionEvaluation.deleteMany({
                where: {
                    inscriptionId: {
                        in: inscriptionIds,
                    },
                },
            });
            // 3. PRESENCES
            await tx.presence.deleteMany({
                where: {
                    inscriptionId: {
                        in: inscriptionIds,
                    },
                },
            });
            // 4. PROGRESSIONS
            await tx.progressionCours.deleteMany({
                where: {
                    inscriptionId: {
                        in: inscriptionIds,
                    },
                },
            });
            // 5. INSCRIPTIONS
            await tx.inscription.deleteMany({
                where: {
                    id: {
                        in: inscriptionIds,
                    },
                },
            });
        }
        // 6. USER
        await tx.user.delete({
            where: {
                id: userId,
            },
        });
    });
    return {
        message: "Apprenant supprimé avec succès",
    };
}
//# sourceMappingURL=user.service.js.map