<?php
try {
    $conexion = new PDO("mysql:host=localhost;port=3306;dbname=bd_capamundial", "root", "");
    echo "✅ Conexión exitosa";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
