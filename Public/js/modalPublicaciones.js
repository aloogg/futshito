// ==========================
// Cargar categorías en el select
// ==========================
async function cargarCategoriasEnModal() {
    try {
        const res = await fetch('Public/php/api.php?endpoint=listar-categorias');
        const data = await res.json();
        if (!data.success) return;

        const select = document.getElementById('post-category');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona una categoría</option>';
        data.categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre; // O cat.id_categoria si prefieres guardar el ID
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando categorías:', err);
    }
}

// ==========================
// Crear categoría desde el panel
// ==========================
async function crearCategoria() {
    const input = document.getElementById('categoria');
    const mensajeDiv = document.getElementById('mensaje-categoria');
    const nombre = input.value.trim();

    if (!nombre) {
        mensajeDiv.textContent = "El nombre es obligatorio";
        return;
    }

    try {
        const formData = new FormData();
        formData.append('nombre', nombre);

        const res = await fetch('Public/php/api.php?endpoint=crear-categoria', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success) {
            mensajeDiv.textContent = `Categoría "${nombre}" creada correctamente`;
            input.value = '';
            await cargarCategoriasEnModal(); // actualizar el select
        } else {
            mensajeDiv.textContent = data.message;
        }

        setTimeout(() => mensajeDiv.textContent = '', 2000);
    } catch (err) {
        console.error(err);
        mensajeDiv.textContent = "Error al crear categoría";
    }
}

// ==========================
// Inicializar al cargar la página
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasEnModal();

    // Si existe el botón de crear categoría, asociar evento
    const btnCrear = document.querySelector('#crear-categoria-btn');
    if (btnCrear) btnCrear.addEventListener('click', crearCategoria);
});
