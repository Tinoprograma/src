import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Music, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Button from '../ui/Button';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear scroll cuando el menú está abierto (mobile)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      {/* franja superior en degradé */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-400 via-emerald-300 to-sky-400" />

      {/* barra principal */}
      <div className="bg-white/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="group flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 border border-fuchsia-200">
                <Music className="text-fuchsia-600 group-hover:scale-105 transition" size={20} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-gray-900">SABELO</span>
                <span className="ml-1 bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-sky-500 bg-clip-text text-transparent">
                  Lyrics
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {/* Admin Link */}
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 font-medium transition"
                >
                  <Shield size={20} />
                  Admin
                </Link>
              )}

              {/* Canciones Link */}
              <Link
                to="/songs"
                className="px-3 py-2 text-gray-700 font-medium hover:text-gray-900 hover:underline underline-offset-4 decoration-fuchsia-400/60 rounded-lg transition"
              >
                Canciones
              </Link>

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200">
                    <User size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.display_name || user?.username}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <LogIn size={18} />
                      <span>Iniciar Sesión</span>
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile toggle */}
            <button
              aria-label="Abrir menú"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Overlay + Panel */}
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 md:hidden
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="navigation"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 border border-fuchsia-200">
              <Music className="text-fuchsia-600" size={18} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">SABELO</span>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-2">
          {/* Admin Link */}
          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 font-medium"
            >
              <Shield size={20} />
              Admin
            </Link>
          )}

          {/* Canciones Link */}
          <Link
            to="/songs"
            className="px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-medium"
          >
            Canciones
          </Link>

          <div className="my-2 h-px bg-gray-200" />

          {/* Auth Section */}
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-3 rounded-lg border border-gray-200">
                <User size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.display_name || user?.username}
                </span>
              </div>
              <Button
                variant="ghost"
                className="mt-2 justify-start text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={logout}
              >
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <LogIn size={18} className="mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button
                  variant="primary"
                  className="w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm"
                >
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}