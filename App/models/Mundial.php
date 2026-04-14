<?php
class Mundial {
    private $conn;
    private $table = 'Mundiales';

    public $id_mundial;
    public $nombre;
    public $anio;
    public $pais_sede;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY anio DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>