/**
 * APROFEEC - Dashboard JavaScript
 * Version 2.0.0 - Complète et optimisée
 */

// État global du dashboard
const Dashboard = {
    initialized: false,
    charts: {},
    data: {},
    refreshInterval: null
};

// Initialisation principale
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!checkAuth()) {
        redirectToLogin();
        return;
    }

    // Vérifier les permissions
    if (!checkDashboardPermission()) {
        showAccessDenied();
        return;
    }

    // Initialiser le dashboard
    initDashboard();
    loadDashboardData();
    setupDashboardEvents();
    startAutoRefresh();
});

/**
 * Initialisation complète du dashboard
 */
function initDashboard() {
    if (Dashboard.initialized) return;
    
    console.log('🚀 Dashboard APROFEEC initializing...');
    
    try {
        // 1. Mettre à jour les informations utilisateur
        updateUserInfo();
        
        // 2. Initialiser les composants UI
        initUIComponents();
        
        // 3. Initialiser les graphiques (structure)
        initChartContainers();
        
        // 4. Initialiser les tables
        initTables();
        
        // 5. Mettre à jour l'état
        Dashboard.initialized = true;
        
        // 6. Vérifier la connexion
        checkConnection();
        
        console.log('✅ Dashboard APROFEEC initialized');
        
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        showNotification('Erreur d\'initialisation du dashboard', 'error');
    }
}

/**
 * Initialiser les composants UI
 */
function initUIComponents() {
    // Tooltips Bootstrap (si disponible)
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Datepickers
    initDatePickers();
    
    // Filtres et recherche
    initFilters();
    
    // Boutons d'action
    initActionButtons();
    
    // Menus contextuels
    initContextMenus();
    
    // Drag & drop (pour les widgets si nécessaire)
    initDragAndDrop();
}

/**
 * Initialiser les sélecteurs de date
 */
function initDatePickers() {
    const dateInputs = document.querySelectorAll('.date-picker');
    
    dateInputs.forEach(input => {
        // Définir la date du jour par défaut
        if (!input.value) {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
        
        // Ajouter un écouteur pour le changement
        input.addEventListener('change', function() {
            const period = this.value;
            filterDashboardByDate(period);
        });
    });
    
    // Initialiser les plages de dates
    const dateRangeInputs = document.querySelectorAll('.date-range');
    dateRangeInputs.forEach(input => {
        input.addEventListener('change', updateDateRangeFilter);
    });
}

/**
 * Initialiser les filtres
 */
function initFilters() {
    // Filtres par catégorie
    document.querySelectorAll('.filter-select').forEach(filter => {
        filter.addEventListener('change', function() {
            const filterType = this.dataset.filter;
            const value = this.value;
            applyFilter(filterType, value);
        });
    });
    
    // Recherche en temps réel
    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            performSearch(e.target.value);
        }, 300));
    }
    
    // Filtres à cocher
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateCheckboxFilters);
    });
}

/**
 * Initialiser les boutons d'action
 */
function initActionButtons() {
    // Bouton de rafraîchissement
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Bouton d'export
    const exportBtn = document.getElementById('exportDashboard');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Bouton d'impression
    const printBtn = document.getElementById('printDashboard');
    if (printBtn) {
        printBtn.addEventListener('click', handlePrint);
    }
    
    // Bouton de partage
    const shareBtn = document.getElementById('shareDashboard');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }
    
    // Boutons de vue (grid/list)
    document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleView(this.dataset.view);
        });
    });
}

/**
 * Initialiser les menus contextuels
 */
function initContextMenus() {
    // Menus contextuels pour les cartes
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showCardContextMenu(e, this);
        });
    });
    
    // Menus contextuels pour les graphiques
    document.querySelectorAll('.chart-container').forEach(chart => {
        chart.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showChartContextMenu(e, this);
        });
    });
}

/**
 * Initialiser le drag & drop
 */
function initDragAndDrop() {
    if (!document.querySelector('.dashboard-widgets')) return;
    
    // Initialiser Sortable.js si disponible
    if (typeof Sortable !== 'undefined') {
        const widgetsContainer = document.querySelector('.dashboard-widgets');
        if (widgetsContainer) {
            Sortable.create(widgetsContainer, {
                animation: 150,
                ghostClass: 'widget-ghost',
                chosenClass: 'widget-chosen',
                dragClass: 'widget-drag',
                onEnd: function() {
                    saveDashboardLayout();
                }
            });
        }
    }
}

/**
 * Initialiser les conteneurs de graphiques
 */
function initChartContainers() {
    // S'assurer que les conteneurs ont la bonne taille
    document.querySelectorAll('.chart-container').forEach(container => {
        container.style.height = '300px';
        container.style.position = 'relative';
    });
}

/**
 * Initialiser les tables
 */
function initTables() {
    // Initialiser DataTables si disponible
    if (typeof $.fn.DataTable !== 'undefined') {
        $('.datatable').each(function() {
            $(this).DataTable({
                pageLength: 10,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/French.json'
                },
                responsive: true,
                dom: '<"top"f>rt<"bottom"lip><"clear">'
            });
        });
    } else {
        // Fallback: pagination manuelle
        document.querySelectorAll('.data-table').forEach(table => {
            initManualPagination(table);
        });
    }
    
    // Ajouter le tri aux tables simples
    document.querySelectorAll('.sortable-table th').forEach(header => {
        if (header.classList.contains('sortable')) {
            header.addEventListener('click', () => {
                sortTableByColumn(header);
            });
        }
    });
}

/**
 * Charger les données du dashboard
 */
async function loadDashboardData() {
    try {
        showLoading(true);
        
        // Charger les données en parallèle
        const [
            stats,
            activities,
            notifications,
            performance,
            charts
        ] = await Promise.all([
            loadStatsData(),
            loadActivitiesData(),
            loadNotificationsData(),
            loadPerformanceData(),
            loadChartsData()
        ]);
        
        // Mettre à jour l'interface
        updateStatsDisplay(stats);
        updateActivitiesDisplay(activities);
        updateNotificationsDisplay(notifications);
        updatePerformanceDisplay(performance);
        updateChartsDisplay(charts);
        
        // Mettre à jour les données en cache
        Dashboard.data = {
            stats,
            activities,
            notifications,
            performance,
            charts,
            lastUpdated: new Date()
        };
        
        // Sauvegarder dans le stockage local
        APROFEEC_UTILS.storage.set('dashboard_cache', Dashboard.data);
        
        showNotification('Dashboard mis à jour', 'success');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        
        // Essayer de charger depuis le cache
        const cachedData = APROFEEC_UTILS.storage.get('dashboard_cache');
        if (cachedData) {
            console.log('📦 Loading from cache...');
            updateDashboardFromCache(cachedData);
            showNotification('Données chargées depuis le cache', 'warning');
        } else {
            showNotification('Erreur de chargement des données', 'error');
        }
        
    } finally {
        showLoading(false);
    }
}

/**
 * Charger les statistiques
 */
async function loadStatsData() {
    // Simulation - À remplacer par un appel API
    return {
        totalUsers: { value: 245, change: 12, trend: 'up' },
        activeProjects: { value: 18, change: -2, trend: 'down' },
        newMessages: { value: 12, change: 5, trend: 'up' },
        completionRate: { value: 78, change: 3, trend: 'up' },
        revenue: { value: 12500, change: 1500, trend: 'up' },
        satisfaction: { value: 4.8, change: 0.2, trend: 'up' }
    };
}

/**
 * Charger les activités
 */
async function loadActivitiesData() {
    // Simulation - À remplacer par un appel API
    return [
        {
            id: 1,
            user: { name: 'Marie Dubois', avatar: '/img/avatars/user1.jpg' },
            action: 'a terminé le cours "Développement Web"',
            time: 'Il y a 5 minutes',
            type: 'success',
            link: '/courses/123'
        },
        {
            id: 2,
            user: { name: 'Jean Martin', avatar: '/img/avatars/user2.jpg' },
            action: 'a soumis un projet',
            time: 'Il y a 30 minutes',
            type: 'info',
            link: '/projects/456'
        },
        {
            id: 3,
            user: { name: 'Sophie Lambert', avatar: '/img/avatars/user3.jpg' },
            action: 'a rejoint la plateforme',
            time: 'Il y a 2 heures',
            type: 'warning',
            link: '/users/789'
        },
        {
            id: 4,
            user: { name: 'Admin System', avatar: '/img/avatars/system.jpg' },
            action: 'a publié une nouvelle annonce',
            time: 'Il y a 5 heures',
            type: 'primary',
            link: '/announcements/1'
        }
    ];
}

/**
 * Charger les notifications
 */
async function loadNotificationsData() {
    // Simulation - À remplacer par un appel API
    return [
        {
            id: 1,
            title: 'Nouveau message',
            message: 'Vous avez reçu un nouveau message de votre mentor',
            time: '10:30',
            read: false,
            icon: 'fas fa-envelope',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Projet approuvé',
            message: 'Votre projet a été approuvé par l\'administrateur',
            time: 'Hier',
            read: true,
            icon: 'fas fa-check-circle',
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Rappel de cours',
            message: 'Votre cours de développement web commence dans 1 heure',
            time: '09:00',
            read: false,
            icon: 'fas fa-bell',
            priority: 'high'
        }
    ];
}

/**
 * Charger les données de performance
 */
async function loadPerformanceData() {
    // Simulation - À remplacer par un appel API
    return {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Utilisateurs actifs',
                data: [65, 78, 90, 120, 150, 180, 200, 195, 210, 230, 245, 260],
                borderColor: '#1e90ff',
                backgroundColor: 'rgba(30, 144, 255, 0.1)',
                fill: true
            },
            {
                label: 'Projets terminés',
                data: [12, 19, 15, 25, 22, 30, 35, 32, 40, 45, 50, 55],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true
            }
        ]
    };
}

/**
 * Charger les données des graphiques
 */
async function loadChartsData() {
    // Données pour différents types de graphiques
    return {
        userDistribution: {
            labels: ['Mentors', 'Apprenants', 'Administrateurs'],
            data: [30, 150, 5]
        },
        projectStatus: {
            labels: ['En attente', 'En cours', 'Terminé', 'Bloqué'],
            data: [15, 25, 40, 5]
        },
        revenueTrend: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            data: [25000, 32000, 28000, 35000]
        }
    };
}

/**
 * Mettre à jour l'affichage des statistiques
 */
function updateStatsDisplay(stats) {
    Object.keys(stats).forEach(statKey => {
        const element = document.querySelector(`[data-stat="${statKey}"]`);
        if (element) {
            const stat = stats[statKey];
            
            // Mettre à jour la valeur
            const valueElement = element.querySelector('.stat-value');
            if (valueElement) {
                animateCounter(valueElement, stat.value);
            }
            
            // Mettre à jour la tendance
            const trendElement = element.querySelector('.stat-trend');
            if (trendElement) {
                trendElement.innerHTML = `
                    <i class="fas fa-arrow-${stat.trend === 'up' ? 'up' : 'down'}"></i>
                    ${Math.abs(stat.change)}%
                `;
                trendElement.className = `stat-trend trend-${stat.trend}`;
            }
            
            // Mettre à jour l'icône
            const iconElement = element.querySelector('.stat-icon');
            if (iconElement) {
                const icons = {
                    totalUsers: 'fas fa-users',
                    activeProjects: 'fas fa-project-diagram',
                    newMessages: 'fas fa-comments',
                    completionRate: 'fas fa-chart-line',
                    revenue: 'fas fa-money-bill-wave',
                    satisfaction: 'fas fa-star'
                };
                if (icons[statKey]) {
                    iconElement.className = `stat-icon ${icons[statKey]}`;
                }
            }
        }
    });
}

/**
 * Mettre à jour l'affichage des activités
 */
function updateActivitiesDisplay(activities) {
    const container = document.getElementById('activitiesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = `activity-item activity-${activity.type}`;
        activityElement.innerHTML = `
            <div class="activity-avatar">
                <img src="${activity.user.avatar}" alt="${activity.user.name}" 
                     onerror="this.src='/img/avatars/default.jpg'">
            </div>
            <div class="activity-content">
                <div class="activity-header">
                    <strong>${activity.user.name}</strong>
                    <span class="activity-time">${activity.time}</span>
                </div>
                <div class="activity-text">${activity.action}</div>
                ${activity.link ? `<a href="${activity.link}" class="activity-link">Voir →</a>` : ''}
            </div>
        `;
        container.appendChild(activityElement);
    });
}

/**
 * Mettre à jour l'affichage des notifications
 */
function updateNotificationsDisplay(notifications) {
    // Mettre à jour le badge
    const unreadCount = notifications.filter(n => !n.read).length;
    updateNotificationBadge(unreadCount);
    
    // Mettre à jour la liste
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        notificationElement.dataset.id = notification.id;
        notificationElement.innerHTML = `
            <div class="notification-icon">
                <i class="${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <span class="notification-priority badge-${notification.priority}">
                        ${notification.priority === 'high' ? 'Important' : 'Normal'}
                    </span>
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-footer">
                    <span class="notification-time">${notification.time}</span>
                    <button class="btn-mark-read" data-id="${notification.id}">
                        <i class="fas fa-check"></i> Marquer comme lu
                    </button>
                </div>
            </div>
        `;
        container.appendChild(notificationElement);
    });
}

/**
 * Mettre à jour le badge de notifications
 */
function updateNotificationBadge(count) {
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

/**
 * Mettre à jour l'affichage des performances
 */
function updatePerformanceDisplay(performanceData) {
    // Initialiser le graphique principal
    initMainChart(performanceData);
    
    // Mettre à jour les KPI de performance
    const avgUsers = performanceData.datasets[0].data.reduce((a, b) => a + b, 0) / 12;
    const avgProjects = performanceData.datasets[1].data.reduce((a, b) => a + b, 0) / 12;
    
    document.querySelectorAll('.kpi-avg-users').forEach(el => {
        el.textContent = Math.round(avgUsers);
    });
    
    document.querySelectorAll('.kpi-avg-projects').forEach(el => {
        el.textContent = Math.round(avgProjects);
    });
}

/**
 * Initialiser le graphique principal
 */
function initMainChart(data) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    // Détruire l'ancien graphique si existant
    if (Dashboard.charts.performance) {
        Dashboard.charts.performance.destroy();
    }
    
    // Créer le nouveau graphique
    Dashboard.charts.performance = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

/**
 * Mettre à jour l'affichage des graphiques
 */
function updateChartsDisplay(chartsData) {
    // Graphique de distribution des utilisateurs
    initUserDistributionChart(chartsData.userDistribution);
    
    // Graphique de statut des projets
    initProjectStatusChart(chartsData.projectStatus);
    
    // Graphique de tendance des revenus
    initRevenueTrendChart(chartsData.revenueTrend);
}

/**
 * Initialiser le graphique de distribution des utilisateurs
 */
function initUserDistributionChart(data) {
    const ctx = document.getElementById('userDistributionChart');
    if (!ctx) return;
    
    if (Dashboard.charts.userDistribution) {
        Dashboard.charts.userDistribution.destroy();
    }
    
    Dashboard.charts.userDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    '#1e90ff',
                    '#28a745',
                    '#fd7e14'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialiser le graphique de statut des projets
 */
function initProjectStatusChart(data) {
    const ctx = document.getElementById('projectStatusChart');
    if (!ctx) return;
    
    if (Dashboard.charts.projectStatus) {
        Dashboard.charts.projectStatus.destroy();
    }
    
    Dashboard.charts.projectStatus = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Nombre de projets',
                data: data.data,
                backgroundColor: [
                    '#6c757d',
                    '#1e90ff',
                    '#28a745',
                    '#dc3545'
                ],
                borderColor: [
                    '#495057',
                    '#0066cc',
                    '#1e7e34',
                    '#bd2130'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialiser le graphique de tendance des revenus
 */
function initRevenueTrendChart(data) {
    const ctx = document.getElementById('revenueTrendChart');
    if (!ctx) return;
    
    if (Dashboard.charts.revenueTrend) {
        Dashboard.charts.revenueTrend.destroy();
    }
    
    Dashboard.charts.revenueTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenus (€)',
                data: data.data,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Animer un compteur
 */
function animateCounter(element, targetValue) {
    const duration = 1500; // ms
    const stepTime = 20; // ms
    const steps = duration / stepTime;
    const increment = targetValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = formatNumber(targetValue);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.round(current));
        }
    }, stepTime);
}

/**
 * Formater un nombre
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString('fr-FR');
}

/**
 * Vérifier l'authentification
 */
function checkAuth() {
    const token = localStorage.getItem('aprofeec_auth_token');
    const user = JSON.parse(localStorage.getItem('aprofeec_user_data') || '{}');
    
    if (!token || !user.id) {
        return false;
    }
    
    // Vérifier l'expiration du token
    const expiry = localStorage.getItem('aprofeec_token_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
        return false;
    }
    
    return true;
}

/**
 * Vérifier les permissions du dashboard
 */
function checkDashboardPermission() {
    const user = JSON.parse(localStorage.getItem('aprofeec_user_data') || '{}');
    const allowedRoles = ['admin', 'mentor', 'apprenant'];
    
    return allowedRoles.includes(user.role);
}

/**
 * Rediriger vers la page de login
 */
function redirectToLogin() {
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    window.location.href = '/login.html';
}

/**
 * Afficher l'erreur d'accès refusé
 */
function showAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied-container">
            <div class="access-denied-content">
                <i class="fas fa-lock"></i>
                <h1>Accès Refusé</h1>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <a href="/" class="btn btn-primary">Retour à l'accueil</a>
            </div>
        </div>
    `;
}

/**
 * Afficher/masquer le loading
 */
function showLoading(show) {
    const loadingElement = document.getElementById('dashboardLoading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Configurer les événements du dashboard
 */
function setupDashboardEvents() {
    // Gestion des notifications
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-mark-read')) {
            const notificationId = e.target.closest('.btn-mark-read').dataset.id;
            markNotificationAsRead(notificationId);
        }
    });
    
    // Rafraîchissement manuel
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleRefresh();
        }
    });
    
    // Gestion de la déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                logout();
            }
        });
    }
    
    // Gestion du mode plein écran
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Gestion du thème sombre/clair
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Marquer une notification comme lue
 */
function markNotificationAsRead(notificationId) {
    // Mettre à jour l'interface
    const notificationElement = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
    if (notificationElement) {
        notificationElement.classList.remove('unread');
        notificationElement.classList.add('read');
        
        // Cacher le bouton "Marquer comme lu"
        const markReadBtn = notificationElement.querySelector('.btn-mark-read');
        if (markReadBtn) {
            markReadBtn.style.display = 'none';
        }
        
        // Mettre à jour le badge
        const currentBadge = document.querySelector('.notification-badge');
        if (currentBadge) {
            const currentCount = parseInt(currentBadge.textContent) || 0;
            updateNotificationBadge(Math.max(0, currentCount - 1));
        }
    }
    
    // Envoyer la mise à jour au serveur
    // api.markNotificationAsRead(notificationId);
}

/**
 * Gérer le rafraîchissement
 */
function handleRefresh() {
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
        refreshBtn.disabled = true;
    }
    
    loadDashboardData().finally(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
            refreshBtn.disabled = false;
        }
    });
}

/**
 * Gérer l'export
 */
function handleExport() {
    const exportType = prompt('Format d\'export (JSON, CSV, PDF):', 'JSON').toUpperCase();
    
    switch (exportType) {
        case 'JSON':
            exportAsJSON();
            break;
        case 'CSV':
            exportAsCSV();
            break;
        case 'PDF':
            exportAsPDF();
            break;
        default:
            showNotification('Format non supporté', 'error');
    }
}

/**
 * Exporter en JSON
 */
function exportAsJSON() {
    const data = {
        exportedAt: new Date().toISOString(),
        data: Dashboard.data,
        user: JSON.parse(localStorage.getItem('aprofeec_user_data') || '{}')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Export JSON terminé', 'success');
}

/**
 * Exporter en CSV
 */
function exportAsCSV() {
    // Simplifié pour l'exemple
    const csvContent = "Donnée,Valeur\n" +
        "Utilisateurs," + Dashboard.data.stats.totalUsers.value + "\n" +
        "Projets," + Dashboard.data.stats.activeProjects.value + "\n" +
        "Taux de complétion," + Dashboard.data.stats.completionRate.value + "%";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Export CSV terminé', 'success');
}

/**
 * Exporter en PDF (simulation)
 */
function exportAsPDF() {
    // Utiliser une bibliothèque comme jsPDF dans une vraie implémentation
    showNotification('Export PDF non disponible dans cette version', 'warning');
}

/**
 * Gérer l'impression
 */
function handlePrint() {
    window.print();
}

/**
 * Gérer le partage
 */
function handleShare() {
    if (navigator.share) {
        navigator.share({
            title: 'Dashboard APROFEEC',
            text: 'Consultez mon dashboard APROFEEC',
            url: window.location.href
        });
    } else {
        // Fallback: copier le lien
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Lien copié dans le presse-papier', 'success');
        });
    }
}

/**
 * Basculer la vue
 */
function toggleView(viewType) {
    const container = document.querySelector('.dashboard-content');
    if (container) {
        container.setAttribute('data-view', viewType);
        localStorage.setItem('dashboard_view', viewType);
    }
}

/**
 * Sauvegarder la disposition
 */
function saveDashboardLayout() {
    const widgets = document.querySelectorAll('.dashboard-widget');
    const layout = Array.from(widgets).map(widget => ({
        id: widget.id,
        order: Array.from(widget.parentNode.children).indexOf(widget)
    }));
    
    localStorage.setItem('dashboard_layout', JSON.stringify(layout));
}

/**
 * Restaurer la disposition
 */
function restoreDashboardLayout() {
    const layout = JSON.parse(localStorage.getItem('dashboard_layout') || '[]');
    const container = document.querySelector('.dashboard-widgets');
    
    if (container && layout.length > 0) {
        layout.sort((a, b) => a.order - b.order).forEach(item => {
            const widget = document.getElementById(item.id);
            if (widget) {
                container.appendChild(widget);
            }
        });
    }
}

/**
 * Basculer le mode plein écran
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Erreur en plein écran: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

/**
 * Basculer le thème
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showNotification(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
}

/**
 * Vérifier la connexion
 */
function checkConnection() {
    if (!navigator.onLine) {
        showNotification('Vous êtes hors ligne', 'warning');
    }
    
    window.addEventListener('online', () => {
        showNotification('Connexion rétablie', 'success');
        handleRefresh();
    });
    
    window.addEventListener('offline', () => {
        showNotification('Vous êtes hors ligne', 'warning');
    });
}

/**
 * Démarrer le rafraîchissement automatique
 */
function startAutoRefresh() {
    // Rafraîchir toutes les 5 minutes
    Dashboard.refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadDashboardData();
        }
    }, 5 * 60 * 1000);
}

/**
 * Arrêter le rafraîchissement automatique
 */
function stopAutoRefresh() {
    if (Dashboard.refreshInterval) {
        clearInterval(Dashboard.refreshInterval);
    }
}

/**
 * Mettre à jour le dashboard depuis le cache
 */
function updateDashboardFromCache(cachedData) {
    updateStatsDisplay(cachedData.stats);
    updateActivitiesDisplay(cachedData.activities);
    updateNotificationsDisplay(cachedData.notifications);
    updatePerformanceDisplay(cachedData.performance);
    updateChartsDisplay(cachedData.charts);
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
 * Déconnexion
 */
function logout() {
    localStorage.removeItem('aprofeec_auth_token');
    localStorage.removeItem('aprofeec_user_data');
    localStorage.removeItem('aprofeec_token_expiry');
    
    window.location.href = '/login.html';
}

/**
 * Afficher une notification
 */
function showNotification(message, type = 'info') {
    // Utiliser APROFEECAuth si disponible
    if (window.APROFEECAuth && typeof APROFEECAuth.showNotification === 'function') {
        APROFEECAuth.showNotification(message, type);
    } else {
        // Fallback simple
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Exposer les fonctions globales
window.refreshDashboard = loadDashboardData;
window.exportDashboard = handleExport;
window.printDashboard = handlePrint;
window.toggleFullscreen = toggleFullscreen;
window.toggleTheme = toggleTheme;

// Initialiser la disposition au chargement
document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('dashboard_view');
    if (savedView) {
        toggleView(savedView);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    restoreDashboardLayout();
});

// Nettoyer à la fermeture
window.addEventListener('beforeunload', stopAutoRefresh);