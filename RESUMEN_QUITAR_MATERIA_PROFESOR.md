# 📋 Resumen: Nueva Funcionalidad - Quitar Materia de Profesor

## 🎯 Objetivo
Extender el modal de "Quitar Asignaciones" para permitir que los usuarios elijan entre:
1. **Quitar materia de un Grado** (funcionalidad existente)
2. **Quitar materia de un Profesor** (NUEVA)

## 🔧 Cambios Realizados

### 1. **BACKEND - Controller (materias.controller.js)**

#### A. Mejorado: `eliminarProfesorDeMateria`
```javascript
// ANTES: Solo eliminaba sin validación
const deleted = await db.Profesor_Materia_Grados.destroy({...});

// DESPUÉS: Valida evaluaciones registradas
- Verifica que la asignación existe
- Cuenta evaluaciones del profesor en esa materia/grado
- Retorna error 409 si hay evaluaciones
- Solo elimina si no hay evaluaciones
```

**Validación de evaluaciones agregada:**
```javascript
const evaluacionesCount = await db.Evaluaciones.count({
  where: {
    profesorID: profesorID,
    materiaID: materiaID,
    gradoID: gradoID
  }
});

if (evaluacionesCount > 0) {
  return res.status(409).json({ 
    message: 'No se puede eliminar...',
    evaluacionesCount: evaluacionesCount
  });
}
```

#### B. Mejorado: `getProfesoresByMateria`
**Antes:** Retornaba solo datos básicos del profesor

**Después:** Retorna profesores con estructura detallada:
```javascript
{
  id: 1,
  nombre: "Juan",
  apellido: "García",
  email: "juan@mail.com",
  profesor_materia_grados: [
    { gradoID: 5, gradoNombre: "1ro A" },
    { gradoID: 6, gradoNombre: "1ro B" }
  ]
}
```

**Proceso:**
1. Obtiene todas las asignaciones profesor-materia-grado
2. Agrupa por profesor
3. Incluye lista de grados para cada profesor
4. Ordena por profesorID

---

### 2. **FRONTEND - Componente Modal (QuitarAsignacionMateriaGrado.jsx)**

#### A. Nueva Pantalla de Selección Tipo
**Cuando se abre el modal:**
- El usuario ve DOS opciones:
  - 🏫 **Quitar de un Grado** (naranja)
  - 👨‍🏫 **Quitar de un Profesor** (púrpura)
- Cada opción tiene icono, descripción y es clickeable

#### B. Estados Nuevos Agregados
```javascript
const [tipoAsignacion, setTipoAsignacion] = useState(null); // null | 'grado' | 'profesor'
const [selectedProfesores, setSelectedProfesores] = useState([]);
const [profesores, setProfesores] = useState([]);
const [cargandoProfesores, setCargandoProfesores] = useState(false);
```

#### C. Funcionalidades Nuevas

**1. Carga de Profesores:**
```javascript
useEffect(() => {
  if (tipoAsignacion === 'profesor' && materia?.id && annoEscolar?.id) {
    cargarProfesores();
  }
}, [tipoAsignacion]);

const cargarProfesores = async () => {
  const response = await axios.get(
    `/materias/${materia.id}/profesores?annoEscolarID=${annoEscolar.id}`
  );
  setProfesores(response.data || []);
};
```

**2. Callbacks para Profesores:**
```javascript
handleToggleProfesor()    // Seleccionar/deseleccionar un profesor
handleSelectAllProfesores() // Marcar/desmarcar todos
```

**3. Lógica de Eliminación Mejorada:**
```javascript
if (tipoAsignacion === 'grado') {
  // Elimina materia de grados (lógica existente mejorada)
} else {
  // Elimina materia de profesores
  // Para cada profesor, para cada grado donde enseña:
  // DELETE /materias/profesor/{profesorID}/{materiaID}/{gradoID}/{annoEscolarID}
}
```

**4. Manejo de Errores por Evaluaciones:**
- Si un profesor tiene evaluaciones en esa materia/grado:
  - Muestra error 409
  - Lista evaluaciones registradas
  - Sugiere revisar evaluaciones primero

#### D. UI/UX Mejoras

**Interfaz por tipo:**
- **Tipo Grado:** Diseño NARANJA, agrupa por nivel
- **Tipo Profesor:** Diseño PÚRPURA, muestra grados de cada profesor

**Botón Volver:**
- Nuevo botón en header para volver a pantalla de selección tipo
- Limpia selecciones automáticamente

**Transiciones:**
- Carga dinámico de profesores con spinner
- Mensajes contextuales (éxito, error, info)

---

## 🔄 Flujo de Uso

### Caso 1: Quitar Materia de Grado
```
1. Usuario abre modal
2. Selecciona "Quitar de un Grado"
3. Ve lista de grados (agrupados por nivel)
4. Selecciona grados
5. Hace click en "Quitar"
6. Valida evaluaciones
7. Elimina si es posible o muestra error
```

### Caso 2: Quitar Materia de Profesor
```
1. Usuario abre modal
2. Selecciona "Quitar de un Profesor"
3. Se cargan profesores asignados
4. Ve lista de profesores con grados
5. Selecciona profesores
6. Hace click en "Quitar"
7. Para cada profesor, por cada grado:
   - Valida evaluaciones
   - Elimina si es posible o acumula errores
8. Muestra resultado con detalles
```

---

## ✅ Validaciones Implementadas

### En Grado:
- ❌ No se puede eliminar si hay evaluaciones en ese grado
- Mensaje: "No se puede eliminar la materia del grado porque hay evaluaciones registradas"

### En Profesor:
- ❌ No se puede eliminar si hay evaluaciones en ese grado (profesor-materia-grado)
- Mensaje: "No se puede eliminar la materia del profesor porque hay evaluaciones registradas"
- Incluye: Nombre profesor, nombre grado, cantidad evaluaciones

---

## 🎨 Componentes UI

### Pantalla de Selección Tipo
```
┌─────────────────────────────────────┐
│ ⬅️ Quitar Asignación                │
│ Materia: [Matemática]               │
│ [X]                                 │
├─────────────────────────────────────┤
│ ¿Qué deseas quitar de esta materia? │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📚 Quitar de un Grado           │ │
│ │ Eliminar materia de grados...   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👨‍🏫 Quitar de un Profesor         │ │
│ │ Eliminar materia de profesores..│ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancelar]                          │
└─────────────────────────────────────┘
```

### Selección de Profesores
```
┌─────────────────────────────────────┐
│ ⬅️ Quitar de Profesor               │
│ 👨‍🏫 Materia: [Matemática]            │
│ [X]                                 │
├─────────────────────────────────────┤
│ ⚠️ Si hay evaluaciones registradas...│
│                                     │
│ Profesores a quitar *               │
│ [Marcar Todo]                       │
│                                     │
│ ☐ Juan García                       │
│   2 grado(s)                        │
│   Eliminar                          │
│                                     │
│ ☐ María Rodríguez                   │
│   1 grado(s)                        │
│   Eliminar                          │
│                                     │
├─────────────────────────────────────┤
│ [Volver] [Quitar (2)]               │
└─────────────────────────────────────┘
```

---

## 📊 Ejemplo de Error por Evaluaciones

```json
{
  "type": "error",
  "text": "⚠ 1 asignación(es) no se pudo(eron) eliminar",
  "details": [
    {
      "item": "Juan García - 1ro A",
      "reason": "No se puede eliminar la materia del profesor porque hay evaluaciones registradas",
      "evaluaciones": 3
    }
  ]
}
```

---

## 🔗 Endpoints Involucrados

### Backend

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| DELETE | `/materias/grado/{gradoID}/{materiaID}/{annoEscolarID}` | Eliminar materia de grado |
| DELETE | `/materias/profesor/{profesorID}/{materiaID}/{gradoID}/{annoEscolarID}` | Eliminar materia de profesor |
| GET | `/materias/{id}/profesores?annoEscolarID={id}` | Obtener profesores de materia |

---

## 🧪 Testing Recomendado

### Test 1: Quitar materia de grado sin evaluaciones
```
✓ Modal abre
✓ Selecciona "Quitar de Grado"
✓ Marca grado
✓ Elimina correctamente
✓ Recarga data
```

### Test 2: Quitar grado con evaluaciones
```
✓ Modal abre
✓ Selecciona grado con evaluaciones
✓ Intenta eliminar
✓ Recibe error 409
✓ Muestra mensaje descriptivo
```

### Test 3: Quitar materia de profesor sin evaluaciones
```
✓ Modal abre
✓ Selecciona "Quitar de Profesor"
✓ Carga profesores ✅
✓ Marca profesor
✓ Elimina correctamente
✓ Recarga data
```

### Test 4: Quitar profesor con evaluaciones
```
✓ Selecciona profesor con evaluaciones
✓ Intenta eliminar
✓ Recibe error 409
✓ Muestra detalles (profesor, grado, cantidad evaluaciones)
```

### Test 5: Volver desde selección de profesor
```
✓ Selecciona "Quitar de Profesor"
✓ Hace click en botón "Volver" o flecha
✓ Vuelve a pantalla de selección tipo
✓ Puede seleccionar otra opción
```

---

## 💾 Cambios de Archivos

### Backend
- `backend/controllers/materias.controller.js`
  - ✅ `eliminarProfesorDeMateria()` - Validación de evaluaciones
  - ✅ `getProfesoresByMateria()` - Retorna estructura detallada

### Frontend
- `frontend/src/components/admin/academico/modals/QuitarAsignacionMateriaGrado.jsx`
  - ✅ Estados nuevos para tipo y profesores
  - ✅ Pantalla de selección tipo
  - ✅ Lógica de carga de profesores
  - ✅ Lógica de eliminación para profesores
  - ✅ Manejo de errores mejorado
  - ✅ UI completamente refactorizada

---

## 🚀 Ventajas de la Nueva Funcionalidad

1. **Flexibilidad:** Usuarios pueden elegir qué quitar (grado o profesor)
2. **Seguridad:** Valida evaluaciones en ambos casos
3. **Claridad:** Mensajes de error descriptivos con detalles
4. **UX:** Interfaz intuitiva con pantallas claras
5. **Performance:** Carga bajo demanda de profesores
6. **Mantenibilidad:** Código modular y bien comentado

---

## 📝 Notas Técnicas

- Se usa `useCallback` y `useMemo` para optimizar renders
- Todos los hooks se declaran ANTES del early return
- Se validan evaluaciones del profesor en contexto específico (profesorID + materiaID + gradoID)
- La interfaz es responsive y accesible
- Se soporta seleccionar/deseleccionar múltiples profesores
- Los errores se acumulan y se muestran agrupados

---

**Fecha de Implementación:** 2024  
**Status:** ✅ Completado y Listo para Testing