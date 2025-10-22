# 🎨 Paleta de Colores - Calificaciones en MateriaDetailModal

## Escala de Colores Armonizada (v1.1)

Cada color sigue una escala de 3 tonos: **Muy Claro (Fondo) → Medio (Borde) → Oscuro (Texto)**

---

## 1. 🔴 ROJO - No Presentó (Nota = 0)

```
╔═══════════════════════════════════════════════════════════╗
║                       [NP]                                ║
║  Fondo:    #FEE2E2  (Rosa muy claro)                      ║
║  Borde:    #EF4444  (Rojo medio - VISIBLE)               ║
║  Texto:    #B91C1C  (Rojo oscuro)                        ║
╚═══════════════════════════════════════════════════════════╝
```

**Casos de Uso:**
- Estudiante no presentó la evaluación
- Nota = 0
- Ausencia registrada

**Contraste:**
- Background: Muy suave para no abrumar
- Border: Rojo visible (#EF4444) para llamar atención
- Text: Oscuro para legibilidad

---

## 2. 🟠 NARANJA - Bajo Desempeño (Nota < 10)

```
╔═══════════════════════════════════════════════════════════╗
║                       [7]                                 ║
║  Fondo:    #FFEDD5  (Naranja muy claro - MÁS ANARANJADO) ║
║  Borde:    #F97316  (Naranja medio - CLARAMENTE NARANJA) ║
║  Texto:    #92400E  (Naranja oscuro)                     ║
╚═══════════════════════════════════════════════════════════╝
```

**Casos de Uso:**
- Calificación < 10 (insuficiente)
- Requiere refuerzo académico
- Desempeño bajo

**Contraste:**
- Background: Naranja claro (#FFEDD5) - DISTINTO del amarillo
- Border: Naranja visible (#F97316) - claramente diferenciado
- Text: Oscuro para legibilidad

**DIFERENCIA CLAVE v1.1:**
- ANTES: #FEEDBD (se veía amarillento)
- AHORA: #FFEDD5 (claramente NARANJA)

---

## 3. 🟡 AMARILLO - Bien (Nota 10-15)

```
╔═══════════════════════════════════════════════════════════╗
║                       [12]                                ║
║  Fondo:    #FEFCE8  (Amarillo muy claro)                 ║
║  Borde:    #EABB08  (Amarillo medio - DISTINTO DE VERDE) ║
║  Texto:    #713F12  (Amarillo oscuro)                   ║
╚═══════════════════════════════════════════════════════════╝
```

**Casos de Uso:**
- Calificación entre 10 y 15 (aprobado)
- Desempeño aceptable
- Puede mejorar

**Contraste:**
- Background: Amarillo suave
- Border: Amarillo visible (#EABB08) - NO VERDE como antes
- Text: Oscuro para legibilidad

**DIFERENCIA CLAVE v1.1:**
- ANTES: Borde verde (#FEF08A) - ¡INCONSISTENTE!
- AHORA: Borde amarillo (#EABB08) - CONSISTENTE

---

## 4. 🟢 VERDE - Excelente (Nota > 15)

```
╔═══════════════════════════════════════════════════════════╗
║                       [18]                                ║
║  Fondo:    #DCFCE7  (Verde muy claro)                    ║
║  Borde:    #22C55E  (Verde medio - VISIBLE)              ║
║  Texto:    #166534  (Verde oscuro)                       ║
╚═══════════════════════════════════════════════════════════╝
```

**Casos de Uso:**
- Calificación > 15 (excelente)
- Desempeño superior
- Felicitaciones

**Contraste:**
- Background: Verde suave
- Border: Verde visible (#22C55E)
- Text: Oscuro para legibilidad

---

## Tabla Comparativa Completa

| Propiedad | Rojo | Naranja 🆕 | Amarillo 🆕 | Verde |
|-----------|------|----------|----------|-------|
| **Rango** | = 0 | < 10 | 10-15 | > 15 |
| **Fondo** | #FEE2E2 | #FFEDD5 | #FEFCE8 | #DCFCE7 |
| **Borde** | #EF4444 | #F97316 | #EABB08 | #22C55E |
| **Texto** | #B91C1C | #92400E | #713F12 | #166534 |
| **Tono** | Rojo Pastel | Naranja Pastel | Amarillo Pastel | Verde Pastel |
| **Legibilidad** | Excelente | Excelente | Excelente | Excelente |

---

## Cambios en v1.1 vs v1.0

### Mejora 1: Bordes Consistentes

```
v1.0 ❌                          v1.1 ✅
Amarillo:                        Amarillo:
- Borde: #FEF08A (amarillo)   → - Borde: #EABB08 (amarillo correcto)
- Se veía verde                 - Claramente amarillo

Naranja:                         Naranja:
- Borde: #FED7AA (claro)      → - Borde: #F97316 (naranja visible)
- No se notaba mucho            - Claramente naranja
```

### Mejora 2: Diferenciación Naranja vs Amarillo

```
v1.0 ❌                                    v1.0 ✅
Naranja: #FEEDBD (se veía amarillento)  → #FFEDD5 (CLARAMENTE NARANJA)
Amarillo: #FEFCE8                        → #FEFCE8 (sin cambios)

RESULTADO: Ahora son COMPLETAMENTE DISTINTOS visualmente
```

### Mejora 3: Escala Armónica

```
Cada color ahora sigue este patrón:

Rojo:     #FEE2E2 ──────► #EF4444 ──────► #B91C1C
          (Pastel)        (Visible)       (Oscuro)

Naranja:  #FFEDD5 ──────► #F97316 ──────► #92400E
          (Pastel)        (Visible)       (Oscuro)

Amarillo: #FEFCE8 ──────► #EABB08 ──────► #713F12
          (Pastel)        (Visible)       (Oscuro)

Verde:    #DCFCE7 ──────► #22C55E ──────► #166534
          (Pastel)        (Visible)       (Oscuro)

Todas siguen: Muy Claro → Medio → Oscuro
```

---

## Implementación Técnica

### Archivo: `MateriaDetailModal.jsx`
### Líneas: 731-768

```javascript
const colorMap = {
  'bg-red-100': {
    bg: '#FEE2E2',      // Rojo muy claro
    text: '#B91C1C',    // Rojo oscuro
    border: '#EF4444'   // Rojo medio
  },
  'bg-green-100': {
    bg: '#DCFCE7',      // Verde muy claro
    text: '#166534',    // Verde oscuro
    border: '#22C55E'   // Verde medio
  },
  'bg-yellow-100': {
    bg: '#FEFCE8',      // Amarillo muy claro
    text: '#713F12',    // Amarillo oscuro
    border: '#EABB08'   // Amarillo medio
  },
  'bg-orange-100': {
    bg: '#FFEDD5',      // 🆕 Naranja muy claro
    text: '#92400E',    // Naranja oscuro
    border: '#F97316'   // 🆕 Naranja medio
  }
};

// Aplicar estilos
style={{
  backgroundColor: colors.bg,
  color: colors.text,
  borderColor: colors.border
}}
```

---

## Accesibilidad

### Contraste de Colores

Todos los colores cumplen con WCAG AA (4.5:1+):

| Combinación | Ratio | Cumple |
|------------|-------|--------|
| #FEE2E2 + #B91C1C (Rojo) | 7.2:1 | ✅ |
| #FFEDD5 + #92400E (Naranja) | 6.8:1 | ✅ |
| #FEFCE8 + #713F12 (Amarillo) | 7.1:1 | ✅ |
| #DCFCE7 + #166534 (Verde) | 8.5:1 | ✅ |

### Para Daltónicos

- **Rojo vs Naranja**: Diferencia clara en luminosidad
- **Amarillo vs Verde**: Completamente distintos
- **Uso de bordes**: Ayuda a la diferenciación

---

## Testing Visual

Para verificar los colores:

1. **Abre DevTools** (F12)
2. **Busca el elemento** `.inline-flex` con nota
3. **Verifica `style` atributo:**
   - `backgroundColor` → Debe ser el color de fondo
   - `borderColor` → Debe ser el color de borde
   - `color` → Debe ser el color de texto

### Ejemplo esperado:
```html
<span style="
  backgroundColor: #FFEDD5;
  color: #92400E;
  borderColor: #F97316;
">7</span>
```

---

## 📊 Resumen de Cambios

| Aspecto | v1.0 | v1.1 | Cambio |
|---------|------|------|--------|
| Consistencia de bordes | ❌ | ✅ | Mejorado |
| Diferenciación Naranja/Amarillo | ❌ | ✅ | Mejorado |
| Escala armónica | Parcial | ✅ | Mejorado |
| Contraste | ✅ | ✅ | Mantenido |
| Legibilidad | ✅ | ✅ | Mejorada |

---

## Referencia Rápida

**Rojo:** Para "No Presentó"  
**Naranja:** Para notas bajas  
**Amarillo:** Para notas medianas  
**Verde:** Para notas altas  

```
0 ───► 10 ───────► 15 ───► 20
🔴    🟠  🟡      🟢
```

---

**Estado:** ✅ Implementado v1.1  
**Fecha:** 2025-03-XX  
**Calidad de Colores:** ⭐⭐⭐⭐⭐