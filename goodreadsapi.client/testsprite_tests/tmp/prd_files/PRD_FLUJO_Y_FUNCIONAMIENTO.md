# PRD - GoodReadsAPI (Flujo y Funcionamiento)

Fecha: 2026-04-16
Version: 1.0 (baseline operativo)
Estado: Documento de referencia para producto + integracion frontend/backend

## 1. Resumen Ejecutivo

GoodReadsAPI es un monorepo con dos aplicaciones desacopladas:

- Frontend: `goodreadsapi.client` (React + Vite + TypeScript)
- Backend: `GoodReadsAPI.Server` (ASP.NET Core Web API + Supabase/PostgREST)

El producto ya tiene una experiencia completa de red social de lectura en frontend (discover, perfiles, follows, biblioteca, reviews, actividad, mensajes, notificaciones y settings). El backend ya cubre catalogo, usuarios, follows, perfil y biblioteca, con autenticacion hibrida (JWT Supabase + fallback legacy por `X-User-Id` mientras migra).

Este PRD define el flujo end-to-end actual, los requisitos funcionales, las brechas existentes y el roadmap para cerrar la migracion a backend real sin romper UX.

## 2. Problema y Oportunidad

Problema actual:

- El frontend tiene mas funcionalidad que el backend persistido.
- Parte del dominio social aun se guarda en `localStorage` (reviews, actividad, mensajes, notificaciones, varias settings).

Oportunidad:

- La base tecnica ya esta lista para migrar por verticales sin rehacer UI.
- Se puede pasar a un modo full-backend progresivo usando contratos ya definidos y estructura limpia por capas.

## 3. Objetivos de Producto

- Entregar una plataforma social de lectura bilingue (`es`/`en`) con experiencia fluida en web.
- Mantener descubrimiento editorial (catalogo + curacion) y capa social activa.
- Garantizar persistencia consistente de identidad, biblioteca y grafo social.
- Completar migracion desde estado local hacia backend/Supabase sin regresiones visibles.

## 4. No Objetivos (En este corte)

- No se busca redisenar UI principal.
- No se busca reemplazar stack (React/.NET/Supabase).
- No se incluye panel admin dedicado (el CRUD de libros actual es de laboratorio dev).

## 5. Alcance Funcional Actual (As-Is)

### 5.1 Frontend

Rutas publicas:

- `/`
- `/search`
- `/explore`
- `/readers`
- `/books/:slug`
- `/community`
- `/login`
- `/register`
- `/profile/:username`

Rutas protegidas (requieren sesion):

- `/library`
- `/messages`
- `/notifications`
- `/settings`

Ruta dev:

- `/dev/books-lab` (solo en `import.meta.env.DEV`)

Capacidades principales ya operativas en UI:

- Autenticacion: login, registro, logout, update profile, cambio de password.
- Biblioteca: shelf (`want-to-read`, `currently-reading`, `read`), favoritos, progreso 0-100.
- Social: follow/unfollow, follow request para perfiles privados, aceptar/rechazar solicitudes.
- Reviews: crear review (1 por usuario/libro), likes, comentarios.
- Actividad: likes y comentarios en activity feed.
- Mensajeria: conversaciones, envio de mensajes, marca visto.
- Notificaciones: bandeja + menu global + acciones de follow request.
- Settings: profile/account/privacy conectados parcialmente a backend; resto local.

### 5.2 Backend

Endpoints implementados:

- `GET /api/health`
- `GET /api/books`
- `GET /api/books/{id}`
- `GET /api/books/slug/{slug}`
- `POST /api/books`
- `PUT /api/books/{id}`
- `DELETE /api/books/{id}`
- `GET /api/users`
- `GET /api/users/{username}`
- `GET /api/users/{userId}/followers`
- `GET /api/users/{userId}/following`
- `GET /api/users/{userId}/library`
- `POST /api/users/{targetUserId}/follow` (Authorize)
- `DELETE /api/users/{targetUserId}/follow` (Authorize)
- `PUT /api/me/profile` (Authorize)
- `GET /api/me/follow-requests` (Authorize)
- `POST /api/me/follow-requests/{requestId}/accept` (Authorize)
- `POST /api/me/follow-requests/{requestId}/decline` (Authorize)
- `GET /api/me/library` (Authorize)
- `PUT /api/me/library/books/{bookId}/shelf` (Authorize)
- `PUT /api/me/library/books/{bookId}/favorite` (Authorize)
- `PUT /api/me/library/books/{bookId}/progress` (Authorize)
- `GET /api/me/library/favorites/following` (Authorize)

Pendiente en backend (aunque el frontend ya lo usa local):

- Reviews persistidas + likes/comments
- Activity feed persistido
- Conversaciones/mensajes persistidos
- Notificaciones persistidas
- Settings por seccion via API dedicada

## 6. Arquitectura del Sistema

### 6.1 Monorepo

- `goodreadsapi.client/`
- `GoodReadsAPI.Server/`
- `docs/`

### 6.2 Frontend

Patrones clave:

- Context providers para estado global: Auth, Library, Language, Theme, Toast.
- Adapters de API en `src/services/api/*` con fallback local/mock.
- Bootstrap gate para bloquear UI hasta hidratar estado.
- Error boundary + bridge de monitoreo global.

Modos de operacion:

- Mock/local: persistencia principal en `localStorage`.
- Backend API: usa `VITE_API_BASE_URL` y `VITE_USE_MOCK_API=false`.
- Supabase Auth: usa `VITE_USE_SUPABASE_AUTH=true` + URL/key publishable.

### 6.3 Backend

Patron por capas:

- `Controllers` (HTTP)
- `Contracts` (DTO request/response)
- `Application` (casos de uso)
- `Domain` (entidades)
- `Infrastructure` (repositorios + cliente Supabase REST)

Autenticacion:

Esquema hibrido:

- JWT Bearer (Supabase) cuando hay token y auth configurada.
- Fallback legacy (`X-User-Id` o `userId`) si `AllowLegacyUserIdFallback=true`.

Resolucion de usuario actual en endpoints protegidos:

- claim `app_user_id`
- claim `sub`
- header `X-User-Id` (fallback)
- query `userId` (fallback)

## 7. Flujo End-to-End

### 7.1 Bootstrap de Aplicacion

1. Frontend carga preferencias (`theme`, `density`, `reduceMotion`, `locale`).
2. Intenta hidratar catalogo remoto (`GET /api/books`); si falla usa seeds.
3. `AuthProvider` hidrata estado local, restaura sesion Supabase (si aplica), y sincroniza usuarios/follows/requests con backend si esta habilitado.
4. `LibraryProvider` hidrata estado local y sincroniza biblioteca remota si backend habilitado.
5. Si falla bootstrap, `AppBootstrapGate` muestra estado de error con retry.

### 7.2 Registro y Login

Registro:

1. Validaciones UI (username/email/password).
2. Si Supabase Auth activo, usa signup y crea sesion (inmediata o post-confirmacion).
3. Si backend habilitado, sincroniza estado social remoto.
4. Fallback local: crea cuenta y usuario en estado mock + sesion local.

Login:

1. Usuario ingresa email o username.
2. Si Supabase activo y se ingreso username, frontend resuelve email via usuarios locales/remotos.
3. Login Supabase con email/password.
4. Se crea sesion en estado de app y se sincroniza backend social.
5. Fallback local valida `accounts` en storage.

### 7.3 Descubrimiento y Catalogo

- Home/Explore/Search/BookDetails leen de catalogo unificado (`books`, `authors`, `reviews`, `users` en memoria).
- Catalogo puede venir de seeds o API backend (`/api/books`).
- Explore/Search aplican filtros/sorting completamente cliente por ahora.

### 7.4 Biblioteca del Usuario

Operaciones:

- Cambiar shelf
- Favoritos on/off
- Progreso lectura

Flujo:

1. UI dispara accion desde BookCard/BookDetails/Library.
2. Si backend habilitado, llama `PUT /api/me/library/...` y luego recarga `GET /api/me/library`.
3. Si no, actualiza `libraryState` local.

Reglas:

- Shelf valida 3 estados fijos.
- Progreso se clampa 0..100.
- Progreso fuerza `currently-reading`.
- Favorito puede crear fila de biblioteca segun contexto.

### 7.5 Grafo Social (Follow)

Follow publico:

1. `POST /api/users/{targetUserId}/follow`
2. Se crea follow directo si target es publico.
3. Se incrementan contadores followers/following.

Follow perfil privado:

1. `POST /api/users/{targetUserId}/follow`
2. Crea `follow_request` pendiente.
3. Target acepta o rechaza desde notificaciones/me endpoint.

Unfollow:

- `DELETE /api/users/{targetUserId}/follow`
- Decrementa contadores.

### 7.6 Perfil

- `GET /api/users/{username}` y listas de followers/following.
- Perfil propio: usa estado auth/library del usuario autenticado.
- Perfil de tercero con backend activo y perfil publico: carga biblioteca remota via `GET /api/users/{userId}/library`.
- Perfil de tercero con visibilidad privada: oculta secciones profundas.

### 7.7 Reviews y Activity (estado actual)

- Hoy se crean y mutan localmente en `AuthContext`.
- Incluye review unica por usuario/libro.
- Incluye likes y comentarios en reviews.
- Incluye likes y comentarios en activities.
- Crear review agrega actividad al feed.

### 7.8 Mensajes y Notificaciones

Mensajes:

- Conversaciones 1:1 en estado local.
- Envio de mensaje crea notificacion tipo `message` al receptor.
- Lectura marca mensajes como `seen`.

Notificaciones:

- Tipos: `message`, `follow`, `activity`, `follow-request`, `request-approved`.
- Bandeja y dropdown comparten estado global.
- `markNotificationsAsRead` marca todo leido para current user.

## 8. Persistencia

### 8.1 Persistencia backend (ya conectada)

- `public.books`
- `public.users`
- `public.user_follows`
- `public.follow_requests`
- `public.user_book_library`

### 8.2 Persistencia local (temporal o parcial)

- `goodreads-auth-state`: users, reviews, accounts, follows map, conversations, followRequests, notifications, sessions.
- `goodreads-library-state`: shelves/favorites/progressMap por usuario.
- `goodreads:app-settings`: notifications, appearance, language, reading, security (en gran parte local).

## 9. Modelo de Datos (Supabase)

Tablas core ya definidas por SQL:

- `books`
- `authors`
- `users`
- `user_follows`
- `follow_requests`
- `user_book_library`

Tablas sociales ya creadas para fases siguientes:

- `reviews`, `review_likes`, `review_comments`
- `activities`, `activity_likes`, `activity_comments`
- `conversations`, `conversation_participants`, `messages`
- `notifications`
- `user_settings`

Auth alignment:

- `users.auth_user_id uuid` con mapeo a `auth.users.id`
- triggers para crear/sincronizar perfil app al crear usuario auth

## 10. Requisitos Funcionales (FR)

FR-01: El usuario puede registrarse y loguearse con email/password.

FR-02: El sistema debe soportar login por username en UI (resolviendo email cuando aplique).

FR-03: El usuario autenticado puede editar su perfil (nombre, username, bio, avatar, banner, visibilidad, etc).

FR-04: El catalogo de libros debe ser consultable desde backend y fallback local.

FR-05: El usuario autenticado puede gestionar biblioteca personal (shelf/favorito/progreso).

FR-06: El usuario puede seguir/dejar de seguir otros usuarios.

FR-07: Si perfil target es privado, follow debe crear solicitud pendiente en vez de follow directo.

FR-08: El usuario target puede aceptar/rechazar solicitudes de follow.

FR-09: El usuario puede navegar perfiles y ver red social basica (followers/following).

FR-10: El sistema debe exponer biblioteca publica de un usuario por endpoint dedicado.

FR-11: El frontend debe ofrecer feed comunitario, reviews, mensajes y notificaciones.

FR-12: Reviews/activity/messages/notificaciones deben migrar a persistencia backend en siguientes fases.

## 11. Requisitos No Funcionales (NFR)

NFR-01: IDs estables string para compatibilidad con modelo actual frontend.

NFR-02: Fechas en UTC ISO-8601.

NFR-03: Contratos bilingues para campos localizados (`en`/`es`).

NFR-04: CORS configurable para frontend local.

NFR-05: Manejo resiliente de errores en bootstrap y llamadas de red.

NFR-06: Monitoreo minimo por eventos y captura global de errores en frontend.

NFR-07: Swagger habilitado en desarrollo para validacion de contrato.

## 12. Analitica y Observabilidad

Eventos ya instrumentados:

- `page_viewed`
- `auth_login_succeeded` / `auth_login_failed`
- `auth_register_succeeded`
- `auth_logout`
- `profile_updated`
- `password_changed`
- `follow_started`
- `library_shelf_updated`
- `library_favorite_toggled`
- `library_progress_updated`
- `review_created`
- `message_sent`

## 13. Riesgos y Brechas

R-01: Desalineacion temporal entre estado local (reviews/messages/notifs) y backend persistido.

R-02: Dependencia del fallback `X-User-Id` durante migracion puede ocultar problemas de JWT si no se retira a tiempo.

R-03: Falta de paginacion en varios listados puede impactar performance al crecer datos.

R-04: Cobertura de tests automatizados aun baja para flujos de negocio criticos.

R-05: Si `VITE_USE_MOCK_API` o variables env quedan mal configuradas, el entorno puede quedar en modo mixto no deseado.

## 14. Roadmap Recomendado

Fase A (cerrar core social persistido):

- Persistir reviews + likes/comments.
- Persistir activity feed + likes/comments.

Fase B (comunicacion persistida):

- Persistir conversaciones/mensajes.
- Persistir notificaciones con marca leido.

Fase C (settings backend):

- Endpoints por seccion para `user_settings`.
- Mantener fallback local solo para flags de UX transitorias si aplica.

Fase D (hardening auth):

- Desactivar `AllowLegacyUserIdFallback` en ambientes estables.
- Reforzar politicas RLS por `auth.uid()` + mapeo `current_app_user_id()`.

## 15. Criterios de Exito

- 100% de flujos principales (auth, biblioteca, social, reviews, mensajes, notificaciones, settings) persistidos en backend.
- 0 regresiones UX en rutas principales durante migracion.
- Eliminacion progresiva de estado mock para dominio social.
- Trazabilidad de eventos clave de uso y errores en todos los journeys principales.
