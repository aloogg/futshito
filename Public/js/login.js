document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validación básica
    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    // 🚨 Caso especial: admin directo
    if (email === "aloos" && password === "123") {
        // Guardar datos de sesión en localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", "Administrador");
        localStorage.setItem("userEmail", "aloos");
        localStorage.setItem("userId", "0");
        localStorage.setItem("userRole", "admin");


        // Redirigir al panel de admin
        window.location.href = "admin.html";
        return; // detener el flujo
    }

    try {
        const response = await fetch('./Public/php/api.php?endpoint=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("Respuesta del login:", data); // <- mira aquí

        if (data.status === 'success') {
            alert(data.message);

            // GUARDAR EN LOCALSTORAGE - ESTO ES LO IMPORTANTE
            localStorage.setItem("userName", data.user.nombre_completo);
            localStorage.setItem("userEmail", data.user.correo);
            localStorage.setItem("userId", data.user.id_usuario);
            localStorage.setItem("userRole", data.user.rol || "usuario");


            // Redirigir al inicio
            window.location.href = 'index.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al iniciar sesión');
    }
});
