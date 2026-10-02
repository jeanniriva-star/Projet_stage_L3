import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ApprenantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-slate-800 text-cyan-300"
      : "text-slate-300 hover:bg-slate-900 hover:text-white"
  }`;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white">
        <div className="border-b border-slate-100 px-6 py-6">
          <div className="text-xl font-extrabold">
           <span className="text-white">SPRAY</span>
           <span className="text-cyan-400">_INFO</span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Espace apprenant
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <NavLink to="/apprenant" end className={linkClass}>
            <span>⌂</span>
            Tableau de bord
          </NavLink>

          <NavLink
            to="/apprenant/mes-formations"
            className={linkClass}
          >
            <span>◈</span>
            Mes formations
          </NavLink>

          <NavLink
            to="/apprenant/calendrier"
            className={linkClass}
          >
            <span>□</span>
            Calendrier
          </NavLink>

          <NavLink
            to="/apprenant/evaluations"
            className={linkClass}
          >
            <span>✓</span>
            Évaluations
          </NavLink>

          <NavLink
            to="/apprenant/resultats"
            className={linkClass}
          >
            <span>↗</span>
            Résultats
          </NavLink>

          <NavLink to="/apprenant/profil" className={linkClass}>
            <span>◎</span>
            Mon profil
          </NavLink>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-slate-900">
              {user?.prenom} {user?.nom}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="border-t border-slate-800 p-4">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <span className="font-extrabold">
            SPRAY<span className="text-cyan-600">_INFO</span>
          </span>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:border-red-400 hover:text-red-300"
          >
            Déconnexion
          </button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ApprenantLayout;