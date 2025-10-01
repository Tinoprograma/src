import { useState } from 'react';
import './index.css';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue) {
      setInputError('Este campo es requerido');
      return;
    }
    setInputError('');
    alert(`Valor ingresado: ${inputValue}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-600 mb-4">
            Sabelo 🎵
          </h1>
          <p className="text-xl text-gray-600">
            Componentes UI - Demostración
          </p>
        </div>

        {/* Demostración de Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Botones</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            
            <div className="flex gap-3 flex-wrap items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex gap-3">
              <Button disabled>Disabled</Button>
              <Button onClick={() => setIsModalOpen(true)}>
                Abrir Modal
              </Button>
            </div>
          </div>
        </div>

        {/* Demostración de Inputs */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Inputs</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <Input
              label="Nombre"
              placeholder="Ingresa tu nombre"
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              helperText="Nunca compartiremos tu email"
            />
            
            <Input
              label="Campo con error"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              error={inputError}
              placeholder="Intenta enviar vacío"
            />
            
            <Input
              label="Campo deshabilitado"
              disabled
              value="No se puede editar"
            />
            
            <Button type="submit" className="w-full">
              Enviar Formulario
            </Button>
          </form>
        </div>

        {/* Modal de demostración */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modal de Ejemplo"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Este es un modal de ejemplo. Puedes usar esto para formularios,
              confirmaciones, o cualquier contenido que necesites mostrar.
            </p>
            
            <Input
              label="Ejemplo de input en modal"
              placeholder="Escribe algo..."
            />
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Aceptar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;