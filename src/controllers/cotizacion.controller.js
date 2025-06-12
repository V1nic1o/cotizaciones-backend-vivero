const { Cotizacion, DetalleCotizacion, Cliente } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { generarPDFCotizacion } = require('../services/pdfService');

const crearCotizacion = async (req, res) => {
  const { clienteId, productos, total } = req.body;

  try {
    const cotizacion = await Cotizacion.create({ clienteId, total });

    const detalles = productos.map(p => ({
      cotizacionId: cotizacion.id,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
      total: p.total,
      tipo: p.tipo || 'bien'
    }));

    await DetalleCotizacion.bulkCreate(detalles);

    res.status(201).json({ cotizacionId: cotizacion.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cotización' });
  }
};

const obtenerCotizaciones = async (req, res) => {
  try {
    const { clienteNombre, fechaDesde, fechaHasta, estado } = req.query;

    const where = {};
    const include = [
      {
        model: Cliente,
        where: clienteNombre
          ? { nombre: { [Op.iLike]: `%${clienteNombre}%` } }
          : undefined
      },
      { model: DetalleCotizacion }
    ];

    if (estado) where.estado = estado;
    if (fechaDesde && fechaHasta) {
      where.fecha = {
        [Op.between]: [new Date(fechaDesde), new Date(fechaHasta)]
      };
    }

    const cotizaciones = await Cotizacion.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });

    res.json(cotizaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await Cotizacion.update({ estado }, { where: { id } });
    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado de la cotización' });
  }
};

const descargarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findByPk(id);
    const cliente = await Cliente.findByPk(cotizacion.clienteId);
    const detalles = await DetalleCotizacion.findAll({ where: { cotizacionId: id } });

    const filePath = await generarPDFCotizacion(cotizacion, cliente, detalles);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('❌ Archivo PDF no disponible aún:', filePath);
        return res.status(500).json({ error: 'El archivo PDF aún no está listo' });
      }

      res.download(filePath, `cotizacion-${id}.pdf`);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
};

const editarCotizacion = async (req, res) => {
  const { id } = req.params;
  const { clienteId, productos, total } = req.body;

  try {
    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    await Cotizacion.update({ clienteId, total }, { where: { id } });

    await DetalleCotizacion.destroy({ where: { cotizacionId: id } });

    const nuevosDetalles = productos.map(p => ({
      cotizacionId: id,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
      total: p.total,
      tipo: p.tipo || 'bien'
    }));

    await DetalleCotizacion.bulkCreate(nuevosDetalles);

    res.json({ mensaje: 'Cotización actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al editar la cotización' });
  }
};

// ✅ NUEVA: Eliminar cotización
const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    await DetalleCotizacion.destroy({ where: { cotizacionId: id } });
    await Cotizacion.destroy({ where: { id } });

    res.json({ mensaje: 'Cotización eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la cotización' });
  }
};

module.exports = {
  crearCotizacion,
  obtenerCotizaciones,
  actualizarEstado,
  descargarPDF,
  editarCotizacion,
  eliminarCotizacion
};