const mongoose = require('mongoose');

const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bd_capamundial';

const conectarDB = async () => {
  try {
    // Si la URL es la de Atlas, tardará un poquito más en conectar
    await mongoose.connect(url);
    console.log('¡Conexión exitosa a MongoDB!');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
};

module.exports = conectarDB;