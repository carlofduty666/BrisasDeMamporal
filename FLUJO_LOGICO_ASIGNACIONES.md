# Nuevo Flujo Lógico de Asignaciones - Documentación

## Resumen de Cambios

Se ha reorganizado completamente el flujo lógico de asignación de materias, profesores y grados para ser más claro, intuitivo y sin redundancias.

### 1. Backend - Cambios Realizados

#### `backend/controllers/materias.controller.js`
- ✅ **Simplificado `asignarMateriaAGrado`**: Solo asigna la materia al grado
  - Cuando una materia se asigna a un grado, automáticamente está disponible para TODAS las secciones de ese grado
  - NO hay necesidad de asignar secciones individuales

- ✅ **Refactorizado `asignarProfesorAMateria`**: NEW - Solo asigna profesor a materia (sin grado)
  - Parámetros: `profesorID`, `materiaID`, `annoEscolarID`
  - Endpoint: `POST /materias/asignar-profesor-materia`
  - Validación: El profesor no puede tener esta materia ya asignada

- ✅ **Creado `asignarProfesorAGrado`**: NEW - Asigna profesor a grado (con validaciones)
  - Parámetros: `profesorID`, `gradoID`, `materiaID`, `annoEscolarID`
  - Endpoint: `POST /materias/asignar-profesor-grado`
  - Validaciones:
    - La materia debe estar asignada al grado
    - El profesor debe tener la materia asignada
    - El profesor no puede estar ya asignado al grado con esa materia

- ✅ **Eliminado `asignarMateriaASeccion`**: NO es necesario - Las secciones heredan las materias del grado

#### `backend/routes/materias.routes.js`
- ✅ Actualizado endpoints:
  - `POST /materias/asignar-a-grado` → Asigna materia a grado
  - `POST /materias/asignar-profesor-materia` → NEW - Asigna profesor a materia
  - `POST /materias/asignar-profesor-grado` → NEW - Asigna profesor a grado
  - Removido: `POST /materias/asignar-a-seccion`

### 2. Frontend - Cambios Realizados

#### `AsignarMateriaGradoSeccion.jsx` (SIMPLIFICADO)
- ✅ **Componente renombrado lógicamente**: Ahora solo asigna materias a grados
- ✅ **Props simplificadas**: 
  - Removidas: `secciones`, `onSubmitSeccion`, `seccionesYaAsignadas`
  - Añadidas: `onSubmit` (unificado)
- ✅ **Interfaz simplificada**:
  - Removida sección de selección de secciones
  - Removida sección de secciones asignadas
  - Título actualizado a "Asignar Materia a Grado"
  - Solo se permite seleccionar grados para asignación

#### `AsignarProfesorMateria.jsx` (NUEVO)
- ✅ **Nuevo componente específico**: Solo asigna profesor a materia
- ✅ **Características**:
  - Permite seleccionar múltiples profesores
  - Muestra profesores ya asignados
  - Sin selección de grados
  - Interfaz clara y simple
- ✅ **Props**:
  - `isOpen`, `onClose`, `materia`, `profesores`, `annoEscolar`
  - `loading`, `onSubmit`, `profesoresYaAsignados`

#### `AsignarProfesorGrado.jsx` (NUEVO)
- ✅ **Nuevo componente para asignación a grado**: Asigna profesor a grado
- ✅ **Características**:
  - Selección de profesores y grados
  - Permite múltiples combinaciones (N × M)
  - Muestra contador de asignaciones: "Asignar (2 × 3)" = 6 asignaciones
  - Agrupa grados por nivel
- ✅ **Validación visualizada**:
  - Mensaje informativo: "El profesor debe tener esta materia asignada"
  - Los profesores mostrados son los disponibles
  - Los grados mostrados son todos disponibles

---

## Nuevo Flujo de Uso

### Paso 1: Asignar Materia a Grado ✅
```
Usuario: Selecciona materia → Elige 1+ grados → Confirma
Backend: Crea registros Grado_Materia
Resultado: Materia disponible en TODAS las secciones del grado automáticamente
```

**Componente**: `AsignarMateriaGradoSeccion.jsx`
**Endpoint**: `POST /materias/asignar-a-grado`
**Payload**: `{ gradoID, materiaID, annoEscolarID }`

---

### Paso 2: Asignar Profesor a Materia ✅
```
Usuario: Selecciona materia → Elige 1+ profesores → Confirma
Backend: Crea registros Profesor_Materia_Grados con gradoID=null
Resultado: Profesor tiene derecho a enseñar esa materia (aún sin grado específico)
```

**Componente**: `AsignarProfesorMateria.jsx` (NUEVO)
**Endpoint**: `POST /materias/asignar-profesor-materia`
**Payload**: `{ profesorID, materiaID, annoEscolarID }`

---

### Paso 3: Asignar Profesor a Grado ✅ (Con validaciones)
```
Usuario: Selecciona profesores (1+) y grados (1+) → Confirma
Backend: 
  - Valida que materia esté asignada al grado
  - Valida que profesor tenga materia asignada
  - Crea registros Profesor_Materia_Grados con gradoID + materiaID
Resultado: Profesor enseña esa materia en ese grado
```

**Componente**: `AsignarProfesorGrado.jsx` (NUEVO)
**Endpoint**: `POST /materias/asignar-profesor-grado`
**Payload**: `{ profesorID, gradoID, materiaID, annoEscolarID }`

---

## Tabla Profesor_Materia_Grados

La tabla se utiliza de la siguiente manera:

```
| profesorID | materiaID | gradoID | seccionID | annoEscolarID | Significado |
|------------|-----------|---------|-----------|---------------|------------|
| 5          | 1         | NULL    | NULL      | 3             | Prof 5 puede enseñar Mat 1 (Paso 2) |
| 5          | 1         | 2       | NULL      | 3             | Prof 5 enseña Mat 1 en Grado 2 (Paso 3) |
```

---

## Cambios Necesarios Aún en Frontend

### 1. Actualizar `MateriasList.jsx` o donde se usan estos componentes

```jsx
// Cambiar de:
const handleAsignGrado = async (form) => {
  await axios.post(`/materias/asignar-a-grado`, {
    materiaID: selectedMateria.id,
    gradoID: form.gradoID,
    annoEscolarID: form.annoEscolarID || annoEscolar.id
  })
}

// A:
const handleAsignGrado = async (data) => {
  await axios.post(`/materias/asignar-a-grado`, {
    materiaID: selectedMateria.id,
    gradoID: data.gradoID,
    annoEscolarID: data.annoEscolarID || annoEscolar.id
  })
}
```

### 2. Usar los nuevos componentes

```jsx
import AsignarMateriaGradoSeccion from './modals/AsignarMateriaGradoSeccion';
import AsignarProfesorMateria from './modals/AsignarProfesorMateria';     // NUEVO
import AsignarProfesorGrado from './modals/AsignarProfesorGrado';         // NUEVO

// Componente original se usa para grados
<AsignarMateriaGradoSeccion 
  isOpen={showAsignarGrados}
  onClose={() => setShowAsignarGrados(false)}
  materia={selectedMateria}
  grados={grados}
  annoEscolar={annoEscolar}
  loading={loading}
  onSubmit={handleAsignGrado}  // <- Unificado
  gradosYaAsignados={gradosAsignados}
/>

// Nuevo para asignar profesor a materia
<AsignarProfesorMateria 
  isOpen={showAsignarProfesor}
  onClose={() => setShowAsignarProfesor(false)}
  materia={selectedMateria}
  profesores={profesores}
  annoEscolar={annoEscolar}
  loading={loading}
  onSubmit={handleAsignProfesor}
  profesoresYaAsignados={profesoresAsignados}
/>

// Nuevo para asignar profesor a grado
<AsignarProfesorGrado 
  isOpen={showAsignarProfesorGrado}
  onClose={() => setShowAsignarProfesorGrado(false)}
  materia={selectedMateria}
  grados={grados}
  profesores={profesores}
  annoEscolar={annoEscolar}
  loading={loading}
  onSubmit={handleAsignProfesorGrado}
  profesoresYaAsignados={profesoresYaAsignados}
/>
```

### 3. Manejadores actualizados

```jsx
// Para asignar materia a grado
const handleAsignGrado = async (data) => {
  try {
    setLoading(true);
    await axios.post(
      `${API_URL}/materias/asignar-a-grado`,
      {
        materiaID: selectedMateria.id,
        gradoID: data.gradoID,
        annoEscolarID: data.annoEscolarID || annoEscolar.id
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setSuccessMessage('Materia asignada al grado correctamente');
    await refrescarDatos();
  } catch (err) {
    setError(err.response?.data?.message || 'Error al asignar');
  } finally {
    setLoading(false);
  }
};

// Para asignar profesor a materia
const handleAsignProfesor = async (data) => {
  try {
    setLoading(true);
    await axios.post(
      `${API_URL}/materias/asignar-profesor-materia`,
      {
        profesorID: data.profesorID,
        materiaID: selectedMateria.id,
        annoEscolarID: data.annoEscolarID || annoEscolar.id
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setSuccessMessage('Profesor asignado a la materia correctamente');
    await refrescarDatos();
  } catch (err) {
    setError(err.response?.data?.message || 'Error al asignar');
  } finally {
    setLoading(false);
  }
};

// Para asignar profesor a grado
const handleAsignProfesorGrado = async (data) => {
  try {
    setLoading(true);
    await axios.post(
      `${API_URL}/materias/asignar-profesor-grado`,
      {
        profesorID: data.profesorID,
        gradoID: data.gradoID,
        materiaID: selectedMateria.id,
        annoEscolarID: data.annoEscolarID || annoEscolar.id
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setSuccessMessage('Profesor asignado al grado correctamente');
    await refrescarDatos();
  } catch (err) {
    setError(err.response?.data?.message || 'Error al asignar');
  } finally {
    setLoading(false);
  }
};
```

---

## Ventajas del Nuevo Flujo

✅ **Claridad**: Cada paso tiene un propósito específico
✅ **Sin redundancias**: No hay asignaciones innecesarias
✅ **Validaciones lógicas**: Imposible asignar profesor sin materia
✅ **Escalabilidad**: Fácil de mantener y extender
✅ **Múltiples asignaciones**: Todo permite N×M asignaciones simultáneamente
✅ **Interfaz intuitiva**: Los modales son simples y directos
✅ **Mantenimiento**: Código separado por responsabilidad

---

## Testing Recomendado

1. **Asignar Materia a Grado**:
   - Seleccionar 1 materia y 2 grados → Verificar que aparecen en grados asignados
   - Verificar que la materia esté disponible en TODAS las secciones del grado

2. **Asignar Profesor a Materia**:
   - Seleccionar 1 materia y 3 profesores → Confirmar asignaciones
   - Intentar asignar profesor que ya tiene materia → Debe mostrar error

3. **Asignar Profesor a Grado**:
   - Intentar sin asignar materia al grado primero → Debe fallar
   - Intentar sin asignar profesor a materia primero → Debe fallar
   - Asignar correctamente 2 profesores × 3 grados → 6 asignaciones totales

---

## Notas Importantes

⚠️ **IMPORTANTE**: El backend ya está listo. Los cambios del frontend están en el documento "Cambios Necesarios Aún en Frontend"

⚠️ **Errores 500 anteriores**: Se debían a la lógica confusa de asignar materia a sección. Esto ya está resuelto en el backend.

⚠️ **Base de datos**: No se necesitan cambios en las tablas. Solo se usan mejor los campos existentes.

---

## Archivos Modificados

### Backend ✅
- `backend/controllers/materias.controller.js` - Métodos reorganizados
- `backend/routes/materias.routes.js` - Endpoints actualizados

### Frontend ✅
- `frontend/src/components/admin/academico/modals/AsignarMateriaGradoSeccion.jsx` - SIMPLIFICADO
- `frontend/src/components/admin/academico/modals/AsignarProfesorMateria.jsx` - CREADO
- `frontend/src/components/admin/academico/modals/AsignarProfesorGrado.jsx` - CREADO

### Próximo
- `frontend/src/components/admin/academico/MateriasList.jsx` - O donde se usen estos componentes

---