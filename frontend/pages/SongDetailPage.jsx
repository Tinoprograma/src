import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, MessageSquare, Music } from 'lucide-react';
import AnnotationForm from '../components/annotations/AnnotationForm';
import AnnotationItem from '../components/annotations/AnnotationItem';
import AnnotationEditModal from '../components/annotations/AnnotationEditModal';
import SpotifyPlayer from '../components/spotify/SpotifyPlayer';
import { useAuth } from '../components/auth/AuthContext';
import { songService } from '../services/songService';
import { annotationService } from '../services/annotationService';
import { spotifyService } from '../components/spotify/spotifyService';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function SongDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [song, setSong] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 👇 NUEVO: Estado para Spotify
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  
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
      const fetchedAnnotations = annotationsResponse.annotations || [];
      
      // Ordenar anotaciones según criterio
      const sortedAnnotations = [...fetchedAnnotations].sort((a, b) => {
        if (a.is_verified !== b.is_verified) {
          return a.is_verified ? -1 : 1;
        }
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      setAnnotations(sortedAnnotations);
      
      // 👇 NUEVO: Buscar en Spotify
      fetchSpotifyTrack(songResponse.song);
      
      console.log('✅ Canción y anotaciones cargadas');
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando la canción');
    } finally {
      setIsLoading(false);
    }
  };

const fetchSpotifyTrack = async (songData) => {
  try {
    setIsLoadingSpotify(true);
    
    // Debug: Ver estructura del objeto song
    console.log('🔍 Song data completo:', songData);
    
    // Si ya tiene spotify_track_id guardado, usarlo
    if (songData.spotify_track_id) {
      const track = await spotifyService.getTrack(songData.spotify_track_id);
      setSpotifyTrack(track);
      return;
    }
    
    // Extraer nombre del artista de diferentes posibles campos
    const artistName = songData.artist_name || 
                      songData.artist?.name || 
                      songData.Artist?.name ||
                      'Unknown Artist';
    
    // Extraer título del álbum
    const albumTitle = songData.album_title ||
                      songData.album?.title ||
                      songData.Album?.title ||
                      null;
    
    console.log('🎵 Buscando en Spotify:', {
      title: songData.title,
      artist: artistName,
      album: albumTitle,
      year: songData.release_year
    });
    
    // Si no, buscar por título y artista
    const track = await spotifyService.searchTrackAdvanced(
      songData.title,
      artistName,
      albumTitle,
      songData.release_year
    );
    
    setSpotifyTrack(track);
    
    // Opcional: Guardar el spotify_track_id en el backend para futuras consultas
    if (track && track.id) {
      console.log('💡 Spotify track encontrado:', track.id);
    }
    
  } catch (error) {
    console.error('Error buscando en Spotify:', error);
  } finally {
    setIsLoadingSpotify(false);
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
      
      const newAnnotation = response.annotation;
      const updatedAnnotations = [...annotations, newAnnotation];
      
      const sortedAnnotations = updatedAnnotations.sort((a, b) => {
        if (a.is_verified !== b.is_verified) {
          return a.is_verified ? -1 : 1;
        }
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      setAnnotations(sortedAnnotations);
      setShowAnnotationForm(false);
      setSelectedText('');
      setSelectionRange(null);
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
      
      const sortedAnnotations = updatedAnnotations.sort((a, b) => {
        if (a.is_verified !== b.is_verified) {
          return a.is_verified ? -1 : 1;
        }
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      setAnnotations(sortedAnnotations);
      
      if (selectedAnnotation?.id === annotationId) {
        const updated = sortedAnnotations.find(a => a.id === annotationId);
        setSelectedAnnotation(updated);
      }
      
      toast.success('Voto registrado');
    } catch (error) {
      console.error('Error votando:', error);
      toast.error('Error al votar');
    }
  };

  const handleDelete = async (annotationId) => {
    try {
      await annotationService.delete(annotationId);
      setAnnotations(annotations.filter(a => a.id !== annotationId));
      setSelectedAnnotation(null);
      toast.success('Anotación eliminada');
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (annotation) => {
    setEditingAnnotation(annotation);
  };

  const handleEditSubmit = async (annotationId, updatedData) => {
    try {
      const response = await annotationService.update(annotationId, updatedData);
      
      const updatedAnnotations = annotations.map(a => 
        a.id === annotationId ? response.annotation : a
      );
      
      setAnnotations(updatedAnnotations);
      
      if (selectedAnnotation?.id === annotationId) {
        setSelectedAnnotation(response.annotation);
      }
      
      setEditingAnnotation(null);
      toast.success('Anotación actualizada');
    } catch (error) {
      console.error('Error actualizando:', error);
      toast.error('Error al actualizar la anotación');
    }
  };

  const getFeaturedAnnotationForRange = (start, end) => {
    const overlappingAnnotations = annotations.filter(a => {
      return !(a.end_char <= start || a.start_char >= end);
    });
    
    if (overlappingAnnotations.length === 0) return null;
    return overlappingAnnotations[0];
  };

  const renderLyricsWithAnnotations = () => {
    if (!song || !song.lyrics) return null;

    let result = [];
    let currentIndex = 0;
    const lyrics = song.lyrics;
    
    const processedRanges = [];
    const featuredAnnotations = [];
    
    const sortedByPosition = [...annotations].sort((a, b) => a.start_char - b.start_char);
    
    sortedByPosition.forEach(annotation => {
      const hasOverlap = processedRanges.some(range => {
        return !(annotation.end_char <= range.start || annotation.start_char >= range.end);
      });
      
      if (!hasOverlap) {
        featuredAnnotations.push(annotation);
        processedRanges.push({
          start: annotation.start_char,
          end: annotation.end_char
        });
      }
    });

    featuredAnnotations.forEach((annotation) => {
      if (currentIndex < annotation.start_char) {
        result.push(
          <span key={`text-${currentIndex}`}>
            {lyrics.substring(currentIndex, annotation.start_char)}
          </span>
        );
      }

      const isSelected = selectedAnnotation?.id === annotation.id;
      const isHovered = hoveredAnnotation === annotation.id;
      
      const annotationsInRange = annotations.filter(a => {
        return !(a.end_char <= annotation.start_char || a.start_char >= annotation.end_char);
      });
      
      result.push(
        <span
          key={`annotation-${annotation.id}`}
          className={`
            cursor-pointer transition-all duration-200 rounded px-1 -mx-1 relative
            ${isSelected ? 'bg-yellow-300 font-medium' : 'bg-yellow-100'}
            ${isHovered ? 'bg-yellow-200' : ''}
          `}
          style={{
            borderBottom: isSelected ? `3px solid ${song.artist_color || '#2563eb'}` : '2px solid #fbbf24'
          }}
          onMouseEnter={() => setHoveredAnnotation(annotation.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
          onClick={() => {
            if (annotationsInRange.length > 1) {
              const currentIndex = annotationsInRange.findIndex(a => a.id === selectedAnnotation?.id);
              const nextIndex = (currentIndex + 1) % annotationsInRange.length;
              setSelectedAnnotation(annotationsInRange[nextIndex]);
            } else {
              setSelectedAnnotation(isSelected ? null : annotation);
            }
            setShowAnnotationForm(false);
          }}
        >
          {lyrics.substring(annotation.start_char, annotation.end_char)}
          
          {annotationsInRange.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {annotationsInRange.length}
            </span>
          )}
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

  const getAnnotationsForSelected = () => {
    if (!selectedAnnotation) return [];
    
    return annotations.filter(a => {
      return !(a.end_char <= selectedAnnotation.start_char || 
               a.start_char >= selectedAnnotation.end_char);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando canción...</p>
        </div>
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

  const annotationsForSelected = getAnnotationsForSelected();

  return (
    <div className="min-h-screen bg-white pb-32">
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
                
                {/* 👇 NUEVO: Indicador de Spotify */}
                {isLoadingSpotify && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Music size={16} className="animate-pulse" />
                    <span>Buscando en Spotify...</span>
                  </div>
                )}
                {!isLoadingSpotify && spotifyTrack && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Music size={16} />
                    <span>Disponible en Spotify</span>
                  </div>
                )}
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
                <div className="space-y-4">
                  <AnnotationItem
                    key={selectedAnnotation.id}
                    annotation={selectedAnnotation}
                    artistColor={song.artist_color || '#2563eb'}
                    currentUser={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onVote={handleVote}
                    onClose={() => setSelectedAnnotation(null)}
                  />
                  
                  {annotationsForSelected.length > 1 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Otras anotaciones para este texto ({annotationsForSelected.length - 1})
                      </h3>
                      <div className="space-y-2">
                        {annotationsForSelected
                          .filter(a => a.id !== selectedAnnotation.id)
                          .map(annotation => (
                            <button
                              key={annotation.id}
                              onClick={() => setSelectedAnnotation(annotation)}
                              className="w-full text-left p-3 bg-white rounded border border-gray-200 hover:border-blue-400 hover:shadow transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {annotation.display_name || annotation.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                  👍 {(annotation.upvotes || 0) - (annotation.downvotes || 0)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {annotation.explanation}
                              </p>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Modal de edición */}
      {editingAnnotation && (
        <AnnotationEditModal
          annotation={editingAnnotation}
          onClose={() => setEditingAnnotation(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 👇 NUEVO: Reproductor de Spotify */}
      <SpotifyPlayer track={spotifyTrack} />
    </div>
  );
}