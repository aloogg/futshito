// models/esquemas.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ==========================================
// 1. ESQUEMA DE USUARIOS
// ==========================================
const UsuarioSchema = new Schema({
  nombre_completo: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  foto: { type: String }, // Guardaremos la URL o Base64
  genero: { type: String, enum: ['M', 'F', 'Otro'] },
  pais_nacimiento: { type: String },
  nacionalidad: { type: String },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
  fecha_registro: { type: Date, default: Date.now },
  fecha_actualizacion: { type: Date }
});

// ==========================================
// 2. ESQUEMA DE CATEGORÍAS
// ==========================================
const CategoriaSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  fecha_creacion: { type: Date, default: Date.now }
});

// ==========================================
// 3. ESQUEMA DE PUBLICACIONES
// ==========================================
const PublicacionSchema = new Schema({
  // Relación con Usuario
  usuario: {
    _id: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String,
    foto: String
  },
  mundial: { type: String, required: true }, // Ej: "Qatar 2022"
  
  // Relación con Categoría
  categoria: {
    _id: { type: Schema.Types.ObjectId, ref: 'Categoria' },
    nombre: String
  },
  
  titulo: { type: String, required: true },
  contenido: String,
  multimedia: String, // URL de la imagen/video
  pais: String,
  aprobado: { type: Boolean, default: false },
  fecha_creacion: { type: Date, default: Date.now },
  fecha_aprobacion: Date,
  
  // Contadores para tus reportes rápidos
  contadores: {
    likes: { type: Number, default: 0 },
    comentarios: { type: Number, default: 0 },
    vistas: { type: Number, default: 0 }
  }
});

// ==========================================
// 4. ESQUEMA DE COMENTARIOS
// ==========================================
const ComentarioSchema = new Schema({
  id_publicacion: { type: Schema.Types.ObjectId, ref: 'Publicacion', required: true },
  usuario: {
    _id: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: String
  },
  comentario: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  reportado: { type: Boolean, default: false },
  estado: { type: String, enum: ['pendiente', 'aprobado', 'rechazado'], default: 'aprobado' }
});

// ==========================================
// 5. ESQUEMA DE LIKES
// ==========================================
const LikeSchema = new Schema({
  id_publicacion: { type: Schema.Types.ObjectId, ref: 'Publicacion' },
  id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  tipo: { type: String, enum: ['like', 'dislike'], default: 'like' },
  fecha: { type: Date, default: Date.now }
});

// ==========================================
// 6. ESQUEMA DE MUNDIALES
// ==========================================
const MundialSchema = new Schema({
  nombre: { type: String, required: true }, // Ej: Mexico 86
  anio: Number,
  sede: String,
  logo: String,
  descripcion: String
});

// ==========================================
// 7. ESQUEMA DE VISTAS
// ==========================================
const VistaSchema = new Schema({
    id_publicacion: { type: Schema.Types.ObjectId, ref: 'Publicacion' },
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // Puede ser null si no está logueado
    fecha: { type: Date, default: Date.now }
});

// Esquema para Datos Curiosos
const DatoCuriosoSchema = new Schema({
    texto: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});



// ==========================================
// EXPORTAR MODELOS
// ==========================================
module.exports = {
  Usuario: mongoose.model('Usuario', UsuarioSchema),
  Categoria: mongoose.model('Categoria', CategoriaSchema),
  Publicacion: mongoose.model('Publicacion', PublicacionSchema),
  Comentario: mongoose.model('Comentario', ComentarioSchema),
  Like: mongoose.model('Like', LikeSchema),
  Mundial: mongoose.model('Mundial', MundialSchema),
  Vista: mongoose.model('Vista', VistaSchema),
  DatoCurioso: mongoose.model('DatoCurioso', DatoCuriosoSchema)

};