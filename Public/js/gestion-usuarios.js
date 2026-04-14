document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
    cargarReportes();
});

// ==========================================
// 1. CARGAR TABLA DE USUARIOS
// ==========================================
async function cargarUsuarios() {
    try {
        const res = await fetch("/api/usuarios");
        const data = await res.json();
        
        if (data.success) {
            mostrarUsuarios(data.usuarios);
        } else {
            console.error("Error del servidor:", data.message);
        }
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
    }
}

function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector("#tabla-usuarios tbody");
    tbody.innerHTML = "";

    if(usuarios.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>No hay usuarios registrados</td></tr>";
        return;
    }

    usuarios.forEach(user => {
        const fila = document.createElement("tr");

        let fechaNac = "-";
        if (user.fecha_nacimiento) {
            fechaNac = new Date(user.fecha_nacimiento).toLocaleDateString();
        }

        fila.innerHTML = `
            <td>${user.nombre_completo || '-'}</td>
            <td>${fechaNac}</td>
            <td>${user.genero || '-'}</td>
            <td>${user.pais_nacimiento || '-'}</td>
            <td>${user.nacionalidad || '-'}</td>
            <td>${user.correo || '-'}</td>
        `;

        tbody.appendChild(fila);
    });
}

// ==========================================
// 2. CARGAR REPORTES Y ESTADÍSTICAS
// ==========================================
async function cargarReportes() {
    try {
        const res = await fetch("/api/reportes");
        const data = await res.json();

        if (!data.success) {
            console.error("Error cargando reportes");
            return;
        }

        // 1. Usuarios por País
        const ulPais = document.getElementById("rep-pais");
        ulPais.innerHTML = data.usuariosPorPais.length > 0 
            ? data.usuariosPorPais.map(p => `<li>${p._id || 'Desconocido'}: ${p.total} usuarios</li>`).join('')
            : "<li>Sin datos</li>";

        // 2. Género
        const ulGenero = document.getElementById("rep-genero");
        ulGenero.innerHTML = data.generoPorcentaje.length > 0
            ? data.generoPorcentaje.map(g => `<li>${g.genero}: ${g.porcentaje}</li>`).join('')
            : "<li>Sin datos</li>";

        // 3. Top Likes
        const olLikes = document.getElementById("rep-likes");
        olLikes.innerHTML = data.topLikes.length > 0
            ? data.topLikes.map(p => `<li>${p.titulo} (por ${p.usuario ? p.usuario.nombre : 'Anónimo'}) - <i class="fa-solid fa-heart"></i> ${p.contadores.likes}</li>`).join('')
            : "<li>Sin publicaciones aún</li>";

        // 4. Top Vistas
        const olVistas = document.getElementById("rep-vistas");
        olVistas.innerHTML = data.topVistas.length > 0
            ? data.topVistas.map(p => `<li>${p.titulo} (por ${p.usuario ? p.usuario.nombre : 'Anónimo'}) - <i class="fa-solid fa-eye"></i> ${p.contadores.vistas}</li>`).join('')
            : "<li>Sin publicaciones aún</li>";

        // 5. Categorías
        const ulCat = document.getElementById("rep-categorias");
        ulCat.innerHTML = data.postsPorCategoria.length > 0
            ? data.postsPorCategoria.map(c => `<li>${c._id || 'Sin categoría'}: ${c.total} publicaciones</li>`).join('')
            : "<li>Sin datos</li>";

    } catch (err) {
        console.error("Error de conexión con reportes:", err);
    }
}