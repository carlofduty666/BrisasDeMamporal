const express = require('express');
const router = express.Router();
const contabilidad = require('../controllers/contabilidad.controller');

// Totales por mes (solo pagos aprobados). Criterio por defecto: obligacion
router.get('/contabilidad/totales-mes', contabilidad.totalesMensuales);

// Totales por año escolar (secuencia de meses del AE). Solo aprobados
router.get('/contabilidad/totales-anio', contabilidad.totalesAnuales);

module.exports = router;