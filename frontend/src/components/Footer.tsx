import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            SPRAY_INFO
          </h3>

          <p className="mt-1 text-sm font-medium text-cyan-700">
            Centre de formation
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Imandry, Fianarantsoa
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">
            Contact
          </h4>

          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>sprayinfo@gmail.com</p>
            <p>+261 34 68 275 62</p>
            <p>+261 38 37 930 53</p>
            <p>Facebook : Spray_info</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">
            Liens utiles
          </h4>

          <div className="mt-3 flex flex-col gap-2">
            <Link
              to="/formations"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Nos formations
            </Link>

            <Link
              to="/formations?type=CONTINUE"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Formation continue
            </Link>

            <Link
              to="/formations?type=PROFESSIONNELLE"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Formation professionnelle
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;