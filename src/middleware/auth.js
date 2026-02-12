const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Récupérer le token du header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Accès non autorisé. Token manquant.' 
            });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Trouver l'utilisateur
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Utilisateur non trouvé' 
            });
        }

        // Vérifier si le compte est actif
        if (user.status !== 'active') {
            return res.status(403).json({ 
                error: 'Compte non activé ou suspendu' 
            });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token invalide' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expiré' 
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur interne du serveur' 
        });
    }
};

const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Non authentifié' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Permissions insuffisantes' 
            });
        }

        next();
    };
};

module.exports = { authMiddleware, roleCheck };
