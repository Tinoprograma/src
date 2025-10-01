import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-linear-to-br from-primary-50 to-accent-50 min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Sabelo 🎵
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Descubre el significado cultural detrás de la música hispanohablante
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Una plataforma comunitaria para explorar, anotar y compartir el contexto cultural de tus canciones favoritas
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              to="/songs"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Explorar Canciones
            </Link>
            <Link 
              to="/register"
              className="bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}