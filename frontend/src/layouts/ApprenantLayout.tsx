import { NavLink, Outlet } from "react-router-dom";
import {
  Award,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  User,
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
  { to: "/apprenant", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/apprenant/mes-formations", label: "Mes formations", icon: GraduationCap },
  { to: "/apprenant/calendrier", label: "Calendrier", icon: CalendarDays },
  { to: "/apprenant/evaluations", label: "Évaluations", icon: ClipboardCheck },
  { to: "/apprenant/resultats", label: "Résultats", icon: TrendingUp },
  { to: "/apprenant/certificats", label: "Mes certificats", icon: Award },
  { to: "/apprenant/profil", label: "Mon profil", icon: User },
];

function ApprenantLayout() {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout("/");
  }

  // Menu latéral (ordinateur)
  function linkClass({ isActive }: { isActive: boolean }) {
    return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-cyan-300"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;
  }

  // Menu horizontal (mobile)
  function mobileLinkClass({ isActive }: { isActive: boolean }) {
    return `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-cyan-300"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* MENU LATÉRAL */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white md:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">
            SPRAY
            <span className="text-cyan-400">_INFO</span>
          </h1>

          <p className="mt-2 text-xs text-slate-400">
            Espace apprenant
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

            <p className="mt-1 truncate text-xs text-slate-400">
              {user?.email}
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

      <div className="min-w-0 flex-1">
        {/* EN-TÊTE MOBILE */}
        <header className="border-b border-slate-800 bg-slate-950 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-lg font-bold tracking-tight text-white">
              SPRAY
              <span className="text-cyan-400">_INFO</span>
            </span>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Déconnexion"
              className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
            {LIENS.map(({ to, label, icon: Icone, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={mobileLinkClass}
              >
                <Icone size={16} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ApprenantLayout;