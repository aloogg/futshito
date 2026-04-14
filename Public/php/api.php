<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ob_start();
header('Content-Type: application/json');

// Permitir CORS (solo para desarrollo)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// ====== Requerimientos básicos ======
require_once __DIR__ . "/../../App/models/Database.php";
require_once __DIR__ . "/../../App/controllers/RegisterController.php";
require_once __DIR__ . "/../../App/controllers/LoginController.php";
require_once __DIR__ . "/../../App/controllers/PublicacionController.php";
require_once __DIR__ . "/../../App/controllers/UsuarioController.php";
require_once __DIR__ . "/../../App/models/Publicacion.php";
require_once __DIR__ . "/../../App/controllers/ComentarioController.php";

$response = ["status" => "error", "message" => "Error desconocido"];

try {
    $endpoint = $_GET['endpoint'] ?? '';

    // ================================
    // Registro de usuario
    // ================================
    if ($endpoint === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller = new RegisterController();
        $ok = $controller->register($_POST, $_FILES);
        $response = [
            "status" => $ok ? "success" : "error",
            "message" => $ok ? "Usuario registrado correctamente" : "Error al registrar"
        ];

    // ================================
    // Login
    // ================================
    } elseif ($endpoint === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $loginController = new LoginController();
        $response = $loginController->login($email, $password);

    // ================================
    // Obtener publicaciones pendientes (ADMIN)
    // ================================
    } elseif ($endpoint === 'publicaciones-pendientes' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $database = new Database();
        $conexion = $database->connect();
        $controller = new PublicacionController($conexion);

        ob_start();
        $controller->pendientes();
        $jsonOutput = ob_get_clean();

        $response = json_decode($jsonOutput, true) ?? [
            "status" => "error",
            "message" => "Error al obtener publicaciones pendientes"
        ];

    // ================================
    // Aprobar publicación (ADMIN)
    // ================================
    } elseif ($endpoint === 'aprobar-publicacion' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $database = new Database();
        $conexion = $database->connect();
        $controller = new PublicacionController($conexion);

        ob_start();
        $controller->aprobar();
        $jsonOutput = ob_get_clean();

        $response = json_decode($jsonOutput, true) ?? [
            "status" => "error",
            "message" => "Error al aprobar la publicación"
        ];

    // Rechazar publicación (ADMIN)
    } elseif ($endpoint === 'rechazar-publicacion' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $database = new Database();
        $conexion = $database->connect();
        $controller = new PublicacionController($conexion);

        ob_start();
        $controller->rechazar();
        $jsonOutput = ob_get_clean();

        $response = json_decode($jsonOutput, true) ?? [
            "status" => "error",
            "message" => "Error al rechazar la publicación"
        ];

    // ================================
    // Obtener perfil del usuario
    // ================================
    } elseif ($endpoint === 'userProfile' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $response = ["status" => "error", "message" => "Falta el ID del usuario"];
        } else {
            $usuarioController = new UsuarioController();
            $response = $usuarioController->obtenerUsuario($id);
        }

    // Actualizar perfil del usuario
} elseif ($endpoint === 'updateProfile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $conexion = $database->connect();

    try {
        // Datos JSON del body
        $data = json_decode(file_get_contents('php://input'), true);

        $id_usuario = $data['id_usuario'] ?? null;
        $nombre_completo = $data['nombre_completo'] ?? null;
        $fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
        $genero = $data['genero'] ?? null;
        $pais_nacimiento = $data['pais_nacimiento'] ?? null;
        $nacionalidad = $data['nacionalidad'] ?? null;

        if (!$id_usuario) {
            throw new Exception("ID de usuario faltante");
        }

        // Llamar stored procedure
        $stmt = $conexion->prepare("CALL sp_actualizar_usuario(?, ?, ?, ?, ?, ?)");
        $ok = $stmt->execute([
            $id_usuario,
            $nombre_completo,
            $fecha_nacimiento,
            $genero,
            $pais_nacimiento,
            $nacionalidad
        ]);

        $response = [
            "status" => $ok ? "success" : "error",
            "message" => $ok
                ? "Perfil actualizado correctamente"
                : "No se pudo actualizar el perfil"
        ];

    } catch (Exception $e) {
        $response = [
            "status" => "error",
            "message" => $e->getMessage()
        ];
    }

    // FALTABA ESTO
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
} elseif ($endpoint === 'datos-curiosos') {

    $database = new Database();
    $conexion = $database->connect();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            // Llamar al SP que lista los datos curiosos
            $stmt = $conexion->prepare("CALL sp_listar_datos_curiosos()");
            $stmt->execute();
            $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response = [
                "status" => "success",
                "total" => count($datos),
                "datos" => $datos
            ];
        } catch (PDOException $e) {
            $response = ["status" => "error", "message" => "Error al obtener datos: " . $e->getMessage()];
        }

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $nuevoDato = $input['dato'] ?? null;

        if (!$nuevoDato) {
            $response = ["status" => "error", "message" => "Falta el dato curioso"];
        } else {
            try {
                // Llamar al SP que inserta un nuevo dato
                $stmt = $conexion->prepare("CALL sp_agregar_dato_curioso(?)");
                $stmt->execute([$nuevoDato]);

                // Obtener el ID del nuevo registro
                $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
                $lastId = $resultado['id_nuevo'] ?? null;

                $response = [
                    "status" => "success",
                    "message" => "Dato agregado correctamente",
                    "id" => $lastId
                ];
            } catch (PDOException $e) {
                $response = ["status" => "error", "message" => "Error al agregar dato: " . $e->getMessage()];
            }
        }

    } else {
        $response = ["status" => "error", "message" => "Método no permitido"];
    }

    } else {
        $response = ["status" => "error", "message" => "Método no permitido"];
    }

    // ================================
    // Publicaciones aprobadas
    // ================================
    if ($endpoint === 'publicaciones-aprobadas' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $database = new Database();
        $conexion = $database->connect();
        $controller = new PublicacionController($conexion);

        $controller->aprobadas();
        exit;
    }


if ($endpoint === 'like') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_publicacion = $data['id_publicacion'] ?? null;
    $id_usuario = $data['id_usuario'] ?? null;

    if (!$id_publicacion || !$id_usuario) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    // Llamar al stored procedure
    $stmt = $conexion->prepare("CALL sp_toggle_like(?, ?)");
    $stmt->execute([$id_publicacion, $id_usuario]);
    $action = $stmt->fetch(PDO::FETCH_ASSOC)['action'];

    // Luego obtener el conteo actualizado
    $stmt = $conexion->prepare("CALL sp_count_likes(?)");
    $stmt->execute([$id_publicacion]);
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        "success" => true,
        "action" => $action,
        "total" => (int)$count
    ]);
    exit;
}

if ($endpoint === 'likes-count') {
    $id_publicacion = $_GET['id_publicacion'] ?? null;
    if (!$id_publicacion) {
        echo json_encode(["success" => false, "message" => "Falta id_publicacion"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    $stmt = $conexion->prepare("CALL sp_count_likes(?)");
    $stmt->execute([$id_publicacion]);
    $count = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "total" => (int)$count['total']]);
    exit;
}

if ($endpoint === 'user-liked') {
    $id_publicacion = $_GET['id_publicacion'] ?? null;
    $id_usuario = $_GET['id_usuario'] ?? null;

    if (!$id_publicacion || !$id_usuario) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    $stmt = $conexion->prepare("CALL sp_user_liked(?, ?)");
    $stmt->execute([$id_publicacion, $id_usuario]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $liked = ($result && (int)$result['liked'] > 0);

    echo json_encode(["success" => true, "liked" => $liked]);
    exit;
}

//vistas
if ($endpoint === 'registrar-vista' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_publicacion = $data['id_publicacion'] ?? null;
    $id_usuario = $data['id_usuario'] ?? null;

    if (!$id_publicacion || !$id_usuario) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    $stmt = $conexion->prepare("CALL sp_registrar_vista(?, ?)");
    $stmt->execute([$id_publicacion, $id_usuario]);

    echo json_encode(["success" => true, "message" => "Vista registrada"]);
    exit;
}

//comentarios
if ($endpoint === 'agregar-comentario' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $conexion = $database->connect();
    $controller = new ComentarioController($conexion);
    $controller->agregar();
    exit;
}

if ($endpoint === 'comentarios' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_publicacion = $_GET['id_publicacion'] ?? null;
    if (!$id_publicacion) {
        echo json_encode(["success" => false, "message" => "Falta id_publicacion"]);
        exit;
    }
    $database = new Database();
    $conexion = $database->connect();
    $controller = new ComentarioController($conexion);
    $controller->listar($id_publicacion);
    exit;
}

// Reportar comentario
if ($endpoint === 'reportar-comentario' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_comentario = $data['id_comentario'] ?? null;

    if (!$id_comentario) {
        echo json_encode(["success" => false, "message" => "Falta id_comentario"]);
        exit;
    }

    try {
        $database = new Database();
        $conexion = $database->connect();

        // Llamada al procedimiento almacenado
        $stmt = $conexion->prepare("CALL ReportarComentario(:id_comentario)");
        $stmt->bindParam(':id_comentario', $id_comentario, PDO::PARAM_INT);
        $success = $stmt->execute();

        echo json_encode([
            "success" => $success,
            "message" => $success ? "Comentario reportado correctamente" : "No se pudo reportar el comentario"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error: " . $e->getMessage()
        ]);
    }
    exit;
}

// Listar comentarios reportados
if ($endpoint === 'comentarios-reportados' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $database = new Database();
        $conexion = $database->connect();
        $stmt = $conexion->query("CALL ListarComentariosReportados()");
        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "comentarios" => $comentarios]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
    exit;
}

// Aprobar comentario
if ($endpoint === 'aprobar-comentario' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_comentario = $data['id_comentario'] ?? null;

    $database = new Database();
    $conexion = $database->connect();
    $stmt = $conexion->prepare("CALL AprobarComentario(:id_comentario)");
    $stmt->bindParam(':id_comentario', $id_comentario, PDO::PARAM_INT);
    $success = $stmt->execute();

    echo json_encode(["success" => $success]);
    exit;
}

// Rechazar comentario
if ($endpoint === 'rechazar-comentario' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_comentario = $data['id_comentario'] ?? null;

    $database = new Database();
    $conexion = $database->connect();
    $stmt = $conexion->prepare("CALL RechazarComentario(:id_comentario)");
    $stmt->bindParam(':id_comentario', $id_comentario, PDO::PARAM_INT);
    $success = $stmt->execute();

    echo json_encode(["success" => $success]);
    exit;
}

//categorias
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['endpoint'] === 'crear-categoria') {
    $nombre = $_POST['nombre'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';

    if (!$nombre) {
        echo json_encode(['success' => false, 'message' => 'El nombre es obligatorio']);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    try {
        // Llamar al Stored Procedure
        $stmt = $conexion->prepare("CALL sp_crear_categoria(?, ?)");
        $stmt->execute([$nombre, $descripcion]);

        // Obtener el ID generado
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        $lastId = $resultado['id_nueva_categoria'] ?? null;

        echo json_encode([
            'success' => true,
            'message' => 'Categoría creada correctamente',
            'id_categoria' => $lastId
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear categoría: ' . $e->getMessage()
        ]);
    }

    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['endpoint'] === 'listar-categorias') {
    $database = new Database();
    $conexion = $database->connect();

    try {
        // Llamar al Stored Procedure
        $stmt = $conexion->prepare("CALL sp_listar_categorias()");
        $stmt->execute();

        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'categorias' => $categorias
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al listar categorías: ' . $e->getMessage()
        ]);
    }

    exit;
}


// vistas
if ($endpoint === 'estadisticas' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_publicacion = $_GET['id_publicacion'] ?? null;

    if (!$id_publicacion) {
        echo json_encode(["success" => false, "message" => "Falta id_publicacion"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    $stmt = $conexion->prepare("CALL sp_obtener_estadisticas_publicacion(?)");
    $stmt->execute([$id_publicacion]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "estadisticas" => $data]);
    exit;
}

// publicaciones en perfil.html
if ($endpoint === 'userPosts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "Falta userId"]);
        exit;
    }

    $database = new Database();
    $conexion = $database->connect();

    try {
        // Ejecutar stored procedure
        $stmt = $conexion->prepare("CALL sp_obtener_publicaciones_usuario(?)");
        $stmt->execute([$userId]);

        // Obtener el primer conjunto de resultados
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Limpiar conjuntos de resultados restantes
        while ($stmt->nextRowset()) {
            $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // Convertir BLOB multimedia a base64 si no lo hiciste en el SP
        foreach ($posts as &$post) {
            if (!empty($post['multimedia'])) {
                $post['multimedia'] = base64_encode($post['multimedia']);
            }
        }

        // Responder JSON limpio
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "posts" => $posts]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        exit;
    }
}

// Crear Página de Mundial (ADMIN)
if ($endpoint === 'crear-mundial' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $conexion = $database->connect();

    $nombre = $_POST['nombre'] ?? null;
    $anio = $_POST['anio'] ?? null;
    $sede = $_POST['sede'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $id_categoria = $_POST['id_categoria'] ?? null;

    if (!$nombre || !$anio || !$sede || !$descripcion || !$id_categoria || empty($_FILES['logo']['tmp_name'])) {
        echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
        exit;
    }

    $imagenBinaria = file_get_contents($_FILES['logo']['tmp_name']);

    try {
        // Llamar al stored procedure para crear el mundial
        $stmt = $conexion->prepare("CALL sp_crear_mundial(?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $anio, $sede, $imagenBinaria, $descripcion, $id_categoria]);

        // Obtener el ID devuelto
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        $lastId = $resultado['id_nuevo'] ?? null;

        echo json_encode([
            "success" => true,
            "message" => "Mundial creado correctamente",
            "id_mundial" => $lastId
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al crear el mundial: " . $e->getMessage()
        ]);
    }

    exit;
}


// Listar Mundiales (para index.html)
if ($endpoint === 'listar-mundiales' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $conexion = $database->connect();

    try {
        // Llamar al Stored Procedure
        $stmt = $conexion->prepare("CALL sp_listar_mundiales()");
        $stmt->execute();

        $mundiales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convertir imagen binaria a Base64
        foreach ($mundiales as &$m) {
            if (!empty($m['logo'])) {
                $m['logo'] = 'data:image/jpeg;base64,' . base64_encode($m['logo']);
            } else {
                $m['logo'] = null;
            }
        }

        echo json_encode([
            "success" => true,
            "mundiales" => $mundiales
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al listar mundiales: " . $e->getMessage()
        ]);
    }

    exit;
}


// Buscar publicaciones aprobadas 01-11
if (isset($_GET['endpoint']) && $_GET['endpoint'] === 'buscar-publicaciones') {
    require_once __DIR__ . '/../../App/models/Database.php';
    $database = new Database();
    $pdo = $database->connect();

    $query = isset($_GET['q']) ? trim($_GET['q']) : '';

    try {
        $stmt = $pdo->prepare("CALL sp_buscar_publicaciones_aprobadas(:q)");
        $stmt->bindParam(':q', $query);
        $stmt->execute();
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convertir blob multimedia a base64
        foreach ($publicaciones as &$pub) {
            if (!empty($pub['multimedia'])) {
                $pub['multimedia'] = "data:image/jpeg;base64," . base64_encode($pub['multimedia']);
            }
        }

        echo json_encode([
            "success" => true,
            "publicaciones" => $publicaciones
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error en la búsqueda: " . $e->getMessage()
        ]);
    }
    exit;
}

// Filtrar publicaciones por sede
if (isset($_GET['endpoint']) && $_GET['endpoint'] === 'filtrar-publicaciones') {
    require_once __DIR__ . '/../../App/models/Database.php';
    $database = new Database();
    $pdo = $database->connect();

    $mundial = isset($_GET['mundial']) ? $_GET['mundial'] : 'all';

    try {
        $stmt = $pdo->prepare("CALL sp_filtrar_publicaciones_por_sede(:mundial)");
        $stmt->bindParam(':mundial', $mundial);
        $stmt->execute();

        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($publicaciones as &$pub) {
            if (!empty($pub['multimedia'])) {
                $pub['multimedia'] = base64_encode($pub['multimedia']);
            }
        }

        echo json_encode([
            "success" => true,
            "publicaciones" => $publicaciones
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al filtrar publicaciones: " . $e->getMessage()
        ]);
    }
    exit;
}

// =======================
// OBTENER TODOS LOS USUARIOS
// =======================
if ($endpoint === "getUsuarios" && $_SERVER["REQUEST_METHOD"] === "GET") {

    require_once __DIR__ . "/../../App/models/Database.php";

    $database = new Database();
    $conexion = $database->connect();

    try {
        $stmt = $conexion->prepare("SELECT id_usuario, nombre_completo, fecha_nacimiento, genero,
            pais_nacimiento, nacionalidad, correo, fecha_registro
            FROM Usuarios");

        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($usuarios);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        exit;
    }
}

} catch (Exception $e) {
    $response = [
        "status" => "error",
        "message" => "Excepción: " . $e->getMessage()
    ];
}

echo json_encode($response);

// ob_end_clean(); // Limpiar cualquier salida extra
// header('Content-Type: application/json');
// echo json_encode(["status" => "success", "posts" => $posts]);

exit;
