// Public/js/mundiales-admin.js

// 1. Definimos la función para cargar datos (Reutilizable)
async function cargarMundiales() {
    const grid = document.querySelector('.worldcup-grid');
    const filteredPosts = document.querySelector(".filtered-posts");
    const worldCupsSection = document.querySelector(".world-cups");
    const filtersNav = document.querySelector(".filters");

    // --- AGREGADO: Ocultar Datos Curiosos ---
    const datosSection = document.querySelector('.datos-curiosos-section');
    if (datosSection) datosSection.style.display = 'none';

    // Aseguramos que la sección de mundiales sea visible y la de posts no
    if (worldCupsSection) worldCupsSection.style.display = "block";
    if (filteredPosts) filteredPosts.style.display = "none";
    
    // Opcional: Ocultar filtros en Inicio
    if (filtersNav) filtersNav.style.display = "none";

    if (!grid) return;

    // Mensaje de carga
    grid.innerHTML = "<p style='text-align:center; width:100%;'>Cargando mundiales...</p>";

    try {
        const res = await fetch('/api/mundiales');
        const data = await res.json();

        if (!data.success) {
            grid.innerHTML = "<p>Error al cargar mundiales.</p>";
            return;
        }

        const mundiales = data.mundiales;
        grid.innerHTML = ""; // Limpiar mensaje de carga

        if (mundiales.length === 0) {
            grid.innerHTML = "<p>No hay mundiales registrados por el administrador.</p>";
            return;
        }

        mundiales.forEach(m => {
            const div = document.createElement('div');
            div.classList.add('worldcup-item');
            
            const imagenSrc = m.logo ? m.logo : 'Imagenes/default.jpg';
            const descripcion = m.descripcion ? m.descripcion : '';

            div.innerHTML = `
                <div class="worldcup-img-container">
                    <img src="${imagenSrc}" alt="${m.nombre}" class="worldcup-img">
                </div>
                <div class="worldcup-name">${m.nombre}</div>
                <div class="worldcup-info" style="text-align:center; font-size:0.9em; color:#555;">
                    <span>${m.anio}</span> - <span>${m.sede}</span>
                </div>
                <div class="worldcup-desc" style="text-align:center; font-size:0.85em; color:#777; margin-top:8px; padding:0 10px; line-height:1.4;">
                    ${descripcion}
                </div>
            `;
            grid.appendChild(div);
        });

    } catch (err) {
        console.error('Error cargando mundiales:', err);
        grid.innerHTML = "<p>Error de conexión con el servidor.</p>";
    }
}

// 2. Inicialización y Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar al inicio
    cargarMundiales();

    const btnInicioPC = document.querySelector(".main-nav .nav-link[href='index.html']");
    const btnInicioMovil = document.getElementById("nav-inicio");

    // Función para manejar el clic en Inicio
    const handleInicioClick = (e) => {
        e.preventDefault(); 
        cargarMundiales();  
    };

    if (btnInicioPC) {
        btnInicioPC.addEventListener('click', handleInicioClick);
    }

    if (btnInicioMovil) {
        btnInicioMovil.addEventListener('click', handleInicioClick);
    }
});