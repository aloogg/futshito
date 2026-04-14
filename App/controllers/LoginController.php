<?php
require_once __DIR__ . '/../models/Usuario.php';

class LoginController {
    private $usuarioModel;

    public function __construct() {
        $this->usuarioModel = new Usuario();
    }

    public function login(string $email, string $password): array {
        $usuario = $this->usuarioModel->verificarPassword($email, $password);

        if ($usuario) {
            if(session_status() !== PHP_SESSION_ACTIVE) session_start();
            $_SESSION['usuario_id'] = $usuario['id_usuario'];
            $_SESSION['usuario_nombre'] = $usuario['nombre_completo'];

            // ESTE RETURN ES CLAVE - debe incluir el user.id
            return [
                'status' => 'success',
                'message' => 'Inicio de sesión exitoso',
                'user' => [
                    'id' => $usuario['id_usuario'],        // Asegúrate de que esto esté
                    'name' => $usuario['nombre_completo'], // Asegúrate de que esto esté  
                    'email' => $usuario['correo'],          // Asegúrate de que esto esté
                    'role' => $usuario['rol']
                ]
            ];
        } else {
            return ['status'=>'error','message'=>'Correo o contraseña incorrectos'];
        }
    }
}