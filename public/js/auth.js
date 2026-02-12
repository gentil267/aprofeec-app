/**
 * APROFEEC - Système d'authentification mobile-first
 * @version 2.1.0
 * @description Authentification optimisée pour mobile avec PWA, biometrie et offline support
 */

class APROFEECAuth {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin,
            tokenKey: 'aprofeec_auth_token',
            refreshTokenKey: 'aprofeec_refresh_token',
            userKey: 'aprofeec_user_data',
            tokenExpiryKey: 'aprofeec_token_expiry',
            biometricKey: 'aprofeec_biometric_enabled'
        };
        
        this.init();
    }
    
    /**
     * Initialisation du système d'authentification
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupForms();
            this.checkExistingAuth();
            this.setupMobileFeatures();
            this.setupOfflineDetection();
        });
        
        // Écouter les changements de réseau
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }
    
    /**
     * Configuration des formulaires d'authentification
     */
    setupForms() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Ajouter des événements de validation en temps réel
            this.addRealTimeValidation(loginForm);
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
            
            // Ajouter le bouton de connexion biométrique
            this.addBiometricLoginButton(loginForm);
        }
        
        // Formulaire d'inscription
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            this.addRealTimeValidation(registerForm);
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        
        // Formulaire de récupération
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            this.addRealTimeValidation(forgotForm);
            forgotForm.addEventListener('submit', this.handleForgotPassword.bind(this));
        }
        
        // Bouton de déconnexion
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', this.logout.bind(this));
        });
        
        // Afficher/masquer le mot de passe
        this.setupPasswordToggle();
    }
    
    /**
     * Gestion de la connexion (mobile optimisé)
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value.trim().toLowerCase();
        const password = form.password.value;
        const remember = form.remember?.checked;
        const useBiometric = form.querySelector('[data-biometric]')?.dataset?.biometric === 'true';
        
        // Validation mobile-friendly
        if (!this.validateEmail(email)) {
            this.showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
            return;
        }
        
        // Désactiver le bouton et montrer le loader
        const submitBtn = form.querySelector('button[type="submit"]');
        this.disableButton(submitBtn, '<span class="spinner-btn spinner-btn-sm"></span> Connexion...');
        
        try {
            // Vérifier si on est en ligne
            if (!navigator.onLine) {
                throw new Error('Vous êtes hors ligne. Veuillez vérifier votre connexion internet.');
            }
            
            // Appel API réel ou simulation
            const response = await this.apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ 
                    email, 
                    password,
                    deviceInfo: this.getDeviceInfo(),
                    biometric: useBiometric
                })
            });
            
            if (response.success) {
                // Sauvegarder les tokens
                await this.saveAuthData(response.data, remember);
                
                // Vibration tactile sur mobile
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]);
                }
                
                this.showNotification('✅ Connexion réussie!', 'success');
                
                // Mettre à jour le service worker si PWA
                if ('serviceWorker' in navigator && response.data.token) {
                    await this.updateServiceWorkerToken(response.data.token);
                }
                
                // Redirection basée sur le rôle et l'appareil
                setTimeout(() => {
                    this.redirectBasedOnRole(response.data.user.role);
                }, 1000);
                
            } else {
                throw new Error(response.message || 'Identifiants incorrects');
            }
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
            
            // Gestion d'erreur spécifique pour mobile
            let errorMessage = 'Erreur de connexion';
            
            if (error.message.includes('hors ligne')) {
                errorMessage = 'Connectez-vous à internet pour vous connecter';
            } else if (error.message.includes('Identifiants')) {
                errorMessage = 'Email ou mot de passe incorrect';
            } else if (error.message.includes('rate limit')) {
                errorMessage = 'Trop de tentatives. Réessayez dans 15 minutes';
            } else {
                errorMessage = error.message;
            }
            
            this.showNotification(errorMessage, 'error');
            
            // Compteur de tentatives échouées
            this.incrementFailedAttempts();
            
        } finally {
            this.enableButton(submitBtn, 'Se connecter');
        }
    }
    
    /**
     * Gestion de l'inscription
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validation mobile
        if (!this.validateEmail(data.email)) {
            this.showNotification('Email invalide', 'error');
            return;
        }
        
        if (data.password.length < 8) {
            this.showNotification('8 caractères minimum pour le mot de passe', 'error');
            return;
        }
        
        if (data.password !== data.confirmPassword) {
            this.showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (data.terms && data.terms !== 'on') {
            this.showNotification('Acceptez les conditions d\'utilisation', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        this.disableButton(submitBtn, '<span class="spinner-btn spinner-btn-sm"></span> Création du compte...');
        
        try {
            // Vérification en temps réel de l'email
            const emailAvailable = await this.checkEmailAvailability(data.email);
            if (!emailAvailable) {
                throw new Error('Cet email est déjà utilisé');
            }
            
            const response = await this.apiCall('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    deviceInfo: this.getDeviceInfo(),
                    userAgent: navigator.userAgent
                })
            });
            
            if (response.success) {
                this.showNotification('✅ Compte créé avec succès! Vérifiez votre email.', 'success');
                
                // Redirection avec délai pour mobile
                setTimeout(() => {
                    window.location.href = 'login.html?registered=true';
                }, 2000);
                
            } else {
                throw new Error(response.message || 'Erreur lors de l\'inscription');
            }
            
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.enableButton(submitBtn, 'S\'inscrire');
        }
    }
    
    /**
     * Mot de passe oublié
     */
    async handleForgotPassword(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value.trim();
        
        if (!this.validateEmail(email)) {
            this.showNotification('Email invalide', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        this.disableButton(submitBtn, '<span class="spinner-btn spinner-btn-sm"></span> Envoi en cours...');
        
        try {
            const response = await this.apiCall('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            
            if (response.success) {
                this.showNotification('✅ Instructions envoyées à votre email!', 'success');
                form.reset();
                
                // Retour automatique à la connexion
                setTimeout(() => {
                    window.location.href = 'login.html?reset=instructions-sent';
                }, 1500);
            } else {
                throw new Error(response.message || 'Erreur lors de l\'envoi');
            }
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.enableButton(submitBtn, 'Réinitialiser');
        }
    }
    
    /**
     * Sauvegarde sécurisée des données d'authentification
     */
    async saveAuthData(authData, remember = false) {
        try {
            // Stockage sécurisé dans localStorage
            localStorage.setItem(this.config.tokenKey, authData.token);
            localStorage.setItem(this.config.userKey, JSON.stringify(authData.user));
            localStorage.setItem(this.config.tokenExpiryKey, Date.now() + (24 * 60 * 60 * 1000)); // 24h
            
            if (authData.refreshToken) {
                localStorage.setItem(this.config.refreshTokenKey, authData.refreshToken);
            }
            
            // Stockage sécurisé supplémentaire
            if (remember) {
                // Utiliser une API de stockage sécurisé si disponible
                if (window.sessionStorage) {
                    sessionStorage.setItem(this.config.tokenKey, authData.token);
                }
                
                // Cookie sécurisé (HttpOnly devrait être côté serveur)
                this.setSecureCookie('aprofeec_auth', authData.token, 30);
            }
            
            // Sauvegarde biométrique si activée
            if (authData.biometricEnabled && this.supportsBiometric()) {
                await this.saveBiometricData(authData);
            }
            
            // Mettre à jour l'état d'authentification dans le DOM
            this.updateAuthState();
            
        } catch (error) {
            console.error('Erreur de sauvegarde des données:', error);
            throw error;
        }
    }
    
    /**
     * Déconnexion sécurisée
     */
    async logout(force = false) {
        // Demander confirmation (sauf si force = true)
        if (!force) {
            const confirmed = await this.showConfirmation(
                'Déconnexion',
                'Êtes-vous sûr de vouloir vous déconnecter ?',
                'warning'
            );
            
            if (!confirmed) return;
        }
        
        try {
            // Appel API de déconnexion
            await this.apiCall('/api/auth/logout', {
                method: 'POST'
            });
            
        } catch (error) {
            console.warn('Erreur lors de la déconnexion API:', error);
            // Continuer quand même la déconnexion locale
        }
        
        // Nettoyage complet
        this.clearAuthData();
        
        // Vibration sur mobile
        if (navigator.vibrate) {
            navigator.vibrate([100]);
        }
        
        this.showNotification('✅ Déconnexion réussie', 'success');
        
        // Redirection après déconnexion
        setTimeout(() => {
            const currentPath = window.location.pathname;
            
            // Ne pas rediriger depuis les pages publiques
            if (!currentPath.includes('login') && !currentPath.includes('register')) {
                window.location.href = 'index.html?loggedout=true';
            }
        }, 500);
    }
    
    /**
     * Vérification de l'authentification existante
     */
    async checkExistingAuth() {
        const token = localStorage.getItem(this.config.tokenKey);
        const currentPage = window.location.pathname;
        
        // Vérifier si le token est expiré
        if (token && this.isTokenExpired()) {
            await this.refreshToken();
            return;
        }
        
        // Si l'utilisateur est connecté et sur une page d'auth, rediriger
        if (token && (currentPage.includes('login') || currentPage.includes('register'))) {
            // Petit délai pour UX
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 100);
            return;
        }
        
        // Si l'utilisateur n'est pas connecté et sur une page protégée
        if (!token && this.isProtectedPage(currentPage)) {
            // Sauvegarder la page demandée pour redirection après login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        // Mettre à jour l'interface utilisateur
        this.updateAuthState();
    }
    
    /**
     * Rafraîchissement du token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem(this.config.refreshTokenKey);
            
            if (!refreshToken) {
                this.logout(true);
                return;
            }
            
            const response = await this.apiCall('/api/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            });
            
            if (response.success) {
                await this.saveAuthData(response.data, false);
                console.log('✅ Token rafraîchi avec succès');
            } else {
                this.logout(true);
            }
            
        } catch (error) {
            console.error('Erreur de rafraîchissement du token:', error);
            this.logout(true);
        }
    }
    
    /**
     * Vérifier les permissions
     */
    checkPermission(requiredRoles = [], requiredPermissions = []) {
        const userData = JSON.parse(localStorage.getItem(this.config.userKey) || '{}');
        
        if (!userData.id) {
            return false;
        }
        
        // Vérifier le rôle
        if (requiredRoles.length > 0 && !requiredRoles.includes(userData.role)) {
            this.showNotification('Accès non autorisé', 'error');
            return false;
        }
        
        // Vérifier les permissions spécifiques (si implémenté côté serveur)
        if (requiredPermissions.length > 0 && userData.permissions) {
            const hasPermission = requiredPermissions.every(permission => 
                userData.permissions.includes(permission)
            );
            
            if (!hasPermission) {
                this.showNotification('Permissions insuffisantes', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validation d'email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Vérification de disponibilité d'email
     */
    async checkEmailAvailability(email) {
        try {
            const response = await this.apiCall(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            return response.available || false;
        } catch (error) {
            return true; // En cas d'erreur, permettre l'inscription
        }
    }
    
    /**
     * Appel API générique avec gestion d'erreur
     */
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        const token = localStorage.getItem(this.config.tokenKey);
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, mergedOptions);
            
            // Vérifier si le token a expiré
            if (response.status === 401) {
                await this.refreshToken();
                // Réessayer la requête avec le nouveau token
                return this.apiCall(endpoint, options);
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Erreur ${response.status}`);
            }
            
            return data;
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    /**
     * Désactiver un bouton avec loader
     */
    disableButton(button, text = 'Chargement...') {
        if (!button) return;
        
        button.setAttribute('data-original-text', button.innerHTML);
        button.innerHTML = text;
        button.disabled = true;
        button.classList.add('disabled');
    }
    
    /**
     * Réactiver un bouton
     */
    enableButton(button, originalText = null) {
        if (!button) return;
        
        const text = originalText || button.getAttribute('data-original-text') || 'Valider';
        button.innerHTML = text;
        button.disabled = false;
        button.classList.remove('disabled');
        button.removeAttribute('data-original-text');
    }
    
    /**
     * Ajouter la validation en temps réel
     */
    addRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }
    
    /**
     * Valider un champ en temps réel
     */
    validateInput(input) {
        const value = input.value.trim();
        const container = input.closest('.form-group') || input.parentElement;
        
        // Retirer les états précédents
        container.classList.remove('is-valid', 'is-invalid');
        
        if (!value && input.required) {
            container.classList.add('is-invalid');
            return false;
        }
        
        // Validation spécifique par type
        if (input.type === 'email' && value) {
            if (!this.validateEmail(value)) {
                container.classList.add('is-invalid');
                return false;
            }
        }
        
        if (input.type === 'password' && value.length < 8) {
            container.classList.add('is-invalid');
            return false;
        }
        
        if (input.hasAttribute('data-match')) {
            const matchField = document.getElementById(input.getAttribute('data-match'));
            if (matchField && value !== matchField.value) {
                container.classList.add('is-invalid');
                return false;
            }
        }
        
        container.classList.add('is-valid');
        return true;
    }
    
    /**
     * Redirection basée sur le rôle
     */
    redirectBasedOnRole(role) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin');
        
        if (redirectTo) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectTo;
            return;
        }
        
        const routes = {
            'admin': 'admin-panel.html',
            'mentor': 'mentor-space.html',
            'learner': 'apprenant-space.html',
            'teacher': 'mentor-space.html'
        };
        
        const defaultRoute = 'dashboard.html';
        const route = routes[role] || defaultRoute;
        
        window.location.href = route;
    }
    
    /**
     * Mettre à jour l'état d'authentification dans le DOM
     */
    updateAuthState() {
        const userData = JSON.parse(localStorage.getItem(this.config.userKey) || '{}');
        
        // Mettre à jour les éléments avec data-auth="user-name"
        const userNameElements = document.querySelectorAll('[data-auth="user-name"]');
        userNameElements.forEach(el => {
            if (userData.name) {
                el.textContent = userData.name;
                el.classList.remove('d-none');
            }
        });
        
        // Mettre à jour les éléments avec data-auth="user-avatar"
        const avatarElements = document.querySelectorAll('[data-auth="user-avatar"]');
        avatarElements.forEach(el => {
            if (userData.avatar) {
                el.src = userData.avatar;
                el.classList.remove('d-none');
            }
        });
        
        // Afficher/masquer les éléments basés sur l'authentification
        const authOnlyElements = document.querySelectorAll('[data-auth-only]');
        authOnlyElements.forEach(el => {
            if (userData.id) {
                el.classList.remove('d-none');
            } else {
                el.classList.add('d-none');
            }
        });
        
        const guestOnlyElements = document.querySelectorAll('[data-guest-only]');
        guestOnlyElements.forEach(el => {
            if (!userData.id) {
                el.classList.remove('d-none');
            } else {
                el.classList.add('d-none');
            }
        });
        
        // Mettre à jour les éléments basés sur le rôle
        if (userData.role) {
            const roleElements = document.querySelectorAll(`[data-role="${userData.role}"]`);
            roleElements.forEach(el => el.classList.remove('d-none'));
        }
    }
    
    /**
     * Vérifier si une page est protégée
     */
    isProtectedPage(path) {
        const protectedPages = [
            '/dashboard',
            '/apprenant-space',
            '/mentor-space',
            '/admin-panel',
            '/chat',
            '/setting'
        ];
        
        return protectedPages.some(page => path.includes(page));
    }
    
    /**
     * Vérifier si le token est expiré
     */
    isTokenExpired() {
        const expiry = localStorage.getItem(this.config.tokenExpiryKey);
        if (!expiry) return true;
        
        return Date.now() > parseInt(expiry);
    }
    
    /**
     * Effacer toutes les données d'authentification
     */
    clearAuthData() {
        // LocalStorage
        localStorage.removeItem(this.config.tokenKey);
        localStorage.removeItem(this.config.refreshTokenKey);
        localStorage.removeItem(this.config.userKey);
        localStorage.removeItem(this.config.tokenExpiryKey);
        localStorage.removeItem(this.config.biometricKey);
        
        // SessionStorage
        sessionStorage.removeItem(this.config.tokenKey);
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Cookies
        this.setSecureCookie('aprofeec_auth', '', -1);
        
        // IndexedDB (si utilisé)
        this.clearIndexedDBAuth();
        
        // Mettre à jour l'UI
        this.updateAuthState();
    }
    
    /**
     * Obtenir les informations de l'appareil
     */
    getDeviceInfo() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: {
                width: screen.width,
                height: screen.height,
                orientation: screen.orientation?.type
            },
            isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
            isPWA: window.matchMedia('(display-mode: standalone)').matches
        };
    }
    
    /**
     * Vérifier si la biométrie est supportée
     */
    supportsBiometric() {
        return 'credentials' in navigator && 'publicKey' in window;
    }
    
    /**
     * Ajouter le bouton de connexion biométrique
     */
    addBiometricLoginButton(form) {
        if (!this.supportsBiometric()) return;
        
        const biometricData = localStorage.getItem(this.config.biometricKey);
        if (!biometricData) return;
        
        const container = form.querySelector('.form-actions') || form;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary btn-biometric';
        button.innerHTML = '<i class="fas fa-fingerprint"></i> Connexion biométrique';
        button.addEventListener('click', () => this.authenticateWithBiometric());
        
        container.prepend(button);
    }
    
    /**
     * Authentification biométrique
     */
    async authenticateWithBiometric() {
        try {
            // WebAuthn API pour biométrie
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32),
                    allowCredentials: [{
                        type: 'public-key',
                        id: new Uint8Array(32)
                    }],
                    userVerification: 'required'
                }
            });
            
            // Utiliser le credential pour l'authentification
            const response = await this.apiCall('/api/auth/biometric', {
                method: 'POST',
                body: JSON.stringify({ credential })
            });
            
            if (response.success) {
                await this.saveAuthData(response.data, true);
                this.redirectBasedOnRole(response.data.user.role);
            }
            
        } catch (error) {
            console.error('Erreur biométrique:', error);
            this.showNotification('Échec de l\'authentification biométrique', 'error');
        }
    }
    
    /**
     * Configuration des fonctionnalités mobiles
     */
    setupMobileFeatures() {
        // Détection de l'appareil
        if (this.isMobileDevice()) {
            document.body.classList.add('is-mobile');
            
            // Améliorer l'UX mobile
            this.enhanceMobileUX();
        }
        
        // PWA: Ajouter au écran d'accueil
        this.setupPWAInstallPrompt();
    }
    
    /**
     * Détection d'appareil mobile
     */
    isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Améliorer l'UX mobile
     */
    enhanceMobileUX() {
        // Agrandir les zones cliquables
        document.querySelectorAll('button, a, input[type="submit"]').forEach(el => {
            if (el.offsetHeight < 44 || el.offsetWidth < 44) {
                el.style.minHeight = '44px';
                el.style.minWidth = '44px';
                el.style.padding = '12px 16px';
            }
        });
        
        // Optimiser le clavier virtuel
        document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
            input.setAttribute('autocapitalize', 'none');
            input.setAttribute('autocomplete', 'on');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('spellcheck', 'false');
        });
        
        // Prévenir le zoom sur focus
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                document.body.style.zoom = '100%';
            }
        }, { passive: true });
    }
    
    /**
     * Gestion hors ligne
     */
    setupOfflineDetection() {
        if (!navigator.onLine) {
            this.showNotification('Vous êtes hors ligne', 'warning');
        }
    }
    
    /**
     * Événement en ligne
     */
    handleOnline() {
        this.showNotification('✅ Connexion internet rétablie', 'success');
        
        // Synchroniser les données en attente
        this.syncPendingData();
    }
    
    /**
     * Événement hors ligne
     */
    handleOffline() {
        this.showNotification('⚠️ Vous êtes hors ligne', 'warning');
    }
    
    /**
     * Synchronisation des données en attente
     */
    async syncPendingData() {
        const pending = JSON.parse(localStorage.getItem('pending_actions') || '[]');
        
        if (pending.length > 0) {
            this.showNotification('Synchronisation des données...', 'info');
            
            for (const action of pending) {
                try {
                    await this.apiCall(action.endpoint, action.options);
                } catch (error) {
                    console.error('Échec de synchronisation:', error);
                }
            }
            
            localStorage.removeItem('pending_actions');
            this.showNotification('✅ Synchronisation terminée', 'success');
        }
    }
    
    /**
     * Notification mobile-friendly
     */
    showNotification(message, type = 'info') {
        // Vérifier que le CSS est chargé
        if (!document.querySelector('.mobile-notification')) {
            console.warn('CSS des notifications non chargé');
            // Fallback aux alertes natives
            alert(message);
            return;
        }
        
        // Vibration sur mobile
        if (navigator.vibrate) {
            const vibrations = {
                'success': [100, 50, 100],
                'error': [300, 100, 300],
                'warning': [200, 100, 200],
                'info': [100]
            };
            navigator.vibrate(vibrations[type] || [100]);
        }
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `mobile-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-destruction
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Icône de notification
     */
    getNotificationIcon(type) {
        const icons = {
            'success': '<i class="fas fa-check-circle"></i>',
            'error': '<i class="fas fa-exclamation-circle"></i>',
            'warning': '<i class="fas fa-exclamation-triangle"></i>',
            'info': '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * Boîte de confirmation mobile
     */
    async showConfirmation(title, message, type = 'warning') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'mobile-confirmation-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h5>${title}</h5>
                    </div>
                    <div class="modal-body">
                        <div class="confirmation-icon">${this.getNotificationIcon(type)}</div>
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline-secondary" data-action="cancel">Annuler</button>
                        <button class="btn btn-${type}" data-action="confirm">Confirmer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Gérer les clics
            modal.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    modal.remove();
                    resolve(action === 'confirm');
                });
            });
            
            // Fermer en cliquant en dehors
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }
    
    /**
     * Définir un cookie sécurisé
     */
    setSecureCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        const sameSite = '; SameSite=Strict';
        
        document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/${secure}${sameSite}`;
    }
    
    /**
     * Basculer la visibilité du mot de passe
     */
    setupPasswordToggle() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = toggle.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    toggle.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
    }
    
    /**
     * Incrémenter les tentatives échouées
     */
    incrementFailedAttempts() {
        let attempts = parseInt(localStorage.getItem('failed_login_attempts') || '0');
        attempts++;
        localStorage.setItem('failed_login_attempts', attempts.toString());
        
        // Bloquer après 5 tentatives
        if (attempts >= 5) {
            const blockUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
            localStorage.setItem('login_blocked_until', blockUntil.toString());
            this.showNotification('Trop de tentatives. Réessayez dans 15 minutes.', 'error');
        }
    }
    
    /**
     * Vérifier si le login est bloqué
     */
    isLoginBlocked() {
        const blockedUntil = localStorage.getItem('login_blocked_until');
        if (!blockedUntil) return false;
        
        return Date.now() < parseInt(blockedUntil);
    }
    
    /**
     * Mettre à jour le token dans le Service Worker
     */
    async updateServiceWorkerToken(token) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_TOKEN',
                token: token
            });
        }
    }
    
    /**
     * Sauvegarder les données biométriques
     */
    async saveBiometricData(authData) {
        try {
            // Stockage sécurisé des données biométriques
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array(32),
                    rp: { name: 'APROFEEC' },
                    user: {
                        id: new Uint8Array(16),
                        name: authData.user.email,
                        displayName: authData.user.name
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required'
                    },
                    timeout: 60000,
                    attestation: 'none'
                }
            });
            
            localStorage.setItem(this.config.biometricKey, JSON.stringify({
                credentialId: credential.id,
                userId: authData.user.id
            }));
            
        } catch (error) {
            console.warn('Erreur de sauvegarde biométrique:', error);
        }
    }
    
    /**
     * Nettoyer IndexedDB (si utilisé)
     */
    async clearIndexedDBAuth() {
        // Si vous utilisez IndexedDB pour le cache
        if ('indexedDB' in window) {
            try {
                const dbs = await indexedDB.databases();
                for (const db of dbs) {
                    if (db.name.includes('aprofeec')) {
                        indexedDB.deleteDatabase(db.name);
                    }
                }
            } catch (error) {
                console.warn('Erreur nettoyage IndexedDB:', error);
            }
        }
    }
    
    /**
     * Configurer la prompt PWA
     */
    setupPWAInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Afficher un bouton d'installation
            const installBtn = document.createElement('button');
            installBtn.className = 'btn btn-success btn-install-pwa d-none';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
            installBtn.addEventListener('click', () => {
                installBtn.classList.add('d-none');
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installée');
                    }
                    deferredPrompt = null;
                });
            });
            
            document.body.appendChild(installBtn);
            setTimeout(() => installBtn.classList.remove('d-none'), 2000);
        });
    }
}

// Initialiser l'authentification
window.APROFEECAuth = new APROFEECAuth();

// Exporter les fonctions globales pour compatibilité
window.logout = () => APROFEECAuth.logout();
window.checkPermission = (roles, permissions) => APROFEECAuth.checkPermission(roles, permissions);