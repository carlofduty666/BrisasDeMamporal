# 📍 RASTREO DE ARCHIVOS - Dónde Está Todo

## 🎯 GUÍA DE UBICACIONES

Usa este documento para encontrar **exactamente dónde** está cada archivo y qué contiene.

---

## 📂 ESTRUCTURA ESPERADA

```
tu_proyecto/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── ✨ HorariosCalendar.jsx          (NUEVO)
│   │   │   │   ├── ✨ HorariosManagementV2.jsx      (NUEVO)
│   │   │   │   └── HorariosManagement.jsx           (original)
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── ✨ ProfesorHorariosPanel.jsx     (NUEVO)
│   │   │       ├── ProfesorDashboard.jsx            (EDITAR AQUÍ)
│   │   │       └── ...
│   │   │
│   │   ├── services/
│   │   │   └── 📝 horarios.service.js               (ACTUALIZAR)
│   │   │
│   │   ├── utils/
│   │   │   └── ✨ conflictDetection.js              (NUEVO)
│   │   │
│   │   └── ...
│   │
│   └── ...
│
└── .zencoder/
    ├── 📖 INDEX.md                                   (ENTRADA)
    ├── 📖 QUICK_START_HORARIOS.md                   (5 MIN)
    ├── 📖 HORARIOS_FEATURES_SUMMARY.md              (20 MIN)
    ├── 📖 HORARIOS_IMPLEMENTATION_GUIDE.md          (30 MIN)
    ├── 📖 PROFESOR_DASHBOARD_INTEGRATION.md         (15 MIN)
    ├── 📖 README_HORARIOS.md                        (10 MIN)
    ├── 📖 HORARIOS_CHEATSHEET.md                    (5 MIN)
    └── 📖 ARCHIVO_TRACKING.md                       (ESTE)
```

---

## 📦 ARCHIVOS NUEVOS PARA CREAR/COPIAR

### 1. HorariosCalendar.jsx
**Ruta**: `frontend/src/components/admin/HorariosCalendar.jsx`

**Qué contiene**:
- Componente de calendario en grid
- Vista de horas × días
- Código de colores por materia
- Tooltips informativos

**Tamaño**: ~400 líneas  
**Dependencias**: React, icons, utility functions  
**Uso**: Importado en HorariosManagementV2.jsx

**Cómo copiar**:
```bash
cp .zencoder/NUEVOS_ARCHIVOS/HorariosCalendar.jsx \
   frontend/src/components/admin/
```

---

### 2. HorariosManagementV2.jsx
**Ruta**: `frontend/src/components/admin/HorariosManagementV2.jsx`

**Qué contiene**:
- Manager mejorado CON las 6 features
- Vista tabla
- Vista calendario
- Modal de formulario
- Modal de duplicación
- Detección de conflictos
- Filtros avanzados

**Tamaño**: ~1100 líneas  
**Dependencias**: React, axios, react-toastify, iconos, conflictDetection.js  
**Uso**: Reemplaza HorariosManagement.jsx en las rutas

**Cómo copiar**:
```bash
cp .zencoder/NUEVOS_ARCHIVOS/HorariosManagementV2.jsx \
   frontend/src/components/admin/
```

**Luego actualizar rutas**:
```jsx
// ANTES:
import HorariosManagement from './HorariosManagement';

// DESPUÉS:
import HorariosManagement from './HorariosManagementV2';
```

---

### 3. ProfesorHorariosPanel.jsx
**Ruta**: `frontend/src/components/dashboard/ProfesorHorariosPanel.jsx`

**Qué contiene**:
- Panel de horarios del profesor
- Vista de semana
- Selector de día en móvil
- Información expandible
- Colores por materia
- Responsive design

**Tamaño**: ~350 líneas  
**Dependencias**: React, axios, iconos  
**Uso**: Se agrega al ProfesorDashboard.jsx

**Cómo copiar**:
```bash
cp .zencoder/NUEVOS_ARCHIVOS/ProfesorHorariosPanel.jsx \
   frontend/src/components/dashboard/
```

**Luego agregar al ProfesorDashboard.jsx**:
```jsx
import ProfesorHorariosPanel from './ProfesorHorariosPanel';

// En el JSX:
<ProfesorHorariosPanel 
  profesorId={profesor.id} 
  annoEscolarId={annoEscolar.id}
/>
```

---

### 4. conflictDetection.js
**Ruta**: `frontend/src/utils/conflictDetection.js`

**Qué contiene**:
- `obtenerTodosLosConflictos()` - Detecta 3 tipos
- `detectarConflictosProfesor()` - Profesor
- `detectarConflictosGradoSeccion()` - Clase
- `detectarConflictosAula()` - Aula
- `obtenerDisponibilidadProfesor()` - Franjas libres
- `generarMensajeConflictos()` - Mensaje legible
- `tiemposSuperpuestos()` - Utility

**Tamaño**: ~200 líneas  
**Dependencias**: Solo JavaScript puro  
**Uso**: Importado en HorariosManagementV2.jsx

**Cómo copiar**:
```bash
cp .zencoder/NUEVOS_ARCHIVOS/conflictDetection.js \
   frontend/src/utils/
```

---

## 📝 ARCHIVOS A ACTUALIZAR

### 5. horarios.service.js
**Ruta**: `frontend/src/services/horarios.service.js`

**Cambios**:
- Agregar método: `getHorariosByProfesor()`
- Agregar método: `duplicarHorarios()`
- Mantener métodos existentes

**Líneas nuevas**: ~30  
**Método de actualización**: Ver documentación

```bash
# Respaldo
cp frontend/src/services/horarios.service.js \
   frontend/src/services/horarios.service.js.bak

# Actualizar (ver QUICK_START_HORARIOS.md)
```

---

## 📖 DOCUMENTACIÓN

Todos estos archivos están en `.zencoder/`:

### 📍 PUNTO DE ENTRADA
**Archivo**: `INDEX.md`
- Rutas según tu necesidad
- Resumen de todas las features
- Flujo recomendado

```bash
# Leer primero
cat .zencoder/INDEX.md
```

---

### ⚡ PARA EMPEZAR RÁPIDO
**Archivo**: `QUICK_START_HORARIOS.md`
- Resumen en 30 segundos
- Pasos de 5 minutos
- Checklist de verificación
- Troubleshooting básico

**Tiempo**: 5 minutos  
**Cuándo**: Cuando tienes prisa

```bash
# Leer segundo
cat .zencoder/QUICK_START_HORARIOS.md
```

---

### 📊 ENTENDER FEATURES
**Archivo**: `HORARIOS_FEATURES_SUMMARY.md`
- Explicación detallada de cada feature
- Interfaces visuales de usuario
- Casos de uso reales
- Comparativa antes/después
- Beneficios de negocio

**Tiempo**: 20 minutos  
**Cuándo**: Quieres entender todo

```bash
# Leer tercero
cat .zencoder/HORARIOS_FEATURES_SUMMARY.md
```

---

### 🔧 DETALLES TÉCNICOS
**Archivo**: `HORARIOS_IMPLEMENTATION_GUIDE.md`
- Cómo funciona cada algoritmo
- Métodos disponibles
- Rendimiento y seguridad
- Mejoras futuras
- Troubleshooting avanzado

**Tiempo**: 30 minutos  
**Cuándo**: Necesitas modificar código

```bash
# Leer si necesitas detalles
cat .zencoder/HORARIOS_IMPLEMENTATION_GUIDE.md
```

---

### 🎓 INTEGRACIÓN EN DASHBOARD
**Archivo**: `PROFESOR_DASHBOARD_INTEGRATION.md`
- Ubicación exacta en ProfesorDashboard.jsx
- Variantes de integración
- Código completo con ejemplos
- Verificación de props
- Troubleshooting específico

**Tiempo**: 15 minutos  
**Cuándo**: Integras el panel al dashboard

```bash
# Leer cuando necesites agregar panel
cat .zencoder/PROFESOR_DASHBOARD_INTEGRATION.md
```

---

### 📚 VISIÓN GENERAL
**Archivo**: `README_HORARIOS.md`
- Visión general del proyecto
- Estructura de archivos
- Mapa de características
- Arquitectura
- Próximos pasos

**Tiempo**: 10 minutos  
**Cuándo**: Quieres ver todo junto

```bash
# Leer para contexto general
cat .zencoder/README_HORARIOS.md
```

---

### 💡 REFERENCIA RÁPIDA
**Archivo**: `HORARIOS_CHEATSHEET.md`
- Las 6 mejoras en 1 página
- Código rápido copiar-pegar
- Estilos CSS
- Testing rápido
- Variables clave

**Tiempo**: 5 minutos  
**Cuándo**: Necesitas referencia rápida

```bash
# Referencia rápida
cat .zencoder/HORARIOS_CHEATSHEET.md
```

---

### 📍 ESTE DOCUMENTO
**Archivo**: `ARCHIVO_TRACKING.md`
- Exactamente dónde está cada cosa
- Qué contiene cada archivo
- Cómo copiarlo
- Tamaño y dependencias

**Tiempo**: 10 minutos  
**Cuándo**: Te pierdes encontrando archivos

```bash
# Este archivo
cat .zencoder/ARCHIVO_TRACKING.md
```

---

## 🎯 FLUJO DE LECTURA RECOMENDADO

```
TODOS:
1. Este archivo (para orientación)
2. INDEX.md (para navegar)
3. QUICK_START_HORARIOS.md (para empezar)

LUEGO ELIGE UNO:

Si tienes prisa:
→ Copia archivos
→ Verifica que funciona
→ Listo

Si quieres entender:
→ Lee HORARIOS_FEATURES_SUMMARY.md
→ Experimenta con cada feature
→ Personaliza si necesitas

Si eres técnico:
→ Lee HORARIOS_IMPLEMENTATION_GUIDE.md
→ Modifica código
→ Extiende funcionalidades

Si integras al dashboard:
→ Lee PROFESOR_DASHBOARD_INTEGRATION.md
→ Agrega ProfesorHorariosPanel
→ Prueba en producción
```

---

## 📋 CHECKLIST DE COPIAR

### Fase 1: Copiar Componentes
```bash
[ ] cp HorariosCalendar.jsx → components/admin/
[ ] cp HorariosManagementV2.jsx → components/admin/
[ ] cp ProfesorHorariosPanel.jsx → components/dashboard/
```

### Fase 2: Copiar Utilidades
```bash
[ ] cp conflictDetection.js → utils/
```

### Fase 3: Actualizar Servicios
```bash
[ ] Actualizar horarios.service.js con nuevos métodos
```

### Fase 4: Actualizar Imports
```bash
[ ] Cambiar import en rutas: HorariosManagement → HorariosManagementV2
```

### Fase 5: Integración (Opcional)
```bash
[ ] Agregar ProfesorHorariosPanel a ProfesorDashboard.jsx
```

---

## 🧐 VERIFICACIÓN

### Verificar que todo está en lugar

```bash
# Verifica archivos nuevos existen
ls frontend/src/components/admin/HorariosCalendar.jsx
ls frontend/src/components/admin/HorariosManagementV2.jsx
ls frontend/src/components/dashboard/ProfesorHorariosPanel.jsx
ls frontend/src/utils/conflictDetection.js

# Verifica servicio actualizado
grep "getHorariosByProfesor\|duplicarHorarios" \
  frontend/src/services/horarios.service.js
```

### Verificar que no hay errores

```bash
# Inicia servidor
npm run dev

# Abre DevTools (F12)
# No debe haber errors en console
```

---

## 🔍 BÚSQUEDA RÁPIDA

### Necesito encontrar...

**"Función de detectar conflictos"**
→ `frontend/src/utils/conflictDetection.js`
→ Función: `obtenerTodosLosConflictos()`

**"Vista de calendario"**
→ `frontend/src/components/admin/HorariosCalendar.jsx`
→ Componente principal

**"Manager mejorado"**
→ `frontend/src/components/admin/HorariosManagementV2.jsx`
→ Todo las 6 features aquí

**"Panel para profesor"**
→ `frontend/src/components/dashboard/ProfesorHorariosPanel.jsx`
→ Feature 6

**"Métodos nuevos del servicio"**
→ `frontend/src/services/horarios.service.js`
→ `getHorariosByProfesor()`, `duplicarHorarios()`

**"Cómo integrar panel al dashboard"**
→ `.zencoder/PROFESOR_DASHBOARD_INTEGRATION.md`

**"Cómo empezar rápido"**
→ `.zencoder/QUICK_START_HORARIOS.md`

**"Referencia rápida"**
→ `.zencoder/HORARIOS_CHEATSHEET.md`

---

## 📊 RESUMEN DE ARCHIVOS

| Tipo | Archivo | Ubicación | Tamaño | Líneas |
|------|---------|-----------|--------|--------|
| Componente | HorariosCalendar.jsx | components/admin/ | ~15KB | 400 |
| Componente | HorariosManagementV2.jsx | components/admin/ | ~45KB | 1100 |
| Componente | ProfesorHorariosPanel.jsx | components/dashboard/ | ~14KB | 350 |
| Utilidad | conflictDetection.js | utils/ | ~8KB | 200 |
| Servicio | horarios.service.js | services/ | ~7KB | 150 |
| Docs | INDEX.md | .zencoder/ | ~5KB | - |
| Docs | QUICK_START_HORARIOS.md | .zencoder/ | ~8KB | - |
| Docs | HORARIOS_FEATURES_SUMMARY.md | .zencoder/ | ~25KB | - |
| Docs | HORARIOS_IMPLEMENTATION_GUIDE.md | .zencoder/ | ~22KB | - |
| Docs | PROFESOR_DASHBOARD_INTEGRATION.md | .zencoder/ | ~15KB | - |
| Docs | README_HORARIOS.md | .zencoder/ | ~18KB | - |
| Docs | HORARIOS_CHEATSHEET.md | .zencoder/ | ~12KB | - |
| Docs | ARCHIVO_TRACKING.md | .zencoder/ | ~12KB | - |

---

## 🚀 PRÓXIMO PASO

1. **Lee**: `.zencoder/INDEX.md`
2. **Elige tu ruta**: Quick Start, Features, o Implementation
3. **Sigue los pasos**: Copia archivos, actualiza imports
4. **Verifica**: Abre navegador, prueba features
5. **¡Disfruta!**: Sistema mejorado funcionando

---

## 🎓 REFERENCIA RÁPIDA POR ARCHIVO

### HorariosCalendar.jsx
```jsx
<HorariosCalendar
  horarios={horarios}
  profesores={profesores}
  grados={grados}
  secciones={secciones}
  materias={materias}
/>
```

### ProfesorHorariosPanel.jsx
```jsx
<ProfesorHorariosPanel 
  profesorId={profesor.id} 
  annoEscolarId={annoEscolar.id}
/>
```

### conflictDetection.js
```javascript
import { 
  obtenerTodosLosConflictos,
  obtenerDisponibilidadProfesor 
} from '../../utils/conflictDetection';
```

### horariosService
```javascript
horariosService.getHorariosByProfesor(id)
horariosService.duplicarHorarios(...)
```

---

## ✅ FINAL CHECKLIST

- [ ] Encontré todos los archivos nuevos
- [ ] Sé exactamente dónde va cada uno
- [ ] Entiendo qué contiene cada archivo
- [ ] Leí INDEX.md para navegar
- [ ] Elegí mi ruta de aprendizaje
- [ ] ¡Listo para empezar!

---

**Resumen**:
- 4 archivos nuevos para copiar
- 1 archivo para actualizar
- 8 documentos de referencia
- 20 minutos de setup
- ✅ Listo para producción

**Siguiente**: Abre `.zencoder/INDEX.md` →

---

**Versión**: 1.0  
**Última actualización**: 2025  
**Estado**: ✅ Completo