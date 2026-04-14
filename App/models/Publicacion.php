<?php

class Publicacion {
    private $db;

    public function __construct($conexion) {
        $this->db = $conexion;
    }

    // Crear nueva publicación (queda en estado pendiente)
    public function crearPublicacion($id_usuario, $mundial, $categoria, $titulo, $contenido, $mediaData, $tipoMultimedia, $pais = null)
    {
        try {
            $stmt = $this->db->prepare("CALL sp_crear_publicacion(:id_usuario, :mundial, :categoria, :titulo, :contenido, :multimedia, :tipo_multimedia, :pais)");
            
            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->bindParam(':mundial', $mundial);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':titulo', $titulo);
            $stmt->bindParam(':contenido', $contenido);
            $stmt->bindParam(':multimedia', $mediaData, PDO::PARAM_LOB);
            $stmt->bindParam(':tipo_multimedia', $tipoMultimedia);
            $stmt->bindParam(':pais', $pais);

            return $stmt->execute();
        } catch (Exception $e) {
            return ["error" => $e->getMessage()];
        }
    }

    // Obtener publicaciones aprobadas (con conversión base64)
    public function obtenerPublicacionesAprobadas() {
        try {
            $stmt = $this->db->prepare("CALL sp_obtener_publicaciones_aprobadas()");
            $stmt->execute();
            $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($publicaciones as &$pub) {
                if (!empty($pub['multimedia'])) {
                    $mimeType = $pub['tipo_multimedia'] ?? 'image/jpeg';
                    $pub['multimedia'] = "data:$mimeType;base64," . base64_encode($pub['multimedia']);
                }
            }

            return $publicaciones;
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }

    // Obtener publicaciones pendientes (para admin)
    public function obtenerPendientes() {
        try {
            $stmt = $this->db->prepare("CALL sp_obtener_publicaciones_pendientes()");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }

    // Aprobar publicación
    public function aprobarPublicacion($id) {
        try {
            $stmt = $this->db->prepare("CALL sp_aprobar_publicacion(:id)");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (Exception $e) {
            return ["error" => $e->getMessage()];
        }
    }

    // Rechazar publicación
    public function rechazarPublicacion($id) {
        try {
            $stmt = $this->db->prepare("CALL sp_rechazar_publicacion(:id)");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (Exception $e) {
            return ["error" => $e->getMessage()];
        }
    }
}

?>
