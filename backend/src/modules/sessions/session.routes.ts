import { Router } from "express";
import {
  createSession,
  getSessionsByFormation,
   joinSession,
   getMesSessions,
   getSessionById,
  updateSession,
  deleteSession,
  startSession,
  endSession,
  getPresencesSession,
} from "./session.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/formations/:formationId/sessions",
  authenticate,
  authorize("FORMATEUR"),
  createSession
);

router.post(
  "/sessions/:id/join",
  authenticate,
  authorize("FORMATEUR", "APPRENANT"),
  joinSession
);
router.post(
  "/sessions/:id/start",
  authenticate,
  authorize("FORMATEUR"),
  startSession
);

router.post(
  "/sessions/:id/end",
  authenticate,
  authorize("FORMATEUR"),
  endSession
);

router.get(
  "/formations/:formationId/sessions",
  authenticate,
  authorize("ADMIN", "FORMATEUR"),
  getSessionsByFormation
);
router.get(
  "/sessions/mes-sessions",
  authenticate,
  authorize("APPRENANT"),
  getMesSessions
);
router.get(
  "/sessions/:id/presences",
  authenticate,
  authorize(
    "ADMIN",
    "FORMATEUR",
    "APPRENANT"
  ),
  getPresencesSession
);
router.get(
  "/sessions/:id",
  authenticate,
  authorize("ADMIN", "FORMATEUR"),
  getSessionById
);

router.patch(
  "/sessions/:id",
  authenticate,
  authorize("FORMATEUR"),
  updateSession
);

router.delete(
  "/sessions/:id",
  authenticate,
  authorize("FORMATEUR"),
  deleteSession
);
export default router;