# 📋 HORARIOS CHEATSHEET - Referencia Rápida

## 🎯 LAS 6 MEJORAS EN UNA PÁGINA

```
┌──────────────────────────────────────────────────────────────────┐
│                 SISTEMA DE HORARIOS MEJORADO v2.0                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1️⃣  CALENDARIO          3️⃣  CONFLICTOS        5️⃣  DUPLICAR    │
│  ├─ Grid horarios       ├─ Profesor             ├─ 1 click    │
│  ├─ Por día             ├─ Grado/Sección        ├─ Todos      │
│  └─ Visual              └─ Aula                 └─ Rápido     │
│                                                                  │
│  2️⃣  DISPONIBILIDAD      4️⃣  AULAS              6️⃣  PANEL     │
│  ├─ Franjas libres      ├─ Gestión              ├─ Profesor   │
│  ├─ Auto-rellenar       ├─ Filtro               ├─ Semana     │
│  └─ Por profesor        └─ Validación           └─ Móvil      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 ARCHIVOS QUE NECESITAS

### CREAR (3 nuevos componentes)
```
✨ frontend/src/components/admin/HorariosCalendar.jsx
✨ frontend/src/components/admin/HorariosManagementV2.jsx
✨ frontend/src/components/dashboard/ProfesorHorariosPanel.jsx
```

### CREAR (1 nueva utilidad)
```
✨ frontend/src/utils/conflictDetection.js
```

### ACTUALIZAR (1 archivo)
```
📝 frontend/src/services/horarios.service.js
```

---

## ⚡ QUICK INSTALL

### Opción 1: Reemplazar (Recomendado)
```bash
# Copiar componentes nuevos
cp HorariosCalendar.jsx → components/admin/
cp HorariosManagementV2.jsx → components/admin/
cp ProfesorHorariosPanel.jsx → components/dashboard/
cp conflictDetection.js → utils/

# En tus rutas, cambiar:
import HorariosManagement from './HorariosManagementV2';
# EN VEZ DE:
import HorariosManagement from './HorariosManagement';
```

### Opción 2: Agregar Panel al Dashboard
```jsx
// ProfesorDashboard.jsx
import ProfesorHorariosPanel from './ProfesorHorariosPanel';

// En el JSX:
<ProfesorHorariosPanel 
  profesorId={profesor.id} 
  annoEscolarId={annoEscolar.id}
/>
```

---

## 🎨 COLORES (Rose Theme)

```css
/* Primary */
bg-rose-600/700/800
text-rose-600/700/900

/* Light */
bg-rose-50/100
border-rose-200/300

/* Effects */
hover:bg-rose-700/60 backdrop-blur-md
```

---

## 📊 FUNCIONES PRINCIPALES

### 1. Detección de Conflictos
```javascript
import { obtenerTodosLosConflictos } from './utils/conflictDetection';

const conflictos = obtenerTodosLosConflictos(nuevoHorario, horariosExistentes);

// Retorna:
{
  profesor: [],        // Conflictos de profesor
  gradoSeccion: [],    // Conflictos de clase
  aula: []             // Conflictos de aula
}
```

### 2. Disponibilidad del Profesor
```javascript
import { obtenerDisponibilidadProfesor } from './utils/conflictDetection';

const disponible = obtenerDisponibilidadProfesor(
  profesorId,
  diaSemanaSemana,    // 'lunes', 'martes', etc
  horariosExistentes
);

// Retorna:
[
  { inicio: '07:00', fin: '09:00' },
  { inicio: '10:30', fin: '12:00' },
  { inicio: '14:00', fin: '17:00' }
]
```

### 3. Mensaje de Conflicto
```javascript
import { generarMensajeConflictos } from './utils/conflictDetection';

const mensaje = generarMensajeConflictos(
  conflictos,
  profesores,
  grados,
  secciones
);

// Retorna:
"El profesor Juan García ya tiene una clase en este horario."
```

---

## 🧪 TESTING RÁPIDO

### Feature 1: Calendario
```
1. Gestión > Horarios
2. Click "Vista Calendario"
3. ✅ Debería mostrar grid con horarios
```

### Feature 2: Disponibilidad
```
1. Nuevo Horario
2. Selecciona Profesor y Día
3. Click "Ver disponibilidad"
4. ✅ Debería mostrar franjas libres
```

### Feature 3: Conflictos
```
1. Nuevo Horario - Llena datos conflictivos
2. ✅ Advertencia amarilla aparece
3. ✅ Botón "Guardar" deshabilitado
```

### Feature 4: Aulas
```
1. Nuevo Horario - Ingresa Aula
2. Crea otro horario con misma aula
3. ✅ Detecta conflicto de aula
```

### Feature 5: Duplicar
```
1. Gestión > Horarios
2. Click "Duplicar"
3. Selecciona origen y destino
4. ✅ Se copian todos los horarios
```

### Feature 6: Panel Profesor
```
1. Dashboard Profesor
2. ✅ Debería mostrar "Mis Horarios"
3. Click en día - ✅ muestra clases
```

---

## 💻 INTEGRACIÓN RÁPIDA

### Paso 1: Imports
```jsx
// Componentes
import HorariosCalendar from './HorariosCalendar';
import ProfesorHorariosPanel from './ProfesorHorariosPanel';

// Utilidades
import { obtenerTodosLosConflictos } from '../../utils/conflictDetection';

// Servicios (ya actualizado)
import { horariosService } from '../../services/horarios.service';
```

### Paso 2: Usar Calendario
```jsx
<HorariosCalendar
  horarios={filteredHorarios}
  profesores={profesores}
  grados={grados}
  secciones={secciones}
  materias={materias}
  selectedGrado={parseInt(filtroGrado)}
  selectedSeccion={parseInt(filtroSeccion)}
/>
```

### Paso 3: Usar Panel Profesor
```jsx
<ProfesorHorariosPanel 
  profesorId={profesor.id} 
  annoEscolarId={annoEscolar.id}
/>
```

---

## 🐛 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "Component not found" | Import incorrecto | Verifica ruta exacta |
| No se ve el cambio | Caché | Ctrl+Shift+Delete + Ctrl+F5 |
| Conflictos no aparecen | Campos vacíos | Llena profesor, día, horas |
| Estilos raros | Tailwind no cargado | Reinicia servidor |
| Panel no aparece | Falta import | Añade import en Dashboard |

---

## 📈 ANTES vs DESPUÉS

```
ANTES (❌)          │  DESPUÉS (✅)
────────────────────┼──────────────────────
Sin vista visual    │  + Calendario grid
Solo tabla          │  + Tabla mejorada
Sin validación      │  + Validación real-time
Conflictos ocultos  │  + Alertas en tiempo real
No duplicar         │  + Duplicación 1-click
Sin disponibilidad  │  + Ver franjas libres
Sin panel profesor  │  + Panel bonito
Diseño básico       │  + Diseño moderno
```

---

## 🔧 VARIABLES CLAVE

```javascript
// Estado principal
horarios: []              // Array de horarios del sistema
filteredHorarios: []      // Horarios con filtros aplicados
conflictosDetectados: {}  // Conflictos detectados

// Datos del formulario
formData: {
  grado_id: '',
  seccion_id: '',
  materia_id: '',
  profesor_id: '',
  dia_semana: '',
  hora_inicio: '',
  hora_fin: '',
  aula: '',
  activo: true
}

// Estados del UI
showModal: false           // Modal abierto/cerrado
viewMode: 'tabla'         // 'tabla' o 'calendario'
showDuplicarModal: false  // Modal duplicación
mostrarAdvertencia: false // Mostrar conflictos
```

---

## 🎯 FLUJO DE USUARIO

### Crear Horario
```
1. Click "Nuevo Horario"
2. Selecciona Grado (carga Secciones)
3. Selecciona Sección
4. Selecciona Materia
5. Selecciona Profesor
6. Selecciona Día
7. Ingresa Hora Inicio y Fin
   ↓ (Sistema valida automáticamente)
   ↓ Si hay conflictos → ⚠️ Alerta
8. (Opcional) Ver disponibilidad
9. (Opcional) Ingresa Aula
10. Click "Crear Horario"
```

### Ver en Calendario
```
1. Aplica filtros (opcional)
2. Click "Vista Calendario"
3. Ve grid con todos los horarios
4. Pasa mouse para ver detalles
```

### Duplicar
```
1. Click "Duplicar"
2. Selecciona Grado/Sección origen
3. Selecciona Grado/Sección destino
4. Click "Duplicar"
5. ¡Listo!
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
Mobile: < 640px
├─ Panel profesor: Selector de días
├─ Tabla: Scroll horizontal
└─ Modales: Pantalla completa

Tablet: 640px - 1024px
├─ Grid 2 columnas
├─ Filtros 2 filas
└─ Componentes escalados

Desktop: > 1024px
├─ Grid full
├─ Componentes lado a lado
└─ Layouts complejos
```

---

## 🎨 COMPONENTES CSS

### Header Hero
```jsx
className="bg-gradient-to-r from-rose-700 to-rose-800 rounded-2xl shadow-2xl p-8"
```

### Stat Card
```jsx
className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
```

### Botón Principal
```jsx
className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
```

### Input
```jsx
className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
```

### Modal
```jsx
className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
```

---

## 🔄 CICLO DE VIDA

```
1. Component Mount
   ├─ fetchAllData()
   │  ├─ getHorarios()
   │  ├─ getGrados()
   │  ├─ getMaterias()
   │  └─ getProfesores()
   └─ setLoading(false)

2. User Input (Formulario)
   ├─ onChange → setFormData()
   ├─ detectarConflictos()
   ├─ obtenerDisponibilidad()
   └─ setMostrarAdvertencia()

3. Submit
   ├─ Validación
   ├─ POST/PUT a API
   ├─ fetchAllData() (refresh)
   └─ resetForm()

4. User Actions
   ├─ Click Duplicar
   ├─ Click Calendario
   ├─ Click Filtros
   └─ Sistema reactúa
```

---

## 📚 MÉTODOS DISPONIBLES

### Service - horariosService
```javascript
horariosService.getHorarios()                    // Todos
horariosService.getHorarioById(id)              // Por ID
horariosService.createHorario(data)             // Crear
horariosService.updateHorario(id, data)         // Editar
horariosService.deleteHorario(id)               // Eliminar
horariosService.getHorariosByProfesor(id)       // Por profesor
horariosService.duplicarHorarios(...)           // Duplicar
horariosService.generarHorarioPDF(...)          // PDF
```

### Utils - conflictDetection
```javascript
obtenerTodosLosConflictos(nuevo, existentes)    // Todos
detectarConflictosProfesor(nuevo, existentes)   // Profesor
detectarConflictosGradoSeccion(...)             // Clase
detectarConflictosAula(nuevo, existentes)       // Aula
obtenerDisponibilidadProfesor(id, dia, ...)     // Franjas libres
generarMensajeConflictos(...)                   // Mensaje
tiemposSuperpuestos(...)                        // Utility
```

---

## 🎯 CASO DE USO REAL

### Escenario
Eres admin. Tienes 3ro A hecho. Necesitas 3ro B igual.

### Sin Sistema
```
1. Abre cada horario de 3ro A (~20 clases)
2. Copia manualmente datos
3. Crea en 3ro B (~20 veces)
4. Valida cada uno (~20 clicks)
5. ⏱️ ~30 minutos
6. ❌ Riesgo: Errores manuales
```

### Con Sistema
```
1. Click "Duplicar"
2. Selecciona 3ro A
3. Selecciona 3ro B
4. Click "Duplicar"
5. ⏱️ ~30 segundos
6. ✅ 0% riesgo de errores
```

---

## 🚀 PRÓXIMAS FEATURES

```
PHASE 2:
☐ Horarios recurrentes
☐ Notificaciones
☐ Exportar Excel
☐ Descansos entre clases

PHASE 3:
☐ Google Calendar sync
☐ Real-time sync
☐ QR asistencia
☐ Historial cambios
```

---

## 📞 HELP

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde pongo los archivos? | Ver carpeta exacta en README_HORARIOS.md |
| ¿Cómo integro en dashboard? | Ver PROFESOR_DASHBOARD_INTEGRATION.md |
| ¿Qué hace cada feature? | Ver HORARIOS_FEATURES_SUMMARY.md |
| ¿Cómo empiezo rápido? | Ver QUICK_START_HORARIOS.md |
| ¿Errores qué hacer? | Ver HORARIOS_IMPLEMENTATION_GUIDE.md |

---

## ✅ CHECKLIST FINAL

- [ ] Copié 3 componentes
- [ ] Copié 1 utilidad
- [ ] Actualicé servicio
- [ ] Cambié imports
- [ ] Sin errores en consola
- [ ] Probé calendario
- [ ] Probé disponibilidad
- [ ] Probé conflictos
- [ ] Probé duplicar
- [ ] Probé panel profesor
- [ ] Se ve bien en móvil
- [ ] Colores son rose
- [ ] ¡Listo para producción!

---

## 🎉 RESUMEN

```
✨ 6 Features     → Implementadas
🎨 Diseño Moderno → Rose Theme
📱 Responsive     → Desktop + Mobile
⚡ Rápido         → 5 min setup
📚 Documentado    → 4 guides
🔒 Validado       → Frontend + Backend
🚀 Producción     → Listo para ir
```

---

**Quick Links:**
1. 📖 QUICK_START_HORARIOS.md
2. 🎨 HORARIOS_FEATURES_SUMMARY.md
3. 🔧 HORARIOS_IMPLEMENTATION_GUIDE.md
4. 🎓 PROFESOR_DASHBOARD_INTEGRATION.md
5. 📚 README_HORARIOS.md

---

**Estado**: ✅ LISTO  
**Versión**: 2.0.0  
**Última actualización**: 2025

🚀 **¡A mejorar los horarios!** 🚀