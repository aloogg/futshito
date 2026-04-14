<?php
require_once __DIR__ . "/../models/Comentario.php";

class ComentarioController {
    private $db;
    private $modelo;

    public function __construct($conexion) {
        $this->db = $conexion;
        $this->modelo = new Comentario($conexion);
    }

    public function agregar() {
        $data = json_decode(file_get_contents('php://input'), true);
        $id_publicacion = $data['id_publicacion'] ?? null;
        $id_usuario = $data['id_usuario'] ?? null;
        $comentario = $data['comentario'] ?? null;

        if (!$id_publicacion || !$id_usuario || !$comentario) {
            echo json_encode(["success" => false, "message" => "Faltan datos"]);
            return;
        }

        $ok = $this->modelo->agregarComentario($id_publicacion, $id_usuario, $comentario);
        echo json_encode([
            "success" => $ok,
            "message" => $ok ? "Comentario agregado" : "Error al agregar comentario"
        ]);
    }

    public function listar($id_publicacion) {
        $comentarios = $this->modelo->obtenerComentarios($id_publicacion);
        echo json_encode(["success" => true, "comentarios" => $comentarios]);
    }
}
?>
