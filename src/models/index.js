const sequelize = require('../config/db');
const Cliente = require('./cliente.model');
const Cotizacion = require('./cotizacion.model');
const DetalleCotizacion = require('./detalleCotizacion.model');

// Relaciones
Cliente.hasMany(Cotizacion, { foreignKey: 'clienteId', onDelete: 'CASCADE' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'clienteId' });

Cotizacion.hasMany(DetalleCotizacion, { foreignKey: 'cotizacionId', onDelete: 'CASCADE' });
DetalleCotizacion.belongsTo(Cotizacion, { foreignKey: 'cotizacionId' });

module.exports = {
  sequelize,
  Cliente,
  Cotizacion,
  DetalleCotizacion
};