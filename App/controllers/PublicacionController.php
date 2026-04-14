<?php

class PublicacionController {
    private $db;

    public function __construct($conexion) {
        $this->db = $conexion;
    }

    // Obtener publicaciones aprobadas
    public function aprobadas() {
        try {
            // Suponiendo que el modelo ya usa SP internamente
            $modelo = new Publicacion($this->db);
            $publicaciones = $modelo->obtenerPublicacionesAprobadas();

            echo json_encode([
                'success' => true,
                'publicaciones' => $publicaciones
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener publicaciones: ' . $e->getMessage()
            ]);
        }
    }

    // Obtener publicaciones pendientes (usa SP)
    public function pendientes() {
        try {
            $stmt = $this->db->prepare("CALL sp_obtener_publicaciones_pendientes()");
            $stmt->execute();
            $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'publicaciones' => $publicaciones
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener publicaciones pendientes: ' . $e->getMessage()
            ]);
        }
    }

    // Aprobar publicación (usa SP)
    // public function aprobar() {
    //     // $id = $_POST['id_publicacion'] ?? null;

    //     $data = json_decode(file_get_contents("php://input"), true);
    //     $id = $data['id_publicacion'] ?? null;


    //     if (!$id) {
    //         echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    //         return;
    //     }

    //     try {
    //         $stmt = $this->db->prepare("CALL sp_aprobar_publicacion(:id)");
    //         $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    //         $stmt->execute();

    //         echo json_encode([
    //             'success' => true,
    //             'message' => '✅ Publicación aprobada'
    //         ]);
    //     } catch (PDOException $e) {
    //         echo json_encode([
    //             'success' => false,
    //             'message' => '❌ Error al aprobar la publicación: ' . $e->getMessage()
    //         ]);
    //     }
    // }

    public function aprobar() {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id_publicacion'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
        return;
    }

    try {
        $stmt = $this->db->prepare("CALL sp_aprobar_publicacion(:id)");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => '✅ Publicación aprobada'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al aprobar la publicación: ' . $e->getMessage()
        ]);
    }
}


    // Rechazar publicación (usa SP)
    public function rechazar() {

        // $id = $_POST['id_publicacion'] ?? null;

        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id_publicacion'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
            return;
        }

        try {
            $stmt = $this->db->prepare("CALL sp_rechazar_publicacion(:id)");
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode([
                'success' => true,
                'message' => '🗑️ Publicación rechazada'
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => '❌ Error al rechazar la publicación: ' . $e->getMessage()
            ]);
        }
    }
}

?>
