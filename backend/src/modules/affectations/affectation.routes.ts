import { Router } from "express";

import {
  createAffectation,
  getAffectations,
  getAffectationsByFormation,
  getMesFormationsFormateur,
  deleteAffectation,
} from "./affectation.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

// ADMIN : affecter un formateur à une formation
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createAffectation
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getAffectations
);
// ADMIN : voir les formateurs affectés à une formation
router.get(
  "/formation/:formationId",
  authenticate,
  authorize("ADMIN"),
  getAffectationsByFormation
);

// FORMATEUR : voir uniquement ses propres formations
router.get(
  "/mes-formations",
  authenticate,
  authorize("FORMATEUR"),
  getMesFormationsFormateur
);

// ADMIN : retirer une affectation
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteAffectation
);

export default router;