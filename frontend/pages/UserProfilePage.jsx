import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const userResponse = await userService.getByUsername(username);
      setUser(userResponse.user);
      
      const statsResponse = await userService.getStats(username);
      setStats(statsResponse.stats);
      
      const annotationsResponse = await userService.getAnnotations(username);
      setAnnotations(annotationsResponse.annotations || []);
      
    } catch (error) {
      console.error('Error cargando perfil:', error);
      toast.error('Error cargando perfil de usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{user.display_name || user.username}</h1>
          <p className="text-gray-600 mt-2">@{user.username}</p>
          
          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.annotations_count}</p>
                <p className="text-sm text-gray-600">Anotaciones</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.upvotes_received}</p>
                <p className="text-sm text-gray-600">Votos positivos</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.reputation_score}</p>
                <p className="text-sm text-gray-600">Reputación</p>
              </div>
            </div>
          )}
        </div>

        {/* Anotaciones del usuario */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Anotaciones</h2>
          
          {annotations.length === 0 ? (
            <p className="text-gray-600">Sin anotaciones</p>
          ) : (
            <div className="space-y-4">
              {annotations.map(annotation => (
                <div key={annotation.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-gray-800">{annotation.explanation}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    En: {annotation.song?.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}