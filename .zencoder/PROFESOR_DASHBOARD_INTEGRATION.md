# 🎓 Integración: ProfesorHorariosPanel en ProfesorDashboard

## 📍 Ubicación del Archivo
`frontend/src/components/dashboard/ProfesorDashboard.jsx`

---

## 🔧 Paso 1: Importar el Componente

En la parte superior del archivo ProfesorDashboard.jsx, añade el import:

```jsx
// Imports existentes
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ... otros imports ...
import ClasesActuales from '../ClasesActuales';

// ✅ AÑADE ESTA LÍNEA:
import ProfesorHorariosPanel from './ProfesorHorariosPanel';
```

---

## 🎨 Paso 2: Ubicación en el JSX

El componente debe colocarse en una sección visible. Aquí hay varias opciones:

### Opción A: Después de ClasesActuales (RECOMENDADO)

En el JSX principal del componente, busca donde se renderiza `ClasesActuales` y añade el panel justo después:

```jsx
return (
  <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      
      {/* Header y otros componentes */}
      {/* ... */}

      {/* Clases actuales */}
      {profesor && annoEscolar && (
        <section className="mb-12">
          <ClasesActuales />
        </section>
      )}

      {/* ✅ AÑADE AQUÍ: Panel de horarios */}
      {profesor && annoEscolar && (
        <section className="mb-12">
          <ProfesorHorariosPanel 
            profesorId={profesor.id} 
            annoEscolarId={annoEscolar.id}
          />
        </section>
      )}

      {/* Resto del contenido */}
      {/* ... */}
    </div>
  </div>
);
```

### Opción B: Crear una tab separada

Si quieres una tab/sección separada:

```jsx
// Añade estado para tab
const [activeTab, setActiveTab] = useState('resumen'); // 'resumen', 'horarios', etc.

// En el JSX:
<div className="mb-6 flex gap-2">
  <button
    onClick={() => setActiveTab('resumen')}
    className={`px-4 py-2 rounded ${activeTab === 'resumen' ? 'bg-blue-600 text-white' : 'bg-white'}`}
  >
    📊 Resumen
  </button>
  <button
    onClick={() => setActiveTab('horarios')}
    className={`px-4 py-2 rounded ${activeTab === 'horarios' ? 'bg-blue-600 text-white' : 'bg-white'}`}
  >
    🕐 Mis Horarios
  </button>
</div>

{activeTab === 'resumen' && (
  <section>
    {/* Contenido del resumen */}
  </section>
)}

{activeTab === 'horarios' && profesor && annoEscolar && (
  <section>
    <ProfesorHorariosPanel 
      profesorId={profesor.id} 
      annoEscolarId={annoEscolar.id}
    />
  </section>
)}
```

### Opción C: En un Grid de secciones

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
  {/* Columna izquierda: Información del profesor */}
  <div className="lg:col-span-2">
    {/* Contenido existente */}
  </div>

  {/* Columna derecha: Panel de horarios */}
  <div className="lg:col-span-1">
    {profesor && annoEscolar && (
      <ProfesorHorariosPanel 
        profesorId={profesor.id} 
        annoEscolarId={annoEscolar.id}
      />
    )}
  </div>
</div>
```

---

## 📝 Paso 3: Código Completo de Ejemplo

Aquí está un ejemplo más realista de cómo quedaría el JSX:

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClasesActuales from '../ClasesActuales';
import ProfesorHorariosPanel from './ProfesorHorariosPanel'; // ✅ NUEVO IMPORT

const ProfesorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profesor, setProfesor] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  // ... otros estados ...

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const userData = JSON.parse(atob(token.split('.')[1]));
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          config
        );
        setProfesor(profesorResponse.data);
        
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
        setAnnoEscolar(annoResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Bienvenido, {profesor?.nombre}
          </h1>
          <p className="text-gray-600 mt-2">
            Año escolar: {annoEscolar?.periodo}
          </p>
        </div>

        {/* Clases Actuales */}
        {profesor && annoEscolar && (
          <section className="mb-12">
            <ClasesActuales />
          </section>
        )}

        {/* ✅ NUEVAMENTE AÑADIDO: Panel de Horarios */}
        {profesor && annoEscolar && (
          <section className="mb-12">
            <ProfesorHorariosPanel 
              profesorId={profesor.id} 
              annoEscolarId={annoEscolar.id}
            />
          </section>
        )}

        {/* Resto del contenido del dashboard */}
        {/* ... materias, evaluaciones, etc ... */}

      </div>
    </div>
  );
};

export default ProfesorDashboard;
```

---

## 🎨 Variantes de Integración

### Variante 1: Panel Ancho (Recomendado)
```jsx
{profesor && annoEscolar && (
  <div className="w-full">
    <ProfesorHorariosPanel 
      profesorId={profesor.id} 
      annoEscolarId={annoEscolar.id}
    />
  </div>
)}
```

### Variante 2: Panel en Grid de 2 columnas
```jsx
{profesor && annoEscolar && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <div className="lg:col-span-1">
      <ProfesorHorariosPanel 
        profesorId={profesor.id} 
        annoEscolarId={annoEscolar.id}
      />
    </div>
    <div className="lg:col-span-1">
      {/* Otro componente */}
    </div>
  </div>
)}
```

### Variante 3: Tarjeta con Título
```jsx
{profesor && annoEscolar && (
  <section className="mb-12">
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <FaClock className="mr-3 text-rose-600" />
        Mi Horario de Clases
      </h2>
    </div>
    <ProfesorHorariosPanel 
      profesorId={profesor.id} 
      annoEscolarId={annoEscolar.id}
    />
  </section>
)}
```

---

## 🔍 Verificación de Props

Asegúrate de que estás pasando los props correctos:

```jsx
// ✅ CORRECTO:
<ProfesorHorariosPanel 
  profesorId={profesor.id}           // Number - ID del profesor
  annoEscolarId={annoEscolar.id}     // Number - ID del año escolar
/>

// ❌ INCORRECTO:
<ProfesorHorariosPanel 
  profesorId={profesor}              // Debería ser profesor.id
  annoEscolarId={annoEscolar}        // Debería ser annoEscolar.id
/>

// ❌ INCORRECTO:
<ProfesorHorariosPanel 
  profesorId="123"                   // Debería ser número, no string
  annoEscolarId="456"                // Debería ser número, no string
/>
```

---

## 🧪 Pruebas de Integración

### Test 1: Verificar que el componente se renderiza
1. Abre ProfesorDashboard
2. Deberías ver "Mis Horarios" con 5 días de la semana
3. Debería mostrar "Cargando horarios..." inicialmente

### Test 2: Verificar que carga datos
1. Espera a que cargue
2. Debería mostrar los horarios del profesor actual
3. Cada día debería mostrar el número de clases

### Test 3: Verificar responsive
1. Abre en móvil (o reduce ventana a 375px)
2. Debería mostrar selector de días
3. Debería mostrar clases del día seleccionado

### Test 4: Verificar interactividad
1. Click en diferentes días
2. Debería mostrar clases de ese día
3. Click en una clase: debería expandirse

### Test 5: Verificar estilos
1. Colores deben usar paleta rose
2. Debe verse cohesivo con el resto del dashboard
3. Sin errores en consola

---

## 🐛 Troubleshooting

### Problema: "ProfesorHorariosPanel is not defined"
**Solución**: Asegúrate de importar el componente en la línea correcta
```jsx
import ProfesorHorariosPanel from './ProfesorHorariosPanel';
```

### Problema: "No se muestran los horarios"
**Solución**: Verifica que:
1. `profesor.id` no sea null/undefined
2. `annoEscolar.id` no sea null/undefined
3. La API en `VITE_API_URL` esté disponible

### Problema: "Errores en la consola"
**Solución**: Abre DevTools (F12) y verifica:
1. El endpoint API correcto
2. El token de autenticación es válido
3. No hay CORS errors

### Problema: "Estilos incorrectos"
**Solución**: Verifica que:
1. Tailwind CSS esté correctamente configurado
2. Los colores rose estén disponibles
3. No hay conflictos de estilos CSS

---

## 📊 Layout Recomendado

```
┌─────────────────────────────────────────────────┐
│ BIENVENIDA                                      │
├─────────────────────────────────────────────────┤
│ Bienvenido, Juan García                         │
│ Año escolar: 2024-2025                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CLASES ACTUALES                                 │
├─────────────────────────────────────────────────┤
│ Ninguna clase en este momento                   │
│ Próxima: Matemática - 3ro A (09:00)            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ MIS HORARIOS                                    │
├─────────────────────────────────────────────────┤
│ [LUNES]    [MARTES]   [MIÉRCOLES] [JUEVES]    │
│            ⭐ HOY                  [VIERNES]    │
│                                                 │
│ 09:00-10:30 │ Matemática - 3ro A              │
│ 10:45-12:00 │ Química - 3ro B                 │
│ 14:00-15:30 │ Historia - 2do A                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ESTADÍSTICAS / EVALUACIONES / ETC               │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Mejores Prácticas

### ✅ Condición Segura
Siempre verifica que los datos estén cargados:
```jsx
{profesor && annoEscolar && (
  <ProfesorHorariosPanel 
    profesorId={profesor.id} 
    annoEscolarId={annoEscolar.id}
  />
)}
```

### ✅ Error Handling
Maneja errores en el componente hijo:
```jsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    {error}
  </div>
)}

{!error && profesor && annoEscolar && (
  <ProfesorHorariosPanel 
    profesorId={profesor.id} 
    annoEscolarId={annoEscolar.id}
  />
)}
```

### ✅ Carga Progresiva
Muestra componentes mientras cargan:
```jsx
{loading ? (
  <Skeleton />
) : profesor && annoEscolar ? (
  <ProfesorHorariosPanel 
    profesorId={profesor.id} 
    annoEscolarId={annoEscolar.id}
  />
) : null}
```

---

## 📋 Checklist de Integración

- [ ] Copiar `ProfesorHorariosPanel.jsx` a `components/dashboard/`
- [ ] Abrir `ProfesorDashboard.jsx`
- [ ] Añadir import de `ProfesorHorariosPanel`
- [ ] Elegir ubicación en JSX
- [ ] Pasar props correctos (`profesorId` y `annoEscolarId`)
- [ ] Rodear con condicional (si datos están cargados)
- [ ] Probar en desarrollo
- [ ] Verificar responsive en móvil
- [ ] Verificar que carga datos
- [ ] Verificar que no hay errores en consola
- [ ] Commit y push

---

## 🚀 Resultado Final

Después de la integración, los profesores tendrán:

✅ Vista clara de sus horarios  
✅ Acceso desde el dashboard principal  
✅ Interfaz responsiva (desktop + móvil)  
✅ Indicador de día actual  
✅ Información de clases expandible  
✅ Colores consistentes con el sistema  

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica los imports
2. Revisa la consola del navegador (F12)
3. Confirma que los datos se cargan en `useEffect`
4. Verifica que el API responde correctamente

---

**Documento**: Integración ProfesorHorariosPanel
**Versión**: 1.0
**Fecha**: 2025
**Estado**: ✅ Listo