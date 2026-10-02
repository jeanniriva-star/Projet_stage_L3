import { Router } from "express";
import {
  login,
  register,
  me,
} from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, me);

export default router;