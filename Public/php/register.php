<?php




// ESTOY 100% SEGURA QUE ESTE PHP NO SE USA PORQUE 
// LA PARTE DE LA CONEXION ESTA MAL POR LO TANTO
// NO ESTA GUARDANDO DATOS




// register.php
header("Content-Type: application/json");

// Conexión a MySQL
$conexion = new mysqli("localhost", "root", "", "futshito");

if ($conexion->connect_error) {
    die(json_encode(["success" => false, "message" => "Error de conexión"]));
}

// Recibir datos del formulario
$nombre = $_POST["nombre"];
$email = $_POST["email"];
$password = $_POST["password"];

// Verificar si ya existe el usuario
$sql = "SELECT * FROM usuarios WHERE email = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El usuario ya existe"]);
} else {
    // Insertar nuevo usuario
    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sss", $nombre, $email, $password);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Usuario registrado"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al registrar"]);
    }
}

$stmt->close();
$conexion->close();
?>
