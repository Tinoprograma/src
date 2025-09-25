// frontend/src/App.jsx
import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-600 mb-4">
            Sabelo 🎵
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma comunitaria para anotaciones musicales
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">¡Proyecto en desarrollo!</h2>
            <p className="text-gray-600 mb-4">
              Contador de prueba: <span className="font-bold text-primary-600">{count}</span>
            </p>
            <button 
              onClick={() => setCount(count + 1)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Incrementar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App