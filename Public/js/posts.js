document.getElementById("create-post-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    let formData = new FormData(this);

    try {
        let response = await fetch("Public/php/api.php?endpoint=crear-publicacion", {
            method: "POST",
            body: formData
        });

        let result = await response.json();

        if (result.success) {
            alert("✅ Publicación creada correctamente");
            document.getElementById("create-post-form").reset();
            // cerrar modal
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error("Error en fetch:", error);
    }
});
