import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { songService } from '../services/songService';
import { artistService } from '../services/artistService';
import { albumService } from '../services/albumService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function CreateSongPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [showNewArtistForm, setShowNewArtistForm] = useState(false);
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    album_id: '',
    track_number: '',
    is_single: true,
    lyrics: '',
    release_year: new Date().getFullYear(),
    cover_image_url: ''
  });

  const [newArtist, setNewArtist] = useState({
    name: '',
    country_code: 'AR'
  });

  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist_id: '',
    release_year: new Date().getFullYear(),
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    // Cuando cambia el artista, cargar sus álbumes
    if (formData.artist_id) {
      fetchAlbumsByArtist(formData.artist_id);
    } else {
      setAlbums([]);
    }
  }, [formData.artist_id]);

  const fetchArtists = async () => {
    try {
      const response = await artistService.getAll();
      setArtists(response.artists || []);
    } catch (error) {
      console.error('Error cargando artistas:', error);
    }
  };

  const fetchAlbumsByArtist = async (artistId) => {
    try {
      const response = await albumService.getByArtist(artistId);
      setAlbums(response.albums || []);
    } catch (error) {
      console.error('Error cargando álbumes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Si marca como single, limpiar campos de álbum
    if (name === 'is_single' && checked) {
      setFormData(prev => ({
        ...prev,
        album_id: '',
        track_number: ''
      }));
    }
  };

  const handleNewArtistChange = (e) => {
    setNewArtist({
      ...newArtist,
      [e.target.name]: e.target.value
    });
  };

  const handleNewAlbumChange = (e) => {
    setNewAlbum({
      ...newAlbum,
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
      console.error('Error creando artista:', error);
      toast.error(error.response?.data?.message || 'Error creando artista');
    }
  };

  const createNewAlbum = async () => {
    if (!newAlbum.title.trim()) {
      toast.error('El título del álbum es requerido');
      return;
    }

    if (!formData.artist_id) {
      toast.error('Selecciona un artista primero');
      return;
    }

    try {
      const albumData = {
        ...newAlbum,
        artist_id: formData.artist_id
      };

      const response = await albumService.create(albumData);
      const createdAlbum = response.album;
      
      setAlbums([...albums, createdAlbum]);
      setFormData({ ...formData, album_id: createdAlbum.id, is_single: false });
      setShowNewAlbumForm(false);
      setNewAlbum({ title: '', artist_id: '', release_year: new Date().getFullYear(), description: '' });
      
      toast.success('Álbum creado exitosamente');
    } catch (error) {
      console.error('Error creando álbum:', error);
      toast.error('Error creando álbum');
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

    if (!formData.is_single && !formData.album_id) {
      newErrors.album_id = 'Si no es single, debes seleccionar un álbum';
    }

    if (!formData.is_single && formData.album_id && !formData.track_number) {
      newErrors.track_number = 'El número de track es requerido para canciones de álbum';
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
      
      // Si es single, asegurarse de que album_id y track_number sean null
      const songData = {
        ...formData,
        album_id: formData.is_single ? null : formData.album_id,
        track_number: formData.is_single ? null : parseInt(formData.track_number) || null
      };

      const response = await songService.create(songData);
      
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

          {/* URL de portada (opcional) */}
          <Input
            label="URL de portada (opcional)"
            name="cover_image_url"
            value={formData.cover_image_url}
            onChange={handleChange}
            placeholder="https://ejemplo.com/portada.jpg"
            helperText="URL de la imagen de portada de la canción o álbum"
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Tips para agregar canciones
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Asegúrate de que las letras sean precisas</li>
          <li>• Incluye la estructura de la canción ([Intro], [Verse], [Chorus], etc.)</li>
          <li>• Verifica que el artista y año de lanzamiento sean correctos</li>
          <li>• <strong>Si es parte de un álbum:</strong> desmarca "Es un single" y selecciona el álbum</li>
          <li>• <strong>Si es un single:</strong> mantén marcada la casilla "Es un single"</li>
          <li>• Las canciones deben ser de música hispanohablante</li>
        </ul>
      </div>

      {/* Info sobre álbumes */}
      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">
          📀 Sobre álbumes vs singles
        </h3>
        <div className="text-sm text-purple-800 space-y-2">
          <p>
            <strong>Single:</strong> Una canción lanzada de forma independiente, no pertenece a ningún álbum.
          </p>
          <p>
            <strong>Canción de álbum:</strong> Forma parte de un álbum y tiene un número de track específico.
            Todas las canciones del mismo álbum aparecerán juntas en un tracklist.
          </p>
        </div>
      </div>
    </div>
  );
} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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

          {/* Checkbox: ¿Es un single? */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="is_single"
              name="is_single"
              checked={formData.is_single}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_single" className="ml-2">
              <span className="text-sm font-medium text-gray-900">Esta canción es un single</span>
              <p className="text-xs text-gray-500">
                Marca esta opción si la canción no pertenece a ningún álbum
              </p>
            </label>
          </div>

          {/* Álbum (solo si NO es single) */}
          {!formData.is_single && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Álbum <span className="text-red-500">*</span>
              </label>
              
              {!showNewAlbumForm ? (
                <div className="space-y-2">
                  <select
                    name="album_id"
                    value={formData.album_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.album_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!formData.artist_id}
                    required
                  >
                    <option value="">
                      {formData.artist_id ? 'Selecciona un álbum' : 'Primero selecciona un artista'}
                    </option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>
                        {album.title} ({album.release_year || 'N/A'})
                      </option>
                    ))}
                  </select>
                  
                  {formData.artist_id && (
                    <button
                      type="button"
                      onClick={() => setShowNewAlbumForm(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Crear nuevo álbum
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <Input
                    label="Título del álbum"
                    name="title"
                    value={newAlbum.title}
                    onChange={handleNewAlbumChange}
                    placeholder="Ej: 3.0"
                  />
                  
                  <Input
                    label="Año de lanzamiento"
                    name="release_year"
                    type="number"
                    value={newAlbum.release_year}
                    onChange={handleNewAlbumChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      name="description"
                      value={newAlbum.description}
                      onChange={handleNewAlbumChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Información sobre el álbum..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={createNewAlbum}>
                      Crear Álbum
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNewAlbumForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
              
              {errors.album_id && (
                <p className="mt-1 text-sm text-red-600">{errors.album_id}</p>
              )}
            </div>
          )}

          {/* Número de Track (solo si NO es single y tiene álbum) */}
          {!formData.is_single && formData.album_id && (
            <Input
              label="Número de Track"
              name="track_number"
              type="number"
              value={formData.track_number}
              onChange={handleChange}
              error={errors.track_number}
              min="1"
              placeholder="Ej: 5"
              helperText="Posición de la canción en el álbum"
              required
            />
          )}

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