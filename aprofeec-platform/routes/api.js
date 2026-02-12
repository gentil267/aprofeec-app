const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/aprofeec.db'));
const JWT_SECRET = process.env.JWT_SECRET || 'aprofeec_secure_key_rdc_2024';

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

// Routes des cours
router.get('/courses', authenticateToken, (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM courses';
    let params = [];
    
    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }
    
    if (search) {
        query += category ? ' AND ' : ' WHERE ';
        query += '(title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, courses) => {
        if (err) {
            console.error('Erreur récupération cours:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        // Vérifier l'inscription pour chaque cours
        const userId = req.user.id;
        const coursesWithEnrollment = courses.map(course => {
            return new Promise((resolve) => {
                db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', 
                    [userId, course.id], 
                    (err, enrollment) => {
                        resolve({
                            ...course,
                            enrolled: !!enrollment,
                            progress: enrollment ? enrollment.progress : 0,
                            completed: enrollment ? enrollment.completed : false
                        });
                    });
            });
        });
        
        Promise.all(coursesWithEnrollment).then(coursesData => {
            res.json({ success: true, courses: coursesData });
        });
    });
});

router.get('/courses/:id', authenticateToken, (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
        if (err || !course) {
            return res.status(404).json({ success: false, message: 'Cours non trouvé' });
        }
        
        // Vérifier l'inscription
        db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', 
            [userId, courseId], 
            (err, enrollment) => {
                
            // Récupérer l'instructeur
            db.get('SELECT first_name, last_name, email FROM users WHERE id = ?', 
                [course.instructor_id], 
                (err, instructor) => {
                    
                // Récupérer les modules (simulé)
                const modules = [
                    { id: 1, title: 'Introduction', duration: '30 min', completed: true },
                    { id: 2, title: 'Concepts de base', duration: '45 min', completed: enrollment?.progress > 30 },
                    { id: 3, title: 'Exercices pratiques', duration: '60 min', completed: enrollment?.progress > 60 },
                    { id: 4, title: 'Projet final', duration: '90 min', completed: enrollment?.completed }
                ];
                
                res.json({
                    success: true,
                    course: {
                        ...course,
                        instructor: instructor || { first_name: 'Instructeur', last_name: 'APROFEEC' },
                        enrolled: !!enrollment,
                        progress: enrollment ? enrollment.progress : 0,
                        completed: enrollment ? enrollment.completed : false,
                        modules: modules
                    }
                });
            });
        });
    });
});

router.post('/courses/:id/progress', authenticateToken, (req, res) => {
    const courseId = req.params.id;
    const { progress } = req.body;
    const userId = req.user.id;
    
    if (progress < 0 || progress > 100) {
        return res.status(400).json({ success: false, message: 'Progression invalide' });
    }
    
    db.run('UPDATE enrollments SET progress = ?, completed = ? WHERE user_id = ? AND course_id = ?',
        [progress, progress === 100 ? 1 : 0, userId, courseId],
        function(err) {
            if (err) {
                console.error('Erreur mise à jour progression:', err);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
            }
            
            // Si cours terminé, générer automatiquement un certificat
            if (progress === 100) {
                const certCode = `CERT-${Date.now()}-${userId}-${courseId}`;
                db.run(`INSERT OR IGNORE INTO certificates (user_id, course_id, certificate_code) 
                        VALUES (?, ?, ?)`,
                    [userId, courseId, certCode]);
            }
            
            res.json({ success: true, message: 'Progression mise à jour' });
        });
});

// Routes des ressources
router.get('/resources', authenticateToken, (req, res) => {
    const { type } = req.query;
    
    // Données simulées de ressources
    const resources = [
        { id: 1, title: 'Guide Développement Web', type: 'pdf', category: 'Développement', size: '2.4 MB', url: '/resources/web-guide.pdf' },
        { id: 2, title: 'Vidéo Marketing Digital', type: 'video', category: 'Marketing', size: '45 MB', url: '/resources/marketing-video.mp4' },
        { id: 3, title: 'Template Gestion de Projet', type: 'template', category: 'Gestion', size: '1.2 MB', url: '/resources/project-template.xlsx' },
        { id: 4, title: 'Livre Data Science', type: 'ebook', category: 'Data', size: '8.7 MB', url: '/resources/data-science-book.pdf' },
        { id: 5, title: 'Présentation Agile', type: 'presentation', category: 'Gestion', size: '3.1 MB', url: '/resources/agile-presentation.pptx' }
    ];
    
    const filteredResources = type 
        ? resources.filter(r => r.type === type)
        : resources;
    
    res.json({ success: true, resources: filteredResources });
});

// Routes des statistiques
router.get('/stats', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.serialize(() => {
        // Statistiques globales
        db.get('SELECT COUNT(*) as totalCourses FROM courses', (err, courseRow) => {
            db.get('SELECT COUNT(DISTINCT user_id) as totalUsers FROM users WHERE role = "learner"', (err, userRow) => {
                db.get('SELECT COUNT(*) as totalCertificates FROM certificates', (err, certRow) => {
                    // Statistiques utilisateur
                    db.get('SELECT COUNT(*) as userCourses FROM enrollments WHERE user_id = ?', [userId], (err, userCourseRow) => {
                        db.get('SELECT COUNT(*) as completedCourses FROM enrollments WHERE user_id = ? AND completed = 1', [userId], (err, completedRow) => {
                            db.get('SELECT COUNT(*) as userCertificates FROM certificates WHERE user_id = ?', [userId], (err, userCertRow) => {
                                
                                // Cours populaires
                                db.all(`SELECT c.title, COUNT(e.id) as enrollments 
                                        FROM courses c 
                                        LEFT JOIN enrollments e ON c.id = e.course_id 
                                        GROUP BY c.id 
                                        ORDER BY enrollments DESC 
                                        LIMIT 5`, 
                                    (err, popularCourses) => {
                                        
                                        res.json({
                                            success: true,
                                            global: {
                                                totalCourses: courseRow.totalCourses,
                                                totalUsers: userRow.totalUsers,
                                                totalCertificates: certRow.totalCertificates
                                            },
                                            user: {
                                                enrolledCourses: userCourseRow.userCourses,
                                                completedCourses: completedRow.completedCourses,
                                                certificates: userCertRow.userCertificates,
                                                progress: userCourseRow.userCourses > 0 
                                                    ? Math.round((completedRow.completedCourses / userCourseRow.userCourses) * 100) 
                                                    : 0
                                            },
                                            popularCourses: popularCourses || []
                                        });
                                    });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;