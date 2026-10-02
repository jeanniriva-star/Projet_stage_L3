import { Router } from "express";
import {
  marquerPresence,
  getPresencesBySession,
   getMesPresences,
  getStatistiquesPresenceFormation,
} from "./presence.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/sessions/:id/presence",
  authenticate,
  authorize("APPRENANT"),
  marquerPresence
);
router.get(
  "/sessions/:id/presences",
  authenticate,
  authorize("ADMIN", "FORMATEUR"),
  getPresencesBySession
);

router.get(
  "/presences/mes-presences",
  authenticate,
  authorize("APPRENANT"),
  getMesPresences
);

router.get(
  "/formations/:formationId/presences/statistiques",
  authenticate,
  authorize("ADMIN", "FORMATEUR"),
  getStatistiquesPresenceFormation
);

export default router;