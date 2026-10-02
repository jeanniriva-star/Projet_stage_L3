import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import formationRoutes from "./modules/formations/formation.routes.js";
import affectationRoutes from "./modules/affectations/affectation.routes.js";
import coursRoutes from "./modules/cours/cours.routes.js";
import ressourceRoutes from "./modules/ressources/ressource.routes.js";
import sessionRoutes from "./modules/sessions/session.routes.js";
import inscriptionRoutes from "./modules/inscriptions/inscription.routes.js";
import presenceRoutes from "./modules/presences/presence.routes.js";
import evaluationRoutes from "./modules/evaluations/evaluation.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import exerciceRoutes from "./modules/exercices/exercice.routes.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads")
  )
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/formations", formationRoutes);
app.use("/api/affectations", affectationRoutes);
app.use("/api", coursRoutes);
app.use("/api", ressourceRoutes);
app.use("/api", sessionRoutes);
app.use("/api", inscriptionRoutes);
app.use("/api", presenceRoutes);
app.use("/api", evaluationRoutes);
app.use("/api", exerciceRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "API Projet Stage L3 fonctionne 🚀",
  });
});

export default app;