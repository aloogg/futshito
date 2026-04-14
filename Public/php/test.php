<?php
// login.php
header("Content-Type: application/json");

// 1. Conexión a MySQL
$conexion = new mysqli("localhost", "root", "root", "bd_capamundial");

// Verificar conexión
if ($conexion->connect_error) {
    die(json_encode([
        "success" => false, 
        "message" => "Error de conexión: " . $conexion->connect_error
    ]));
}

// 2. Recibir datos del formulario
$email = isset($_POST["email"]) ? $_POST["email"] : "";
$password = isset($_POST["password"]) ? $_POST["password"] : "";

// Validar que no vengan vacíos
if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos"
    ]);
    exit;
}

// 3. Consulta a la base de datos
$sql = "SELECT * FROM usuarios WHERE email = ? AND password = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta"
    ]);
    exit;
}

$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$resultado = $stmt->get_result();

// 4. Validar resultado
if ($resultado->num_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
}

// 5. Cerrar conexiones
$stmt->close();
$conexion->close();
?>
