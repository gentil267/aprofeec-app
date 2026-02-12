const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware admin simple
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token === 'admin-token-placeholder') {
    return next();
  }
  return res.status(403).json({ message: 'Accès admin requis' });
};

// Routes admin
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({
      message: 'Dashboard Admin',
      stats: { totalUsers, activeCourses: 24, pendingProjects: 12 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé', user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur création' });
  }
});

router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur mis à jour', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour' });
  }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression' });
  }
});

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers, activeToday: 42, systemStatus: 'online' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur statistiques' });
  }
});

router.get('/partners', requireAdmin, (req, res) => {
  res.json([
    { id: 1, name: 'Partenaire 1' },
    { id: 2, name: 'Partenaire 2' },
    { id: 3, name: 'Partenaire 3' }
  ]);
});

router.get('/opportunities', requireAdmin, (req, res) => {
  res.json({
    stages: [{ id: 1, title: 'Stage Développeur Web' }],
    emplois: [{ id: 1, title: 'Développeur Fullstack' }],
    entrepreneuriat: [{ id: 1, title: 'Projet E-commerce' }]
  });
});

router.get('/announcements', requireAdmin, (req, res) => {
  res.json([
    { id: 1, title: 'Nouveau cours disponible' },
    { id: 2, title: 'Maintenance système' }
  ]);
});

module.exports = router;