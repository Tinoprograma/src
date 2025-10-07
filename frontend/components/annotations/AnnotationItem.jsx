import { useState } from 'react';
import { ThumbsUp, Edit2, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function AnnotationItem({ 
  annotation, 
  artistColor, 
  currentUser, 
  onEdit, 
  onDelete, 
  onVote,
  onClose 
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const isOwner = currentUser && currentUser.id === annotation.user_id;
  const score = (annotation.upvotes || 0) - (annotation.downvotes || 0);

  const handleVote = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    if (isVoting) return;

    try {
      setIsVoting(true);
      await onVote(annotation.id);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta anotación?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(annotation.id);
    } catch (error) {
      console.error('Error deleting:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between"
        style={{ 
          backgroundColor: `${artistColor}15`,
          borderBottom: `2px solid ${artistColor}`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: artistColor }}
          >
            {annotation.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {annotation.display_name || annotation.username || 'Usuario'}
              </span>
              {annotation.is_verified && (
                <CheckCircle 
                  size={16} 
                  className="text-blue-600" 
                  title="Anotación verificada"
                />
              )}
            </div>
            <span className="text-sm text-gray-600">
              {annotation.reputation_score || 0} puntos de reputación
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Contenido */}
      <div className="px-6 py-4">
        {/* Texto seleccionado */}
        <div className="mb-4">
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2">
            Texto seleccionado
          </div>
          <blockquote 
            className="pl-4 border-l-4 italic text-gray-700"
            style={{ borderColor: artistColor }}
          >
            "{annotation.text_selection}"
          </blockquote>
        </div>

        {/* Advertencia si no está verificada */}
        {!annotation.is_verified && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Esta anotación aún no ha sido verificada. Su contenido puede no ser preciso.
            </div>
          </div>
        )}

        {/* Explicación */}
        <div className="mb-4">
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2">
            Explicación
          </div>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {annotation.explanation || 'Sin explicación disponible.'}
          </p>
        </div>

        {/* Contexto cultural */}
        {annotation.cultural_context && (
          <div className="mb-4">
            <div className="text-xs uppercase text-gray-500 font-semibold mb-2">
              Contexto Cultural
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
              {annotation.cultural_context}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Votos */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={isVoting || !currentUser}
              className={`flex items-center gap-2 ${
                annotation.user_has_voted ? 'text-blue-600' : ''
              }`}
            >
              <ThumbsUp size={18} />
              <span className="font-semibold">{score}</span>
            </Button>
            
            <span className="text-sm text-gray-500">
              {annotation.upvotes || 0} votos positivos
            </span>
          </div>

          {/* Acciones del propietario */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(annotation)}
                className="flex items-center gap-2"
              >
                <Edit2 size={16} />
                Editar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
          <span>
            Creada {new Date(annotation.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          {annotation.updated_at !== annotation.created_at && (
            <span>
              Editada {new Date(annotation.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
        </div>
      </div>

      {/* Footer - Solo si eres dueño */}
      {isOwner && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Eres el propietario de esta anotación
          </p>
        </div>
      )}
    </div>
  );
}