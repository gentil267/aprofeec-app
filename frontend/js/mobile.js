/**
 * APROFEEC Mobile Optimizations
 * Gère les optimisations mobiles, les gestes tactiles, et les fonctionnalités spécifiques au mobile
 */

class MobileManager {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.isOnline = navigator.onLine;
        this.vibrationEnabled = 'vibrate' in navigator;
        
        this.init();
    }
    
    // Détection mobile
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    // Initialisation
    init() {
        if (this.isMobile) {
            this.setupMobileFeatures();
            this.setupTouchGestures();
            this.setupNetworkDetection();
            this.setupPerformanceOptimizations();
            this.setupViewportHeightFix();
            this.setupKeyboardHandling();
        }
        
        // Features communes (mobile et desktop)
        this.setupCommonFeatures();
    }
    
    // Configurer les fonctionnalités mobiles
    setupMobileFeatures() {
        console.log('📱 Mode mobile activé');
        
        // Ajouter une classe mobile au body
        document.body.classList.add('mobile-device');
        
        // Optimiser les entrées pour mobile
        this.optimizeInputs();
        
        // Prévenir le zoom sur les champs de saisie
        this.preventInputZoom();
        
        // Améliorer le scrolling sur iOS
        this.enhanceScrolling();
        
        // Gérer la barre d'adresse sur mobile
        this.handleAddressBar();
    }
    
    // Configurer les gestes tactiles
    setupTouchGestures() {
        // Swipe pour la navigation
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - this.touchStartX;
            const diffY = touchEndY - this.touchStartY;
            
            // Détection du swipe horizontal
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
                if (diffX > 0) {
                    this.handleSwipe('right');
                } else {
                    this.handleSwipe('left');
                }
            }
            
            // Détection du swipe vertical
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.swipeThreshold) {
                if (diffY > 0) {
                    this.handleSwipe('down');
                } else {
                    this.handleSwipe('up');
                }
            }
        }, { passive: true });
        
        // Tap rapide (double tap)
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap détecté
                this.handleDoubleTap(e);
            }
            
            lastTap = currentTime;
        }, { passive: true });
        
        // Long press
        let pressTimer;
        document.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.handleLongPress(e);
            }, 500);
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
    }
    
    // Gérer les swipes
    handleSwipe(direction) {
        // Vibration sur swipe
        if (this.vibrationEnabled) {
            navigator.vibrate(10);
        }
        
        // Actions selon la direction
        switch(direction) {
            case 'left':
                // Naviguer vers la droite (suivant)
                this.navigateNext();
                break;
            case 'right':
                // Naviguer vers la gauche (précédent)
                this.navigateBack();
                break;
            case 'up':
                // Remonter en haut de page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'down':
                // Aller en bas de page
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                break;
        }
    }
    
    // Gérer le double tap
    handleDoubleTap(e) {
        const target = e.target;
        
        // Si c'est une image, zoomer/dézoomer
        if (target.tagName === 'IMG') {
            if (target.classList.contains('zoomed')) {
                target.classList.remove('zoomed');
                target.style.transform = 'scale(1)';
            } else {
                target.classList.add('zoomed');
                target.style.transform = 'scale(1.5)';
            }
        }
    }
    
    // Gérer le long press
    handleLongPress(e) {
        const target = e.target;
        
        // Menu contextuel pour les liens et images
        if (target.tagName === 'A' || target.tagName === 'IMG') {
            this.showContextMenu(target, e);
        }
    }
    
    // Afficher un menu contextuel
    showContextMenu(element, event) {
        // Créer le menu
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.touches[0].clientX}px`;
        menu.style.top = `${event.touches[0].clientY}px`;
        menu.style.zIndex = '9999';
        
        // Options selon l'élément
        if (element.tagName === 'A') {
            menu.innerHTML = `
                <div class="menu-option" data-action="open">Ouvrir</div>
                <div class="menu-option" data-action="copy">Copier le lien</div>
                <div class="menu-option" data-action="share">Partager</div>
            `;
        } else if (element.tagName === 'IMG') {
            menu.innerHTML = `
                <div class="menu-option" data-action="view">Voir l'image</div>
                <div class="menu-option" data-action="save">Enregistrer</div>
                <div class="menu-option" data-action="share">Partager</div>
            `;
        }
        
        document.body.appendChild(menu);
        
        // Gérer les clics sur les options
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleContextAction(action, element);
            document.body.removeChild(menu);
        });
        
        // Fermer le menu en cliquant ailleurs
        setTimeout(() => {
            const closeMenu = () => {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('touchstart', closeMenu);
            };
            document.addEventListener('touchstart', closeMenu);
        }, 100);
    }
    
    // Gérer les actions du menu contextuel
    handleContextAction(action, element) {
        switch(action) {
            case 'open':
                if (element.tagName === 'A') {
                    window.open(element.href, '_blank');
                }
                break;
            case 'copy':
                if (element.tagName === 'A') {
                    navigator.clipboard.writeText(element.href)
                        .then(() => this.showToast('Lien copié'));
                }
                break;
            case 'share':
                this.shareContent(element);
                break;
            case 'view':
                if (element.tagName === 'IMG') {
                    this.viewImage(element);
                }
                break;
            case 'save':
                if (element.tagName === 'IMG') {
                    this.saveImage(element);
                }
                break;
        }
    }
    
    // Naviguer vers la page suivante
    navigateNext() {
        const nextBtn = document.querySelector('[data-next], .btn-next, .next-step');
        if (nextBtn) {
            nextBtn.click();
        }
    }
    
    // Naviguer vers la page précédente
    navigateBack() {
        const backBtn = document.querySelector('[data-back], .btn-back, .prev-step');
        if (backBtn) {
            backBtn.click();
        } else if (history.length > 1) {
            history.back();
        }
    }
    
    // Configurer la détection réseau
    setupNetworkDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('Connexion rétablie', 'success');
            document.body.classList.remove('offline');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('Vous êtes hors ligne', 'warning');
            document.body.classList.add('offline');
            
            // Sauvegarder les données en cache
            this.cacheFormData();
        });
        
        // Afficher l'état initial
        if (!this.isOnline) {
            document.body.classList.add('offline');
            this.showToast('Mode hors ligne activé', 'info');
        }
    }
    
    // Optimiser les performances
    setupPerformanceOptimizations() {
        // Désactiver les animations lors du défilement
        let scrollTimer;
        window.addEventListener('scroll', () => {
            document.body.classList.add('disable-animations');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                document.body.classList.remove('disable-animations');
            }, 100);
        }, { passive: true });
        
        // Optimiser les images
        this.lazyLoadImages();
        
        // Gérer la mémoire
        this.setupMemoryManagement();
    }
    
    // Fixer la hauteur du viewport sur mobile
    setupViewportHeightFix() {
        // Fonction pour mettre à jour la hauteur
        const updateVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        // Mettre à jour au chargement et au redimensionnement
        updateVH();
        window.addEventListener('resize', updateVH);
        window.addEventListener('orientationchange', updateVH);
        
        // Ajouter un style CSS
        const style = document.createElement('style');
        style.textContent = `
            .full-height {
                height: 100vh;
                height: calc(var(--vh, 1vh) * 100);
            }
            
            .min-full-height {
                min-height: 100vh;
                min-height: calc(var(--vh, 1vh) * 100);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Gérer le clavier virtuel
    setupKeyboardHandling() {
        // Ajuster le scroll quand le clavier apparaît
        window.addEventListener('focusin', (e) => {
            if (e.target.matches('input, textarea, select')) {
                setTimeout(() => {
                    e.target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest' 
                    });
                }, 300);
            }
        });
        
        // Fermer le clavier au tap outside
        document.addEventListener('touchstart', (e) => {
            if (!e.target.matches('input, textarea, select')) {
                document.activeElement?.blur();
            }
        });
    }
    
    // Optimiser les inputs pour mobile
    optimizeInputs() {
        // Définir le bon type de clavier
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.setAttribute('inputmode', 'tel');
        });
        
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.setAttribute('inputmode', 'email');
        });
        
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.setAttribute('inputmode', 'numeric');
        });
        
        // Ajouter des attributs pour améliorer l'autocomplétion
        document.querySelectorAll('input[name="email"]').forEach(input => {
            input.setAttribute('autocomplete', 'email');
        });
        
        document.querySelectorAll('input[name="password"]').forEach(input => {
            input.setAttribute('autocomplete', 'current-password');
        });
        
        // Agrandir les zones de tap pour les petits écrans
        document.querySelectorAll('button, a, input[type="submit"]').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                el.style.minHeight = '44px';
                el.style.minWidth = '44px';
                el.style.padding = '12px';
            }
        });
    }
    
    // Empêcher le zoom sur les inputs
    preventInputZoom() {
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (max-width: 768px) {
                input, select, textarea {
                    font-size: 16px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Améliorer le scrolling
    enhanceScrolling() {
        // Ajouter un momentum scrolling sur iOS
        document.body.style['-webkit-overflow-scrolling'] = 'touch';
        
        // Empêcher le pull-to-refresh sur certaines pages
        if (window.location.pathname.includes('/dashboard') || 
            window.location.pathname.includes('/course')) {
            document.body.style.overscrollBehavior = 'contain';
        }
    }
    
    // Gérer la barre d'adresse
    handleAddressBar() {
        // Cacher la barre d'adresse en scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down - cacher la barre d'adresse
                window.scrollTo(0, window.pageYOffset + 1);
            }
            lastScrollTop = scrollTop;
        }, { passive: true });
    }
    
    // Chargement paresseux des images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Gestion de la mémoire
    setupMemoryManagement() {
        // Nettoyer les événements et données inutilisées
        window.addEventListener('beforeunload', () => {
            // Libérer les ressources
            this.cleanup();
        });
        
        // Éviter les fuites de mémoire
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Stocker les références pour pouvoir les supprimer plus tard
            if (!this._eventListeners) {
                this._eventListeners = [];
            }
            this._eventListeners.push({ type, listener, options });
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    // Nettoyage
    cleanup() {
        // Supprimer tous les écouteurs d'événements
        document.querySelectorAll('*').forEach(el => {
            if (el._eventListeners) {
                el._eventListeners.forEach(event => {
                    el.removeEventListener(event.type, event.listener, event.options);
                });
                delete el._eventListeners;
            }
        });
    }
    
    // Mettre en cache les données de formulaire
    cacheFormData() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            localStorage.setItem(`form_cache_${form.id}`, JSON.stringify(data));
        });
        
        this.showToast('Données sauvegardées localement', 'info');
    }
    
    // Restaurer les données mises en cache
    restoreCachedFormData() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const cachedData = localStorage.getItem(`form_cache_${form.id}`);
            if (cachedData) {
                const data = JSON.parse(cachedData);
                Object.keys(data).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.value = data[key];
                    }
                });
            }
        });
    }
    
    // Partager du contenu
    shareContent(element) {
        if (navigator.share) {
            const shareData = {
                title: document.title,
                text: 'Regardez ce contenu sur APROFEEC',
                url: element.href || window.location.href
            };
            
            navigator.share(shareData)
                .then(() => this.showToast('Contenu partagé', 'success'))
                .catch(error => console.log('Erreur de partage:', error));
        } else {
            // Fallback : copier le lien
            navigator.clipboard.writeText(element.href || window.location.href)
                .then(() => this.showToast('Lien copié dans le presse-papier'));
        }
    }
    
    // Voir une image en plein écran
    viewImage(imgElement) {
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.innerHTML = `
            <div class="viewer-overlay"></div>
            <div class="viewer-content">
                <img src="${imgElement.src}" alt="${imgElement.alt}">
                <button class="close-viewer">&times;</button>
            </div>
        `;
        
        document.body.appendChild(viewer);
        
        viewer.querySelector('.close-viewer').addEventListener('click', () => {
            document.body.removeChild(viewer);
        });
        
        viewer.querySelector('.viewer-overlay').addEventListener('click', () => {
            document.body.removeChild(viewer);
        });
    }
    
    // Sauvegarder une image
    saveImage(imgElement) {
        const link = document.createElement('a');
        link.href = imgElement.src;
        link.download = `aprofeec_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Image téléchargée', 'success');
    }
    
    // Afficher un toast
    showToast(message, type = 'info') {
        // Supprimer les toasts existants
        document.querySelectorAll('.mobile-toast').forEach(toast => {
            toast.remove();
        });
        
        const toast = document.createElement('div');
        toast.className = `mobile-toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Configurer les fonctionnalités communes
    setupCommonFeatures() {
        // Back to top button
        this.setupBackToTop();
        
        // Dark mode detection
        this.setupDarkMode();
        
        // Battery saver mode
        this.setupBatterySaver();
        
        // Install prompt for PWA
        this.setupPWAInstall();
    }
    
    // Back to top button
    setupBackToTop() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-blue);
            color: white;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.3s;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(backToTopBtn);
        
        // Show/hide based on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.transform = 'translateY(0)';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.transform = 'translateY(100px)';
            }
        });
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Dark mode detection
    setupDarkMode() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const applyDarkMode = (isDark) => {
            if (isDark) {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
            }
        };
        
        // Apply initial
        applyDarkMode(darkModeMediaQuery.matches);
        
        // Listen for changes
        darkModeMediaQuery.addListener((e) => {
            applyDarkMode(e.matches);
        });
    }
    
    // Battery saver mode
    setupBatterySaver() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBatteryStatus = () => {
                    if (battery.level < 0.2 || battery.charging === false) {
                        document.body.classList.add('battery-saver');
                        this.enableBatterySaverMode();
                    } else {
                        document.body.classList.remove('battery-saver');
                        this.disableBatterySaverMode();
                    }
                };
                
                updateBatteryStatus();
                
                battery.addEventListener('levelchange', updateBatteryStatus);
                battery.addEventListener('chargingchange', updateBatteryStatus);
            });
        }
    }
    
    // Activer le mode économie de batterie
    enableBatterySaverMode() {
        // Réduire les animations
        document.body.classList.add('reduce-motion');
        
        // Désactiver les images de fond
        document.querySelectorAll('*').forEach(el => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg !== 'none' && bg !== 'initial') {
                el.dataset.originalBg = bg;
                el.style.backgroundImage = 'none';
            }
        });
        
        // Réduire la fréquence des mises à jour
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    // Désactiver le mode économie de batterie
    disableBatterySaverMode() {
        document.body.classList.remove('reduce-motion');
        
        // Restaurer les images de fond
        document.querySelectorAll('[data-original-bg]').forEach(el => {
            el.style.backgroundImage = el.dataset.originalBg;
            delete el.dataset.originalBg;
        });
    }
    
    // PWA Install prompt
    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Empêcher l'affichage automatique
            e.preventDefault();
            deferredPrompt = e;
            
            // Afficher un bouton d'installation
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA installé');
            deferredPrompt = null;
            this.hideInstallButton();
        });
    }
    
    // Afficher le bouton d'installation
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'install-pwa-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`Résultat installation: ${outcome}`);
                this.deferredPrompt = null;
                this.hideInstallButton();
            }
        });
        
        document.body.appendChild(installBtn);
        this.installButton = installBtn;
    }
    
    // Cacher le bouton d'installation
    hideInstallButton() {
        if (this.installButton && document.body.contains(this.installButton)) {
            document.body.removeChild(this.installButton);
        }
    }
}

// Initialiser le gestionnaire mobile
document.addEventListener('DOMContentLoaded', () => {
    const mobileManager = new MobileManager();
    window.mobileManager = mobileManager;
    
    // Ajouter des styles supplémentaires
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        /* Styles pour mobile */
        .mobile-device {
            --safe-area-inset-top: env(safe-area-inset-top);
            --safe-area-inset-bottom: env(safe-area-inset-bottom);
            --safe-area-inset-left: env(safe-area-inset-left);
            --safe-area-inset-right: env(safe-area-inset-right);
        }
        
        /* Toast notifications */
        .mobile-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 500;
            z-index: 9999;
            transition: all 0.3s ease;
            max-width: 90%;
            text-align: center;
        }
        
        .mobile-toast.show {
            transform: translateX(-50%) translateY(0);
        }
        
        .toast-success { background: #10b981; }
        .toast-error { background: #ef4444; }
        .toast-warning { background: #f59e0b; }
        .toast-info { background: #3b82f6; }
        
        /* Image viewer */
        .image-viewer {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
        }
        
        .viewer-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
        }
        
        .viewer-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 90%;
            max-height: 90%;
        }
        
        .viewer-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            margin: 0 auto;
        }
        
        .close-viewer {
            position: absolute;
            top: -40px;
            right: 0;
            background: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        /* Context menu */
        .mobile-context-menu {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
            min-width: 150px;
        }
        
        .menu-option {
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .menu-option:last-child {
            border-bottom: none;
        }
        
        .menu-option:hover {
            background: #f5f5f5;
        }
        
        /* Offline mode */
        .offline .online-only {
            display: none !important;
        }
        
        .offline::before {
            content: "Hors ligne";
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 9999;
        }
        
        /* Reduce motion */
        .reduce-motion * {
            animation-duration: 0.001s !important;
            transition-duration: 0.001s !important;
        }
        
        /* Safe area padding */
        .safe-area-top {
            padding-top: var(--safe-area-inset-top);
        }
        
        .safe-area-bottom {
            padding-bottom: var(--safe-area-inset-bottom);
        }
        
        /* Touch feedback */
        button, a {
            -webkit-tap-highlight-color: transparent;
        }
        
        button:active, a:active {
            opacity: 0.7;
            transform: scale(0.98);
        }
        
        /* Swipe indicators */
        .swipe-indicator {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            opacity: 0.5;
            z-index: 100;
        }
        
        .swipe-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #666;
        }
        
        .swipe-dot.active {
            background: var(--primary-blue);
        }
        
        @media (max-width: 768px) {
            /* Hide scrollbar but keep functionality */
            ::-webkit-scrollbar {
                display: none;
            }
            
            /* Better touch targets */
            input, button, select, textarea {
                font-size: 16px;
            }
            
            /* Prevent text size adjustment */
            html {
                -webkit-text-size-adjust: 100%;
            }
        }
    `;
    document.head.appendChild(mobileStyles);
});

// Service Worker pour PWA
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker enregistré avec succès:', registration.scope);
            })
            .catch(error => {
                console.log('Échec enregistrement ServiceWorker:', error);
            });
    });
}

// Fonction pour ajouter un splash screen
function showSplashScreen() {
    if (window.mobileManager && window.mobileManager.isMobile) {
        const splash = document.createElement('div');
        splash.className = 'splash-screen';
        splash.innerHTML = `
            <div class="splash-content">
                <img src="/images/avatars/apu.jpg" alt="APROFEEC">
                <h1>APROFEEC</h1>
                <p>Chargement...</p>
                <div class="spinner"></div>
            </div>
        `;
        
        splash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--primary-blue);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(splash);
        
        // Cacher après le chargement
        window.addEventListener('load', () => {
            setTimeout(() => {
                splash.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(splash)) {
                        document.body.removeChild(splash);
                    }
                }, 300);
            }, 1000);
        });
    }
}

// Afficher le splash screen
showSplashScreen();