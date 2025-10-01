import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Music } from 'lucide-react';
import Button from '../components/ui/Button';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch songs from API
    setTimeout(() => {
      setSongs([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Explorar Canciones
        </h1>
        <p className="text-gray-600">
          Descubre y anota canciones de la música hispanohablante
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, artista o álbum..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <Button variant="primary">
            Buscar
          </Button>
        </div>
      </div>

      {/* Songs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando canciones...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Music className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay canciones todavía
          </h3>
          <p className="text-gray-600 mb-6">
            Sé el primero en agregar una canción a la plataforma
          </p>
          <Button>Agregar Canción</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <Link 
              key={song.id} 
              to={`/songs/${song.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {song.title}
              </h3>
              <p className="text-gray-600 mb-4">{song.artist_name}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{song.annotation_count} anotaciones</span>
                <span>{song.view_count} vistas</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}