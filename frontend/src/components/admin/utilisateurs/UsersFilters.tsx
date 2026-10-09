import type { FormEvent } from "react";

interface UsersFiltersProps {
  recherche: string;
  roleFiltre: string;
  onRechercheChange: (value: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

function UsersFilters({
  recherche,
  roleFiltre,
  onRechercheChange,
  onRoleChange,
  onSubmit,
  onReset,
}: UsersFiltersProps) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 lg:grid-cols-[1fr_220px_auto]"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Rechercher
          </label>

          <input
            type="search"
            value={recherche}
            onChange={(e) => onRechercheChange(e.target.value)}
            placeholder="Nom, prénom, email ou téléphone..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Rôle
          </label>

          <select
            value={roleFiltre}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600"
          >
            <option value="">Tous</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="FORMATEUR">Formateurs</option>
            <option value="APPRENANT">Apprenants</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Rechercher
          </button>
        </div>
      </form>

      {(recherche || roleFiltre) && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
          Réinitialiser les filtres
        </button>
      )}
    </section>
  );
}

export default UsersFilters;