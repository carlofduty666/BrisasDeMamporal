# 🧪 Instrucciones para Probar la Sincronización

## ✅ Verificación Rápida

### 1. Verificar que no hay duplicados

**Opción A: Via Script**
```powershell
Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"
node debug-cupos.js
```

Deberías ver:
```
1er_año: A, B (sin duplicados) ✅
1er_grado: A, B, C (sin duplicados) ✅
```

**Opción B: Via API (asegúrate que servidor está corriendo)**
```
GET http://localhost:5000/api/cupos
```

---

## 🧪 Pruebas Funcionales

### Test 1: Crear Nueva Sección

**Descripción**: Cuando creas una sección, debe crearse automáticamente su cupo

**Pasos**:
1. Abre Postman/Insomnia o usa curl
2. POST a `http://localhost:5000/api/secciones`
```json
{
  "nombre_seccion": "D",
  "gradoID": 7,
  "capacidad": 25
}
```

3. Anota el ID de la nueva sección
4. Inmediatamente GET `http://localhost:5000/api/cupos/grado/7`
5. Verifica que aparece la nueva sección D con cupo

**Resultado Esperado**: ✅ La sección D aparece en la lista de cupos sin recargar

---

### Test 2: Actualizar Capacidad de Sección

**Descripción**: Cuando cambias la capacidad, el cupo se actualiza automáticamente

**Pasos**:
1. GET `http://localhost:5000/api/cupos/grado/7` (anota capacidad actual de A)
2. PUT a `http://localhost:5000/api/secciones/28` (ID de sección A de 1er_año)
```json
{
  "nombre_seccion": "A",
  "capacidad": 35
}
```

3. GET `http://localhost:5000/api/cupos/grado/7` nuevamente
4. Verifica que la capacidad de A cambió a 35

**Resultado Esperado**: ✅ Capacidad se actualiza automáticamente en cupos

---

### Test 3: Eliminar Sección

**Descripción**: Cuando eliminas una sección, sus cupos se eliminan automáticamente

**Pasos**:
1. Crea una sección de prueba (Test) como en Test 1
2. Anota su ID (ej: 100)
3. GET `http://localhost:5000/api/cupos` (cuenta total de cupos)
4. DELETE a `http://localhost:5000/api/secciones/100`
5. GET `http://localhost:5000/api/cupos` (cuenta total nuevamente)

**Resultado Esperado**: ✅ Total de cupos disminuye en 1

---

### Test 4: Verificar Deduplicación

**Descripción**: Si por error hay duplicados, se limpian automáticamente

**Pasos**:
1. GET `http://localhost:5000/api/cupos`
2. Busca si hay dos cupos con mismo `gradoID`, `seccionID` y `annoEscolarID`
3. Si los hay, la siguiente llamada debe mostrar solo uno

**Resultado Esperado**: ✅ API devuelve cupos sin duplicados

---

## 🔍 Verificación en Base de Datos

### Ver Secciones de un Grado (1er_año = gradoID 7)
```sql
SELECT id, nombre_seccion, gradoID, capacidad 
FROM Secciones 
WHERE gradoID = 7 
ORDER BY nombre_seccion;
```

**Debe mostrar**: 2 secciones (A, B)

### Ver Cupos de ese Grado
```sql
SELECT c.id, c.gradoID, c.seccionID, s.nombre_seccion, c.capacidad
FROM Cupos c
LEFT JOIN Secciones s ON c.seccionID = s.id
WHERE c.gradoID = 7
ORDER BY s.nombre_seccion;
```

**Debe mostrar**: 2 cupos (A, B) - exactamente igual que secciones

### Buscar Duplicados
```sql
SELECT gradoID, seccionID, annoEscolarID, COUNT(*) as cantidad
FROM Cupos
GROUP BY gradoID, seccionID, annoEscolarID
HAVING cantidad > 1;
```

**Debe mostrar**: 0 resultados (sin duplicados)

---

## 🎯 En la Interfaz (CuposManager)

### Escenario 1: Ver Cupos
1. Ve a CuposManager
2. Selecciona "1er Año"
3. Deberías ver exactamente: **Sección A** y **Sección B**
4. NO debe haber duplicados ni secciones faltantes

### Escenario 2: Crear Nueva Sección
1. Ve a SeccionesList
2. Crea una sección nueva en "1er Año" (ej: "C", capacidad 20)
3. Sin refrescar la página, ve a CuposManager
4. Selecciona "1er Año" nuevamente
5. La nueva sección **C** debe aparecer automáticamente ✅

### Escenario 3: Cambiar Capacidad
1. Ve a SeccionesList
2. Edita "Sección A" de 1er Año, cambia capacidad a 50
3. Ve a CuposManager
4. Selecciona "1er Año"
5. La capacidad de **Sección A** en cupos debe ser 50 ✅

---

## 🚨 Troubleshooting

### Problema: Aún ves duplicados

**Solución**: Ejecuta el script de limpieza
```powershell
Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"
node clean-duplicate-cupos.js
```

### Problema: Falta una sección en cupos

**Solución**: Ejecuta sincronización
```powershell
Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"
node sync-cupos-secciones.js
```

### Problema: Datos inconsistentes (gradoID, capacidad)

**Solución**: Ejecuta corrección
```powershell
Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"
node fix-cupos-inconsistencia.js
```

---

## 📊 Estadísticas Esperadas

Después de la sincronización:
- **Total de cupos en BD**: 16
- **Total de secciones en BD**: 16
- **Duplicados**: 0
- **Cupos huérfanos**: 0
- **Inconsistencias**: 0

```
1er_grado: A, B, C (3 cupos)
1er_año: A, B (2 cupos)
2do_grado: U (1 cupo)
2do_año: A, B, U (3 cupos)
3er_grado: U (1 cupo)
3er_año: U (1 cupo)
4to_grado: U (1 cupo)
4to_año: U (1 cupo)
5to_grado: U (1 cupo)
5to_año: U (1 cupo)
6to_grado: U (1 cupo)
```

---

## ✅ Checklist de Validación

- [ ] Base de datos sincronizada (no hay duplicados)
- [ ] CuposManager muestra secciones correctas
- [ ] Nueva sección aparece automáticamente en cupos
- [ ] Cambio de capacidad se refleja en cupos
- [ ] Eliminación de sección elimina su cupo
- [ ] API `/cupos` no devuelve duplicados
- [ ] API `/cupos/grado/:id` sincroniza automáticamente

---

## 🎉 ¡Todo Listo!

Si todos los tests pasan, la sincronización de Cupos y Secciones está completamente funcional ✅

**Estado Actual**:
- ✅ Backend sincroniza automáticamente
- ✅ Deduplicación en todas las respuestas
- ✅ Base de datos limpia
- ✅ Sistema tolerante a fallos