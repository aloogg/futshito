let activeTab = 'inicio'; // 'inicio', 'publicaciones', 'datos-curiosos'
let userPosts = [];       // posts de la API

document.addEventListener("DOMContentLoaded", () => {

    const publicacionesLink = document.getElementById("link-publicaciones");
    const inicioLink = document.querySelector(".nav-link[href='index.html']");
    const datosCuriososLink = document.getElementById("link-datos-curiosos");
    const filteredPosts = document.querySelector(".filtered-posts");
    const worldCups = document.querySelector(".world-cups");

    const navInicio = document.getElementById("nav-inicio");
    const navPublicaciones = document.getElementById("nav-publicaciones");
    const navDatosCuriosos = document.getElementById("nav-datos-curiosos");

    function limpiarContenido() {
        filteredPosts.innerHTML = "";
        worldCups.style.display = "none";
    }

    const currentUser = AppStorage.getCurrentUser();

    // Publicaciones de usuarios
    publicacionesLink.addEventListener("click", async (e) => {
        e.preventDefault();
        limpiarContenido();
        activeTab = 'publicaciones';

        try {
            const res = await fetch("/Capa/Public/php/api.php?endpoint=publicaciones-aprobadas");
            const data = await res.json();

            console.log("Datos recibidos:", data);

            if (!data.success || !Array.isArray(data.publicaciones)) {
                filteredPosts.innerHTML = "<p>Error al cargar publicaciones.</p>";
                return;
            }

            const currentUser = AppStorage.getCurrentUser();

            userPosts = await Promise.all(data.publicaciones.map(async p => {
                const multimedia = p.multimedia ? p.multimedia.startsWith("data:") ? p.multimedia : `data:image/jpeg;base64,${p.multimedia}` : "";
                let liked_by_current_user = false;

                if (currentUser) {
                    try {
                        const res = await fetch(`/Capa/Public/php/api.php?endpoint=user-liked&id_publicacion=${p.id_publicacion}&id_usuario=${currentUser.id_usuario}`);
                        const data = await res.json();
                        liked_by_current_user = data.success && data.liked;
                    } catch(err) {
                        console.error(err);
                    }
                }

                return { ...p, multimedia, likes: p.likes || 0, liked_by_current_user };
            }));

            filtrarYOrdenar(); // aplicar filtros y mostrar

        } catch (err) {
            console.error(err);
            filteredPosts.innerHTML = "<p>Error al cargar publicaciones.</p>";
        }
    });

    // Inicio (admin)
    inicioLink.addEventListener("click", () => {
        limpiarContenido();
        worldCups.style.display = "block";
    });

    // Datos Curiosos
    datosCuriososLink.addEventListener("click", async (e) => {
        e.preventDefault();
        limpiarContenido();

        try {
            const res = await fetch("/Capa/Public/php/api.php?action=datos-curiosos");
            const data = await res.json();

            filteredPosts.innerHTML = "";
            data.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("dc-item");
                div.innerHTML = `<h4>${item.titulo}</h4><p>${item.descripcion}</p>`;
                filteredPosts.appendChild(div);
            });
            filteredPosts.style.display = "block";
        } catch (err) {
            console.error(err);
            filteredPosts.innerHTML = "<p>Error al cargar datos curiosos.</p>";
        }
    });

    // ====== Búsqueda ======
    const searchInput = document.querySelector(".search-bar input");
    const searchButton = document.querySelector(".search-bar button");

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim().toLowerCase();
        realizarBusqueda(query);
    });

    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim().toLowerCase();
            realizarBusqueda(query);
        }
    });

    // ====== FILTROS POR SEDE ======
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const filter = e.target.getAttribute('data-filter');

            // Marcar botón activo
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            try {
                // Llamar al endpoint del filtro
                const resp = await fetch(`/Capa/Public/php/api.php?endpoint=filtrar-publicaciones&mundial=${filter}`);
                const data = await resp.json();

                if (data.success) {
                    mostrarPublicaciones(data.publicaciones); // tu función para renderizar posts
                } else {
                    console.error("Error al filtrar publicaciones:", data.message);
                }
            } catch (err) {
                console.error("Error al filtrar publicaciones:", err);
            }
        });
    });

// === Funciones reutilizables ===
async function cargarPublicaciones() {
    limpiarContenido();
    activeTab = 'publicaciones';

    try {
        const res = await fetch("/Capa/Public/php/api.php?endpoint=publicaciones-aprobadas");
        const data = await res.json();

        if (!data.success || !Array.isArray(data.publicaciones)) {
            filteredPosts.innerHTML = "<p>Error al cargar publicaciones.</p>";
            return;
        }

        const currentUser = AppStorage.getCurrentUser();

        userPosts = await Promise.all(data.publicaciones.map(async p => {
            const multimedia = p.multimedia ?
                (p.multimedia.startsWith("data:") ? p.multimedia : `data:image/jpeg;base64,${p.multimedia}`)
                : "";

            let liked_by_current_user = false;

            if (currentUser) {
                const r = await fetch(`/Capa/Public/php/api.php?endpoint=user-liked&id_publicacion=${p.id_publicacion}&id_usuario=${currentUser.id_usuario}`);
                const d = await r.json();
                liked_by_current_user = d.success && d.liked;
            }

            return { ...p, multimedia, liked_by_current_user };
        }));

        filtrarYOrdenar();

    } catch (err) {
        console.error(err);
        filteredPosts.innerHTML = "<p>Error al cargar publicaciones.</p>";
    }
}

function cargarInicio() {
    limpiarContenido();
    worldCups.style.display = "block";
}

async function cargarDatosCuriosos() {
    limpiarContenido();

    try {
        const res = await fetch("/Capa/Public/php/api.php?action=datos-curiosos");
        const data = await res.json();

        filteredPosts.innerHTML = "";
        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("dc-item");
            div.innerHTML = `<h4>${item.titulo}</h4><p>${item.descripcion}</p>`;
            filteredPosts.appendChild(div);
        });
        filteredPosts.style.display = "block";

    } catch (err) {
        console.error(err);
        filteredPosts.innerHTML = "<p>Error al cargar datos curiosos.</p>";
    }
}

// === Conectar sticky-nav ===
navPublicaciones.addEventListener("click", (e) => {
    e.preventDefault();
    cargarPublicaciones();
});

navInicio.addEventListener("click", (e) => {
    e.preventDefault();
    cargarInicio();
});

navDatosCuriosos.addEventListener("click", (e) => {
    e.preventDefault();
    cargarDatosCuriosos();
});

});





// === FUNCIONALIDAD DE LIKES ===
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".like-btn");
    if (!btn) return;

    const currentUser = AppStorage.getCurrentUser();

    if (!currentUser || !AppStorage.isLoggedIn()) {
        alert("Debes iniciar sesión para dar like");
        return;
    }

    const id_usuario = currentUser.id_usuario;
    const id_publicacion = btn.dataset.id;
    const icon = btn.querySelector("i");

    try {
        const res = await fetch("/Capa/Public/php/api.php?endpoint=like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_publicacion, id_usuario })
        });

        const result = await res.json();

        if (result.success) {
            // Actualizar contador sin llamar otro endpoint
            btn.querySelector(".like-count").textContent = result.total ?? 0;

            // Cambiar ícono según acción
            if (result.action === "liked") {
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");
            } else {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            }
        } else {
            alert(result.message);
        }


    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al dar like");
    }
});

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".comentario-submit");
    if (!btn) return;

    const currentUser = AppStorage.getCurrentUser();
    if (!currentUser || !AppStorage.isLoggedIn()) {
        alert("Debes iniciar sesión para comentar");
        return;
    }

    const id_publicacion = btn.dataset.id;
    const container = document.querySelector(`#comentarios-${id_publicacion}`);
    const input = container.querySelector(".comentario-input");
    const texto = input.value.trim();

    if (!texto) return alert("Escribe un comentario");

    try {
        const res = await fetch("/Capa/Public/php/api.php?endpoint=agregar-comentario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_publicacion,
                id_usuario: currentUser.id_usuario,
                comentario: texto
            })
        });

        const data = await res.json();

        if (data.success) {
            input.value = "";

            console.log("currentUser:", currentUser);

            // Recargar comentarios
            const lista = container.querySelector(".comentarios-list");
            const div = document.createElement("div");
            div.classList.add("comentario-item");
            div.innerHTML = `<strong>${currentUser.nombre_completo || "Usuario"}:</strong> ${texto} <small>Justo ahora</small>`;
            lista.appendChild(div);

        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al enviar el comentario");
    }
});

async function updateLikeCount(id_publicacion, counterElement) {
    const res = await fetch(`/Capa/Public/php/api.php?endpoint=likes-count&id_publicacion=${id_publicacion}`);
    const data = await res.json();
    counterElement.textContent = data.total ?? 0;
}

async function toggleLike(btn, id_publicacion) {
    const icon = btn.querySelector("i");
    const counter = btn.querySelector(".like-count");
    const currentUser = AppStorage.getCurrentUser();

    try {
        const res = await fetch("/Capa/Public/php/api.php?endpoint=like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_publicacion, id_usuario: currentUser.id_usuario })
        });
        const result = await res.json();

        if (!result.success) return alert(result.message);

        // Cambiar icono
        if (result.action === "liked") {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }

        // Actualizar contador
        const resCount = await fetch(`/Capa/Public/php/api.php?endpoint=likes-count&id_publicacion=${id_publicacion}`);
        const dataCount = await resCount.json();
        counter.textContent = dataCount.total ?? 0;

    } catch(err) {
        console.error(err);
        alert("Error al actualizar like");
    }
}

function filtrarYOrdenar() {
    const filteredPostsContainer = document.querySelector(".filtered-posts");
    filteredPostsContainer.innerHTML = "";

    console.log("Filtrando y mostrando posts:", userPosts);

    userPosts.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("post-item");

        // Formatear fecha de aprobación si la publicación está aprobada
        let fechaAprobacion = (p.aprobado && p.fecha_aprobacion)
            ? new Date(p.fecha_aprobacion).toLocaleDateString("es-MX", { 
                day: "2-digit", month: "short", year: "numeric" 
            })
            : "Sin aprobar";

            console.log("Aprobado:", p.aprobado, "Fecha aprobación:", p.fecha_aprobacion);


        div.innerHTML = `
            <h3>${p.titulo}</h3>
            <p><strong>Mundial:</strong> ${p.mundial || "-"}</p>
            <p><strong>Categoría:</strong> ${p.categoria || "-"}</p>
            <p>${p.descripcion || ""}</p>
            ${p.multimedia ? `<img src="${p.multimedia}" alt="post" class="post-img" />` : ""}
            <small>Aprobado: ${fechaAprobacion}</small>
            <div class="acciones">
                <button class="like-btn" data-id="${p.id_publicacion}">
                    <i class="${p.liked_by_current_user ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    <span class="like-count">${p.likes || 0}</span>
                </button>

                <button class="comment-btn" data-id="${p.id_publicacion}">
                    <i class="fa-regular fa-comment"></i>
                </button>
            </div>
            <div id="comentarios-${p.id_publicacion}" class="comentarios-container" style="display:none;">
                <div class="comentarios-list"></div>
                <input type="text" class="comentario-input" placeholder="Escribe un comentario..." />
                <button class="comentario-submit" data-id="${p.id_publicacion}">Enviar</button>
            </div>
        `;

        filteredPostsContainer.appendChild(div);
    });

    // Mostrar contenedor
    filteredPostsContainer.style.display = "block";

    
}

function mostrarResultados(posts) {
    const filteredPostsContainer = document.querySelector(".filtered-posts");
    filteredPostsContainer.innerHTML = "";

    if (!posts.length) {
        filteredPostsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    posts.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("post-item");

        // Formatear fecha de aprobación
        let fechaAprobacion = (p.aprobado && p.fecha_aprobacion)
            ? new Date(p.fecha_aprobacion).toLocaleDateString("es-MX", {
                day: "2-digit", month: "short", year: "numeric"
            })
            : "Sin aprobar";

        // Render completo con multimedia, likes y comentarios
        div.innerHTML = `
            <h3>${p.titulo}</h3>
            <p><strong>Mundial:</strong> ${p.mundial || "-"}</p>
            <p><strong>Categoría:</strong> ${p.categoria || "-"}</p>
            <p>${p.contenido || ""}</p>
            ${p.multimedia ? `<img src="${p.multimedia}" alt="post" class="post-img" />` : ""}
            <small>Aprobado: ${fechaAprobacion}</small>

            <div class="acciones">
                <button class="like-btn" data-id="${p.id_publicacion}">
                    <i class="fa-regular fa-heart"></i>
                    <span class="like-count">${p.likes || 0}</span>
                </button>

                <button class="comment-btn" data-id="${p.id_publicacion}">
                    <i class="fa-regular fa-comment"></i>
                </button>
            </div>

            <div id="comentarios-${p.id_publicacion}" class="comentarios-container" style="display:none;">
                <div class="comentarios-list"></div>
                <input type="text" class="comentario-input" placeholder="Escribe un comentario..." />
                <button class="comentario-submit" data-id="${p.id_publicacion}">Enviar</button>
            </div>
        `;

        filteredPostsContainer.appendChild(div);
    });

    filteredPostsContainer.style.display = "block";
}

// === MOSTRAR COMENTARIOS Y REGISTRAR VISTA ===
const vistasRegistradas = new Set();

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".comment-btn");
  if (!btn) return;

    if (btn) console.log("Botón clickeado:", btn, "ID:", btn.dataset.id);

  const id_publicacion = btn.dataset.id;
  const currentUser = AppStorage.getCurrentUser();
  const container = document.querySelector(`#comentarios-${id_publicacion}`);
  const lista = container.querySelector(".comentarios-list");

  if (!container || !lista) return;

  // Registrar vista (solo una vez por sesión)
  if (currentUser && currentUser.id_usuario && !vistasRegistradas.has(id_publicacion)) {
    vistasRegistradas.add(id_publicacion);
    try {
      await fetch("/Capa/Public/php/api.php?endpoint=registrar-vista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_publicacion,
          id_usuario: currentUser.id_usuario
        })
      });
      console.log(`Vista registrada para publicación ${id_publicacion}`);
    } catch (err) {
      console.error("Error registrando vista:", err);
    }
  }

  // Mostrar/ocultar comentarios
  container.style.display = container.style.display === "block" ? "none" : "block";

  if (container.style.display === "block") {
    try {
      const res = await fetch(`/Capa/Public/php/api.php?endpoint=comentarios&id_publicacion=${id_publicacion}`);
      const data = await res.json();

      lista.innerHTML = "";
      if (data.success) {
        if (data.comentarios.length === 0) {
          lista.innerHTML = "<p>Aún no hay comentarios. ¡Sé el primero en comentar!</p>";
        } else {
          data.comentarios.forEach(c => {
            const div = document.createElement("div");
            div.classList.add("comentario-item");
            div.innerHTML = `<strong>${c.autor}:</strong> ${c.comentario} <small>${c.fecha}</small>            
            <button class="reportar-btn" data-id="${c.id_comentario}" title="Reportar comentario">🚩</button>`; 

            lista.appendChild(div);

          });
        }
      } else {
        lista.innerHTML = "<p>No se pudieron cargar los comentarios.</p>";
      }
    } catch (err) {
      console.error(err);
      lista.innerHTML = "<p>Error al cargar comentarios.</p>";
    }
  }
});

document.addEventListener("click", async (e) => {
  const reportBtn = e.target.closest(".reportar-btn");
  if (!reportBtn) return;

  const id_comentario = reportBtn.dataset.id;

  if (confirm("¿Deseas reportar este comentario?")) {
    try {
      const res = await fetch("/Capa/Public/php/api.php?endpoint=reportar-comentario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_comentario })
      });

      const data = await res.json();
      if (data.success) {
        alert("Comentario reportado con éxito ✅");
      } else {
        alert("No se pudo reportar el comentario ❌");
      }
    } catch (err) {
      console.error("Error reportando comentario:", err);
      alert("Error al conectar con el servidor");
    }
  }
});

function realizarBusqueda(query) {
    if (!query) return filtrarYOrdenar(); // si la búsqueda está vacía, mostrar todo

    const resultados = userPosts.filter(p =>
        (p.titulo || "").toLowerCase().includes(query) ||
        (p.contenido || "").toLowerCase().includes(query) ||  // tu columna real
        (p.categoria || "").toLowerCase().includes(query) ||
        (p.mundial || "").toLowerCase().includes(query)
    );

    mostrarResultados(resultados);
}

async function realizarBusqueda(query) {
    try {
        // Llamamos al nuevo endpoint del backend
        const res = await fetch(`/Capa/Public/php/api.php?endpoint=buscar-publicaciones&q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.success) {
            alert("Error al buscar publicaciones");
            return;
        }

        mostrarResultados(data.publicaciones);
    } catch (err) {
        console.error("Error en la búsqueda:", err);
    }
}

