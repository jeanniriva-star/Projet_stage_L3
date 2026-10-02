import * as userService from "./user.service.js";
export async function getUsers(req, res) {
    try {
        const pageRaw = req.query.page;
        const limitRaw = req.query.limit;
        const searchRaw = req.query.search;
        const roleRaw = req.query.role;
        const page = typeof pageRaw === "string"
            ? Number(pageRaw)
            : 1;
        const limit = typeof limitRaw === "string"
            ? Number(limitRaw)
            : 10;
        if (!Number.isInteger(page) ||
            page < 1) {
            return res.status(400).json({
                message: "Le numéro de page doit être un entier supérieur ou égal à 1",
            });
        }
        if (!Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100) {
            return res.status(400).json({
                message: "La limite doit être comprise entre 1 et 100",
            });
        }
        const search = typeof searchRaw === "string"
            ? searchRaw.trim()
            : undefined;
        const rolesAutorises = [
            "ADMIN",
            "FORMATEUR",
            "APPRENANT",
        ];
        let role;
        if (roleRaw !== undefined) {
            if (typeof roleRaw !== "string" ||
                !rolesAutorises.includes(roleRaw)) {
                return res.status(400).json({
                    message: "Rôle invalide",
                });
            }
            role = roleRaw;
        }
        const resultat = await userService.getUsersPagines({
            page,
            limit,
            ...(search && {
                search,
            }),
            ...(role && {
                role,
            }),
        });
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
export async function getUserById(req, res) {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant utilisateur invalide",
            });
        }
        const user = await userService.getUserById(id);
        return res.status(200).json({
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(404).json({
            message,
        });
    }
}
export async function updateUserRole(req, res) {
    try {
        const id = req.params.id;
        const role = req.body.role;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant utilisateur invalide",
            });
        }
        const rolesAutorises = [
            "ADMIN",
            "FORMATEUR",
            "APPRENANT",
        ];
        if (!rolesAutorises.includes(role)) {
            return res.status(400).json({
                message: "Rôle invalide",
            });
        }
        const user = await userService.updateUserRole(id, role);
        return res.status(200).json({
            message: "Rôle modifié avec succès",
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(404).json({
            message,
        });
    }
}
export async function createUserByAdmin(req, res) {
    try {
        const { nom, prenom, email, password, telephone, adresse, role } = req.body;
        if (!nom ||
            !prenom ||
            !email ||
            !password ||
            !telephone ||
            !adresse ||
            !role) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires",
            });
        }
        if (role !== "ADMIN" && role !== "FORMATEUR") {
            return res.status(400).json({
                message: "Le rôle doit être ADMIN ou FORMATEUR",
            });
        }
        const user = await userService.createUserByAdmin({
            nom,
            prenom,
            email,
            password,
            telephone,
            adresse,
            role,
        });
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(400).json({
            message,
        });
    }
}
export async function getMonProfil(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const user = await userService.getMonProfil(req.user.id);
        return res.status(200).json({
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function updateMonProfil(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const { nom, prenom, email, telephone, adresse, } = req.body;
        if (nom === undefined &&
            prenom === undefined &&
            email === undefined &&
            telephone === undefined &&
            adresse === undefined) {
            return res.status(400).json({
                message: "Aucune modification n'a été fournie",
            });
        }
        if (nom !== undefined &&
            (typeof nom !== "string" || nom.trim() === "")) {
            return res.status(400).json({
                message: "Le nom est invalide",
            });
        }
        if (prenom !== undefined &&
            (typeof prenom !== "string" ||
                prenom.trim() === "")) {
            return res.status(400).json({
                message: "Le prénom est invalide",
            });
        }
        if (email !== undefined &&
            (typeof email !== "string" ||
                email.trim() === "" ||
                !email.includes("@"))) {
            return res.status(400).json({
                message: "L'adresse email est invalide",
            });
        }
        if (telephone !== undefined &&
            (typeof telephone !== "string" ||
                telephone.trim() === "")) {
            return res.status(400).json({
                message: "Le téléphone est invalide",
            });
        }
        if (adresse !== undefined &&
            (typeof adresse !== "string" ||
                adresse.trim() === "")) {
            return res.status(400).json({
                message: "L'adresse est invalide",
            });
        }
        const user = await userService.updateMonProfil(req.user.id, {
            ...(nom !== undefined && {
                nom: nom.trim(),
            }),
            ...(prenom !== undefined && {
                prenom: prenom.trim(),
            }),
            ...(email !== undefined && {
                email: email.trim(),
            }),
            ...(telephone !== undefined && {
                telephone: telephone.trim(),
            }),
            ...(adresse !== undefined && {
                adresse: adresse.trim(),
            }),
        });
        return res.status(200).json({
            message: "Profil modifié avec succès",
            user,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message ===
            "Cette adresse email est déjà utilisée") {
            return res.status(409).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function changerMotDePasse(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const { ancienMotDePasse, nouveauMotDePasse, } = req.body;
        if (typeof ancienMotDePasse !== "string" ||
            ancienMotDePasse.length === 0) {
            return res.status(400).json({
                message: "L'ancien mot de passe est obligatoire",
            });
        }
        if (typeof nouveauMotDePasse !== "string" ||
            nouveauMotDePasse.length < 8) {
            return res.status(400).json({
                message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
            });
        }
        if (ancienMotDePasse === nouveauMotDePasse) {
            return res.status(400).json({
                message: "Le nouveau mot de passe doit être différent de l'ancien",
            });
        }
        const resultat = await userService.changerMotDePasse(req.user.id, ancienMotDePasse, nouveauMotDePasse);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message === "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message ===
            "L'ancien mot de passe est incorrect") {
            return res.status(400).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function checkUserDeletion(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant utilisateur invalide",
            });
        }
        const resultat = await userService.checkUserDeletion(id, req.user.id);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message ===
            "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message ===
            "Vous ne pouvez pas supprimer votre propre compte") {
            return res.status(403).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
export async function deleteUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant utilisateur invalide",
            });
        }
        const resultat = await userService.deleteUser(id, req.user.id);
        return res.status(200).json(resultat);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        if (message ===
            "Utilisateur introuvable") {
            return res.status(404).json({
                message,
            });
        }
        if (message ===
            "Vous ne pouvez pas supprimer votre propre compte") {
            return res.status(403).json({
                message,
            });
        }
        if (message ===
            "Cet administrateur est encore créateur d'une ou plusieurs formations") {
            return res.status(409).json({
                message,
            });
        }
        return res.status(500).json({
            message,
        });
    }
}
//# sourceMappingURL=user.controller.js.map