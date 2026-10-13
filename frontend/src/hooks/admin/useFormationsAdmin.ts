import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  createFormationAdmin,
  deleteFormationAdmin,
  getFormationsAdmin,
  updateFormationAdmin,
  type FormationAdmin,
  type FormationsAdminResponse,
  type NiveauUniversitaire,
} from "../../services/formation.service";
import { getErrorMessage } from "../../utils/errors";
import type { FormationFormValues } from "./useFormationForm";

const LIMITE_PAR_PAGE = 10;

const MESSAGE_ERREUR_CHARGEMENT = "Impossible de charger les formations.";

export function useFormationsAdmin() {
  const [formations, setFormations] = useState<FormationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =====================================================
  // CHARGEMENT
  // =====================================================

  const appliquerResultat = useCallback((data: FormationsAdminResponse) => {
    setFormations(data.formations);
    setPage(data.pagination.page);
    setTotalPages(data.pagination.totalPages);
    setTotal(data.pagination.total);
  }, []);

  async function chargerFormations(
    pageDemandee = page,
    rechercheDemandee = recherche
  ) {
    try {
      setLoading(true);
      setError("");

      const data = await getFormationsAdmin(
        pageDemandee,
        LIMITE_PAR_PAGE,
        rechercheDemandee
      );

      appliquerResultat(data);
    } catch (err: unknown) {
      console.error("Erreur formations admin :", err);

      setError(getErrorMessage(err, MESSAGE_ERREUR_CHARGEMENT));
    } finally {
      setLoading(false);
    }
  }

  // Chargement initial
  useEffect(() => {
    let annule = false;

    async function initialiser() {
      try {
        const data = await getFormationsAdmin(1, LIMITE_PAR_PAGE, "");

        if (annule) {
          return;
        }

        appliquerResultat(data);
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error("Erreur formations admin :", err);

        setError(getErrorMessage(err, MESSAGE_ERREUR_CHARGEMENT));
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    initialiser();

    return () => {
      annule = true;
    };
  }, [appliquerResultat]);

  // =====================================================
  // RECHERCHE
  // =====================================================

  async function handleRecherche(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await chargerFormations(1, recherche);
  }

  function reinitialiserRecherche() {
    setRecherche("");

    void chargerFormations(1, "");
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  async function creer(valeurs: FormationFormValues, onCree: () => void) {
    try {
      setCreating(true);

      await createFormationAdmin({
        titre: valeurs.titre.trim(),
        ...(valeurs.description.trim() && {
          description: valeurs.description.trim(),
        }),
        prix: Number(valeurs.prix),
        type: valeurs.type,
        ...(valeurs.type === "CONTINUE" && {
          niveau: valeurs.niveau as NiveauUniversitaire,
        }),
      });

      onCree();

      await chargerFormations(1, recherche);

      window.alert("Formation créée avec succès.");
    } catch (err: unknown) {
      console.error("Erreur création formation :", err);

      window.alert(getErrorMessage(err, "Impossible de créer la formation."));
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // MODIFICATION
  // =====================================================

  async function modifier(
    formationId: string,
    valeurs: FormationFormValues,
    onModifiee: () => void
  ) {
    try {
      setUpdating(true);

      await updateFormationAdmin(formationId, {
        titre: valeurs.titre.trim(),
        description: valeurs.description.trim()
          ? valeurs.description.trim()
          : null,
        prix: Number(valeurs.prix),
        type: valeurs.type,
        niveau:
          valeurs.type === "CONTINUE"
            ? (valeurs.niveau as NiveauUniversitaire)
            : null,
      });

      onModifiee();

      await chargerFormations(page, recherche);

      window.alert("Formation modifiée avec succès.");
    } catch (err: unknown) {
      console.error("Erreur modification formation :", err);

      window.alert(
        getErrorMessage(err, "Impossible de modifier la formation.")
      );
    } finally {
      setUpdating(false);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  async function supprimer(formation: FormationAdmin) {
    const contientDesDonnees =
      formation._count.cours > 0 ||
      formation._count.sessions > 0 ||
      formation._count.affectations > 0 ||
      formation._count.inscriptions > 0;

    if (contientDesDonnees) {
      window.alert(
        "Cette formation contient encore des cours, sessions, affectations ou inscriptions. Elle ne peut pas être supprimée."
      );

      return;
    }

    const confirmation = window.confirm(
      `Supprimer définitivement la formation "${formation.titre}" ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingId(formation.id);

      const resultat = await deleteFormationAdmin(formation.id);

      window.alert(resultat.message);

      await chargerFormations(page, recherche);
    } catch (err: unknown) {
      console.error("Erreur suppression formation :", err);

      window.alert(
        getErrorMessage(err, "Impossible de supprimer la formation.")
      );
    } finally {
      setDeletingId(null);
    }
  }

  return {
    formations,
    loading,
    error,
    recherche,
    setRecherche,
    page,
    totalPages,
    total,
    creating,
    updating,
    deletingId,
    chargerFormations,
    handleRecherche,
    reinitialiserRecherche,
    creer,
    modifier,
    supprimer,
  };
}