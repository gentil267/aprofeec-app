/**
 * APROFEEC Dashboard Module
 * Gère le tableau de bord, les cours, les statistiques
 */

class DashboardManager {
    constructor() {
        this.auth = window.auth;
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
        this.currentUser = null;
        this.courses = [];
        this.stats = null;
    }

    // Initialiser le dashboard
    async init() {
        if (!this.auth.requireAuth()) return;

        this.currentUser = this.auth.user;
        await this.loadDashboardData();
        this.updateUI();
        this.setupEventListeners();
    }

    // Charger les données du dashboard
    async loadDashboardData() {
        try {
            // Charger les statistiques
            const statsResponse = await fetch(`${this.apiBaseUrl}/dashboard`, {
                headers: this.auth.getAuthHeaders()
            });
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.success) {
                    this.stats = statsData.stats;
                }
            }

            // Charger les cours
            const coursesResponse = await fetch(`${this.apiBaseUrl}/courses`, {
                headers: this.auth.getAuthHeaders()
            });
            
            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json();
                if (coursesData.success) {
                    this.courses = coursesData.courses;
                }
            }

            // Charger les certificats
            const certsResponse = await fetch(`${this.apiBaseUrl}/certificates`, {
                headers: this.auth.getAuthHeaders()
            });
            
            if (certsResponse.ok) {
                const certsData = await certsResponse.json();
                if (certsData.success) {
                    this.certificates = certsData.certificates;
                }
            }

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            this.showError('Erreur de chargement des données');
        }
    }

    // Mettre à jour l'interface utilisateur
    updateUI() {
        // Mettre à jour les informations utilisateur
        this.updateUserInfo();
        
        // Mettre à jour les statistiques
        this.updateStats();
        
        // Afficher les cours
        this.displayCourses();
        
        // Afficher les certificats
        this.displayCertificates();
    }

    // Mettre à jour les informations utilisateur
    updateUserInfo() {
        if (!this.currentUser) return;

        // Nom complet
        const userNameElements = document.querySelectorAll('.user-name, #userName');
        userNameElements.forEach(el => {
            if (el) {
                el.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        });

        // Email
        const userEmailElements = document.querySelectorAll('.user-email, #userEmail');
        userEmailElements.forEach(el => {
            if (el) {
                el.textContent = this.currentUser.email;
            }
        });

        // Rôle
        const userRoleElements = document.querySelectorAll('.user-role, #userRole');
        userRoleElements.forEach(el => {
            if (el) {
                const roleText = {
                    'learner': 'Apprenant',
                    'mentor': 'Mentor',
                    'admin': 'Administrateur'
                }[this.currentUser.role] || this.currentUser.role;
                el.textContent = roleText;
            }
        });

        // Avatar
        const avatarElements = document.querySelectorAll('.user-avatar, #userAvatar');
        avatarElements.forEach(el => {
            if (el && el.tagName === 'IMG') {
                el.src = this.currentUser.avatar || '/images/avatars/default-avatar.jpg';
                el.alt = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        });
    }

    // Mettre à jour les statistiques
    updateStats() {
        if (!this.stats) return;

        // Total des cours
        const totalCoursesEl = document.getElementById('totalCourses');
        if (totalCoursesEl) {
            totalCoursesEl.textContent = this.stats.totalCourses || 0;
        }

        // Cours inscrits
        const enrolledCoursesEl = document.getElementById('enrolledCourses');
        if (enrolledCoursesEl) {
            enrolledCoursesEl.textContent = this.stats.enrolledCourses || 0;
        }

        // Cours complétés
        const completedCoursesEl = document.getElementById('completedCourses');
        if (completedCoursesEl) {
            completedCoursesEl.textContent = this.stats.completedCourses || 0;
        }

        // Certificats
        const certificatesEl = document.getElementById('certificates');
        if (certificatesEl) {
            certificatesEl.textContent = this.stats.certificates || 0;
        }

        // Progression générale
        const progressEl = document.getElementById('overallProgress');
        if (progressEl) {
            progressEl.textContent = `${this.stats.progress || 0}%`;
            
            // Barre de progression
            const progressBar = progressEl.closest('.stat-card')?.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${this.stats.progress || 0}%`;
            }
        }
    }

    // Afficher les cours
    displayCourses() {
        const container = document.getElementById('coursesContainer');
        if (!container) return;

        if (!this.courses || this.courses.length === 0) {
            container.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-book-open fa-3x mb-3" style="color: #9ca3af;"></i>
                    <p>Aucun cours disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        const coursesHtml = this.courses.map(course => this.createCourseCard(course)).join('');
        container.innerHTML = coursesHtml;
    }

    // Créer une carte de cours
    createCourseCard(course) {
        const progress = course.progress || 0;
        const isCompleted = course.completed || false;
        const isEnrolled = course.enrolled || false;
        
        return `
            <div class="course-card card" data-course-id="${course.id}">
                <div class="course-header">
                    ${course.thumbnail ? `
                        <img src="${course.thumbnail}" alt="${course.title}" class="course-thumbnail">
                    ` : ''}
                    <div class="course-badge ${course.level}">${this.getLevelText(course.level)}</div>
                    ${isCompleted ? '<div class="course-completed-badge"><i class="fas fa-check-circle"></i> Terminé</div>' : ''}
                </div>
                
                <div class="course-content">
                    <h4 class="course-title">${course.title}</h4>
                    <p class="course-description">${course.description || 'Aucune description disponible'}</p>
                    
                    <div class="course-meta">
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ${course.duration || 'N/A'} heures
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-layer-group"></i>
                            ${course.category || 'Général'}
                        </span>
                    </div>
                    
                    ${isEnrolled ? `
                        <div class="course-progress-section">
                            <div class="progress-info">
                                <span>Progression: ${progress}%</span>
                                ${isCompleted ? 
                                    '<span class="text-success"><i class="fas fa-check"></i> Complété</span>' : 
                                    `<button class="btn-continue" data-course-id="${course.id}">
                                        <i class="fas fa-play"></i> Continuer
                                    </button>`
                                }
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    ` : `
                        <button class="btn-enroll" data-course-id="${course.id}">
                            <i class="fas fa-plus"></i> S'inscrire
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // Afficher les certificats
    displayCertificates() {
        const container = document.getElementById('certificatesContainer');
        if (!container || !this.certificates) return;

        if (this.certificates.length === 0) {
            container.innerHTML = `
                <div class="no-certificates">
                    <i class="fas fa-certificate fa-3x mb-3" style="color: #9ca3af;"></i>
                    <p>Aucun certificat obtenu pour le moment.</p>
                    <p class="small">Complétez des cours pour obtenir des certificats.</p>
                </div>
            `;
            return;
        }

        const certsHtml = this.certificates.map(cert => this.createCertificateCard(cert)).join('');
        container.innerHTML = certsHtml;
    }

    // Créer une carte de certificat
    createCertificateCard(certificate) {
        return `
            <div class="certificate-card card" data-certificate-id="${certificate.id}">
                <div class="certificate-header">
                    <i class="fas fa-certificate fa-2x" style="color: #f59e0b;"></i>
                    <div class="certificate-code">${certificate.certificate_code}</div>
                </div>
                
                <div class="certificate-content">
                    <h5>${certificate.course_title || 'Cours'}</h5>
                    <p class="certificate-date">
                        <i class="fas fa-calendar"></i>
                        Émis le: ${new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                    </p>
                    
                    <div class="certificate-actions">
                        <button class="btn-view-certificate" data-certificate-id="${certificate.id}">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                        <button class="btn-download-certificate" data-certificate-id="${certificate.id}">
                            <i class="fas fa-download"></i> Télécharger
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtenir le texte du niveau
    getLevelText(level) {
        const levels = {
            'beginner': 'Débutant',
            'intermediate': 'Intermédiaire',
            'advanced': 'Avancé'
        };
        return levels[level] || level;
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Inscription à un cours
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-enroll')) {
                const courseId = e.target.closest('.btn-enroll').dataset.courseId;
                await this.enrollInCourse(courseId);
            }
        });

        // Continuer un cours
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-continue')) {
                const courseId = e.target.closest('.btn-continue').dataset.courseId;
                this.openCourse(courseId);
            }
        });

        // Voir certificat
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-view-certificate')) {
                const certId = e.target.closest('.btn-view-certificate').dataset.certificateId;
                this.viewCertificate(certId);
            }
        });

        // Télécharger certificat
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-download-certificate')) {
                const certId = e.target.closest('.btn-download-certificate').dataset.certificateId;
                this.downloadCertificate(certId);
            }
        });

        // Recherche de cours
        const searchInput = document.getElementById('courseSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCourses(e.target.value);
            });
        }

        // Filtrage par catégorie
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
    }

    // S'inscrire à un cours
    async enrollInCourse(courseId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/courses/enroll`, {
                method: 'POST',
                headers: this.auth.getAuthHeaders(),
                body: JSON.stringify({ courseId })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Inscription réussie !');
                // Recharger les données
                await this.loadDashboardData();
                this.updateUI();
            } else {
                this.showError(data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur inscription cours:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    // Ouvrir un cours
    openCourse(courseId) {
        window.location.href = `/course.html?id=${courseId}`;
    }

    // Voir un certificat
    viewCertificate(certificateId) {
        const certificate = this.certificates?.find(c => c.id == certificateId);
        if (certificate) {
            const modalHtml = `
                <div class="certificate-modal">
                    <div class="modal-content">
                        <h3>Certificat: ${certificate.course_title}</h3>
                        <p><strong>Code:</strong> ${certificate.certificate_code}</p>
                        <p><strong>Date d'émission:</strong> ${new Date(certificate.issued_at).toLocaleDateString('fr-FR')}</p>
                        <p>Ce certificat atteste que ${this.currentUser.firstName} ${this.currentUser.lastName} 
                        a complété avec succès le cours "${certificate.course_title}".</p>
                    </div>
                </div>
            `;
            
            // Afficher le modal
            this.showModal(modalHtml);
        }
    }

    // Télécharger un certificat
    downloadCertificate(certificateId) {
        const certificate = this.certificates?.find(c => c.id == certificateId);
        if (certificate) {
            // Créer un PDF du certificat (simulé)
            const pdfContent = `
                === CERTIFICAT APROFEEC ===
                
                Ceci certifie que
                ${this.currentUser.firstName} ${this.currentUser.lastName}
                
                a complété avec succès le cours
                "${certificate.course_title}"
                
                Code du certificat: ${certificate.certificate_code}
                Date d'émission: ${new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                
                Félicitations pour votre réussite !
                
                APROFEEC - Plateforme de Formation Professionnelle
            `;
            
            const blob = new Blob([pdfContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificat-${certificate.certificate_code}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    // Filtrer les cours
    filterCourses(searchTerm) {
        if (!searchTerm) {
            this.displayCourses();
            return;
        }

        const filtered = this.courses.filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const container = document.getElementById('coursesContainer');
        if (container) {
            container.innerHTML = filtered.map(course => this.createCourseCard(course)).join('');
        }
    }

    // Filtrer par catégorie
    filterByCategory(category) {
        if (!category || category === 'all') {
            this.displayCourses();
            return;
        }

        const filtered = this.courses.filter(course => 
            course.category === category
        );

        const container = document.getElementById('coursesContainer');
        if (container) {
            container.innerHTML = filtered.map(course => this.createCourseCard(course)).join('');
        }
    }

    // Afficher un message de succès
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Afficher une erreur
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Supprimer après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Afficher un modal
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <button class="modal-close">&times;</button>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer le modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}

// Initialiser le dashboard quand la page est chargée
document.addEventListener('DOMContentLoaded', async () => {
    const dashboard = new DashboardManager();
    await dashboard.init();
    
    // Exporter pour l'utilisation globale
    window.dashboard = dashboard;
});