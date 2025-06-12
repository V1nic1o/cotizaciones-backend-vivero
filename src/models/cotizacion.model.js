const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cotizacion = sequelize.define('Cotizacion', {
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'cotizaciones',
  timestamps: true
});

module.exports = Cotizacion;