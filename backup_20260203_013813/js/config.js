// Configuration de l'application APROFEEC
const CONFIG = {
    // URL de l'API (simulation pour le moment)
    API_URL: 'https://api.aprofeec.local',
    
    // Rôles disponibles
    ROLES: {
        ADMIN: 'admin',
        MENTOR: 'mentor',
        APPRENANT: 'apprenant',
        VISITOR: 'visitor'
    },
    
    // Routes de l'application
    ROUTES: {
        HOME: '/',
        LOGIN: '/login.html',
        ADMIN: '/admin-panel.html',
        MENTOR: '/mentor-space.html',
        APPRENANT: '/apprenant-space.html',
        CHAT: '/chat.html',
        SETTINGS: '/settings.html'
    },
    
    // Paramètres de session
    SESSION: {
        TIMEOUT: 60 * 60 * 1000, // 1 heure
        KEY: 'aprofeec_session'
    },
    
    // Configuration du chat
    CHAT: {
        MAX_MESSAGES: 100,
        AUTO_REFRESH: 5000, // 5 secondes
        MESSAGE_LIMIT: 1000 // caractères
    },
    
    // Langues supportées (futur)
    LANGUAGES: [
        { code: 'fr', name: 'Français' },
        { code: 'en', name: 'English' },
        { code: 'sw', name: 'Swahili' }
    ],
    
    // Thèmes disponibles
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        BLUE: 'blue'
    },
    
    // Paramètres par défaut
    DEFAULTS: {
        THEME: 'light',
        LANGUAGE: 'fr',
        NOTIFICATIONS: true,
        EMAIL_UPDATES: true
    }
};

// Export pour utilisation globale
window.APROFEEC_CONFIG = CONFIG;

// Fonctions d'aide
const Utils = {
    // Formatage de date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    // Formatage d'heure
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Validation d'email
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Génération d'ID unique
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Stockage local sécurisé
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Erreur de stockage:', e);
            }
        },
        
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Erreur de récupération:', e);
                return null;
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        },
        
        clear: () => {
            localStorage.clear();
        }
    }
};

window.APROFEEC_UTILS = Utils;