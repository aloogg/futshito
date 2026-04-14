<?php
require_once __DIR__."/../models/Usuario.php";

class RegisterController {
    public function register($post, $files) {
        $usuario = new Usuario();

        // Foto como binario (opcional)
        $fotoBinario = null;
        if (!empty($files['foto']['tmp_name'])) {
            $fotoBinario = file_get_contents($files['foto']['tmp_name']);
        }

        $data = [
            'nombre' => $post['nombreCompleto'],
            'fecha' => $post['fechaNacimiento'],
            'foto' => $fotoBinario,
            'genero' => $post['genero'],
            'pais' => $post['paisNacimiento'],
            'nacionalidad' => $post['nacionalidad'],
            'correo' => $post['email'],
            'password' => $post['password']
        ];

        return $usuario->registrar($data);
    }
}
