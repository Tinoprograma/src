import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Clock, MessageSquare } from 'lucide-react';
import { albumService } from '../../services/albumService';

export default function AlbumTracklist({ albumId, currentSongId }) {
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (albumId) {
      fetchAlbumData();
    }
  }, [albumId]);

  const fetchAlbumData = async () => {
    try {
      setIsLoading(true);
      
      const [albumResponse, songsResponse] = await Promise.all([
        albumService.getById(albumId),
        albumService.getSongs(albumId)
      ]);
      
      setAlbum(albumResponse.album);
      setSongs(songsResponse.songs || []);
    } catch (error) {
      console.error('Error cargando tracklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!album || songs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header del Álbum */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
        <div className="flex items-center gap-4">
          {album.cover_image_url ? (
            <img
              src={album.cover_image_url}
              alt={album.title}
              className="w-20 h-20 rounded shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center">
              <Music className="text-gray-400" size={32} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-400 uppercase tracking-wide">Álbum</p>
            <h3 className="text-2xl font-bold text-white mb-1">{album.title}</h3>
            <p className="text-gray-300">
              {album.artist_name} • {album.release_year} • {songs.length} canciones
            </p>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="divide-y divide-gray-200">
        {songs.map((song) => {
          const isCurrentSong = song.id === parseInt(currentSongId);
          
          return (
            <Link
              key={song.id}
              to={`/songs/${song.id}`}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                isCurrentSong ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              {/* Número de Track */}
              <div className="w-8 text-center">
                {isCurrentSong ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <span className="text-gray-500 font-medium">
                    {song.track_number || '•'}
                  </span>
                )}
              </div>

              {/* Info de la Canción */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${
                  isCurrentSong ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {song.title}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {song.artist_name}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {song.annotation_count > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{song.annotation_count}</span>
                  </div>
                )}
                {song.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{song.duration}</span>
                  </div>
                )}
              </div>

              {/* Indicador de canción actual */}
              {isCurrentSong && (
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <Music size={16} />
                  <span>Escuchando</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {album.description && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">{album.description}</p>
        </div>
      )}
    </div>
  );
}