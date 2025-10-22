# 🧪 Testing: Indicador de Transferencia de Sección

## 📋 Escenarios de Testing

### Escenario 1: Verificar Carga de Secciones
**Objetivo:** Confirmar que las secciones se cargan correctamente

**Pasos:**
1. Ir a Materias → Abrir una materia
2. Expandir una evaluación con calificaciones
3. Revisar la consola del navegador (F12 → Console)

**Resultados Esperados:**
```
✅ No hay errores en la consola
✅ Aparece el mensaje: "Calificaciones para evaluación [ID]: [datos]"
✅ Se cargan las secciones de los estudiantes
```

---

### Escenario 2: Verificar Visualización de Sección Actual
**Objetivo:** Confirmar que la sección actual se muestra correctamente

**Pasos:**
1. Abrir una evaluación expandida
2. Buscar una tarjeta de calificación
3. Verificar que aparezca "Sección actual: [Nombre]" bajo la cédula

**Resultados Esperados:**
```
Nombre del estudiante
C.I: 28456789

Sección actual: A           ← Debe aparecer aquí
```

**Condiciones:**
- ✅ Se ve debajo de la cédula
- ✅ Texto es pequeño (xs)
- ✅ Color gris
- ✅ El nombre de la sección es correcto

---

### Escenario 3: Verificar Aviso de Transferencia
**Objetivo:** Confirmar que el aviso se muestra cuando hay transferencia

**Requisito previo:**
- Tener un estudiante que fue transferido de sección
- El estudiante debe tener calificaciones de su sección anterior

**Pasos:**
1. Abrir una evaluación donde el estudiante tenía una sección diferente
2. Buscar la tarjeta del estudiante transferido

**Resultados Esperados:**
```
Nombre del estudiante
C.I: 28456789

Sección actual: B

┌──────────────────────────────────────────┐
│ ⚠️ Este alumno fue transferido a la     │
│ sección B                                │
│ Esta calificación es de su sección      │
│ anterior: A                              │
└──────────────────────────────────────────┘

Nota: [15]
```

**Condiciones:**
- ✅ Fondo naranja claro (`bg-orange-50`)
- ✅ Borde naranja suave
- ✅ Icono de flecha naranja
- ✅ Texto naranja oscuro
- ✅ Nombre de secciones correctos
- ✅ Mensaje claro y legible

---

### Escenario 4: Verificar Sin Transferencia
**Objetivo:** Confirmar que NO aparece aviso cuando no hay transferencia

**Requisito previo:**
- Tener un estudiante que NO ha sido transferido
- El estudiante debe tener calificaciones de su sección actual

**Pasos:**
1. Abrir una evaluación de la sección actual
2. Buscar la tarjeta del estudiante sin transferencia

**Resultados Esperados:**
```
Nombre del estudiante
C.I: 28456789

Sección actual: A

Nota: [14]
```

**Condiciones:**
- ✅ Se muestra la sección actual
- ✅ NO aparece aviso naranja
- ✅ NO aparece el texto de transferencia

---

### Escenario 5: Verificar Sin Información de Sección
**Objetivo:** Confirmar que se maneja correctamente cuando no hay datos de sección

**Pasos:**
1. Abrir una evaluación
2. Buscar una tarjeta donde no se cargó la sección

**Resultados Esperados:**
```
Nombre del estudiante
C.I: 28456789

Nota: [12]
```

**Condiciones:**
- ✅ No muestra "Sección actual: [?]"
- ✅ No muestra aviso naranja
- ✅ No hay errores en consola
- ✅ Se muestra la nota normalmente

---

## 🔍 Checks Detallados

### Performance
```
⏱️ Tiempo de carga de secciones: < 2 segundos
⏱️ No congela la interfaz
⏱️ Las tarjetas se renderizan sin lag
✅ La carga es paralela (todas las secciones a la vez)
```

### Datos
```
✅ Los nombres de secciones son correctos
✅ Los IDs de secciones coinciden
✅ Las comparaciones de IDs funcionan
✅ No hay duplicados en seccionesEstudiantes
```

### UI/UX
```
✅ Colores visibles y legibles
✅ Iconos aparecen correctamente
✅ Texto no se corta (responsive)
✅ Aviso se ve destacado
✅ No hay overlaps ni desalineaciones
```

### API Calls
```
Verificar en Network Tab (F12 → Network):
✅ GET /secciones/estudiante/[ID]?annoEscolarID=[ID] ← Por cada estudiante
✅ Status: 200 (exitoso)
✅ Response contiene array de secciones
✅ Headers incluyen Authorization token
```

---

## 🐛 Debugging

### Si NO aparece la sección actual:

**Revisar:**
```javascript
// F12 → Console
console.log('seccionesEstudiantes:', window.seccionesEstudiantes)
// Debería mostrar un objeto con los datos
```

**Causas posibles:**
- ❌ Endpoint no responde
- ❌ Token inválido
- ❌ No hay datos en la base de datos
- ❌ `annoEscolarID` incorrecto

**Solución:**
1. Abrir Network (F12 → Network)
2. Filtrar por "estudiante"
3. Revisar que la request sea exitosa (200)
4. Ver el response en la pestaña Response

---

### Si aparece error en consola:

**Comando para revisar:**
```javascript
// F12 → Console
// Copiar y pegar:
fetch('/secciones/estudiante/1?annoEscolarID=1', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log(d))
```

---

## 📊 Casos de Prueba

### Test Case 1: Estudiante con Sección Única
```
Entrada: Estudiante ID = 1, Solo en sección A
Salida Esperada:
- Sección actual: A
- Sin aviso de transferencia
Estado: ✅ PASS
```

### Test Case 2: Estudiante Transferido
```
Entrada: Estudiante ID = 2, Pasó de sección A a B
Salida Esperada:
- Sección actual: B
- Aviso: "...fue transferido a la sección B"
- Mención: "...sección anterior: A"
Estado: ✅ PASS
```

### Test Case 3: Estudiante Sin Sección
```
Entrada: Estudiante ID = 3, Sin asignación de sección
Salida Esperada:
- No muestra "Sección actual: ?"
- No muestra aviso
- Se ve normal la tarjeta
Estado: ✅ PASS
```

### Test Case 4: Múltiples Transferencias
```
Entrada: 5 estudiantes, 3 transferidos, 2 no
Salida Esperada:
- 3 tarjetas con aviso naranja
- 2 tarjetas sin aviso
- Todos cargan en paralelo
Estado: ✅ PASS
```

---

## ✅ Checklist de Verificación

Antes de completar el testing:

- [ ] Secciones actuales se muestran en todas las tarjetas
- [ ] Aviso naranja aparece solo cuando hay transferencia
- [ ] Los nombres de secciones son correctos
- [ ] No hay errores en consola
- [ ] Responsive en móvil, tablet, desktop
- [ ] Performance acceptable (< 2 seg)
- [ ] API calls son exitosas
- [ ] Estilos se ven correctos
- [ ] Texto es legible
- [ ] Sin glitches visuales

---

## 🚀 Pasos Finales

1. **Verificar Funcionamiento Básico**
   ```
   - Abrir materia
   - Expandir evaluación
   - Ver secciones cargadas
   ```

2. **Verificar Casos Especiales**
   ```
   - Estudiante transferido
   - Estudiante sin transferencia
   - Estudiante sin sección
   ```

3. **Revisar Console**
   ```
   F12 → Console
   Buscar: "Error" o "undefined"
   Resultado: Ninguno
   ```

4. **Revisar Network**
   ```
   F12 → Network
   Filtrar: estudiante
   Verificar: Status 200, Response válido
   ```

5. **Prueba de Responsividad**
   ```
   F12 → Toggle Device Toolbar
   Probar: Mobile, Tablet, Desktop
   Verificar: Todo se ve bien
   ```

---

## 📞 Reportar Problemas

Si encuentra algún problema:

1. Describe el paso exacto donde falla
2. Captura de pantalla o video
3. Revisa la consola (F12 → Console)
4. Copia el error exacto
5. Verifica los datos en Network

**Ejemplo de reporte:**
```
Problema: El aviso naranja no aparece para estudiantes transferidos
Paso reproducible: 
  1. Abrir materia de Matemáticas
  2. Expandir evaluación "Quiz 1"
  3. Ver tarjeta de estudiante "Carlos Rodríguez"
Error en consola: [TypeError: Cannot read property 'nombre_seccion' of undefined]
Expected: Aviso naranja con información de transferencia
```
