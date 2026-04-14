<?php
require_once __DIR__ . "/../../App/models/Database.php";

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit("Falta el parámetro id");
}

$id = (int) $_GET['id'];

$database = new Database();
$pdo = $database->connect();

try {
    // Llamada al Stored Procedure
    $stmt = $pdo->prepare("CALL sp_obtener_multimedia_publicacion(?)");
    $stmt->execute([$id]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // IMPORTANTE: Limpiar el cursor
    $stmt->closeCursor();

    if ($row && !empty($row['multimedia'])) {
        header("Content-Type: image/jpeg"); // Cambiar si la imagen es PNG u otro tipo
        echo $row['multimedia']; // Enviamos el binario directamente
    } else {
        http_response_code(404);
        echo "Imagen no encontrada";
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
