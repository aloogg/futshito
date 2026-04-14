document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('createModal');
    const createPostBtn = document.getElementById('createPostBtn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const postForm = document.getElementById('create-post-form');
    
    // ==========================================
    // 1. NUEVO: CARGAR LAS CATEGORÍAS DESDE MONGO
    // ==========================================
    async function cargarCategorias() {
        const select = document.getElementById('post-category');
        if (!select) return; // Si no existe el select, no hacemos nada

        try {
            // Llamamos a la ruta que creamos en app.js
            const res = await fetch('/api/categorias');
            const data = await res.json();

            if (data.success) {
                // Limpiamos el select y dejamos la opción por defecto
                select.innerHTML = '<option value="">Selecciona una categoría</option>';

                // Recorremos las categorías que vinieron de la base de datos
                data.categorias.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.nombre; 
                    option.textContent = cat.nombre;
                    select.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Error al cargar categorías en el modal:", err);
        }
    }

    cargarCategorias();


    // ==========================================
    // 2. FUNCIONES DEL MODAL
    // ==========================================
    function openModal() {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            alert('Debe iniciar sesión para crear una publicación');
            window.location.href = 'login.html';
            return;
        }
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
  
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        postForm.reset();
    }
  
    if(createPostBtn) createPostBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
    window.addEventListener('click', function(event) {
        if (event.target === modal) closeModal();
    });
  
    // ==========================================
    // 3. ENVÍO DEL FORMULARIO
    // ==========================================
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
    
        if (localStorage.getItem("isLoggedIn") !== "true") {
            alert('Su sesión ha expirado. Inicie sesión nuevamente.');
            window.location.href = 'login.html';
            return;
        }
  
        const userId = localStorage.getItem("userId");
        
        // Preparamos los datos
        const formData = new FormData();
        formData.append("id_usuario", userId);
        formData.append("title", document.getElementById("post-title").value);
        formData.append("content", document.getElementById("post-content").value);
        formData.append("category", document.getElementById("post-category").value);
        formData.append("worldcup", document.getElementById("post-worldcup").value);
        formData.append("country", document.getElementById("post-country").value);
  
        const mediaInput = document.getElementById("post-media");
        if (mediaInput.files.length > 0) {
            formData.append("media", mediaInput.files[0]);
        }
  
        try {
            const res = await fetch("/api/publicaciones", {
                method: "POST",
                body: formData
            });
            
            const data = await res.json();
            console.log("Respuesta:", data);
    
            if (data.success) {
                alert("✅ Publicación creada con éxito.\n\nTu publicación está en espera de aprobación por el administrador.");
                closeModal();
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("⚠️ Error de conexión con el servidor.");
        }
    });
});