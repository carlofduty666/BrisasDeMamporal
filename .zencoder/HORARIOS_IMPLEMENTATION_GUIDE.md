# 📚 Guía de Implementación: Sistema de Horarios Mejorado

## ✅ 6 Mejoras Implementadas

### 1. **Vista de Calendario** 📅
**Archivo**: `frontend/src/components/admin/HorariosCalendar.jsx`

- Visualización en formato grid de horas x días
- Muestra todas las clases con código de colores
- Tooltip con detalles al pasar el ratón
- Responde a filtros de grado y sección
- Perfecta para ver conflictos rápidamente

**Características**:
- ✓ Vista de semana con horas (7:00 - 17:00)
- ✓ Código de colores por clase
- ✓ Información completa en tooltip
- ✓ Responsive design
- ✓ Leyenda de ayuda

---

### 2. **Filtro de Disponibilidad del Profesor** 👨‍🏫
**Archivo**: `frontend/src/utils/conflictDetection.js`
**Método**: `obtenerDisponibilidadProfesor()`

- Calcula franjas horarias libres del profesor
- Se actualiza dinámicamente en el formulario
- Permite clickear una franja para auto-rellenar horas
- Muestra en el modal de creación/edición

**Características**:
- ✓ Calcula franjas libres automáticamente
- ✓ Respeta el horario escolar (07:00 - 17:00)
- ✓ Clickeable para auto-asignación
- ✓ Se actualiza al cambiar profesor o día

---

### 3. **Detección de Conflictos en Frontend** ⚠️
**Archivo**: `frontend/src/utils/conflictDetection.js`

Detecta 3 tipos de conflictos en tiempo real:

**a) Conflictos de Profesor**
```javascript
detectarConflictosProfesor(nuevoHorario, horariosExistentes)
```
- El mismo profesor no puede tener dos clases simultáneas

**b) Conflictos de Grado/Sección**
```javascript
detectarConflictosGradoSeccion(nuevoHorario, horariosExistentes)
```
- Un grado/sección no puede tener dos clases al mismo tiempo

**c) Conflictos de Aula**
```javascript
detectarConflictosAula(nuevoHorario, horariosExistentes)
```
- Una aula no puede estar asignada a dos clases simultáneamente

**Características**:
- ✓ Validación en tiempo real
- ✓ Advertencia visual amarilla
- ✓ Mensaje explicativo del conflicto
- ✓ Botón "Guardar" deshabilitado si hay conflictos
- ✓ Se regenera automáticamente al cambiar horarios

---

### 4. **Gestión de Aulas** 🏫
**Archivo**: `frontend/src/components/admin/HorariosManagementV2.jsx`

- Campo de aula con sugerencias automáticas
- Filtro avanzado por aula
- Extrae y lista aulas únicas
- Detecta conflictos de aulas automáticamente

**Características**:
- ✓ Campo de entrada de aulas
- ✓ Filtro por aula en vista tabla
- ✓ Dropdown de aulas existentes
- ✓ Validación de conflictos de aulas
- ✓ Estadística de aulas en header

---

### 5. **Importar/Duplicar Horarios** 📋
**Archivo**: `frontend/src/components/admin/HorariosManagementV2.jsx`
**Servicio**: `frontend/src/services/horarios.service.js`

Modal de duplicación que:
- Selecciona grado/sección origen
- Selecciona grado/sección destino
- Copia todos los horarios exactamente

**Características**:
- ✓ Modal intuitivo con 4 selectores
- ✓ Botón "Duplicar" en header principal
- ✓ Reutiliza profesores, materias y horas
- ✓ Feedback en tiempo real
- ✓ Ahorra tiempo en configuración repetitiva

**Uso**:
1. Click en "Duplicar" (header)
2. Selecciona grado/sección origen
3. Selecciona grado/sección destino
4. Haz click en "Duplicar"
5. ¡Listo! Los horarios se copian

---

### 6. **Panel para Profesor** 👨‍🎓
**Archivo**: `frontend/src/components/dashboard/ProfesorHorariosPanel.jsx`

Componente standalone para mostrar los horarios del profesor:

**Características**:
- ✓ Vista de semana (Lunes-Viernes)
- ✓ Selector de día en móvil
- ✓ Indicador "Hoy" en día actual
- ✓ Información expandible por clase
- ✓ Colores por materia
- ✓ Resumen de clases por día
- ✓ Diseño responsive
- ✓ Integración en ProfesorDashboard

**Uso en ProfesorDashboard**:
```jsx
import ProfesorHorariosPanel from '../dashboard/ProfesorHorariosPanel';

// En el componente:
<ProfesorHorariosPanel 
  profesorId={userData.personaID} 
  annoEscolarId={annoEscolar.id}
/>
```

---

## 🎨 Tema Visual: Rose/Pink

Todos los componentes utilizan la paleta de colores definida en AdminSidebar.jsx:

```javascript
{
  main: 'bg-gradient-to-br from-rose-800 to-rose-900',
  active: 'bg-rose-700/90 backdrop-blur-md',
  hover: 'hover:bg-rose-700/60 hover:backdrop-blur-md',
  text: 'text-rose-600',
  accent: 'rose',
  gradient: 'from-rose-700 to-rose-800'
}
```

### Colores Utilizados:
- **Primario**: rose-600/700/800
- **Secundario**: pink-600 (para variaciones)
- **Backgrounds**: rose-50, rose-100
- **Borders**: rose-200, rose-300
- **Texto**: rose-900, rose-700
- **Hover**: rose-700/60 with backdrop-blur

---

## 📦 Archivos Creados

### Nuevos Componentes:
1. `frontend/src/components/admin/HorariosCalendar.jsx` - Vista de calendario
2. `frontend/src/components/admin/HorariosManagementV2.jsx` - Manager mejorado
3. `frontend/src/components/dashboard/ProfesorHorariosPanel.jsx` - Panel para profesor

### Nuevas Utilidades:
1. `frontend/src/utils/conflictDetection.js` - Lógica de conflictos

### Archivos Modificados:
1. `frontend/src/services/horarios.service.js` - Nuevos métodos

---

## 🚀 Cómo Activar el Sistema Mejorado

### Opción 1: Reemplazar el componente existente (RECOMENDADO)

```bash
# Respalda el archivo original
cp frontend/src/components/admin/HorariosManagement.jsx \
   frontend/src/components/admin/HorariosManagement.jsx.backup

# Reemplaza con la versión mejorada
cp frontend/src/components/admin/HorariosManagementV2.jsx \
   frontend/src/components/admin/HorariosManagement.jsx
```

Luego actualiza cualquier importación en rutas si es necesario.

### Opción 2: Usar ambas versiones

Si quieres mantener la versión antigua, puedes tener ambas:
- `HorariosManagement.jsx` (original)
- `HorariosManagementV2.jsx` (nueva con todas las features)

---

## 🔌 Integración en ProfesorDashboard

En `frontend/src/components/dashboard/ProfesorDashboard.jsx`:

```jsx
// Añade el import
import ProfesorHorariosPanel from './ProfesorHorariosPanel';

// En el JSX, añade el componente (dentro del section principal):
<section className="mt-8">
  <ProfesorHorariosPanel 
    profesorId={profesor?.id} 
    annoEscolarId={annoEscolar?.id}
  />
</section>
```

---

## 📊 Flujo de Uso

### Crear un Horario:
1. Click en "Nuevo Horario"
2. Selecciona Grado → Sección (auto-carga secciones)
3. Selecciona Materia y Profesor
4. Selecciona Día
5. Ingresa Hora Inicio y Fin
6. **(Opcional)** Click en "Ver disponibilidad del profesor"
7. **(Opcional)** Click en una franja libre para auto-rellenar
8. Ingresa Aula (opcional)
9. Si hay conflictos → se muestra advertencia amarilla
10. Click en "Crear Horario"

### Duplicar Horarios:
1. Click en "Duplicar"
2. Selecciona Grado/Sección origen
3. Selecciona Grado/Sección destino
4. Click en "Duplicar"
5. Todos los horarios se copian

### Ver en Calendario:
1. Aplica filtros (Grado, Sección, etc.)
2. Click en "Vista Calendario"
3. Pasa el ratón sobre clases para ver detalles

---

## ⚙️ Backend - Cambios Necesarios (OPCIONAL)

Si quieres soporte backend para duplicación, añade esta ruta en `backend/routes/horarios.js`:

```javascript
// Duplicar horarios de un grado/sección a otro
router.post('/horarios/duplicar', async (req, res) => {
  try {
    const { sourceGradoId, sourceSeccionId, targetGradoId, targetSeccionId } = req.body;
    
    // Obtener horarios origen
    const horariosOrigen = await db.horarios.findAll({
      where: {
        grado_id: sourceGradoId,
        seccion_id: sourceSeccionId,
        activo: true
      }
    });

    // Crear nuevos horarios
    const nuevoHorarios = horariosOrigen.map(h => ({
      grado_id: targetGradoId,
      seccion_id: targetSeccionId,
      materia_id: h.materia_id,
      profesor_id: h.profesor_id,
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      aula: h.aula,
      anno_escolar_id: h.anno_escolar_id,
      activo: true
    }));

    await db.horarios.bulkCreate(nuevoHorarios);
    res.json({ success: true, message: 'Horarios duplicados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎯 Mejoras Futuras Recomendadas

### Prioridad ALTA:
- [ ] Soporte para horarios recurrentes (semanal, quincenal)
- [ ] Notificaciones de cambios de horario
- [ ] Exportación en lote (Excel)
- [ ] Control de descansos entre clases

### Prioridad MEDIA:
- [ ] Integración con calendario externo (Google Calendar)
- [ ] Reportes de ocupación de aulas
- [ ] QR para escaneado de asistencia
- [ ] Vista para estudiantes/padres

### Prioridad BAJA:
- [ ] Horarios especiales (laboratorios, talleres)
- [ ] Sincronización en tiempo real
- [ ] Importación desde Excel
- [ ] Historial de cambios

---

## 📝 Notas Técnicas

### Detección de Conflictos:
La lógica utiliza comparación de minutos convertidos:
```javascript
const inicio1Min = horas * 60 + minutos;
const fin1Min = horas * 60 + minutos;

// Dos tiempos se superponen si:
// inicio1 < fin2 && inicio2 < fin1
```

### Disponibilidad del Profesor:
Se calcula como diferencia entre franjas ocupadas:
1. Obtiene todos los horarios del profesor en ese día
2. Ordena por hora de inicio
3. Calcula espacios libres entre ellos
4. Respeta horario escolar (07:00 - 17:00)

### Rendimiento:
- ✓ Manejo eficiente de arrays (filter, map)
- ✓ Sin lazy loading innecesario
- ✓ Caché de cálculos
- ✓ Validación duplicada (frontend + backend)

---

## 🐛 Troubleshooting

### Conflictos no se detectan:
- Verifica que el profesor_id, dia_semana, hora_inicio y hora_fin estén completados
- Revisa la consola del navegador por errores

### Modal no se abre:
- Verifica que el estado `showModal` se está manejando correctamente
- Comprueba que el puerto del API responde

### Disponibilidad no se muestra:
- El profesor y día deben estar seleccionados
- Verifica que haya horarios en el sistema

### Duplicación falla:
- Verifica que origen y destino sean diferentes
- Confirma que existan horarios en el origen

---

## 📞 Soporte

Para reportar errores o sugerencias:
1. Revisa los logs del navegador (F12 → Console)
2. Verifica que el backend responde correctamente
3. Confirma que todos los campos requeridos están llenos

---

**Última actualización**: 2025
**Versión**: 2.0
**Estado**: ✅ Producción