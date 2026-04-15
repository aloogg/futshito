const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose'); 
const conectarDB = require('./conexion'); 

// IMPORTANTE: Importamos TODOS los modelos AQUÍ una sola vez
const { Usuario, Publicacion, Categoria, Like, Comentario, Mundial, DatoCurioso } = require('./App/models/esquemas');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar dónde se guardan las fotos (Public/uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'Public', 'uploads')); 
    },
    filename: function (req, file, cb) {
        // Nombre único: fecha + nombre original
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Conectar a Mongo
conectarDB();

// Archivos Estáticos
app.use('/Public', express.static(path.join(__dirname, 'Public')));
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));

// ==========================================
// 2. RUTAS DE PÁGINAS
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/nueva.html', (req, res) => res.sendFile(path.join(__dirname, 'nueva.html')));
app.get('/nueva-cuenta', (req, res) => res.sendFile(path.join(__dirname, 'nueva.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/perfil.html', (req, res) => res.sendFile(path.join(__dirname, 'perfil.html')));
app.get('/gestion-usuarios.html', (req, res) => res.sendFile(path.join(__dirname, 'gestion-usuarios.html')));


// ==========================================
// 3. API: USUARIOS
// ==========================================

// Registrar
app.post('/api/registrar', upload.single('foto'), async (req, res) => {
    try {
        console.log("Procesando registro...");
        const nuevoUsuario = new Usuario({
            nombre_completo: req.body.nombreCompleto,
            fecha_nacimiento: req.body.fechaNacimiento,
            genero: req.body.genero,
            pais_nacimiento: req.body.paisNacimiento,
            nacionalidad: req.body.nacionalidad,
            correo: req.body.email,
            contrasena: req.body.password,
            foto: req.file ? `/Public/uploads/${req.file.filename}` : null
        });

        await nuevoUsuario.save();
        res.json({ mensaje: '¡Usuario registrado exitosamente!', exito: true });

    } catch (error) {
        console.error("Error al registrar:", error);
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'Ese correo ya está registrado.', exito: false });
        }
        res.status(500).json({ mensaje: 'Error del servidor', exito: false });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuarioEncontrado = await Usuario.findOne({ correo: email });

        if (!usuarioEncontrado) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        if (usuarioEncontrado.contrasena !== password) return res.status(401).json({ status: 'error', message: 'Contraseña incorrecta' });

        res.json({
            status: 'success',
            message: '¡Bienvenido de nuevo!',
            user: {
                id: usuarioEncontrado._id,
                name: usuarioEncontrado.nombre_completo,
                email: usuarioEncontrado.correo,
                role: usuarioEncontrado.rol,
                photo: usuarioEncontrado.foto 
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
});


// ==========================================
// 4. API: PUBLICACIONES (Usuarios)
// ==========================================

// Crear Publicación (Usuario)
app.post('/api/publicaciones', upload.single('media'), async (req, res) => {
    try {
        console.log("Recibiendo publicación...");
        const { id_usuario, title, content, category, worldcup, country } = req.body;

        const usuarioDb = await Usuario.findById(id_usuario);
        if (!usuarioDb) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        // Buscar categoría por nombre o crear objeto temporal
        let categoriaDb = await Categoria.findOne({ nombre: category });
        
        const categoriaData = categoriaDb ? {
            _id: categoriaDb._id,
            nombre: categoriaDb.nombre
        } : {
            _id: new mongoose.Types.ObjectId(),
            nombre: category
        };

        const nuevaPublicacion = new Publicacion({
            usuario: {
                _id: usuarioDb._id,
                nombre: usuarioDb.nombre_completo,
                foto: usuarioDb.foto
            },
            titulo: title,
            contenido: content,
            mundial: worldcup,
            categoria: categoriaData,
            pais: country, 
            multimedia: req.file ? `/Public/uploads/${req.file.filename}` : null,
            aprobado: false, // Pendiente de revisión
            fecha_creacion: new Date()
        });

        await nuevaPublicacion.save();
        res.json({ success: true, message: 'Publicación enviada a revisión.' });

    } catch (error) {
        console.error("Error al crear post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Obtener APROBADAS (Para el Feed Principal)
app.get('/api/publicaciones/aprobadas', async (req, res) => {
    try {
        const aprobadas = await Publicacion.find({ aprobado: true })
            .sort({ fecha_creacion: -1 })
            .populate('usuario', 'nombre_completo foto')
            .populate('categoria', 'nombre'); 

        res.json({ success: true, publicaciones: aprobadas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ==========================================
// 5. API: INTERACCIÓN (Likes y Comentarios)
// ==========================================

// Dar/Quitar Like
app.post('/api/like', async (req, res) => {
    try {
        const { id_publicacion, id_usuario } = req.body;

        const likeExistente = await Like.findOne({ id_publicacion, id_usuario });
        let accion = '';

        if (likeExistente) {
            await Like.findByIdAndDelete(likeExistente._id);
            await Publicacion.findByIdAndUpdate(id_publicacion, { $inc: { "contadores.likes": -1 } });
            accion = 'unliked';
        } else {
            const nuevoLike = new Like({ id_publicacion, id_usuario });
            await nuevoLike.save();
            await Publicacion.findByIdAndUpdate(id_publicacion, { $inc: { "contadores.likes": 1 } });
            accion = 'liked';
        }

        const publicacionActualizada = await Publicacion.findById(id_publicacion);
        
        res.json({ success: true, action: accion, total: publicacionActualizada.contadores.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verificar Like
app.get('/api/user-liked', async (req, res) => {
    try {
        const { id_publicacion, id_usuario } = req.query;
        const like = await Like.findOne({ id_publicacion, id_usuario });
        res.json({ success: true, liked: !!like }); 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Agregar Comentario
app.post('/api/comentarios', async (req, res) => {
    try {
        const { id_publicacion, id_usuario, comentario } = req.body;

        const usuarioDb = await Usuario.findById(id_usuario);
        if(!usuarioDb) return res.status(404).json({success: false, message: "Usuario no encontrado"});

        const nuevoComentario = new Comentario({
            id_publicacion,
            usuario: { _id: id_usuario, nombre: usuarioDb.nombre_completo },
            comentario,
            estado: 'aprobado'
        });

        await nuevoComentario.save();

        // Actualizar contador
        await Publicacion.findByIdAndUpdate(id_publicacion, { $inc: { "contadores.comentarios": 1 } });

        res.json({ success: true, message: 'Comentario agregado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Obtener Comentarios
app.get('/api/comentarios', async (req, res) => {
    try {
        const { id_publicacion } = req.query;
        
        const comentarios = await Comentario.find({ 
            id_publicacion: id_publicacion, 
            estado: 'aprobado' 
        }).sort({ fecha: 1 });
        
        const lista = comentarios.map(c => ({
            id_comentario: c._id,
            autor: c.usuario.nombre,
            comentario: c.comentario,
            fecha: new Date(c.fecha).toLocaleString()
        }));

        res.json({ success: true, comentarios: lista });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ==========================================
// 6. API: ADMINISTRACIÓN
// ==========================================

// Crear Categoría
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevaCategoria = new Categoria({ nombre });
        await nuevaCategoria.save();
        res.json({ success: true, message: 'Categoría creada', categoria: nuevaCategoria });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Listar Categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.find().sort({ nombre: 1 });
        res.json({ success: true, categorias });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Crear Mundial (Admin)
app.post('/api/mundiales', upload.single('logo'), async (req, res) => {
    try {
        console.log("Creando mundial...");
        const { nombre, anio, sede, descripcion, id_categoria } = req.body;

        const nuevoMundial = new Mundial({
            nombre,
            anio,
            sede,
            descripcion,
            id_categoria: id_categoria ? new mongoose.Types.ObjectId(id_categoria) : null,
            logo: req.file ? `/Public/uploads/${req.file.filename}` : null
        });

        await nuevoMundial.save();
        res.json({ success: true, message: 'Mundial creado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Listar Mundiales
app.get('/api/mundiales', async (req, res) => {
    try {
        const mundiales = await Mundial.find().sort({ anio: 1 });
        res.json({ success: true, mundiales });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ver Pendientes
app.get('/api/publicaciones/pendientes', async (req, res) => {
    try {
        const pendientes = await Publicacion.find({ aprobado: false }).sort({ fecha_creacion: -1 }).populate('usuario', 'nombre');
        res.json({ success: true, publicaciones: pendientes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Aprobar Publicación
app.put('/api/publicaciones/:id/aprobar', async (req, res) => {
    try {
        await Publicacion.findByIdAndUpdate(req.params.id, { 
            aprobado: true,
            fecha_aprobacion: new Date()
        });
        res.json({ success: true, message: 'Publicación aprobada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Rechazar Publicación
app.delete('/api/publicaciones/:id', async (req, res) => {
    try {
        await Publicacion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Publicación eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 8. API: DATOS CURIOSOS
// ==========================================

// Obtener datos curiosos (Internos)
app.get('/api/datos-curiosos', async (req, res) => {
    try {
        const datos = await DatoCurioso.find().sort({ fecha: -1 });
        res.json({ success: true, datos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Guardar nuevo dato curioso
app.post('/api/datos-curiosos', async (req, res) => {
    try {
        const { dato } = req.body;
        if (!dato) return res.status(400).json({ success: false, message: "El texto es requerido" });

        const nuevoDato = new DatoCurioso({ texto: dato });
        await nuevoDato.save();

        res.json({ success: true, message: "Dato guardado", dato: nuevoDato });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 9. API EXTERNA
// ==========================================
app.get('/api/jugadores-externos', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const jugadoresFake = [
        {
            idPlayer: "1",
            strPlayer: "Lionel Messi",
            strNationality: "Argentina",
            strPosition: "Forward",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg"
        },
        {
            idPlayer: "2",
            strPlayer: "Cristiano Ronaldo",
            strNationality: "Portugal",
            strPosition: "Forward",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg"
        },
        {
            idPlayer: "3",
            strPlayer: "Pelé",
            strNationality: "Brazil",
            strPosition: "Forward",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/5/54/Pele_by_John_Mathew_Smith.jpg"
        },
        {
            idPlayer: "4",
            strPlayer: "Diego Maradona",
            strNationality: "Argentina",
            strPosition: "Midfielder",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Maradona-Mundial_86_con_la_copa.JPG"
        },
        {
            idPlayer: "5",
            strPlayer: "Zinedine Zidane",
            strNationality: "France",
            strPosition: "Midfielder",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg"
        },
        {
            idPlayer: "8",
            strPlayer: "Andrés Iniesta",
            strNationality: "Spain",
            strPosition: "Midfielder",
            strThumb: "https://upload.wikimedia.org/wikipedia/commons/6/67/Andr%C3%A9s_Iniesta.jpg"
        }
    ];

    res.json({ player: jugadoresFake });
});

// ==========================================
// 10. API: PERFIL DE USUARIO
// ==========================================

// Obtener datos del perfil
app.get('/api/perfil/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, user: usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Obtener publicaciones de un usuario específico
app.get('/api/publicaciones/usuario/:id', async (req, res) => {
    try {
        const posts = await Publicacion.find({ "usuario._id": req.params.id }).sort({ fecha_creacion: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Actualizar perfil
app.put('/api/perfil/:id', async (req, res) => {
    try {
        const { nombre_completo, fecha_nacimiento, genero, pais_nacimiento, nacionalidad } = req.body;
        
        const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, {
            nombre_completo,
            fecha_nacimiento,
            genero,
            pais_nacimiento,
            nacionalidad
        }, { new: true }); 

        if (!usuarioActualizado) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Perfil actualizado', user: usuarioActualizado });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 11. REGISTRAR VISTA
// ==========================================
app.post('/api/registrar-vista', async (req, res) => {
    try {
        const { id_publicacion } = req.body;
        await Publicacion.findByIdAndUpdate(id_publicacion, { 
            $inc: { "contadores.vistas": 1 } 
        });
        res.json({ success: true, message: 'Vista contada' });

    } catch (error) {
        console.error("Error al registrar vista:", error);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// 12. MODERACIÓN DE COMENTARIOS (ADMIN)
// ==========================================

// Ver comentarios reportados
app.get('/api/comentarios/reportados', async (req, res) => {
    try {
        const reportados = await Comentario.find({ estado: 'reportado' });
        const lista = reportados.map(c => ({
            _id: c._id,
            autor: c.usuario ? c.usuario.nombre : 'Anónimo',
            comentario: c.comentario
        }));
        res.json({ success: true, comentarios: lista });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Perdonar comentario
app.put('/api/comentarios/:id/perdonar', async (req, res) => {
    try {
        await Comentario.findByIdAndUpdate(req.params.id, { estado: 'aprobado' });
        res.json({ success: true, message: 'Comentario restaurado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Eliminar comentario
app.delete('/api/comentarios/:id', async (req, res) => {
    try {
        const comentario = await Comentario.findById(req.params.id);
        if (comentario) {
            await Publicacion.findByIdAndUpdate(comentario.id_publicacion, { 
                $inc: { "contadores.comentarios": -1 } 
            });
            await Comentario.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true, message: 'Comentario eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reportar comentario (Ruta para usuarios normales)
app.put('/api/comentarios/:id/reportar', async (req, res) => {
    try {
        await Comentario.findByIdAndUpdate(req.params.id, { estado: 'reportado' });
        res.json({ success: true, message: 'Comentario reportado al administrador' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 13. GESTIÓN DE USUARIOS Y REPORTES (ADMIN)
// ==========================================

// A) Obtener todos los usuarios para la tabla
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ fecha_registro: -1 });
        res.json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// B) Obtener TODAS las estadísticas para los reportes
app.get('/api/reportes', async (req, res) => {
    try {
        // 1. Usuarios por País
        const usuariosPorPais = await Usuario.aggregate([
            { $group: { _id: "$pais_nacimiento", total: { $sum: 1 } } },
            { $sort: { total: -1 } } // Mayor a menor
        ]);

        // 2. Género de Usuarios (Porcentajes)
        const totalUsuarios = await Usuario.countDocuments();
        const usuariosPorGenero = await Usuario.aggregate([
            { $group: { _id: "$genero", count: { $sum: 1 } } }
        ]);
        const generoPorcentaje = usuariosPorGenero.map(g => ({
            genero: g._id || 'No especificado',
            porcentaje: totalUsuarios > 0 ? ((g.count / totalUsuarios) * 100).toFixed(1) + '%' : '0%'
        }));

        // 3. Top 5 Más Populares (Likes)
        const topLikes = await Publicacion.find({ aprobado: true })
            .sort({ "contadores.likes": -1 })
            .limit(5)
            .select("titulo contadores.likes usuario.nombre");

        // 4. Top 5 Más Vistas
        const topVistas = await Publicacion.find({ aprobado: true })
            .sort({ "contadores.vistas": -1 })
            .limit(5)
            .select("titulo contadores.vistas usuario.nombre");

        // 5. Distribución de Contenido (Por Categoría)
        const postsPorCategoria = await Publicacion.aggregate([
            { $group: { _id: "$categoria.nombre", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        res.json({
            success: true,
            usuariosPorPais,
            generoPorcentaje,
            topLikes,
            topVistas,
            postsPorCategoria
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 13. ARRANQUE
// ==========================================
app.listen(3000, () => {
    console.log('Servidor corriendo. Abre: http://localhost:3000');
});

module.exports = app;