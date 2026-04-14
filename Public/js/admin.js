// ==================
// Crear Categoría
// ==================
async function crearCategoria() {
  const nombre = document.getElementById('categoria').value.trim();
  const mensaje = document.getElementById('mensaje-categoria');

  if (!nombre) {
    mensaje.textContent = "El nombre es obligatorio";
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
      mensaje.textContent = "Categoría creada correctamente";
      document.getElementById('categoria').value = '';
      cargarCategoriasEnSelect('categoria-mundial');
    } else {
      mensaje.textContent = data.message;
    }
  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error al crear categoría";
  }
}

// ==================
// Cargar categorías en cualquier select
// ==================
async function cargarCategoriasEnSelect(selectId) {
  try {
    const res = await fetch('Public/php/api.php?endpoint=listar-categorias');
    const data = await res.json();
    if (!data.success) return;

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Selecciona una categoría</option>';

    data.categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id_categoria;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error cargando categorías:', err);
  }
}

// ==================
// Crear Mundial
// ==================
async function crearPaginaMundial() {
  const nombre = document.getElementById('nombre-mundial').value.trim();
  const anio = document.getElementById('anio-mundial').value;
  const sede = document.getElementById('sede-mundial').value.trim();
  const categoria = document.getElementById('categoria-mundial').value;
  const resena = document.getElementById('resena-mundial').value.trim();
  const imagen = document.getElementById('imagen-mundial').files[0];

  if (!nombre || !anio || !sede || !resena || !imagen || !categoria) {
    alert('Por favor, completa todos los campos (incluida la categoría)');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('anio', anio);
    formData.append('sede', sede);
    formData.append('descripcion', resena);
    formData.append('logo', imagen);
    formData.append('id_categoria', categoria);

    const res = await fetch('Public/php/api.php?endpoint=crear-mundial', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (result.success) {
      alert(`Página del Mundial "${nombre}" creada exitosamente`);
      document.getElementById('mundial-form').reset();
    } else {
      alert('Error al crear mundial: ' + result.message);
    }
  } catch (err) {
    console.error('Error creando mundial:', err);
    alert('Error de conexión al crear el mundial');
  }
}

// ==================
// Publicaciones pendientes
// ==================
async function cargarPublicacionesPendientes() {
  const contenedor = document.getElementById('pendientes');

  try {
    const res = await fetch("Public/php/api.php?endpoint=publicaciones-pendientes");
    const data = await res.json();

    if (!data.success) {
      contenedor.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    const publicaciones = data.publicaciones;

    if (!publicaciones.length) {
      contenedor.innerHTML = '<p>No hay publicaciones pendientes de revisión</p>';
      return;
    }

    contenedor.innerHTML = publicaciones.map(pub => `
      <div class="publicacion" data-id="${pub.id_publicacion}">
        <h3>${pub.titulo}</h3>
        <p><strong>ID Usuario:</strong> ${pub.id_usuario}</p>
        <p><strong>Mundial:</strong> ${pub.mundial}</p>
        <p><strong>Categoría:</strong> ${pub.categoria}</p>
        <p><strong>Fecha:</strong> ${new Date(pub.fecha_creacion).toLocaleString()}</p>
        <p>${pub.contenido}</p>
        <div class="acciones">
          <button onclick="aprobarPublicacion(${pub.id_publicacion})">Aprobar</button>
          <button onclick="rechazarPublicacion(${pub.id_publicacion})">Rechazar</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = '<p>Error al cargar publicaciones</p>';
  }
}

async function cargarComentariosReportados() {
  const contenedor = document.getElementById("comentarios-reportados");

  try {
    const res = await fetch("Public/php/api.php?endpoint=comentarios-reportados");
    const data = await res.json();

    if (!data.success || !data.comentarios.length) {
      contenedor.innerHTML = "<p>No hay comentarios reportados.</p>";
      return;
    }

    contenedor.innerHTML = data.comentarios.map(c => `
      <div class="comentario-reportado">
        <p><strong>${c.autor}</strong> comentó en <em>${c.publicacion}</em>:</p>
        <blockquote>${c.comentario}</blockquote>
        <small>${new Date(c.fecha).toLocaleString()}</small>
        <div class="acciones">
          <button onclick="aprobarComentario(${c.id_comentario})">Aprobar</button>
          <button onclick="rechazarComentario(${c.id_comentario})">Rechazar</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error cargando comentarios reportados:", err);
    contenedor.innerHTML = "<p>Error al cargar comentarios.</p>";
  }
}

async function aprobarComentario(id) {
  await fetch("Public/php/api.php?endpoint=aprobar-comentario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_comentario: id })
  });
  cargarComentariosReportados();
}

async function rechazarComentario(id) {
  await fetch("Public/php/api.php?endpoint=rechazar-comentario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_comentario: id })
  });
  cargarComentariosReportados();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarComentariosReportados();
});


// ==================
// Inicializar todo al cargar la página
// ==================
document.addEventListener('DOMContentLoaded', () => {

  // Comentarios reportados
  cargarComentariosReportados();

  // Selector de imagen
  const fileInput = document.getElementById('imagen-mundial');
  const btnSelect = document.getElementById('btn-select-image');
  const fileNameSpan = document.getElementById('selected-image-name');

  btnSelect.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    fileNameSpan.textContent = fileInput.files.length > 0 
      ? fileInput.files[0].name 
      : 'Ningún archivo seleccionado';
  });

  // Cargar categorías en el select del Mundial
  cargarCategoriasEnSelect('categoria-mundial');

  // Cargar publicaciones pendientes
  cargarPublicacionesPendientes();

  // Crear Mundial
  const formMundial = document.getElementById('mundial-form');
  formMundial.addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearPaginaMundial();
  });
});

