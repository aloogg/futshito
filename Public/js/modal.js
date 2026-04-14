// Public/js/modal.js
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("createModal");
    const createBtn = document.getElementById("createPostBtn");
    const closeBtn = document.querySelector(".close");
    const loginBtn = document.getElementById("loginBtn");

    // Función para abrir el modal
    function openModal() {
        // Verificar si el usuario está logueado
        if (localStorage.getItem("isLoggedIn") === "true") {
            modal.style.display = "block";
        } else {
            // Si no está logueado, redirigir al login
            alert("Por favor inicia sesión para crear una publicación");
            window.location.href = "login.html";
        }
    }

    // Función para cerrar el modal
    function closeModal() {
        modal.style.display = "none";
    }

    // Event listeners
    if (createBtn) {
        createBtn.addEventListener("click", openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Cerrar modal al hacer click fuera del contenido
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Manejar el envío del formulario (opcional)
    const postForm = document.getElementById("create-post-form");
    if (postForm) {
        postForm.addEventListener("submit", function(e) {
            e.preventDefault();
            // Aquí iría tu lógica para crear la publicación
            console.log("Creando publicación...");
            closeModal();
        });
    }
});