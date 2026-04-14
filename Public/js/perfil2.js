document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = await Auth.fetchUserProfile() || Auth.getUser();

    // Mostrar datos en la sección de perfil
    displayUserProfile(user);

    // Cargar publicaciones del usuario
    cargarPublicaciones(user.id_usuario || user.id);

    // Botón regresar al inicio
    document.getElementById('btn-regresar').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Modal de edición
    const modal = document.getElementById('edit-modal');
    const btnEditar = document.getElementById('btn-editar');
    const closeModal = modal.querySelector('.close');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Abrir modal y llenar formulario
    btnEditar.addEventListener('click', () => {
        document.getElementById('nombre_completo').value = user.nombre_completo || '';
        document.getElementById('fecha_nacimiento').value = user.fecha_nacimiento || '';
        document.getElementById('genero').value = user.genero || 'Otro';
        document.getElementById('pais_nacimiento').value = user.pais_nacimiento || '';
        document.getElementById('nacionalidad').value = user.nacionalidad || '';
        modal.style.display = 'block';
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    btnCancelar.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Guardar cambios del modal
    document.getElementById('edit-profile-form').addEventListener('submit', async e => {
        e.preventDefault();

        const datosActualizados = {
            id_usuario: user.id_usuario || user.id,
            nombre_completo: document.getElementById('nombre_completo').value.trim(),
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            genero: document.getElementById('genero').value,
            pais_nacimiento: document.getElementById('pais_nacimiento').value.trim(),
            nacionalidad: document.getElementById('nacionalidad').value.trim()
        };

        try {
            console.log("Enviando datos al servidor:", datosActualizados);

            const response = await fetch('./Public/php/api.php?endpoint=updateProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            console.log("Respuesta cruda:", response);

            // Antes de parsear, leemos el texto completo para ver si PHP está arrojando errores o warnings
            const rawText = await response.text();
            console.log("Texto recibido del servidor:", rawText);

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                throw new Error("La respuesta no es JSON válido: " + parseError.message);
            }

            if (data.status === 'success') {
                alert('Perfil actualizado correctamente.');
                modal.style.display = 'none';

                // Actualizar datos visibles y localStorage
                displayUserProfile(datosActualizados);
                Auth.updateUser(datosActualizados);
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            //console.error('Error al actualizar perfil:', error);
            alert('Ocurrió un error al guardar los cambios. Revisa la consola para más detalles.');
        }

            });
        });

// Función para mostrar datos de usuario en la página
function displayUserProfile(user) {
    document.getElementById('profile-name').textContent = user.nombre_completo || 'No disponible';
    document.getElementById('profile-email').textContent = user.correo || user.email || 'No disponible';
}

// Función para cargar publicaciones del usuario
async function cargarPublicaciones(userId) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    try {
        const response = await fetch(`./Public/php/api.php?endpoint=userPosts&userId=${userId}`);
        const data = await response.json();

        if (data.status === 'success' && data.posts.length > 0) {
            data.posts.forEach(pub => {
                const div = document.createElement('div');
                div.className = 'post-card';
                div.innerHTML = `
                    <h3>${pub.titulo}</h3>
                    <p>${pub.descripcion}</p>
                    <p>💛 ${pub.likes || 0} | 💬 ${pub.comentarios || 0} | 👀 ${pub.vistas || 0}</p>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>No hay publicaciones aún.</p>';
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        container.innerHTML = '<p>Error al cargar publicaciones.</p>';
        mostrarPublicacionesEjemplo(container);
    }
}

// Publicaciones de ejemplo mientras no tengas API
function mostrarPublicacionesEjemplo(container) {
    const publicaciones = [
        { titulo: "Copa Mundial 2022", descripcion: "Argentina campeón 2022", likes: 980, comentarios: 1200, vistas: 4500 },
        { titulo: "Récord FIFA", descripcion: "Pelé leyenda mundial", likes: 720, comentarios: 875, vistas: 2100 }
    ];

    publicaciones.forEach(pub => {
        const div = document.createElement('div');
        div.className = 'post-card';
        div.innerHTML = `
            <h3>${pub.titulo}</h3>
            <p>${pub.descripcion}</p>
            <p>💛 ${pub.likes} | 💬 ${pub.comentarios} | 👀 ${pub.vistas}</p>
        `;
        container.appendChild(div);
    });
}
