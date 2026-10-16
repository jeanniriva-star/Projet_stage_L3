import * as paiementService from "./paiement.service.js";
const METHODES = ["MVOLA", "ORANGE_MONEY", "AIRTEL_MONEY"];
// Traduit un message d'erreur du service en code HTTP
function repondreErreur(res, error) {
    const message = error instanceof Error
        ? error.message
        : "Erreur interne du serveur";
    if (message.includes("introuvable")) {
        return res.status(404).json({ message });
    }
    if (message.includes("pas autorisé")) {
        return res.status(403).json({ message });
    }
    if (message.includes("déjà") ||
        message.includes("expiré") ||
        message.includes("n'est plus en attente")) {
        return res.status(409).json({ message });
    }
    return res.status(400).json({ message });
}
// ======================================================
// INITIER
// ======================================================
export async function initierPaiement(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const { formationId, methode, telephone } = req.body;
        if (typeof formationId !== "string" || formationId.trim() === "") {
            return res.status(400).json({
                message: "Identifiant de formation invalide",
            });
        }
        if (typeof methode !== "string" ||
            !METHODES.includes(methode)) {
            return res.status(400).json({
                message: "Moyen de paiement invalide",
            });
        }
        if (typeof telephone !== "string" || telephone.trim() === "") {
            return res.status(400).json({
                message: "Le numéro de téléphone est obligatoire",
            });
        }
        const cle = req.header("Idempotency-Key");
        if (cle !== undefined && (cle.trim() === "" || cle.length > 100)) {
            return res.status(400).json({
                message: "Clé d'idempotence invalide",
            });
        }
        const resultat = await paiementService.initierPaiement(req.user.id, {
            formationId,
            methode: methode,
            telephone,
            ...(cle && { cleIdempotence: cle }),
        });
        return res.status(201).json(resultat);
    }
    catch (error) {
        return repondreErreur(res, error);
    }
}
// ======================================================
// CONFIRMER
// ======================================================
export async function confirmerPaiement(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const id = req.params.id;
        const { code } = req.body;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant de paiement invalide",
            });
        }
        if (typeof code !== "string" || code.trim() === "") {
            return res.status(400).json({
                message: "Le code de confirmation est obligatoire",
            });
        }
        const resultat = await paiementService.confirmerPaiement(req.user.id, id, code);
        // 200 aussi quand le fournisseur refuse : l'interface lit paiement.statut
        return res.status(200).json(resultat);
    }
    catch (error) {
        return repondreErreur(res, error);
    }
}
// ======================================================
// CONSULTER
// ======================================================
export async function getPaiement(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({
                message: "Identifiant de paiement invalide",
            });
        }
        const paiement = await paiementService.getPaiementById(id, req.user.id, req.user.role);
        return res.status(200).json({ paiement });
    }
    catch (error) {
        return repondreErreur(res, error);
    }
}
export async function getMesPaiements(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const paiements = await paiementService.getMesPaiements(req.user.id);
        return res.status(200).json({ paiements });
    }
    catch (error) {
        return repondreErreur(res, error);
    }
}
//# sourceMappingURL=paiement.controller.js.map