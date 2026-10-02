import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function linkClass({ isActive }: { isActive: boolean }) {
    return `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-cyan-300"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">
            SPRAY
            <span className="text-cyan-400">_INFO</span>
          </h1>

          <p className="mt-2 text-xs text-slate-400">
            Espace administrateur
          </p>
        </div>

       <nav className="flex-1 space-y-2 px-4 py-6">
        <NavLink to="/admin" end className={linkClass}>
            Tableau de bord
        </NavLink>

        <NavLink to="/admin/inscriptions" className={linkClass}>
            Inscriptions
        </NavLink>

        <NavLink to="/admin/utilisateurs" className={linkClass}>
            Utilisateurs
        </NavLink>

        <NavLink to="/admin/formations" className={linkClass}>
            Formations
        </NavLink>

        <NavLink to="/admin/affectations" className={linkClass}>
            Affectations
        </NavLink>

        <NavLink to="/admin/profil" className={linkClass}>
            Mon profil
        </NavLink>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-white">
              {user?.prenom} {user?.nom}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Administrateur
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;