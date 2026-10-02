import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../../validators/user.schema.js";
import { login, register, me, } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);
export default router;
//# sourceMappingURL=auth.routes.js.map