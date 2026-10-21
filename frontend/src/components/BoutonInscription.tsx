import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { demarrerInscription } from "../services/inscription.service";
import { getErrorMessage } from "../utils/errors";

interface BoutonInscriptionProps {
  formationId: string;
  className?: string;
  children: ReactNode;
}

function BoutonInscription({
  formationId,
  className,
  children,
}: BoutonInscriptionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleInscription() {
    try {
      setLoading(true);

      const message = await demarrerInscription(formationId, navigate);

      if (message) {
        window.alert(message);
      }
    } catch (err: unknown) {
      console.error(err);

      window.alert(
        getErrorMessage(
          err,
          "Impossible de vous inscrire à cette formation."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // Pas connecté (ou autre rôle) : page d'inscription
  if (user?.role !== "APPRENANT") {
    return (
      <Link
        to={`/register?formationId=${formationId}`}
        className={className}
      >
        {children}
      </Link>
    );
  }

  // Apprenant connecté : inscription puis paiement
  return (
    <button
      type="button"
      onClick={handleInscription}
      disabled={loading}
      className={`${className ?? ""} disabled:opacity-60`}
    >
      {loading ? "Inscription..." : children}
    </button>
  );
}

export default BoutonInscription;