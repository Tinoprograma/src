import { useState } from 'react';
import { ThumbsUp, Edit, Trash2, AlertTriangle, Loader } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

export default function AnnotationItem({ 
  annotation, 
  artistColor,
  currentUser,
  onEdit,
  onDelete,
  onVote, // <--- La función que causa el problema
  onClose
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false); // Estado para el spinner

  const isOwner = currentUser?.id === annotation.user_id;
  // Usamos hasVoted para reflejar el estado del usuario logueado en esta anotación
  const hasVoted = annotation.user_has_voted; 
  const isVerified = annotation.is_verified || false;

  const handleVote = async () => {
    if (isOwner) return; // No puedes votar tu propia anotación
    
    // CORRECCIÓN CLAVE: Verifica que onVote sea una función antes de llamarla
    if (typeof onVote !== 'function') { 
      console.error('La prop onVote no fue pasada al componente.');
      return; 
    }

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
          <div className="mb-4 bg-pink-50 border border-pink-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={20} className="text-pink-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-pink-800">
              Esta anotación aún no ha sido verificada. Su contenido puede no ser preciso.
            </p>
          </div>
        )}

        <p className="text-gray-900 mb-6 whitespace-pre-wrap">{annotation.content}</p>

        {/* Acciones */}
        <div className="flex items-center gap-4 text-sm">
          {/* Botón de Voto */}
          <button
            onClick={handleVote}
            disabled={isOwner || isVoting} // Deshabilitar si es propietario o está votando
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-white transition-all
              ${hasVoted ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 hover:bg-primary-600'}
              ${isOwner || isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: hasVoted ? artistColor : undefined // Usa color del artista si ya votó
            }}
          >
            {isVoting ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <ThumbsUp size={16} />
            )}
            <span className="font-medium">{annotation.upvotes}</span>
          </button>

          <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
            Compartir
          </button>
          
          {/* Botones de edición/eliminación */}
          {isOwner && (
            <>
              <button 
                onClick={() => onEdit(annotation)} 
                className="text-gray-500 hover:text-primary-600 transition-colors text-sm flex items-center gap-1"
              >
                <Edit size={14} />
                Editar
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center gap-1"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </>
          )}

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
              onClick={handleDelete} // Usa el handler local
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}