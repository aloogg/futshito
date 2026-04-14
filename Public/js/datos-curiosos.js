// Public/js/datos-curiosos.js
document.addEventListener('DOMContentLoaded', () => {
  const datosCuriososLink = document.getElementById('link-datos-curiosos');

  datosCuriososLink.addEventListener('click', async (e) => {
    e.preventDefault();

    // Limpiar el contenido principal del body
    const mainSections = document.querySelectorAll('.filters, .world-cups, .filtered-posts, .datos-curiosos');
    mainSections.forEach(section => section.remove());

    // Crear contenedor y formulario
    const curiososContainer = document.createElement('section');
    curiososContainer.classList.add('datos-curiosos');
    curiososContainer.innerHTML = `
      <h2 class="section-title">⚽ Datos Curiosos del Fútbol</h2>
      <div class="curiosos-grid"></div>
      <div class="agregar-dato-curioso">
        <input type="text" id="nuevo-dato" class="input-dato-curioso" placeholder="Escribe un dato curioso">
        <button id="btn-agregar-dato" class="btn-dato-curioso">Agregar</button>
      </div>
    `;
    document.body.insertBefore(curiososContainer, document.querySelector('.footer'));

    const gridPropia = curiososContainer.querySelector('.curiosos-grid');
    const inputDato = curiososContainer.querySelector('#nuevo-dato');
    const btnAgregar = curiososContainer.querySelector('#btn-agregar-dato');

    // Función para renderizar un dato
    function renderDato(dato) {
      const card = document.createElement('div');
      card.classList.add('curioso-card');
      card.innerHTML = `<h3>Dato #${dato.id}</h3><p>${dato.dato}</p>`;
      gridPropia.prepend(card);
    }

    // Traer datos existentes de la API propia
    try {
      const resPropia = await fetch('http://localhost:8012/Capa/Public/php/api.php?endpoint=datos-curiosos');
      const dataPropia = await resPropia.json();
      if (dataPropia.status === "success") {
          dataPropia.datos.forEach(dato => renderDato(dato));
      }

    } catch(err) {
      console.error(err);
      gridPropia.innerHTML = `<p style="color:red;">Error al cargar los datos</p>`;
    }

    // Evento para agregar nuevo dato
    btnAgregar.addEventListener('click', async () => {
      const valor = inputDato.value.trim();
      if (!valor) return alert('Escribe un dato curioso');

      try {
        const res = await fetch('http://localhost:8012/Capa/Public/php/api.php?endpoint=datos-curiosos', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({dato: valor})
        });
        const result = await res.json();
        if (result.status === 'success') {
          renderDato({id: 'Nuevo', dato: valor});
          inputDato.value = '';
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error(err);
        alert('Ocurrió un error al agregar el dato');
      }
    });

    // Traer jugadores de TheSportsDB (igual que antes)
    try {
      const resTSDB = await fetch('https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t=Barcelona');
      const dataTSDB = await resTSDB.json();
      if (dataTSDB.player) {
        const tsdbSection = document.createElement('div');
        tsdbSection.innerHTML = `<h2 class="section-title">🏟️ Jugadores del FC Barcelona</h2>
                                 <div class="jugadores-grid"></div>`;
        curiososContainer.appendChild(tsdbSection);

        const gridTSDB = tsdbSection.querySelector('.jugadores-grid');
        dataTSDB.player.slice(0, 8).forEach(p => {
          const card = document.createElement('div');
          card.classList.add('jugador-card');
          card.innerHTML = `
            <img src="${p.strThumb || 'https://via.placeholder.com/200'}" alt="${p.strPlayer}">
            <h3>${p.strPlayer}</h3>
            <p><strong>Posición:</strong> ${p.strPosition || 'Desconocida'}</p>
            <p><strong>Nacionalidad:</strong> ${p.strNationality}</p>
            <p>${p.strDescriptionEN ? p.strDescriptionEN.substring(0, 120) + '...' : ''}</p>
          `;
          gridTSDB.appendChild(card);
        });
      }
    } catch(err) {
      console.error(err);
    }
  });
});
