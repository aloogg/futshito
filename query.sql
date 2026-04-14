use bd_capamundial;

 -- Crear tablas

CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  foto LONGBLOB,
  genero ENUM('M', 'F', 'Otro') NOT NULL,
  pais_nacimiento VARCHAR(50) NOT NULL,
  nacionalidad VARCHAR(50) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Mundiales (
  id_mundial INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  anio YEAR NOT NULL,
  sede VARCHAR(100) NOT NULL,
  logo LONGBLOB,
  descripcion TEXT
) ENGINE=InnoDB;

ALTER TABLE Mundiales
ADD COLUMN id_categoria INT AFTER descripcion;

drop table Mundiales;

ALTER TABLE Mundiales
ADD COLUMN id_categoria INT NOT NULL,
ADD CONSTRAINT fk_mundial_categoria
  FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria);


drop table Mundiales;


CREATE TABLE Categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE publicaciones (
  id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  mundial VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT,
  multimedia LONGBLOB,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aprobado BOOLEAN DEFAULT FALSE,
  fecha_aprobacion TIMESTAMP NULL
) ENGINE=InnoDB;

drop table publicaciones;

CREATE TABLE Comentarios (
  id_comentario INT AUTO_INCREMENT PRIMARY KEY,
  id_publicacion INT NOT NULL,
  id_usuario INT NOT NULL,
  comentario TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion)
) ENGINE=InnoDB;

ALTER TABLE Comentarios
ADD COLUMN reportado BOOLEAN DEFAULT FALSE,
ADD COLUMN estado ENUM('pendiente','aprobado') DEFAULT 'aprobado';

CREATE TABLE Comentarios (
  id_comentario INT AUTO_INCREMENT PRIMARY KEY,
  id_publicacion INT NOT NULL,
  id_usuario INT NOT NULL,
  comentario TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reportado BOOLEAN DEFAULT FALSE,
  estado ENUM('pendiente','aprobado') DEFAULT 'aprobado',
  FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion)
) ENGINE=InnoDB;

drop table Comentarios;

CREATE TABLE Vistas (
  id_vista INT AUTO_INCREMENT PRIMARY KEY,
  id_publicacion INT NOT NULL,
  id_usuario INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DatosCuriosos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dato TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 CREATE TABLE Likes (
  id_like INT AUTO_INCREMENT PRIMARY KEY,
  id_publicacion INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo ENUM('like', 'dislike') DEFAULT 'like',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

 -- CAPA

 use bd_capamundial;

-- ============================================
-- PROCEDIMIENTO: Obtener usuario por ID
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_obtener_usuario(IN p_id_usuario INT)
BEGIN
  SELECT 
    id_usuario, 
    nombre_completo, 
    correo,
    fecha_nacimiento, 
    genero,
    pais_nacimiento,
    nacionalidad,
    rol
  FROM usuarios
  WHERE id_usuario = p_id_usuario;
END //
DELIMITER ;

-- ============================================
-- PROCEDIMIENTO: Actualizar usuario
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_actualizar_usuario(
  IN p_id_usuario INT,
  IN p_nombre_completo VARCHAR(255),
  IN p_fecha_nacimiento DATE,
  IN p_genero VARCHAR(50),
  IN p_pais_nacimiento VARCHAR(100),
  IN p_nacionalidad VARCHAR(100)
)
BEGIN
  UPDATE usuarios
  SET
    nombre_completo = p_nombre_completo,
    fecha_nacimiento = p_fecha_nacimiento,
    genero = p_genero,
    pais_nacimiento = p_pais_nacimiento,
    nacionalidad = p_nacionalidad
  WHERE id_usuario = p_id_usuario;
END //
DELIMITER ;

-- ============================================
-- Obtener publicaciones pendientes
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_obtener_publicaciones_pendientes()
BEGIN
  SELECT 
    p.id_publicacion,
    p.id_usuario,
    p.mundial,
    p.categoria,
    p.titulo,
    p.contenido,
    p.fecha_creacion
  FROM publicaciones p
  WHERE p.aprobado = 0
  ORDER BY p.fecha_creacion DESC;
END //
DELIMITER ;

-- ============================================
-- Aprobar publicación
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_aprobar_publicacion(IN p_id_publicacion INT)
BEGIN
  UPDATE publicaciones
  SET aprobado = 1, fecha_aprobacion = NOW()
  WHERE id_publicacion = p_id_publicacion;
END //
DELIMITER ;

-- ============================================
-- Rechazar publicación
-- ============================================
DELIMITER //

CREATE PROCEDURE sp_rechazar_publicacion(IN p_id_publicacion INT)
BEGIN
  DELETE FROM publicaciones
  WHERE id_publicacion = p_id_publicacion;
END //
DELIMITER ;

-- ============================================
-- Agregar comentario
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_agregar_comentario(
  IN p_id_publicacion INT,
  IN p_id_usuario INT,
  IN p_comentario TEXT
)
BEGIN
  INSERT INTO Comentarios (id_publicacion, id_usuario, comentario, estado, reportado)
  VALUES (p_id_publicacion, p_id_usuario, p_comentario, 'aprobado', FALSE);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_agregar_comentario;

-- ============================================
-- Obtener comentarios por publicación
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_obtener_comentarios(IN p_id_publicacion INT)
BEGIN
  SELECT 
    c.id_comentario, 
    c.id_usuario, 
    u.nombre_completo AS autor, 
    c.comentario, 
    c.fecha
  FROM Comentarios c
  JOIN Usuarios u ON c.id_usuario = u.id_usuario
  WHERE c.id_publicacion = p_id_publicacion
    AND c.estado = 'aprobado'   -- Solo comentarios aprobados
  ORDER BY c.fecha ASC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_obtener_comentarios;

-- ============================================
-- Crear publicación
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_crear_publicacion(
  IN p_id_usuario INT,
  IN p_mundial VARCHAR(100),
  IN p_categoria VARCHAR(100),
  IN p_titulo VARCHAR(150),
  IN p_contenido TEXT,
  IN p_multimedia LONGBLOB
)
BEGIN
  INSERT INTO publicaciones (
    id_usuario,
    mundial,
    categoria,
    titulo,
    contenido,
    multimedia,
	aprobado,
    fecha_creacion
  ) VALUES (
    p_id_usuario,
    p_mundial,
    p_categoria,
    p_titulo,
    p_contenido,
    p_multimedia,
	0,
    NOW()
  );
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS sp_crear_publicacion;

-- nuevo

-- ============================================
-- Obtener publicaciones aprobadas
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_obtener_publicaciones_aprobadas()
BEGIN
  SELECT
    p.id_publicacion,
    p.id_usuario,
    p.mundial,
    p.categoria,
    p.titulo,
    p.contenido AS descripcion,
    p.multimedia,
    p.fecha_creacion,
    p.fecha_aprobacion,
    p.aprobado,
    IFNULL((
      SELECT COUNT(*) 
      FROM Likes l 
      WHERE l.id_publicacion = p.id_publicacion 
      AND l.tipo = 'like'
    ), 0) AS likes
  FROM publicaciones p
  WHERE p.aprobado = 1
  ORDER BY p.fecha_creacion DESC;
END //
DELIMITER ;

-- ============================================
-- likes
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_toggle_like(
  IN p_id_publicacion INT,
  IN p_id_usuario INT
)
BEGIN
  DECLARE v_exists INT;
  -- Verificar si ya existe un like
  SELECT COUNT(*) INTO v_exists
  FROM Likes
  WHERE id_publicacion = p_id_publicacion
   AND id_usuario = p_id_usuario
   AND tipo = 'like';
  IF v_exists > 0 THEN
    -- Si ya existe, lo eliminamos (unlike)
    DELETE FROM Likes
    WHERE id_publicacion = p_id_publicacion
     AND id_usuario = p_id_usuario
     AND tipo = 'like';
    SELECT 'unliked' AS action;
  ELSE
    -- Si no existe, lo insertamos
    INSERT INTO Likes (id_publicacion, id_usuario, tipo, fecha)
    VALUES (p_id_publicacion, p_id_usuario, 'like', NOW());
    SELECT 'liked' AS action;
  END IF;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_count_likes(IN p_id_publicacion INT)
BEGIN
  SELECT COUNT(*) AS total
  FROM Likes
  WHERE id_publicacion = p_id_publicacion
   AND tipo = 'like';
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_user_liked(
  IN p_id_publicacion INT,
  IN p_id_usuario INT
)
BEGIN
  SELECT COUNT(*) AS liked
  FROM Likes
  WHERE id_publicacion = p_id_publicacion
   AND id_usuario = p_id_usuario
   AND tipo = 'like';
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_registrar_vista(IN p_id_publicacion INT, IN p_id_usuario INT)
BEGIN
-- Si no existe una vista reciente del mismo usuario (últimos 10 min)
IF NOT EXISTS (
	SELECT 1 FROM Vistas
	WHERE id_publicacion = p_id_publicacion
		AND id_usuario = p_id_usuario
		AND fecha > (NOW() - INTERVAL 10 MINUTE)
	) THEN
		INSERT INTO Vistas (id_publicacion, id_usuario) VALUES (p_id_publicacion, p_id_usuario);
	END IF;
END //
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ReportarComentario(IN p_id_comentario INT)
BEGIN
  UPDATE Comentarios
  SET 
    reportado = TRUE,
    estado = 'pendiente'
  WHERE id_comentario = p_id_comentario;
END$$
DELIMITER ;

-- ============================================
-- Reportar un comentario
-- ============================================
DELIMITER $$
CREATE PROCEDURE ReportarComentario(IN p_id_comentario INT)
BEGIN
	UPDATE Comentarios
		SET reportado = TRUE,
		estado = 'pendiente'
	WHERE id_comentario = p_id_comentario;
END$$ 

-- ============================================
-- Comentarios en la pantalla del admin 31-10
-- ============================================
DELIMITER $$
CREATE PROCEDURE ListarComentariosReportados()
BEGIN
	SELECT c.id_comentario,
		c.comentario,
		c.fecha,
		u.nombre_completo AS autor,
		p.titulo AS publicacion
	FROM Comentarios c
	JOIN Usuarios u ON c.id_usuario = u.id_usuario
	JOIN Publicaciones p ON c.id_publicacion = p.id_publicacion
	WHERE c.reportado = TRUE AND c.estado = 'pendiente'
	ORDER BY c.fecha DESC;
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AprobarComentario(IN p_id_comentario INT)
BEGIN
    UPDATE Comentarios
    SET 
        estado = 'aprobado',
        reportado = FALSE
    WHERE id_comentario = p_id_comentario;
END$$

CREATE PROCEDURE RechazarComentario(IN p_id_comentario INT)
BEGIN
    UPDATE Comentarios
    SET 
        estado = 'rechazado'
    WHERE id_comentario = p_id_comentario;
END$$

DELIMITER ;

-- ============================================
-- Procedimiento para estadísticas completas
-- ============================================

DELIMITER //
CREATE PROCEDURE sp_obtener_estadisticas_publicacion(IN p_id_publicacion INT)
BEGIN
    SELECT 
        p.id_publicacion,
        p.titulo,
        IFNULL((SELECT COUNT(*) FROM Likes l WHERE l.id_publicacion = p.id_publicacion AND l.tipo = 'like'), 0) AS total_likes,
        IFNULL((SELECT COUNT(*) FROM Comentarios c WHERE c.id_publicacion = p.id_publicacion), 0) AS total_comentarios,
        IFNULL((SELECT COUNT(*) FROM Vistas v WHERE v.id_publicacion = p.id_publicacion), 0) AS total_vistas
    FROM Publicaciones p
    WHERE p.id_publicacion = p_id_publicacion;
END //
DELIMITER ;

CALL sp_buscar_publicaciones_aprobadas;

DELIMITER //
CREATE PROCEDURE sp_obtener_publicaciones_usuario(IN p_id_usuario INT)
BEGIN
    SELECT 
        p.id_publicacion,
        p.titulo,
        p.contenido AS descripcion,
        p.mundial,
        p.categoria,
        p.multimedia, -- deja el BLOB crudo
        IFNULL((SELECT COUNT(*) FROM Likes l WHERE l.id_publicacion = p.id_publicacion), 0) AS likes,
        IFNULL((SELECT COUNT(*) FROM Comentarios c WHERE c.id_publicacion = p.id_publicacion), 0) AS comentarios,
        IFNULL((SELECT COUNT(*) FROM Vistas v WHERE v.id_publicacion = p.id_publicacion), 0) AS vistas
    FROM Publicaciones p
    WHERE p.id_usuario = p_id_usuario
    ORDER BY p.fecha_aprobacion DESC;
END //
DELIMITER ;



DELIMITER //
CREATE PROCEDURE sp_buscar_publicaciones_aprobadas(IN p_busqueda VARCHAR(255))
BEGIN
    SELECT 
        p.id_publicacion,
        p.id_usuario,
        p.mundial,
        p.categoria,
        p.titulo,
        p.contenido,
        p.multimedia,
        p.fecha_creacion,
        p.aprobado,
        p.fecha_aprobacion,
        -- contar likes
        (SELECT COUNT(*) FROM Likes l WHERE l.id_publicacion = p.id_publicacion) AS likes,
        -- contar comentarios aprobados
        (SELECT COUNT(*) FROM Comentarios c WHERE c.id_publicacion = p.id_publicacion AND c.estado = 'aprobado') AS total_comentarios
    FROM Publicaciones p
    WHERE p.aprobado = 1
    AND (
        p.titulo LIKE CONCAT('%', p_busqueda, '%')
        OR p.contenido LIKE CONCAT('%', p_busqueda, '%')
        OR p.categoria LIKE CONCAT('%', p_busqueda, '%')
        OR p.mundial LIKE CONCAT('%', p_busqueda, '%')
    )
    ORDER BY p.fecha_aprobacion DESC;
END //
DELIMITER ;

-- =====================================================
-- SP: Buscar publicaciones por sede con likes y comentarios
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_filtrar_publicaciones_por_sede(IN p_mundial VARCHAR(100))
BEGIN
    IF p_mundial = 'all' THEN
        SELECT 
            p.id_publicacion,
            p.id_usuario,
            p.mundial,
            p.categoria,
            p.titulo,
            p.contenido,
            p.multimedia,
            p.fecha_creacion,
            p.aprobado,
            p.fecha_aprobacion,
            -- Número de likes
            (SELECT COUNT(*) FROM Likes l WHERE l.id_publicacion = p.id_publicacion) AS total_likes,
            -- Número de comentarios aprobados
            (SELECT COUNT(*) FROM Comentarios c 
             WHERE c.id_publicacion = p.id_publicacion AND c.estado = 'aprobado') AS total_comentarios
        FROM Publicaciones p
        WHERE p.aprobado = 1
        ORDER BY p.fecha_creacion DESC;
    ELSE
        SELECT 
            p.id_publicacion,
            p.id_usuario,
            p.mundial,
            p.categoria,
            p.titulo,
            p.contenido,
            p.multimedia,
            p.fecha_creacion,
            p.aprobado,
            p.fecha_aprobacion,
            -- Número de likes
            (SELECT COUNT(*) FROM Likes l WHERE l.id_publicacion = p.id_publicacion) AS total_likes,
            -- Número de comentarios aprobados
            (SELECT COUNT(*) FROM Comentarios c 
             WHERE c.id_publicacion = p.id_publicacion AND c.estado = 'aprobado') AS total_comentarios
        FROM Publicaciones p
        WHERE p.aprobado = 1 AND p.mundial = p_mundial
        ORDER BY p.fecha_creacion DESC;
    END IF;
END //
DELIMITER ;


-- =====================================================
-- SP: agregar dato curioso 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_agregar_dato_curioso (
    IN p_dato TEXT
)
BEGIN
    INSERT INTO DatosCuriosos (dato)
    VALUES (p_dato);

    -- Devuelve el ID del nuevo registro
    SELECT LAST_INSERT_ID() AS id_nuevo;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_listar_mundiales 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_listar_mundiales()
BEGIN
    SELECT 
        id_mundial, 
        nombre, 
        anio, 
        sede, 
        descripcion, 
        logo
    FROM Mundiales
    ORDER BY anio ASC;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_crear_categoria 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_crear_categoria (
    IN p_nombre VARCHAR(50),
    IN p_descripcion TEXT
)
BEGIN
    INSERT INTO Categorias (nombre, descripcion)
    VALUES (p_nombre, p_descripcion);

    -- Devolver el ID recién insertado
    SELECT LAST_INSERT_ID() AS id_nueva_categoria;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_crear_mundial 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_crear_mundial(
    IN p_nombre VARCHAR(100),
    IN p_anio INT,
    IN p_sede VARCHAR(100),
    IN p_logo LONGBLOB,
    IN p_descripcion TEXT,
    IN p_id_categoria INT
)
BEGIN
    INSERT INTO Mundiales (nombre, anio, sede, logo, descripcion, id_categoria)
    VALUES (p_nombre, p_anio, p_sede, p_logo, p_descripcion, p_id_categoria);

    SELECT LAST_INSERT_ID() AS id_nuevo;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_listar_datos_curiosos 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_listar_datos_curiosos()
BEGIN
    SELECT 
        id,
        dato,
        fecha_creacion
    FROM DatosCuriosos
    ORDER BY id DESC;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_listar_categorias 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_listar_categorias()
BEGIN
    SELECT 
        id_categoria,
        nombre
    FROM Categorias
    ORDER BY nombre ASC;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_registrar_usuario 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_registrar_usuario(
    IN p_nombre_completo VARCHAR(100),
    IN p_fecha_nacimiento DATE,
    IN p_foto LONGBLOB,
    IN p_genero ENUM('M', 'F', 'Otro'),
    IN p_pais_nacimiento VARCHAR(50),
    IN p_nacionalidad VARCHAR(50),
    IN p_correo VARCHAR(100),
    IN p_contrasena VARCHAR(255)
)
BEGIN
    INSERT INTO Usuarios (
        nombre_completo,
        fecha_nacimiento,
        foto,
        genero,
        pais_nacimiento,
        nacionalidad,
        correo,
        contrasena
    ) VALUES (
        p_nombre_completo,
        p_fecha_nacimiento,
        p_foto,
        p_genero,
        p_pais_nacimiento,
        p_nacionalidad,
        p_correo,
        p_contrasena
    );
END //
DELIMITER ;

-- =====================================================
-- SP: sp_obtener_usuario_por_correo 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_obtener_usuario_por_correo(
    IN p_correo VARCHAR(100)
)
BEGIN
    SELECT 
        id_usuario,
        nombre_completo,
        fecha_nacimiento,
        foto,
        genero,
        pais_nacimiento,
        nacionalidad,
        correo,
        contrasena,
        rol,
        fecha_registro
    FROM Usuarios
    WHERE correo = p_correo
    LIMIT 1;
END //
DELIMITER ;

-- =====================================================
-- SP: sp_obtener_multimedia_publicacion 13-11
-- =====================================================
DELIMITER //
CREATE PROCEDURE sp_obtener_multimedia_publicacion(
    IN p_id_publicacion INT
)
BEGIN
    SELECT multimedia
    FROM publicaciones
    WHERE id_publicacion = p_id_publicacion
    LIMIT 1;
END //
DELIMITER ;


use bd_capamundial;

-- ============================================================================
-- Trigger 1: Registrar automáticamente una vista al aprobar una publicación
-- ============================================================================
DELIMITER //
CREATE TRIGGER trg_insert_vista_al_aprobar
AFTER UPDATE ON publicaciones
FOR EACH ROW
BEGIN
    IF NEW.aprobado = 1 AND OLD.aprobado = 0 THEN
        INSERT INTO Vistas (id_publicacion, fecha)
        VALUES (NEW.id_publicacion, NOW());
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- Trigger 2: Registrar fecha de actualización cuando un usuario cambia sus datos
-- ============================================================================
ALTER TABLE Usuarios ADD COLUMN fecha_actualizacion TIMESTAMP NULL;

DELIMITER //
CREATE TRIGGER trg_usuario_update
BEFORE UPDATE ON Usuarios
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = NOW();
END //
DELIMITER ;

-- =========================================================
-- View 1: Publicaciones aprobadas con datos de autor
-- =========================================================
CREATE VIEW vw_publicaciones_aprobadas AS
SELECT 
    p.id_publicacion,
    p.titulo,
    p.contenido,
    u.nombre_completo AS autor,
    p.fecha_aprobacion
FROM publicaciones p
JOIN Usuarios u ON p.id_usuario = u.id_usuario
WHERE p.aprobado = 1;

SELECT * FROM vw_publicaciones_aprobadas;

-- =========================================================
-- View 2: Publicaciones pendientes de aprobación
-- =========================================================
CREATE VIEW vw_publicaciones_pendientes AS
SELECT 
    p.id_publicacion,
    p.titulo,
    u.nombre_completo AS autor,
    p.fecha_creacion
FROM publicaciones p
JOIN Usuarios u ON p.id_usuario = u.id_usuario
WHERE p.aprobado = 0;

SELECT * FROM vw_publicaciones_pendientes;

-- =========================================================
-- View 3: Cantidad de likes por publicación
-- =========================================================
CREATE VIEW vw_likes_por_publicacion AS
SELECT 
    p.id_publicacion,
    p.titulo,
    COUNT(l.id_like) AS total_likes
FROM publicaciones p
LEFT JOIN Likes l ON p.id_publicacion = l.id_publicacion AND l.tipo = 'like'
GROUP BY p.id_publicacion;

SELECT * FROM vw_publicaciones_pendientes;

-- =========================================================
-- View 4: Top 5 publicaciones con más likes
-- =========================================================
CREATE VIEW vw_top5_publicaciones AS
SELECT 
    p.id_publicacion,
    p.titulo,
    COUNT(l.id_like) AS likes
FROM publicaciones p
LEFT JOIN Likes l ON p.id_publicacion = l.id_publicacion
GROUP BY p.id_publicacion
ORDER BY likes DESC
LIMIT 5;

SELECT * FROM vw_top5_publicaciones;

-- =========================================================
-- View 5: Comentarios con nombre del autor y título de la publicación
-- =========================================================
CREATE VIEW vw_comentarios_detalle AS
SELECT 
    c.id_comentario,
    p.titulo AS publicacion,
    u.nombre_completo AS autor,
    c.comentario,
    c.fecha
FROM Comentarios c
JOIN Usuarios u ON c.id_usuario = u.id_usuario
JOIN publicaciones p ON c.id_publicacion = p.id_publicacion;

SELECT * FROM vw_comentarios_detalle;

-- ======================================================================
-- View 6: Total de publicaciones por usuario
-- ======================================================================
CREATE VIEW vw_total_publicaciones_usuario AS
SELECT 
    u.id_usuario,
    u.nombre_completo,
    COUNT(p.id_publicacion) AS total_publicaciones
FROM Usuarios u
LEFT JOIN publicaciones p ON u.id_usuario = p.id_usuario
GROUP BY u.id_usuario;

SELECT * FROM vw_total_publicaciones_usuario;

-- =============================================
-- View 7: Total de vistas por publicación
-- =============================================
CREATE VIEW vw_vistas_por_publicacion AS
SELECT 
    p.id_publicacion,
    p.titulo,
    COUNT(v.id_vista) AS total_vistas
FROM publicaciones p
LEFT JOIN Vistas v ON p.id_publicacion = v.id_publicacion
GROUP BY p.id_publicacion;

SELECT * FROM vw_vistas_por_publicacion;

-- =============================================
-- View 8: Actividad reciente (últimas publicaciones y comentarios)
-- =============================================
CREATE VIEW vw_actividad_reciente AS
SELECT 
    'publicacion' AS tipo,
    p.titulo AS contenido,
    u.nombre_completo AS autor,
    p.fecha_creacion AS fecha
FROM publicaciones p
JOIN Usuarios u ON p.id_usuario = u.id_usuario
UNION ALL
SELECT 
    'comentario' AS tipo,
    c.comentario AS contenido,
    u.nombre_completo AS autor,
    c.fecha
FROM Comentarios c
JOIN Usuarios u ON c.id_usuario = u.id_usuario
ORDER BY fecha DESC;

SELECT * FROM vw_actividad_reciente;

-- =================================================================
-- Function 1: Obtener nombre de usuario por ID
-- =================================================================
DELIMITER //
CREATE FUNCTION fn_nombre_usuario(p_id_usuario INT)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE v_nombre VARCHAR(100);
    SELECT nombre_completo INTO v_nombre
    FROM Usuarios
    WHERE id_usuario = p_id_usuario;
    RETURN v_nombre;
END //
DELIMITER ;

SELECT fn_nombre_usuario(1);

-- ==============================================
-- Function 2: Contar likes de una publicación
-- ==============================================
DELIMITER //
CREATE FUNCTION fn_contar_likes(p_id_publicacion INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM Likes
    WHERE id_publicacion = p_id_publicacion AND tipo = 'like';
    RETURN total;
END //
DELIMITER ;

SELECT fn_contar_likes(1);






