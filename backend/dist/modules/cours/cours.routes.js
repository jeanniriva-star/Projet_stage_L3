import { Router } from "express";
import { createCours, getCoursByFormation, getCoursById, getMesCoursFormateur, updateCours, deleteCours, } from "./cours.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
router.post("/formations/:formationId/cours", authenticate, authorize("FORMATEUR"), createCours);
router.get("/formations/:formationId/cours", authenticate, authorize("ADMIN", "FORMATEUR", "APPRENANT"), getCoursByFormation);
router.get("/cours/mes-cours", authenticate, authorize("FORMATEUR"), getMesCoursFormateur);
router.get("/cours/:id", authenticate, authorize("ADMIN", "FORMATEUR"), getCoursById);
router.patch("/cours/:id", authenticate, authorize("FORMATEUR"), updateCours);
router.delete("/cours/:id", authenticate, authorize("FORMATEUR"), deleteCours);
export default router;
//# sourceMappingURL=cours.routes.js.map