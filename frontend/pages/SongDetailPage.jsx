import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, MessageSquare } from 'lucide-react';
import AnnotationForm from '../components/annotations/AnnotationForm';
import AnnotationItem from '../components/annotations/AnnotationItem';
import { useAuth } from '../components/auth/AuthContext';
import { songService } from '../services/songService';
import { annotationService } from '../services/annotationService';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function SongDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [song, setSong] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);

  useEffect(() => {
    fetchSongData();
  }, [id]);

  const fetchSongData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener canción desde el backend
      const songResponse = await songService.getById(id);
      setSong(songResponse.song);
      
      // Obtener anotaciones desde el backend
      const annotationsResponse = await annotationService.getBySongId(id);
      setAnnotations(annotationsResponse.annotations || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando la canción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedString = selection.toString().trim();
    
    if (selectedString.length > 0) {
      const range = selection.getRangeAt(0);
      const lyricsContainer = document.getElementById('lyrics-container');
      
      if (lyricsContainer && lyricsContainer.contains(range.commonAncestorContainer)) {
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

  const handleAnnotationSubmit = async (annotationData) => {
    try {
      const response = await annotationService.create(annotationData);
      
      // Agregar la nueva anotación a la lista
      const newAnnotation = response.annotation;
      setAnnotations([...annotations, newAnnotation]);
      
      // Limpiar formulario
      setShowAnnotationForm(false);
      setSelectedText('');
      setSelectionRange(null);
      
      // Mostrar la nueva anotación
      setSelectedAnnotation(newAnnotation);
      
      toast.success('Anotación creada exitosamente');
    } catch (error) {
      console.error('Error creando anotación:', error);
      toast.error(error.response?.data?.message || 'Error creando anotación');
    }
  };

  const handleVote = async (annotationId) => {
    try {
      await annotationService.vote(annotationId, 'up');
      
      // Actualizar las anotaciones localmente
      const updatedAnnotations = annotations.map(a => {
        if (a.id === annotationId) {
          return {
            ...a,
            upvotes: a.upvotes + (a.user_has_voted ? -1 : 1),
            user_has_voted: !a.user_has_voted
          };
        }
        return a;
      });
      
      setAnnotations(updatedAnnotations);
      
      // Actualizar la anotación seleccionada si es la misma
      if (selectedAnnotation?.id === annotationId) {
        const updated = updatedAnnotations.find(a => a.id === annotationId);
        setSelectedAnnotation(updated);
      }
      
    } catch (error) {
      console.error('Error votando:', error);
      toast.error('Error al votar');
    }
  };

  const handleDelete = async (annotationId) => {
    try {
      await annotationService.delete(annotationId);
      
      // Remover la anotación de la lista
      setAnnotations(annotations.filter(a => a.id !== annotationId));
      setSelectedAnnotation(null);
      
      toast.success('Anotación eliminada');
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = async (annotation) => {
    // TODO: Implementar modal de edición
    console.log('Editar anotación:', annotation);
    toast.info('Función de edición en desarrollo');
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
        <div className="text-center">
          <p className="text-gray-600 mb-4">Canción no encontrada</p>
          <Link to="/songs">
            <Button>Volver a canciones</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div 
        className="py-12 px-4"
        style={{ backgroundColor: `${song.artist_color || '#2563eb'}15` }}
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
              style={{ backgroundColor: song.artist_color || '#2563eb' }}
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
                  <span>{annotations.length} anotación{annotations.length !== 1 ? 'es' : ''}</span>
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

              {selectedAnnotation && !showAnnotationForm && (
                <AnnotationItem
                  annotation={selectedAnnotation}
                  artistColor={song.artist_color || '#2563eb'}
                  currentUser={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onVote={handleVote}
                  onClose={() => setSelectedAnnotation(null)}
                />
              )}

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