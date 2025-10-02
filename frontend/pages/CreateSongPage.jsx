import { useState, useEffect } from 'react'; // 👈 Se añadió useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { songService } from '../services/songService';
import { artistService } from '../services/artistService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function CreateSongPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [showNewArtistForm, setShowNewArtistForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    lyrics: '',
    album: '',
    release_year: new Date().getFullYear(),
    cover_image_url: ''
  });

  const [newArtist, setNewArtist] = useState({
    name: '',
    country_code: 'AR'
  });

  const [errors, setErrors] = useState({});

  const fetchArtists = async () => { // 👈 Definición de la función
    try {
      const response = await artistService.getAll();
      setArtists(response.artists || []);
    } catch (error) {
      console.error('Error cargando artistas:', error);
    }
  };
  
  // Cargar artistas al montar (CORRECCIÓN)
  useEffect(() => { // 👈 Se reemplazó useState por useEffect
    fetchArtists();
  }, []); // 👈 Array de dependencias vacío para ejecución única


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleNewArtistChange = (e) => {
    setNewArtist({
      ...newArtist,
      [e.target.name]: e.target.value
    });
  };

  const createNewArtist = async () => {
    if (!newArtist.name.trim()) {
      toast.error('El nombre del artista es requerido');
      return;
    }

    try {
      const response = await artistService.create(newArtist);
      const createdArtist = response.artist;
      
      setArtists([...artists, createdArtist]);
      setFormData({ ...formData, artist_id: createdArtist.id });
      setShowNewArtistForm(false);
      setNewArtist({ name: '', country_code: 'AR' });
      
      toast.success('Artista creado exitosamente');
    } catch (error) {
      toast.error('Error creando artista');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.artist_id) {
      newErrors.artist_id = 'Debes seleccionar un artista';
    }

    if (!formData.lyrics.trim()) {
      newErrors.lyrics = 'Las letras son requeridas';
    }

    if (formData.release_year && (formData.release_year < 1900 || formData.release_year > new Date().getFullYear() + 1)) {
      newErrors.release_year = 'Año inválido';
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
      setIsLoading(true);
      const response = await songService.create(formData);
      
      toast.success('Canción creada exitosamente');
      navigate(`/songs/${response.song.id}`);
    } catch (error) {
      console.error('Error creando canción:', error);
      toast.error(error.response?.data?.message || 'Error creando la canción');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Inicia sesión para agregar canciones
        </h2>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Agregar Nueva Canción
        </h1>
        <p className="text-gray-600">
          Comparte música hispanohablante con la comunidad
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <Input
            label="Título de la canción"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder="Ej: Vivir Mi Vida"
          />

          {/* Artista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artista <span className="text-red-500">*</span>
            </label>
            
            {!showNewArtistForm ? (
              <div className="space-y-2">
                <select
                  name="artist_id"
                  value={formData.artist_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.artist_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecciona un artista</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowNewArtistForm(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Agregar nuevo artista
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="Nombre del artista"
                  name="name"
                  value={newArtist.name}
                  onChange={handleNewArtistChange}
                  placeholder="Ej: Marc Anthony"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <select
                    name="country_code"
                    value={newArtist.country_code}
                    onChange={handleNewArtistChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="AR">Argentina</option>
                    <option value="MX">México</option>
                    <option value="ES">España</option>
                    <option value="CO">Colombia</option>
                    <option value="CL">Chile</option>
                    <option value="PE">Perú</option>
                    <option value="VE">Venezuela</option>
                    <option value="UY">Uruguay</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={createNewArtist}>
                    Crear Artista
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowNewArtistForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {errors.artist_id && (
              <p className="mt-1 text-sm text-red-600">{errors.artist_id}</p>
            )}
          </div>

          {/* Letras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letras de la canción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              rows={12}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono ${
                errors.lyrics ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="[Intro]&#10;Texto de la canción...&#10;&#10;[Verse 1]&#10;Más letras..."
              required
            />
            {errors.lyrics && (
              <p className="mt-1 text-sm text-red-600">{errors.lyrics}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Incluye la estructura de la canción (Intro, Verse, Chorus, etc.)
            </p>
          </div>

          {/* Álbum */}
          <Input
            label="Álbum"
            name="album"
            value={formData.album}
            onChange={handleChange}
            placeholder="Ej: 3.0 (Opcional)"
            helperText="Opcional"
          />

          {/* Año de lanzamiento */}
          <Input
            label="Año de lanzamiento"
            name="release_year"
            type="number"
            value={formData.release_year}
            onChange={handleChange}
            error={errors.release_year}
            min="1900"
            max={new Date().getFullYear() + 1}
            placeholder={new Date().getFullYear().toString()}
          />

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creando...' : 'Crear Canción'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate('/songs')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Tips para agregar canciones
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Asegúrate de que las letras sean precisas</li>
          <li>• Incluye la estructura de la canción ([Intro], [Verse], [Chorus], etc.)</li>
          <li>• Verifica que el artista y año de lanzamiento sean correctos</li>
          <li>• Las canciones deben ser de música hispanohablante</li>
        </ul>
      </div>
    </div>
  );
}