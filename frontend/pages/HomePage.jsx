import { Link } from 'react-router-dom';
import { Music2, MessageSquare, Users, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Descubre el significado detrás de la música
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Una plataforma comunitaria para explorar y compartir el contexto cultural 
            de tus canciones favoritas en español
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/songs">
              <Button size="lg">
                Explorar Canciones
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Unirse a la Comunidad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Cómo funciona Sabelo?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music2 className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Explora Canciones</h3>
              <p className="text-gray-600">
                Busca tus canciones favoritas en nuestra creciente biblioteca
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-accent-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lee Anotaciones</h3>
              <p className="text-gray-600">
                Descubre explicaciones sobre referencias culturales y significados ocultos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribuye</h3>
              <p className="text-gray-600">
                Comparte tu conocimiento agregando tus propias anotaciones
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-accent-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gana Reputación</h3>
              <p className="text-gray-600">
                Recibe votos positivos y construye tu reputación en la comunidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a nuestra comunidad y ayuda a otros a entender la música
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}