require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// ============================================
// CONFIGURATION DE BASE
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// FIX 1: Trust proxy pour les headers X-Forwarded-For
app.set('trust proxy', 1);

// FIX 2: CORS origins simplifiés
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8080'];

// ============================================
// MIDDLEWARE FIXÉS
// ============================================

// FIX 3: Helmet config simplifiée
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...corsOrigins],
    }
  } : false,
}));

// FIX 4: CORS config simplifiée
app.use(cors({
  origin: corsOrigins,
  credentials: process.env.CORS_CREDENTIALS === 'true' || false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// FIX 5: Rate Limiter UNIQUE (pas créé à chaque requête)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // plus permissif en développement
  message: {
    error: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.',
    mobileFriendly: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Désactiver validation proxy
  skip: (req) => {
    // Ne pas limiter les checks de santé
    return req.path === '/health' || 
           req.path === '/api/status' || 
           req.path === '/favicon.ico';
  }
});

// Appliquer le rate limiter seulement en production ou si configuré
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  app.use('/api/', limiter);
  app.use('/auth/', limiter);
}

// FIX 6: Compression simplifiée
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// FIX 7: Logging simplifié
app.use(morgan(isProduction ? 'combined' : 'dev'));

// FIX 8: Body parser avec limites raisonnables
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// CONNEXION MONGODB FIXÉE
// ============================================
// FIX 9: MongoDB sans options obsolètes
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aprofeec';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    
    if (isProduction) {
      console.log('⚠️  Mode sans base de données - certaines fonctionnalités seront limitées');
    }
  });

// ============================================
// DÉTECTION D'APPAREIL MOBILE
// ============================================
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  req.isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  req.isTablet = /tablet|ipad/i.test(userAgent.toLowerCase());
  req.isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  req.isAndroid = /android/i.test(userAgent.toLowerCase());
  
  // Optimisations pour mobile
  if (req.isMobile) {
    // Cache plus court pour mobile
    res.set('Cache-Control', 'public, max-age=3600');
  }
  
  next();
});

// ============================================
// FICHIERS STATIQUES
// ============================================
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProduction ? '1d' : '0',
  setHeaders: (res, filePath) => {
    // Cache long pour les assets
    if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Pas de cache pour les pages HTML
    if (filePath.match(/\.html$/)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ============================================
// ROUTES API SIMULÉES (pour développement)
// ============================================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      mobileOptimized: true,
      pwa: true,
      authentication: true,
      chat: true,
      dashboard: true
    },
    limits: {
      rateLimit: isProduction ? '100 req/15min' : 'unlimited',
      maxFileSize: '10MB'
    }
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// API d'authentification simulée
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulation simple
  if (email && password) {
    res.json({
      success: true,
      token: 'simulated-jwt-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Utilisateur Test',
        email: email,
        role: 'apprenant',
        avatar: '/images/avatars/default.png'
      }
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Email et mot de passe requis' 
    });
  }
});

// API de chat simulée
app.get('/api/chat/messages', (req, res) => {
  res.json({
    messages: [
      { id: 1, sender: 'Mentor', text: 'Bonjour, comment allez-vous ?', time: '10:30' },
      { id: 2, sender: 'Vous', text: 'Je vais bien, merci !', time: '10:32' }
    ]
  });
});

// ============================================
// ROUTES PAGES (SPA)
// ============================================
// Liste des pages HTML disponibles
const htmlPages = [
  { route: '/', file: 'index.html' },
  { route: '/login', file: 'login.html' },
  { route: '/register', file: 'register.html' },
  { route: '/dashboard', file: 'dashboard.html' },
  { route: '/apprenant-space', file: 'apprenant-space.html' },
  { route: '/mentor-space', file: 'mentor-space.html' },
  { route: '/admin-panel', file: 'admin-panel.html' },
  { route: '/chat', file: 'chat.html' },
  { route: '/setting', file: 'setting.html' },
  { route: '/forgot-password', file: 'forgot-password.html' },
  { route: '/profile', file: 'profile.html' }
];

// Servir chaque page HTML
htmlPages.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    const filePath = path.join(__dirname, 'public', file);
    
    if (fs.existsSync(filePath)) {
      // Optimisation pour mobile : ajouter des classes CSS
      if (req.isMobile) {
        // Vous pourriez lire le fichier et modifier, mais pour l'instant on sert tel quel
        res.sendFile(filePath);
      } else {
        res.sendFile(filePath);
      }
    } else {
      // Fallback vers index.html pour SPA
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// ============================================
// MANIFEST PWA
// ============================================
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'APROFEEC',
    short_name: 'APROFEEC',
    description: 'Plateforme éducative mobile-first',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e90ff',
    icons: [
      {
        src: '/images/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png'
      },
      {
        src: '/images/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/images/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  });
});

// Service Worker
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'service-worker.js'), {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
});

// ============================================
// ROUTE CATCH-ALL POUR SPA
// ============================================
app.get('*', (req, res) => {
  // Si c'est une route API non trouvée
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found', 
      path: req.path 
    });
  }
  
  // Sinon, servir l'application SPA
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// GESTION DES ERREURS
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  
  const status = err.status || 500;
  const message = isProduction ? 'Une erreur est survenue' : err.message;
  
  res.status(status).json({
    error: message,
    mobileFriendly: true,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { 
      stack: err.stack,
      path: req.path 
    })
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`
    🚀 APROFEEC SERVER - TOUT EST FIXÉ!
    ===================================
    📍 URL: http://${HOST}:${PORT}
    🌍 Environnement: ${process.env.NODE_ENV || 'development'}
    📱 Mobile support: ✅
    🔐 CORS: ${corsOrigins.join(', ')}
    🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connecté' : '⚠️  Non connecté'}
    ⚡ Compression: ✅
    🛡️  Rate Limiting: ${process.env.RATE_LIMIT_ENABLED !== 'false' ? '✅ Activé' : '❌ Désactivé'}
    
    📋 Points d'accès:
    - Application: http://${HOST}:${PORT}
    - Dashboard: http://${HOST}:${PORT}/dashboard
    - Chat: http://${HOST}:${PORT}/chat
    - API Status: http://${HOST}:${PORT}/api/status
    - Health Check: http://${HOST}:${PORT}/health
    - PWA Manifest: http://${HOST}:${PORT}/manifest.json
    
    ⏰ Démarré à: ${new Date().toLocaleString()}
  `);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n\n👋 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// Export pour les tests
module.exports = { app, server };