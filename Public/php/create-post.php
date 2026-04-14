<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../App/models/Database.php";

$db = new Database();
$conexion = $db->connect();

// Recibir datos del formulario
$id_usuario = $_POST["id_usuario"] ?? null;
$titulo     = $_POST["title"] ?? null;
$contenido  = $_POST["content"] ?? null;
$categoria  = $_POST["category"] ?? null;
$mundial    = $_POST["worldcup"] ?? null;
$pais       = $_POST["country"] ?? null;

// Validación mínima
if (!$id_usuario || !$titulo || !$categoria || !$mundial) {
    echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
    exit;
}

// Procesar archivo multimedia
$mediaData = null;
if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
    $fileTmp   = $_FILES['media']['tmp_name'];
    $mediaData = file_get_contents($fileTmp);
}

try {
    // Llamar Stored Procedure
    $stmt = $conexion->prepare("CALL sp_crear_publicacion(?, ?, ?, ?, ?, ?)");
    $stmt->bindParam(1, $id_usuario, PDO::PARAM_INT);
    $stmt->bindParam(2, $mundial, PDO::PARAM_STR);
    $stmt->bindParam(3, $categoria, PDO::PARAM_STR);
    $stmt->bindParam(4, $titulo, PDO::PARAM_STR);
    $stmt->bindParam(5, $contenido, PDO::PARAM_STR);
    $stmt->bindParam(6, $mediaData, PDO::PARAM_LOB);

    $stmt->execute();

    // Obtener ID generado
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    echo json_encode([
        "success" => true,
        "message" => "Publicación creada correctamente",
        "id_publicacion" => $result["id_publicacion"] ?? null
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de servidor: " . $e->getMessage()]);
}
