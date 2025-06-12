const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const db = require('./config/db');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routes);

// Verificación de conexión a la base de datos
db.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos exitosa');

    // Sincronizar modelos
    sequelize.sync({ alter: true }) // Usa { force: true } si deseas borrar y recrear tablas (solo en desarrollo)
      .then(() => {
        console.log('📦 Modelos sincronizados con la base de datos');
      })
      .catch(err => {
        console.error('❌ Error al sincronizar modelos:', err);
      });

  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
  });

module.exports = app;