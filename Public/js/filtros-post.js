// Public/js/filtro.js

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortSelect");

  // 🔽 Mostrar/ocultar filtros
  const toggleFilters = document.getElementById("toggleFilters");
  const filterSection = document.getElementById("filterSection");
  toggleFilters.addEventListener("click", () => {
    const visible = filterSection.style.display === "block";
    filterSection.style.display = visible ? "none" : "block";
    toggleFilters.textContent = visible ? "🔽 Mostrar filtros" : "🔼 Ocultar filtros";
  });

  // Filtro actual
  let currentFilter = "all";
  let currentSort = "chronological";

  // 👇 Evento de clic en los filtros
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      aplicarFiltrosYOrden();
    });
  });

  // 👇 Evento de cambio de ordenamiento
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    aplicarFiltrosYOrden();
  });

  // 💡 Función principal de filtrado y ordenamiento
  function aplicarFiltrosYOrden() {
    if (activeTab !== "publicaciones") {
      console.log("⚠️ Filtros solo se aplican en la pestaña de publicaciones.");
      return;
    }

    if (!Array.isArray(userPosts) || userPosts.length === 0) {
      console.log("❌ No hay publicaciones de usuario cargadas aún.");
      return;
    }

    let postsFiltrados = [...userPosts];

    // --- FILTRAR ---
    if (currentFilter !== "all") {
      postsFiltrados = postsFiltrados.filter(p => 
        (p.mundial || "").toLowerCase() === currentFilter.toLowerCase()
      );
    }

    // --- ORDENAR ---
    if (currentSort === "likes") {
      postsFiltrados.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (currentSort === "country") {
      postsFiltrados.sort((a, b) => (a.pais || "").localeCompare(b.pais || ""));
    } else if (currentSort === "comments") {
      postsFiltrados.sort((a, b) => (b.comentarios || 0) - (a.comentarios || 0));
    } else {
      postsFiltrados.sort((a, b) => new Date(b.fecha_aprobacion) - new Date(a.fecha_aprobacion));
    }

    // --- Mostrar ---
    console.log("✅ Mostrando posts filtrados:", postsFiltrados);
    mostrarPublicacionesFiltradas(postsFiltrados);
  }

  // Función para renderizar en el DOM
  function mostrarPublicacionesFiltradas(posts) {
    const container = document.querySelector(".filtered-posts");
    container.innerHTML = "";

    posts.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("post-item");
      div.innerHTML = `
        <h3>${p.titulo}</h3>
        <p><strong>Mundial:</strong> ${p.mundial || "-"}</p>
        <p><strong>Categoría:</strong> ${p.categoria || "-"}</p>
        <p>${p.descripcion || ""}</p>
        ${p.multimedia ? `<img src="${p.multimedia}" class="post-img"/>` : ""}
        <div class="acciones">
          <button class="like-btn" data-id="${p.id_publicacion}">
            <i class="${p.liked_by_current_user ? "fa-solid" : "fa-regular"} fa-heart"></i>
            <span class="like-count">${p.likes || 0}</span>
          </button>
          <button class="comment-btn" data-id="${p.id_publicacion}">
            <i class="fa-regular fa-comment"></i>
          </button>
        </div>
      `;
      container.appendChild(div);
    });
  }
});
