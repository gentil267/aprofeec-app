const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Inscription avec code d'invitation
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, invitationCode } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Cet email est déjà utilisé' 
            });
        }

        // Vérifier le code d'invitation (simplifié pour l'instant)
        if (!invitationCode || invitationCode !== 'APROFEEC2024') {
            return res.status(400).json({ 
                error: 'Code d\'invitation invalide' 
            });
        }

        // Créer l'utilisateur
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: 'learner', // Par défaut
            status: 'active',
            invitationCode
        });

        await user.save();

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Compte créé avec succès',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création du compte' 
        });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier le statut du compte
        if (user.status !== 'active') {
            return res.status(403).json({ 
                error: 'Compte non activé. Contactez l\'administration.' 
            });
        }

        // Mettre à jour les statistiques
        user.stats.loginCount += 1;
        user.stats.lastLogin = new Date();
        await user.save();

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar
            },
            token
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la connexion' 
        });
    }
});

// Récupérer le profil utilisateur
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Erreur de récupération du profil:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération du profil' 
        });
    }
});

// Mettre à jour le profil
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        
        // Ne pas permettre la modification de l'email et du mot de passe ici
        delete updates.email;
        delete updates.password;
        delete updates.role;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            message: 'Profil mis à jour avec succès',
            user
        });
    } catch (error) {
        console.error('Erreur de mise à jour du profil:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la mise à jour du profil' 
        });
    }
});

// Vérifier le token (pour le frontend)
router.get('/verify', authMiddleware, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// Déconnexion (gérée côté client)
router.post('/logout', authMiddleware, (req, res) => {
    res.json({
        message: 'Déconnexion réussie'
    });
});

module.exports = router;
