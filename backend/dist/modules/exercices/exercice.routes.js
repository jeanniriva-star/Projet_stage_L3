import { Router } from "express";
import { ajouterExercice, listerExercicesParCours, telechargerExercice, supprimerUnExercice, } from "./exercice.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { uploadExercice } from "../../middlewares/upload.middleware.js";
const router = Router();
router.post("/cours/:coursId/exercices", authenticate, authorize("FORMATEUR"), uploadExercice.single("fichier"), ajouterExercice);
router.get("/cours/:coursId/exercices", authenticate, authorize("ADMIN", "FORMATEUR", "APPRENANT"), listerExercicesParCours);
router.get("/exercices/:id/download", authenticate, authorize("ADMIN", "FORMATEUR", "APPRENANT"), telechargerExercice);
router.delete("/exercices/:id", authenticate, authorize("FORMATEUR"), supprimerUnExercice);
export default router;
//# sourceMappingURL=exercice.routes.js.map