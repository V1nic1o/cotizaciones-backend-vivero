const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacion.controller');

// Crear cotización
router.post('/', cotizacionController.crearCotizacion);

// Obtener cotizaciones (con filtros por query)
router.get('/', cotizacionController.obtenerCotizaciones);

// Descargar cotización como PDF
router.get('/pdf/:id', cotizacionController.descargarPDF);

// Actualizar estado de cotización
router.put('/estado/:id', cotizacionController.actualizarEstado);

// ✅ Editar una cotización completa
router.put('/:id', cotizacionController.editarCotizacion);

// ✅ Eliminar una cotización por ID
router.delete('/:id', cotizacionController.eliminarCotizacion);

module.exports = router;