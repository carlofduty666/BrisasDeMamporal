# Checklist de Validación: Sistema de Calificaciones con Histórico

## ✅ Backend - Verificación

### API Endpoint
- [ ] Endpoint existe: `GET /calificaciones/historialseccion/:estudianteID/:annoEscolarID`
- [ ] Requiere autenticación (Bearer token)
- [ ] Retorna estructura JSON correcta

**Para probar:**
```bash
# En PowerShell
$headers = @{
  'Authorization' = 'Bearer TU_TOKEN_AQUI'
}
$response = Invoke-WebRequest `
  -Uri "http://localhost:5000/calificaciones/historialseccion/1/1" `
  -Headers $headers
$response.Content | ConvertFrom-Json | Format-List
```

### Estructura de Respuesta
La respuesta debe ser así:
```json
{
  "estudiante": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "seccionActual": {
    "id": 1,
    "nombre": "A",
    "fechaAsignacion": "2025-03-20T10:00:00Z"
  },
  "calificaciones": [
    {
      "id": 1,
      "calificacion": 18,
      "evaluacion": {
        "id": 1,
        "nombre": "Evaluación 1",
        "tipo": "quiz",
        "lapso": "1",
        "fecha": "2025-03-15T00:00:00Z"
      },
      "materia": {
        "id": 1,
        "nombre": "Matemática"
      },
      "esDeSeccionAnterior": false,
      "seccionHistorico": null,
      "profesorAnterior": null,
      "fechaTransferencia": null
    },
    {
      "id": 2,
      "calificacion": 16,
      "evaluacion": { ... },
      "materia": { ... },
      "esDeSeccionAnterior": true,
      "seccionHistorico": {
        "id": 2,
        "nombre": "B"
      },
      "profesorAnterior": {
        "id": 5,
        "nombre": "Carlos",
        "apellido": "López"
      },
      "fechaTransferencia": "2025-03-20T10:00:00Z"
    }
  ]
}
```

---

## ✅ Frontend - Verificación

### 1. Hook Disponible
- [ ] Archivo existe: `frontend/src/hooks/useCalificacionesHistorico.js`
- [ ] Exporta 5 funciones:
  - `useCalificacionesHistorico`
  - `useCalificacionesPorMateria`
  - `useCalificacionesPorLapso`
  - `useCalificacionesFiltradas`
  - `useCalificacionesEstadisticas`

**Para verificar en VS Code:**
```javascript
import { 
  useCalificacionesHistorico,
  useCalificacionesPorMateria,
  useCalificacionesPorLapso,
  useCalificacionesFiltradas,
  useCalificacionesEstadisticas
} from '@/hooks/useCalificacionesHistorico';

// Si importa sin errores ✅
```

### 2. Hook Principal - Test Básico
```jsx
// En cualquier componente
import { useCalificacionesHistorico } from '@/hooks/useCalificacionesHistorico';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

function TestComponent() {
  const { user } = useContext(AuthContext);
  const { calificaciones, loading, error } = useCalificacionesHistorico(1, 1, user?.token);

  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Calificaciones:', calificaciones);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!calificaciones.length) return <div>Sin calificaciones</div>;

  return (
    <div>
      <p>Total: {calificaciones.length}</p>
      <p>Históricas: {calificaciones.filter(c => c.esDeSeccionAnterior).length}</p>
    </div>
  );
}
```

### 3. Variables de Entorno
- [ ] `VITE_API_URL` está en `frontend/.env`
- [ ] Valor es `http://localhost:5000` (desarrollo)

**Verificar en `frontend/.env`:**
```
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Test Completo del Sistema

### Paso 1: Preparar Datos de Prueba

**En la base de datos (ejecutar queries):**

1. Crear un estudiante (si no existe):
```sql
SELECT id FROM personas WHERE tipo = 'estudiante' LIMIT 1;
-- Guardar el ID, ej: 1
```

2. Verificar que haya calificaciones para ese estudiante:
```sql
SELECT COUNT(*) FROM calificaciones WHERE personaID = 1;
```

3. Verificar que el estudiante esté en una sección:
```sql
SELECT * FROM seccion_personas WHERE personaID = 1 LIMIT 1;
```

### Paso 2: Probar Hook Manualmente

Crear archivo temporal `TestCalificacionesHook.jsx`:

```jsx
import { useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import {
  useCalificacionesHistorico,
  useCalificacionesPorMateria,
  useCalificacionesEstadisticas
} from '@/hooks/useCalificacionesHistorico';

export default function TestCalificacionesHook() {
  const { user } = useContext(AuthContext);

  // Test 1: Hook principal
  const { calificaciones, loading: l1, error: e1 } = 
    useCalificacionesHistorico(1, 1, user?.token);

  // Test 2: Por materia
  const { calificacionesPorMateria, loading: l2, error: e2 } = 
    useCalificacionesPorMateria(1, 1, user?.token);

  // Test 3: Estadísticas
  const { estadisticas, loading: l3, error: e3 } = 
    useCalificacionesEstadisticas(1, 1, user?.token);

  useEffect(() => {
    console.log('=== TEST 1: Hook Principal ===');
    console.log('Loading:', l1);
    console.log('Error:', e1);
    console.log('Calificaciones:', calificaciones);
    console.log('Total:', calificaciones.length);
    console.log('Actuales:', calificaciones.filter(c => !c.esDeSeccionAnterior).length);
    console.log('Históricas:', calificaciones.filter(c => c.esDeSeccionAnterior).length);

    console.log('\n=== TEST 2: Por Materia ===');
    console.log('Materias:', calificacionesPorMateria);
    calificacionesPorMateria.forEach(m => {
      console.log(`- ${m.nombre}: ${m.actuales.length} actuales, ${m.historicas.length} históricas`);
    });

    console.log('\n=== TEST 3: Estadísticas ===');
    console.log('Total:', estadisticas.totalCalificaciones);
    console.log('Promedio actual:', estadisticas.promedioActual);
    console.log('Promedio histórico:', estadisticas.promedioHistorico);
  }, [calificaciones, calificacionesPorMateria, estadisticas]);

  return (
    <div className="p-8 space-y-4">
      <h1>Test Sistema de Calificaciones con Histórico</h1>

      <div className="space-y-2">
        <h2>Test 1: Hook Principal</h2>
        <p>Loading: {l1 ? '⏳' : '✅'}</p>
        <p>Error: {e1 ? `❌ ${e1}` : '✅'}</p>
        <p>Calificaciones: {calificaciones.length} encontradas</p>
      </div>

      <div className="space-y-2">
        <h2>Test 2: Por Materia</h2>
        <p>Materias: {calificacionesPorMateria.length}</p>
        <ul className="list-disc pl-4">
          {calificacionesPorMateria.map(m => (
            <li key={m.id}>
              {m.nombre}: {m.actuales.length} actuales, {m.historicas.length} históricas
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h2>Test 3: Estadísticas</h2>
        <p>Total: {estadisticas.totalCalificaciones}</p>
        <p>Promedio actual: {estadisticas.promedioActual}</p>
        <p>Promedio histórico: {estadisticas.promedioHistorico}</p>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Recargar
      </button>

      <p className="text-sm text-gray-500">Revisa la consola del navegador para detalles</p>
    </div>
  );
}
```

### Paso 3: Verificar en Consola

Abre DevTools (F12) y busca:
- ✅ "=== TEST 1: Hook Principal ===" (debe aparecer)
- ✅ Total de calificaciones > 0
- ✅ Actuales + Históricas = Total
- ✅ Errores de CORS o axios

### Paso 4: Caso Real - Simular Transferencia

**Escenario:**
1. Estudiante está en sección A
2. Tiene calificaciones en sección A (creadas hace 1 semana)
3. Lo transferimos a sección B (hoy)
4. Las calificaciones antiguas deben marcarse como históricas

**Implementar:**
```jsx
// Simulación
const estudianteID = 1;
const annoEscolarID = 1;

// Antes de transferencia
const { calificaciones: antes } = useCalificacionesHistorico(
  estudianteID,
  annoEscolarID,
  user?.token
);
console.log('Antes: Históricas =', antes.filter(c => c.esDeSeccionAnterior).length);
// Debe ser 0

// Después de transferir manualmente en la API
// (esperar 2-3 segundos)

const { refetch } = useCalificacionesHistorico(...);
await refetch();

console.log('Después: Históricas =', ...);
// Debe ser > 0 (las calificaciones antiguas se marcan)
```

---

## 📋 Validación Final Checklist

### Backend
- [ ] Endpoint `/calificaciones/historialseccion/:estudianteID/:annoEscolarID` existe
- [ ] Retorna calificaciones con `esDeSeccionAnterior`
- [ ] Retorna `seccionHistorico`, `profesorAnterior`, `fechaTransferencia` cuando es histórico
- [ ] Timestamps en `Seccion_Personas` funcionan correctamente
- [ ] Autenticación funciona

### Frontend
- [ ] Hook se importa sin errores
- [ ] 5 funciones exportadas correctamente
- [ ] API URL correcta en `.env`
- [ ] Manejo de errores funciona
- [ ] Estado loading funciona
- [ ] Refetch funciona
- [ ] Validación de datos previene errores

### Integración
- [ ] Componente ejemplo funciona sin errores
- [ ] Todos los filtros funcionan
- [ ] Agrupaciones funcionan
- [ ] Estadísticas calculan correctamente

### Data
- [ ] Calificaciones actuales marcan `esDeSeccionAnterior: false`
- [ ] Calificaciones históricas marcan `esDeSeccionAnterior: true`
- [ ] Información de sección anterior es correcta
- [ ] Profesor anterior es correcto
- [ ] Fecha de transferencia es correcta

---

## 🐛 Troubleshooting

### "Cannot read property 'calificaciones'"
**Solución**: Backend devolvió `null`. Verificar:
- [ ] Estudiante existe
- [ ] Año escolar existe
- [ ] Token es válido
- [ ] Endpoint está en el backend

### "CORS error"
**Solución**: 
- [ ] Verificar CORS habilitado en backend
- [ ] Verificar URL en `.env` es correcta
- [ ] Backend está corriendo en `localhost:5000`

### Calificaciones vacías
**Solución**:
- [ ] Estudiante tiene calificaciones asignadas
- [ ] Año escolar es correcto
- [ ] Token tiene permisos de lectura

### Nunca marca como histórico
**Solución**:
- [ ] `createdAt` existe en `calificaciones`
- [ ] `updatedAt` existe en `Seccion_Personas`
- [ ] Migración fue ejecutada
- [ ] Timestamp de calificación es anterior a transferencia

---

## 📊 Métricas Esperadas

Después de implementación correcta:
- ✅ Response time: < 500ms
- ✅ Bundle size: +2-3KB gzipped (hooks)
- ✅ React renders: Optimizado (no re-renders innecesarios)
- ✅ Memory: Sin memory leaks

---

## 🎯 Criterios de Éxito

### ✅ Mínimo (Para que funcione)
1. Hook se importa sin errores
2. API devuelve datos
3. `esDeSeccionAnterior` se calcula correctamente
4. No hay errores en consola

### ✅ Ideal (Completo)
1. Todo lo anterior
2. Todos los 5 hooks funcionan
3. Filtros trabajan correctamente
4. Estadísticas son precisas
5. Componente ejemplo renderiza sin errores
6. Performance es aceptable
7. Manejo de errores robusto

---

## 🚀 Deployment

### Antes de producción:
- [ ] Todos los tests pasan
- [ ] No hay errores en console
- [ ] Hay al menos 3 estudiantes de prueba con transferencias
- [ ] Se probó con diferentes navegadores
- [ ] Se probó con token expirado (debe mostrar error)
- [ ] Se probó con datos vacíos (no crashea)

---

**Estado Actual: ✅ LISTO PARA TESTING**

Todos los archivos están creados y configurados. Solo necesita validación con datos reales.