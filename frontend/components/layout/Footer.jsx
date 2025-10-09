import { Music, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      {/* franja superior en degradé */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-400 via-emerald-300 to-sky-400" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 border border-fuchsia-200">
                <Music className="text-fuchsia-600" size={20} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-gray-900">SABELO</span>
                <span className="ml-1 bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-sky-500 bg-clip-text text-transparent">
                  Lyrics
                </span>
              </span>
            </div>

            <p className="text-gray-600 max-w-md">
              Plataforma comunitaria para descubrir y compartir el significado cultural
              detrás de la música hispanohablante.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                aria-label="GitHub"
              >
                <Github size={18} />
                <span className="text-sm font-medium">GitHub</span>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                aria-label="Twitter / X"
              >
                <Twitter size={18} />
                <span className="text-sm font-medium">Twitter</span>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/songs" className="hover:underline underline-offset-4 decoration-fuchsia-400/60">
                  Explorar Canciones
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:underline underline-offset-4 decoration-fuchsia-400/60">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:underline underline-offset-4 decoration-fuchsia-400/60">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Comunidad</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="hover:underline underline-offset-4 decoration-sky-400/60">
                  Guías de Contribución
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline underline-offset-4 decoration-sky-400/60">
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline underline-offset-4 decoration-sky-400/60">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea y leyenda final */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sabelo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
