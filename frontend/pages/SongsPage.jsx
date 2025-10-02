import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Music, Plus } from 'lucide-react';
import { songService } from '../services/songService';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function SongsPage() {
  const { isAuthenticated } = useAuth();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const response = await songService.getAll();
      setSongs(response.songs || []);
    } catch (error) {
      console.error('Error cargando canciones:', error);
      toast.error('Error cargando canciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      fetchSongs();
      return;
    }

    try {
      setIsLoading(true);
      const response = await songService.getAll({ search: searchTerm });
      setSongs(response.songs || []);
    } catch (error) {
      console.error('Error buscando:', error);
      toast.error('Error buscando canciones');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Explorar Canciones
        </h1>
        <p className="text-gray-600">
          Descubre y anota canciones de la música hispanohablante
        </p>
      </div>
      
      {isAuthenticated && (
        <Link to="/songs/create">
          <Button>
            <Plus size={20} className="mr-2" />
            Agregar Canción
          </Button>
        </Link>
      )}
    </div>
      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-8">
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
          <Button type="submit" variant="primary">
            Buscar
          </Button>
          {searchTerm && (
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                fetchSongs();
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </form>

      {/* Songs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando canciones...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Music className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron canciones' : 'No hay canciones todavía'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Sé el primero en agregar una canción a la plataforma'
            }
          </p>
          {searchTerm && (
            <Button onClick={() => {
              setSearchTerm('');
              fetchSongs();
            }}>
              Ver todas las canciones
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            {songs.length} {songs.length === 1 ? 'canción encontrada' : 'canciones encontradas'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Link 
                key={song.id} 
                to={`/songs/${song.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {song.title}
                </h3>
                <p className="text-gray-600 mb-4">{song.artist_name}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{song.annotation_count || 0} anotaciones</span>
                  <span>{song.view_count || 0} vistas</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}