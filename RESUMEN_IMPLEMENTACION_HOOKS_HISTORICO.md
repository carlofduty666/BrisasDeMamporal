# Resumen: Implementación de Hooks para Calificaciones con Histórico

## ✅ Completado

### 1. Hook Principal: `useCalificacionesHistorico`
**Archivo**: `frontend/src/hooks/useCalificacionesHistorico.js`

#### Funcionalidad
- Obtiene todas las calificaciones de un estudiante
- Detecta automáticamente qué calificaciones pertenecen a secciones anteriores
- Retorna información completa: `{ calificaciones, loading, error, refetch }`

#### Estructura de respuesta por calificación
```javascript
{
  id: number,
  calificacion: number,
  evaluacion: { id, nombre, tipo, lapso, fecha },
  materia: { id, nombre },
  esDeSeccionAnterior: boolean,
  seccionHistorico: { id, nombre } | null,
  profesorAnterior: { id, nombre, apellido } | null,
  fechaTransferencia: Date | null
}
```

---

### 2. Hooks Secundarios

#### `useCalificacionesPorMateria`
- Agrupa calificaciones por materia
- Separa automáticamente actuales de históricas
- Retorna: `{ calificacionesPorMateria[], loading, error, refetch }`

#### `useCalificacionesPorLapso`
- Agrupa por lapso y luego por materia
- Ordena automáticamente los lapsos
- Ideal para vistas de progreso académico

#### `useCalificacionesFiltradas`
- Filtra por múltiples criterios:
  - `historico`: true/false
  - `materiaId`: número
  - `lapso`: string
  - `tipoEvaluacion`: string
  - `calificacionMin/Max`: número
- Retorna: `{ calificacionesFiltradas[], total, totalHistoricas, totalActuales, ... }`

#### `useCalificacionesEstadisticas`
- Calcula promedios (actual y histórico)
- Máximas y mínimas
- Análisis por materia
- Retorna: `{ estadisticas: { ... }, loading, error }`

---

### 3. Componente Ejemplo
**Archivo**: `frontend/src/components/common/CalificacionesConHistoricoEjemplo.jsx`

- Componente completo que demuestra uso de todos los hooks
- 5 vistas diferentes (todas, histórico, porMateria, porLapso, estadísticas)
- Incluye filtros interactivos
- Estilos con Tailwind CSS

---

### 4. Documentación Completa
**Archivo**: `frontend/src/hooks/CALIFICACIONES_HISTORICO_DOCS.md`

Incluye:
- Descripción de cada hook
- Parámetros y retorno
- Ejemplos de uso
- Estructura de datos
- Casos de uso comunes
- Troubleshooting
- Notas de integración

---

## 🔧 Configuración Requerida

### Backend ya está implementado:
✅ `getCalificacionesConHistorialSeccion` en `calificaciones.controller.js`
✅ Ruta registrada: `GET /calificaciones/historialseccion/:estudianteID/:annoEscolarID`
✅ Timestamps habilitados en `Seccion_Personas`
✅ Migración para agregar `createdAt` y `updatedAt`

### Frontend - Lo que ya está listo:
✅ Hook con todas sus exportaciones
✅ Validación de datos
✅ Manejo de errores
✅ Documentación completa
✅ Componente ejemplo

---

## 🚀 Cómo Usar

### Paso 1: Importar el hook
```javascript
import { 
  useCalificacionesHistorico,
  useCalificacionesPorMateria,
  useCalificacionesEstadisticas,
  useCalificacionesFiltradas,
  useCalificacionesPorLapso
} from '@/hooks/useCalificacionesHistorico';
```

### Paso 2: Usar en tu componente
```jsx
function MiComponente() {
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
            <span>De sección: {cal.seccionHistorico.nombre}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Paso 3: Integración en componentes existentes

#### En `GradoDetail.jsx`:
```jsx
const { calificacionesPorMateria } = useCalificacionesPorMateria(...);

// Separa automáticamente:
// - materia.actuales (calificaciones de sección actual)
// - materia.historicas (calificaciones de secciones anteriores)
```

#### En `DetallesEstudiante.jsx`:
```jsx
const { estadisticas } = useCalificacionesEstadisticas(...);

// Muestra:
// - estadisticas.promedioActual
// - estadisticas.promedioHistorico
// - estadisticas.porMateria
```

#### En un componente de reportes:
```jsx
const { calificacionesFiltradas } = useCalificacionesFiltradas(..., {
  historico: true,
  calificacionMin: 10
});

// Solo muestra calificaciones históricas con nota >= 10
```

---

## 📊 Estructura Visual Recomendada

### Para mostrar calificaciones con indicador histórico:

```jsx
{calificaciones.map(cal => (
  <div 
    key={cal.id} 
    className={cal.esDeSeccionAnterior ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50'}
  >
    <p>{cal.materia.nombre}: {cal.calificacion}</p>
    
    {cal.esDeSeccionAnterior && (
      <div className="text-sm text-blue-700">
        <p>📍 Sección anterior: {cal.seccionHistorico.nombre}</p>
        <p>👨‍🏫 Profesor: {cal.profesorAnterior.nombre}</p>
        <p>📅 Transferencia: {new Date(cal.fechaTransferencia).toLocaleDateString()}</p>
      </div>
    )}
  </div>
))}
```

---

## ✨ Características Principales

### ✅ Detección automática
- Compara `createdAt` de calificación con `updatedAt` de sección actual
- Marca automáticamente con `esDeSeccionAnterior`

### ✅ Información completa
- Sección anterior donde fue asignada
- Profesor que la asignó
- Fecha de transferencia del estudiante

### ✅ Múltiples formas de acceso
- Vista plana (todas las calificaciones)
- Agrupadas por materia
- Agrupadas por lapso
- Filtradas por criterios
- Con estadísticas

### ✅ Rendimiento optimizado
- Cada hook solo procesa lo que necesita
- Validación de datos para evitar errores
- Manejo robusto de casos vacíos

### ✅ Fácil integración
- Reutilizable en múltiples componentes
- Parámetros simples
- Retorna datos listos para usar
- Función `refetch` para actualizar

---

## 📋 Próximos Pasos

### 1. Probar el backend
```bash
# Verificar que el endpoint esté activo
curl http://localhost:5000/calificaciones/historialseccion/1/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Integrar en componentes
- Actualizar `GradoDetail.jsx` para usar `useCalificacionesPorMateria`
- Actualizar `DetallesEstudiante.jsx` para usar `useCalificacionesEstadisticas`
- Crear reportes usando `useCalificacionesFiltradas`

### 3. Diseño visual (opcional)
- Usar el componente `CalificacionesConHistoricoEjemplo` como referencia
- Adaptar colores y estilos a tu diseño
- Agregar iconos para indicadores visuales

### 4. Testing
- Crear estudiante de prueba
- Transferir de sección
- Verificar que calificaciones antiguas muestren indicador
- Validar en diferentes componentes

---

## 🐛 Debugging

### Si no se cargan las calificaciones:
1. Verificar token válido en AuthContext
2. Verificar IDs correctos (estudianteID, annoEscolarID)
3. Revisar consola del navegador por errores de axios
4. Verificar endpoint en backend: `GET /calificaciones/historialseccion/:estudianteID/:annoEscolarID`

### Si no aparecen calificaciones históricas:
1. Verificar que exista `createdAt` en calificaciones
2. Verificar que exista `updatedAt` en Seccion_Personas
3. Verificar que la fecha de creación de calificación sea anterior a transferencia
4. Verificar que `seccionID` de evaluación sea diferente al actual

### Si hay errors de "Cannot read property":
1. Las validaciones están incluidas, pero revisar consola
2. Asegurar que datos del backend tengan estructura correcta
3. Considerar agregar más validaciones específicas

---

## 📝 Ejemplo Completo de Integración

```jsx
// En DetallesEstudiante.jsx
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { 
  useCalificacionesPorMateria,
  useCalificacionesEstadisticas 
} from '@/hooks/useCalificacionesHistorico';

function DetallesEstudiante({ estudianteID, annoEscolarID }) {
  const { user } = useContext(AuthContext);

  const { calificacionesPorMateria, loading: loadingMaterias } = 
    useCalificacionesPorMateria(estudianteID, annoEscolarID, user?.token);

  const { estadisticas, loading: loadingStats } = 
    useCalificacionesEstadisticas(estudianteID, annoEscolarID, user?.token);

  if (loadingMaterias || loadingStats) return <div>Cargando...</div>;

  return (
    <div>
      {/* Resumen académico */}
      <div className="mb-6 p-4 bg-blue-100 rounded">
        <h3>Resumen Académico</h3>
        <p>Promedio Actual: {estadisticas.promedioActual}</p>
        {estadisticas.totalHistoricas > 0 && (
          <p className="text-blue-700">
            Promedio Anterior: {estadisticas.promedioHistorico}
            (de {estadisticas.totalHistoricas} calificaciones de secciones anteriores)
          </p>
        )}
      </div>

      {/* Calificaciones por materia */}
      {calificacionesPorMateria.map(materia => (
        <div key={materia.id} className="mb-4 p-4 border rounded">
          <h4>{materia.nombre}</h4>

          <div className="space-y-2">
            {/* Actuales */}
            {materia.actuales.length > 0 && (
              <div>
                <p className="font-semibold text-green-700">Actuales:</p>
                {materia.actuales.map(cal => (
                  <p key={cal.id}>{cal.evaluacion.nombre}: {cal.calificacion}</p>
                ))}
              </div>
            )}

            {/* Históricas */}
            {materia.historicas.length > 0 && (
              <div className="p-2 bg-blue-50 rounded">
                <p className="font-semibold text-blue-700">
                  De secciones anteriores:
                </p>
                {materia.historicas.map(cal => (
                  <p key={cal.id} className="text-sm">
                    {cal.evaluacion.nombre}: {cal.calificacion} 
                    ({cal.seccionHistorico.nombre})
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DetallesEstudiante;
```

---

## 📚 Archivos Generados

1. **`frontend/src/hooks/useCalificacionesHistorico.js`** (326 líneas)
   - 5 hooks exportables
   - Validación robusta
   - Lógica de procesamiento

2. **`frontend/src/hooks/CALIFICACIONES_HISTORICO_DOCS.md`** (500+ líneas)
   - Documentación completa
   - Ejemplos para cada hook
   - Casos de uso
   - Troubleshooting

3. **`frontend/src/components/common/CalificacionesConHistoricoEjemplo.jsx`** (450+ líneas)
   - Componente funcional completo
   - 5 vistas diferentes
   - Filtros interactivos
   - Estilos Tailwind

4. **`RESUMEN_IMPLEMENTACION_HOOKS_HISTORICO.md`** (Este archivo)
   - Guía de implementación
   - Ejemplos de uso
   - Próximos pasos

---

## 🎯 Objetivo Logrado

✅ **Sistema completo para rastrear calificaciones con histórico de secciones**

- Backend: Detecta y devuelve información de transferencias
- Frontend: 5 hooks reutilizables para diferentes casos de uso
- Documentación: Completa con ejemplos
- Componente: Ejemplo funcional listo para adaptar

El sistema permite a los administradores ver claramente:
- ✅ Qué calificaciones pertenecen a la sección actual
- ✅ Qué calificaciones pertenecen a secciones anteriores
- ✅ En qué sección fueron asignadas
- ✅ Por qué profesor y cuándo fue la transferencia

---

## 🔗 Dependencias

**Ya existentes en el proyecto:**
- `react` 19.0.0
- `axios` 1.8.4
- `react-hook-form`
- Tailwind CSS

**No requiere instalaciones adicionales**

---

## 💾 Estado de Base de Datos

✅ **Migrations completadas** (en sesiones anteriores)
- Timestamps en `Seccion_Personas`
- Todas las tablas con `createdAt`/`updatedAt`

---

**¡Sistema listo para usar! 🚀**