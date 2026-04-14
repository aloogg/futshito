async function aprobarPublicacion(id_publicacion) {
  try {
    const res = await fetch("Public/php/api.php?endpoint=aprobar-publicacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_publicacion })
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Publicación aprobada");
      cargarPublicacionesPendientes();
    } else {
      alert("❌ Error: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Error al aprobar publicación");
  }
}


async function rechazarPublicacion(id_publicacion) {
  try {
    const res = await fetch("Public/php/api.php?endpoint=rechazar-publicacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_publicacion })
    });

    const data = await res.json();

    if (data.success) {
      alert("🛑 Publicación rechazada");
      cargarPublicacionesPendientes();
    } else {
      alert("❌ Error: " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Error al rechazar publicación");
  }
}
