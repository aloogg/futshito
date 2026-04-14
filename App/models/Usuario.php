<?php
require_once "Database.php";

class Usuario {
    private $conn;
    private $tabla = 'Usuarios';
    
    public function __construct() {
        $db = new Database();
        $this->conn = $db->connect();
    }

    // Registrar nuevo usuario usando el Stored Procedure
    public function registrar($data) {
        $sql = "CALL sp_registrar_usuario(:nombre, :fecha, :foto, :genero, :pais, :nac, :correo, :pass)";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":nombre", $data['nombre']);
        $stmt->bindParam(":fecha", $data['fecha']);
        $stmt->bindParam(":foto", $data['foto'], PDO::PARAM_LOB);
        $stmt->bindParam(":genero", $data['genero']);
        $stmt->bindParam(":pais", $data['pais']);
        $stmt->bindParam(":nac", $data['nacionalidad']);
        $stmt->bindParam(":correo", $data['correo']);

        // Hash seguro de contraseña
        $hashed = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt->bindValue(":pass", $hashed);

        return $stmt->execute();
    }

    public function getByEmail($email) {
        $stmt = $this->conn->prepare("CALL sp_obtener_usuario_por_correo(:correo)");
        $stmt->bindParam(':correo', $email);
        $stmt->execute();

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt->closeCursor();

        return $usuario;
    }

    // Verificar contraseña
    public function verificarPassword($email, $password) {
        $usuario = $this->getByEmail($email);
        if ($usuario && password_verify($password, $usuario['contrasena'])) {
            return $usuario;
        }
        return false;
    }
}
