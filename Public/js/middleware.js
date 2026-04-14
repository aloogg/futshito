document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    const path = window.location.pathname;

    // Detectar admin hardcodeado
    const isAdmin = userEmail === "aloos";

    // Páginas de admin
    const adminPages = ["admin.html"];

    // Páginas de usuario normal
    const userPages = ["index.html", "perfil.html"];

    // Bloquear páginas de admin si no es admin
    if (adminPages.some(p => path.includes(p)) && !isAdmin) {
        alert("Acceso denegado. Solo el administrador puede entrar aquí.");
        window.location.href = "index.html";
        return;
    }

    // Bloquear páginas de usuario si no es admin ni usuario
    if (userPages.some(p => path.includes(p)) && !(isAdmin || userRole === "usuario")) {
        alert("Acceso denegado. No tienes permiso para ver esta página.");
        window.location.href = "login.html";
        return;
    }

    // Redirigir admin a panel si entra a página de usuario (opcional)
    if (isAdmin && userPages.some(p => path.includes(p))) {
        console.log("Administrador ha iniciado sesión.");
        window.location.href = "admin.html";
    }
});
