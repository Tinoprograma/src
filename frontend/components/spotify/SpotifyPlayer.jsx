import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ExternalLink, Music } from 'lucide-react';

export default function SpotifyPlayer({ track, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!track?.previewUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    // Cargar nueva canción
    audio.src = track.previewUrl;
    audio.load();

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [track]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-lg z-40">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <Music className="text-gray-400" size={24} />
          <p className="text-gray-400">No se encontró la canción en Spotify</p>
        </div>
      </div>
    );
  }

  if (!track.previewUrl) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-700 to-green-900 text-white p-4 shadow-lg z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {track.albumCover && (
              <img
                src={track.albumCover}
                alt={track.name}
                className="w-14 h-14 rounded shadow-md"
              />
            )}
            <div>
              <p className="font-semibold">{track.name}</p>
              <p className="text-sm text-green-200">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-green-200">
              Vista previa no disponible
            </p>
            <a
              href={track.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-900 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition-colors"
            >
              Escuchar en Spotify
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-700 to-green-900 text-white shadow-2xl z-40">
      <audio ref={audioRef} />
      
      {/* Progress Bar */}
      <div
        className="h-1 bg-green-900 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-green-400 transition-all group-hover:bg-green-300 relative"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Player Controls */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {track.albumCover && (
              <img
                src={track.albumCover}
                alt={track.name}
                className="w-14 h-14 rounded shadow-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{track.name}</p>
              <p className="text-sm text-green-200 truncate">{track.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Time */}
            <div className="text-sm text-green-200 font-mono hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="bg-white text-green-900 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            {/* Volume Control */}
            <div className="items-center gap-2 hidden lg:flex">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-green-800 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 accent-green-400"
              />
            </div>

            {/* Spotify Link */}
            <a
              href={track.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-900 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition-colors shadow-lg"
            >
              <span className="hidden sm:inline">Abrir en Spotify</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Spotify Attribution */}
      <div className="bg-green-950 py-1 px-4">
        <p className="text-center text-xs text-green-300">
          Powered by Spotify • Vista previa de 30 segundos
        </p>
      </div>
    </div>
  );
}