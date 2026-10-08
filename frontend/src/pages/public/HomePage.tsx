import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

const DOMAINES_PRO = [
  "Administration Système et Réseaux",
  "Développement d'application",
  "Outillages",
];

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-slate-900">SPRAY</span>
            <span className="text-cyan-600">_INFO</span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/formations"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
            >
              Formations
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(8,145,178,0.14),_transparent_35%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-cyan-300">
                Centre de formation Spray_info
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Développez vos compétences avec des
                <span className="text-cyan-600"> formations modernes</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Découvrez les formations proposées par le centre, consultez
                leurs informations et suivez vos cours en présentiel ou en ligne.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/formations"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-cyan-700"
                >
                  Voir les formations
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-800 p-10 text-white shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Formation en ligne
                </p>

                <h2 className="mt-6 text-4xl font-bold leading-tight">
                  Apprendre
                  <br />
                  Progresser
                  <br />
                  Se connecter
                </h2>

                <div className="mt-10 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-bold">Cours</p>
                    <p className="mt-1 text-xs text-slate-300">Supports</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-bold">Live</p>
                    <p className="mt-1 text-xs text-slate-300">Jitsi</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-bold">QCM</p>
                    <p className="mt-1 text-xs text-slate-300">Évaluation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEUX TYPES DE FORMATION */}
        <section className="mx-auto max-w-7xl px-6 pt-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
            Nos parcours
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Deux types de formation
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="text-5xl font-extrabold text-cyan-600/30">
                01
              </span>

              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Formation continue
              </h3>

              <span className="mt-3 inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-cyan-300">
                L1 jusqu'à M2
              </span>

              <p className="mt-5 leading-7 text-slate-600">
                Cours d'appui pour aider les étudiants universitaires à
                renforcer leurs connaissances, réussir leur parcours
                académique et se préparer efficacement à leur avenir
                professionnel.
              </p>

              <Link
                to="/formations?type=CONTINUE"
                className="mt-auto pt-8 font-semibold text-cyan-700 hover:text-cyan-900"
              >
                Voir les matières →
              </Link>
            </article>

            <article className="flex flex-col rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-800 p-8 text-white shadow-xl transition hover:-translate-y-1">
              <span className="text-5xl font-extrabold text-cyan-300/40">
                02
              </span>

              <h3 className="mt-4 text-2xl font-bold">
                Formation professionnelle
              </h3>

              <p className="mt-5 leading-7 text-slate-300">
                Adaptées à tous, visant à développer des compétences pratiques
                pour une meilleure évolution de carrière.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {DOMAINES_PRO.map((domaine) => (
                  <span
                    key={domaine}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {domaine}
                  </span>
                ))}
              </div>

              <Link
                to="/formations?type=PROFESSIONNELLE"
                className="mt-auto pt-8 font-semibold text-cyan-300 hover:text-white"
              >
                Voir les formations →
              </Link>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
                Catalogue
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Formations disponibles
              </h2>

              <p className="mt-3 max-w-2xl text-slate-600">
                Consultez les formations proposées et choisissez celle qui
                correspond à vos objectifs.
              </p>
            </div>

            <Link
              to="/formations"
              className="font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Voir tout →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;