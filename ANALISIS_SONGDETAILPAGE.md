# 🎵 Análisis Completo: SongDetailPage.jsx

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estado del Componente](#estado-del-componente)
3. [Ciclo de Vida y Carga de Datos](#ciclo-de-vida-y-carga-de-datos)
4. [Sistema de Selección de Texto](#sistema-de-selección-de-texto)
5. [Renderizado de Letras con Anotaciones](#renderizado-de-letras-con-anotaciones)
6. [Gestión de Anotaciones (CRUD)](#gestión-de-anotaciones-crud)
7. [Sistema de Votación](#sistema-de-votación)
8. [Integración con Spotify](#integración-con-spotify)
9. [Renderizado Condicional](#renderizado-condicional)
10. [Flujo de Interacción del Usuario](#flujo-de-interacción-del-usuario)
11. [Problemas y Optimizaciones Potenciales](#problemas-y-optimizaciones-potenciales)

---

## Visión General

**SongDetailPage** es el componente más complejo de la aplicación (570 líneas). Es responsable de:

- ✅ Mostrar detalles de una canción (título, artista, álbum, estadísticas)
- ✅ Renderizar las letras de la canción
- ✅ Permitir selección de texto para crear anotaciones
- ✅ Mostrar anotaciones existentes como highlights en las letras
- ✅ Gestionar múltiples anotaciones superpuestas en el mismo texto
- ✅ CRUD completo de anotaciones
- ✅ Sistema de votación (upvotes/downvotes)
- ✅ Integración con Spotify para reproducción de música

### Arquitectura Visual

```
┌─────────────────────────────────────────────────────┐
│                   SongDetailPage                    │
├─────────────────────────────────────────────────────┤
│  Header (Título, Artista, Stats, Spotify)          │
├──────────────────────┬──────────────────────────────┤
│   Letras con         │   Panel Lateral (sticky)     │
│   Anotaciones        │                              │
│   (col-span-3)       │  • Formulario Anotación      │
│                      │  • Anotación Seleccionada    │
│   [Text Selection]   │  • Lista de Anotaciones      │
│   [Click Handler]    │    Superpuestas              │
│                      │  • Estado Vacío              │
│   (col-span-2)       │                              │
└──────────────────────┴──────────────────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │ Modal de Edición│
            └─────────────────┘
                     │
            ┌────────▼────────┐
            │ Spotify Player  │
            │   (fixed bottom)│
            └─────────────────┘
```

---

## Estado del Componente

El componente maneja **11 piezas de estado**, organizadas por propósito:

### 1. Estado de Parámetros y Autenticación

```javascript
const { id } = useParams();  // ID de la canción desde la URL
const { isAuthenticated, user } = useAuth();  // Estado global de auth
```

**Explicación**:
- `id`: Viene de la ruta `/songs/:id` (ej: `/songs/42`)
- `isAuthenticated`, `user`: Context de autenticación compartido globalmente

### 2. Estado de Datos del Servidor

```javascript
const [song, setSong] = useState(null);
const [annotations, setAnnotations] = useState([]);
const [isLoading, setIsLoading] = useState(true);
```

**Explicación**:
- `song`: Objeto con toda la información de la canción
  ```javascript
  {
    id: 1,
    title: "La Muralla Verde",
    artist_name: "Enanitos Verdes",
    artist_id: 5,
    album: "Contrareloj",
    release_year: 1986,
    lyrics: "Letra completa...",
    artist_color: "#10b981",
    view_count: 1245,
    spotify_track_id: "7s1X..."
  }
  ```

- `annotations`: Array de anotaciones ordenadas
  ```javascript
  [
    {
      id: 101,
      song_id: 1,
      text_selection: "Muralla verde",
      start_char: 15,      // Posición inicio en lyrics
      end_char: 28,        // Posición fin en lyrics
      explanation: "Referencia a...",
      cultural_context: "En los 80...",
      upvotes: 42,
      downvotes: 3,
      is_verified: true,   // Anotación verificada por admin
      user_has_voted: false,
      username: "musicfan123",
      display_name: "Juan Pérez",
      created_at: "2024-11-20T10:30:00Z"
    }
  ]
  ```

### 3. Estado de Interacción con Anotaciones

```javascript
const [selectedAnnotation, setSelectedAnnotation] = useState(null);
const [editingAnnotation, setEditingAnnotation] = useState(null);
const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
```

**Explicación**:
- `selectedAnnotation`: Anotación actualmente mostrada en el panel lateral
- `editingAnnotation`: Anotación en proceso de edición (abre modal)
- `hoveredAnnotation`: ID de anotación bajo el cursor (efecto hover visual)

### 4. Estado de Spotify

```javascript
const [spotifyTrack, setSpotifyTrack] = useState(null);
const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
```

**Explicación**:
- `spotifyTrack`: Objeto con datos de Spotify (URI, preview_url, etc.)
- `isLoadingSpotify`: Muestra "Buscando en Spotify..." mientras carga

### 5. Estado de Selección de Texto

```javascript
const [selectedText, setSelectedText] = useState('');
const [selectionRange, setSelectionRange] = useState(null);
const [showAnnotationForm, setShowAnnotationForm] = useState(false);
```

**Explicación**:
- `selectedText`: Texto literal seleccionado por el usuario (ej: "Muralla verde")
- `selectionRange`: Objeto con posiciones `{ start: 15, end: 28 }`
- `showAnnotationForm`: Booleano para mostrar/ocultar formulario de creación

**Diagrama de Estado**:
```
Estado Inicial
    ↓
selectedText = ""
selectionRange = null
showAnnotationForm = false
    ↓
[Usuario selecciona texto]
    ↓
selectedText = "texto seleccionado"
selectionRange = { start: 15, end: 28 }
showAnnotationForm = true
    ↓
[Usuario envía formulario]
    ↓
Estado vuelve a inicial
selectedAnnotation = nueva anotación (para mostrarla)
```

---

## Ciclo de Vida y Carga de Datos

### useEffect Principal

```javascript
useEffect(() => {
  fetchSongData();
}, [id]);
```

**¿Cuándo se ejecuta?**
1. Al montar el componente (primera renderización)
2. Cada vez que cambia el `id` en la URL (usuario navega a otra canción)

### Función fetchSongData (Líneas 37-75)

**Flujo paso a paso**:

```javascript
const fetchSongData = async () => {
  try {
    setIsLoading(true);

    // PASO 1: Obtener canción desde el backend
    const songResponse = await songService.getById(id);
    // GET /api/songs/:id

    setSong(songResponse.song);

    // PASO 2: Obtener anotaciones de esta canción
    const annotationsResponse = await annotationService.getBySongId(id);
    // GET /api/annotations/song/:songId

    const fetchedAnnotations = annotationsResponse.annotations || [];

    // PASO 3: Ordenar anotaciones según criterio triple
    const sortedAnnotations = [...fetchedAnnotations].sort((a, b) => {
      // 3.1 Primera prioridad: Verificadas primero
      if (a.is_verified !== b.is_verified) {
        return a.is_verified ? -1 : 1;  // -1 = a va primero
      }

      // 3.2 Segunda prioridad: Por score (upvotes - downvotes)
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;  // Mayor score primero
      }

      // 3.3 Tercera prioridad: Por fecha (más antiguas primero)
      return new Date(a.created_at) - new Date(b.created_at);
    });

    setAnnotations(sortedAnnotations);

    // PASO 4: Buscar track en Spotify (async, no bloquea)
    fetchSpotifyTrack(songResponse.song);

  } catch (error) {
    toast.error('Error cargando la canción');
  } finally {
    setIsLoading(false);
  }
};
```

### Criterio de Ordenamiento de Anotaciones

**Ejemplo visual**:

```
Anotaciones sin ordenar:
[
  { id: 1, is_verified: false, score: 10, created_at: "2024-11-01" },
  { id: 2, is_verified: true, score: 5, created_at: "2024-11-10" },
  { id: 3, is_verified: false, score: 15, created_at: "2024-10-20" }
]

Después de ordenar:
[
  { id: 2, is_verified: true, score: 5 },     ← Verificada (prioridad máxima)
  { id: 3, is_verified: false, score: 15 },   ← Score más alto
  { id: 1, is_verified: false, score: 10 }    ← Score menor
]
```

---

## Sistema de Selección de Texto

Esta es **una de las funcionalidades más complejas** del componente. Utiliza el **Selection API** nativo del navegador.

### handleTextSelection (Líneas 112-133)

**Activación**: Se dispara con el evento `onMouseUp` en el contenedor de letras.

```javascript
<div
  id="lyrics-container"
  onMouseUp={handleTextSelection}  // ← Aquí se activa
>
```

### Paso a Paso del Algoritmo

```javascript
const handleTextSelection = () => {
  // PASO 1: Obtener la selección del navegador
  const selection = window.getSelection();
  const selectedString = selection.toString().trim();

  // PASO 2: Validar que hay texto seleccionado
  if (selectedString.length > 0) {

    // PASO 3: Obtener el Range (objeto con información de la selección)
    const range = selection.getRangeAt(0);

    // PASO 4: Validar que la selección está dentro de lyrics-container
    const lyricsContainer = document.getElementById('lyrics-container');

    if (lyricsContainer && lyricsContainer.contains(range.commonAncestorContainer)) {

      // PASO 5: CALCULAR POSICIÓN ABSOLUTA EN EL TEXTO
      // Esta es la parte más compleja

      // 5.1 Crear un rango que vaya desde el inicio del container
      //     hasta el inicio de la selección
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(lyricsContainer);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);

      // 5.2 La longitud de ese rango es la posición de inicio
      const start = preSelectionRange.toString().length;

      // 5.3 Calcular posición de fin
      const end = start + selectedString.length;

      // PASO 6: Guardar en el estado
      setSelectedText(selectedString);
      setSelectionRange({ start, end });
      setShowAnnotationForm(true);
      setSelectedAnnotation(null);  // Ocultar anotación si había una
    }
  }
};
```

### Ejemplo Visual del Cálculo de Posiciones

```
Letras completas (song.lyrics):
"Yo no puedo darte nada\nMás que una muralla verde"
 0123456789...              15            28

Usuario selecciona "muralla verde"

preSelectionRange.toString():
"Yo no puedo darte nada\nMás que una "
                                    ↑
                                  start = 37

selectedString.length = 13

end = 37 + 13 = 50
```

### ¿Por qué es importante calcular start y end?

Porque se guardan en la base de datos:
```javascript
{
  text_selection: "muralla verde",
  start_char: 37,
  end_char: 50
}
```

Luego, al renderizar, se usa `lyrics.substring(37, 50)` para resaltar exactamente ese texto.

---

## Renderizado de Letras con Anotaciones

Esta es **la función más compleja** del componente: `renderLyricsWithAnnotations()` (líneas 255-343).

### Objetivo

Convertir letras planas + anotaciones → JSX con highlights interactivos.

### Problema a Resolver

```
Letras: "Yo no puedo darte nada\nMás que una muralla verde"

Anotaciones:
1. start: 15, end: 28  → "puedo darte"
2. start: 37, end: 50  → "muralla verde"
3. start: 20, end: 40  → "darte nada\nMás que una muralla"

¡Anotación 3 se superpone con 1 y 2!
```

**Desafío**: Mostrar solo una anotación "featured" por rango de texto, pero permitir acceso a las superpuestas.

### Algoritmo Paso a Paso

```javascript
const renderLyricsWithAnnotations = () => {
  if (!song || !song.lyrics) return null;

  let result = [];          // Array de elementos React
  let currentIndex = 0;     // Posición actual en las letras
  const lyrics = song.lyrics;

  // FASE 1: SELECCIONAR ANOTACIONES "FEATURED"
  const processedRanges = [];      // Rangos ya procesados
  const featuredAnnotations = [];  // Anotaciones que se mostrarán

  // Ordenar por posición (para procesar de izquierda a derecha)
  const sortedByPosition = [...annotations].sort((a, b) =>
    a.start_char - b.start_char
  );

  sortedByPosition.forEach(annotation => {
    // Verificar si esta anotación se superpone con alguna ya procesada
    const hasOverlap = processedRanges.some(range => {
      // Dos rangos NO se superponen si:
      // - annotation termina antes de que range empiece, O
      // - annotation empieza después de que range termine
      return !(annotation.end_char <= range.start ||
               annotation.start_char >= range.end);
    });

    // Si NO hay superposición, es una anotación "featured"
    if (!hasOverlap) {
      featuredAnnotations.push(annotation);
      processedRanges.push({
        start: annotation.start_char,
        end: annotation.end_char
      });
    }
  });

  // FASE 2: RENDERIZAR LETRAS CON ANOTACIONES
  featuredAnnotations.forEach((annotation) => {

    // 2.1 Texto antes de la anotación
    if (currentIndex < annotation.start_char) {
      result.push(
        <span key={`text-${currentIndex}`}>
          {lyrics.substring(currentIndex, annotation.start_char)}
        </span>
      );
    }

    // 2.2 Calcular estado visual
    const isSelected = selectedAnnotation?.id === annotation.id;
    const isHovered = hoveredAnnotation === annotation.id;

    // 2.3 Encontrar TODAS las anotaciones en este rango
    const annotationsInRange = annotations.filter(a => {
      return !(a.end_char <= annotation.start_char ||
               a.start_char >= annotation.end_char);
    });

    // 2.4 Renderizar span con highlight
    result.push(
      <span
        key={`annotation-${annotation.id}`}
        className={`
          cursor-pointer transition-all rounded px-1 -mx-1 relative
          ${isSelected ? 'bg-yellow-300 font-medium' : 'bg-yellow-100'}
          ${isHovered ? 'bg-yellow-200' : ''}
        `}
        style={{
          borderBottom: isSelected
            ? `3px solid ${song.artist_color}`
            : '2px solid #fbbf24'
        }}
        onMouseEnter={() => setHoveredAnnotation(annotation.id)}
        onMouseLeave={() => setHoveredAnnotation(null)}
        onClick={() => {
          // Si hay múltiples anotaciones, ciclar entre ellas
          if (annotationsInRange.length > 1) {
            const currentIndex = annotationsInRange.findIndex(
              a => a.id === selectedAnnotation?.id
            );
            const nextIndex = (currentIndex + 1) % annotationsInRange.length;
            setSelectedAnnotation(annotationsInRange[nextIndex]);
          } else {
            // Toggle: si está seleccionada, deseleccionar
            setSelectedAnnotation(isSelected ? null : annotation);
          }
          setShowAnnotationForm(false);
        }}
      >
        {lyrics.substring(annotation.start_char, annotation.end_char)}

        {/* Badge indicando múltiples anotaciones */}
        {annotationsInRange.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white ...">
            {annotationsInRange.length}
          </span>
        )}
      </span>
    );

    currentIndex = annotation.end_char;
  });

  // FASE 3: TEXTO FINAL (después de la última anotación)
  if (currentIndex < lyrics.length) {
    result.push(
      <span key={`text-${currentIndex}`}>
        {lyrics.substring(currentIndex)}
      </span>
    );
  }

  return result;
};
```

### Ejemplo Visual del Resultado

**Input**:
```
lyrics = "Yo puedo darte nada"
         012345678901234567890

annotations = [
  { id: 1, start: 3, end: 8, text: "puedo" },
  { id: 2, start: 9, end: 14, text: "darte" }
]
```

**Output** (simplificado):
```jsx
[
  <span>Yo </span>,
  <span className="bg-yellow-100 cursor-pointer" onClick={...}>
    puedo
  </span>,
  <span> </span>,
  <span className="bg-yellow-100 cursor-pointer" onClick={...}>
    darte
  </span>,
  <span> nada</span>
]
```

### Manejo de Anotaciones Superpuestas

**Escenario**:
```
Texto: "puedo darte nada"
       0123456789012345

Anotaciones:
A1: "puedo darte" (0-12)
A2: "darte nada"  (6-16)
```

**Procesamiento**:
1. Ordenar por posición: `[A1, A2]`
2. Procesar A1:
   - No hay overlap → ✅ Featured
   - `processedRanges = [{ start: 0, end: 12 }]`
3. Procesar A2:
   - ¿Overlap con (0-12)?
   - `!(16 <= 0 || 6 >= 12)` = `!(false || false)` = `true` ✅ Hay overlap
   - ❌ NO es featured

**Resultado**: Solo se muestra A1, pero al hacer click se puede acceder a A2.

**Click Handler**:
```javascript
onClick={() => {
  const annotationsInRange = [A1, A2];  // 2 anotaciones

  if (selectedAnnotation === A1) {
    // Ciclar a la siguiente
    setSelectedAnnotation(A2);
  } else if (selectedAnnotation === A2) {
    setSelectedAnnotation(A1);
  }
}}
```

---

## Gestión de Anotaciones (CRUD)

### Create - handleAnnotationSubmit (Líneas 135-165)

```javascript
const handleAnnotationSubmit = async (annotationData) => {
  try {
    // POST /api/annotations
    const response = await annotationService.create(annotationData);

    const newAnnotation = response.annotation;

    // Agregar a la lista local
    const updatedAnnotations = [...annotations, newAnnotation];

    // Re-ordenar (mismo algoritmo de fetchSongData)
    const sortedAnnotations = updatedAnnotations.sort(...);

    setAnnotations(sortedAnnotations);

    // Limpiar formulario
    setShowAnnotationForm(false);
    setSelectedText('');
    setSelectionRange(null);

    // Seleccionar la nueva anotación para mostrarla
    setSelectedAnnotation(newAnnotation);

    toast.success('Anotación creada exitosamente');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error creando anotación');
  }
};
```

**Flujo de datos**:
```
Usuario selecciona texto
  ↓
handleTextSelection() → setShowAnnotationForm(true)
  ↓
<AnnotationForm /> se renderiza
  ↓
Usuario llena formulario y envía
  ↓
handleAnnotationSubmit(data)
  ↓
POST /api/annotations
  ↓
Backend guarda en DB y devuelve anotación con ID
  ↓
Actualizar estado local
  ↓
Re-renderizar letras con nueva anotación
```

### Read - Ya cubierto en fetchSongData

### Update - handleEditSubmit (Líneas 224-244)

```javascript
const handleEditSubmit = async (annotationId, updatedData) => {
  try {
    // PUT /api/annotations/:id
    const response = await annotationService.update(annotationId, updatedData);

    // Actualizar en la lista local
    const updatedAnnotations = annotations.map(a =>
      a.id === annotationId ? response.annotation : a
    );

    setAnnotations(updatedAnnotations);

    // Si estaba seleccionada, actualizar también
    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation(response.annotation);
    }

    setEditingAnnotation(null);  // Cerrar modal
    toast.success('Anotación actualizada');
  } catch (error) {
    toast.error('Error al actualizar la anotación');
  }
};
```

### Delete - handleDelete (Líneas 208-218)

```javascript
const handleDelete = async (annotationId) => {
  try {
    // DELETE /api/annotations/:id
    await annotationService.delete(annotationId);

    // Filtrar de la lista local
    setAnnotations(annotations.filter(a => a.id !== annotationId));

    // Deseleccionar
    setSelectedAnnotation(null);

    toast.success('Anotación eliminada');
  } catch (error) {
    toast.error('Error al eliminar');
  }
};
```

---

## Sistema de Votación

### handleVote (Líneas 167-206)

**Característica especial**: Implementa **optimistic update** (actualiza UI antes de confirmar con servidor).

```javascript
const handleVote = async (annotationId) => {
  try {
    // POST /api/annotations/:id/vote { vote_type: 'up' }
    await annotationService.vote(annotationId, 'up');

    // OPTIMISTIC UPDATE
    const updatedAnnotations = annotations.map(a => {
      if (a.id === annotationId) {
        return {
          ...a,
          // Toggle: si ya votó, quitar voto; si no, agregar
          upvotes: a.upvotes + (a.user_has_voted ? -1 : 1),
          user_has_voted: !a.user_has_voted
        };
      }
      return a;
    });

    // Re-ordenar (porque el score cambió)
    const sortedAnnotations = updatedAnnotations.sort(...);

    setAnnotations(sortedAnnotations);

    // Actualizar selectedAnnotation si es la misma
    if (selectedAnnotation?.id === annotationId) {
      const updated = sortedAnnotations.find(a => a.id === annotationId);
      setSelectedAnnotation(updated);
    }

    toast.success('Voto registrado');
  } catch (error) {
    // Aquí debería hacer rollback del estado, pero no lo hace
    toast.error('Error al votar');
  }
};
```

**Problema**: Si el servidor falla, el estado local queda inconsistente (no hace rollback).

**Solución ideal con React Query**:
```javascript
const voteMutation = useMutation({
  mutationFn: (annotationId) => annotationService.vote(annotationId, 'up'),
  onMutate: async (annotationId) => {
    // Optimistic update
    const previousAnnotations = annotations;
    // ... actualizar UI
    return { previousAnnotations };  // Contexto para rollback
  },
  onError: (err, annotationId, context) => {
    // Rollback
    setAnnotations(context.previousAnnotations);
  }
});
```

---

## Integración con Spotify

### fetchSpotifyTrack (Líneas 78-110)

**Estrategia de dos pasos**:

```javascript
const fetchSpotifyTrack = async (songData) => {
  try {
    setIsLoadingSpotify(true);

    // ESTRATEGIA 1: Si ya tenemos el ID guardado
    if (songData.spotify_track_id) {
      const track = await spotifyService.getTrack(songData.spotify_track_id);
      setSpotifyTrack(track);
      return;  // ← Salir temprano
    }

    // ESTRATEGIA 2: Buscar por metadatos
    const track = await spotifyService.searchTrackAdvanced(
      songData.title,          // "La Muralla Verde"
      songData.artist_name,    // "Enanitos Verdes"
      songData.album,          // "Contrareloj"
      songData.release_year    // 1986
    );

    setSpotifyTrack(track);

    // TODO: Guardar el ID para próximas veces
    if (track && track.id) {
      console.log('💡 Spotify track encontrado:', track.id);
      // Falta: await songService.updateSpotifyId(songData.id, track.id);
    }

  } catch (error) {
    console.error('Error buscando en Spotify:', error);
    // No muestra error al usuario (falla silenciosa)
  } finally {
    setIsLoadingSpotify(false);
  }
};
```

**Mejora sugerida**: Cachear el resultado.

```javascript
// En lugar de buscar cada vez que se carga la página:
if (songData.spotify_track_id) {
  // Buscar en cache local primero
  const cached = localStorage.getItem(`spotify_${songData.id}`);
  if (cached) {
    setSpotifyTrack(JSON.parse(cached));
    return;
  }
}
```

---

## Renderizado Condicional

El componente tiene **3 estados de renderizado principales**:

### 1. Estado de Carga (Líneas 354-363)

```javascript
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 ..."></div>
      <p>Cargando canción...</p>
    </div>
  );
}
```

### 2. Estado de Error (Líneas 365-376)

```javascript
if (!song) {
  return (
    <div className="text-center">
      <p>Canción no encontrada</p>
      <Link to="/songs">
        <Button>Volver a canciones</Button>
      </Link>
    </div>
  );
}
```

### 3. Estado Normal (Líneas 380-569)

Layout principal con grid de 2 columnas (3:2 ratio).

### Panel Lateral - 3 Estados Mutuamente Excluyentes

```javascript
{showAnnotationForm && (
  // ESTADO 1: Formulario de nueva anotación
  isAuthenticated ? (
    <AnnotationForm ... />
  ) : (
    <div>Inicia sesión para crear anotaciones</div>
  )
)}

{selectedAnnotation && !showAnnotationForm && (
  // ESTADO 2: Mostrar anotación seleccionada
  <div>
    <AnnotationItem ... />
    {annotationsForSelected.length > 1 && (
      <div>
        Otras anotaciones para este texto ({count})
      </div>
    )}
  </div>
)}

{!selectedAnnotation && !showAnnotationForm && (
  // ESTADO 3: Empty state
  <div>
    <MessageSquare />
    <p>Haz clic en las partes resaltadas para ver anotaciones</p>
  </div>
)}
```

**Diagrama de Estados del Panel**:
```
┌─────────────────────┐
│  Empty State        │
│  (inicial)          │
└──────┬──────────────┘
       │
       ├──[Usuario selecciona texto]─────► Formulario Anotación
       │                                         │
       │                                   [Envía/Cancela]
       │                                         │
       ├──[Click en highlight]───────────► Anotación Seleccionada
       │                                         │
       │                                   [Click "editar"]
       │                                         │
       └─────────────────────────────────────► Modal Edición
                                                  │
                                             [Guarda/Cancela]
                                                  │
                                            Vuelve a Anotación
                                              Seleccionada
```

---

## Flujo de Interacción del Usuario

### Caso 1: Crear Nueva Anotación

```
1. Usuario llega a /songs/42
   ↓
2. useEffect ejecuta fetchSongData()
   ↓
3. Se renderizan letras con anotaciones existentes
   ↓
4. Usuario SELECCIONA texto con el mouse
   ↓
5. onMouseUp → handleTextSelection()
   ↓
6. Calcula start_char y end_char usando Selection API
   ↓
7. setShowAnnotationForm(true)
   ↓
8. Panel lateral muestra <AnnotationForm />
   ↓
9. Usuario escribe explicación y contexto cultural
   ↓
10. Click en "Guardar Anotación"
    ↓
11. handleAnnotationSubmit()
    ↓
12. POST /api/annotations
    ↓
13. Backend guarda en DB, devuelve anotación con ID
    ↓
14. Actualiza estado local (annotations array)
    ↓
15. Re-renderiza letras con nueva anotación resaltada
    ↓
16. setSelectedAnnotation(newAnnotation)
    ↓
17. Panel lateral muestra la anotación recién creada
```

### Caso 2: Ver y Votar Anotación Existente

```
1. Usuario ve letras con highlights amarillos
   ↓
2. Pasa mouse sobre highlight
   ↓
3. onMouseEnter → setHoveredAnnotation(id)
   ↓
4. Highlight cambia a bg-yellow-200 (hover effect)
   ↓
5. Click en highlight
   ↓
6. onClick handler ejecuta
   ↓
7. setSelectedAnnotation(annotation)
   ↓
8. Panel lateral muestra <AnnotationItem />
   ↓
9. Usuario lee la explicación
   ↓
10. Click en botón 👍 (upvote)
    ↓
11. handleVote(annotationId)
    ↓
12. Optimistic update: upvotes++, user_has_voted = true
    ↓
13. Re-ordena annotations (porque score cambió)
    ↓
14. POST /api/annotations/:id/vote
    ↓
15. Backend confirma
    ↓
16. toast.success('Voto registrado')
```

### Caso 3: Navegar Anotaciones Superpuestas

```
1. Hay 3 anotaciones en el texto "muralla verde"
   ↓
2. Solo se muestra 1 highlight (featured)
   ↓
3. Badge muestra "3" en esquina superior derecha
   ↓
4. Usuario hace click en highlight
   ↓
5. onClick detecta: annotationsInRange.length === 3
   ↓
6. Muestra anotación #1
   ↓
7. Usuario hace click de nuevo
   ↓
8. Cicla a anotación #2
   ↓
9. Usuario hace click de nuevo
   ↓
10. Cicla a anotación #3
    ↓
11. Usuario hace click de nuevo
    ↓
12. Vuelve a anotación #1 (ciclo infinito)
```

**Lógica de ciclado**:
```javascript
const currentIndex = annotationsInRange.findIndex(
  a => a.id === selectedAnnotation?.id
);
// Si currentIndex es -1 (no encontrada) o 2 (última):
const nextIndex = (currentIndex + 1) % annotationsInRange.length;
// % 3 = módulo, asegura que nunca pase de 2 (vuelve a 0)
```

---

## Problemas y Optimizaciones Potenciales

### ❌ Problemas Actuales

#### 1. **Lógica de Ordenamiento Repetida (DRY Violation)**

El mismo algoritmo de ordenamiento aparece **4 veces**:
- Línea 50: `fetchSongData()`
- Línea 142: `handleAnnotationSubmit()`
- Línea 182: `handleVote()`
- Similar en otros handlers

**Solución**:
```javascript
// utils/annotationHelpers.js
export function sortAnnotations(annotations) {
  return [...annotations].sort((a, b) => {
    if (a.is_verified !== b.is_verified) {
      return b.is_verified ? 1 : -1;
    }
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

// En el componente:
setAnnotations(sortAnnotations(updatedAnnotations));
```

#### 2. **Componente Muy Grande (570 líneas)**

Violación del principio de responsabilidad única.

**Refactorización sugerida**:
```javascript
// Extraer a componentes separados:
<LyricsViewer
  lyrics={song.lyrics}
  annotations={annotations}
  onAnnotationClick={setSelectedAnnotation}
  onTextSelect={handleTextSelection}
/>

<AnnotationPanel
  annotation={selectedAnnotation}
  showForm={showAnnotationForm}
  selectedText={selectedText}
  onSubmit={handleAnnotationSubmit}
  onVote={handleVote}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Extraer a custom hooks:
const {
  annotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  voteAnnotation
} = useAnnotations(songId);

const {
  selectedText,
  selectionRange,
  handleTextSelection
} = useTextSelection('lyrics-container');
```

#### 3. **No Hay Rollback en Votación**

Si `annotationService.vote()` falla, el UI queda con datos incorrectos.

**Solución con React Query**:
```javascript
const { mutate: vote } = useMutation({
  mutationFn: ({ annotationId, type }) =>
    annotationService.vote(annotationId, type),

  onMutate: async ({ annotationId }) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries(['annotations', songId]);

    // Snapshot del estado anterior
    const previous = queryClient.getQueryData(['annotations', songId]);

    // Optimistic update
    queryClient.setQueryData(['annotations', songId], old => {
      return old.map(a => a.id === annotationId
        ? { ...a, upvotes: a.upvotes + 1, user_has_voted: true }
        : a
      );
    });

    return { previous };  // Contexto para rollback
  },

  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['annotations', songId], context.previous);
  },

  onSettled: () => {
    // Refetch para sincronizar con servidor
    queryClient.invalidateQueries(['annotations', songId]);
  }
});
```

#### 4. **Cálculo de Posiciones Ineficiente**

`renderLyricsWithAnnotations()` se ejecuta en CADA render, incluso si las anotaciones no cambiaron.

**Solución**:
```javascript
const renderedLyrics = useMemo(() => {
  return renderLyricsWithAnnotations();
}, [song?.lyrics, annotations, selectedAnnotation, hoveredAnnotation]);

// En JSX:
<pre>{renderedLyrics}</pre>
```

#### 5. **Falta Validación de Selección**

No valida que el usuario seleccionó texto dentro de un rango válido.

**Problema**:
```javascript
// Si el usuario selecciona a través de múltiples anotaciones:
"texto normal [anotación1] más texto [anotación2]"
              ^──────────────selección─────────────^

start_char calculado puede ser incorrecto
```

**Solución**:
```javascript
// Validar que la selección no cruza anotaciones existentes
const overlapsExistingAnnotation = annotations.some(a => {
  const selectionStart = selectionRange.start;
  const selectionEnd = selectionRange.end;

  // Selección parcial dentro de anotación
  const startsInside = selectionStart > a.start_char && selectionStart < a.end_char;
  const endsInside = selectionEnd > a.start_char && selectionEnd < a.end_char;

  return startsInside || endsInside;
});

if (overlapsExistingAnnotation) {
  toast.error('No puedes crear anotaciones que se superpongan parcialmente');
  return;
}
```

#### 6. **Memory Leak Potencial**

Si el componente se desmonta mientras hay requests en progreso, puede causar warnings.

**Solución**:
```javascript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const data = await songService.getById(id);
      if (isMounted) {  // Solo actualizar si sigue montado
        setSong(data.song);
      }
    } catch (error) {
      if (isMounted) {
        toast.error('Error');
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;  // Cleanup
  };
}, [id]);
```

#### 7. **Spotify Fetch No Es Cancelable**

Si el usuario navega rápido entre canciones, puede haber múltiples fetches de Spotify en paralelo.

**Solución con AbortController**:
```javascript
useEffect(() => {
  const abortController = new AbortController();

  const fetchSpotify = async () => {
    try {
      const track = await spotifyService.search(song.title, {
        signal: abortController.signal  // ← Pasar señal de cancelación
      });
      setSpotifyTrack(track);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  fetchSpotify();

  return () => {
    abortController.abort();  // ← Cancelar al desmontar
  };
}, [song?.id]);
```

---

## ✅ Fortalezas del Componente

1. **Implementación Compleja Funcional**
   - Selección de texto con Selection API ✅
   - Manejo de anotaciones superpuestas ✅
   - Ciclo de anotaciones con click ✅

2. **UX Bien Pensada**
   - Feedback visual inmediato (hover, selected)
   - Badge para anotaciones múltiples
   - Empty states informativos
   - Optimistic updates para votación

3. **Integración Completa**
   - CRUD de anotaciones funcional
   - Integración con Spotify
   - Autenticación verificada

4. **Manejo de Edge Cases**
   - Validación de contenedor de selección
   - Ordenamiento triple (verified → score → date)
   - Toggle en votación (quitar voto)

---

## 📊 Resumen de Complejidad

| Aspecto | Líneas | Complejidad |
|---------|--------|-------------|
| **Estado** | 11 variables | Alta |
| **Handlers** | 8 funciones | Media-Alta |
| **Rendering** | renderLyricsWithAnnotations | Muy Alta |
| **API Calls** | 7 endpoints | Media |
| **Lógica de negocio** | Ordenamiento, superposición | Alta |

**Complejidad Ciclomática Estimada**: ~40 (Alto - debería refactorizarse)

---

## 🎯 Conclusión

**SongDetailPage** es un componente **técnicamente impresionante** que implementa funcionalidad compleja de anotaciones colaborativas. Sin embargo, su tamaño (570 líneas) y complejidad hacen que sea difícil de mantener.

**Recomendaciones prioritarias**:
1. ✅ Extraer lógica de rendering a componente `<LyricsViewer>`
2. ✅ Crear custom hooks: `useAnnotations`, `useTextSelection`
3. ✅ Implementar React Query para gestión de estado del servidor
4. ✅ Agregar tests (especialmente para `renderLyricsWithAnnotations`)
5. ✅ Memoizar cálculos costosos con `useMemo`

Con estas refactorizaciones, el componente pasaría de ~570 líneas a ~200 líneas, manteniendo toda la funcionalidad pero con mejor mantenibilidad y performance.
