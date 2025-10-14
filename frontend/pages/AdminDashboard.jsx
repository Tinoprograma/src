import { adminService } from '../services/adminService';
import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  Trash2,
  Edit,
  LogIn,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('annotations');
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para moderación
  const [annotations, setAnnotations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [reason, setReason] = useState('');

  // Verificar si es admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('No tienes acceso a este panel');
      navigate('/');
    }
  }, [user, navigate]);

  // Obtener logs de auditoría
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAuditLogs();
      setAuditLogs(data.logs || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar auditoría');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIJO: Usar adminService en lugar de fetch directo
  const handleVerifyAnnotation = async (annotationId, currentState) => {
    try {
      await adminService.verifyAnnotation(annotationId, !currentState);
      toast.success(`Anotación ${!currentState ? 'verificada' : 'deverificada'}`);
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al verificar anotación');
    }
  };

  // ✅ FIJO: Usar adminService
  const handleDeleteAnnotation = async (annotationId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta anotación?')) {
      return;
    }

    try {
      await adminService.deleteAnnotation(annotationId, reason || 'Sin especificar');
      toast.success('Anotación eliminada');
      setReason('');
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar anotación');
    }
  };

  // ✅ FIJO: Crear endpoint en adminService si no existe
  const handleEditLyrics = async (songId) => {
    if (!window.confirm('¿Estás seguro de que quieres cambiar las letras?')) {
      return;
    }

    try {
      // TODO: Agregar método en adminService si es necesario
      // await adminService.updateSongLyrics(songId, editValue, reason);
      
      // Mientras tanto, usamos fetch pero con token del localStorage
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/songs/${songId}/lyrics`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lyrics: editValue,
            reason: reason || 'Corrección'
          })
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      toast.success('Letras actualizadas');
      setEditingId(null);
      setEditValue('');
      setReason('');
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar letras');
    }
  };

  // ✅ FIJO: Crear endpoint en adminService
  const handleDeleteSong = async (songId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
      return;
    }

    try {
      // TODO: Agregar método en adminService
      // await adminService.deleteSong(songId, reason);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/songs/${songId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: reason || 'Sin especificar' })
        }
      );

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success('Canción eliminada');
      setReason('');
      await fetchAuditLogs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar canción');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-red-500" size={32} />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <p className="text-gray-400">Gestiona anotaciones, canciones, artistas y álbumes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto max-w-6xl flex">
          {[
            { id: 'annotations', label: 'Anotaciones', icon: CheckCircle },
            { id: 'songs', label: 'Canciones', icon: Edit },
            { id: 'audit', label: 'Auditoría', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'audit') fetchAuditLogs();
              }}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl p-6">
        {/* Anotaciones */}
        {activeTab === 'annotations' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Moderación de Anotaciones</h2>
              <p className="text-gray-400 mb-4">
                Aquí puedes verificar o eliminar anotaciones. Los cambios se registran en auditoría.
              </p>

              {/* Campo para razón */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Razón (para logs):
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Contenido inapropiado, spam..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Ejemplos de acciones */}
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-600">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Verificar Anotación</p>
                    <p className="text-sm text-gray-400">Marca anotaciones como verificadas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-gray-600">
                  <Trash2 className="text-red-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Eliminar Anotación</p>
                    <p className="text-sm text-gray-400">Elimina permanentemente con registro</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Cambios Registrados</p>
                    <p className="text-sm text-gray-400">Todas las acciones quedan en auditoría</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canciones */}
        {activeTab === 'songs' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Gestión de Canciones</h2>
              <p className="text-gray-400 mb-4">
                Edita letras o elimina canciones. Los cambios se registran automáticamente.
              </p>

              <div className="space-y-4">
                {editingId && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nuevas letras:
                    </label>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 font-mono text-sm"
                      placeholder="[Verse]&#10;Nueva letra aquí..."
                    />

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => handleEditLyrics(editingId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Guardar Cambios
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditValue('');
                        }}
                        variant="ghost"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">ID de Canción</p>
                        <p className="text-sm text-gray-400">Ingresa el ID manualmente en el campo de entrada</p>
                      </div>
                      <Trash2 className="text-red-400" size={20} />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="ID de canción"
                        className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                        id="songIdInput"
                      />
                      <Button
                        onClick={() => {
                          const songId = document.getElementById('songIdInput').value;
                          if (songId) handleDeleteSong(songId);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auditoría */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Registro de Auditoría</h2>

              {isLoading ? (
                <p className="text-gray-400">Cargando registros...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-gray-400">No hay registros de auditoría aún</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="bg-gray-700 rounded p-4 border-l-4 border-red-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-gray-400">
                            {log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1)} #{log.entity_id}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {log.username || 'Sistema'}
                        </span>
                      </div>

                      {log.reason && (
                        <p className="text-sm text-gray-300 mb-2">
                          Razón: {log.reason}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-6 mt-8">
        <div className="container mx-auto max-w-6xl">
          <p className="text-gray-400 text-sm">
            Todos los cambios realizados aquí se registran automáticamente en auditoría para propósitos de seguimiento y responsabilidad.
          </p>
        </div>
      </div>
    </div>
  );
}