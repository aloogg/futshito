const AppStorage = {

    // Método de inicialización 
    init: function() {
        if (!localStorage.getItem('usersInitialized')) {
            localStorage.setItem('restaurantUsers', JSON.stringify([]));
            localStorage.setItem('usersInitialized', 'true');
        }
    },

    // Métodos de usuario actual
    saveUserData: function(data) {
        const userData = {
            ...data,
            registroCompleto: true,
            registroFecha: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');   // persistente
        sessionStorage.setItem('sessionActive', 'true');
    },

    
    getCurrentUser: function() {
        const id = localStorage.getItem('userId');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');

        if (!id || !name) return null;

        return {
            id_usuario: id,
            nombre_completo: name,
            correo: email,
            rol: role
        };
    },

    
    clearData: function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn'); // <--- agregar
        sessionStorage.removeItem('sessionActive');
    },

    
    isLoggedIn: function() {
        return sessionStorage.getItem('sessionActive') === 'true' ||
            localStorage.getItem('isLoggedIn') === 'true';
    },


    // Métodos para múltiples usuarios
    getAllUsers: function() {
        this.init(); // Asegurar que está inicializado
        const users = localStorage.getItem('restaurantUsers');
        return users ? JSON.parse(users) : [];
    },
    
    saveNewUser: function(userData) {
        const users = this.getAllUsers();
        const newEmail = userData.email.toLowerCase().trim();
        
        const userExists = users.some(user => 
            user.email.toLowerCase().trim() === newEmail || 
            user.telefono === userData.telefono
        );
        
        if (!userExists) {
            users.push({
                ...userData,
                email: newEmail // Guardamos normalizado
            });
            localStorage.setItem('restaurantUsers', JSON.stringify(users));
            return true;
        }
        return false;
    },
    
    findUser: function(identifier, password) {
        const users = this.getAllUsers();
        identifier = identifier.toLowerCase().trim();
        
        return users.find(user => {
            const emailMatch = user.email.toLowerCase().trim() === identifier;
            const phoneMatch = user.telefono === identifier;
            const passMatch = user.password === password;
            
            return (emailMatch || phoneMatch) && passMatch;
        });
    },

    // Métodos de tema
    getThemePreference: function() {
        return localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    
    setTheme: function(theme) {
        localStorage.setItem('theme', theme);
    }
    
};

// Inicializar al cargar
AppStorage.init();