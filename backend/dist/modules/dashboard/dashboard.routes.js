import { Router } from "express";
import { getDashboardAdmin, getDashboardFormateur, getFormateurDashboard, getDashboardApprenant, } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
router.get("/admin", authenticate, authorize("ADMIN"), getDashboardAdmin);
router.get("/formateur", authenticate, authorize("FORMATEUR"), getDashboardFormateur);
router.get("/apprenant", authenticate, authorize("APPRENANT"), getDashboardApprenant);
router.get("/dashboard/formateur", authenticate, authorize("FORMATEUR"), getFormateurDashboard);
export default router;
//# sourceMappingURL=dashboard.routes.js.map