import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">
            Sabelo 🎵
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma comunitaria para anotaciones musicales
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Frontend funcionando</h2>
            <p className="text-gray-600">
              ¡React + Vite + Tailwind configurados correctamente!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App