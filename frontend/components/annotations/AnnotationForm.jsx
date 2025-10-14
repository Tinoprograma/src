import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { annotationService } from '../../services/annotationService';
import toast from 'react-hot-toast';

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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Validación mejorada
  const validate = () => {
    const newErrors = {};

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'La explicación es requerida';
    } else if (formData.explanation.trim().length < 10) {
      newErrors.explanation = 'La explicación debe tener al menos 10 caracteres';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ FIJO: Enviar al backend de verdad
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const annotationData = {
        song_id: songId,
        text_selection: selectedText,
        start_char: selectionRange.start,
        end_char: selectionRange.end,
        explanation: formData.explanation.trim(),
        cultural_context: formData.cultural_context.trim() || null
      };

      console.log('📝 Creando anotación:', annotationData);

      // ✅ Llamar al servicio real (no fake setTimeout)
      const response = await annotationService.create(annotationData);
      
      console.log('✅ Anotación creada:', response.annotation);

      toast.success('Anotación creada exitosamente');
      
      // Pasar la anotación creada al componente padre
      onSubmit(response.annotation);
      
      // Limpiar formulario
      setFormData({
        explanation: '',
        cultural_context: ''
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Error creando anotación:', error);
      const message = error.response?.data?.message || 'Error al crear la anotación';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Crear Anotación</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
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
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            required
            rows={4}
            disabled={isSubmitting}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.explanation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="No pongas solo la letra con tus propias palabras—¡comparte conocimiento!"
          />
          {errors.explanation && (
            <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.explanation.length}/10 caracteres mínimo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contexto Cultural (Opcional)
          </label>
          <textarea
            name="cultural_context"
            value={formData.cultural_context}
            onChange={handleChange}
            rows={3}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Agrega contexto histórico, cultural o referencias..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Información adicional sobre el contexto de la letra
          </p>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
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