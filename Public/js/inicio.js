document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();

  // const email = document.getElementById("email").value;
  // const password = document.getElementById("password").value;

  // // Caso: Admin (ejemplo con valores fijos para pruebas)
  // if (email === "admin@futshito.com" && password === "admin123") {
  //   localStorage.setItem("role", "admin");
  //   window.location.href = "admin.html"; 
  // } 
  // // Caso: Usuario normal
  // else if (email === "usuario@futshito.com" && password === "user123") {
  //   localStorage.setItem("role", "user");
  //   window.location.href = "index.html";
  //   alert("Bienvenido a la página");
  // } 
  // else {
  //   alert("Credenciales incorrectas");
  // }

  
});

  // Funcionalidad para el modal de login
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const createPostBtn = document.getElementById('createPostBtn');
  const registerLink = document.getElementById('registerLink');
  
  loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });
  
  closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación
    alert('Inicio de sesión exitoso!');
    loginModal.style.display = 'none';
  });
  
  createPostBtn.addEventListener('click', () => {
    // Verificar si el usuario está logueado
    const isLoggedIn = false; // Esto debería venir de tu sistema de autenticación
    
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para crear una publicación');
      loginModal.style.display = 'flex';
    } else {
      // Redirigir a la página de creación
      window.location.href = 'crear-publicacion.html';
    }
  });
  
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirigiendo al formulario de registro...');
    // window.location.href = 'registro.html';
  });
  
  // Funcionalidad para los filtros
  const filters = document.querySelectorAll('.filter');
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      // Aquí iría la lógica para filtrar las publicaciones
    });
  });
  
  // Funcionalidad para el ordenamiento
  const sortSelect = document.querySelector('.sort-select');
  sortSelect.addEventListener('change', () => {
    // Aquí iría la lógica para ordenar las publicaciones
    console.log('Ordenar por:', sortSelect.value);
  });

  function showGroup(groupNumber) {
      // Ocultar todos los grupos
      document.querySelectorAll('.worldcup-grid').forEach(group => {
          group.style.display = 'none';
      });
      
      // Mostrar el grupo seleccionado
      const selectedGroup = document.getElementById('group' + groupNumber);
      if (selectedGroup) {
          selectedGroup.style.display = 'grid';
      }
  }

  // Función para manejar el envío del formulario de publicación
document.getElementById('create-post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const worldcup = document.getElementById('post-worldcup').value;
    const country = document.getElementById('post-country').value;
    
    // Obtener archivo de medios
    const mediaFile = document.getElementById('post-media').files[0];
    
    // Verificar si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Debes iniciar sesión para crear una publicación');
        return;
    }
    
    // Crear objeto de publicación
    const publication = {
        id: Date.now(),
        title,
        content,
        category,
        worldcup,
        country,
        author: user.username,
        authorId: user.id,
        status: 'pending', // Estado inicial: pendiente de aprobación
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    
    // Si hay un archivo, convertirlo a base64 para almacenamiento
    if (mediaFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            publication.media = {
                data: e.target.result,
                type: mediaFile.type.includes('image') ? 'image' : 'video',
                name: mediaFile.name
            };
            
            // Guardar la publicación
            savePublication(publication);
        };
        reader.readAsDataURL(mediaFile);
    } else {
        // Guardar la publicación sin medios
        savePublication(publication);
    }
});

// Función para guardar la publicación
function savePublication(publication) {

    let pendientes = JSON.parse(localStorage.getItem('publicacionesPendientes')) || [];
    pendientes.push(publication);
    localStorage.setItem('publicacionesPendientes', JSON.stringify(pendientes));

    // Cerrar el modal y mostrar mensaje de éxito
    document.getElementById('createModal').style.display = 'none';
    alert('¡Publicación creada! Esperando aprobación del administrador.');
    
    // Limpiar el formulario
    document.getElementById('create-post-form').reset();
}

// Función para cargar publicaciones aprobadas (para mostrar en index.html)
function loadApprovedPublications() {
    const approvedPublications = JSON.parse(localStorage.getItem('publicacionesAprobadas')) || [];
    
    if (approvedPublications.length === 0) {
        console.log('No hay publicaciones aprobadas aún');
        return;
    }

    // Aquí puedes mostrar las publicaciones en tu página principal
    const contenedor = document.getElementById('contenedor-publicaciones');
    let html = '';

    approvedPublications.forEach(pub => {
        html += `
          <div class="publicacion">
            <h3>${pub.title}</h3>
            <p><strong>${pub.author}</strong> - ${new Date(pub.createdAt).toLocaleString()}</p>
            <p>${pub.content}</p>
          </div>
        `;
    });

    contenedor.innerHTML = html;
}


// Cargar publicaciones aprobadas al iniciar la página
document.addEventListener('DOMContentLoaded', loadApprovedPublications);