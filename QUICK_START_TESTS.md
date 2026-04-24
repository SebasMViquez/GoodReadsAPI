# ⚡ Guía Rápida de Ejecución - GoodReadsAPI Tests

## 🚀 Ejecutar Pruebas en 3 Pasos

### Paso 1: Preparar la Aplicación (1 min)
```bash
cd c:\.NET\WEB\GoodReadsAPI\goodreadsapi.client

# Limpiar build anterior (opcional)
# rm -r dist

# Construir aplicación
npm run build

# Iniciar en production preview
npm run preview
```

**Esperado:** Verás algo como:
```
  ➜  Local:   http://localhost:4173/
```

---

### Paso 2: Ejecutar TestSprite en Otra Terminal (15-20 min)
```bash
# Abre una NUEVA terminal PowerShell

cd c:\.NET\WEB\GoodReadsAPI\goodreadsapi.client

# Ejecutar pruebas
npx @testsprite/testsprite-mcp generateCodeAndExecute
```

**Esperado:** Verás:
```
⢰⡾⢶⣤⡀⠀⠀...
Starting test execution...
Tunnel started successfully!
Running tests...
Progress ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0/15 Completed
```

**Tiempo:** Esto tomará 15-20 minutos completándose

---

### Paso 3: Ver Resultados (2 min)
Una vez completado:

```bash
# Ver reporte en markdown
cat testsprite_tests/testsprite-mcp-test-report.md | less

# O abrir HTML en navegador (Windows)
start testsprite_tests\testsprite-mcp-test-report.html
```

---

## 📊 Resultados Esperados

### Archivos Generados
```
testsprite_tests/
├── testsprite-mcp-test-report.md        (Reporte texto)
├── testsprite-mcp-test-report.html      (Reporte interactivo)
└── tmp/
    └── execution.lock                   (Control de ejecución)
```

### Contenido del Reporte
- ✅/❌ Resultado de cada caso (PASS/FAIL)
- ⏱️ Tiempo de ejecución por caso
- 📸 Capturas de pantalla (si fallan)
- 📋 Logs detallados
- 📊 Resumen general

---

## ⚠️ Solución de Problemas

### Error: "Port already in use"
```bash
# Cambiar puerto en vite.config.ts o vite.preview.config
# O matar proceso anterior:
netstat -ano | findstr :4173
taskkill /PID <PID> /F
```

### Error: "Tests are running. Lock file exists"
```bash
# Limpiar archivo de bloqueo:
Remove-Item "testsprite_tests\tmp\execution.lock" -Force
```

### Error: "Connection refused"
```bash
# Asegurar que la app está corriendo:
# 1. Verifica que npm run preview esté ejecutándose
# 2. Abre http://localhost:4173 en navegador
# 3. Si no carga, reconstruye: npm run build
```

### Error: "No response from backend"
Este es un warning normal. TestSprite manejará reintentos automáticamente.

---

## 🎯 Qué Está Siendo Probado

| Caso | Funcionalidad | Estado |
|------|---------------|--------|
| TC001 | Registro | ⏳ Testing |
| TC003 | Login | ⏳ Testing |
| TC004 | Explore Catalog | ⏳ Testing |
| TC005 | View Book Details | ⏳ Testing |
| TC006 | Update Progress | ⏳ Testing |
| TC007 | Home Books | ⏳ Testing |
| TC008 | Add to Library | ⏳ Testing |
| TC009 | Mark Favorite | ⏳ Testing |
| TC002 | Library Shelves | ⏳ Testing |

*Estos son los 9 casos principales de los 15 generados*

---

## 🎬 Pasos Exactos que TestSprite Ejecutará

Para cada caso de prueba, TestSprite:

1. **Abrirá el navegador** en la URL indicada
2. **Simulará clics** en botones y enlaces
3. **Rellenará formularios** con datos válidos
4. **Esperará carga** de elementos
5. **Verificará** que los elementos esperados aparezcan
6. **Capturará pantallazos** si algo falla
7. **Registrará logs** de cada acción

---

## 📈 Cómo Interpretar Resultados

### ✅ PASS (Éxito)
```
TC001: Register a new account and land on the home experience
✅ PASSED - 45.2 seconds
```
La prueba completó todos los pasos y validaciones sin problemas.

### ❌ FAIL (Fallo)
```
TC008: Add a book to Want-to-read and verify it appears in Library
❌ FAILED - Cannot find element "button[aria-label='Add to library']"
Screenshot: ./screenshots/TC008_failure_1234.png
```
La prueba encontró un problema. Ver screenshot incluido.

### ⏱️ TIMEOUT
```
TC006: Update reading progress for a currently-reading book
⏱️ TIMEOUT - Waited 30s for element to appear
```
La aplicación respondió lentamente.

---

## 💡 Tips de Ejecución

### Para Mejor Rendimiento
```bash
# Asegurar que no haya otras apps usando 4173
# Cerrar navegadores no necesarios
# Desactivar extensiones de navegador
# Mantener conexión a internet estable
```

### Para Monitoreo en Vivo
```bash
# Terminal 1: Aplicación
npm run preview

# Terminal 2: Tests (verás progreso en vivo)
npx @testsprite/testsprite-mcp generateCodeAndExecute

# Terminal 3 (opcional): Monitorear logs
tail -f testsprite_tests\tmp\execution.log
```

---

## 🎥 Después de las Pruebas

### Opción 1: Presentar Resultados
```bash
# Abrir reporte HTML en navegador
start testsprite_tests\testsprite-mcp-test-report.html

# Compartir con equipo
# Los resultados quedarán guardados en:
testsprite_tests\testsprite-mcp-test-report.md
testsprite_tests\testsprite-mcp-test-report.html
```

### Opción 2: Revisar Logs Detallados
```bash
# Markdown format
cat testsprite_tests\testsprite-mcp-test-report.md

# Si necesitas datos en JSON para análisis posterior
cat testsprite_tests\testsprite_frontend_test_plan.json
```

### Opción 3: Integrar en CI/CD
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx @testsprite/testsprite-mcp generateCodeAndExecute
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: testsprite_tests/
```

---

## 🔄 Ejecutar Nuevamente (Después de Cambios)

Si cambias código y quieres ejecutar de nuevo:

```bash
# Limpiar lock
Remove-Item "testsprite_tests\tmp\execution.lock" -Force -ErrorAction SilentlyContinue

# Reconstruir si hay cambios
npm run build

# Ejecutar pruebas nuevamente
npx @testsprite/testsprite-mcp generateCodeAndExecute
```

---

## 📞 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| Tests no terminan | Ctrl+C y revisar logs |
| Aplicación no responde | Ejecutar `npm run preview` en nueva terminal |
| Reporte no se genera | Verificar que tests completaron (ver output) |
| Puerto ocupado | `netstat -ano \| findstr :4173` |

---

## ✨ Después de Todo

Una vez las pruebas completen:

1. ✅ **Documentación:** Abre `testsprite_tests/README.md`
2. ✅ **Presentación:** Usa `testsprite_tests/TEST_REPORT_PRESENTATION.md`
3. ✅ **Análisis:** Revisa `testsprite_tests/testsprite-mcp-test-report.md`
4. ✅ **Siguientes Pasos:** Considera integración en CI/CD

---

## ⏱️ Timeframe Total

| Tarea | Tiempo |
|-------|--------|
| Build | 4 segundos |
| Preview start | 1 segundo |
| Test execution | 15-20 minutos |
| Total | ~20 minutos |

---

**¿Necesitas ayuda?**
- Revisa `testsprite_tests/SUMMARY_EJECUTIVO.md` para visión general
- Consulta `testsprite_tests/TEST_REPORT_PRESENTATION.md` para detalles técnicos
- Lee `testsprite_tests/TEST_COVERAGE_MATRIX.md` para entender cobertura

---

**Status:** ✅ Listo para Ejecutar
**Última actualización:** 24 Abril 2026
