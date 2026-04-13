# Settings Persistence Matrix

Fecha: 2026-04-12

Esta matriz describe que se guarda en base de datos y que permanece local en frontend.

## Persistencia en DB (backend + Supabase)

- Seccion `Perfil` (`/settings?section=profile`):
  - `name`
  - `username`
  - `avatar`
  - `banner`
  - `role` (por locale)
  - `bio` (por locale)
  - `location`
  - `website`
  - Ruta: `PUT /api/me/profile`
  - Tabla: `public.users`

- Seccion `Cuenta` (`/settings?section=account`):
  - `email` (intenta actualizar Auth + perfil app)
  - `password` (Supabase Auth)
  - Rutas:
    - Auth: `PUT /auth/v1/user` (email/password)
    - Perfil app: `PUT /api/me/profile`
  - Tablas:
    - `auth.users` (email/password)
    - `public.users` (email)

- Seccion `Privacidad` (`/settings?section=privacy`):
  - `profileVisibility`
  - Ruta: `PUT /api/me/profile`
  - Tabla: `public.users`

## Persistencia local (frontend por ahora)

- `notifications`
- `appearance`
- `language`
- `reading` (objetivos y preferencias de UI)
- `security` (preferencias de interfaz)

Estas secciones hoy se guardan en storage local del cliente y aun no tienen endpoints backend dedicados.
