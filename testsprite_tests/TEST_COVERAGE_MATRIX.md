# 🎯 Matriz de Cobertura de Pruebas - GoodReadsAPI

## Mapa de Casos de Prueba por Funcionalidad

```
┌─────────────────────────────────────────────────────────────────┐
│                     CATEGORÍAS DE PRUEBAS                       │
└─────────────────────────────────────────────────────────────────┘

📍 AUTENTICACIÓN (2 casos)
│
├─ TC001: Registro de nueva cuenta ✅
│  ├─ Navegación a /register
│  ├─ Validación de campos
│  ├─ Envío de formulario
│  └─ Redirección a home
│
└─ TC003: Login con credenciales ✅
   ├─ Navegación a /login
   ├─ Ingreso de credenciales
   ├─ Autenticación
   └─ Sesión iniciada


📚 CATÁLOGO Y EXPLORACIÓN (3 casos)
│
├─ TC007: Home con libros destacados ✅
│  ├─ Visualización de featured books
│  ├─ Visualización de trending books
│  └─ Animaciones y efectos
│
├─ TC004: Abrir detalles desde explore ✅
│  ├─ Navegación a /explore
│  ├─ Clic en libro
│  └─ Carga de página de detalles
│
└─ TC005: Información del libro ✅
   ├─ Título y autor
   ├─ Portada
   ├─ Descripción
   └─ Géneros y rating


📖 BIBLIOTECA DEL USUARIO (2 casos)
│
├─ TC002: Visualizar estantes ✅
│  ├─ Acceso a /library (requiere auth)
│  ├─ Navegación entre tabs:
│  │  ├─ currently-reading
│  │  ├─ want-to-read
│  │  └─ read
│  ├─ Visualización de estadísticas
│  └─ Filtrado y sorting
│
└─ TC008: Agregar a want-to-read ✅
   ├─ Seleccionar libro desde explore
   ├─ Asignar a shelf "want-to-read"
   ├─ Navegar a /library
   ├─ Verificar presencia
   └─ Validar no duplicación


❤️ FAVORITOS (1 caso)
│
└─ TC009: Marcar como favorito ✅
   ├─ Clic en ícono de corazón
   ├─ Cambio visual inmediato
   ├─ Persistencia en base de datos
   ├─ Visualización en perfil
   └─ Desmarcar y verificar cambio


📊 PROGRESO DE LECTURA (1 caso)
│
└─ TC006: Actualizar progreso ✅
   ├─ Seleccionar libro
   ├─ Marcar como "currently-reading"
   ├─ Usar slider/input (0-100%)
   ├─ Visualización inmediata
   ├─ Validación en /library
   └─ Persistencia en backend


```

---

## 🔄 Flujos de Usuario Mapeados

### **FLUJO 1: Nuevo Usuario**
```
Register (TC001) 
    ↓
Home (TC007)
    ↓
Explore (TC004)
    ↓
Book Details (TC005)
```
**Cobertura:** ✅ 100%

### **FLUJO 2: Exploración y Agregación**
```
Home (TC007)
    ↓
Explore (TC004)
    ↓
Book Details (TC005)
    ↓
Favorite (TC009) / Add to Library (TC008)
```
**Cobertura:** ✅ 100%

### **FLUJO 3: Gestión de Biblioteca**
```
Library (TC002)
    ↓
View Shelves / Switch Tabs
    ↓
See Books / Stats
    ↓
Track Progress (TC006)
```
**Cobertura:** ✅ 100%

### **FLUJO 4: Lectura Activa**
```
Book Details (TC005)
    ↓
Add to Currently-Reading (TC008)
    ↓
Update Progress (TC006)
    ↓
Library (TC002) - Verify Progress
    ↓
Mark Favorite (TC009)
```
**Cobertura:** ✅ 100%

---

## 📱 Pantallas Cubiertas

| Pantalla | Casos Asociados | Cobertura |
|----------|----------------|-----------|
| `/register` | TC001 | ✅ 100% |
| `/login` | TC003 | ✅ 100% |
| `/` (Home) | TC007 | ✅ 100% |
| `/explore` | TC004 | ✅ 100% |
| `/books/:slug` | TC005, TC006, TC008, TC009 | ✅ 100% |
| `/library` | TC002 | ✅ 100% |
| `/profile` | Validación de favoritos | ✅ Parcial |

---

## 🎬 User Journey Mapping

### Journey 1: "Guest Discovery"
**Objetivo:** Explorar catálogo sin autenticación

```
         ┌─────────────────────────────────┐
         │ 1. Llega a Home (TC007)         │
         │    - Ve libros destacados       │
         │    - Ve tendencias              │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 2. Navega a Explore (TC004)     │
         │    - Busca por género           │
         │    - Encuentra libros           │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 3. Selecciona un libro          │
         │    - Ve detalles (TC005)        │
         │    - Lee sinopsis               │
         │    - Ve rating                  │
         └─────────────────────────────────┘

Status: ✅ Cubierto por TC007, TC004, TC005
```

### Journey 2: "New Member"
**Objetivo:** Registrarse y comenzar a usar la app

```
         ┌─────────────────────────────────┐
         │ 1. Registra cuenta (TC001)      │
         │    - Completa formulario        │
         │    - Confirma email             │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 2. Explora catálogo (TC004)     │
         │    - Busca libros interesantes  │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 3. Agrega a biblioteca (TC008)  │
         │    - Selecciona shelf           │
         │    - Confirma adición           │
         └─────────────────────────────────┘

Status: ✅ Cubierto por TC001, TC004, TC008
```

### Journey 3: "Active Reader"
**Objetivo:** Seguir progreso de lectura

```
         ┌─────────────────────────────────┐
         │ 1. Abre detalles del libro      │
         │    (TC005)                      │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 2. Agrega a currently-reading   │
         │    (TC008)                      │
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 3. Actualiza progreso (TC006)   │
         │    - Usa slider                 │
         │    - Marca como favorito (TC009)│
         └──────────────┬──────────────────┘
                        ↓
         ┌─────────────────────────────────┐
         │ 4. Verifica en Biblioteca (TC002)
         │    - Ve progreso actualizado    │
         │    - Consulta estadísticas      │
         └─────────────────────────────────┘

Status: ✅ Cubierto por TC005, TC008, TC006, TC009, TC002
```

---

## 📊 Estadísticas de Cobertura

### Por Categoría
```
AUTENTICACIÓN       ▰▰▰▰▰▰▰▰▰▰ 100%  (2/2)
CATÁLOGO           ▰▰▰▰▰▰▰▰▰▰ 100%  (3/3)
BIBLIOTECA         ▰▰▰▰▰▰▰▰▰▰ 100%  (2/2)
FAVORITOS          ▰▰▰▰▰▰▰▰▰▰ 100%  (1/1)
PROGRESO           ▰▰▰▰▰▰▰▰▰▰ 100%  (1/1)
─────────────────────────────────────
TOTAL              ▰▰▰▰▰▰▰▰▰▰ 100%  (9/9)
```

### Por Prioridad
```
ALTA      ▰▰▰▰▰▰▰▰▰▰ 73%  (11/15)
MEDIA     ▰▰▰▰▰▰▰▰▰▰ 27%  (4/15)
BAJA      ▰▰▰▰▰▰▰▰▰▰  0%  (0/15)
```

---

## 🧪 Tipos de Validación

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| **Navegación** | 5 | Link clicking, routing |
| **Formularios** | 3 | Input filling, submission |
| **UI Elements** | 4 | Button clicks, status changes |
| **Persistencia** | 2 | Data saving, verification |
| **Validación Visual** | 6 | Color changes, text updates |
| **Flujos Complejos** | 2 | Multi-step journeys |

---

## 🎓 Recomendaciones de Ejecución

### Para Presentación Ejecutiva (10 minutos)
1. **Demostración:** TC007 (Home) + TC004 (Explore)
2. **Resultados:** Mostrar plan de pruebas
3. **Impacto:** Explicar cobertura de flujos

### Para QA Testing (30 minutos)
1. **Setup:** Ejecutar build y preview
2. **Ejecución:** Todos los 15 casos
3. **Análisis:** Revisar reportes y logs

### Para Documentación
1. **Screenshot:** Capturar flujos principales
2. **Video:** Grabación de ejecución
3. **Reporte:** Generar HTML/PDF

---

## 🔗 Referencias Rápidas

- **Plan Completo:** `testsprite_frontend_test_plan.json`
- **Resumen de Código:** `tmp/code_summary.yaml`
- **Configuración:** `.testsprite/config.json`
- **Reporte HTML:** `testsprite-mcp-test-report.html` (después de ejecutar)

---

**Documento:** Matriz de Cobertura de Pruebas E2E  
**Última Actualización:** 24 Abril 2026  
**Estado:** ✅ Completo y Listo para Presentación
