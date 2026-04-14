// ==========================================
// 1. SEGURIDAD E INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = 'index.html';
        return;
    }

    cargarCategoriasEnSelect(); 
    cargarPublicacionesPendientes();
    inicializarFormularioMundial(); 
    cargarComentariosReportados();
});

// ==========================================
// 2. LÓGICA PARA CREAR MUNDIAL
// ==========================================
function inicializarFormularioMundial() {

    // A) Manejo del botón "Seleccionar Imagen"
    const btnSelect = document.getElementById('btn-select-image');
    const fileInput = document.getElementById('imagen-mundial');
    const fileNameSpan = document.getElementById('selected-image-name');

    if (btnSelect && fileInput) {
        btnSelect.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name;
            } else {
                fileNameSpan.textContent = "Ningún archivo seleccionado";
            }
        });
    }

    // B) Envío del Formulario al Backend
    const formMundial = document.getElementById('mundial-form');
    if (formMundial) {
        formMundial.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capturar valores
            const nombre = document.getElementById('nombre-mundial').value;
            const anio = document.getElementById('anio-mundial').value;
            const sede = document.getElementById('sede-mundial').value;
            const categoria = document.getElementById('categoria-mundial').value;
            const resena = document.getElementById('resena-mundial').value;
            const imagen = document.getElementById('imagen-mundial').files[0];

            // 2. Validar
            if (!nombre || !anio || !sede || !categoria) {
                alert("Por favor completa los campos obligatorios y selecciona una categoría.");
                return;
            }

            // 3. FormData
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('anio', anio);
            formData.append('sede', sede);
            formData.append('descripcion', resena);
            formData.append('id_categoria', categoria);
            
            if (imagen) {
                formData.append('logo', imagen); 
            }

            // 4. Enviar al servidor
            try {
                const res = await fetch('/api/mundiales', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await res.json();

                if (data.success) {
                    alert("✅ Mundial creado exitosamente");
                    formMundial.reset();
                    fileNameSpan.textContent = "Ningún archivo seleccionado";
                } else {
                    alert("❌ Error: " + data.message);
                }

            } catch (err) {
                console.error(err);
                alert("Error de conexión con el servidor");
            }
        });
    }
}

// ==========================================
// 3. CREAR CATEGORÍA
// ==========================================
async function crearCategoria() {
    const nombreInput = document.getElementById('categoria');
    const mensaje = document.getElementById('mensaje-categoria');
    const nombre = nombreInput.value.trim();

    if (!nombre) {
        mensaje.textContent = "El nombre es obligatorio";
        mensaje.style.color = "red";
        return;
    }

    try {
        const res = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        const data = await res.json();

        if (data.success) {
            mensaje.textContent = "Categoría creada correctamente";
            mensaje.style.color = "green";
            nombreInput.value = '';
            cargarCategoriasEnSelect(); // Actualizar lista
        } else {
            mensaje.textContent = data.message;
        }
    } catch (err) {
        console.error(err);
        mensaje.textContent = "Error al crear categoría";
    }
}

// ==========================================
// 4. CARGAR PUBLICACIONES PENDIENTES
// ==========================================
async function cargarPublicacionesPendientes() {
    const contenedor = document.getElementById('pendientes');
    contenedor.innerHTML = '<p>Cargando...</p>';

    try {
        const res = await fetch("/api/publicaciones/pendientes");
        const data = await res.json();

        if (!data.success) {
            contenedor.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        const publicaciones = data.publicaciones;

        if (!publicaciones.length) {
            contenedor.innerHTML = '<p>No hay publicaciones pendientes.</p>';
            return;
        }

        contenedor.innerHTML = publicaciones.map(pub => `
            <div class="publicacion-card" style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px; background: white;">
                <h3>${pub.titulo}</h3>
                <p><strong>Autor:</strong> ${pub.usuario ? pub.usuario.nombre : 'Desconocido'}</p>
                <p><strong>Categoría:</strong> ${pub.categoria ? pub.categoria.nombre : 'Sin categoría'}</p>
                <p>${pub.contenido}</p>
                ${pub.multimedia ? `<img src="${pub.multimedia}" style="max-width:200px; border-radius:5px; margin: 10px 0;">` : ''}
                <div class="acciones" style="margin-top:10px;">
                    <button onclick="aprobarPublicacion('${pub._id}')" style="background:green; color:white; padding:5px 10px; cursor:pointer; border:none; border-radius:4px; margin-right:5px;">Aprobar</button>
                    <button onclick="rechazarPublicacion('${pub._id}')" style="background:red; color:white; padding:5px 10px; cursor:pointer; border:none; border-radius:4px;">Rechazar</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = '<p>Error de conexión al cargar publicaciones</p>';
    }
}

// ==========================================
// 5. APROBAR / RECHAZAR LÓGICA
// ==========================================
async function aprobarPublicacion(id) {
    if(!confirm("¿Aprobar esta publicación?")) return;

    try {
        const res = await fetch(`/api/publicaciones/${id}/aprobar`, { method: 'PUT' });
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Publicación aprobada");
            cargarPublicacionesPendientes();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Error de conexión");
    }
}

async function rechazarPublicacion(id) {
    if(!confirm("¿Eliminar esta publicación permanentemente?")) return;

    try {
        const res = await fetch(`/api/publicaciones/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (data.success) {
            alert("🗑️ Publicación eliminada");
            cargarPublicacionesPendientes();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Error de conexión");
    }
}

// ==========================================
// 6. UTILIDADES
// ==========================================
async function cargarCategoriasEnSelect() {
    try {
        const res = await fetch('/api/categorias');
        const data = await res.json();
        
        const selectMundial = document.getElementById('categoria-mundial');
        
        if (selectMundial && data.success) {
            selectMundial.innerHTML = '<option value="">Selecciona una categoría</option>';
            data.categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = cat.nombre;
                selectMundial.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Error cargando categorías:', err);
    }
}

// Logout
function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}

// ==========================================
// 7. COMENTARIOS REPORTADOS
// ==========================================
async function cargarComentariosReportados() {
    const contenedor = document.getElementById("comentarios-reportados");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const res = await fetch("/api/comentarios/reportados");
        const data = await res.json();

        if (!data.success) {
            contenedor.innerHTML = `<p>Error al cargar comentarios.</p>`;
            return;
        }

        if (data.comentarios.length === 0) {
            contenedor.innerHTML = "<p>No hay comentarios reportados.</p>";
            return;
        }

        contenedor.innerHTML = data.comentarios.map(c => `
            <div style="border:1px solid #f5c6cb; padding:15px; margin-bottom:10px; border-radius:8px; background: #fff3f3;">
                <p style="margin: 0 0 10px 0;"><strong>🚩 Autor:</strong> ${c.autor}</p>
                <p style="font-style: italic;">"${c.comentario}"</p>
                <div style="margin-top:10px;">
                    <button onclick="perdonarComentario('${c._id}')" style="background:#28a745; color:white; padding:5px 10px; cursor:pointer; border:none; border-radius:4px; margin-right:5px;">Ignorar Reporte</button>
                    <button onclick="eliminarComentario('${c._id}')" style="background:#dc3545; color:white; padding:5px 10px; cursor:pointer; border:none; border-radius:4px;">Eliminar Comentario</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = "<p>Error de conexión.</p>";
    }
}

async function perdonarComentario(id) {
    try {
        await fetch(`/api/comentarios/${id}/perdonar`, { method: 'PUT' });
        cargarComentariosReportados(); // Recargar la lista tras perdonar
    } catch (err) {
        alert("Error al procesar");
    }
}

async function eliminarComentario(id) {
    if(!confirm("¿Borrar este comentario definitivamente?")) return;
    try {
        await fetch(`/api/comentarios/${id}`, { method: 'DELETE' });
        cargarComentariosReportados(); // Recargar la lista tras eliminar
    } catch (err) {
        alert("Error al procesar");
    }
}