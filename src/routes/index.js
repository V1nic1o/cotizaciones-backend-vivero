const express = require('express');
const router = express.Router();

const clienteRoutes = require('./cliente.routes');
const cotizacionRoutes = require('./cotizacion.routes');

router.use('/clientes', clienteRoutes);
router.use('/cotizaciones', cotizacionRoutes);

module.exports = router;