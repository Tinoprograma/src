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

  useEffect(() => { fetchSongs(); }, []);

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
    if (!searchTerm.trim()) { fetchSongs(); return; }
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
    <div className="bg-white">
      {/* cinta superior suave */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-400 via-emerald-300 to-sky-400" />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Explorar canciones
            </h1>
            <p className="mt-2 text-gray-600">
              Descubrí y anotá canciones de la música hispanohablante.
            </p>
          </div>

          {isAuthenticated && (
            <Link to="/songs/create" className="md:mb-1">
              <Button className="rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm">
                <Plus size={18} className="mr-2" />
                Agregar canción
              </Button>
            </Link>
          )}
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm mb-8"
          role="search"
          aria-label="Buscar canciones"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                aria-hidden
              />
              <input
                type="text"
                placeholder="Buscar por título, artista o álbum…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-fuchsia-300 transition"
              />
            </label>

            <div className="flex gap-2 sm:gap-3">
              <Button type="submit" variant="primary" className="rounded-full">
                Buscar
              </Button>

              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => { setSearchTerm(''); fetchSongs(); }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200">
              <Music className="text-gray-400" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {searchTerm ? 'No se encontraron canciones' : 'No hay canciones todavía'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm
                ? 'Probá con otros términos de búsqueda.'
                : 'Sé la primera persona en agregar una canción a la plataforma.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              {searchTerm && (
                <Button onClick={() => { setSearchTerm(''); fetchSongs(); }} className="rounded-full">
                  Ver todas las canciones
                </Button>
              )}
              {isAuthenticated && (
                <Link to="/songs/create">
                  <Button className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                    <Plus size={18} className="mr-2" />
                    Agregar canción
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Counter badge */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {songs.length} {songs.length === 1 ? 'canción encontrada' : 'canciones encontradas'}
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <Link
                  key={song.id}
                  to={`/songs/${song.id}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-fuchsia-600 transition">
                    {song.title}
                  </h3>
                  <p className="mt-1 text-gray-600">{song.artist_name}</p>

                  <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                      {(song.annotation_count ?? 0)} anotaciones
                    </span>
                    <span>{(song.view_count ?? 0)} vistas</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
