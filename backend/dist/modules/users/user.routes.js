import { Router } from "express";
import { createUserByAdmin, getUsers, getUserById, updateUserRole, getMonProfil, updateMonProfil, changerMotDePasse, checkUserDeletion, deleteUser, } from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
const router = Router();
// PROFIL UTILISATEUR CONNECTÉ
router.get("/me", authenticate, getMonProfil);
router.patch("/me", authenticate, updateMonProfil);
router.patch("/me/password", authenticate, changerMotDePasse);
// ROUTES ADMIN
router.post("/", authenticate, authorize("ADMIN"), createUserByAdmin);
router.get("/:id/delete-check", authenticate, authorize("ADMIN"), checkUserDeletion);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteUser);
router.get("/", authenticate, authorize("ADMIN"), getUsers);
router.get("/:id", authenticate, authorize("ADMIN"), getUserById);
router.patch("/:id/role", authenticate, authorize("ADMIN"), updateUserRole);
export default router;
//# sourceMappingURL=user.routes.js.map