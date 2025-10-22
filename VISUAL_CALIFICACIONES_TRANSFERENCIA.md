# 📱 Visualización: Indicador de Transferencia en Calificaciones

## 🎨 Estructura de la Tarjeta de Calificación Mejorada

```
┌─────────────────────────────────────────────┐
│ Tarjeta de Calificación (Color por nota)    │  ← Border: amarillo/verde/rojo
├─────────────────────────────────────────────┤
│                                             │
│  Juan Pérez García                          │
│  C.I: 28456987                              │
│                                             │  ← Información del estudiante
│  Sección actual: B                          │  ← NUEVO: Nueva línea con sección actual
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ NUEVO: Aviso de Transferencia    │   │  ← NUEVO: Aviso resaltado si fue transferido
│  │ Este alumno fue transferido a la    │   │
│  │ sección B                           │   │
│  │ Esta calificación es de su sección  │   │
│  │ anterior: A                         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         Nota: [ 15 ]                        │
│      (Verde si ≥10, Rojo si <10)            │
│                                             │
│  Observaciones: Lorem ipsum...              │  ← Si existen observaciones
│                                             │
└─────────────────────────────────────────────┘
```

## 🎯 Estados Visuales

### Estado 1: Estudiante SIN Transferencia
```
┌──────────────────────────────┐
│ María González López         │
│ C.I: 26789456               │
│ Sección actual: A           │
│                              │
│        Nota: [ 18 ]          │
│                              │
└──────────────────────────────┘
```

### Estado 2: Estudiante CON Transferencia
```
┌──────────────────────────────────────────┐
│ Carlos Rodríguez Martínez                │
│ C.I: 29123456                            │
│ Sección actual: B                        │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ⚠️ Este alumno fue transferido     │  │ ← Fondo naranja claro
│ │ a la sección B                     │  │   Border naranja
│ │ Esta calificación es de su         │  │   Icono de flecha
│ │ sección anterior: A                │  │   Texto naranja oscuro
│ └────────────────────────────────────┘  │
│                                          │
│        Nota: [ 9 ]                       │
│                                          │
└──────────────────────────────────────────┘
```

### Estado 3: Estudiante SIN Información de Sección
```
┌──────────────────────────────┐
│ Pedro López Gómez            │
│ C.I: 27654321               │
│                              │
│        Nota: [ 12 ]          │
│                              │
└──────────────────────────────┘
```

## 🎨 Colores Utilizados

### Información de Sección Normal
- Texto: Gris (`text-gray-500`)
- Valor: Gris oscuro (`text-gray-700`)
- Peso: Semibold

### Aviso de Transferencia
- Fondo: Naranja muy claro (`bg-orange-50`)
- Border: Naranja suave (`border-orange-200`)
- Texto: Naranja oscuro (`text-orange-800` / `text-orange-700`)
- Icono: Naranja (`text-orange-600`)
- Peso: Semibold para alertar

## 📍 Componentes Visuales

### 1. Información de Sección Actual
```jsx
Sección actual: [nombre_seccion]
```
- Tamaño: xs (pequeño)
- Ubicación: Debajo de C.I., separado por línea de división
- Siempre visible si hay datos

### 2. Aviso de Transferencia
```jsx
⚠️ Este alumno fue transferido a la sección [SECCIÓN_ACTUAL]
Esta calificación es de su sección anterior: [SECCIÓN_ANTERIOR]
```
- Dos líneas informativas
- Mensaje principal con ícono de alerta
- Mensaje secundario con contexto
- Fondo resaltado para captar atención

### 3. Ícono de Flecha
```jsx
→ (FaArrowRight)
```
- Color naranja
- Ubicado al inicio del contenedor de advertencia
- Indica dirección/movimiento

## 📊 Orden de Elementos en la Tarjeta

```
1. Nombre y apellido (semibold, gris oscuro)
2. Cédula (xs, gris)
3. ─────────────────── (línea divisora)
4. Sección actual (xs, gris)
5. [Si aplica] Aviso de transferencia (naranja, destacado)
6. [Si aplica] Observaciones (gris, itálica)
7. Nota (grande, centrada, coloreada)
```

## 🔄 Flujo de Datos Mostrados

```
Estudiante cargado
    ↓
Se obtiene sección actual del endpoint
    ↓
Se compara con sección de evaluación
    ↓
¿Son diferentes?
    ├─ SÍ → Mostrar sección actual + Aviso naranja
    └─ NO → Solo mostrar sección actual
```

## 📱 Responsive

### Mobile (1 columna)
- Tarjeta ajustada al ancho completo
- Texto truncado si es muy largo
- Aviso naranja visible completo

### Tablet (2 columnas)
- Dos tarjetas por fila
- Mantiene proporciones

### Desktop (3+ columnas)
- Tres o más tarjetas por fila
- Grid responsivo

## ⚡ Performance

- **Carga paralela**: Todas las secciones se cargan simultáneamente
- **Lazy loading**: Solo se cargan cuando se expande la evaluación
- **Caché**: No se recargan secciones de estudiantes ya consultados
- **Optimización**: No bloquea la interfaz mientras carga

## 🎯 Accesibilidad

- Texto con suficiente contraste
- Iconos acompañados de texto descriptivo
- Ícono de alerta indica importancia
- Tamaño de fuente legible
- Estructura clara y organizada

## 📋 Checklist Visual

- ✅ Nombre y apellido del estudiante visible
- ✅ Cédula del estudiante visible
- ✅ Sección actual siempre mostrada (si está disponible)
- ✅ Aviso naranja visible para transferidos
- ✅ Texto del aviso claro y legible
- ✅ Nota visible y coloreada apropiadamente
- ✅ Diseño responsive
- ✅ Colores consistentes con el sistema de diseño