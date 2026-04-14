// ==========================================
// 1. LÓGICA DEL TEMA (MODO OSCURO)
// ==========================================
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const body = document.body;
    const iconLight = themeToggle.querySelector('.icon-light');
    const iconDark = themeToggle.querySelector('.icon-dark');

    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        if (iconLight) iconLight.style.display = 'none';
        if (iconDark) iconDark.style.display = 'inline';
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        if (iconLight) iconLight.style.display = 'inline';
        if (iconDark) iconDark.style.display = 'none';
        themeToggle.setAttribute('aria-pressed', 'false');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        if (isDark) {
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'inline';
            themeToggle.setAttribute('aria-pressed', 'true');
            localStorage.setItem('theme', 'dark');
        } else {
            if (iconLight) iconLight.style.display = 'inline';
            if (iconDark) iconDark.style.display = 'none';
            themeToggle.setAttribute('aria-pressed', 'false');
            localStorage.setItem('theme', 'light');
        }
    });
}

// ==========================================
// 2. ACCESIBILIDAD DE ERRORES
// ==========================================
function enhanceErrorAccessibility(input, errorElement) {
    input.setAttribute('aria-describedby', errorElement.id);
    input.setAttribute('aria-invalid', 'false');

    input.addEventListener('blur', () => {
        if (input.classList.contains('invalid')) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.setAttribute('aria-invalid', 'false');
        }
    });
}

// ==========================================
// 3. INICIALIZACIÓN PRINCIPAL
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar tema
    initializeThemeSwitcher();

    const form = document.getElementById('registerForm');
    if (!form) return;

    const nombre = document.getElementById('nombreCompleto');
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    const password = document.getElementById('password');
    const email = document.getElementById('email');

    // --- Configurar mensajes de error ---
    function setupErrorMessages() {
        function createErrorElement(inputElement) {
            // Evitar duplicar mensajes si ya existen
            if (document.getElementById(`${inputElement.id}-error`)) return;
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.id = `${inputElement.id}-error`;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            enhanceErrorAccessibility(inputElement, errorElement);
            return errorElement;
        }
        createErrorElement(password);
        createErrorElement(email);
        createErrorElement(fechaNacimiento);
    }
    setupErrorMessages();

    // --- Validaciones (Tus funciones originales) ---
    function validatePassword() {
        const value = this.value;
        const errorElement = this.nextElementSibling;
        let errors = [];

        if (value.length < 8) errors.push("Mínimo 8 caracteres");
        if (!/[a-z]/.test(value)) errors.push("Al menos una minúscula");
        if (!/[A-Z]/.test(value)) errors.push("Al menos una mayúscula");
        if (!/\d/.test(value)) errors.push("Al menos un número");
        if (!/[=)§\]€&]/.test(value)) errors.push("Al menos un caracter especial (=)§)]€&)");

        if (errors.length > 0 && value.length > 0) {
            if(errorElement) errorElement.innerHTML = '<ul><li>' + errors.join('</li><li>') + '</li></ul>';
            this.classList.add('invalid');
        } else {
            if(errorElement) errorElement.innerHTML = '';
            this.classList.remove('invalid');
        }
    }

    function validateEmail() {
        const value = this.value.trim();
        // Buscamos el div de error por ID para ser más precisos
        const errorElement = document.getElementById('email-error'); 
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value) && value.length > 0) {
            if(errorElement) errorElement.textContent = 'Ingresa un email válido (ejemplo@dominio.com)';
            this.classList.add('invalid');
        } else {
            if(errorElement) errorElement.textContent = '';
            this.classList.remove('invalid');
        }
    }

    function validateEdad() {
        const value = this.value;
        const errorElement = document.getElementById('fechaNacimiento-error');
        if (!value) return;

        const hoy = new Date();
        const nacimiento = new Date(value);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        if (edad < 12) {
            if(errorElement) errorElement.textContent = 'Debes tener al menos 12 años para registrarte';
            this.classList.add('invalid');
        } else {
            if(errorElement) errorElement.textContent = '';
            this.classList.remove('invalid');
        }
    }

    // Listeners de validación
    password.addEventListener('input', validatePassword);
    email.addEventListener('input', validateEmail);
    fechaNacimiento.addEventListener('change', validateEdad);

    // ==========================================
    // 4. ENVÍO DEL FORMULARIO
    // ==========================================
    form.addEventListener("submit", async e => {
        e.preventDefault();

        // Pequeña validación antes de enviar: si hay campos inválidos, no enviamos
        if (form.querySelectorAll('.invalid').length > 0) {
            alert("Por favor corrige los errores antes de continuar.");
            return;
        }

        const formData = new FormData(e.target);

        try {
            const res = await fetch("/api/registrar", {
                method: "POST",
                body: formData
            });

            const data = await res.json(); 

            if (data.exito) {
                alert(data.mensaje);
                window.location.href = "index.html";
            } else {
                alert("Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});