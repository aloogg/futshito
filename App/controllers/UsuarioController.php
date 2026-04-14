<?php
require_once __DIR__ . '/../models/Database.php';

class UsuarioController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    // Obtener perfil del usuario
    public function obtenerUsuario($id_usuario) {
        try {
            $stmt = $this->conn->prepare("CALL sp_obtener_usuario(:id)");
            $stmt->bindParam(":id", $id_usuario, PDO::PARAM_INT);
            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                return ["status" => "success", "user" => $usuario];
            } else {
                return ["status" => "error", "message" => "Usuario no encontrado"];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Error al obtener usuario: " . $e->getMessage()];
        }
    }

    // Actualizar perfil del usuario
    public function actualizarUsuario($data) {
        try {
            $stmt = $this->conn->prepare("CALL sp_actualizar_usuario(:id, :nombre_completo, :fecha_nacimiento, :genero, :pais_nacimiento, :nacionalidad)");

            $stmt->bindParam(":id", $data['id_usuario'], PDO::PARAM_INT);
            $stmt->bindParam(":nombre_completo", $data['nombre_completo']);
            $stmt->bindParam(":fecha_nacimiento", $data['fecha_nacimiento']);
            $stmt->bindParam(":genero", $data['genero']);
            $stmt->bindParam(":pais_nacimiento", $data['pais_nacimiento']);
            $stmt->bindParam(":nacionalidad", $data['nacionalidad']);

            $stmt->execute();

            return ["status" => "success", "message" => "Perfil actualizado correctamente"];
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Error al actualizar: " . $e->getMessage()];
        }
    }
}
