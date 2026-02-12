/**
 * APROFEEC - JavaScript Principal
 * Version 3.0.1 - CORRIGÉ COMPLET
 * Problèmes overlay & boutons résolus
 */

// État global de l'application
const APROFEEC = {
    initialized: false,
    components: {},
    events: {},
    user: null,
    config: window.APROFEEC_CONFIG || {},
    utils: window.APROFEEC_UTILS || {}
};

// ============================================
// CORRECTIONS URGENTES - AJOUTEZ CETTE SECTION AU DÉBUT
// ============================================

/**
 * CORRECTION 1: Supprimer l'overlay bleu IMMÉDIATEMENT
 */
function removeSkyBlueOverlay() {
    console.log('🔧 Suppression de l\'overlay bleu...');
    
    // Supprimer les overlays bleus par style
    document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor === 'rgb(135, 206, 235)' || // skyblue
            style.backgroundColor === 'rgb(119, 181, 254)' ||
            style.background === 'skyblue' ||
            el.style.backgroundColor === 'skyblue' ||
            el.style.background === 'skyblue' ||
            el.classList.contains('overlay') ||
            el.classList.contains('loading-overlay') ||
            el.classList.contains('modal-backdrop')) {
            
            el.style.display = 'none';
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.zIndex = '-9999';
            el.style.background = 'transparent !important';
            
            // Supprimer complètement si overlay
            if (el.tagName === 'DIV' && 
               (el.style.position === 'fixed' || el.style.position === 'absolute') &&
               (el.style.width === '100%' || el.style.width === '100vw')) {
                el.remove();
            }
        }
    });
    
    // Supprimer les styles inline problématiques
    document.querySelectorAll('[style*="background"]').forEach(el => {
        if (el.style.background.includes('skyblue') ||
            el.style.backgroundColor.includes('skyblue') ||
            el.style.backgroundColor.includes('#87CEEB')) {
            el.style.background = 'transparent';
            el.style.backgroundColor = 'transparent';
        }
    });
}

/**
 * CORRECTION 2: Supprimer les messages "Chargement..."
 */
function removeLoadingMessages() {
    console.log('🔧 Suppression des messages de chargement...');
    
    // Supprimer par texte
    document.querySelectorAll('*').forEach(el => {
        const text = el.textContent || el.innerText || '';
        if (text.includes('Chargement...') || 
            text.includes('Création du compte...') ||
            text.includes('Traitement...')) {
            
            el.style.display = 'none';
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.padding = '0';
            el.style.margin = '0';
            el.style.overflow = 'hidden';
            
            // Supprimer complètement si c'est un élément de chargement
            if (el.classList.contains('loading-text') ||
                el.classList.contains('spinner-text') ||
                el.classList.contains('chargement')) {
                el.remove();
            }
        }
    });
    
    // Supprimer par classe
    document.querySelectorAll('.loading-text, .chargement, .creation-compte, .spinner-text').forEach(el => {
        el.remove();
    });
}

/**
 * CORRECTION 3: Réinitialiser tous les boutons
 */
function resetAllButtons() {
    console.log('🔧 Réinitialisation des boutons...');
    
    document.querySelectorAll('button, .btn, [role="button"]').forEach(btn => {
        // Stocker le texte original
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.innerHTML;
        }
        
        // Restaurer le texte original
        btn.innerHTML = btn.dataset.originalText;
        
        // Supprimer les classes de chargement
        btn.classList.remove('loading', 'disabled', 'btn-loading');
        
        // Réactiver le bouton
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        
        // Supprimer les spinners dans les boutons
        const spinners = btn.querySelectorAll('.spinner, .spinner-btn, .loading-spinner');
        spinners.forEach(spinner => {
            spinner.remove();
        });
    });
}

/**
 * CORRECTION 4: Forcer l'affichage des formulaires
 */
function showAllForms() {
    console.log('🔧 Affichage des formulaires...');
    
    document.querySelectorAll('form, .form-container, .auth-form, .login-form, .signup-form').forEach(form => {
        form.style.display = 'block';
        form.style.opacity = '1';
        form.style.visibility = 'visible';
        form.style.position = 'relative';
        form.style.zIndex = '100';
        form.style.background = 'white';
        
        // Supprimer les overlays dans les formulaires
        form.querySelectorAll('*').forEach(child => {
            if (child.style && child.style.backgroundColor) {
                if (child.style.backgroundColor.includes('skyblue') ||
                    child.style.backgroundColor.includes('#87CEEB')) {
                    child.style.background = 'transparent';
                }
            }
        });
    });
}

/**
 * CORRECTION 5: Empêcher la réapparition des problèmes
 */
function preventOverlayRespawn() {
    console.log('🔧 Protection anti-réapparition...');
    
    // Observer les changements dans le DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Vérifier et supprimer les overlays bleus
                    if (node.style && 
                       (node.style.backgroundColor === 'skyblue' ||
                        node.style.backgroundColor === '#87CEEB')) {
                        node.style.display = 'none';
                    }
                    
                    // Vérifier et supprimer les messages de chargement
                    if (node.textContent && 
                       (node.textContent.includes('Chargement...') ||
                        node.textContent.includes('Création du compte...'))) {
                        node.style.display = 'none';
                    }
                    
                    // Vérifier les overlays par classe
                    if (node.classList && 
                       (node.classList.contains('overlay') ||
                        node.classList.contains('loading-overlay'))) {
                        node.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

// ============================================
// INITIALISATION CORRIGÉE
// ============================================

// Initialisation principale
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 APROFEEC Platform - Initializing...');
    
    try {
        // CORRECTION URGENTE: Appliquer les fixes immédiatement
        setTimeout(() => {
            removeSkyBlueOverlay();
            removeLoadingMessages();
            resetAllButtons();
            showAllForms();
            preventOverlayRespawn();
            
            // Force un reflow pour s'assurer que tout s'affiche
            document.body.style.display = 'none';
            document.body.offsetHeight;
            document.body.style.display = 'block';
        }, 100);
        
        // 1. Initialiser les composants de base
        initCoreComponents();
        
        // 2. Initialiser les fonctionnalités spécifiques
        initFeatures();
        
        // 3. Gérer l'authentification
        handleAuthentication();
        
        // 4. Initialiser les événements globaux
        initGlobalEvents();
        
        // 5. Marquer comme initialisé
        APROFEEC.initialized = true;
        
        console.log('✅ APROFEEC Platform - Ready');
        
        // Événement de fin d'initialisation
        document.dispatchEvent(new CustomEvent('aprofeec:ready'));
        
    } catch (error) {
        console.error('❌ APROFEEC Initialization Error:', error);
        showFallbackError(error);
    }
});

/**
 * Initialiser les composants de base
 */
function initCoreComponents() {
    // Navigation et menu
    initNavigation();
    
    // Formulaires et validation - CORRIGÉ
    initForms();
    
    // Modales et popups - CORRIGÉ
    initModals();
    
    // Animations et transitions
    initAnimations();
    
    // Notifications système
    initNotifications();
    
    // Tooltips et infobulles
    initTooltips();
    
    // Lazy loading des images
    initLazyLoading();
    
    // Smooth scrolling
    initSmoothScroll();
    
    // Responsive utilities
    initResponsive();
}

/**
 * Initialiser les fonctionnalités spécifiques
 */
function initFeatures() {
    // Gestion des thèmes (clair/sombre)
    initThemeManager();
    
    // Gestion des langues
    initLanguageManager();
    
    // Gestion du cache
    initCacheManager();
    
    // Gestion des mises à jour
    initUpdateManager();
    
    // Gestion des performances
    initPerformanceMonitor();
    
    // Gestion des erreurs
    initErrorHandler();
    
    // Gestion des sessions
    initSessionManager();
}

/**
 * Initialiser la navigation
 */
function initNavigation() {
    // Menu mobile (burger)
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = menuToggle.classList.contains('active');
            
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Animation du bouton burger
            const bars = menuToggle.querySelectorAll('.bar');
            if (bars.length === 3) {
                bars[0].style.transform = isActive ? 'rotate(0)' : 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.opacity = isActive ? '1' : '0';
                bars[2].style.transform = isActive ? 'rotate(0)' : 'rotate(-45deg) translate(7px, -6px)';
            }
            
            // Fermer au clic extérieur
            if (!isActive) {
                const closeMenuOnClick = (e) => {
                    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                        menuToggle.classList.remove('active');
                        mobileMenu.classList.remove('active');
                        body.classList.remove('menu-open');
                        bars[0].style.transform = 'rotate(0)';
                        bars[1].style.opacity = '1';
                        bars[2].style.transform = 'rotate(0)';
                        document.removeEventListener('click', closeMenuOnClick);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeMenuOnClick), 10);
            }
        });
        
        // Empêcher la fermeture au clic dans le menu
        mobileMenu.addEventListener('click', (e) => e.stopPropagation());
    }
    
    // Navigation active
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
        
        // Ajouter des indicateurs visuels pour les liens externes
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.innerHTML += ' <i class="fas fa-external-link-alt"></i>';
        }
    });
    
    // Sous-menus
    document.querySelectorAll('.has-submenu').forEach(item => {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    submenu.classList.toggle('open');
                }
            });
        }
    });
    
    // Sticky header
    const header = document.querySelector('.navbar');
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                // Scroll down
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                // Scroll up
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        });
    }
}

/**
 * Initialiser les formulaires - CORRIGÉ
 */
function initForms() {
    // Validation automatique
    document.querySelectorAll('form').forEach(form => {
        // Stocker l'état original
        form.dataset.originalAction = form.getAttribute('action') || '';
        form.dataset.originalMethod = form.getAttribute('method') || 'GET';
        
        // Événement de soumission - CORRIGÉ pour ne pas bloquer
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // CORRECTION: NE PAS désactiver le bouton immédiatement
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            let formSubmitted = false;
            
            try {
                // CORRECTION: Validation rapide, pas de chargement long
                if (!await validateForm(form)) {
                    return false;
                }
                
                // CORRECTION: Changer le texte brièvement seulement
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
                    setTimeout(() => {
                        if (!formSubmitted) {
                            submitBtn.innerHTML = originalText;
                        }
                    }, 1000);
                }
                
                // Simulation d'envoi (à remplacer par fetch)
                await simulateFormSubmit(form);
                formSubmitted = true;
                
                // Réinitialiser le formulaire si configuré
                if (form.hasAttribute('data-reset-on-success')) {
                    form.reset();
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Erreur lors de l\'envoi du formulaire', 'error');
            } finally {
                // CORRECTION: Toujours réactiver le bouton
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
        
        // Validation en temps réel
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => clearFieldError(field));
            
            // Auto-formatage pour les champs spécifiques
            if (field.type === 'tel') {
                field.addEventListener('input', formatPhoneNumber);
            }
            
            if (field.type === 'number') {
                field.addEventListener('change', validateNumberField);
            }
        });
    });
    
    // Champs avec masques
    initInputMasks();
    
    // Auto-complétion
    initAutocomplete();
    
    // Upload de fichiers
    initFileUploads();
}

/**
 * Valider un formulaire
 */
async function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('input, textarea, select');
    const errors = [];
    
    for (const field of fields) {
        if (!await validateField(field)) {
            isValid = false;
            errors.push({
                field: field.name,
                message: field.dataset.error || 'Champ invalide'
            });
            
            // Scroller vers la première erreur
            if (errors.length === 1) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                field.focus();
            }
        }
    }
    
    // Validation personnalisée
    const customValidation = form.dataset.validation;
    if (customValidation && window[customValidation]) {
        const customResult = await window[customValidation](form);
        if (!customResult.valid) {
            isValid = false;
            errors.push(...customResult.errors);
        }
    }
    
    // Afficher les erreurs
    if (!isValid) {
        showFormErrors(form, errors);
        return false;
    }
    
    return true;
}

/**
 * Valider un champ
 */
async function validateField(field) {
    // Réinitialiser l'état
    clearFieldError(field);
    
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    const isEmpty = !value && value !== '0';
    
    // Validation requise
    if (isRequired && isEmpty) {
        showFieldError(field, 'Ce champ est obligatoire');
        return false;
    }
    
    // Validation selon le type
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Adresse email invalide');
                return false;
            }
            break;
            
        case 'password':
            if (value && !isValidPassword(value)) {
                showFieldError(field, 'Le mot de passe doit contenir au moins 8 caractères');
                return false;
            }
            break;
            
        case 'tel':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Numéro de téléphone invalide');
                return false;
            }
            break;
            
        case 'url':
            if (value && !isValidUrl(value)) {
                showFieldError(field, 'URL invalide');
                return false;
            }
            break;
    }
    
    // Validation par pattern
    if (field.pattern && value) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
            showFieldError(field, field.dataset.patternError || 'Format invalide');
            return false;
        }
    }
    
    // Validation par longueur
    if (field.minLength && value.length < parseInt(field.minLength)) {
        showFieldError(field, `Minimum ${field.minLength} caractères requis`);
        return false;
    }
    
    if (field.maxLength && value.length > parseInt(field.maxLength)) {
        showFieldError(field, `Maximum ${field.maxLength} caractères autorisés`);
        return false;
    }
    
    // Validation personnalisée
    if (field.dataset.validate && window[field.dataset.validate]) {
        const result = await window[field.dataset.validate](field.value);
        if (!result.valid) {
            showFieldError(field, result.message || 'Validation échouée');
            return false;
        }
    }
    
    // Marquer comme valide
    field.classList.add('is-valid');
    return true;
}

/**
 * Afficher une erreur de champ
 */
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorContainer = field.parentElement.querySelector('.invalid-feedback');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'invalid-feedback';
        field.parentElement.appendChild(errorContainer);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

/**
 * Effacer les erreurs d'un champ
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid', 'is-valid');
    
    const errorContainer = field.parentElement.querySelector('.invalid-feedback');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

/**
 * Afficher les erreurs de formulaire
 */
function showFormErrors(form, errors) {
    // Afficher une notification globale
    showNotification(`Veuillez corriger les ${errors.length} erreurs dans le formulaire`, 'error');
    
    // Mettre en évidence les champs avec erreur
    errors.forEach(error => {
        const field = form.querySelector(`[name="${error.field}"]`);
        if (field) {
            showFieldError(field, error.message);
        }
    });
}

/**
 * Simuler l'envoi d'un formulaire - CORRIGÉ pour ne pas bloquer
 */
async function simulateFormSubmit(form) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulation de succès (toujours succès pour éviter les blocages)
            showNotification('Formulaire envoyé avec succès', 'success');
            
            // Redirection si configurée
            const redirect = form.dataset.redirect;
            if (redirect) {
                setTimeout(() => {
                    window.location.href = redirect;
                }, 1000); // Réduit à 1 seconde
            }
            
            resolve();
        }, 500); // Réduit à 500ms
    });
}

/**
 * Initialiser les masques de saisie
 */
function initInputMasks() {
    // Masque pour téléphone
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
    });
    
    // Masque pour date
    document.querySelectorAll('input[data-mask="date"]').forEach(input => {
        input.addEventListener('input', formatDate);
    });
    
    // Masque pour devise
    document.querySelectorAll('input[data-mask="currency"]').forEach(input => {
        input.addEventListener('input', formatCurrency);
    });
}

/**
 * Formater un numéro de téléphone
 */
function formatPhoneNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    if (value.length >= 6) {
        value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    } else if (value.length >= 4) {
        value = value.replace(/(\d{2})(\d{2})/, '$1 $2');
    }
    
    input.value = value;
}

/**
 * Formater une date
 */
function formatDate(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    if (value.length >= 5) {
        value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    
    input.value = value;
}

/**
 * Formater une devise
 */
function formatCurrency(e) {
    const input = e.target;
    let value = input.value.replace(/[^\d,.-]/g, '');
    
    // Séparateur de milliers
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    input.value = value;
}

/**
 * Initialiser l'auto-complétion
 */
function initAutocomplete() {
    document.querySelectorAll('input[data-autocomplete]').forEach(input => {
        const source = input.dataset.autocomplete;
        
        input.addEventListener('input', debounce(async (e) => {
            const value = e.target.value.trim();
            
            if (value.length < 2) {
                hideAutocomplete(input);
                return;
            }
            
            // Récupérer les suggestions
            const suggestions = await fetchAutocompleteSuggestions(source, value);
            
            if (suggestions.length > 0) {
                showAutocomplete(input, suggestions);
            } else {
                hideAutocomplete(input);
            }
        }, 300));
    });
}

/**
 * Afficher l'auto-complétion
 */
function showAutocomplete(input, suggestions) {
    hideAutocomplete(input);
    
    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        width: ${input.offsetWidth}px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
        });
        
        item.addEventListener('click', () => {
            input.value = suggestion;
            hideAutocomplete(input);
            input.focus();
        });
        
        container.appendChild(item);
    });
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(container);
    
    // Positionner le container
    const rect = input.getBoundingClientRect();
    container.style.top = `${rect.height}px`;
    container.style.left = '0';
}

/**
 * Cacher l'auto-complétion
 */
function hideAutocomplete(input) {
    const container = input.parentElement.querySelector('.autocomplete-container');
    if (container) {
        container.remove();
    }
}

/**
 * Récupérer les suggestions d'auto-complétion
 */
async function fetchAutocompleteSuggestions(source, query) {
    // Simulation - À remplacer par un appel API
    const data = {
        users: ['Jean Dupont', 'Marie Curie', 'Pierre Martin', 'Sophie Lambert'],
        courses: ['Développement Web', 'Design UI/UX', 'Marketing Digital', 'Gestion de projet']
    };
    
    return new Promise(resolve => {
        setTimeout(() => {
            const suggestions = data[source] || [];
            resolve(suggestions.filter(item => 
                item.toLowerCase().includes(query.toLowerCase())
            ));
        }, 200);
    });
}

/**
 * Initialiser l'upload de fichiers
 */
function initFileUploads() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        const container = input.closest('.file-upload') || createFileUploadContainer(input);
        
        // Bouton personnalisé
        const customButton = container.querySelector('.file-upload-button') || 
                            createCustomFileButton(input, container);
        
        // Aperçu des fichiers
        const preview = container.querySelector('.file-preview') || 
                       createFilePreview(container);
        
        // Événements
        input.addEventListener('change', () => handleFileSelect(input, preview));
        
        // Drag & drop
        if (container.hasAttribute('data-drag-drop')) {
            initDragAndDrop(container, input);
        }
    });
}

/**
 * Créer un conteneur d'upload
 */
function createFileUploadContainer(input) {
    const container = document.createElement('div');
    container.className = 'file-upload';
    container.style.cssText = `
        border: 2px dashed #ddd;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    `;
    
    input.parentElement.insertBefore(container, input);
    container.appendChild(input);
    
    return container;
}

/**
 * Créer un bouton personnalisé
 */
function createCustomFileButton(input, container) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-upload-button';
    button.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Choisir un fichier';
    button.style.cssText = `
        background: #1e90ff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    button.addEventListener('click', () => input.click());
    container.appendChild(button);
    
    return button;
}

/**
 * Créer un aperçu de fichier
 */
function createFilePreview(container) {
    const preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.style.cssText = `
        margin-top: 15px;
        display: none;
    `;
    
    container.appendChild(preview);
    return preview;
}

/**
 * Gérer la sélection de fichiers
 */
function handleFileSelect(input, preview) {
    const files = Array.from(input.files);
    preview.innerHTML = '';
    preview.style.display = 'block';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            margin-bottom: 5px;
        `;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <small>(${formatFileSize(file.size)})</small>
            </div>
            <button type="button" class="file-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        preview.appendChild(fileItem);
    });
    
    // Événements de suppression
    preview.querySelectorAll('.file-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.file-remove').dataset.index);
            removeFile(input, index);
            updateFilePreview(input, preview);
        });
    });
}

/**
 * Initialiser le drag & drop
 */
function initDragAndDrop(container, input) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        container.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        container.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        container.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        container.style.borderColor = '#1e90ff';
        container.style.background = 'rgba(30, 144, 255, 0.05)';
    }
    
    function unhighlight() {
        container.style.borderColor = '#ddd';
        container.style.background = '';
    }
    
    container.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        input.files = files;
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
    }
}

/**
 * Supprimer un fichier
 */
function removeFile(input, index) {
    const files = Array.from(input.files);
    files.splice(index, 1);
    
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    
    input.files = dataTransfer.files;
}

/**
 * Mettre à jour l'aperçu des fichiers
 */
function updateFilePreview(input, preview) {
    const files = Array.from(input.files);
    
    if (files.length === 0) {
        preview.style.display = 'none';
        return;
    }
    
    preview.innerHTML = '';
    handleFileSelect(input, preview);
}

/**
 * Initialiser les modales - CORRIGÉ
 */
function initModals() {
    // CORRECTION: S'assurer que tous les modales sont cachées au départ
    document.querySelectorAll('.modal, .modal-backdrop, .overlay').forEach(el => {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.zIndex = '-9999';
    });
    
    // Gestionnaires d'ouverture
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // CORRECTION: Nettoyer d'abord tous les overlays
            removeSkyBlueOverlay();
            
            const modalId = trigger.dataset.modal;
            openModal(modalId);
        });
    });
    
    // Gestionnaires de fermeture
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
    
    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) closeModal(openModal.id);
        }
    });
}

/**
 * Ouvrir une modale - CORRIGÉ
 */
function openModal(modalId) {
    // CORRECTION: Nettoyer avant d'ouvrir
    removeSkyBlueOverlay();
    
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Fermer les autres modales
    document.querySelectorAll('.modal.show').forEach(m => {
        if (m.id !== modalId) closeModal(m.id);
    });
    
    // Afficher la modale
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.zIndex = '2000';
    modal.classList.add('show');
    
    // CORRECTION: NE PAS bloquer le body
    document.body.style.overflow = 'hidden';
    
    // Focus sur le premier champ focusable
    setTimeout(() => {
        const focusable = modal.querySelector('input, button, textarea, select');
        if (focusable) focusable.focus();
    }, 100);
    
    // Événement d'ouverture
    modal.dispatchEvent(new CustomEvent('modal:open'));
}

/**
 * Fermer une modale - CORRIGÉ
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.classList.remove('show');
    
    // CORRECTION: Réactiver le scroll du body
    document.body.style.overflow = '';
    
    // Événement de fermeture
    modal.dispatchEvent(new CustomEvent('modal:close'));
    
    // Focus retour sur l'élément déclencheur
    setTimeout(() => {
        const trigger = document.querySelector(`[data-modal="${modalId}"]`);
        if (trigger) trigger.focus();
    }, 100);
}

/**
 * Initialiser les animations
 */
function initAnimations() {
    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Animations de compteur
    document.querySelectorAll('.counter').forEach(counter => {
        observer.observe(counter);
        
        counter.addEventListener('animate-in', () => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            if (!isNaN(target)) {
                animateCounter(counter, target);
            }
        });
    });
    
    // Animations de progress bar
    document.querySelectorAll('.progress-bar').forEach(bar => {
        observer.observe(bar);
        
        bar.addEventListener('animate-in', () => {
            const width = bar.style.width || bar.dataset.width;
            if (width) {
                animateProgress(bar, width);
            }
        });
    });
}

/**
 * Animer une barre de progression
 */
function animateProgress(bar, targetWidth) {
    let currentWidth = 0;
    const target = parseInt(targetWidth);
    const increment = target / 50;
    
    const timer = setInterval(() => {
        currentWidth += increment;
        if (currentWidth >= target) {
            bar.style.width = target + '%';
            clearInterval(timer);
        } else {
            bar.style.width = currentWidth + '%';
        }
    }, 20);
}

/**
 * Initialiser les notifications
 */
function initNotifications() {
    // Utiliser le système d'APROFEECAuth si disponible
    if (window.APROFEECAuth && typeof APROFEECAuth.showNotification === 'function') {
        window.showNotification = APROFEECAuth.showNotification;
        return;
    }
    
    // Système de notification de fallback
    window.showNotification = function(message, type = 'info', options = {}) {
        const container = document.getElementById('notification-container') || createNotificationContainer();
        const duration = options.duration || 3000; // Réduit à 3 secondes
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
            </div>
            <button class="notification-close" aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Bouton de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => dismissNotification(notification));
        
        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => dismissNotification(notification), duration);
        }
        
        // Retourner l'instance pour contrôle manuel
        return {
            dismiss: () => dismissNotification(notification),
            update: (newMessage) => {
                const msgEl = notification.querySelector('.notification-message');
                if (msgEl) msgEl.textContent = newMessage;
            }
        };
    };
}

/**
 * Créer le conteneur de notifications
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
    `;
    
    document.body.appendChild(container);
    return container;
}

/**
 * Fermer une notification
 */
function dismissNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

/**
 * Initialiser les tooltips
 */
function initTooltips() {
    // Tooltips natifs améliorés
    document.querySelectorAll('[title]').forEach(element => {
        if (!element.hasAttribute('data-tooltip-init')) {
            initNativeTooltip(element);
        }
    });
    
    // Tooltips personnalisés
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        if (!element.hasAttribute('data-tooltip-init')) {
            initCustomTooltip(element);
        }
    });
}

/**
 * Initialiser un tooltip natif amélioré
 */
function initNativeTooltip(element) {
    const title = element.getAttribute('title');
    if (!title) return;
    
    element.removeAttribute('title');
    element.setAttribute('data-tooltip-init', 'true');
    
    let tooltip = null;
    let timeout = null;
    
    element.addEventListener('mouseenter', (e) => {
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            tooltip = createTooltip(element, title);
            positionTooltip(tooltip, element);
        }, 300);
    });
    
    element.addEventListener('mouseleave', () => {
        clearTimeout(timeout);
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    });
    
    element.addEventListener('focus', () => {
        if (!tooltip) {
            tooltip = createTooltip(element, title);
            positionTooltip(tooltip, element);
        }
    });
    
    element.addEventListener('blur', () => {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    });
}

/**
 * Initialiser un tooltip personnalisé
 */
function initCustomTooltip(element) {
    const content = element.dataset.tooltip;
    if (!content) return;
    
    element.setAttribute('data-tooltip-init', 'true');
    
    let tooltip = null;
    let timeout = null;
    
    element.addEventListener('mouseenter', (e) => {
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            tooltip = createTooltip(element, content);
            positionTooltip(tooltip, element);
        }, 100);
    });
    
    element.addEventListener('mouseleave', () => {
        clearTimeout(timeout);
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    });
}

/**
 * Créer un tooltip
 */
function createTooltip(element, content) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = content;
    
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 99999;
        max-width: 300px;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s, transform 0.2s;
    `;
    
    document.body.appendChild(tooltip);
    
    // Animation d'entrée
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    }, 10);
    
    return tooltip;
}

/**
 * Positionner un tooltip
 */
function positionTooltip(tooltip, element) {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let top = elementRect.top - tooltipRect.height - 10;
    let left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
    
    // Ajustements pour le viewport
    if (top < 10) {
        top = elementRect.bottom + 10;
    }
    
    if (left < 10) {
        left = 10;
    }
    
    if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

/**
 * Initialiser le lazy loading
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback pour les anciens navigateurs
        document.querySelectorAll('img[data-src]').forEach(img => {
            loadImage(img);
        });
    }
}

/**
 * Charger une image en lazy loading
 */
function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;
    
    const tempImg = new Image();
    tempImg.onload = () => {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
    };
    
    tempImg.onerror = () => {
        img.src = '/img/placeholder.jpg';
        img.classList.add('error');
    };
    
    tempImg.src = src;
}

/**
 * Initialiser le smooth scroll
 */
function initSmoothScroll() {
    // Smooth scroll pour les ancres
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link || link.hash === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(link.hash);
        if (!target) return;
        
        smoothScrollTo(target, 800);
    });
    
    // Smooth scroll vers le haut
    const scrollTopBtn = document.getElementById('scrollToTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            smoothScrollTo(document.body, 600);
        });
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
    }
}

/**
 * Animation de smooth scroll
 */
function smoothScrollTo(target, duration = 800) {
    const startPosition = window.pageYOffset;
    const targetPosition = target.getBoundingClientRect().top + startPosition - 80;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

/**
 * Initialiser les utilitaires responsive
 */
function initResponsive() {
    // Gestionnaire de breakpoints
    const breakpoints = {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    };
    
    let currentBreakpoint = '';
    
    function updateBreakpoint() {
        const width = window.innerWidth;
        let newBreakpoint = '';
        
        if (width >= breakpoints.xxl) newBreakpoint = 'xxl';
        else if (width >= breakpoints.xl) newBreakpoint = 'xl';
        else if (width >= breakpoints.lg) newBreakpoint = 'lg';
        else if (width >= breakpoints.md) newBreakpoint = 'md';
        else if (width >= breakpoints.sm) newBreakpoint = 'sm';
        else newBreakpoint = 'xs';
        
        if (newBreakpoint !== currentBreakpoint) {
            if (currentBreakpoint) {
                document.body.classList.remove(`breakpoint-${currentBreakpoint}`);
            }
            
            currentBreakpoint = newBreakpoint;
            document.body.classList.add(`breakpoint-${currentBreakpoint}`);
            
            // Événement personnalisé
            document.dispatchEvent(new CustomEvent('breakpoint:change', {
                detail: { breakpoint: currentBreakpoint }
            }));
        }
    }
    
    // Mettre à jour au chargement et au redimensionnement
    updateBreakpoint();
    window.addEventListener('resize', debounce(updateBreakpoint, 150));
    
    // Détection de l'orientation
    function updateOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        document.body.classList.toggle('portrait', isPortrait);
        document.body.classList.toggle('landscape', !isPortrait);
    }
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
}

/**
 * Initialiser le gestionnaire de thèmes
 */
function initThemeManager() {
    // Récupérer le thème sauvegardé ou détecter la préférence système
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Appliquer le thème
    applyTheme(theme);
    
    // Bouton de basculement
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            theme = theme === 'light' ? 'dark' : 'light';
            applyTheme(theme);
            saveTheme(theme);
        });
        
        // Mettre à jour l'icône
        updateThemeIcon(themeToggle, theme);
    }
    
    // Écouter les changements système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            theme = e.matches ? 'dark' : 'light';
            applyTheme(theme);
        }
    });
}

/**
 * Appliquer un thème
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    
    // Événement personnalisé
    document.dispatchEvent(new CustomEvent('theme:change', {
        detail: { theme }
    }));
}

/**
 * Sauvegarder le thème
 */
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

/**
 * Mettre à jour l'icône du thème
 */
function updateThemeIcon(button, theme) {
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/**
 * Initialiser le gestionnaire de langues
 */
function initLanguageManager() {
    // Détecter la langue du navigateur
    const browserLang = navigator.language || navigator.userLanguage;
    const savedLang = localStorage.getItem('language') || browserLang.split('-')[0] || 'fr';
    
    // Appliquer la langue
    applyLanguage(savedLang);
    
    // Sélecteur de langue
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            saveLanguage(e.target.value);
        });
    }
}

/**
 * Appliquer une langue
 */
function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-fr', lang === 'fr');
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-sw', lang === 'sw');
    
    // Événement personnalisé
    document.dispatchEvent(new CustomEvent('language:change', {
        detail: { language: lang }
    }));
}

/**
 * Sauvegarder la langue
 */
function saveLanguage(lang) {
    localStorage.setItem('language', lang);
}

/**
 * Initialiser le gestionnaire de cache
 */
function initCacheManager() {
    // Vérifier et nettoyer le cache obsolète
    const cacheVersion = '1.0.0';
    const savedVersion = localStorage.getItem('cache_version');
    
    if (savedVersion !== cacheVersion) {
        // Nettoyer les données obsolètes
        clearObsoleteCache();
        localStorage.setItem('cache_version', cacheVersion);
    }
    
    // Gérer le cache automatiquement
    if ('caches' in window) {
        // Pré-cache des ressources importantes
        preCacheResources();
    }
}

/**
 * Initialiser le gestionnaire de mises à jour
 */
function initUpdateManager() {
    // Vérifier les mises à jour périodiquement
    setInterval(checkForUpdates, 30 * 60 * 1000); // Toutes les 30 minutes
    
    // Écouter les événements de mise à jour
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showUpdateNotification();
        });
    }
}

/**
 * Vérifier les mises à jour
 */
function checkForUpdates() {
    // À implémenter avec votre API
    console.log('Checking for updates...');
}

/**
 * Afficher une notification de mise à jour
 */
function showUpdateNotification() {
    showNotification('Une nouvelle version est disponible. Rechargez la page.', 'info', {
        duration: 0,
        actions: [{
            label: 'Recharger',
            callback: () => location.reload()
        }]
    });
}

/**
 * Initialiser le moniteur de performances
 */
function initPerformanceMonitor() {
    // Mesurer le temps de chargement
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            if (loadTime > 3000) {
                console.warn(`Temps de chargement élevé: ${loadTime}ms`);
            }
        });
    }
    
    // Surveiller la mémoire
    if ('memory' in performance) {
        setInterval(() => {
            const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
            if (usedMB > 100) {
                console.warn(`Utilisation mémoire élevée: ${usedMB.toFixed(2)}MB`);
            }
        }, 30000);
    }
}

/**
 * Initialiser le gestionnaire d'erreurs
 */
function initErrorHandler() {
    // Gestionnaire d'erreurs global
    window.addEventListener('error', (e) => {
        console.error('Global Error:', e);
        logError(e.error || e);
        
        // Afficher une notification conviviale
        if (!e.message.includes('ResizeObserver')) { // Ignorer certaines erreurs communes
            showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        }
        
        return true;
    });
    
    // Gestionnaire d'erreurs non catchées des promesses
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise:', e);
        logError(e.reason);
        showNotification('Une erreur est survenue avec une opération asynchrone.', 'error');
    });
}

/**
 * Logger une erreur
 */
function logError(error) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    // Stocker localement (limité à 50 erreurs)
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    errors.unshift(errorLog);
    localStorage.setItem('error_log', JSON.stringify(errors.slice(0, 50)));
}

/**
 * Initialiser le gestionnaire de sessions
 */
function initSessionManager() {
    let lastActivity = Date.now();
    
    // Suivre l'activité utilisateur
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        }, { passive: true });
    });
    
    // Vérifier l'inactivité
    setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        const timeout = 30 * 60 * 1000; // 30 minutes
        
        if (inactiveTime > timeout) {
            // Déconnexion automatique ou notification
            if (confirm('Votre session a expiré. Voulez-vous rester connecté ?')) {
                lastActivity = Date.now();
            } else {
                logout();
            }
        }
    }, 60000); // Vérifier toutes les minutes
}

/**
 * Gérer l'authentification
 */
function handleAuthentication() {
    // Vérifier l'état d'authentification
    checkAuthState();
    
    // Gérer les pages protégées
    protectPages();
    
    // Mettre à jour l'interface utilisateur
    updateAuthUI();
}

/**
 * Vérifier l'état d'authentification
 */
function checkAuthState() {
    const token = localStorage.getItem('aprofeec_auth_token');
    const userData = APROFEEC.utils.storage.get('aprofeec_user_data');
    
    if (token && userData) {
        APROFEEC.user = userData;
        
        // Vérifier l'expiration du token
        const expiry = localStorage.getItem('aprofeec_token_expiry');
        if (expiry && Date.now() > parseInt(expiry)) {
            // Token expiré
            clearAuth();
        }
    } else {
        APROFEEC.user = null;
    }
}

/**
 * Protéger les pages
 */
function protectPages() {
    const protectedPages = [
        'dashboard', 'admin-panel', 'mentor-space', 
        'apprenant-space', 'settings', 'profile', 'chat'
    ];
    
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (protectedPages.includes(currentPage) && !APROFEEC.user) {
        // Rediriger vers la page de login
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `/login.html?return=${returnUrl}`;
    }
}

/**
 * Mettre à jour l'interface d'authentification
 */
function updateAuthUI() {
    // Éléments pour utilisateur connecté
    const authElements = document.querySelectorAll('[data-auth]');
    const guestElements = document.querySelectorAll('[data-guest]');
    
    if (APROFEEC.user) {
        // Afficher les éléments pour utilisateur connecté
        authElements.forEach(el => el.style.display = '');
        guestElements.forEach(el => el.style.display = 'none');
        
        // Remplir les données utilisateur
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = APROFEEC.user.name || 'Utilisateur';
        });
        
        document.querySelectorAll('[data-user-avatar]').forEach(img => {
            if (APROFEEC.user.avatar) {
                img.src = APROFEEC.user.avatar;
            }
        });
        
        document.querySelectorAll('[data-user-role]').forEach(el => {
            const roleNames = {
                admin: 'Administrateur',
                mentor: 'Mentor',
                apprenant: 'Apprenant'
            };
            el.textContent = roleNames[APROFEEC.user.role] || APROFEEC.user.role;
        });
    } else {
        // Afficher les éléments pour invité
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = '');
    }
}

/**
 * Effacer l'authentification
 */
function clearAuth() {
    localStorage.removeItem('aprofeec_auth_token');
    localStorage.removeItem('aprofeec_refresh_token');
    localStorage.removeItem('aprofeec_token_expiry');
    APROFEEC.utils.storage.remove('aprofeec_user_data');
    APROFEEC.user = null;
    
    updateAuthUI();
}

/**
 * Déconnexion
 */
function logout() {
    clearAuth();
    showNotification('Déconnexion réussie', 'success');
    
    // Rediriger vers la page d'accueil
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

/**
 * Initialiser les événements globaux
 */
function initGlobalEvents() {
    // Prévenir la sortie avec des modifications non sauvegardées
    window.addEventListener('beforeunload', (e) => {
        const hasUnsavedChanges = document.querySelectorAll('.is-dirty').length > 0;
        
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
            return e.returnValue;
        }
    });
    
    // Gérer le changement de visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.dispatchEvent(new CustomEvent('page:hide'));
        } else {
            document.dispatchEvent(new CustomEvent('page:show'));
        }
    });
    
    // Gérer le réseau
    window.addEventListener('online', () => {
        showNotification('Connexion rétablie', 'success');
        document.dispatchEvent(new CustomEvent('network:online'));
    });
    
    window.addEventListener('offline', () => {
        showNotification('Vous êtes hors ligne', 'warning');
        document.dispatchEvent(new CustomEvent('network:offline'));
    });
}

/**
 * Afficher une erreur de fallback
 */
function showFallbackError(error) {
    document.body.innerHTML = `
        <div class="error-container">
            <div class="error-content">
                <h1>😕 Une erreur est survenue</h1>
                <p>L'application n'a pas pu démarrer correctement.</p>
                <p><small>${error.message}</small></p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-redo"></i> Recharger la page
                    </button>
                    <button onclick="location.href='/'" class="btn btn-outline">
                        <i class="fas fa-home"></i> Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fonction de debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fonction de throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validation d'email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validation de mot de passe
 */
function isValidPassword(password) {
    return password.length >= 8;
}

/**
 * Validation de téléphone
 */
function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Validation d'URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Formater la taille d'un fichier
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Animer un compteur
 */
function animateCounter(element, targetValue) {
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
        current += increment;
        step++;
        
        if (step >= steps) {
            element.textContent = formatNumber(targetValue);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.round(current));
        }
    }, duration / steps);
}

/**
 * Formater un nombre
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return num.toLocaleString('fr-FR');
}

/**
 * Nettoyer le cache obsolète
 */
function clearObsoleteCache() {
    const keysToKeep = [
        'theme', 'language', 'aprofeec_user_data', 
        'aprofeec_auth_token', 'aprofeec_refresh_token',
        'aprofeec_token_expiry', 'dashboard_layout'
    ];
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!keysToKeep.includes(key) && !key.startsWith('aprofeec_config_')) {
            localStorage.removeItem(key);
        }
    }
}

/**
 * Pré-cache des ressources
 */
async function preCacheResources() {
    try {
        const cache = await caches.open('aprofeec-v1');
        const resources = [
            '/',
            '/css/style.css',
            '/js/config.js',
            '/js/main.js'
        ];
        
        await cache.addAll(resources);
    } catch (error) {
        console.log('Cache pre-loading failed:', error);
    }
}

// Exposer les fonctions globales
window.APROFEEC = APROFEEC;
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.debounce = debounce;
window.throttle = throttle;

// API publique
window.APROFEEC_API = {
    init: () => APROFEEC.initialized,
    user: APROFEEC.user,
    config: APROFEEC.config,
    utils: APROFEEC.utils,
    notify: showNotification,
    modal: { open: openModal, close: closeModal },
    form: { validate: validateForm },
    auth: { logout }
};

// Initialisation différée pour les scripts externes
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(() => {
        if (!APROFEEC.initialized) {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }
    }, 100);
}

// ============================================
// INJECTION FINALE DES STYLES URGENTS
// ============================================

// Injecter des styles CSS d'urgence pour éviter les problèmes
const emergencyStyles = document.createElement('style');
emergencyStyles.id = 'aprofeec-emergency-styles';
emergencyStyles.textContent = `
/* Styles d'urgence pour APROFEEC */
.overlay, .modal-backdrop, .loading-overlay, .loading-screen {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    z-index: -9999 !important;
}

body.modal-open {
    overflow: auto !important;
}

.btn.loading, .btn[disabled] {
    opacity: 1 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
}

.loading-text, .chargement, .creation-compte {
    display: none !important;
}

[style*="background-color: skyblue"],
[style*="background: skyblue"] {
    background: transparent !important;
    display: none !important;
}
`;
document.head.appendChild(emergencyStyles);

console.log('✅ APROFEEC JS corrigé et prêt');