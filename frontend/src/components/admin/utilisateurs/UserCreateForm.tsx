import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

import FormField from "../../common/FormField";
import type { CreateUserAdminData } from "../../../types/user.types";
import {
  isValidEmailInscription,
  isValidName,
  isValidPassword,
  isValidPhone,
  onlyEmailChars,
  onlyLetters,
  onlyPhone,
} from "../../../utils/validation";

interface UserCreateFormProps {
  creating: boolean;
  createError: string;
  onSubmit: (data: CreateUserAdminData) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600";

function UserCreateForm({
  creating,
  createError,
  onSubmit,
  onCancel,
}: UserCreateFormProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [role, setRole] = useState<"ADMIN" | "FORMATEUR">("FORMATEUR");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [afficherMdp, setAfficherMdp] = useState(false);

  const effacerErreur = (champ: string) =>
    setErreurs((prev) => ({ ...prev, [champ]: "" }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nouvellesErreurs: Record<string, string> = {};

    if (!isValidName(nom)) nouvellesErreurs.nom = "Au moins 2 lettres";
    if (!isValidName(prenom)) nouvellesErreurs.prenom = "Au moins 2 lettres";
    if (!isValidEmailInscription(email))
      nouvellesErreurs.email = "Uniquement lettres et chiffres (exemple : nom@domaine.com)";
    if (!isValidPassword(password)) nouvellesErreurs.password = "Minimum 8 caractères";
    if (!isValidPhone(telephone))
      nouvellesErreurs.telephone = "8 à 15 chiffres (le + est accepté au début)";
    if (adresse.trim().length < 3) nouvellesErreurs.adresse = "Adresse trop courte";

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs);
      return;
    }

    setErreurs({});

    onSubmit({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      password,
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      role,
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Nouvel utilisateur</h2>

      <p className="mt-1 text-sm text-slate-500">
        Créer un compte administrateur ou formateur.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Nom" error={erreurs.nom}>
            <input
              type="text"
              value={nom}
              onChange={(e) => {
                setNom(onlyLetters(e.target.value));
                effacerErreur("nom");
              }}
              className={inputClass}
            />
          </FormField>

          <FormField label="Prénom" error={erreurs.prenom}>
            <input
              type="text"
              value={prenom}
              onChange={(e) => {
                setPrenom(onlyLetters(e.target.value));
                effacerErreur("prenom");
              }}
              className={inputClass}
            />
          </FormField>

          <FormField label="Email" error={erreurs.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(onlyEmailChars(e.target.value));
                effacerErreur("email");
              }}
              className={inputClass}
            />
          </FormField>

          <FormField label="Téléphone" error={erreurs.telephone}>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => {
                setTelephone(onlyPhone(e.target.value));
                effacerErreur("telephone");
              }}
              className={inputClass}
            />
          </FormField>

          <FormField label="Adresse" error={erreurs.adresse}>
            <input
              type="text"
              value={adresse}
              onChange={(e) => {
                setAdresse(e.target.value);
                effacerErreur("adresse");
              }}
              className={inputClass}
            />
          </FormField>

          <FormField label="Rôle">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "FORMATEUR")}
              className={`${inputClass} bg-white`}
            >
              <option value="FORMATEUR">Formateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </FormField>
        </div>

        <div className="mt-5">
          <FormField label="Mot de passe" error={erreurs.password}>
            <div className="relative">
              <input
                type={afficherMdp ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  effacerErreur("password");
                }}
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                aria-label={afficherMdp ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600"
              >
                {afficherMdp ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </FormField>
        </div>

        {createError && <p className="mt-4 text-sm text-red-600">{createError}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default UserCreateForm;