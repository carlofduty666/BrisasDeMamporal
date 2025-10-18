# Componentes Modales de Secciones

## Descripción General

Este directorio contiene tres componentes modales reutilizables para gestionar secciones educativas:

### 1. **CrearSeccion.jsx**
Modal para crear una nueva sección dentro de un grado específico.

**Props:**
- `isOpen` (boolean): Controla la visibilidad del modal
- `onClose` (function): Callback para cerrar el modal
- `gradoId` (number): ID del grado donde se creará la sección
- `gradoNombre` (string): Nombre formateado del grado (para mostrar en el header)
- `nivelNombre` (string): Nombre formateado del nivel (para mostrar en el header)
- `onSectionCreated` (function): Callback que recibe la sección creada

**Características:**
- ✅ Validación de campo requerido
- ✅ Validación de capacidad (mínimo 1)
- ✅ Estado activo/inactivo
- ✅ Animaciones suaves (fade-in, slide-up)
- ✅ Tema morado/púrpura
- ✅ Feedback con toast

---

### 2. **EditarSeccion.jsx**
Modal para editar una sección existente.

**Props:**
- `isOpen` (boolean): Controla la visibilidad del modal
- `onClose` (function): Callback para cerrar el modal
- `seccion` (object): Objeto sección con datos actuales
- `onSectionUpdated` (function): Callback que recibe la sección actualizada

**Características:**
- ✅ Precarga de datos de la sección
- ✅ Validación de datos
- ✅ Animaciones suaves
- ✅ Tema azul
- ✅ Feedback con toast

---

### 3. **EliminarSeccion.jsx**
Modal para eliminar una sección con validación de estudiantes.

**Props:**
- `isOpen` (boolean): Controla la visibilidad del modal
- `onClose` (function): Callback para cerrar el modal
- `seccion` (object): Objeto sección a eliminar
- `onSectionDeleted` (function): Callback que recibe el ID eliminado

**Características:**
- ✅ Validación de estudiantes asignados
- ✅ Si hay estudiantes: botón deshabilitado + recomendación
- ✅ Si no hay estudiantes: permite eliminar
- ✅ Toast flotante posición absoluta (7 segundos)
- ✅ Toast se mueve con el scroll
- ✅ Animaciones suaves
- ✅ Tema rojo
- ✅ Estados visuales claros

---

## Animaciones Incluidas

Todos los componentes incluyen:
- **Fade-in**: Desvanecimiento suave del fondo
- **Slide-up**: Animación de entrada del modal desde abajo
- **Transiciones**: Hover effects y transiciones de color suaves

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Colores por Componente

- **CrearSeccion**: Púrpura/Morado (from-purple-600 to-purple-700)
- **EditarSeccion**: Azul (from-blue-600 to-blue-700)
- **EliminarSeccion**: Rojo (from-red-600 to-red-700)

---

## Uso en SeccionesList

```jsx
import { CrearSeccion, EditarSeccion, EliminarSeccion } from './modals';

// En el componente
const [modalCrear, setModalCrear] = useState({ isOpen: false, ... });
const [modalEditar, setModalEditar] = useState({ isOpen: false, ... });
const [modalEliminar, setModalEliminar] = useState({ isOpen: false, ... });

// Renderizar modales
<CrearSeccion
  isOpen={modalCrear.isOpen}
  onClose={handleCloseCrearModal}
  gradoId={modalCrear.gradoId}
  gradoNombre={modalCrear.gradoNombre}
  nivelNombre={modalCrear.nivelNombre}
  onSectionCreated={handleSectionCreated}
/>

<EditarSeccion
  isOpen={modalEditar.isOpen}
  onClose={handleCloseEditarModal}
  seccion={modalEditar.seccion}
  onSectionUpdated={handleSectionUpdated}
/>

<EliminarSeccion
  isOpen={modalEliminar.isOpen}
  onClose={handleCloseEliminarModal}
  seccion={modalEliminar.seccion}
  onSectionDeleted={handleSectionDeleted}
/>
```

---

## Validaciones

### CrearSeccion
- Nombre de sección requerido (máximo 2 caracteres)
- Capacidad mayor a 0
- Conversión automática a mayúsculas

### EditarSeccion
- Nombre de sección requerido
- Capacidad mayor a 0
- Precarga de datos actuales

### EliminarSeccion
- Verificación de estudiantes asignados
- Descarga de la cantidad de estudiantes en tiempo real
- Bloqueo del botón si hay estudiantes
- Recomendación de transferir estudiantes

---

## Endpoints API Utilizados

```
POST   /secciones                              # Crear sección
PUT    /secciones/:id                         # Editar sección
DELETE /secciones/:id                         # Eliminar sección
GET    /secciones/:id/estudiantes             # Obtener estudiantes de sección
```

---

## Feedback al Usuario

### Toasts (React Toastify)
- Confirmación de acciones completadas
- Mensajes de error descriptivos
- Duración automática (3-7 segundos según el tipo)

### Toast Personalizado (EliminarSeccion)
- Posición: Esquina inferior derecha (fixed)
- Z-index: 50 (encima de otros elementos)
- Duración: 7 segundos
- Se mueve con el scroll (position fixed)
- Animación suave de entrada

---

## Mejoras Futuras

1. **Confirmación de acciones**: Añadir segunda confirmación en acciones críticas
2. **Bulk operations**: Seleccionar múltiples secciones para operaciones en lote
3. **Undo**: Recuperar secciones eliminadas (si el backend lo soporta)
4. **Exportar**: Exportar datos de la sección antes de eliminar
5. **Historial**: Log de cambios en secciones
6. **Permisos granulares**: Restringir acciones según roles

---

## Notas Técnicas

- Los modales usan `position: fixed` para evitar conflictos con scrolling
- Las animaciones se definen inline con `<style>` tags para mejor portabilidad
- El spinner de carga usa Tailwind CSS con animación `animate-spin`
- Los estados se manejan a nivel del componente padre (SeccionesList)
- Los callbacks permiten actualizar el estado del padre automáticamente