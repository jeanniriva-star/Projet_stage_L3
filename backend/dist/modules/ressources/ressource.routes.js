import { Router, } from "express";
import { createRessource, getRessourcesByCours, updateRessource, deleteRessource, uploadRessourceFichier, downloadRessource, } from "./ressource.controller.js";
import { authenticate, } from "../../middlewares/auth.middleware.js";
import { authorize, } from "../../middlewares/role.middleware.js";
import { uploadRessource, } from "../../middlewares/upload.middleware.js";
const router = Router();
router.post("/cours/:coursId/ressources", authenticate, authorize("FORMATEUR"), createRessource);
router.post("/cours/:coursId/ressources/upload", authenticate, authorize("FORMATEUR"), uploadRessource.single("fichier"), uploadRessourceFichier);
router.get("/cours/:coursId/ressources", authenticate, authorize("ADMIN", "FORMATEUR", "APPRENANT"), getRessourcesByCours);
router.get("/ressources/:id/download", authenticate, authorize("ADMIN", "FORMATEUR", "APPRENANT"), downloadRessource);
router.patch("/ressources/:id", authenticate, authorize("FORMATEUR"), updateRessource);
router.delete("/ressources/:id", authenticate, authorize("FORMATEUR"), deleteRessource);
export default router;
//# sourceMappingURL=ressource.routes.js.map