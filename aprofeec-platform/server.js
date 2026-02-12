const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aprofeec_secure_key_rdc_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de données SQLite
const db = new sqlite3.Database('./database/aprofeec.db', (err) => {
    if (err) {
        console.error('❌ Erreur DB:', err);
    } else {
        console.log('✅ Base de données connectée');
        initDatabase();
    }
});

// Initialiser la base de données
function initDatabase() {
    db.serialize(() => {
        // Table users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'learner',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`);

        // Table invitation_codes
        db.run(`CREATE TABLE IF NOT EXISTS invitation_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            created_by INTEGER,
            used_by INTEGER,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (used_by) REFERENCES users(id)
        )`);

        // Table courses
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            duration INTEGER,
            instructor_id INTEGER,
            price DECIMAL(10,2) DEFAULT 0,
            level TEXT DEFAULT 'beginner',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (instructor_id) REFERENCES users(id)
        )`);

        // Table enrollments
        db.run(`CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            progress INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT 0,
            enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE(user_id, course_id)
        )`);

        // Table certificates
        db.run(`CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            certificate_code TEXT UNIQUE NOT NULL,
            issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            pdf_path TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // Insérer un code d'invitation par défaut
        const defaultCodes = ['APROFEEC1', 'APROFEEC2', 'APROFEEC3', 'APROFEEC4', 'APROFEEC5'];
        defaultCodes.forEach(code => {
            db.get('SELECT * FROM invitation_codes WHERE code = ?', [code], (err, row) => {
                if (!row) {
                    db.run('INSERT INTO invitation_codes (code) VALUES (?)', [code]);
                }
            });
        });

        // Insérer des cours par défaut si vide
        db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
            if (row.count === 0) {
                const defaultCourses = [
                    ['Développement Web Fullstack', 'Apprenez HTML, CSS, JavaScript, Node.js et React', 'Développement', 120, 0, 0, 'beginner'],
                    ['Marketing Digital', 'Stratégies de marketing digital pour entrepreneurs', 'Marketing', 80, 0, 0, 'beginner'],
                    ['Gestion de Projet Agile', 'Maîtrisez les méthodologies Agile et Scrum', 'Gestion', 60, 0, 0, 'intermediate'],
                    ['Data Science', 'Introduction à Python et analyse de données', 'Data', 100, 0, 0, 'advanced']
                ];
                
                const stmt = db.prepare('INSERT INTO courses (title, description, category, duration, instructor_id, price, level) VALUES (?, ?, ?, ?, ?, ?, ?)');
                defaultCourses.forEach(course => {
                    stmt.run(course);
                });
                stmt.finalize();
                console.log('✅ Cours par défaut insérés');
            }
        });
    });
}

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

// Routes publiques
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, invitationCode } = req.body;
        
        // Validation
        if (!firstName || !lastName || !email || !password || !invitationCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tous les champs sont requis' 
            });
        }
        
        // Vérifier le code d'invitation
        db.get('SELECT * FROM invitation_codes WHERE code = ? AND used_by IS NULL', 
            [invitationCode.toUpperCase()], async (err, codeRow) => {
                if (err || !codeRow) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Code d\'invitation invalide ou déjà utilisé' 
                    });
                }
                
                // Vérifier si l'email existe déjà
                db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                    if (user) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Cet email est déjà utilisé' 
                        });
                    }
                    
                    // Hasher le mot de passe
                    const hashedPassword = await bcrypt.hash(password, 10);
                    
                    // Créer l'utilisateur
                    db.run(
                        `INSERT INTO users (first_name, last_name, email, phone, password) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [firstName, lastName, email, phone, hashedPassword],
                        function(err) {
                            if (err) {
                                console.error('Erreur création utilisateur:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Erreur serveur lors de la création' 
                                });
                            }
                            
                            const userId = this.lastID;
                            
                            // Marquer le code comme utilisé
                            db.run(
                                'UPDATE invitation_codes SET used_by = ?, used_at = CURRENT_TIMESTAMP WHERE code = ?',
                                [userId, invitationCode.toUpperCase()]
                            );
                            
                            // Générer le token JWT
                            const token = jwt.sign(
                                { 
                                    id: userId, 
                                    email: email, 
                                    role: 'learner',
                                    firstName: firstName,
                                    lastName: lastName
                                },
                                JWT_SECRET,
                                { expiresIn: '7d' }
                            );
                            
                            res.json({ 
                                success: true, 
                                message: 'Compte créé avec succès',
                                token,
                                user: { 
                                    id: userId, 
                                    firstName, 
                                    lastName, 
                                    email, 
                                    phone,
                                    role: 'learner' 
                                }
                            });
                        }
                    );
                });
            }
        );
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur interne' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email et mot de passe requis' 
        });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Mettre à jour la dernière connexion
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        // Générer le token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                status: user.status
            }
        });
    });
});

app.post('/api/verify-invitation', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.json({ valid: false, message: 'Code requis' });
    }
    
    db.get(
        'SELECT * FROM invitation_codes WHERE code = ? AND used_by IS NULL',
        [code.toUpperCase()],
        (err, row) => {
            if (err || !row) {
                return res.json({ valid: false, message: 'Code invalide ou déjà utilisé' });
            }
            res.json({ valid: true, message: 'Code valide' });
        }
    );
});

// Routes protégées
app.get('/api/dashboard', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    // Récupérer les statistiques
    db.serialize(() => {
        db.get('SELECT COUNT(*) as total FROM courses', (err, courseRow) => {
            db.get('SELECT COUNT(*) as completed FROM enrollments WHERE user_id = ? AND completed = 1', [userId], (err, enrollRow) => {
                db.get('SELECT COUNT(*) as enrolled FROM enrollments WHERE user_id = ?', [userId], (err, enrolledRow) => {
                    db.get('SELECT COUNT(*) as certificates FROM certificates WHERE user_id = ?', [userId], (err, certRow) => {
                        res.json({
                            success: true,
                            user: req.user,
                            stats: {
                                totalCourses: courseRow.total,
                                enrolledCourses: enrolledRow.enrolled,
                                completedCourses: enrollRow.completed,
                                certificates: certRow.certificates,
                                progress: enrolledRow.enrolled > 0 ? Math.round((enrollRow.completed / enrolledRow.enrolled) * 100) : 0
                            }
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/courses', authenticateToken, (req, res) => {
    const query = req.query.category 
        ? 'SELECT * FROM courses WHERE category = ? ORDER BY created_at DESC'
        : 'SELECT * FROM courses ORDER BY created_at DESC';
    
    const params = req.query.category ? [req.query.category] : [];
    
    db.all(query, params, (err, courses) => {
        if (err) {
            console.error('Erreur récupération cours:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        // Pour chaque cours, vérifier si l'utilisateur est inscrit
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

app.post('/api/courses/enroll', authenticateToken, (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    
    if (!courseId) {
        return res.status(400).json({ success: false, message: 'ID du cours requis' });
    }
    
    db.run('INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)', 
        [userId, courseId], 
        function(err) {
            if (err) {
                console.error('Erreur inscription cours:', err);
                return res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription' });
            }
            
            if (this.changes === 0) {
                return res.json({ success: false, message: 'Déjà inscrit à ce cours' });
            }
            
            res.json({ success: true, message: 'Inscription réussie' });
        });
});

app.get('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        // Exclure le mot de passe
        const { password, ...userData } = user;
        res.json({ success: true, user: userData });
    });
});

app.put('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;
    
    db.run('UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
        [firstName, lastName, phone, userId],
        function(err) {
            if (err) {
                console.error('Erreur mise à jour profil:', err);
                return res.status(500).json({ success: false, message: 'Erreur mise à jour' });
            }
            
            res.json({ success: true, message: 'Profil mis à jour' });
        });
});

app.get('/api/certificates', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(`SELECT c.*, crs.title as course_title 
            FROM certificates c
            JOIN courses crs ON c.course_id = crs.id
            WHERE c.user_id = ?
            ORDER BY c.issued_at DESC`, 
        [userId], 
        (err, certificates) => {
            if (err) {
                console.error('Erreur récupération certificats:', err);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }
            
            res.json({ success: true, certificates });
        });
});

// Route pour générer un certificat (simulé)
app.post('/api/certificates/generate', authenticateToken, (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    
    // Vérifier si le cours est complété
    db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND completed = 1', 
        [userId, courseId], (err, enrollment) => {
            if (err || !enrollment) {
                return res.status(400).json({ success: false, message: 'Cours non complété' });
            }
            
            // Vérifier si un certificat existe déjà
            db.get('SELECT * FROM certificates WHERE user_id = ? AND course_id = ?', 
                [userId, courseId], (err, existingCert) => {
                    if (existingCert) {
                        return res.json({ 
                            success: true, 
                            message: 'Certificat déjà existant',
                            certificate: existingCert 
                        });
                    }
                    
                    // Générer un code de certificat unique
                    const certCode = `CERT-${Date.now()}-${userId}-${courseId}`;
                    
                    db.run(`INSERT INTO certificates (user_id, course_id, certificate_code) 
                            VALUES (?, ?, ?)`,
                        [userId, courseId, certCode],
                        function(err) {
                            if (err) {
                                console.error('Erreur génération certificat:', err);
                                return res.status(500).json({ success: false, message: 'Erreur génération' });
                            }
                            
                            res.json({ 
                                success: true, 
                                message: 'Certificat généré',
                                certificate: {
                                    id: this.lastID,
                                    certificate_code: certCode,
                                    issued_at: new Date().toISOString()
                                }
                            });
                        });
                });
        });
});

// Routes pour les mentors
app.get('/api/mentors', authenticateToken, (req, res) => {
    db.all(`SELECT id, first_name, last_name, email, phone, role, created_at 
            FROM users WHERE role IN ('mentor', 'admin') ORDER BY first_name`,
        (err, mentors) => {
            if (err) {
                console.error('Erreur récupération mentors:', err);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }
            
            res.json({ success: true, mentors });
        });
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Route par défaut pour le frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur APROFEEC démarré sur le port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`📊 Base de données: aprofeec.db`);
    console.log(`🔑 Code d'invitation test: APROFEEC1`);
});

module.exports = app;