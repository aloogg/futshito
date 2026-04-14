document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();

    // Llenar el formulario con los datos actuales
    document.getElementById('nombre_completo').value = user.nombre_completo || '';
    document.getElementById('fecha_nacimiento').value = user.fecha_nacimiento || '';
    document.getElementById('genero').value = user.genero || 'Otro';
    document.getElementById('pais_nacimiento').value = user.pais_nacimiento || '';
    document.getElementById('nacionalidad').value = user.nacionalidad || '';

    // Guardar cambios
    document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosActualizados = {
            id_usuario: user.id_usuario || user.id || localStorage.getItem('userId'),
            nombre_completo: document.getElementById('nombre_completo').value.trim(),
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            genero: document.getElementById('genero').value,
            pais_nacimiento: document.getElementById('pais_nacimiento').value.trim(),
            nacionalidad: document.getElementById('nacionalidad').value.trim()
        };

        try {
            const response = await fetch('php/api.php?endpoint=updateProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            // 🚨 Leer como texto primero
            const rawText = await response.text();
            console.log("Respuesta del servidor:", rawText);

            // Intentar parsear manualmente
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                console.error("JSON inválido recibido:", parseError, rawText);

                //ocurre un error pero realmente si cambia el 

                // alert("Ocurrió un error al guardar los cambios (respuesta inválida del servidor).");
                return;
            }

            // Revisar estado
            if (data.status === 'success') {
                alert('Perfil actualizado correctamente.');

                // Actualizar datos en localStorage
                const updatedUser = { ...user, ...datosActualizados };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                window.location.href = 'perfil.html';
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert('queso.');
        }
    });

    // Botón cancelar
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        window.location.href = 'perfil.html';
    });
});
