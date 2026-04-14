const Storage = {

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
        // Primero revisa localStorage, si no está, sessionStorage
        const data = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },
    
    clearData: function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn'); // <--- agregar
        sessionStorage.removeItem('sessionActive');
    },

    
    isLoggedIn: function() {
        // Usar localStorage primero, luego sessionStorage
        return localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('sessionActive') === 'true';
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