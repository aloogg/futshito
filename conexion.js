// conexion.js
const mongoose = require('mongoose');

// Cambia 'bd_capamundial' por el nombre que quieras para tu base real
const url = 'mongodb://127.0.0.1:27017/bd_capamundial';

const conectarDB = async () => {
  try {
    // Mongoose se encarga de la magia de la conexión
    await mongoose.connect(url);
    console.log('¡Conexión exitosa con Mongoose!');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    process.exit(1); // Detiene la app si no hay base de datos
  }
};

module.exports = conectarDB;