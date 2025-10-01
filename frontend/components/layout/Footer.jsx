import { Music, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Music className="text-primary-500" size={32} />
              <span className="text-2xl font-bold text-white">Sabelo</span>
            </div>
            <p className="text-gray-400 mb-4">
              Plataforma comunitaria para descubrir y compartir el significado cultural 
              detrás de la música hispanohablante.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-white transition-colors">
                <Github size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/songs" className="hover:text-white transition-colors">
                  Explorar Canciones
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h3 className="text-white font-semibold mb-4">Comunidad</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="hover:text-white transition-colors">
                  Guías de Contribución
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 Sabelo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}