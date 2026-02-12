const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Informations de base
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'mentor', 'learner', 'guest'],
        default: 'learner'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: 'pending'
    },
    
    // Informations personnelles
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '/images/avatars/default.png'
    },
    bio: {
        type: String,
        maxlength: 500
    },
    
    // Informations spécifiques aux rôles
    specialization: { // Pour mentors
        type: String
    },
    experienceYears: { // Pour mentors
        type: Number,
        default: 0
    },
    educationLevel: { // Pour apprenants
        type: String
    },
    currentOccupation: { // Pour apprenants
        type: String
    },
    
    // Adresse
    address: {
        city: String,
        country: String,
        fullAddress: String
    },
    
    // Réseaux sociaux
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String
    },
    
    // Métadonnées
    invitationCode: String,
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    
    // Statistiques
    stats: {
        loginCount: { type: Number, default: 0 },
        lastLogin: Date,
        activeDays: { type: Number, default: 0 }
    },
    
    // Préférences
    preferences: {
        language: {
            type: String,
            default: 'fr'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    },
    
    // Dates
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
