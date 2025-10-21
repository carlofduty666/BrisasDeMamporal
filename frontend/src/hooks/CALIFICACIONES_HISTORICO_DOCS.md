# Hooks para Calificaciones con Histórico de Secciones

## Descripción General
Conjunto de hooks personalizados para obtener, procesar y filtrar calificaciones de estudiantes, con detección automática de calificaciones que pertenecen a secciones anteriores después de transferencias de estudiantes.

---

## Hooks Disponibles

### 1. `useCalificacionesHistorico`
**Hook Principal** - Obtiene todas las calificaciones de un estudiante con marca de histórico.

#### Parámetros
```javascript
useCalificacionesHistorico(
  estudianteID,    // number - ID del estudiante
  annoEscolarID,   // number - ID del año escolar
  token           // string - Token de autenticación
)
```

#### Retorna
```javascript
{
  calificaciones: Array,  // Todas las calificaciones con flag esDeSeccionAnterior
  loading: boolean,       // Estado de carga
  error: string | null,   // Mensaje de error si existe
  refetch: function       // Función para actualizar datos manualmente
}
```

#### Ejemplo de Uso
```jsx
import { useCalificacionesHistorico } from '@/hooks/useCalificacionesHistorico';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

function DetallesEstudiante({ estudianteID, annoEscolarID }) {
  const { user } = useContext(AuthContext);
  const { calificaciones, loading, error } = useCalificacionesHistorico(
    estudianteID,
    annoEscolarID,
    user?.token
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {calificaciones.map(cal => (
        <div key={cal.id}>
          <p>{cal.materia.nombre}: {cal.calificacion}</p>
          {cal.esDeSeccionAnterior && (
            <span className="text-blue-600">
              De sección anterior: {cal.seccionHistorico.nombre}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 2. `useCalificacionesPorMateria`
**Agrupa calificaciones por materia** - Separa automáticamente actuales de históricas.

#### Retorna
```javascript
{
  calificacionesPorMateria: [
    {
      id: number,
      nombre: string,
      actuales: Array,      // Calificaciones de la sección actual
      historicas: Array     // Calificaciones de secciones anteriores
    }
  ],
  loading: boolean,
  error: string | null,
  refetch: function
}
```

#### Ejemplo de Uso
```jsx
import { useCalificacionesPorMateria } from '@/hooks/useCalificacionesHistorico';

function CalificacionesPorMateria({ estudianteID, annoEscolarID, token }) {
  const { calificacionesPorMateria, loading } = useCalificacionesPorMateria(
    estudianteID,
    annoEscolarID,
    token
  );

  return (
    <div>
      {calificacionesPorMateria.map(materia => (
        <div key={materia.id} className="mb-4">
          <h3>{materia.nombre}</h3>
          
          {materia.actuales.length > 0 && (
            <div>
              <h4>Actuales:</h4>
              {materia.actuales.map(cal => (
                <p key={cal.id}>{cal.calificacion}</p>
              ))}
            </div>
          )}
          
          {materia.historicas.length > 0 && (
            <div className="bg-blue-50 p-2">
              <h4>Históricas:</h4>
              {materia.historicas.map(cal => (
                <p key={cal.id}>{cal.calificacion}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 3. `useCalificacionesPorLapso`
**Agrupa por lapso y materia** - Útil para progreso académico por período.

#### Retorna
```javascript
{
  calificacionesPorLapso: [
    {
      lapso: string,  // "1", "2", "3", etc.
      materias: [
        {
          materia: { id, nombre },
          actuales: Array,
          historicas: Array
        }
      ]
    }
  ],
  loading: boolean,
  error: string | null,
  refetch: function
}
```

#### Ejemplo de Uso
```jsx
import { useCalificacionesPorLapso } from '@/hooks/useCalificacionesHistorico';

function ProgresoPorLapso({ estudianteID, annoEscolarID, token }) {
  const { calificacionesPorLapso } = useCalificacionesPorLapso(
    estudianteID,
    annoEscolarID,
    token
  );

  return (
    <div>
      {calificacionesPorLapso.map(lapsoData => (
        <div key={lapsoData.lapso} className="mb-6">
          <h2>Lapso {lapsoData.lapso}</h2>
          
          {lapsoData.materias.map(materia => (
            <div key={materia.materia.id}>
              <p>{materia.materia.nombre}</p>
              <p>Promedio: {
                materia.actuales.length > 0
                  ? (materia.actuales.reduce((s, c) => s + c.calificacion, 0) / materia.actuales.length).toFixed(2)
                  : 'N/A'
              }</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### 4. `useCalificacionesFiltradas`
**Filtra por criterios específicos** - Útil para búsquedas y vistas selectivas.

#### Parámetros
```javascript
useCalificacionesFiltradas(
  estudianteID,
  annoEscolarID,
  token,
  filtro = {
    historico: boolean,           // true = solo históricas, false = solo actuales
    materiaId: number,            // Filtro por materia específica
    lapso: string,                // Filtro por lapso ("1", "2", etc.)
    tipoEvaluacion: string,       // Tipo de evaluación
    calificacionMin: number,      // Rango mínimo
    calificacionMax: number       // Rango máximo
  }
)
```

#### Retorna
```javascript
{
  calificacionesFiltradas: Array,
  total: number,
  totalHistoricas: number,
  totalActuales: number,
  loading: boolean,
  error: string | null,
  refetch: function
}
```

#### Ejemplo de Uso
```jsx
import { useCalificacionesFiltradas } from '@/hooks/useCalificacionesHistorico';

function CalificacionesHistoricas({ estudianteID, annoEscolarID, token }) {
  const { calificacionesFiltradas, total } = useCalificacionesFiltradas(
    estudianteID,
    annoEscolarID,
    token,
    { historico: true }  // Solo calificaciones históricas
  );

  return (
    <div>
      <p>Total de calificaciones de secciones anteriores: {total}</p>
      {calificacionesFiltradas.map(cal => (
        <div key={cal.id} className="border-l-4 border-blue-500 p-2">
          {cal.materia.nombre}: {cal.calificacion}
          <small> (Sección anterior: {cal.seccionHistorico.nombre})</small>
        </div>
      ))}
    </div>
  );
}

// O filtrar por rango de calificaciones
function CalificacionesAltas({ estudianteID, annoEscolarID, token }) {
  const { calificacionesFiltradas } = useCalificacionesFiltradas(
    estudianteID,
    annoEscolarID,
    token,
    { calificacionMin: 16 }  // Solo calificaciones >= 16
  );

  return (
    <div>
      {calificacionesFiltradas.map(cal => (
        <p key={cal.id}>{cal.materia.nombre}: {cal.calificacion}</p>
      ))}
    </div>
  );
}
```

---

### 5. `useCalificacionesEstadisticas`
**Calcula estadísticas** - Promedios, máximos, mínimos y análisis por materia.

#### Retorna
```javascript
{
  estadisticas: {
    totalCalificaciones: number,
    totalHistoricas: number,
    totalActuales: number,
    promedioActual: number,          // Promedio de sección actual
    promedioHistorico: number,       // Promedio de secciones anteriores
    calificacionMaxima: number,
    calificacionMinima: number,
    porMateria: {
      [materiaId]: {
        nombre: string,
        total: number,
        promedio: number,
        calificaciones: Array
      }
    }
  },
  loading: boolean,
  error: string | null
}
```

#### Ejemplo de Uso
```jsx
import { useCalificacionesEstadisticas } from '@/hooks/useCalificacionesHistorico';

function ResumenAcademico({ estudianteID, annoEscolarID, token }) {
  const { estadisticas, loading } = useCalificacionesEstadisticas(
    estudianteID,
    annoEscolarID,
    token
  );

  if (loading) return <div>Calculando...</div>;

  return (
    <div className="p-4 bg-gray-100">
      <h2>Resumen Académico</h2>
      
      <p>Total de calificaciones: {estadisticas.totalCalificaciones}</p>
      <p>Promedio actual: {estadisticas.promedioActual}</p>
      <p>Promedio histórico: {estadisticas.promedioHistorico}</p>
      <p>Máxima: {estadisticas.calificacionMaxima}</p>
      <p>Mínima: {estadisticas.calificacionMinima}</p>
      
      <h3>Por Materia:</h3>
      {Object.entries(estadisticas.porMateria).map(([id, materia]) => (
        <div key={id} className="mb-2 p-2 bg-white">
          <p><strong>{materia.nombre}</strong></p>
          <p>Total: {materia.total} | Promedio: {materia.promedio}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Estructura de Datos de Calificación

```javascript
{
  id: number,
  calificacion: number,
  observaciones: string,
  evaluacion: {
    id: number,
    nombre: string,
    tipo: string,
    lapso: string,
    fecha: Date
  },
  materia: {
    id: number,
    nombre: string
  },
  esDeSeccionAnterior: boolean,
  seccionHistorico: {
    id: number,
    nombre: string
  } | null,
  profesorAnterior: {
    id: number,
    nombre: string,
    apellido: string
  } | null,
  fechaTransferencia: Date | null
}
```

---

## Casos de Uso Comunes

### Ver todas las calificaciones con indicador de histórico
```jsx
const { calificaciones, loading } = useCalificacionesHistorico(...);

calificaciones.forEach(cal => {
  console.log(`${cal.materia.nombre}: ${cal.calificacion}`);
  if (cal.esDeSeccionAnterior) {
    console.log(`  → De sección anterior: ${cal.seccionHistorico.nombre}`);
  }
});
```

### Comparar rendimiento actual vs histórico
```jsx
const { estadisticas } = useCalificacionesEstadisticas(...);
console.log(`Mejora: ${estadisticas.promedioActual - estadisticas.promedioHistorico}`);
```

### Buscar calificaciones bajas
```jsx
const { calificacionesFiltradas } = useCalificacionesFiltradas(..., {
  calificacionMax: 12
});
```

### Análisis por materia
```jsx
const { calificacionesPorMateria } = useCalificacionesPorMateria(...);

calificacionesPorMateria.forEach(materia => {
  const promedio = materia.actuales.length > 0
    ? materia.actuales.reduce((s, c) => s + c.calificacion, 0) / materia.actuales.length
    : 0;
  console.log(`${materia.nombre}: ${promedio}`);
});
```

---

## Notas Importantes

1. **Token requerido**: Todos los hooks requieren un token de autenticación válido
2. **Dependencias**: Los hooks se re-ejecutan cuando cambian `estudianteID`, `annoEscolarID` o `token`
3. **Validación de datos**: Los hooks incluyen validación para manejar datos incompletos
4. **Performance**: Se recomienda usar el hook más específico necesario para evitar procesamiento innecesario
5. **Errores**: Todos los hooks retornan un objeto `error` que debe ser chequeado
6. **Refetch**: Todos los hooks incluyen una función `refetch()` para actualizar datos manualmente

---

## Integración con Componentes Existentes

### En GradoDetail.jsx
```jsx
import { useCalificacionesPorMateria } from '@/hooks/useCalificacionesHistorico';

function GradoDetail() {
  const { calificacionesPorMateria, loading } = useCalificacionesPorMateria(
    estudianteID,
    annoEscolarID,
    token
  );
  
  return (
    // Renderizar con separación de actuales e históricas
  );
}
```

### En DetallesEstudiante.jsx
```jsx
import { useCalificacionesEstadisticas } from '@/hooks/useCalificacionesHistorico';

function DetallesEstudiante() {
  const { estadisticas } = useCalificacionesEstadisticas(...);
  
  return (
    // Mostrar resumen académico con promedios
  );
}
```

### En ReporteCalificaciones.jsx
```jsx
import { useCalificacionesFiltradas } from '@/hooks/useCalificacionesHistorico';

function ReporteCalificaciones() {
  const [filtros, setFiltros] = useState({});
  const { calificacionesFiltradas } = useCalificacionesFiltradas(
    ...,
    filtros
  );
  
  return (
    // Mostrar reporte filtrable
  );
}
```

---

## Troubleshooting

### Las calificaciones no se cargan
- Verificar que el token sea válido
- Verificar que el `estudianteID` y `annoEscolarID` sean válidos
- Revisar la consola del navegador para errores de axios

### Las calificaciones históricas no aparecen
- Verificar que la fecha `createdAt` de la calificación sea anterior a `updatedAt` de `Seccion_Personas`
- Verificar que el `seccionID` de la evaluación sea diferente al `seccionID` actual

### El rendimiento es lento
- Usar el hook más específico (ej: `useCalificacionesPorMateria` en lugar de `useCalificacionesHistorico`)
- Implementar paginación o límites si hay muchas calificaciones
- Considerar cachear los resultados en Context

---

## APIs Requeridas

El backend debe tener implementado:
- `GET /calificaciones/historialseccion/:estudianteID/:annoEscolarID`

Con autenticación mediante Bearer token.