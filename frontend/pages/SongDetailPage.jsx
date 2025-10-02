import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, MessageSquare } from 'lucide-react';
import AnnotationForm from '../components/annotations/AnnotationForm';
import AnnotationItem from '../components/annotations/AnnotationItem';
import Button from '../components/ui/Button';

export default function SongDetailPage() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Para crear nueva anotación
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  
  // Simulación de autenticación
  const { isAuthenticated, user } = useAuth(); // Obtener del contexto de auth

  useEffect(() => {
    // TODO: Fetch song and annotations from API
    setTimeout(() => {
      setSong({
        id: 1,
        title: "Can't Stop This",
        artist_name: "Nine Vicious",
        artist_color: "#2563eb",
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
If I got caught by the cops, I ain't tellin' shit (Tellin' shit)
Pullin' up with Drac's, pullin' up with sticks (Boom, boom)

[Verse]
Nothin' gonna stop me, what ya' talkin' 'bout, shawty? (Stop me)
Nothin' gonna stop me, what ya' talkin' 'bout, shawty? (Stop this)
(Nothing's gonna stop me) Woah, woah
(Nothing's gonna stop me) Woah`,
        view_count: 1,
        annotation_count: 1
      });
      
    setAnnotations([
    {
        id: 1,
        user_id: 123,
        start_char: 203,
        end_char: 227,
        text_selection: "poppin' my shit",
        explanation: "Expresión del hip-hop que significa presumir o alardear sobre sus logros, éxito, dinero o estilo de vida.",
        cultural_context: "Este término se popularizó en la cultura hip-hop de los años 2000.",
        upvotes: 12,
        is_verified: false,
        user_has_voted: false,
        user: { 
        id: 123,
        username: "musicfan123", 
        display_name: "Music Fan" 
        }
    }
    ]);
      
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedString = selection.toString().trim();
    
    if (selectedString.length > 0) {
      const range = selection.getRangeAt(0);
      const lyricsContainer = document.getElementById('lyrics-container');
      
      if (lyricsContainer && lyricsContainer.contains(range.commonAncestorContainer)) {
        // Calcular posición en el texto completo
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(lyricsContainer);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selectedString.length;
        
        setSelectedText(selectedString);
        setSelectionRange({ start, end });
        setShowAnnotationForm(true);
        setSelectedAnnotation(null);
      }
    }
  };

  const handleAnnotationSubmit = (annotationData) => {
    // TODO: Enviar al backend y actualizar lista
    const newAnnotation = {
      id: annotations.length + 1,
      ...annotationData,
      upvotes: 0,
      downvotes: 0,
      user: { username: "current_user", display_name: "Tú" }
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setShowAnnotationForm(false);
    setSelectedText('');
    setSelectionRange(null);
    
    // Mostrar la nueva anotación
    setSelectedAnnotation(newAnnotation);
  };

  const renderLyricsWithAnnotations = () => {
    if (!song || !song.lyrics) return null;

    let result = [];
    let currentIndex = 0;
    const lyrics = song.lyrics;
    
    const sortedAnnotations = [...annotations].sort((a, b) => a.start_char - b.start_char);

    sortedAnnotations.forEach((annotation) => {
      if (currentIndex < annotation.start_char) {
        result.push(
          <span key={`text-${currentIndex}`}>
            {lyrics.substring(currentIndex, annotation.start_char)}
          </span>
        );
      }

      const isSelected = selectedAnnotation?.id === annotation.id;
      const isHovered = hoveredAnnotation === annotation.id;
      
      result.push(
        <span
          key={`annotation-${annotation.id}`}
          className={`
            cursor-pointer transition-all duration-200 rounded px-1 -mx-1
            ${isSelected ? 'bg-yellow-300 font-medium' : 'bg-yellow-100'}
          `}
          style={{
            backgroundColor: isHovered && !isSelected ? `${song.artist_color}30` : undefined,
            borderBottom: isSelected ? `3px solid ${song.artist_color}` : undefined
          }}
          onMouseEnter={() => setHoveredAnnotation(annotation.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
          onClick={() => {
            setSelectedAnnotation(isSelected ? null : annotation);
            setShowAnnotationForm(false);
          }}
        >
          {lyrics.substring(annotation.start_char, annotation.end_char)}
        </span>
      );

      currentIndex = annotation.end_char;
    });

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
      {/* Header */}
      <div 
        className="py-12 px-4"
        style={{ backgroundColor: `${song.artist_color}15` }}
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
                {song.album && <span>{song.album}</span>}
                {song.release_year && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{song.release_year}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{song.view_count} vista{song.view_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>{song.annotation_count} anotación{song.annotation_count !== 1 ? 'es' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Letras */}
          <div className="lg:col-span-3">
            <div 
              id="lyrics-container"
              className="prose prose-lg max-w-none select-text"
              onMouseUp={handleTextSelection}
            >
              <pre className="whitespace-pre-wrap font-sans text-base leading-loose text-gray-900">
                {renderLyricsWithAnnotations()}
              </pre>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Formulario de nueva anotación */}
              {showAnnotationForm && (
                isAuthenticated ? (
                  <AnnotationForm
                    selectedText={selectedText}
                    selectionRange={selectionRange}
                    songId={song.id}
                    onClose={() => {
                      setShowAnnotationForm(false);
                      setSelectedText('');
                      setSelectionRange(null);
                    }}
                    onSubmit={handleAnnotationSubmit}
                  />
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      Inicia sesión para crear anotaciones
                    </p>
                    <Link to="/login">
                      <Button>Iniciar Sesión</Button>
                    </Link>
                  </div>
                )
              )}

              {/* Anotación seleccionada */}
                {selectedAnnotation && !showAnnotationForm && (
                <AnnotationItem
                    annotation={selectedAnnotation}
                    artistColor={song.artist_color}
                    currentUser={user} // Obtener del contexto de auth
                    onEdit={(annotation) => {
                    // TODO: Implementar edición
                    console.log('Editar anotación:', annotation);
                    }}
                    onDelete={(annotationId) => {
                    // TODO: Implementar eliminación en el backend
                    setAnnotations(annotations.filter(a => a.id !== annotationId));
                    setSelectedAnnotation(null);
                    }}
                    onVote={async (annotationId) => {
                    // TODO: Enviar voto al backend
                    setAnnotations(annotations.map(a => 
                        a.id === annotationId 
                        ? { ...a, upvotes: a.upvotes + 1, user_has_voted: true }
                        : a
                    ));
                    }}
                    onClose={() => setSelectedAnnotation(null)}
                />
                )}

              {/* Estado por defecto */}
              {!selectedAnnotation && !showAnnotationForm && (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">
                    Haz clic en las partes resaltadas para ver anotaciones
                  </p>
                  <p className="text-sm text-gray-500">
                    O selecciona texto para crear una nueva
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