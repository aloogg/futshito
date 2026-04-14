document.addEventListener("DOMContentLoaded", () => {
    const publicacionesLink = document.getElementById("link-publicaciones");
    const inicioLink = document.querySelector(".nav-link[href='index.html']");
    const filteredPosts = document.querySelector(".filtered-posts");
    const worldCups = document.querySelector(".world-cups");
    const filtersNav = document.querySelector(".filters");

    const vistasRegistradas = new Set();

    function limpiarContenido() {
        if(filteredPosts) filteredPosts.innerHTML = "";
        if(worldCups) worldCups.style.display = "none";

        const datosSection = document.querySelector('.datos-curiosos-section');
        if (datosSection) datosSection.style.display = 'none';
    }

    // ==========================================
    // CARGAR PUBLICACIONES
    // ==========================================
    if (publicacionesLink) {
        publicacionesLink.addEventListener("click", async (e) => {
            e.preventDefault();
            limpiarContenido();
            
            if (filtersNav) filtersNav.style.display = "flex"; 

            if(filteredPosts) {
                filteredPosts.style.display = "block";
                filteredPosts.innerHTML = "<p>Cargando...</p>";
            }

            try {
                const res = await fetch("/api/publicaciones/aprobadas");
                const data = await res.json();

                if (!data.success) {
                    filteredPosts.innerHTML = "<p>Error al cargar.</p>";
                    return;
                }

                await renderizarPublicaciones(data.publicaciones);

            } catch (err) {
                console.error("Error:", err);
                filteredPosts.innerHTML = "<p>Error de conexión.</p>";
            }
        });
    }

    async function renderizarPublicaciones(listaPublicaciones) {
        filteredPosts.innerHTML = "";

        if (listaPublicaciones.length === 0) {
            filteredPosts.innerHTML = "<p>No hay publicaciones.</p>";
            return;
        }

        const currentUserId = localStorage.getItem("userId");

        for (const p of listaPublicaciones) {
            
            // Verificar si el usuario ya dio like
            let likedByCurrentUser = false;
            if (currentUserId) {
                try {
                    const resLike = await fetch(`/api/user-liked?id_publicacion=${p._id}&id_usuario=${currentUserId}`);
                    const dataLike = await resLike.json();
                    likedByCurrentUser = dataLike.liked;
                } catch(e) { console.error(e); }
            }

            const div = document.createElement("div");
            div.className = "post-item";

            const heartIconClass = likedByCurrentUser ? "fa-solid" : "fa-regular";
            const fecha = new Date(p.fecha_creacion).toLocaleDateString();
            
            const vistas = p.contadores ? p.contadores.vistas : 0;

            div.innerHTML = `
                <h3>${p.titulo}</h3>
                <p><strong>Autor:</strong> ${p.usuario ? p.usuario.nombre : 'Anónimo'} | <span>${fecha}</span></p>
                <p><strong>Mundial:</strong> ${p.mundial} | <strong>Categoría:</strong> ${p.categoria ? p.categoria.nombre : ''}</p>
                <p>${p.contenido}</p>
                
                ${p.multimedia ? `<img src="${p.multimedia}" alt="Imagen del post" class="post-img">` : ""}

                <div class="acciones">
                    <button class="like-btn" data-id="${p._id}">
                        <i class="${heartIconClass} fa-heart"></i> 
                        <span class="like-count">${p.contadores ? p.contadores.likes : 0}</span>
                    </button>

                    <button class="comment-btn" data-id="${p._id}">
                        <i class="fa-regular fa-comment"></i>
                    </button>

                    <span class="views-indicator" style="margin-left: 15px; color: #666; font-size: 0.9em;">
                        <i class="fa-regular fa-eye"></i> <span id="vistas-${p._id}">${vistas}</span>
                    </span>
                </div>

                <div id="comentarios-${p._id}" class="comentarios-container" style="display:none;">
                    <div class="comentarios-list"></div>
                    <input type="text" class="comentario-input" placeholder="Escribe un comentario...">
                    <button class="comentario-submit" data-id="${p._id}">Enviar</button>
                </div>
            `;
            
            filteredPosts.appendChild(div);
        }
        filteredPosts.style.display = "block";
    }

    // CLICK EN LIKE
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".like-btn");
        if (!btn) return;

        const id_publicacion = btn.dataset.id;
        const currentUserId = localStorage.getItem("userId");

        if (!currentUserId) {
            alert("Debes iniciar sesión para dar like");
            return;
        }

        const icon = btn.querySelector("i");
        const counter = btn.querySelector(".like-count");

        try {
            const res = await fetch("/api/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_publicacion, id_usuario: currentUserId })
            });

            const result = await res.json();
            if (!result.success) return alert(result.message);

            if (result.action === "liked") {
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");
            } else {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            }
            counter.textContent = result.total;

        } catch(err) {
            console.error(err);
        }
    });

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".comment-btn");
        if (!btn) return;

        const id = btn.dataset.id;
        const container = document.getElementById(`comentarios-${id}`);
        const lista = container.querySelector(".comentarios-list");

        if (!vistasRegistradas.has(id)) {
            vistasRegistradas.add(id); 
            
            fetch('/api/registrar-vista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_publicacion: id })
            }).then(() => {
                
                const viewCounter = document.getElementById(`vistas-${id}`);
                if(viewCounter) {
                    let val = parseInt(viewCounter.textContent) || 0;
                    viewCounter.textContent = val + 1;
                }
            }).catch(err => console.error("Error al registrar vista", err));
        }

        if (container.style.display === "none") {
            container.style.display = "block";
            lista.innerHTML = "<small>Cargando...</small>";
            
            try {
                const res = await fetch(`/api/comentarios?id_publicacion=${id}`);
                const data = await res.json();
                
                lista.innerHTML = "";
                if(data.success && data.comentarios.length > 0) {
                    data.comentarios.forEach(c => {
                        lista.innerHTML += `<div class="comentario-item">
                            <strong>${c.autor}:</strong> ${c.comentario}
                            <i class="fa-solid fa-flag report-btn" data-id="${c.id_comentario}" style="cursor:pointer; color:#dc3545; margin-left:10px; font-size:0.9em;" title="Reportar comentario"></i>
                        </div>`;
                    });
                } else {
                    lista.innerHTML = "<small>Sé el primero en comentar.</small>";
                }
            } catch(err) { console.error(err); }

        } else {
            container.style.display = "none";
        }
    });

    // ENVIAR COMENTARIO
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".comentario-submit");
        if (!btn) return;

        const id_publicacion = btn.dataset.id;
        const container = document.getElementById(`comentarios-${id_publicacion}`);
        const input = container.querySelector(".comentario-input");
        const texto = input.value.trim();
        const currentUserId = localStorage.getItem("userId");

        if (!currentUserId) return alert("Inicia sesión para comentar");
        if (!texto) return;

        try {
            const res = await fetch("/api/comentarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id_publicacion, 
                    id_usuario: currentUserId, 
                    comentario: texto 
                })
            });
            
            const data = await res.json();
            if(data.success) {
                input.value = "";
                const lista = container.querySelector(".comentarios-list");
                if(lista.innerHTML.includes("Sé el primero")) lista.innerHTML = "";
                
                const nombreUsuario = localStorage.getItem("userName") || "Yo";
                // Cuando el usuario recién comenta, no mostramos la bandera (no se va a reportar a sí mismo)
                lista.innerHTML += `<div class="comentario-item">
                    <strong>${nombreUsuario}:</strong> ${texto}
                </div>`;
            }

        } catch(err) { console.error(err); }
    });

// ==========================================
    // REPORTAR COMENTARIO
    // ==========================================
    document.addEventListener("click", async (e) => {
        const btnReport = e.target.closest(".report-btn");
        if (!btnReport) return;

        const id_comentario = btnReport.dataset.id;
        
        const comentarioItem = btnReport.closest(".comentario-item");

        if (!confirm("¿Seguro que deseas reportar este comentario por contenido inapropiado?")) {
            return;
        }

        try {
            const res = await fetch(`/api/comentarios/${id_comentario}/reportar`, { 
                method: 'PUT' 
            });
            const data = await res.json();
            
            if (data.success) {
                alert("El comentario ha sido reportado y ocultado. Será revisado por un administrador.");
                
                if (comentarioItem) {
                    comentarioItem.style.display = "none";
                }
            } else {
                alert("Error al reportar: " + data.message);
            }
        } catch(err) { 
            console.error(err); 
            alert("Error de conexión al reportar.");
        }
    });

    // ==========================================
    // BUSCADOR EN TIEMPO REAL
    // ==========================================
    const searchInput = document.querySelector(".search-bar input");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {

            const searchTerm = e.target.value.toLowerCase().trim();

            const posts = document.querySelectorAll(".post-item");

            posts.forEach(post => {
                const titulo = post.querySelector("h3") ? post.querySelector("h3").textContent.toLowerCase() : "";
                
                const parrafos = post.querySelectorAll("p");
                let textoExtra = "";
                parrafos.forEach(p => textoExtra += p.textContent.toLowerCase() + " ");

                const contenidoCompleto = titulo + " " + textoExtra;

                if (contenidoCompleto.includes(searchTerm)) {
                    post.style.display = "block"; // Lo mostramos
                } else {
                    post.style.display = "none";  // Lo ocultamos
                }
            });
        });
    }

});