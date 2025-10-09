import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function AnnotationEditModal({ annotation, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    explanation: annotation.explanation || '',
    cultural_context: annotation.cultural_context || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'La explicación es requerida';
    } else if (formData.explanation.trim().length < 10) {
      newErrors.explanation = 'La explicación debe tener al menos 10 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(annotation.id, formData);
    } catch (error) {
      console.error('Error updating annotation:', error);
      setErrors({ submit: 'Error al actualizar la anotación' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Editar Anotación
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Texto seleccionado (no editable) */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2">
            Texto seleccionado
          </div>
          <blockquote className="pl-4 border-l-4 border-blue-600 italic text-gray-700">
            "{annotation.text_selection}"
          </blockquote>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Explicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explicación <span className="text-red-500">*</span>
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.explanation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Explica el significado del texto seleccionado..."
            />
            {errors.explanation && (
              <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.explanation.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Contexto Cultural */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contexto Cultural <span className="text-gray-400">(Opcional)</span>
            </label>
            <textarea
              name="cultural_context"
              value={formData.cultural_context}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agrega contexto cultural, referencias históricas o regionalismos..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Información adicional sobre el contexto de la letra
            </p>
          </div>

          {/* Error de submit */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}