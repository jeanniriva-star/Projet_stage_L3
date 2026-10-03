import { Router } from "express";
import { createFormation, getFormations, getFormationById, updateFormation, deleteFormation, } from "./formation.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createFormationSchema, updateFormationSchema, } from "../../validators/formation.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
router.post("/", authenticate, authorize("ADMIN"), validate(createFormationSchema), createFormation);
router.get("/", getFormations);
router.get("/:id", getFormationById);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateFormationSchema), updateFormation);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteFormation);
export default router;
//# sourceMappingURL=formation.routes.js.map