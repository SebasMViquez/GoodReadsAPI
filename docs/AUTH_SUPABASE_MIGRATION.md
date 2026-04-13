# Supabase Auth Migration Plan

Fecha: 2026-04-12

Este documento define lo necesario para poner login real con Supabase y alinear usuarios/sesiones entre Supabase + backend + frontend.

## 1) Requerimientos (antes de integrar)

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEY` (backend)
- Decision de producto:
  - Confirmacion de email (`on`/`off`)
  - Login por `email` solamente o `email + username`

## 2) Supabase (Dashboard + SQL)

### Dashboard

- Authentication -> Providers:
  - habilitar Email/Password.
- Authentication -> URL Configuration:
  - configurar `Site URL` y redirects del entorno local/prod.

### SQL (orden recomendado)

1. `GoodReadsAPI.Server/Database/Sql/001_books.sql`
2. `GoodReadsAPI.Server/Database/Sql/002_social_core.sql`
3. `GoodReadsAPI.Server/Database/Sql/005_supabase_auth_alignment.sql`
4. `GoodReadsAPI.Server/Database/Sql/006_default_avatar_placeholder.sql`
5. Opcional: seeds `003` y `004`.

### Que hace `005_supabase_auth_alignment.sql`

- Agrega `public.users.auth_user_id uuid`.
- Backfill por email con `auth.users`.
- Inserta perfiles faltantes en `public.users` para cuentas ya existentes en `auth.users`.
- Trigger `auth.users -> public.users` para crear/sincronizar perfil app.
- Trigger para sincronizar cambios de email.
- Helper `public.current_app_user_id()` para politicas RLS futuras.

### Que hace `006_default_avatar_placeholder.sql`

- Reemplaza avatares heredados del default anterior por un placeholder neutral.
- Actualiza el trigger `handle_new_auth_user()` para que cuentas nuevas usen placeholder neutral en `avatar`.

## 3) Backend (.NET)

### Configuracion

`appsettings.*`:

```json
"SupabaseAuth": {
  "Enabled": true,
  "Authority": "https://<project-ref>.supabase.co/auth/v1",
  "Audience": "authenticated",
  "RequireHttpsMetadata": true,
  "AllowLegacyUserIdFallback": true
}
```

Notas:

- Si `Enabled=false`, el backend sigue soportando fallback por `X-User-Id`.
- Si `Enabled=true`, el backend valida JWT de Supabase cuando llega `Authorization: Bearer ...`.

### Estado actual ya implementado

- Esquema hibrido de auth:
  - JWT (`Bearer`) cuando llega token.
  - Fallback legacy por `X-User-Id`/`userId` si `AllowLegacyUserIdFallback=true`.
- `UseAuthentication()` + `UseAuthorization()`.
- En validacion JWT, backend intenta mapear `sub` -> `public.users.id` usando `auth_user_id` y agrega claim `app_user_id` para servicios sociales.
- Endpoints protegidos con `[Authorize]`:
  - `POST /api/users/{targetUserId}/follow`
  - `DELETE /api/users/{targetUserId}/follow`
  - todos los endpoints `/api/me/*`
- Resolucion de usuario actual por:
  1. `app_user_id` (cuando existe mapeo auth->app).
  2. `sub` JWT.
  3. `X-User-Id` (solo con fallback legacy activo).
  4. `userId` query (solo con fallback legacy activo).

## 4) Frontend (goodreadsapi.client)

### Variables de entorno

`.env`:

```env
VITE_API_BASE_URL=http://localhost:5068
VITE_USE_MOCK_API=false
VITE_USE_SUPABASE_AUTH=true
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

### Estado actual ya implementado

- Cliente `supabaseAuth` por REST (`/auth/v1`) con persistencia de sesion local.
- `AuthContext` usa Supabase para:
  - `login`
  - `register`
  - `logout`
  - restauracion de sesion en bootstrap
- Requests a backend incluyen `Authorization: Bearer <token>` si existe.
- Se mantiene fallback local/mock para no romper ambientes sin Supabase.

## 5) Alineacion de identidad y sesiones

- Identidad canonica: `auth.users.id` (UUID, claim `sub`).
- Perfil app/social: `public.users` (relacionado por `auth_user_id`).
- Sesion canonica: Supabase access/refresh tokens.
- Fallback temporal actual: sesion local + `X-User-Id` para migracion gradual.

## 6) Checklist de validacion

1. Crear cuenta en `/register` con `VITE_USE_SUPABASE_AUTH=true`.
2. Verificar creacion de fila en `auth.users`.
3. Verificar trigger crea/sincroniza `public.users`.
4. Login en `/login` y confirmar sesion activa en frontend.
5. Llamar `GET /api/me/library` con bearer token (sin `X-User-Id`).
6. Ejecutar follow/favorite/progress y confirmar persistencia DB.

Consulta util para validar relacion auth/app:

```sql
select
  a.id as auth_id,
  a.email as auth_email,
  u.id as app_user_id,
  u.username as app_username,
  u.email as app_email
from auth.users a
left join public.users u on u.auth_user_id = a.id
order by a.created_at desc;
```

## 7) Siguiente corte recomendado

- Cambiar `AllowLegacyUserIdFallback` a `false` en ambientes donde Supabase Auth ya este estable.
- Retirar gradualmente dependencia de `user_accounts` y sesion local mock.
- Aplicar politicas RLS por `auth.uid()` para acceso directo seguro (si aplica).
