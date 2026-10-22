import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Award } from "lucide-react";

import logoSprayInfo from "../../assets/logo_spray.jpg";
import {
  getMesCertificats,
  type MonCertificat,
} from "../../services/inscription.service";
import { getErrorMessage } from "../../utils/errors";

function formaterDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =====================================================
// CERTIFICAT IMPRIMABLE (A4 paysage)
// Les tailles utilisent cqw : elles suivent la largeur du certificat,
// à l'écran comme à l'impression.
// =====================================================

function CertificatImprimable({ certificat }: { certificat: MonCertificat }) {
  const { apprenant, formation } = certificat.inscription;

  return (
    <div
      id="certificat-imprimable"
      className="w-full bg-white"
      style={
        {
          containerType: "inline-size",
          aspectRatio: "297 / 210",
        } as CSSProperties
      }
    >
      <div
        className="flex h-full w-full flex-col items-center justify-between text-center"
        style={{
          boxSizing: "border-box",
          padding: "3cqw 5cqw",
          border: "1.2cqw double #0e7490",
        }}
      >
        {/* EN-TÊTE */}
        <div className="flex flex-col items-center">
          <img
            src={logoSprayInfo}
            alt="Spray Info"
            style={{ height: "7cqw", borderRadius: "1cqw" }}
          />

          <p
            style={{
              marginTop: "0.8cqw",
              fontSize: "2cqw",
              fontWeight: 700,
              letterSpacing: "0.3cqw",
              color: "#0f172a",
            }}
          >
            SPRAY_INFO
          </p>
        </div>

        {/* CORPS */}
        <div className="flex flex-col items-center">
          <p
            style={{
              fontSize: "4.6cqw",
              fontWeight: 800,
              letterSpacing: "0.4cqw",
              color: "#0f172a",
            }}
          >
            CERTIFICAT DE RÉUSSITE
          </p>

          <p style={{ marginTop: "2cqw", fontSize: "1.8cqw", color: "#475569" }}>
            Il est certifié que
          </p>

          <p
            style={{
              marginTop: "1cqw",
              padding: "0 3cqw 0.6cqw",
              fontSize: "4.4cqw",
              fontWeight: 700,
              color: "#0e7490",
              borderBottom: "0.2cqw solid #cbd5e1",
            }}
          >
            {apprenant.prenom} {apprenant.nom}
          </p>

          <p style={{ marginTop: "2cqw", fontSize: "1.8cqw", color: "#475569" }}>
            a suivi avec succès la formation
          </p>

          <p
            style={{
              marginTop: "0.8cqw",
              fontSize: "3cqw",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {formation.titre}
          </p>

          <p style={{ marginTop: "1.6cqw", fontSize: "1.9cqw", color: "#475569" }}>
            avec une moyenne de{" "}
            <strong style={{ color: "#0f172a" }}>{certificat.moyenne}/20</strong>
          </p>
        </div>

        {/* PIED */}
        <div
          className="flex w-full items-end justify-between"
          style={{ fontSize: "1.4cqw", color: "#475569" }}
        >
          <div className="text-left">
            <p>Délivré le {formaterDate(certificat.delivreLe)}</p>
            <p style={{ marginTop: "0.3cqw" }}>N° {certificat.numero}</p>
          </div>

          <div className="text-center">
            <div
              style={{
                width: "20cqw",
                borderTop: "0.2cqw solid #94a3b8",
                paddingTop: "0.4cqw",
              }}
            >
              La direction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MODALE + IMPRESSION
// Elle est rendue directement dans <body> : à l'impression, tout le reste
// de la page est masqué et seul le certificat est imprimé.
// =====================================================

const CSS_IMPRESSION = `
@media print {
  @page { size: A4 landscape; margin: 0; }

  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }

  body > *:not(#portail-certificat) { display: none !important; }

  #portail-certificat {
    position: static !important;
    background: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  #portail-certificat .zone-certificat {
    max-width: none !important;
    width: 297mm !important;
    margin: 0 !important;
  }

  #portail-certificat .no-print { display: none !important; }

  #certificat-imprimable {
    width: 297mm !important;
    height: 210mm !important;
    aspect-ratio: auto !important;
  }

  #certificat-imprimable, #certificat-imprimable * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

function CertificatModal({
  certificat,
  onFermer,
}: {
  certificat: MonCertificat;
  onFermer: () => void;
}) {
  return createPortal(
    <div
      id="portail-certificat"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4"
    >
      <style>{CSS_IMPRESSION}</style>

      <div className="zone-certificat mx-auto my-6 w-full max-w-4xl">
        <div className="shadow-xl">
          <CertificatImprimable certificat={certificat} />
        </div>

        <div className="no-print mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onFermer}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// =====================================================
// PAGE
// =====================================================

function CertificatsPage() {
  const [certificats, setCertificats] = useState<MonCertificat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<MonCertificat | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      try {
        const data = await getMesCertificats();

        if (!annule) {
          setCertificats(data);
        }
      } catch (err: unknown) {
        if (annule) {
          return;
        }

        console.error("Erreur certificats :", err);
        setError(
          getErrorMessage(err, "Impossible de charger vos certificats.")
        );
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    }

    charger();

    return () => {
      annule = true;
    };
  }, []);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Mon espace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes certificats
          </h1>

          <p className="mt-2 text-slate-600">
            Un certificat est délivré à la fin d'une formation si votre
            moyenne de QCM atteint 70 % (14/20).
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Chargement de vos certificats...
          </div>
        ) : (
          !error &&
          (certificats.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="font-bold text-slate-900">
                Aucun certificat pour le moment
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Vos certificats apparaîtront ici lorsqu'une de vos
                formations sera terminée avec succès.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {certificats.map((certificat) => (
                <article
                  key={certificat.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
                      <Award size={28} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        {certificat.inscription.formation.titre}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Délivré le {formaterDate(certificat.delivreLe)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="text-slate-500">Moyenne</span>

                    <strong className="text-slate-900">
                      {certificat.moyenne}/20
                    </strong>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    N° {certificat.numero}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelection(certificat)}
                    className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Voir le certificat
                  </button>
                </article>
              ))}
            </div>
          ))
        )}
      </div>

      {selection && (
        <CertificatModal
          certificat={selection}
          onFermer={() => setSelection(null)}
        />
      )}
    </div>
  );
}

export default CertificatsPage;