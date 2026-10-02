import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./pages/public/HomePage";
import FormationPage from "./pages/public/FormationPage";
import FormationDetailPage from "./pages/public/FormationDetailPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilPage from "./pages/ProfilPage";

import ApprenantLayout from "./layouts/ApprenantLayout";
import ApprenantDashboard from "./pages/apprenant/ApprenantDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InscriptionPendingPage from "./pages/apprenant/InscriptionPendingPage";
import MesFormationsPage from "./pages/apprenant/MesFormationsPage";
import CalendrierPage from "./pages/apprenant/CalendrierPage";
import EvaluationsPage from "./pages/apprenant/EvaluationsPage";
import QCMPage from "./pages/apprenant/QCMPage";
import InscriptionsAdminPage from "./pages/admin/InscriptionsAdminPage";
import ResultatsPage from "./pages/apprenant/ResultatsPage";
import FormationApprenantPage from "./pages/apprenant/FormationApprenantPage";
import CoursPage from "./pages/apprenant/CoursPage";
import CoursFormateurPage from "./pages/formateur/CoursFormateurPage";
import FormateurLayout from "./layouts/FormateurLayout";
import VisioPage from "./pages/VisioPage";
import EvaluationDetailAdminPage from "./pages/admin/EvaluationDetailAdminPage";
import CoursDetailAdminPage from "./pages/admin/CoursDetailAdminPage";
import FormationDetailAdminPage from "./pages/admin/FormationDetailAdminPage";
import FormationsAdminPage from "./pages/admin/FormationsAdminPage";
import AffectationsAdminPage from "./pages/admin/AffectationsAdminPage";
import UtilisateursAdminPage from "./pages/admin/UtilisateursAdminPage";
import EvaluationFormateurPage from "./pages/formateur/EvaluationFormateurPage";
import FormationFormateurPage from "./pages/formateur/FormationFormateurPage";
import MesFormationsFormateurPage from "./pages/formateur/MesFormationsFormateurPage";
import FormateurDashboard from "./pages/formateur/FormateurDashboard";
import MesCoursFormateurPage from "./pages/formateur/MesCoursFormateurPage";
import SessionsFormateurPage from "./pages/formateur/SessionsFormateurPage";
import AdminLayout from "./layouts/AdminLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PAGES PUBLIQUES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/formations" element={<FormationPage />} />
        <Route
          path="/formation/:id"
          element={<FormationDetailPage />}
        />

        {/* AUTHENTIFICATION */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "FORMATEUR",
                "APPRENANT",
              ]}
            />
          }
        >
          <Route
            path="/visio/:sessionId"
            element={<VisioPage />}
          />
        </Route>

        {/* ADMIN */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]} />
          }
        >
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/inscriptions"
              element={<InscriptionsAdminPage />}
            />
            <Route
              path="/admin/utilisateurs"
              element={<UtilisateursAdminPage />}
            />
            <Route
              path="/admin/affectations"
              element={<AffectationsAdminPage />}
            />
            <Route
              path="/admin/formations"
              element={<FormationsAdminPage />}
            />
            <Route
              path="/admin/formations/:formationId"
              element={<FormationDetailAdminPage />}
            />
            <Route
              path="/admin/formations/:formationId/cours/:coursId"
              element={<CoursDetailAdminPage />}
            />
            <Route
              path="/admin/formations/:formationId/cours/:coursId/evaluations/:evaluationId"
              element={<EvaluationDetailAdminPage />}
            />
            <Route
              path="/admin/profil"
              element={<ProfilPage />}
            />
          </Route>
        </Route>

    {/* FORMATEUR */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["FORMATEUR"]} />
            }
          >
            <Route element={<FormateurLayout />}>
              <Route
                path="/formateur"
                element={<FormateurDashboard />}
              />
              <Route
                path="/formateur/formations"
                element={<MesFormationsFormateurPage />}
              />
              <Route
                path="/formateur/formations/:id"
                element={<FormationFormateurPage />}
              />
              <Route
                path="/formateur/cours/:coursId"
                element={<CoursFormateurPage />}
              />
              <Route
                path="/formateur/evaluations/:evaluationId"
                element={<EvaluationFormateurPage />}
              />
              <Route
                path="/formateur/cours"
                element={<MesCoursFormateurPage />}
              />
              <Route
                path="/formateur/sessions"
                element={<SessionsFormateurPage />}
              />
              <Route path="/formateur/profil" element={<ProfilPage />} />
            </Route>
          </Route>

                  {/* APPRENANT */}
            <Route
                element={<ProtectedRoute allowedRoles={["APPRENANT"]} />}
              >
  <Route element={<ApprenantLayout />}>

    <Route
      path="/apprenant"
      element={<ApprenantDashboard />}
    />
    <Route
      path="/apprenant/formations/:id"
      element={<FormationApprenantPage />}
    />

    <Route
      path="/apprenant/mes-formations"
      element={<MesFormationsPage />}
    />
    <Route
      path="/apprenant/cours/:coursId"
      element={<CoursPage />}
    />

    <Route
      path="/apprenant/calendrier"
      element={<CalendrierPage />}
    />

    <Route
      path="/apprenant/evaluations"
      element={<EvaluationsPage />}
    />

    <Route
      path="/apprenant/evaluations/:evaluationId/qcm"
      element={<QCMPage />}
    />

    <Route
      path="/apprenant/resultats"
      element={<ResultatsPage />}
    />

    <Route
      path="/inscription-en-attente"
      element={<InscriptionPendingPage />}
    />
    <Route path="/apprenant/profil" element={<ProfilPage />} />
</Route>
</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;