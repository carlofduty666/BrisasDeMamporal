# 🎨 Quick Reference - Colores de Calificaciones v1.1

## Paleta en 60 Segundos

### 🔴 Rojo - No Presentó (0)
```
#FEE2E2 (Bg) │ #EF4444 (Borde) │ #B91C1C (Texto)
[NP]
```

### 🟠 Naranja - Bajo (< 10)
```
#FFEDD5 (Bg) │ #F97316 (Borde) │ #92400E (Texto)
[7]
```

### 🟡 Amarillo - Bien (10-15)
```
#FEFCE8 (Bg) │ #EABB08 (Borde) │ #713F12 (Texto)
[12]
```

### 🟢 Verde - Excelente (> 15)
```
#DCFCE7 (Bg) │ #22C55E (Borde) │ #166534 (Texto)
[18]
```

---

## Código (Copiar/Pegar)

```javascript
const colorMap = {
  'bg-red-100': {
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#EF4444'
  },
  'bg-green-100': {
    bg: '#DCFCE7',
    text: '#166534',
    border: '#22C55E'
  },
  'bg-yellow-100': {
    bg: '#FEFCE8',
    text: '#713F12',
    border: '#EABB08'
  },
  'bg-orange-100': {
    bg: '#FFEDD5',
    text: '#92400E',
    border: '#F97316'
  }
};
```

---

## Cambios en v1.1

| Color | ANTES | AHORA | Cambio |
|-------|-------|-------|--------|
| **Rojo** | #FCA5A5 | #EF4444 | Más visible |
| **Verde** | #86EFAC | #22C55E | Más visible |
| **Amarillo** | #FEF08A | #EABB08 | Ahora es amarillo (antes verde!) |
| **Naranja** | #FEEDBD | #FFEDD5 | Más anaranjado |
| **Naranja Borde** | #FED7AA | #F97316 | Mucho más naranja |

---

## Visual Quick Map

```
     0          10          15          20
     │          │           │           │
     v          v           v           v
   [NP]        [12]        [15]        [18]
    🔴          🟡          🟡          🟢
  ROJO        AMARILLO     AMARILLO    VERDE
```

---

## CSS Variables (Optional)

```css
:root {
  /* Rojo */
  --color-calif-red-bg: #FEE2E2;
  --color-calif-red-border: #EF4444;
  --color-calif-red-text: #B91C1C;

  /* Naranja */
  --color-calif-orange-bg: #FFEDD5;
  --color-calif-orange-border: #F97316;
  --color-calif-orange-text: #92400E;

  /* Amarillo */
  --color-calif-yellow-bg: #FEFCE8;
  --color-calif-yellow-border: #EABB08;
  --color-calif-yellow-text: #713F12;

  /* Verde */
  --color-calif-green-bg: #DCFCE7;
  --color-calif-green-border: #22C55E;
  --color-calif-green-text: #166534;
}
```

---

## Diferencias Clave

### ❌ vs ✅

```
ROJO:
❌ Border #FCA5A5 (suave)    → ✅ Border #EF4444 (visible)

VERDE:
❌ Border #86EFAC (suave)    → ✅ Border #22C55E (visible)

AMARILLO:
❌ Border #FEF08A (VERDE!)   → ✅ Border #EABB08 (AMARILLO!)

NARANJA:
❌ Bg #FEEDBD (amarillento)  → ✅ Bg #FFEDD5 (naranja)
❌ Border #FED7AA (claro)    → ✅ Border #F97316 (naranja)
```

---

## Testing Rápido

Verifica esto en el navegador:

```javascript
// DevTools Console
const badge = document.querySelector('[style*="backgroundColor"]');
const style = badge.getAttribute('style');
console.log(style);

// Debe mostrar algo como:
// background-color: rgb(254, 252, 232);
// border-color: rgb(234, 179, 8);
// color: rgb(113, 63, 18);
```

---

## Conversión RGB (Si Necesita)

```
Rojo:
  Bg: #FEE2E2 = rgb(254, 226, 226)
  Border: #EF4444 = rgb(239, 68, 68)
  Text: #B91C1C = rgb(185, 28, 28)

Naranja:
  Bg: #FFEDD5 = rgb(255, 237, 213)
  Border: #F97316 = rgb(249, 115, 22)
  Text: #92400E = rgb(146, 64, 14)

Amarillo:
  Bg: #FEFCE8 = rgb(254, 252, 232)
  Border: #EABB08 = rgb(234, 179, 8)
  Text: #713F12 = rgb(113, 63, 18)

Verde:
  Bg: #DCFCE7 = rgb(220, 252, 231)
  Border: #22C55E = rgb(34, 197, 94)
  Text: #166534 = rgb(22, 101, 52)
```

---

## Tailwind Mapping

Si usas Tailwind, mapean a:

```javascript
// Rojo usa Tailwind 50/500/800
bg-red-50   // #FEE2E2
bg-red-500  // #EF4444
text-red-800 // #B91C1C

// Verde usa Tailwind 50/500/800
bg-green-50    // #DCFCE7
bg-green-500   // #22C55E
text-green-800 // #166534

// Amarillo usa Tailwind 50/500/800
bg-yellow-50    // #FEFCE8
bg-yellow-500   // #EABB08
text-yellow-800 // #713F12

// Naranja usa Tailwind 50/500/800
bg-orange-50    // #FFEDD5
bg-orange-500   // #F97316
text-orange-900 // #92400E
```

---

## Implementación Rápida

**Archivo:** `MateriaDetailModal.jsx`  
**Líneas:** 731-768

Busca esto:
```javascript
const colorMap = {
```

Y verifica que tenga estos 4 colores con sus 3 valores (bg, text, border).

---

## Checklist Rápido

- [ ] Rojo = claro diferente de naranja
- [ ] Naranja = no amarillento
- [ ] Amarillo = distinto de naranja
- [ ] Verde = claramente verde
- [ ] Todos los bordes visibles
- [ ] No hay errores en consola

---

## Links Relacionados

📄 [PALETA_COLORES_CALIFICACIONES.md](./PALETA_COLORES_CALIFICACIONES.md) - Detalles completos  
📄 [CHECKLIST_COLORES_CALIFICACIONES.md](./CHECKLIST_COLORES_CALIFICACIONES.md) - Testing completo  
📄 [RESUMEN_EJECUTIVO_COLORES_v1.1.md](./RESUMEN_EJECUTIVO_COLORES_v1.1.md) - Resumen ejecutivo

---

**v1.1** | **2025-03-XX** | ⭐⭐⭐⭐⭐