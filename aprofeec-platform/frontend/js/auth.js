/**
 * APROFEEC Authentication Module
 * Gère l'authentification, l'inscription, la connexion, les tokens
 */

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('aprofeec_token');
        this.user = JSON.parse(localStorage.getItem('aprofeec_user') || 'null');
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
    }

    // Vérifier si l'utilisateur est connecté
    async checkAuth() {
        if (!this.token) {
            return { authenticated: false };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid) {
                    this.user = data.user;
                    localStorage.setItem('aprofeec_user', JSON.stringify(data.user));
                    return { 
                        authenticated: true, 
                        user: data.user,
                        token: this.token 
                    };
                }
            }
        } catch (error) {
            console.error('Erreur vérification token:', error);
        }

        // Si échec, déconnexion
        this.logout();
        return { authenticated: false };
    }

    // Connexion
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('aprofeec_token', data.token);
                localStorage.setItem('aprofeec_user', JSON.stringify(data.user));
                
                // Journalisation de la connexion
                this.logActivity('login', 'Connexion réussie');
                
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    // Inscription
    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('aprofeec_token', data.token);
                localStorage.setItem('aprofeec_user', JSON.stringify(data.user));
                
                // Journalisation
                this.logActivity('register', 'Inscription réussie');
                
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erreur inscription:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    // Déconnexion
    logout() {
        localStorage.removeItem('aprofeec_token');
        localStorage.removeItem('aprofeec_user');
        this.token = null;
        this.user = null;
        
        // Redirection vers la page de connexion
        window.location.href = '/login.html';
    }

    // Changer de mot de passe
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur changement mot de passe:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    // Demande de réinitialisation de mot de passe
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reset-password-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur demande réinitialisation:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    // Réinitialiser le mot de passe
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur réinitialisation:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    // Journalisation d'activité
    async logActivity(action, details) {
        try {
            await fetch(`${this.apiBaseUrl}/log-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ 
                    action, 
                    details,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Erreur journalisation:', error);
        }
    }

    // Vérifier le code d'invitation
    async verifyInvitationCode(code) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/verify-invitation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code.toUpperCase() })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur vérification code:', error);
            return { valid: false, message: 'Erreur de connexion' };
        }
    }

    // Obtenir les headers d'authentification
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Rediriger si non authentifié
    requireAuth(redirectTo = '/login.html') {
        if (!this.token || !this.user) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // Obtenir le rôle de l'utilisateur
    getUserRole() {
        return this.user ? this.user.role : 'guest';
    }

    // Vérifier si l'utilisateur a un rôle spécifique
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Mettre à jour les informations utilisateur
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            
            if (data.success) {
                // Mettre à jour les données locales
                this.user = { ...this.user, ...profileData };
                localStorage.setItem('aprofeec_user', JSON.stringify(this.user));
            }
            
            return data;
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }
}

// Initialiser l'authentification
const auth = new AuthManager();

// Fonction de validation de formulaire
function validateForm(formData) {
    const errors = {};

    // Validation email
    if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            errors.email = 'Adresse email invalide';
        }
    }

    // Validation mot de passe
    if (formData.password) {
        if (formData.password.length < 8) {
            errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        
        // Vérifier la confirmation
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
    }

    // Validation téléphone
    if (formData.phone) {
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(formData.phone)) {
            errors.phone = 'Numéro de téléphone invalide';
        }
    }

    // Validation champs requis
    const requiredFields = ['firstName', 'lastName', 'email', 'password'];
    requiredFields.forEach(field => {
        if (formData[field] && !formData[field].trim()) {
            errors[field] = 'Ce champ est requis';
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Fonction pour afficher les erreurs
function displayFormErrors(formId, errors) {
    // Réinitialiser les erreurs
    document.querySelectorAll(`#${formId} .error-message`).forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll(`#${formId} .form-control`).forEach(el => {
        el.classList.remove('error');
    });

    // Afficher les nouvelles erreurs
    Object.keys(errors).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = errors[fieldName];
            errorElement.style.display = 'flex';
        }
    });
}

// Fonction pour gérer l'inscription
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword')?.value,
        invitationCode: document.getElementById('invitationCode').value
    };

    // Validation
    const validation = validateForm(formData);
    if (!validation.isValid) {
        displayFormErrors('registerForm', validation.errors);
        return;
    }

    // Afficher le chargement
    const submitBtn = document.getElementById('submitRegistration');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création en cours...';
    submitBtn.disabled = true;

    try {
        // Vérifier le code d'invitation
        const codeVerification = await auth.verifyInvitationCode(formData.invitationCode);
        if (!codeVerification.valid) {
            alert('Code d\'invitation invalide. Veuillez vérifier le code.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Inscription
        const result = await auth.register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            invitationCode: formData.invitationCode.toUpperCase()
        });

        if (result.success) {
            // Redirection vers le dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert(`Erreur: ${result.message}`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erreur inscription:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Fonction pour gérer la connexion
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    // Validation basique
    if (!formData.email || !formData.password) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    // Afficher le chargement
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
    submitBtn.disabled = true;

    try {
        const result = await auth.login(formData.email, formData.password);
        
        if (result.success) {
            // Redirection vers le dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert(`Erreur: ${result.message}`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erreur connexion:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Initialisation des formulaires d'authentification
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification pour les pages protégées
    if (!window.location.pathname.includes('login') && 
        !window.location.pathname.includes('register')) {
        auth.requireAuth();
    }

    // Gérer l'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Vérification du code d'invitation en temps réel
        const invitationCodeInput = document.getElementById('invitationCode');
        if (invitationCodeInput) {
            invitationCodeInput.addEventListener('blur', async function() {
                const code = this.value.trim().toUpperCase();
                if (code.length === 8) {
                    const result = await auth.verifyInvitationCode(code);
                    if (result.valid) {
                        this.style.borderColor = '#10b981';
                    } else {
                        this.style.borderColor = '#ef4444';
                    }
                }
            });
        }

        // Gestion de l'affichage du mot de passe
        const togglePasswordBtn = document.getElementById('togglePassword');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.innerHTML = type === 'password' 
                    ? '<i class="fas fa-eye"></i>' 
                    : '<i class="fas fa-eye-slash"></i>';
            });
        }

        // Force du mot de passe
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strengthBar = document.getElementById('passwordStrength');
                const requirements = {
                    length: document.getElementById('reqLength'),
                    uppercase: document.getElementById('reqUppercase'),
                    number: document.getElementById('reqNumber'),
                    special: document.getElementById('reqSpecial')
                };

                let strength = 0;
                
                // Longueur
                if (password.length >= 8) {
                    requirements.length.classList.add('met');
                    requirements.length.classList.remove('unmet');
                    strength++;
                } else {
                    requirements.length.classList.remove('met');
                    requirements.length.classList.add('unmet');
                }

                // Majuscule
                if (/[A-Z]/.test(password)) {
                    requirements.uppercase.classList.add('met');
                    requirements.uppercase.classList.remove('unmet');
                    strength++;
                } else {
                    requirements.uppercase.classList.remove('met');
                    requirements.uppercase.classList.add('unmet');
                }

                // Chiffre
                if (/[0-9]/.test(password)) {
                    requirements.number.classList.add('met');
                    requirements.number.classList.remove('unmet');
                    strength++;
                } else {
                    requirements.number.classList.remove('met');
                    requirements.number.classList.add('unmet');
                }

                // Caractère spécial
                if (/[^A-Za-z0-9]/.test(password)) {
                    requirements.special.classList.add('met');
                    requirements.special.classList.remove('unmet');
                    strength++;
                } else {
                    requirements.special.classList.remove('met');
                    requirements.special.classList.add('unmet');
                }

                // Mettre à jour la barre de force
                strengthBar.className = 'password-strength-bar';
                if (strength === 1) strengthBar.classList.add('strength-weak');
                else if (strength === 2) strengthBar.classList.add('strength-fair');
                else if (strength === 3) strengthBar.classList.add('strength-good');
                else if (strength === 4) strengthBar.classList.add('strength-strong');
            });
        }
    }

    // Gérer la connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                auth.logout();
            }
        });
    }
});

// Exporter l'instance auth
window.auth = auth;

// Utilitaires pour les formulaires
window.validateForm = validateForm;
window.displayFormErrors = displayFormErrors;