class Auth {
    // Verificar si hay sesión
    static isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true";
    }

    // Obtener usuario del almacenamiento local
    static getUser() {
        if (!this.isLoggedIn()) {
            return null;
        }
        return {
            id: localStorage.getItem("userId"),
            name: localStorage.getItem("userName"),
            email: localStorage.getItem("userEmail")
        };
    }

    // Cerrar sesión
    static logout() {
        localStorage.clear();
        window.location.href = "login.html";
    }
}