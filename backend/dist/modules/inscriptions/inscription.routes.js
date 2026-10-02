import { Router } from "express";
import { createInscription, getInscriptionsEnAttente, updateStatutInscription, getMesInscriptions, getInscriptionsByFormation, } from "./inscription.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
router.post("/formations/:formationId/inscriptions", authenticate, authorize("APPRENANT"), createInscription);
router.get("/inscriptions/en-attente", authenticate, authorize("ADMIN"), getInscriptionsEnAttente);
router.patch("/inscriptions/:id/statut", authenticate, authorize("ADMIN"), updateStatutInscription);
router.get("/inscriptions/mes-inscriptions", authenticate, authorize("APPRENANT"), getMesInscriptions);
router.get("/formations/:formationId/inscriptions", authenticate, authorize("ADMIN", "FORMATEUR"), getInscriptionsByFormation);
export default router;
//# sourceMappingURL=inscription.routes.js.map