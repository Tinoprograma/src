import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, MessageSquare } from 'lucide-react';

export default function SongDetailPage() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch song and annotations from API
    setTimeout(() => {
      setSong({
        id: 1,
        title: "Can't Stop This",
        artist_name: "Nine Vicious",
        artist_color: "#f97316", // Color del artista
        album: "Underground Hits",
        release_year: 2024,
        lyrics: `[Intro]
(Ahmad, nigga, what the word it is?)
T-ha, no cap
I told my nigga 'bout that underground shit
(Nothing's gonna stop me) Slatt
(Nothing's gonna stop me) Say what?

[Chorus]
I'm a rockstar, poppin' my shit (Rockstar, rockstar)
I'm a popstar livin' lit (Say what?)
Really spent me some M's with the jeweler
Look at me, this how you wear a Bugatti
Opened her purse and she brung out them racks (Too many)
Literally, she in her bag`,
        view_count: 1,
        annotation_count: 2
      });
      
      // Simulación de anotaciones con posiciones en el texto
      setAnnotations([
        {
          id: 1,
          start_char: 250,
          end_char: 316,
          text_selection: "Really spent me some M's with the jeweler",
          explanation: "El precio inicial de la mayoría de los Bugattis está en múltiples millones. Porque 'Bagg gastó millones de dólares en joyería, cuando se la pone, lleva puesto el equivalente al precio de un Bugatti.",
          upvotes: 12,
          user: { username: "musicfan123" }
        },
        {
          id: 2,
          start_char: 155,
          end_char: 197,
          text_selection: "I'm a rockstar, poppin' my shit",
          explanation: "Referencia al estilo de vida de las estrellas de rock, viviendo sin límites y mostrando su éxito.",
          upvotes: 8,
          user: { username: "hiphophead" }
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const renderLyricsWithAnnotations = () => {
    if (!song || !song.lyrics) return null;

    let result = [];
    let currentIndex = 0;
    const lyrics = song.lyrics;
    
    // Ordenar anotaciones por posición
    const sortedAnnotations = [...annotations].sort((a, b) => a.start_char - b.start_char);

    sortedAnnotations.forEach((annotation) => {
      // Texto antes de la anotación
      if (currentIndex < annotation.start_char) {
        result.push(
          <span key={`text-${currentIndex}`}>
            {lyrics.substring(currentIndex, annotation.start_char)}
          </span>
        );
      }

      // Texto anotado
      const isSelected = selectedAnnotation?.id === annotation.id;
      const isHovered = hoveredAnnotation === annotation.id;
      
      result.push(
        <span
          key={`annotation-${annotation.id}`}
          className={`
            cursor-pointer transition-all duration-200 rounded px-1 -mx-1
            ${isSelected ? 'bg-yellow-300' : isHovered ? 'bg-yellow-200' : 'bg-yellow-100'}
            ${isHovered ? 'shadow-sm' : ''}
          `}
          style={{
            backgroundColor: isHovered && !isSelected ? `${song.artist_color}40` : undefined,
            borderBottom: isSelected ? `3px solid ${song.artist_color}` : undefined
          }}
          onMouseEnter={() => setHoveredAnnotation(annotation.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
          onClick={() => setSelectedAnnotation(isSelected ? null : annotation)}
        >
          {lyrics.substring(annotation.start_char, annotation.end_char)}
        </span>
      );

      currentIndex = annotation.end_char;
    });

    // Texto restante
    if (currentIndex < lyrics.length) {
      result.push(
        <span key={`text-${currentIndex}`}>
          {lyrics.substring(currentIndex)}
        </span>
      );
    }

    return result;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando canción...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Canción no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header con info de la canción */}
      <div 
        className="py-12 px-4"
        style={{ backgroundColor: `${song.artist_color}20` }}
      >
        <div className="container mx-auto max-w-5xl">
          <Link 
            to="/songs" 
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a canciones</span>
          </Link>

          <div className="flex items-start gap-6">
            {/* Cover Image Placeholder */}
            <div 
              className="w-32 h-32 rounded flex-shrink-0 flex items-center justify-center text-white text-4xl font-bold"
              style={{ backgroundColor: song.artist_color }}
            >
              {song.title.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {song.title}
              </h1>
              <Link 
                to={`/artists/${song.artist_id}`}
                className="text-xl text-gray-700 hover:underline mb-4 inline-block"
              >
                {song.artist_name}
              </Link>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {song.album && (
                  <span>{song.album}</span>
                )}
                {song.release_year && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{song.release_year}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{song.view_count} {song.view_count === 1 ? 'vista' : 'vistas'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>{song.annotation_count} {song.annotation_count === 1 ? 'anotación' : 'anotaciones'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal: Letras y Anotación */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Letras */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-base leading-loose text-gray-900">
                {renderLyricsWithAnnotations()}
              </pre>
            </div>
          </div>

          {/* Panel de anotación (sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              {selectedAnnotation ? (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                        {selectedAnnotation.user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {selectedAnnotation.user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedAnnotation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-yellow-50 rounded border-l-4" style={{ borderColor: song.artist_color }}>
                    <p className="text-gray-800 font-medium italic">
                      "{selectedAnnotation.text_selection}"
                    </p>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedAnnotation.explanation}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button className="flex items-center gap-1 hover:text-primary-600">
                      <span>👍</span>
                      <span>{selectedAnnotation.upvotes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary-600">
                      <span>👎</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">
                    Haz clic en las partes resaltadas de la letra para ver las anotaciones
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}