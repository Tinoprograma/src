# Preguntas Sugeridas para la Presentación

## 🎓 Guía de Preparación para Defensa Académica

Este documento contiene preguntas potenciales que podrían surgir durante la presentación del análisis de frontend, organizadas por categoría y nivel de dificultad.

---

## 📐 ARQUITECTURA

### Básicas
1. **¿Por qué eligieron organizar los componentes por feature en lugar de por tipo técnico?**
   - **Respuesta sugerida**: La organización por feature (auth, songs, annotations) facilita la localización de código relacionado y mejora la escalabilidad. Cuando necesitas trabajar en autenticación, todos los archivos están en un solo lugar.

2. **¿Qué es el Service Layer Pattern y por qué lo implementaron?**
   - **Respuesta**: Encapsula toda la lógica de comunicación con la API en servicios dedicados (songService, annotationService). Esto separa la lógica de negocio de la UI, facilita el testing con mocks y centraliza el manejo de errores.

3. **¿Cómo fluyen los datos desde el usuario hasta el backend?**
   - **Respuesta**: Usuario → Componente → Service → Axios (con interceptors) → Backend → Response → Service → Estado del componente → Re-render UI.

### Intermedias
4. **¿Qué ventajas tiene usar Vite sobre Create React App?**
   - **Respuesta**: Vite usa ESM nativos para dev server (arranque instantáneo), Hot Module Replacement más rápido, builds optimizados con Rollup, y menor configuración necesaria. Es la herramienta de próxima generación.

5. **¿Cómo implementarían lazy loading de rutas para mejorar performance?**
   - **Respuesta**: Usar React.lazy() y Suspense:
   ```javascript
   const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

   <Suspense fallback={<Loading />}>
     <Route path="/admin" element={<AdminDashboard />} />
   </Suspense>
   ```

### Avanzadas
6. **¿Qué patrón arquitectónico general sigue el proyecto y por qué?**
   - **Respuesta**: Sigue una arquitectura en capas (Layered Architecture) con separación entre presentación (pages/components), lógica de negocio (services/hooks), y utilidades. No es exactamente MVC ni Clean Architecture, pero toma principios de ambos.

7. **Si tuvieran que escalar este proyecto a millones de usuarios, ¿qué cambiarían en la arquitectura?**
   - **Respuesta**:
     - Code splitting agresivo por ruta
     - Implementar CDN para assets estáticos
     - Server-Side Rendering o Static Site Generation con Next.js
     - Service Workers para offline-first
     - Optimización de imágenes (webp, lazy loading)
     - Implementar React Query para cache inteligente

---

## 🎨 PATRONES DE DISEÑO

### Básicas
8. **¿Qué es el patrón Container/Presentational y dónde se aplica?**
   - **Respuesta**: Separa componentes que manejan lógica (containers) de los que solo renderizan UI (presentational). SongsPage es un container (maneja estado y fetch), mientras que SongCard es presentacional (solo recibe props y renderiza).

9. **¿Para qué sirve el patrón de Compound Components?**
   - **Respuesta**: Permite crear componentes flexibles con variantes. Button tiene variants (primary, secondary, outline) y sizes (sm, md, lg), lo que permite reutilizar sin duplicar código.

### Intermedias
10. **¿Por qué usar forwardRef en el componente Input?**
    - **Respuesta**: forwardRef permite que componentes padres accedan al DOM node del input, necesario para librerías como React Hook Form que necesitan registrar inputs.

11. **¿Qué son los Axios Interceptors y qué problema resuelven?**
    - **Respuesta**: Interceptan requests/responses antes de ser procesados. En este proyecto:
      - Request interceptor: agrega token JWT automáticamente
      - Response interceptor: detecta errores 401 y redirige a login

### Avanzadas
12. **¿Detectaron algún anti-patrón en el código? ¿Cómo lo solucionarían?**
    - **Respuesta**: Sí, varios:
      - **Prop drilling** en algunos componentes (pasar user múltiples niveles)
      - **Service inconsistency** (songService usa objeto, annotationService usa clase)
      - **Hooks vacíos** (useAuth.js, useSongs.js no implementados)
      - Solución: Consolidar en Context API o React Query, unificar estilo de services.

13. **Si tuvieran que refactorizar SongDetailPage (570 líneas), ¿cómo lo harían?**
    - **Respuesta**: Extraería:
      - `<LyricsRenderer>` component para la lógica de rendering
      - `useTextSelection()` custom hook
      - `useAnnotationVoting()` custom hook
      - `<AnnotationPanel>` component para el sidebar
      - Reduciría a ~150 líneas en el componente principal

---

## 📊 GESTIÓN DE ESTADO

### Básicas
14. **¿Qué diferencia hay entre useState y Context API?**
    - **Respuesta**: useState es para estado local de un componente. Context API es para estado global compartido entre múltiples componentes sin prop drilling. En este proyecto, AuthContext comparte user/isAuthenticated globalmente.

15. **¿Por qué guardan el token en localStorage en lugar de memoria?**
    - **Respuesta**: Para persistencia entre sesiones. Si solo estuviera en memoria, al refrescar la página el usuario perdería la sesión. localStorage persiste hasta que se cierra sesión explícitamente.

### Intermedias
16. **¿Qué es React Query y por qué recomiendan implementarlo si ya tienen estado con useState?**
    - **Respuesta**: React Query maneja "server state" (datos del backend) de forma óptima con:
      - Cache automático
      - Revalidación en background
      - Deduplicación de requests
      - Estados de loading/error automáticos
      Reduce código boilerplate de 15 líneas a 3.

17. **¿Cómo validarían que el token JWT sigue siendo válido?**
    - **Respuesta**: En el useEffect inicial, hacen GET /auth/me que valida el token en el backend. Si falla (401), limpian localStorage y redirigen a login.

### Avanzadas
18. **¿Qué estrategia de caché implementarían para las canciones?**
    - **Respuesta**: Con React Query:
      ```javascript
      useQuery({
        queryKey: ['songs', searchTerm],
        queryFn: () => songService.getAll({ search: searchTerm }),
        staleTime: 5 * 60 * 1000, // 5 min
        cacheTime: 30 * 60 * 1000, // 30 min
      })
      ```
      Esto cachea resultados y solo revalida después de 5 min.

19. **Si dos usuarios están viendo la misma canción y uno agrega una anotación, ¿cómo sincronizarían en tiempo real?**
    - **Respuesta**: El proyecto ya tiene Socket.io-client instalado. Implementaría:
      ```javascript
      socket.on('annotation:created', (newAnnotation) => {
        if (newAnnotation.song_id === currentSongId) {
          setAnnotations(prev => [...prev, newAnnotation]);
        }
      });
      ```

---

## 🔐 SEGURIDAD

### Básicas
20. **¿Por qué es un problema que mysql2 esté en el frontend?**
    - **Respuesta**: mysql2 es una librería para conectarse directamente a bases de datos MySQL. NUNCA debe estar en el frontend porque:
      - Expondría credenciales de DB en el código cliente
      - Cualquier usuario podría hacer queries directas
      - Violación grave de seguridad
      Debe estar solo en el backend.

21. **¿Cómo protegen rutas que requieren autenticación?**
    - **Respuesta**: Actualmente solo ocultan botones en la UI. Deberían implementar un ProtectedRoute component que verifique isAuthenticated antes de renderizar.

### Intermedias
22. **¿Qué vulnerabilidades de OWASP Top 10 están mitigadas y cuáles faltan?**
    - **Respuestas**:
      - ✅ **Broken Authentication**: JWT con validación
      - ✅ **Sensitive Data Exposure**: HTTPS (proxy)
      - ❌ **XSS**: No hay sanitización explícita de inputs
      - ❌ **CSRF**: No hay protección CSRF
      - ❌ **Security Misconfiguration**: mysql2 en frontend

23. **¿Cómo previenen ataques XSS en las anotaciones?**
    - **Respuesta**: React escapa automáticamente contenido renderizado en JSX. Sin embargo, si usaran `dangerouslySetInnerHTML`, deberían sanitizar con DOMPurify.

### Avanzadas
24. **¿Qué mecanismo usarían para refresh token rotation?**
    - **Respuesta**:
      1. Backend devuelve accessToken (15 min) y refreshToken (7 días)
      2. Guardar refreshToken en httpOnly cookie
      3. Interceptor detecta 401, llama a /auth/refresh
      4. Backend valida refreshToken, devuelve nuevo accessToken
      5. Retry request original con nuevo token

25. **¿Cómo implementarían rate limiting del lado del cliente?**
    - **Respuesta**:
      - Debounce en búsquedas (ejecutar después de 500ms sin teclear)
      - Throttle en votación (máximo 1 voto cada 2 segundos)
      - Deshabilitar botones durante requests en progreso

---

## 🎯 TESTING (Preguntas Difíciles)

### Básicas
26. **¿Por qué es importante tener tests en un proyecto frontend?**
    - **Respuesta**:
      - Detectan bugs antes de producción
      - Facilitan refactorización segura
      - Documentan comportamiento esperado
      - Reducen tiempo de debugging

27. **¿Qué tipos de tests implementarían y en qué orden?**
    - **Respuesta**:
      1. Unit tests para utils y services (más fáciles)
      2. Component tests para UI components
      3. Integration tests para flujos completos
      4. E2E tests para user journeys críticos

### Intermedias
28. **¿Cómo testearían el componente Button?**
    - **Respuesta**:
      ```javascript
      test('renders with primary variant', () => {
        render(<Button variant="primary">Click me</Button>);
        const button = screen.getByText('Click me');
        expect(button).toHaveClass('bg-primary-600');
      });

      test('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
      ```

29. **¿Cómo mockearían las llamadas a la API en los tests?**
    - **Respuesta**:
      ```javascript
      import { rest } from 'msw';
      import { setupServer } from 'msw/node';

      const server = setupServer(
        rest.get('/api/songs', (req, res, ctx) => {
          return res(ctx.json({ songs: [mockSong] }));
        })
      );
      ```

### Avanzadas
30. **¿Qué cobertura de tests apuntarían y por qué?**
    - **Respuesta**:
      - **Crítico (100%)**: auth, services, utils
      - **Importante (80%)**: componentes de features
      - **Nice-to-have (60%)**: componentes UI simples
      - **Justificación**: Priorizar lo que más riesgo tiene y es difícil de debuggear.

---

## 🚀 PERFORMANCE

### Básicas
31. **¿Qué optimizaciones de performance ya están implementadas?**
    - **Respuesta**:
      - Vite con HMR rápido
      - Skeleton loaders (UX)
      - Tailwind CSS (CSS purging automático)
      - React keys en listas

32. **¿Qué es el bundle splitting y por qué es importante?**
    - **Respuesta**: Dividir el JavaScript en múltiples archivos pequeños en lugar de uno grande. Permite cargar solo el código necesario por ruta, reduciendo tiempo de carga inicial.

### Intermedias
33. **¿Cómo optimizarían las re-renders en SongDetailPage?**
    - **Respuesta**:
      - `useMemo` para cálculos costosos (ordenamiento de anotaciones)
      - `useCallback` para funciones pasadas a child components
      - `React.memo` para componentes que no cambian frecuentemente
      - Mover estado local lo más cerca posible de donde se usa

34. **¿Qué métricas de performance medirían?**
    - **Respuesta**: Web Vitals:
      - **LCP** (Largest Contentful Paint): < 2.5s
      - **FID** (First Input Delay): < 100ms
      - **CLS** (Cumulative Layout Shift): < 0.1
      - **TTFB** (Time to First Byte): < 600ms

### Avanzadas
35. **Si el rendering de letras con anotaciones es lento, ¿cómo lo optimizarían?**
    - **Respuesta**:
      - Virtualización con react-window (si letras muy largas)
      - Memoizar resultado de `renderLyricsWithAnnotations()`
      - Usar Web Workers para cálculos de overlapping
      - Implementar incremental rendering (React Concurrent Mode)

---

## 💡 BONUS: Preguntas Conceptuales Profundas

36. **¿Cuál es la diferencia filosófica entre React y Angular?**
    - **Respuesta**: React es una librería (solo UI), opinionated en lo mínimo, deja decisiones al developer (routing, estado, etc.). Angular es un framework completo, muy opinionated, incluye todo (DI, routing, forms) pero menos flexible.

37. **¿Por qué React usa Virtual DOM en lugar de manipular el DOM directamente?**
    - **Respuesta**: El Virtual DOM permite a React hacer diff eficiente entre estados y aplicar solo los cambios mínimos necesarios al DOM real. Manipular DOM directamente es costoso (repaints, reflows), el Virtual DOM optimiza esto.

38. **Si tuvieran que presentar este proyecto en una entrevista técnica, ¿qué destacarían y qué mejorarían primero?**
    - **Destacar**:
      - Arquitectura modular escalable
      - Implementación compleja de anotaciones
      - UX bien pensada con feedback visual
    - **Mejorar primero**:
      - Implementar tests (demuestra profesionalismo)
      - Migrar a React Query (demuestra conocimiento de estado del servidor)
      - Remover mysql2 (demuestra conciencia de seguridad)

---

## 🎯 RECOMENDACIONES FINALES

### Estrategia de Defensa

1. **Conoce las fortalezas**: Habla con confianza sobre la arquitectura modular y UX
2. **Anticipa debilidades**: Prepara explicaciones de por qué no hay tests (tiempo, prioridades)
3. **Muestra conocimiento**: Explica cómo lo mejorarías, no solo qué está mal
4. **Usa ejemplos de código**: Ten snippets preparados para mostrar patrones
5. **Conecta con teoría**: Relaciona decisiones técnicas con principios de ingeniería de software

### Áreas de Estudio Previo

- [ ] Principios SOLID
- [ ] Patrones de diseño (GoF)
- [ ] React Hooks en profundidad
- [ ] Gestión de estado (useState, useReducer, Context, Redux, React Query)
- [ ] Performance optimization en React
- [ ] Testing strategies (unit, integration, E2E)
- [ ] Web Security (OWASP Top 10)

### Tiempo de Preparación Sugerido

- **Revisar informe completo**: 2 horas
- **Estudiar áreas débiles**: 3 horas
- **Preparar ejemplos de código**: 2 horas
- **Practicar respuestas**: 1 hora
- **Total**: ~8 horas

---

**¡Buena suerte en la presentación! 🚀**
