// Système d'authentification APROFEEC
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadSession();
        this.setupAuthListeners();
    }

    loadSession() {
        const session = APROFEEC_UTILS.storage.get('aprofeec_session');
        if (session && !this.isSessionExpired(session)) {
            this.currentUser = session.user;
            this.updateUIForUser();
        } else {
            this.clearSession();
        }
    }

    isSessionExpired(session) {
        return Date.now() > session.expiresAt;
    }

    setupAuthListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLogout(e));
        });

        // Protected routes
        this.checkProtectedRoutes();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const role = form.querySelector('#role').value;
        
        // Validation
        if (!APROFEEC_UTILS.isValidEmail(email)) {
            this.showError('Email invalide');
            return;
        }

        if (password.length < 6) {
            this.showError('Mot de passe trop court (minimum 6 caractères)');
            return;
        }

        // Simulation d'authentification
        const user = await this.mockLogin(email, password, role);
        
        if (user) {
            this.createSession(user);
            this.redirectUser(user.role);
        } else {
            this.showError('Identifiants incorrects');
        }
    }

    async mockLogin(email, password, role) {
        // Simulation de délai API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Données simulées
        const mockUsers = {
            'admin@aprofeec.org': {
                id: 'admin-001',
                email: 'admin@aprofeec.org',
                name: 'Administrateur APROFEEC',
                role: 'admin',
                avatar: 'A'
            },
            'mentor@aprofeec.org': {
                id: 'mentor-001',
                email: 'mentor@aprofeec.org',
                name: 'Dr. Sarah Mentor',
                role: 'mentor',
                avatar: 'S'
            },
            'apprenant@aprofeec.org': {
                id: 'app-001',
                email: 'apprenant@aprofeec.org',
                name: 'Marie Apprenante',
                role: 'apprenant',
                avatar: 'M'
            }
        };

        // Vérification simple
        if (mockUsers[email] && password === 'aprofeec2024') {
            return mockUsers[email];
        }

        return null;
    }

    createSession(user) {
        const session = {
            user: user,
            token: APROFEEC_UTILS.generateId(),
            expiresAt: Date.now() + APROFEEC_CONFIG.SESSION.TIMEOUT
        };

        APROFEEC_UTILS.storage.set('aprofeec_session', session);
        this.currentUser = user;
        this.updateUIForUser();
        
        this.showNotification(`Bienvenue ${user.name} !`, 'success');
    }

    updateUIForUser() {
        // Mettre à jour l'interface en fonction de l'utilisateur
        const loginElements = document.querySelectorAll('.login-only');
        const userElements = document.querySelectorAll('.user-only');
        const adminElements = document.querySelectorAll('.admin-only');
        const mentorElements = document.querySelectorAll('.mentor-only');
        const apprenantElements = document.querySelectorAll('.apprenant-only');

        if (this.currentUser) {
            // Utilisateur connecté
            loginElements.forEach(el => el.style.display = 'none');
            userElements.forEach(el => el.style.display = 'block');
            
            // Afficher le nom de l'utilisateur
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = this.currentUser.name;
            });

            // Afficher l'avatar
            document.querySelectorAll('.user-avatar').forEach(el => {
                el.textContent = this.currentUser.avatar;
            });

            // Afficher les éléments spécifiques au rôle
            switch (this.currentUser.role) {
                case 'admin':
                    adminElements.forEach(el => el.style.display = 'block');
                    break;
                case 'mentor':
                    mentorElements.forEach(el => el.style.display = 'block');
                    break;
                case 'apprenant':
                    apprenantElements.forEach(el => el.style.display = 'block');
                    break;
            }
        } else {
            // Visiteur non connecté
            loginElements.forEach(el => el.style.display = 'block');
            userElements.forEach(el => el.style.display = 'none');
            adminElements.forEach(el => el.style.display = 'none');
            mentorElements.forEach(el => el.style.display = 'none');
            apprenantElements.forEach(el => el.style.display = 'none');
        }
    }

    redirectUser(role) {
        const routes = APROFEEC_CONFIG.ROUTES;
        
        switch (role) {
            case 'admin':
                window.location.href = routes.ADMIN;
                break;
            case 'mentor':
                window.location.href = routes.MENTOR;
                break;
            case 'apprenant':
                window.location.href = routes.APPRENANT;
                break;
            default:
                window.location.href = routes.HOME;
        }
    }

    handleLogout(e) {
        e.preventDefault();
        
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            this.clearSession();
            window.location.href = APROFEEC_CONFIG.ROUTES.HOME;
        }
    }

    clearSession() {
        APROFEEC_UTILS.storage.remove('aprofeec_session');
        this.currentUser = null;
        this.updateUIForUser();
    }

    checkProtectedRoutes() {
        const protectedRoutes = ['admin-panel.html', 'mentor-space.html', 'apprenant-space.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedRoutes.includes(currentPage) && !this.currentUser) {
            window.location.href = APROFEEC_CONFIG.ROUTES.LOGIN + '?redirect=' + encodeURIComponent(currentPage);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        `;
        
        const form = document.querySelector('#loginForm');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                errorDiv.style.opacity = '0';
                setTimeout(() => errorDiv.remove(), 300);
            }, 5000);
        } else {
            alert(message);
        }
    }

    showNotification(message, type) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback simple
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                border-radius: 8px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Vérifier les permissions
    hasPermission(requiredRole) {
        if (!this.currentUser) return false;
        
        const roleHierarchy = {
            'admin': ['admin', 'mentor', 'apprenant'],
            'mentor': ['mentor', 'apprenant'],
            'apprenant': ['apprenant']
        };
        
        return roleHierarchy[requiredRole]?.includes(this.currentUser.role) || false;
    }

    // Récupérer l'utilisateur courant
    getUser() {
        return this.currentUser;
    }

    // Vérifier si connecté
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialiser le système d'authentification
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthSystem();
});
