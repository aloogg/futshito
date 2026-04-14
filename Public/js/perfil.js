document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar sesión
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Cargar Datos del Usuario
    let userData = null; 

    async function cargarPerfil() {
        try {
            const res = await fetch(`/api/perfil/${userId}`);
            const data = await res.json();

            if (data.success) {
                userData = data.user;
                // Mostrar en el HTML
                document.getElementById('profile-name').textContent = userData.nombre_completo;
                document.getElementById('profile-email').textContent = userData.correo;
            } else {
                console.error("Error al cargar perfil");
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 3. Cargar Publicaciones del Usuario
    async function cargarMisPublicaciones() {
        const container = document.getElementById('posts-container');
        container.innerHTML = '<p>Cargando mis publicaciones...</p>';

        try {
            const res = await fetch(`/api/publicaciones/usuario/${userId}`);
            const data = await res.json();

            container.innerHTML = '';

            if (data.success && data.posts.length > 0) {
                data.posts.forEach(pub => {
                    const div = document.createElement('div');
                    div.className = 'post-card';

                    // 1. Categoria: verificamos si es objeto o texto
                    const categoriaTexto = pub.categoria ? (pub.categoria.nombre || pub.categoria) : '-';
                    // 2. Contenido: En la BD se llama 'contenido', en tu HTML anterior era 'descripcion'
                    const contenidoTexto = pub.contenido || pub.descripcion || '';
                    
                    div.innerHTML = `
                        <h3>${pub.titulo}</h3>
                        <p><strong>Mundial:</strong> ${pub.mundial || '-'}</p>
                        <p><strong>Categoría:</strong> ${categoriaTexto}</p>
                        <p>${contenidoTexto}</p>
                        
                        ${pub.multimedia ? `<img src="${pub.multimedia}" alt="Multimedia" class="post-img">` : ''}
                        
                        <div class="post-icons">
                            <span><i class="fa-regular fa-heart"></i> ${pub.contadores ? pub.contadores.likes : 0}</span>
                            <span><i class="fa-regular fa-comment"></i> ${pub.contadores ? pub.contadores.comentarios : 0}</span>
                            <span><i class="fa-regular fa-eye"></i> ${pub.contadores ? pub.contadores.vistas : 0}</span>
                        </div>
                    `;
                    container.appendChild(div);
                });
            } else {
                container.innerHTML = '<p>No has realizado ninguna publicación aún.</p>';
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p>Error al cargar publicaciones.</p>';
        }
    }

    // 4. Lógica del Modal de Edición
    const modal = document.getElementById('edit-modal');
    const btnEditar = document.getElementById('btn-editar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const closeModal = document.getElementById('close-modal');
    const formEditar = document.getElementById('edit-profile-form');

    // Abrir Modal y llenar datos
    btnEditar.addEventListener('click', () => {
        if (!userData) return;
        
        document.getElementById('nombre_completo').value = userData.nombre_completo || '';
        
        if (userData.fecha_nacimiento) {
            const fecha = new Date(userData.fecha_nacimiento);
            const formattedDate = fecha.toISOString().split('T')[0];
            document.getElementById('fecha_nacimiento').value = formattedDate;
        }

        document.getElementById('genero').value = userData.genero || 'otro';
        document.getElementById('pais_nacimiento').value = userData.pais_nacimiento || '';
        document.getElementById('nacionalidad').value = userData.nacionalidad || '';

        modal.style.display = 'block';
    });

    // Cerrar Modal
    const cerrar = () => modal.style.display = 'none';
    btnCancelar.addEventListener('click', cerrar);
    if(closeModal) closeModal.addEventListener('click', cerrar);
    window.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });

    // Guardar Cambios
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosActualizados = {
            nombre_completo: document.getElementById('nombre_completo').value,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            genero: document.getElementById('genero').value,
            pais_nacimiento: document.getElementById('pais_nacimiento').value,
            nacionalidad: document.getElementById('nacionalidad').value
        };

        try {
            const res = await fetch(`/api/perfil/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            const data = await res.json();

            if (data.success) {
                alert('Perfil actualizado correctamente.');
                localStorage.setItem("userName", data.user.nombre_completo);
                cargarPerfil(); 
                modal.style.display = 'none';
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor.');
        }
    });

    // 5. Botón Regresar
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Inicializar
    cargarPerfil();
    cargarMisPublicaciones();
});