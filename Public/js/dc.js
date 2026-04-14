document.addEventListener('DOMContentLoaded', () => {
    const datosCuriososLink = document.getElementById('link-datos-curiosos');
    
    // Referencias a las otras secciones para ocultarlas
    const worldCupsSection = document.querySelector('.world-cups');
    const filteredPostsSection = document.querySelector('.filtered-posts');
    const filtersNav = document.querySelector('.filters'); 

    if (datosCuriososLink) {
        datosCuriososLink.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. OCULTAR OTRAS SECCIONES
            if (worldCupsSection) worldCupsSection.style.display = 'none';
            if (filteredPostsSection) filteredPostsSection.style.display = 'none';
            if (filtersNav) filtersNav.style.display = 'none';

            // 2. VERIFICAR SI YA EXISTE EL CONTENEDOR
            let curiososContainer = document.querySelector('.datos-curiosos-section');
            
            if (curiososContainer) {
                curiososContainer.style.display = 'block';
                return; // Si ya existe, no lo volvemos a crear
            }

            // 3. CREAR CONTENEDOR
            curiososContainer = document.createElement('section');
            curiososContainer.classList.add('datos-curiosos-section');
            curiososContainer.style.padding = "20px";
            curiososContainer.style.maxWidth = "1200px";
            curiososContainer.style.margin = "0 auto";

            curiososContainer.innerHTML = `
                <h2 class="section-title" style="text-align:center; margin-bottom:20px;">⚽ Datos Curiosos de la Comunidad</h2>
                
                <div class="agregar-dato-curioso" style="display:flex; gap:10px; justify-content:center; margin-bottom:30px;">
                    <input type="text" id="nuevo-dato" placeholder="Escribe un dato curioso..." style="padding:10px; width:60%; border:1px solid #ccc; border-radius:5px;">
                    <button id="btn-agregar-dato" style="padding:10px 20px; background:#0056b3; color:white; border:none; border-radius:5px; cursor:pointer;">Agregar</button>
                </div>

                <div class="curiosos-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:20px; margin-bottom:50px;">
                    <p>Cargando datos...</p>
                </div>

                <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;">

                <h2 class="section-title" style="text-align:center; margin-bottom:20px;">🏟️ Jugadores Destacados (TheSportsDB API)</h2>
                <div class="jugadores-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:20px;">
                    <p>Cargando jugadores...</p>
                </div>
            `;

            // Insertar antes del footer
            const footer = document.querySelector('.footer');
            if(footer) {
                document.body.insertBefore(curiososContainer, footer);
            } else {
                document.body.appendChild(curiososContainer);
            }

            // --- INICIALIZAR FUNCIONES ---
            const btnAgregar = curiososContainer.querySelector('#btn-agregar-dato');
            const inputDato = curiososContainer.querySelector('#nuevo-dato');

            // Agregar Dato
            btnAgregar.addEventListener('click', async () => {
                const valor = inputDato.value.trim();
                if (!valor) return alert('Escribe algo interesante...');

                try {
                    const res = await fetch('/api/datos-curiosos', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ dato: valor })
                    });
                    const result = await res.json();
                    
                    if (result.success) {
                        inputDato.value = '';
                        alert("¡Dato guardado!");
                        cargarDatosInternos(curiososContainer); // Recargar
                    } else {
                        alert("Error: " + result.message);
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error de conexión al guardar.');
                }
            });

            // Cargar datos
            cargarDatosInternos(curiososContainer);
            cargarApiExterna(curiososContainer);
        });
    }

    // --- FUNCIONES AUXILIARES ---

    async function cargarDatosInternos(container) {
        const grid = container.querySelector('.curiosos-grid');
        try {
            const res = await fetch('/api/datos-curiosos');
            const data = await res.json();

            grid.innerHTML = ""; 

            if (data.success && data.datos.length > 0) {
                data.datos.forEach(d => {
                    const card = document.createElement('div');
                    card.style.cssText = "background:white; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); border-left: 4px solid #0056b3;";
                    card.innerHTML = `
                        <p style="font-size:1.1em; color:#333; margin:0;">"${d.texto}"</p>
                        <small style="color:#888; display:block; margin-top:10px;">📅 ${new Date(d.fecha).toLocaleDateString()}</small>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No hay datos curiosos aún. ¡Sé el primero!</p>";
            }
        } catch(err) {
            console.error(err);
            grid.innerHTML = "<p>Error de conexión (BD Local).</p>";
        }
    }

async function cargarApiExterna(container) {
        const grid = container.querySelector('.jugadores-grid');
        grid.innerHTML = "<p>Cargando leyendas del fútbol...</p>";

        try {
            const res = await fetch('/api/jugadores-externos');
            const data = await res.json();

            grid.innerHTML = "";

            if (data && data.player) {
                data.player.forEach(p => {
                    const card = document.createElement('div');
                    card.className = "jugador-card";
                    card.style.cssText = "background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); text-align:center; transition: transform 0.2s;";
                    
                    const img = p.strThumb; 
                    
                    card.innerHTML = `
                        <div style="height: 200px; overflow: hidden;">
                            <img src="${img}" style="width:100%; height:100%; object-fit:cover; object-position: top;">
                        </div>
                        <div style="padding:15px;">
                            <h4 style="margin:0 0 5px 0; color:#333; font-size:1.1em;">${p.strPlayer}</h4>
                            <span style="background:#eee; color:#555; padding:2px 8px; border-radius:10px; font-size:0.8em;">${p.strNationality}</span>
                            <p style="font-size:0.9em; color:#888; margin-top:5px;">${p.strPosition}</p>
                        </div>
                    `;
                    
                    // Efecto hover simple
                    card.onmouseover = () => card.style.transform = "translateY(-5px)";
                    card.onmouseout = () => card.style.transform = "translateY(0)";

                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = "<p>No se encontraron jugadores.</p>";
            }
        } catch(err) {
            console.error(err);
            grid.innerHTML = "<p style='color:red;'>Error al cargar jugadores.</p>";
        }
    }
});