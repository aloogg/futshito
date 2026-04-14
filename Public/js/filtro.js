const allPosts = [
  {
    id: 1,
    title: "Primer Mundial de la historia",
    content: "El Mundial de Uruguay 1930 fue el primero de la historia, ganado por la selección uruguaya en Montevideo.",
    country: "Uruguay",
    year: 1930,
    likes: 310,
    comments: 220,
    worldCup: "uruguay-1930",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Uruguay_national_football_team_1930.jpg"
  },
  {
    id: 2,
    title: "Italia bicampeón",
    content: "Italia ganó su segundo título mundial consecutivo en 1934 como país anfitrión.",
    country: "Italia",
    year: 1934,
    likes: 280,
    comments: 190,
    worldCup: "italia-1934",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Italy_celebrating_1934.jpg"
  },
  {
    id: 3,
    title: "Francia 1938",
    content: "Italia volvió a coronarse en Francia 1938, logrando su segundo campeonato consecutivo.",
    country: "Italia",
    year: 1938,
    likes: 250,
    comments: 160,
    worldCup: "francia-1998",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Finale_de_la_Coupe_du_monde_1938_%C3%A0_Colombes_%28France%29%2C_le_s%C3%A9lectionneur_Pozzo_brandit_la_%27victoire_ail%C3%A9e%27.jpg"
  },
  {
    id: 4,
    title: "Brasil 1950",
    content: "Brasil fue sede del Mundial de 1950, recordado por la final en Maracaná donde Uruguay se coronó campeón en un histórico partido.",
    country: "Brasil",
    year: 1950,
    likes: 300,
    comments: 200,
    worldCup: "brazil-1954",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/38/Urug1950.jpg"
  },
  {
    id: 5,
    title: "Suiza 1954",
    content: "Alemania Federal sorprendió al mundo al vencer a Hungría en la final de Berna.",
    country: "Alemania",
    year: 1954,
    likes: 330,
    comments: 210,
    worldCup: "suiza-1954",
    image: "https://www.tudn.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd6%2Ff8%2Fb1aea1594494aaf31a07a7e98562%2Fportada-posters-mundiales-qatar2022-suiza-54.jpg&w=640&q=75"
  },
  {
    id: 6,
    title: "Brasil campeón en Suecia 1958",
    content: "Pelé, con apenas 17 años, deslumbró al mundo y lideró a Brasil a su primer título.",
    country: "Brasil",
    year: 1958,
    likes: 600,
    comments: 430,
    worldCup: "suecia-1958",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Winning_brazilian_National_team_1958.jpg"
  },
  {
    id: 7,
    title: "Chile 1962",
    content: "Brasil repitió el título en Chile 1962 con un equipo estelar encabezado por Garrincha.",
    country: "Brasil",
    year: 1962,
    likes: 400,
    comments: 310,
    worldCup: "chile-1962",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Sele%C3%A7%C3%A3o_Brasileira_de_Futebol_na_Copa_do_Mundo_de_1962.tiff/lossy-page1-1280px-Sele%C3%A7%C3%A3o_Brasileira_de_Futebol_na_Copa_do_Mundo_de_1962.tiff.jpg"
  },
  {
    id: 8,
    title: "Inglaterra campeón en 1966",
    content: "Inglaterra ganó su único Mundial en Wembley, derrotando a Alemania con un gol polémico.",
    country: "Inglaterra",
    year: 1966,
    likes: 450,
    comments: 380,
    worldCup: "inglaterra-1966",
    image: "Imagenes/fut.png"
  },
  {
    id: 9,
    title: "México 1970 - El Brasil de Pelé",
    content: "Brasil ganó su tercer Mundial en México 1970, considerado el mejor equipo de la historia.",
    country: "Brasil",
    year: 1970,
    likes: 710,
    comments: 500,
    worldCup: "mexico-1970",
    image: "https://pbs.twimg.com/media/DhnCp_nU0AATeVD?format=jpg&name=4096x4096"
  },
  {
    id: 10,
    title: "Alemania 1974",
    content: "Alemania Occidental ganó el Mundial en casa, derrotando a la Naranja Mecánica de Cruyff.",
    country: "Alemania",
    year: 1974,
    likes: 390,
    comments: 280,
    worldCup: "alemania-1974",
    image: "Imagenes/fut2.png"
  },
  {
    id: 11,
    title: "Argentina campeón 1978",
    content: "Argentina ganó su primer Mundial en 1978, venciendo a Países Bajos en la final en Buenos Aires.",
    country: "Argentina",
    year: 1978,
    likes: 670,
    comments: 450,
    worldCup: "argentina-1978",
    image: "https://media.gettyimages.com/id/493892799/es/foto/argentines-national-soccer-team-captain-daniel-passarella-holds-the-world-cup-trophy-as-he-is.jpg?s=2048x2048&w=gi&k=20&c=88PT12SOVFkPb2M_fkp4U3n6JQb923EE260vGJHv72E="
  },
  {
    id: 12,
    title: "España 1982",
    content: "Italia conquistó el Mundial en España 1982 con Paolo Rossi como máximo goleador.",
    country: "Italia",
    year: 1982,
    likes: 510,
    comments: 360,
    worldCup: "espana-1982",
    image: "Imagenes/fut3.png"
  }
];

const searchInput = document.querySelector('.search-bar input');
const searchBtn = document.querySelector('.search-bar button');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const postsSection = document.querySelector('.filtered-posts');

// === FUNCIÓN PRINCIPAL PARA MOSTRAR POSTS ===
function renderPosts(posts) {
  postsSection.innerHTML = '';
  postsSection.style.display = 'block';

  if (!posts || posts.length === 0) {
    postsSection.innerHTML = '<p>No se encontraron publicaciones.</p>';
    return;
  }

  const gridContainer = document.createElement('div');
  gridContainer.classList.add('worldcup-grid');

  posts.forEach(pub => {
    const div = document.createElement('div');
    div.className = 'worldcup-item';
    div.dataset.id = pub.id;

    div.innerHTML = `
      <div class="worldcup-img-container">
        <img src="${pub.image || pub.multimedia}" alt="${pub.title || pub.titulo}" class="worldcup-img">
      </div>
      <div class="worldcup-name">${pub.title || pub.titulo}</div>
    `;

    div.addEventListener('click', () => openModal(pub));
    gridContainer.appendChild(div);
  });

  postsSection.appendChild(gridContainer);
}

// === FUNCIÓN PARA FILTRAR, BUSCAR Y ORDENAR ===
function filtrarYOrdenar() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  const sortValue = sortSelect.value;

  // Combina publicaciones locales + las del usuario
  const combinedPosts = [...allPosts, ...(window.userPosts || [])];

  // FILTRAR POR TÉRMINOS DE BÚSQUEDA
  let resultado = combinedPosts.filter(post => {
    const titulo = (post.title || post.titulo || "").toLowerCase();
    const contenido = (post.content || post.descripcion || "").toLowerCase();
    const pais = (post.country || post.pais || "").toLowerCase();
    const mundial = (post.worldCup || post.mundial || "").toLowerCase();

    return (
      titulo.includes(searchTerm) ||
      contenido.includes(searchTerm) ||
      pais.includes(searchTerm) ||
      mundial.includes(searchTerm)
    );
  });

  // FILTRAR POR BOTONES
  if (activeFilter !== "all") {
    resultado = resultado.filter(post =>
      post.worldCup === activeFilter ||
      post.mundial === activeFilter ||
      post.country === activeFilter ||
      post.pais === activeFilter
    );
  }

  // ORDENAR RESULTADOS
  resultado.sort((a, b) => {
    switch (sortValue) {
      case "likes": return (b.likes || 0) - (a.likes || 0);
      case "comments": return (b.comments || 0) - (a.comments || 0);
      case "year": return (b.year || 0) - (a.year || 0);
      default: return (a.title || a.titulo || "").localeCompare(b.title || b.titulo || "");
    }
  });

  renderPosts(resultado);
}

// === EVENTOS DE INTERFAZ ===
searchBtn.addEventListener('click', filtrarYOrdenar);

searchInput.addEventListener('keydown', e => { 
  if (e.key === 'Enter') {
    e.preventDefault(); // Bloquea cualquier acción del Enter
  } 
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtrarYOrdenar();
  });
});
sortSelect.addEventListener('change', filtrarYOrdenar);

// === MODAL ===
const modal = document.getElementById('postModal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalCountry = document.getElementById('modal-country');
const modalYear = document.getElementById('modal-year');
const modalContent = document.getElementById('modal-content');
const modalComments = document.getElementById('modal-comments');
const modalLikes = document.getElementById('modal-likes');
const modalClose = document.querySelector('.modal-close');

function openModal(post) {
  modal.style.display = 'block';
  modalImg.src = post.image || post.multimedia;
  modalTitle.textContent = post.title || post.titulo;
  modalCountry.textContent = `País: ${post.country || post.pais || 'Desconocido'}`;
  modalYear.textContent = `Año: ${post.year || '-'}`;
  modalContent.textContent = post.content || post.descripcion || 'Sin descripción.';
  modalComments.textContent = `💬 ${post.comments || 0}`;
  modalLikes.textContent = `💛 ${post.likes || 0}`;
}

modalClose.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

// Mostrar publicaciones locales al cargar
document.addEventListener("DOMContentLoaded", () => {
  renderPosts(allPosts);
});
