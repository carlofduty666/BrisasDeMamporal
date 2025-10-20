# 🎨 Estructura Visual de Botones - Integración Completa

## Vista de Tarjetas (Cards View)

```
┌────────────────────────────────────────────────────────┐
│                    TARJETA DE MATERIA                   │
├────────────────────────────────────────────────────────┤
│                                                          │
│  📚 [Icono Materia]                           ❌        │
│                                                          │
│  Matemáticas                                             │
│  Código: 5                                               │
│                                                          │
├────────────────────────────────────────────────────────┤
│                 Asignada en 3 grados                     │
│                                                          │
│  📚 Primaria:  1er Grado, 2do Grado                     │
│  🎓 Secundaria: 1er Año, 2do Año, 3er Año              │
│                                                          │
├────────────────────────────────────────────────────────┤
│  ACCIONES (3 BOTONES)                                   │
│                                                          │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ 📋 Grado │ 👨 Prof  │ 👨 P-Gdo │                     │
│  │ (Orange) │ (Blue)   │(Purple)  │                     │
│  └──────────┴──────────┴──────────┘                     │
│                                                          │
│  Línea 1: Asignar Materia a Grado                       │
│  Línea 2: Asignar Profesor a Materia                    │
│  Línea 3: Asignar Profesor a Grado                      │
│                                                          │
└────────────────────────────────────────────────────────┘
```

### Estilos de Botones en Tarjetas

```javascript
// Botón 1: Asignar Materia a Grado (NARANJA)
className="bg-orange-500/20 hover:bg-orange-500/40 
           border border-orange-400 text-orange-700"

// Botón 2: Asignar Profesor a Materia (AZUL)
className="bg-blue-500/20 hover:bg-blue-500/40 
           border border-blue-400 text-blue-700"

// Botón 3: Asignar Profesor a Grado (PÚRPURA)
className="bg-purple-500/20 hover:bg-purple-500/40 
           border border-purple-400 text-purple-700"
```

---

## Vista de Lista (Table View)

```
┌─────────────────────────────────────────────────────────────────┐
│ Materia    │ Código │ Grados                    │ Acciones      │
├─────────────────────────────────────────────────────────────────┤
│             │        │                           │               │
│ 📚 Matem.   │ 5      │ 1er Grado, 2do Grado      │ 🟠 🔵 🟣 🗑️ │
│             │        │ 1er Año, 2do Año...       │               │
├─────────────────────────────────────────────────────────────────┤
│             │        │                           │               │
│ 📖 Español  │ 3      │ 1er Grado, 3er Grado      │ 🟠 🔵 🟣 🗑️ │
│             │        │ 1er Año                   │               │
├─────────────────────────────────────────────────────────────────┤
│             │        │                           │               │
│ 🧪 Ciencias │ 7      │ Sin grados                │ 🟠 🔵 🟣 🗑️ │
│             │        │                           │               │
└─────────────────────────────────────────────────────────────────┘

🟠 = Asignar Materia a Grado (color: orange-600)
🔵 = Asignar Profesor a Materia (color: blue-600)
🟣 = Asignar Profesor a Grado (color: purple-600)
🗑️ = Eliminar Materia (color: red-600)
```

---

## Flujo de Modales

```
┌─────────────────────────────────┐
│   PANTALLA DE MATERIAS          │
│   (MateriasList.jsx)            │
└─────────────────────────────────┘
           ↓
     ┌─────┴─────┬─────────────┐
     ↓           ↓             ↓
    
┌─────────────┐ ┌──────────────┐ ┌──────────────────┐
│   MODAL 1   │ │   MODAL 2    │ │    MODAL 3       │
│             │ │              │ │                  │
│ Asignar     │ │ Asignar      │ │ Asignar Profesor │
│ Materia a   │ │ Profesor a   │ │ a Grado          │
│ Grado       │ │ Materia      │ │                  │
│             │ │              │ │                  │
│ (Naranja)   │ │ (Azul)       │ │ (Púrpura)        │
│             │ │              │ │                  │
│ Component:  │ │ Component:   │ │ Component:       │
│ AsignarMat  │ │ AsignarProf  │ │ AsignarProf      │
│ eriaGrado   │ │ esorMateria  │ │ esorGrado        │
│ Seccion     │ │              │ │                  │
└─────────────┘ └──────────────┘ └──────────────────┘
```

---

## Flujo de Datos

### Paso 1: Asignar Materia a Grado

```
Usuario selecciona una materia
            ↓
Click en botón "Grado"
            ↓
setSelectedMateria(materia)
setShowAsignMateriaGradoModal(true)
            ↓
Modal <AsignarMateriaGradoSeccion> abre
            ↓
Usuario selecciona N grados
            ↓
onSubmit() se llama N veces con:
{
  gradoID: 1,
  annoEscolarID: 2024
}
            ↓
handleAsignMateriaGrado(form)
            ↓
POST /materias/asignar-a-grado
            ↓
Materia guardada en N grados
            ↓
setShowAsignMateriaGradoModal(false)
setSuccessMessage()
```

### Paso 2: Asignar Profesor a Materia

```
Usuario selecciona una materia
            ↓
Click en botón "Prof"
            ↓
loadProfesoresAsignados(materiaID)
setSelectedMateria(materia)
setShowAsignProfesorMateriaModal(true)
            ↓
Modal <AsignarProfesorMateria> abre
            ↓
Usuario selecciona N profesores
            ↓
onSubmit() se llama N veces con:
{
  profesorID: 5,
  annoEscolarID: 2024
}
            ↓
handleAsignProfesorMateria(form)
            ↓
POST /materias/asignar-profesor-materia
            ↓
Profesor guardado para materia
(sin grado específico)
            ↓
loadProfesoresAsignados() nuevamente
setProfesoresAsignadosAMateria()
setShowAsignProfesorMateriaModal(false)
```

### Paso 3: Asignar Profesor a Grado

```
Usuario selecciona una materia
            ↓
Click en botón "P-Gdo"
            ↓
loadProfesoresAsignados(materiaID)
setSelectedMateria(materia)
setShowAsignProfesorGradoModal(true)
            ↓
Modal <AsignarProfesorGrado> abre
            ↓
Usuario selecciona N profesores
Usuario selecciona M grados
            ↓
onSubmit() se llama N×M veces con:
{
  profesorID: 5,
  gradoID: 1,
  annoEscolarID: 2024
}
            ↓
handleAsignProfesorGrado(form)
            ↓
POST /materias/asignar-profesor-grado
            ↓
Profesor asignado a M grados
(con validación en backend)
            ↓
setShowAsignProfesorGradoModal(false)
setSuccessMessage()
```

---

## Estructura de Componentes

```
MateriasList (Container)
├── Estados
│   ├── materias
│   ├── profesores
│   ├── grados
│   ├── selectedMateria
│   ├── profesoresAsignadosAMateria
│   ├── showAsignMateriaGradoModal
│   ├── showAsignProfesorMateriaModal
│   └── showAsignProfesorGradoModal
│
├── Funciones
│   ├── loadProfesoresAsignados()
│   ├── handleAsignMateriaGrado()
│   ├── handleAsignProfesorMateria()
│   ├── handleAsignProfesorGrado()
│   └── handleDeleteMateria()
│
├── Vistas
│   ├── Cards View (Grid)
│   │   └── Botones: [Grado] [Prof] [P-Gdo]
│   └── List View (Table)
│       └── Iconos: 🟠 🔵 🟣
│
└── Modales
    ├── <AsignarMateriaGradoSeccion>
    │   Handler: handleAsignMateriaGrado()
    │   Props: materia, grados, annoEscolar, loading
    │
    ├── <AsignarProfesorMateria>
    │   Handler: handleAsignProfesorMateria()
    │   Props: materia, profesores, annoEscolar, loading
    │
    └── <AsignarProfesorGrado>
        Handler: handleAsignProfesorGrado()
        Props: materia, grados, profesores, annoEscolar, loading
```

---

## Colores y Estilos Consistentes

### Botones en Tarjetas (Vista Completa)

```javascript
// Botón 1: Asignar Materia a Grado
<button className="py-2 px-2 bg-orange-500/20 hover:bg-orange-500/40 
                   border border-orange-400 text-orange-700 
                   rounded-lg transition-colors text-xs font-medium 
                   flex items-center justify-center gap-1 hover:shadow-md">
  <FaLayerGroup className="w-3 h-3" />
  <span className="hidden sm:inline">Grado</span>
</button>

// Botón 2: Asignar Profesor a Materia
<button className="py-2 px-2 bg-blue-500/20 hover:bg-blue-500/40 
                   border border-blue-400 text-blue-700 
                   rounded-lg transition-colors text-xs font-medium 
                   flex items-center justify-center gap-1 hover:shadow-md">
  <FaChalkboardTeacher className="w-3 h-3" />
  <span className="hidden sm:inline">Prof</span>
</button>

// Botón 3: Asignar Profesor a Grado
<button className="py-2 px-2 bg-purple-500/20 hover:bg-purple-500/40 
                   border border-purple-400 text-purple-700 
                   rounded-lg transition-colors text-xs font-medium 
                   flex items-center justify-center gap-1 hover:shadow-md">
  <FaChalkboardTeacher className="w-3 h-3" />
  <span className="hidden sm:inline">P-Gdo</span>
</button>
```

### Botones en Lista (Vista Icónica)

```javascript
// Botón 1
<button className="p-2 text-orange-600 hover:bg-orange-100 
                   rounded-lg transition-colors">

// Botón 2
<button className="p-2 text-blue-600 hover:bg-blue-100 
                   rounded-lg transition-colors">

// Botón 3
<button className="p-2 text-purple-600 hover:bg-purple-100 
                   rounded-lg transition-colors">
```

---

## Responsividad

### En Dispositivos Pequeños (sm < 640px)
- Botones en tarjetas: solo muestran iconos
- Textos ocultos con `className="hidden sm:inline"`
- Mantienen espaciado con `gap-1`

### En Dispositivos Medianos (md: 640px - 1024px)
- Botones en tarjetas: muestran icono + texto abreviado
- Abreviaturas: "Grado", "Prof", "P-Gdo"

### En Dispositivos Grandes (lg > 1024px)
- Botones completamente visibles
- Grid de 3 columnas se mantiene

---

## Transiciones y Animaciones

```css
/* Todos los botones tienen */
transition-colors          /* Cambio suave de colores */
hover:shadow-md           /* Sombra al pasar mouse */
hover:bg-*-500/40         /* Fondo más opaco al hover */

/* En modal */
animation: fade-in 0.3s ease-out    /* Aparición suave */
animation: slide-up 0.3s ease-out   /* Deslizamiento hacia arriba */
```

---

## Testing Recomendado

### Prueba 1: Vista de Tarjetas
```
[ ] Click en "Grado" abre AsignarMateriaGradoSeccion
[ ] Click en "Prof" abre AsignarProfesorMateria
[ ] Click en "P-Gdo" abre AsignarProfesorGrado
[ ] Botones responden al hover
[ ] En mobile, solo muestran icono
```

### Prueba 2: Vista de Lista
```
[ ] Los 3 iconos son clicables
[ ] Abren los modales correctos
[ ] Icono 4 (rojo) elimina materia
```

### Prueba 3: Modales
```
[ ] Asignar Materia a Grado: múltiples grados
[ ] Asignar Profesor a Materia: múltiples profesores
[ ] Asignar Profesor a Grado: matriz N×M
[ ] Mostrar profesores ya asignados
[ ] Validación de datos
```