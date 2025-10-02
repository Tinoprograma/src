import { useState } from 'react';
import { ThumbsUp, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

export default function AnnotationItem({ 
  annotation, 
  artistColor,
  currentUser,
  onEdit,
  onDelete,
  onVote,
  onClose
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const isOwner = currentUser?.id === annotation.user_id;
  const hasVoted = annotation.user_has_voted; // TODO: Obtener del backend
  const isVerified = annotation.is_verified || false;

  const handleVote = async () => {
    if (isOwner) return; // No puedes votar tu propia anotación
    
    setIsVoting(true);
    await onVote(annotation.id);
    setIsVoting(false);
  };

  const handleDelete = async () => {
    await onDelete(annotation.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        {/* Disclaimer para anotaciones no verificadas */}
        {!isVerified && (
          <div className="mb-4 bg-pink-50 border border-pink-200 rounded p-3 flex items-start gap-2">
            <AlertTriangle className="text-pink-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-pink-800">
              Esta anotación es <span className="font-semibold">no verificada</span>
            </p>
          </div>
        )}

        {/* Header con usuario */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
              {annotation.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-gray-900 block">
                {annotation.user.display_name || annotation.user.username}
              </span>
              {isVerified && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Verificada
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(annotation)}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Texto citado */}
        <div className="mb-4 p-3 bg-yellow-50 rounded border-l-4" style={{ borderColor: artistColor }}>
          <p className="text-gray-800 font-medium italic">
            "{annotation.text_selection}"
          </p>
        </div>

        {/* Explicación */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Genius Annotation
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {annotation.explanation}
          </p>
        </div>

        {/* Contexto cultural (si existe) */}
        {annotation.cultural_context && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Contexto Cultural:
            </p>
            <p className="text-sm text-blue-800">
              {annotation.cultural_context}
            </p>
          </div>
        )}

        {/* Botones de interacción */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <button
            onClick={handleVote}
            disabled={isOwner || isVoting}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded transition-colors
              ${hasVoted 
                ? 'bg-primary-100 text-primary-700' 
                : 'hover:bg-gray-100 text-gray-600'
              }
              ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <ThumbsUp size={16} />
            <span className="font-medium">{annotation.upvotes}</span>
          </button>

          <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
            Compartir
          </button>
        </div>

        {/* Info del propietario */}
        {isOwner && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Eres el propietario de esta anotación
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Anotación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que quieres eliminar esta anotación? Esta acción no se puede deshacer.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}