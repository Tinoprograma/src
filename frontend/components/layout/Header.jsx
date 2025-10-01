import { Link } from 'react-router-dom';
import { Music, Search, User, LogIn } from 'lucide-react';
import Button from '../ui/Button';

export default function Header() {
  const isAuthenticated = false; // TODO: Obtener del contexto de auth

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Music className="text-primary-600" size={32} />
            <span className="text-2xl font-bold text-primary-600">Sabelo</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar canciones, artistas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link to="/songs" className="text-gray-700 hover:text-primary-600 font-medium">
              Canciones
            </Link>
            
            {isAuthenticated ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User size={20} />
                  <span className="ml-2">Perfil</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn size={20} />
                    <span className="ml-2">Iniciar Sesión</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}