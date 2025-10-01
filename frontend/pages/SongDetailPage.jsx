import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Music, User, Calendar, Eye } from 'lucide-react';

export default function SongDetailPage() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch song from API
    setTimeout(() => {
      setSong({
        id: 1,
        title: "Ejemplo de Canción",
        artist_name: "Artista Ejemplo",
        album: "Álbum Ejemplo",
        release_year: 2024,
        lyrics: "Aquí irían las letras de la canción...\n\nCon múltiples líneas\nY versos...",
        view_count: 150,
        annotation_count: 5
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Cargando canción...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Canción no encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Song Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {song.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{song.artist_name}</p>
            
            <div className="flex gap-4 text-sm text-gray-500">
              {song.album && (
                <div className="flex items-center gap-1">
                  <Music size={16} />
                  <span>{song.album}</span>
                </div>
              )}
              {song.release_year && (
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{song.release_year}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{song.view_count} vistas</span>
              </div>
            </div>
          </div>

          {/* Lyrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Letra</h2>
            <div className="whitespace-pre-line font-mono text-gray-800 leading-relaxed">
              {song.lyrics}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h3 className="text-xl font-semibold mb-4">
              Anotaciones ({song.annotation_count})
            </h3>
            
            {song.annotation_count === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No hay anotaciones todavía. ¡Sé el primero en agregar una!
              </p>
            ) : (
              <div className="space-y-4">
                {/* TODO: Mostrar lista de anotaciones */}
                <p className="text-gray-600">Las anotaciones aparecerán aquí...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}