import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function AnnotationForm({ 
  selectedText, 
  selectionRange, 
  songId,
  onClose, 
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    explanation: '',
    cultural_context: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const annotationData = {
      song_id: songId,
      text_selection: selectedText,
      start_char: selectionRange.start,
      end_char: selectionRange.end,
      explanation: formData.explanation,
      cultural_context: formData.cultural_context
    };

    // TODO: Enviar al backend
    console.log('Creating annotation:', annotationData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(annotationData);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Crear Anotación</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-3 bg-yellow-50 rounded border-l-4 border-primary-500">
        <p className="text-sm text-gray-600 mb-1">Texto seleccionado:</p>
        <p className="text-gray-800 font-medium italic">
          "{selectedText}"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Explicación <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="No pongas solo la letra con tus propias palabras—¡comparte conocimiento!"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 10 caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contexto Cultural (Opcional)
          </label>
          <textarea
            value={formData.cultural_context}
            onChange={(e) => setFormData({ ...formData, cultural_context: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Agrega contexto histórico, cultural o referencias..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || formData.explanation.length < 10}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Anotación'}
          </Button>
        </div>
      </form>
    </div>
  );
}