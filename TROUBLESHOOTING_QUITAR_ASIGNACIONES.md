# 🔧 Troubleshooting - Quitar Asignaciones

## ❌ Problemas Comunes y Soluciones

---

## 1. Modal no aparece

### Síntoma
```
Click en "Quitar Asignaciones" pero modal no se abre
```

### Causas Posibles
- [ ] annoEscolar es null/undefined
- [ ] showQuitarAsignacionModal state no se actualiza
- [ ] Componente no renderiza correctamente

### Soluciones

**Paso 1**: Verificar que annoEscolar se pasa
```javascript
// En MateriaDetail.jsx, agregar debug
console.log('annoEscolar:', annoEscolar);
console.log('showQuitarAsignacionModal:', showQuitarAsignacionModal);

// Debería ser:
// annoEscolar: { id: 1, fecha_inicio: "...", ... }
// showQuitarAsignacionModal: true
```

**Paso 2**: Verificar que MateriasList pasa annoEscolar
```javascript
// En MateriasList.jsx
<MateriaDetail
  // ...
  annoEscolar={annoEscolar}  // ✅ Debe estar aquí
/>
```

**Paso 3**: Verificar render condicional
```javascript
// En MateriaDetail.jsx, asegurar que:
{showQuitarAsignacionModal && (
  <QuitarAsignacionMateriaGrado
    isOpen={showQuitarAsignacionModal}
    // ...
  />
)}
```

---

## 2. Error: "Cannot read property 'id' of undefined"

### Síntoma
```
Console error: Cannot read property 'id' of undefined at line XXX
```

### Causa
```
annoEscolar es undefined cuando se renderiza el modal
```

### Solución
```javascript
// En QuitarAsignacionMateriaGrado.jsx, agregar validación
if (!annoEscolar) {
  return null; // No renderizar si no hay annoEscolar
}

// O en el URL
const url = annoEscolar?.id 
  ? `${API_URL}/materias/grado/${gradoID}/${materia.id}/${annoEscolar.id}`
  : null;
```

---

## 3. Botón deshabilitado siempre

### Síntoma
```
Botón "Quitar" nunca se habilita
```

### Causas
- [ ] selectedGrados siempre vacío
- [ ] handleToggleGrado no funciona
- [ ] Checkboxes no se registran

### Soluciones

**Verificar handleToggleGrado**
```javascript
const handleToggleGrado = (gradoID) => {
  console.log('Toggle:', gradoID, 'Current:', selectedGrados);
  setSelectedGrados(prev =>
    prev.includes(gradoID)
      ? prev.filter(id => id !== gradoID)
      : [...prev, gradoID]
  );
};
```

**Verificar que gradosActuales no está vacío**
```javascript
console.log('Grados actuales:', gradosActuales);
// Debería tener longitud > 0
```

**Verificar que los checkboxes están conectados**
```javascript
<input
  type="checkbox"
  checked={selectedGrados.includes(grado.id)}  // ✅ Correcto
  onChange={() => handleToggleGrado(grado.id)}  // ✅ Correcto
/>
```

---

## 4. API retorna 404

### Síntoma
```
Error: GET /materias/grado/1/2/3 => 404 Not Found
```

### Causa
```
La ruta DELETE existe pero no GET
```

### Verificación
```bash
# En backend, revisar rutas
grep "materias/grado" routes/materias.routes.js

# Debería haber:
# DELETE /materias/grado/:gradoID/:materiaID/:annoEscolarID
```

---

## 5. API retorna 409 pero debería ser 200

### Síntoma
```
La materia NO tiene evaluaciones pero API rechaza con 409
```

### Causas
- [ ] Tabla Evaluaciones tiene registros fantasma
- [ ] Query cuenta incorrectamente
- [ ] AnnoEscolarID no coincide

### Soluciones

**Verificar evaluaciones en BD**
```sql
SELECT COUNT(*) FROM evaluaciones 
WHERE materiaID = 2 AND gradoID = 1;

-- Si retorna 0, pero el endpoint dice 409, hay un bug
```

**Verificar query en backend**
```javascript
// En materias.controller.js
const evaluacionesCount = await db.Evaluaciones.count({
  where: {
    materiaID: parseInt(materiaID),  // ✅ Asegurar tipo
    gradoID: parseInt(gradoID)       // ✅ Asegurar tipo
  }
});

console.log('Evaluaciones encontradas:', evaluacionesCount);
```

**Agregar debug en response**
```javascript
res.status(409).json({
  message: '...',
  evaluacionesCount,
  debug: {
    gradoID,
    materiaID,
    query: `Buscando evaluaciones con gradoID=${gradoID}, materiaID=${materiaID}`
  }
});
```

---

## 6. Elimina 1 pero debería eliminar 2

### Síntoma
```
Selecciono 2 grados, pero solo se elimina 1
```

### Causas
- [ ] Loop en handleSubmit interrumpido
- [ ] Error en la mitad detiene el proceso
- [ ] selectedGrados se limpia prematuramente

### Soluciones

**Verificar loop completo**
```javascript
for (const gradoID of selectedGrados) {
  try {
    // Cada one tiene su try-catch
    await axios.delete(...);
    successCount++;
  } catch (error) {
    failureCount++;
    // Continúa con el siguiente, no rompe
  }
}
// DESPUÉS del loop, mostrar resultados
```

**Revisar logs**
```javascript
console.log('Total a eliminar:', selectedGrados.length);
console.log('Éxitos:', successCount);
console.log('Fallos:', failureCount);
```

---

## 7. Modal no cierra después de éxito

### Síntoma
```
Materia se elimina pero modal se queda abierto
```

### Causa
```
onRefresh no cierra el modal
```

### Solución
```javascript
// En MateriaDetail.jsx
onRefresh={() => {
  setShowQuitarAsignacionModal(false);  // ✅ PRIMERO cierra
  setTimeout(() => {
    window.location.reload();            // ✅ DESPUÉS recarga
  }, 500);
}}
```

---

## 8. Recarga pierde contexto

### Síntoma
```
window.location.reload() refresca toda la página
```

### Alternativa (Mejor)
```javascript
// En lugar de reload, recargar los datos localmente
onRefresh={async () => {
  try {
    const response = await axios.get(
      `${API_URL}/materias/${materia.id}/grados`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setDetailedGrados(response.data);
    setShowQuitarAsignacionModal(false);
  } catch (err) {
    console.error('Error recargando:', err);
  }
}}
```

---

## 9. Estilos CSS no se aplican

### Síntoma
```
Modal aparece pero sin estilos rojo/colores
```

### Causa
```
Tailwind clases no compiladas
```

### Solución
```bash
# Reiniciar dev server
npm run dev

# O regenerar CSS
npm run build

# Verificar que tailwind.config.js incluye el path correcto
```

---

## 10. Token no se envía

### Síntoma
```
API retorna 401 Unauthorized
```

### Causa
```
Token no en localStorage o no en headers correctos
```

### Verificación
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Headers deben ser:
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Si falla
```javascript
// Verificar que está en localStorage
localStorage.setItem('token', 'test-token');

// O pasar como prop
<QuitarAsignacionMateriaGrado 
  token={token}
  // ...
/>

// Y usar en componente
const handleSubmit = async () => {
  const token = props.token || localStorage.getItem('token');
  // ...
}
```

---

## 11. Mensaje de error no se muestra

### Síntoma
```
API rechaza (409) pero no se ve el mensaje
```

### Causas
- [ ] message.type no está seteado
- [ ] Modal no re-renderiza
- [ ] Estado anterior se mantiene

### Soluciones

**Verificar que message se actualiza**
```javascript
console.log('Message updated:', message);

// Debería ser:
// { type: 'error', text: '...', details: [...] }
```

**Forzar re-render**
```javascript
setMessage(prev => ({
  ...prev,  // Spread anterior
  type: 'error',
  text: 'Nuevo mensaje'
}));
```

---

## 12. Ancho de modal pequeño

### Síntoma
```
Modal es muy pequeño en pantalla ancha
```

### Solución
```javascript
// En QuitarAsignacionMateriaGrado.jsx
<div className="...max-w-2xl w-full...">  // ✅ max-w-2xl es bueno
  // Cambiar por max-w-3xl o max-w-4xl si necesitas más
</div>
```

---

## 13. Scroll no funciona

### Síntoma
```
Muchos grados pero no se puede scroll
```

### Causa
```
Contenedor sin overflow-y-auto
```

### Verificación
```javascript
<div className="flex-1 overflow-y-auto p-8">  // ✅ overflow-y-auto
  {/* Contenido grande */}
</div>
```

---

## 14. Evaluaciones no se validan

### Síntoma
```
Sistema permite eliminar materia con evaluaciones
```

### Debug
```javascript
// En backend
const count = await db.Evaluaciones.count({
  where: { materiaID, gradoID }
});
console.log(`Evaluaciones para grado ${gradoID}, materia ${materiaID}: ${count}`);

// Debería retornar > 0 si hay evaluaciones
```

---

## 15. Conflicto con otro código

### Síntoma
```
Error aleatorio después de agregar el código
```

### Solución
```bash
# Limpiar node_modules
rm -r node_modules
npm install

# Limpiar cache
npm cache clean --force

# Reiniciar servidor
npm run dev
```

---

## 🆘 No Encontras la Solución?

### Checklist de Debug
```
1. ¿Aparece error en console? 
   → Revisar Network tab
   
2. ¿API recibe request?
   → Revisar backend logs
   
3. ¿API retorna response?
   → Ver status code (200/409/401/500)
   
4. ¿Frontend procesa response?
   → Agregar console.log
   
5. ¿UI se actualiza?
   → Verificar estado de React
```

### Información a Proporcionar
```
Si necesitas ayuda, incluye:
- Error exacto de consola
- Network tab screenshot
- Backend logs
- Pasos para reproducir
- Qué esperabas vs qué pasó
```

---

## 📞 Stack Trace Útil

```javascript
// 1. Usuario hace click
User: Click "Quitar Asignaciones"
↓
// 2. Estado se actualiza
State: showQuitarAsignacionModal = true
↓
// 3. Modal se renderiza
UI: <QuitarAsignacionMateriaGrado isOpen={true} />
↓
// 4. Usuario selecciona
User: Select grados → handleToggleGrado ejecuta
↓
// 5. Estado de grados se actualiza
State: selectedGrados = [1, 2]
↓
// 6. Usuario hace submit
User: Click "Quitar" → handleSubmit ejecuta
↓
// 7. Loop de deletions
For each grado:
  → axios.delete()
  → Esperar response
  → Contar éxitos/fallos
↓
// 8. Mostrar resultado
UI: setMessage({type, text, details})
↓
// 9. Usuario ve resultado
UI: Modal muestra resultado
↓
// 10. Cerrar o reintentar
User: Close o select more
```

---

**Última actualización**: Documento de troubleshooting completo