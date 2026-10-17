import { Router } from "express";
import { initierPaiement, confirmerPaiement, getMesPaiements, getPaiement, getPaiementsAdmin, } from "./paiement.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
router.post("/paiements", authenticate, authorize("APPRENANT"), initierPaiement);
router.get("/paiements", authenticate, authorize("ADMIN"), getPaiementsAdmin);
// Doit rester avant "/paiements/:id"
router.get("/paiements/mes-paiements", authenticate, authorize("APPRENANT"), getMesPaiements);
router.post("/paiements/:id/confirmer", authenticate, authorize("APPRENANT"), confirmerPaiement);
router.get("/paiements/:id", authenticate, authorize("APPRENANT", "ADMIN"), getPaiement);
export default router;
//# sourceMappingURL=paiement.routes.js.map