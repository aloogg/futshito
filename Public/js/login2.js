document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Obtenemos los valores del formulario
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Validación básica
            if (!email || !password) {
                alert('Por favor completa todos los campos');
                return;
            }

            if (email === "aloos" && password === "123") {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userName", "Administrador");
                localStorage.setItem("userEmail", "aloos@admin.com");
                localStorage.setItem("userId", "0");
                localStorage.setItem("userRole", "admin");
                
                alert("Bienvenido Administrador");
                window.location.href = "admin.html";
                return;
            }

            // --- LOGIN REAL CON MONGODB ---
            try {
                // CAMBIO: Apuntamos a la ruta de Node.js
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.status === 'success') {
                    // ¡Éxito! Guardamos los datos reales de Mongo en LocalStorage
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("userName", data.user.name);
                    localStorage.setItem("userEmail", data.user.email);
                    localStorage.setItem("userRole", data.user.role);
                    
                    if (data.user.photo) {
                        localStorage.setItem("userPhoto", data.user.photo);
                    }

                    alert(data.message); // "¡Bienvenido de nuevo!"

                    if (data.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }

                } else {
                    // Error (Usuario no encontrado o contraseña incorrecta)
                    alert(data.message);
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                alert('Ocurrió un error al intentar conectar con el servidor.');
            }
        });
    }
});