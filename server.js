require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db'); // conexión a Neon

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Sincroniza los modelos con la base de datos en Neon
    await sequelize.sync({ alter: true }); // usa { force: true } solo si quieres borrar y recrear todo
    console.log('✅ Base de datos sincronizada con Neon');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
}

startServer();