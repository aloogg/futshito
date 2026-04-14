<?php

class Comentario {
    private $db;

    public function __construct($conexion) {
        $this->db = $conexion;
    }

    // Agregar comentario (usa SP)
    public function agregarComentario($id_publicacion, $id_usuario, $comentario) {
        try {
            $stmt = $this->db->prepare("CALL sp_agregar_comentario(:id_pub, :id_usr, :comentario)");
            $stmt->bindParam(':id_pub', $id_publicacion, PDO::PARAM_INT);
            $stmt->bindParam(':id_usr', $id_usuario, PDO::PARAM_INT);
            $stmt->bindParam(':comentario', $comentario, PDO::PARAM_STR);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al agregar comentario: " . $e->getMessage());
            return false;
        }
    }

    // Obtener comentarios de una publicación (usa SP)
    public function obtenerComentarios($id_publicacion) {
        try {
            $stmt = $this->db->prepare("CALL sp_obtener_comentarios(:id_pub)");
            $stmt->bindParam(':id_pub', $id_publicacion, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener comentarios: " . $e->getMessage());
            return [];
        }
    }
}



?>
