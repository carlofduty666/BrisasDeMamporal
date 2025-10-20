# ✅ Checklist de Validación - Quitar Asignaciones

## 📋 Pre-Validación (Antes de Testing)

### Backend
- [ ] Archivo `materias.controller.js` modificado
- [ ] Método `eliminarMateriaDeGrado()` tiene validaciones
- [ ] Ruta DELETE existe en `materias.routes.js`
- [ ] Servidor reiniciado: `node server.js`

### Frontend
- [ ] Archivo `QuitarAsignacionMateriaGrado.jsx` creado
- [ ] Archivo `MateriaDetail.jsx` modificado con imports
- [ ] Archivo `MateriasList.jsx` actualizado con annoEscolar
- [ ] Proyecto compilado sin errores: `npm run dev`

---

## 🧪 Test 1: Interfaz Base

### Localización
- [ ] Navegar a: `Materias → Click en materia`
- [ ] Se abre modal MateriaDetail
- [ ] En sección "Filtros" existe botón rojo "Quitar Asignaciones"

### Visibilidad
- [ ] Botón tiene icono de papelera 🗑️
- [ ] Botón tiene texto "Quitar Asignaciones"
- [ ] Botón está alineado a la derecha
- [ ] Botón tiene tema rojo (gradiente)

---

## 🧪 Test 2: Abrir Modal

### Acción
- [ ] Click en "Quitar Asignaciones"

### Validación
- [ ] Se abre modal con título "Quitar Asignaciones"
- [ ] Modal tiene borde rojo (2px)
- [ ] Modal tiene header con gradiente rojo
- [ ] Modal tiene icono de papelera en header
- [ ] Modal tiene nombre de la materia
- [ ] Modal tiene botón X para cerrar

### Contenido
- [ ] Se muestra sección informativa (azul)
- [ ] Se muestra "Información importante:" con advertencia
- [ ] Se lista "Grados a quitar"
- [ ] Grados están agrupados por nivel (Primaria/Secundaria)

---

## 🧪 Test 3: Selección de Grados

### Estructura
- [ ] Se muestra lista de grados asignados
- [ ] Hay checkbox antes de cada grado
- [ ] Cada grado muestra su nombre completo
- [ ] Existe botón "Marcar Todo"

### Interacción
- [ ] Click checkbox: Se selecciona/deselecciona
- [ ] Click "Marcar Todo": Se seleccionan todos
- [ ] Click "Marcar Todo" de nuevo: Se desseleccionan todos
- [ ] Contador se actualiza en botón "Quitar (N)"

---

## 🧪 Test 4: Sin Evaluaciones (ÉXITO)

### Setup
```
Pre-requisito: Un grado asignado sin evaluaciones
```

### Ejecución
- [ ] Abrir modal "Quitar Asignaciones"
- [ ] Seleccionar un grado sin evaluaciones
- [ ] Click botón "Quitar (1)"

### Resultado
- [ ] API llama a DELETE correctamente
- [ ] Se muestra mensaje verde: "✓ 1 asignación(es) eliminada(s)"
- [ ] Modal cierra automáticamente (o después de 1.5s)
- [ ] MateriaDetail se recarga
- [ ] Grado ya no aparece en la lista

---

## 🧪 Test 5: Con Evaluaciones (BLOQUEADO)

### Setup
```
Pre-requisito: Un grado con materia que tiene evaluaciones registradas
```

### Ejecución
- [ ] Abrir modal "Quitar Asignaciones"
- [ ] Seleccionar grado que tiene evaluaciones
- [ ] Click botón "Quitar (1)"

### Resultado API
- [ ] API retorna error 409 (Conflict)
- [ ] Response contiene: `evaluacionesCount: N`
- [ ] Response contiene mensaje descriptivo

### Resultado UI
- [ ] Se muestra caja roja con advertencia
- [ ] Se muestra: "No se puede eliminar..."
- [ ] Se muestra número de evaluaciones
- [ ] Se sugiere: "Marque la materia como inactiva..."
- [ ] Modal NO cierra
- [ ] Selección se mantiene

---

## 🧪 Test 6: Selección Múltiple Parcial

### Setup
```
Pre-requisito: Múltiples grados, algunos con evaluaciones
```

### Ejecución
- [ ] Abrir modal
- [ ] Seleccionar 3 grados (2 sin evaluaciones, 1 con)
- [ ] Click "Quitar (3)"

### Resultado
- [ ] Se procesan los 3
- [ ] 2 se eliminan correctamente ✅
- [ ] 1 se rechaza por evaluaciones ❌
- [ ] Se muestra mensaje: "2 eliminadas, 1 rechazada"
- [ ] Se muestra detalle de la que fue rechazada
- [ ] Se indica qué grado fue rechazado y por qué

---

## 🧪 Test 7: Validaciones UI

### Sin Selección
- [ ] Botón "Quitar" está disabled
- [ ] Click en botón disabled: No hace nada
- [ ] Seleccionar 1: Botón se activa
- [ ] Click: Muestra advertencia amarilla

### Mensajes
- [ ] Advertencia: "Selecciona al menos un grado"
- [ ] Éxito: Verde con checkmark ✓
- [ ] Error: Rojo con exclamación ⚠️
- [ ] Info: Azul con círculo ℹ️

---

## 🧪 Test 8: Usabilidad

### Cerrar Modal
- [ ] Botón X cierra modal
- [ ] Click fuera del modal cierra (backdrop)
- [ ] Tecla ESC cierra modal
- [ ] Botón "Cancelar" cierra modal

### Estados de Carga
- [ ] Durante eliminación: Botón muestra spinner
- [ ] Durante eliminación: Botón dice "Eliminando..."
- [ ] Durante eliminación: No se puede hacer click de nuevo

### Feedback
- [ ] Cada acción tiene feedback visual
- [ ] Mensajes se limpian al seleccionar otro grado
- [ ] Los errores de un grado no afectan los demás

---

## 🧪 Test 9: Agrupación por Nivel

### Visualización
- [ ] Grados agrupados por nivel
- [ ] Título "Primaria" visible
- [ ] Título "Secundaria" visible
- [ ] Línea vertical izquierda en cada grupo

### Orden
- [ ] Primaria aparece primero
- [ ] Secundaria aparece después
- [ ] Dentro de cada nivel: Orden correcto

---

## 🧪 Test 10: Integración

### Flujo Completo
```
1. MateriasList → Ver Materia → MateriaDetail abierto
   ✅ annoEscolar se pasa correctamente
   
2. MateriaDetail → Botón "Quitar Asignaciones"
   ✅ Modal se abre correctamente
   
3. Modal → Seleccionar → Confirmar
   ✅ API recibe datos correctamente
   
4. API → Valida → Responde
   ✅ Response es procesada correctamente
   
5. Modal → Cierra → Recarga
   ✅ Cambios se reflejan en UI
```

---

## 🚀 Test de Estrés

### Muchas Selecciones
- [ ] Seleccionar todos los grados
- [ ] Click "Quitar"
- [ ] Procesa todos sin error

### Múltiples Intentos
- [ ] Error → Intentar de nuevo
- [ ] Modal se recupera correctamente
- [ ] Sin memory leaks

### Errores de Red
- [ ] Simular timeout (dev tools)
- [ ] Error se muestra correctamente
- [ ] Usuario puede reintentar

---

## 📱 Test Responsivo

### Desktop
- [ ] Botón alineado correctamente
- [ ] Modal se centra
- [ ] Todos los elementos visibles

### Tablet
- [ ] Botón responsive
- [ ] Modal se adapta
- [ ] Scroll funciona

### Mobile
- [ ] Modal ocupa ancho correcto
- [ ] Botones son clickeables
- [ ] Textos legibles

---

## 🔒 Test de Seguridad

### Autenticación
- [ ] Token se envía en headers
- [ ] Sin token: Error 401
- [ ] Token inválido: Error 401

### Validación de Datos
- [ ] IDs numéricos válidos
- [ ] IDs inválidos: Error 400
- [ ] Sin parámetros: Error 400

---

## 📊 Test de Performance

### Carga Inicial
- [ ] Modal abre en <500ms
- [ ] Grados se renderizan en <1s
- [ ] Sin lag en selección

### Operaciones
- [ ] DELETE toma <2s normalmente
- [ ] Múltiples elimina <5s total
- [ ] UI responsiva durante operación

---

## 🎨 Test Visual

### Colores
- [ ] Header: Gradiente rojo oscuro
- [ ] Cards: Fondo rojo claro (50)
- [ ] Info: Azul con borde azul
- [ ] Success: Verde con borde verde
- [ ] Error: Rojo con borde rojo

### Iconos
- [ ] Papelera: Visible en header
- [ ] Papelera: Visible en botón
- [ ] Checkmark: Visible en éxito
- [ ] Exclamación: Visible en error

### Espaciado
- [ ] Padding consistente
- [ ] Márgenes correctos
- [ ] Alineación profesional

---

## 📝 Logs y Consola

### Browser Console
- [ ] No hay errores
- [ ] No hay warnings
- [ ] Request/Response logs correctos

### Network Tab
- [ ] DELETE request enviado
- [ ] Status 200/409 recibido
- [ ] Payload correcto

### Backend Logs
- [ ] Endpoint accedido
- [ ] Validaciones ejecutadas
- [ ] Response enviada

---

## ✨ Post-Validación

### Documentación
- [ ] README actualizado (si corresponde)
- [ ] Cambios documentados
- [ ] Guía de usuario disponible

### Cleanup
- [ ] No hay código comentado muerto
- [ ] No hay console.logs de debug
- [ ] Variables sin usar eliminadas

### Compatibilidad
- [ ] Funciona en Chrome ✅
- [ ] Funciona en Firefox ✅
- [ ] Funciona en Safari ✅
- [ ] Funciona en Edge ✅

---

## 🏁 Resultado Final

### Criterios de Aceptación
- [ ] Backend: Todas las validaciones funcionan
- [ ] Frontend: Modal se abre y cierra correctamente
- [ ] Integración: Flujo completo funciona
- [ ] Errores: Se manejan correctamente
- [ ] UI: Está acorde al diseño
- [ ] Performance: Sin lag
- [ ] Seguridad: Token validado

### Firmado
- [ ] Desarrollador valida: _____________
- [ ] QA verifica: _____________
- [ ] Listo para producción: ✅

---

## 📞 Soporte

### Si algo falla

**Problema**: Modal no abre
```
Verificar: annoEscolar se pasa correctamente desde MateriasList
Solución: console.log(annoEscolar) en MateriaDetail
```

**Problema**: Error 409 pero sin evalua
```
Verificar: Tabla Evaluaciones tiene registros
Solución: Revisar query en backend
```

**Problema**: Botón deshabilitado
```
Verificar: selectedGrados tiene longitud > 0
Solución: Revisar handleToggleGrado
```

---

**Estado de Validación**: 📋 Checklist disponible para pruebas