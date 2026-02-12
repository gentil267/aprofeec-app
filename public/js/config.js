// Configuration de l'application APROFEEC
const CONFIG = {
    // Environnement
    ENV: 'development', // development | production
    DEBUG: true,
    
    // URL de l'API
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : 'https://api.aprofeec.com/api',
    
    // Rôles disponibles avec permissions
    ROLES: {
        ADMIN: {
            name: 'admin',
            level: 100,
            permissions: ['all']
        },
        MENTOR: {
            name: 'mentor', 
            level: 80,
            permissions: ['manage_courses', 'view_students', 'send_messages']
        },
        APPRENANT: {
            name: 'apprenant',
            level: 50,
            permissions: ['view_courses', 'submit_assignments', 'send_messages']
        },
        VISITOR: {
            name: 'visitor',
            level: 0,
            permissions: ['view_public']
        }
    },
    
    // Routes de l'application
    ROUTES: {
        HOME: '/',
        DASHBOARD: '/dashboard.html',
        LOGIN: '/login.html',
        REGISTER: '/register.html',
        ADMIN: '/admin-panel.html',
        MENTOR: '/mentor-space.html',
        APPRENANT: '/apprenant-space.html',
        CHAT: '/chat.html',
        SETTINGS: '/settings.html',
        FORGOT_PASSWORD: '/forgot-password.html',
        PROFILE: '/profile.html',
        COURSES: '/courses.html',
        ASSIGNMENTS: '/assignments.html'
    },
    
    // Paramètres de session et authentification
    AUTH: {
        TOKEN_KEY: 'aprofeec_auth_token',
        REFRESH_TOKEN_KEY: 'aprofeec_refresh_token',
        USER_KEY: 'aprofeec_user_data',
        EXPIRY_KEY: 'aprofeec_token_expiry',
        BIOMETRIC_KEY: 'aprofeec_biometric_enabled',
        SESSION_TIMEOUT: 60 * 60 * 1000, // 1 heure
        AUTO_REFRESH: true
    },
    
    // Configuration du chat
    CHAT: {
        MAX_MESSAGES: 100,
        AUTO_REFRESH: 5000, // 5 secondes
        MESSAGE_LIMIT: 1000, // caractères
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'text/plain',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        TYPING_INDICATOR_TIMEOUT: 3000, // 3 secondes
        OFFLINE_STORAGE: true
    },
    
    // Configuration des notifications
    NOTIFICATIONS: {
        ENABLED: true,
        DURATION: 5000, // 5 secondes
        POSITION: 'top-right',
        VIBRATE: true,
        SOUND: false,
        TYPES: ['success', 'error', 'warning', 'info']
    },
    
    // Langues supportées
    LANGUAGES: [
        { code: 'fr', name: 'Français', flag: '🇫🇷', default: true },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'sw', name: 'Swahili', flag: '🇹🇿' }
    ],
    
    // Thèmes disponibles
    THEMES: {
        LIGHT: {
            name: 'light',
            colors: {
                primary: '#1e90ff',
                secondary: '#28a745',
                background: '#f8f9fa',
                text: '#212529'
            }
        },
        DARK: {
            name: 'dark',
            colors: {
                primary: '#0066cc',
                secondary: '#1e7e34',
                background: '#121212',
                text: '#f8f9fa'
            }
        },
        BLUE: {
            name: 'blue',
            colors: {
                primary: '#0a2463',
                secondary: '#1e90ff',
                background: '#e6f2ff',
                text: '#0a2463'
            }
        }
    },
    
    // Paramètres par défaut
    DEFAULTS: {
        THEME: 'light',
        LANGUAGE: 'fr',
        NOTIFICATIONS: true,
        EMAIL_UPDATES: true,
        PUSH_NOTIFICATIONS: false,
        AUTO_SAVE: true,
        PAGE_SIZE: 20
    },
    
    // Configuration du cache
    CACHE: {
        ENABLED: true,
        DURATION: 5 * 60 * 1000, // 5 minutes
        VERSION: '1.0.0'
    },
    
    // Breakpoints responsive
    BREAKPOINTS: {
        XS: 375,
        SM: 576,
        MD: 768,
        LG: 992,
        XL: 1200,
        XXL: 1400
    },
    
    // Configuration des fichiers
    UPLOAD: {
        MAX_SIZE: 25 * 1024 * 1024, // 25MB
        ALLOWED_TYPES: [
            'image/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ],
        MAX_FILES: 5
    },
    
    // Configuration de la PWA
    PWA: {
        NAME: 'APROFEEC',
        SHORT_NAME: 'APROFEEC',
        THEME_COLOR: '#1e90ff',
        BACKGROUND_COLOR: '#ffffff'
    },
    
    // Paramètres de sécurité
    SECURITY: {
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_REQUIREMENTS: {
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: false
        },
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
        SESSION_RENEWAL: true
    },
    
    // Configuration des dates et heures
    DATETIME: {
        DATE_FORMAT: 'DD/MM/YYYY',
        TIME_FORMAT: 'HH:mm',
        TIMEZONE: 'Africa/Dar_es_Salaam',
        FIRST_DAY_OF_WEEK: 1 // Monday
    }
};

// Export pour utilisation globale
window.APROFEEC_CONFIG = CONFIG;

// Fonctions d'aide
const Utils = {
    // Formatage de date
    formatDate: (date, format = 'DD/MM/YYYY') => {
        const d = new Date(date);
        if (format === 'DD/MM/YYYY') {
            return d.toLocaleDateString('fr-FR');
        }
        if (format === 'YYYY-MM-DD') {
            return d.toISOString().split('T')[0];
        }
        return d.toLocaleDateString();
    },
    
    // Formatage d'heure
    formatTime: (date, showSeconds = false) => {
        const d = new Date(date);
        return d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined
        });
    },
    
    // Formatage date et heure
    formatDateTime: (date) => {
        return `${Utils.formatDate(date)} à ${Utils.formatTime(date)}`;
    },
    
    // Validation d'email
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validation de mot de passe
    isValidPassword: (password) => {
        const minLength = CONFIG.SECURITY.PASSWORD_MIN_LENGTH;
        const req = CONFIG.SECURITY.PASSWORD_REQUIREMENTS;
        
        if (password.length < minLength) return false;
        if (req.uppercase && !/[A-Z]/.test(password)) return false;
        if (req.lowercase && !/[a-z]/.test(password)) return false;
        if (req.numbers && !/\d/.test(password)) return false;
        if (req.special && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
        
        return true;
    },
    
    // Génération d'ID unique
    generateId: (prefix = '') => {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Tronquer un texte
    truncate: (text, length = 100) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // Formater la taille d'un fichier
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Stockage local sécurisé
    storage: {
        set: (key, value) => {
            try {
                const data = {
                    value: value,
                    timestamp: Date.now(),
                    version: CONFIG.CACHE.VERSION
                };
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Erreur de stockage:', e);
                return false;
            }
        },
        
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const data = JSON.parse(item);
                
                // Vérifier la version
                if (data.version !== CONFIG.CACHE.VERSION) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                // Vérifier l'expiration
                if (CONFIG.CACHE.ENABLED && data.timestamp) {
                    const age = Date.now() - data.timestamp;
                    if (age > CONFIG.CACHE.DURATION) {
                        localStorage.removeItem(key);
                        return null;
                    }
                }
                
                return data.value;
            } catch (e) {
                console.error('Erreur de récupération:', e);
                return null;
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        },
        
        clear: (except = []) => {
            const keysToKeep = [...except, 'aprofeec_config_version'];
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            }
        },
        
        exists: (key) => {
            return localStorage.getItem(key) !== null;
        }
    },
    
    // URLs
    url: {
        getApiUrl: (endpoint) => {
            return `${CONFIG.API_URL}${endpoint}`;
        },
        
        getRoute: (routeName) => {
            return CONFIG.ROUTES[routeName] || '/';
        },
        
        redirect: (routeName, params = {}) => {
            let url = Utils.url.getRoute(routeName);
            if (params) {
                const query = new URLSearchParams(params).toString();
                if (query) url += '?' + query;
            }
            window.location.href = url;
        },
        
        navigate: (routeName, params = {}) => {
            Utils.url.redirect(routeName, params);
        }
    },
    
    // Vérification de rôle
    hasRole: (requiredRole, userRole) => {
        const roles = CONFIG.ROLES;
        const userLevel = roles[userRole]?.level || 0;
        const requiredLevel = roles[requiredRole]?.level || 0;
        return userLevel >= requiredLevel;
    },
    
    // Vérification de permission
    hasPermission: (permission, userRole) => {
        const role = CONFIG.ROLES[userRole];
        if (!role) return false;
        if (role.permissions.includes('all')) return true;
        return role.permissions.includes(permission);
    },
    
    // Détection d'appareil
    device: {
        isMobile: () => {
            return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        isTablet: () => {
            return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
        },
        
        isDesktop: () => {
            return !Utils.device.isMobile() && !Utils.device.isTablet();
        },
        
        isPWA: () => {
            return window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone === true;
        },
        
        getOS: () => {
            const userAgent = navigator.userAgent;
            if (/Windows/i.test(userAgent)) return 'Windows';
            if (/Mac/i.test(userAgent)) return 'macOS';
            if (/Linux/i.test(userAgent)) return 'Linux';
            if (/Android/i.test(userAgent)) return 'Android';
            if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
            return 'Unknown';
        }
    },
    
    // Network
    network: {
        isOnline: () => navigator.onLine,
        
        checkConnection: async () => {
            try {
                const response = await fetch('https://api.aprofeec.com/health', {
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                return response.ok;
            } catch {
                return false;
            }
        },
        
        getConnectionType: () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                return connection.effectiveType || 'unknown';
            }
            return 'unknown';
        }
    },
    
    // Débogage
    debug: {
        log: (...args) => {
            if (CONFIG.DEBUG) console.log('[APROFEEC]', ...args);
        },
        
        error: (...args) => {
            if (CONFIG.DEBUG) console.error('[APROFEEC]', ...args);
        },
        
        warn: (...args) => {
            if (CONFIG.DEBUG) console.warn('[APROFEEC]', ...args);
        },
        
        info: (...args) => {
            if (CONFIG.DEBUG) console.info('[APROFEEC]', ...args);
        }
    },
    
    // Animation
    animate: {
        scrollToTop: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        scrollToElement: (elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        
        fadeIn: (element, duration = 300) => {
            if (element) {
                element.style.opacity = 0;
                element.style.display = 'block';
                let opacity = 0;
                const interval = 10;
                const increment = interval / duration;
                
                const fade = () => {
                    opacity += increment;
                    element.style.opacity = opacity;
                    if (opacity < 1) {
                        setTimeout(fade, interval);
                    }
                };
                fade();
            }
        },
        
        fadeOut: (element, duration = 300) => {
            if (element) {
                let opacity = 1;
                const interval = 10;
                const decrement = interval / duration;
                
                const fade = () => {
                    opacity -= decrement;
                    element.style.opacity = opacity;
                    if (opacity > 0) {
                        setTimeout(fade, interval);
                    } else {
                        element.style.display = 'none';
                    }
                };
                fade();
            }
        }
    }
};

// Initialisation de la configuration
Utils.storage.set('aprofeec_config_version', CONFIG.CACHE.VERSION);

// Export pour utilisation globale
window.APROFEEC_UTILS = Utils;
window.APROFEEC = {
    config: CONFIG,
    utils: Utils
};

// Message de démarrage
if (CONFIG.DEBUG) {
    console.log(`%c🚀 APROFEEC v${CONFIG.CACHE.VERSION} - Configuration chargée`, 
        'color: #1e90ff; font-weight: bold; font-size: 14px;');
    console.log('Environment:', CONFIG.ENV);
    console.log('API URL:', CONFIG.API_URL);
}