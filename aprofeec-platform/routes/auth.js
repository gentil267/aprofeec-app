const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/aprofeec.db'));
const JWT_SECRET = process.env.JWT_SECRET || 'aprofeec_secure_key_rdc_2024';

// Route de vérification de token
router.post('/verify-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ valid: false, message: 'Token manquant' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ valid: false, message: 'Token invalide' });
        }
        
        // Récupérer les infos utilisateur à jour
        db.get('SELECT id, first_name, last_name, email, role, status FROM users WHERE id = ?', 
            [decoded.id], 
            (err, user) => {
                if (err || !user) {
                    return res.status(401).json({ valid: false, message: 'Utilisateur non trouvé' });
                }
                
                res.json({ 
                    valid: true, 
                    user: {
                        ...user,
                        firstName: user.first_name,
                        lastName: user.last_name
                    }
                });
            });
    });
});

// Route de changement de mot de passe
router.post('/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }
        
        // Récupérer l'utilisateur
        db.get('SELECT * FROM users WHERE id = ?', [decoded.id], async (err, user) => {
            if (err || !user) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }
            
            // Vérifier l'ancien mot de passe
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
            }
            
            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Mettre à jour
            db.run('UPDATE users SET password = ? WHERE id = ?', 
                [hashedPassword, user.id], 
                function(err) {
                    if (err) {
                        console.error('Erreur changement mot de passe:', err);
                        return res.status(500).json({ success: false, message: 'Erreur serveur' });
                    }
                    
                    res.json({ success: true, message: 'Mot de passe changé avec succès' });
                });
        });
    });
});

// Route de réinitialisation de mot de passe (simplifiée)
router.post('/reset-password-request', (req, res) => {
    const { email } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user) {
            // Pour la sécurité, ne pas révéler si l'email existe
            return res.json({ 
                success: true, 
                message: 'Si cet email existe, vous recevrez un lien de réinitialisation' 
            });
        }
        
        // Générer un token de réinitialisation
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, type: 'reset' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // En production, envoyer un email ici
        console.log(`🔑 Token de réinitialisation pour ${email}: ${resetToken}`);
        
        res.json({ 
            success: true, 
            message: 'Lien de réinitialisation généré (voir console pour test)',
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : null
        });
    });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token et nouveau mot de passe requis' });
    }
    
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err || decoded.type !== 'reset') {
            return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        db.run('UPDATE users SET password = ? WHERE id = ?', 
            [hashedPassword, decoded.id], 
            function(err) {
                if (err) {
                    console.error('Erreur réinitialisation mot de passe:', err);
                    return res.status(500).json({ success: false, message: 'Erreur serveur' });
                }
                
                res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
            });
    });
});

module.exports = router;