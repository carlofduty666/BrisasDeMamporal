# ⚡ Quick Start - Hooks de Calificaciones con Histórico

## 🚀 5 Minutos para Empezar

### 1. Importar en tu componente
```jsx
import { useCalificacionesHistorico } from '@/hooks/useCalificacionesHistorico';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
```

### 2. Usar el hook
```jsx
function MiComponente() {
  const { user } = useContext(AuthContext);
  
  const { calificaciones, loading, error } = useCalificacionesHistorico(
    1,              // ID del estudiante
    1,              // ID del año escolar
    user?.token     // Token (desde AuthContext)
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {calificaciones.map(cal => (
        <div key={cal.id}>
          <p>{cal.materia.nombre}: {cal.calificacion}</p>
          {cal.esDeSeccionAnterior && (
            <p className="text-blue-500">
              📍 Sección anterior: {cal.seccionHistorico.nombre}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 Otros Hooks Disponibles

### `useCalificacionesPorMateria` - Agrupa por materia
```jsx
const { calificacionesPorMateria } = useCalificacionesPorMateria(...);

// calificacionesPorMateria = [
//   {
//     id: 1,
//     nombre: 'Matemática',
//     actuales: [...],    // De la sección actual
//     historicas: [...]   // De secciones anteriores
//   }
// ]
```

### `useCalificacionesEstadisticas` - Promedios y análisis
```jsx
const { estadisticas } = useCalificacionesEstadisticas(...);

// estadisticas = {
//   totalCalificaciones: 15,
//   promedioActual: 17.5,
//   promedioHistorico: 16.2,
//   calificacionMaxima: 20,
//   calificacionMinima: 10,
//   porMateria: { ... }
// }
```

### `useCalificacionesFiltradas` - Filtros personalizados
```jsx
const { calificacionesFiltradas } = useCalificacionesFiltradas(
  estudianteID,
  annoEscolarID,
  token,
  {
    historico: true,          // Solo históricas
    calificacionMin: 15,      // Notas >= 15
    materiaId: 3              // Materia específica
  }
);
```

### `useCalificacionesPorLapso` - Agrupa por período
```jsx
const { calificacionesPorLapso } = useCalificacionesPorLapso(...);

// calificacionesPorLapso = [
//   {
//     lapso: '1',
//     materias: [...]
//   },
//   {
//     lapso: '2',
//     materias: [...]
//   }
// ]
```

---

## 💡 Ejemplos Rápidos

### Mostrar solo calificaciones históricas
```jsx
const { calificaciones } = useCalificacionesHistorico(...);
const historicas = calificaciones.filter(c => c.esDeSeccionAnterior);
```

### Calcular promedio actual
```jsx
const { calificaciones } = useCalificacionesHistorico(...);
const actuales = calificaciones.filter(c => !c.esDeSeccionAnterior);
const promedio = actuales.length > 0
  ? actuales.reduce((s, c) => s + c.calificacion, 0) / actuales.length
  : 0;
```

### Ver info de sección anterior
```jsx
{cal.esDeSeccionAnterior && (
  <div>
    <p>Sección: {cal.seccionHistorico.nombre}</p>
    <p>Profesor: {cal.profesorAnterior.nombre}</p>
    <p>Fecha: {new Date(cal.fechaTransferencia).toLocaleDateString()}</p>
  </div>
)}
```

---

## 🎨 Styles Tailwind Recomendados

### Calificación actual
```jsx
<div className="p-3 border-l-4 border-green-500 bg-green-50">
```

### Calificación histórica
```jsx
<div className="p-3 border-l-4 border-blue-500 bg-blue-50">
```

### Badge de histórico
```jsx
<span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
  De sección anterior
</span>
```

---

## 🔄 Actualizar Datos

```jsx
const { refetch } = useCalificacionesHistorico(...);

// Cuando necesites actualizar
await refetch();
```

---

## ⚠️ Cosas Importantes

### ✅ DO's
- ✅ Obtener token de `useContext(AuthContext)`
- ✅ Mostrar loader mientras `loading === true`
- ✅ Mostrar error si `error` no es null
- ✅ Verificar `esDeSeccionAnterior` antes de mostrar sección anterior
- ✅ Usar el hook más específico que necesites

### ❌ DON'Ts
- ❌ No acceder a propiedades que podrían ser `null`
- ❌ No usar tokens inválidos
- ❌ No hacer llamadas sin IDs válidos
- ❌ No ignorar errores
- ❌ No llamar el hook sin AuthContext

---

## 📱 Integración en 3 Componentes

### GradoDetail.jsx
```jsx
import { useCalificacionesPorMateria } from '@/hooks/useCalificacionesHistorico';

function GradoDetail({ estudianteID, annoEscolarID }) {
  const { user } = useContext(AuthContext);
  const { calificacionesPorMateria, loading } = 
    useCalificacionesPorMateria(estudianteID, annoEscolarID, user?.token);

  return (
    <div>
      {calificacionesPorMateria.map(materia => (
        <div key={materia.id}>
          <h3>{materia.nombre}</h3>
          {/* Mostrar actuales e históricas */}
        </div>
      ))}
    </div>
  );
}
```

### DetallesEstudiante.jsx
```jsx
import { useCalificacionesEstadisticas } from '@/hooks/useCalificacionesHistorico';

function DetallesEstudiante({ estudianteID, annoEscolarID }) {
  const { user } = useContext(AuthContext);
  const { estadisticas } = 
    useCalificacionesEstadisticas(estudianteID, annoEscolarID, user?.token);

  return (
    <div>
      <p>Promedio: {estadisticas.promedioActual}</p>
      <p>Máximo: {estadisticas.calificacionMaxima}</p>
    </div>
  );
}
```

### ReporteCalificaciones.jsx
```jsx
import { useCalificacionesFiltradas } from '@/hooks/useCalificacionesHistorico';

function ReporteCalificaciones({ estudianteID, annoEscolarID, filtros }) {
  const { user } = useContext(AuthContext);
  const { calificacionesFiltradas } = 
    useCalificacionesFiltradas(estudianteID, annoEscolarID, user?.token, filtros);

  return (
    <div>
      {/* Mostrar filtradas */}
    </div>
  );
}
```

---

## 🧪 Test Rápido

Copiar en DevTools Console:
```javascript
// Ver todas las calificaciones
console.log(window.calificaciones);

// Contar históricas
console.log(
  window.calificaciones?.filter(c => c.esDeSeccionAnterior).length
);

// Ver sección anterior del primero histórico
console.log(
  window.calificaciones?.find(c => c.esDeSeccionAnterior)?.seccionHistorico
);
```

---

## 📋 Estructura de Datos

```javascript
// Una calificación completa
{
  id: 1,
  calificacion: 18,
  evaluacion: {
    id: 1,
    nombre: "Quiz 1",
    tipo: "quiz",
    lapso: "1",
    fecha: "2025-03-15"
  },
  materia: {
    id: 1,
    nombre: "Matemática"
  },
  esDeSeccionAnterior: false,        // ← CLAVE
  seccionHistorico: null,            // Solo si es histórico
  profesorAnterior: null,            // Solo si es histórico
  fechaTransferencia: null           // Solo si es histórico
}
```

---

## 🔗 Links Útiles

- 📖 **Documentación completa**: `frontend/src/hooks/CALIFICACIONES_HISTORICO_DOCS.md`
- 📝 **Ejemplo completo**: `frontend/src/components/common/CalificacionesConHistoricoEjemplo.jsx`
- 📋 **Validación**: `VALIDACION_IMPLEMENTACION.md`
- 🎯 **Resumen**: `RESUMEN_IMPLEMENTACION_HOOKS_HISTORICO.md`

---

## ✅ Checklist Inicial

- [ ] Archivo hook existe: `frontend/src/hooks/useCalificacionesHistorico.js`
- [ ] Puedo importar sin errores
- [ ] Backend endpoint está activo
- [ ] Token se obtiene del AuthContext
- [ ] Hay al menos 1 estudiante con calificaciones
- [ ] He leído la documentación completa

---

## 🎯 Próximo Paso

Elige uno:

**Opción A: Ver ejemplo funcional**
→ Ir a `CalificacionesConHistoricoEjemplo.jsx` y copiar el componente

**Opción B: Integrar en GradoDetail.jsx**
→ Agregar `useCalificacionesPorMateria` y mostrar actuales/históricas separadas

**Opción C: Ver documentación completa**
→ Leer `CALIFICACIONES_HISTORICO_DOCS.md`

---

**¡Listo! Puedes empezar a usar los hooks ahora mismo 🚀**

Cualquier pregunta, revisa los archivos de documentación o ejecuta el componente ejemplo.