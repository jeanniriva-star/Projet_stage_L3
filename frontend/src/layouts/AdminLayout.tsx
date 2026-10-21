import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  User,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

interface LienMenu {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const LIENS: LienMenu[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList },
  { to: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/formations", label: "Formations", icon: GraduationCap },
  { to: "/admin/affectations", label: "Affectations", icon: UserCheck },
  { to: "/admin/statistiques", label: "Statistiques", icon: TrendingUp },
  { to: "/admin/profil", label: "Mon profil", icon: User },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout("/");
  }

  function linkClass({ isActive }: { isActive: boolean }) {
    return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
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
          {LIENS.map(({ to, label, icon: Icone, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icone size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            <LogOut size={18} />
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