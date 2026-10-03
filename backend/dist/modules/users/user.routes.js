import { Router } from "express";
import { createUserByAdmin, getUsers, getUserById, updateUserRole, getMonProfil, updateMonProfil, changerMotDePasse, checkUserDeletion, deleteUser, } from "./user.controller.js";
import { updateProfilSchema, createUserAdminSchema, changerMotDePasseSchema, } from "../../validators/user.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
const router = Router();
// PROFIL UTILISATEUR CONNECTÉ
router.get("/me", authenticate, getMonProfil);
router.patch("/me", authenticate, validate(updateProfilSchema), updateMonProfil);
router.patch("/me/password", authenticate, validate(changerMotDePasseSchema), changerMotDePasse);
// ROUTES ADMIN
router.post("/", authenticate, authorize("ADMIN"), validate(createUserAdminSchema), createUserByAdmin);
router.get("/:id/delete-check", authenticate, authorize("ADMIN"), checkUserDeletion);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteUser);
router.get("/", authenticate, authorize("ADMIN"), getUsers);
router.get("/:id", authenticate, authorize("ADMIN"), getUserById);
router.patch("/:id/role", authenticate, authorize("ADMIN"), updateUserRole);
export default router;
//# sourceMappingURL=user.routes.js.map