<?php
class Database {
    private $host = "localhost";
    private $db_name = "bd_capamundial";
    private $username = "root";
    private $password = "";
    private $port = 3307;
    public $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8mb4");
        } catch(PDOException $exception) {
            // Devuelve JSON en vez de texto
            echo json_encode([
                "success" => false,
                "message" => "Error de conexión: " . $exception->getMessage()
            ]);
            exit; // Termina script
        }
        return $this->conn;
    }
}
