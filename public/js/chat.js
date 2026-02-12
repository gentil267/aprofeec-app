/**
 * APROFEEC - Système de Chat
 * Communication en temps réel entre utilisateurs
 * Version: 2.0.0 - Intégré avec APROFEECAuth
 */

class ChatSystem {
    constructor() {
        this.socket = null;
        this.messages = [];
        this.currentUser = null;
        this.currentChat = null;
        this.usersOnline = new Map();
        this.emojiPickerActive = false;
        
        this.initialize();
    }
    
    /**
     * Initialisation du système de chat
     */
    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.setupEventListeners();
            this.loadChatHistory();
            this.updateOnlineStatus(true);
            
            // Connecter WebSocket
            this.connectWebSocket();
        });
    }
    
    /**
     * Charger les données utilisateur depuis APROFEECAuth
     */
    loadUserData() {
        const userData = JSON.parse(localStorage.getItem('aprofeec_user_data') || '{}');
        this.currentUser = {
            id: userData.id || 1,
            name: userData.name || 'Utilisateur',
            role: userData.role || 'user',
            avatar: userData.avatar || '/images/avatars/default.png'
        };
        
        // Mettre à jour l'interface utilisateur
        this.updateUserInterface();
    }
    
    /**
     * Mettre à jour l'interface utilisateur
     */
    updateUserInterface() {
        // Mettre à jour le nom d'utilisateur
        document.querySelectorAll('.chat-username').forEach(element => {
            element.textContent = this.currentUser.name;
        });
        
        // Mettre à jour l'avatar
        document.querySelectorAll('.chat-user-avatar').forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = this.currentUser.avatar;
                img.alt = this.currentUser.name;
            }
        });
        
        // Mettre à jour le statut
        this.updateStatusIndicator();
    }
    
    /**
     * Configurer les écouteurs d'événements
     */
    setupEventListeners() {
        // Envoi de message
        const sendBtn = document.getElementById('sendMessage');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Sélection de chat
        document.querySelectorAll('.chat-user').forEach(user => {
            user.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-user-id');
                this.selectChat(userId);
            });
        });
        
        // Filtre de recherche
        const searchInput = document.getElementById('chatSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterChats(e.target.value);
            });
        }
        
        // Options de chat
        document.querySelectorAll('.chat-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleChatAction(action);
            });
        });
        
        // Gestion des fichiers
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }
        
        // Bouton d'attachement
        const attachBtn = document.getElementById('attachFile');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }
        
        // Émojis
        const emojiBtn = document.getElementById('emojiPicker');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }
        
        // Mettre à jour le statut
        const statusSelect = document.getElementById('statusSelect');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.updateOnlineStatus(true, e.target.value);
            });
        }
        
        // Fermer le picker d'émojis en cliquant ailleurs
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emojiPickerContainer');
            if (emojiPicker && !emojiPicker.contains(e.target) && 
                e.target.id !== 'emojiPicker') {
                emojiPicker.style.display = 'none';
            }
        });
    }
    
    /**
     * Charger l'historique des chats
     */
    loadChatHistory() {
        // Charger depuis localStorage ou API
        const savedChats = localStorage.getItem('aprofeec_chat_history');
        let chatHistory;
        
        if (savedChats) {
            chatHistory = JSON.parse(savedChats);
        } else {
            // Simulation de l'historique
            chatHistory = [
                {
                    id: 1,
                    userId: 2,
                    userName: 'Mentor Jean',
                    userAvatar: '/images/avatars/mentor1.jpg',
                    lastMessage: 'Bonjour, comment avance votre projet ?',
                    timestamp: '10:30',
                    unread: 2,
                    online: true,
                    role: 'mentor'
                },
                {
                    id: 2,
                    userId: 3,
                    userName: 'Apprenante Marie',
                    userAvatar: '/images/avatars/student1.jpg',
                    lastMessage: 'J\'ai terminé le cours de développement',
                    timestamp: 'Hier',
                    unread: 0,
                    online: false,
                    role: 'learner'
                },
                {
                    id: 3,
                    userId: 4,
                    userName: 'Administrateur',
                    userAvatar: '/images/avatars/admin.jpg',
                    lastMessage: 'Nouvelle annonce publiée',
                    timestamp: 'Lundi',
                    unread: 1,
                    online: true,
                    role: 'admin'
                }
            ];
        }
        
        this.renderChatList(chatHistory);
        
        // Charger les messages du premier chat
        if (chatHistory.length > 0) {
            this.selectChat(chatHistory[0].userId);
        }
    }
    
    /**
     * Afficher la liste des chats
     */
    renderChatList(chats) {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-user ${chat.unread > 0 ? 'unread' : ''} ${chat.role || ''}`;
            chatItem.setAttribute('data-user-id', chat.userId);
            chatItem.innerHTML = `
                <div class="chat-user-avatar">
                    <img src="${chat.userAvatar}" alt="${chat.userName}" 
                         onerror="this.src='/images/avatars/default.png'">
                    ${chat.online ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="chat-user-info">
                    <div class="chat-user-name">${chat.userName}</div>
                    <div class="chat-last-message">${chat.lastMessage}</div>
                </div>
                <div class="chat-user-meta">
                    <div class="chat-time">${chat.timestamp}</div>
                    ${chat.unread > 0 ? `<div class="chat-unread">${chat.unread}</div>` : ''}
                </div>
            `;
            chatList.appendChild(chatItem);
        });
    }
    
    /**
     * Sélectionner un chat
     */
    selectChat(userId) {
        this.currentChat = userId;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.chat-user').forEach(user => {
            user.classList.remove('active');
            if (user.getAttribute('data-user-id') === userId.toString()) {
                user.classList.add('active');
                
                // Mettre à jour le header
                const userName = user.querySelector('.chat-user-name').textContent;
                const userAvatar = user.querySelector('img').src;
                this.updateChatHeader(userName, userAvatar);
            }
        });
        
        // Charger les messages du chat sélectionné
        this.loadChatMessages(userId);
        
        // Marquer comme lu
        this.markAsRead(userId);
        
        // Notifier
        if (window.APROFEECAuth) {
            APROFEECAuth.showNotification(`Chat ouvert avec ${this.getUserName(userId)}`, 'info');
        }
    }
    
    /**
     * Mettre à jour l'en-tête du chat
     */
    updateChatHeader(userName, userAvatar) {
        const header = document.querySelector('.chat-main-header .chat-user-info');
        if (header) {
            header.innerHTML = `
                <img class="chat-user-avatar" src="${userAvatar}" alt="${userName}">
                <div class="chat-user-details">
                    <div class="chat-username">${userName}</div>
                    <div class="status-indicator"></div>
                </div>
            `;
        }
    }
    
    /**
     * Obtenir le nom d'un utilisateur par ID
     */
    getUserName(userId) {
        const users = {
            2: 'Mentor Jean',
            3: 'Apprenante Marie',
            4: 'Administrateur'
        };
        return users[userId] || 'Utilisateur';
    }
    
    /**
     * Charger les messages d'un chat
     */
    loadChatMessages(userId) {
        // Charger depuis localStorage
        const key = `chat_messages_${userId}`;
        let messages = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (messages.length === 0) {
            // Messages par défaut
            messages = [
                {
                    id: 1,
                    senderId: userId,
                    senderName: this.getUserName(userId),
                    content: 'Bonjour, comment puis-je vous aider aujourd\'hui ?',
                    timestamp: '10:30',
                    type: 'received',
                    status: 'read'
                },
                {
                    id: 2,
                    senderId: this.currentUser.id,
                    senderName: this.currentUser.name,
                    content: 'J\'ai une question concernant mon projet',
                    timestamp: '10:32',
                    type: 'sent',
                    status: 'read'
                }
            ];
        }
        
        this.renderMessages(messages);
    }
    
    /**
     * Afficher les messages
     */
    renderMessages(messages) {
        const chatWindow = document.getElementById('chatWindow');
        if (!chatWindow) return;
        
        chatWindow.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatWindow.appendChild(messageElement);
        });
        
        // Faire défiler vers le bas
        this.scrollToBottom();
    }
    
    /**
     * Créer un élément de message
     */
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message.type === 'received' ? `
                    <div class="message-sender">${message.senderName}</div>
                ` : ''}
                <div class="message-text">${this.formatMessageContent(message.content)}</div>
                <div class="message-meta">
                    <span class="message-time">${message.timestamp}</span>
                    ${message.type === 'sent' ? `
                        <span class="message-status">
                            <i class="fas fa-${message.status === 'read' ? 'check-double' : 'check'}"></i>
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
        return messageDiv;
    }
    
    /**
     * Formater le contenu du message
     */
    formatMessageContent(content) {
        // Convertir les URLs en liens
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, url => 
            `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
        );
        
        // Convertir les retours à la ligne
        content = content.replace(/\n/g, '<br>');
        
        // Détecter les émojis
        const emojiRegex = /:[a-z_]+:/g;
        content = content.replace(emojiRegex, match => 
            `<span class="emoji">${match}</span>`
        );
        
        return content;
    }
    
    /**
     * Envoyer un message
     */
    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (!content) return;
        
        // Créer le message
        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            content: content,
            timestamp: this.getCurrentTime(),
            type: 'sent',
            status: 'sending',
            chatId: this.currentChat
        };
        
        // Ajouter à l'interface
        this.addMessage(message);
        
        // Sauvegarder localement
        this.saveMessageLocally(message);
        
        // Envoyer via WebSocket
        this.sendWebSocketMessage({
            type: 'message',
            data: message
        });
        
        // Mettre à jour le statut
        setTimeout(() => {
            this.updateMessageStatus(message.id, 'sent');
        }, 500);
        
        // Réinitialiser l'input
        input.value = '';
        input.focus();
    }
    
    /**
     * Ajouter un message à l'interface
     */
    addMessage(message) {
        const chatWindow = document.getElementById('chatWindow');
        if (!chatWindow) return;
        
        const messageElement = this.createMessageElement(message);
        chatWindow.appendChild(messageElement);
        
        // Faire défiler vers le bas
        this.scrollToBottom();
        
        // Sauvegarder dans l'historique
        this.messages.push(message);
    }
    
    /**
     * Sauvegarder les messages en local
     */
    saveMessageLocally(message) {
        const key = `chat_messages_${message.chatId || 'global'}`;
        let messages = JSON.parse(localStorage.getItem(key) || '[]');
        messages.push(message);
        localStorage.setItem(key, JSON.stringify(messages.slice(-100))); // Garder les 100 derniers
    }
    
    /**
     * Mettre à jour le statut d'un message
     */
    updateMessageStatus(messageId, status) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.status = status;
            
            // Mettre à jour l'interface
            const messageElements = document.querySelectorAll('.chat-message');
            messageElements.forEach(element => {
                const statusIcon = element.querySelector('.message-status i');
                if (statusIcon) {
                    statusIcon.className = `fas fa-${status === 'read' ? 'check-double' : 'check'}`;
                }
            });
        }
    }
    
    /**
     * Obtenir l'heure actuelle formatée
     */
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    /**
     * Faire défiler vers le bas
     */
    scrollToBottom() {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }
    
    /**
     * Filtrer les chats
     */
    filterChats(searchTerm) {
        const chatUsers = document.querySelectorAll('.chat-user');
        
        chatUsers.forEach(user => {
            const userName = user.querySelector('.chat-user-name').textContent.toLowerCase();
            if (userName.includes(searchTerm.toLowerCase())) {
                user.style.display = 'flex';
            } else {
                user.style.display = 'none';
            }
        });
    }
    
    /**
     * Gérer les actions de chat
     */
    handleChatAction(action) {
        switch (action) {
            case 'clear':
                this.clearChat();
                break;
            case 'archive':
                this.archiveChat();
                break;
            case 'block':
                this.blockUser();
                break;
            case 'report':
                this.reportUser();
                break;
            case 'delete':
                this.deleteChat();
                break;
            default:
                console.log('Action non reconnue:', action);
        }
    }
    
    /**
     * Effacer le chat
     */
    clearChat() {
        if (confirm('Êtes-vous sûr de vouloir effacer l\'historique de cette conversation ?')) {
            const chatWindow = document.getElementById('chatWindow');
            if (chatWindow) {
                chatWindow.innerHTML = '';
                localStorage.removeItem(`chat_messages_${this.currentChat}`);
                if (window.APROFEECAuth) {
                    APROFEECAuth.showNotification('Conversation effacée', 'success');
                }
            }
        }
    }
    
    /**
     * Archiver le chat
     */
    archiveChat() {
        if (window.APROFEECAuth) {
            APROFEECAuth.showNotification('Conversation archivée', 'success');
        }
    }
    
    /**
     * Bloquer un utilisateur
     */
    blockUser() {
        if (confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) {
            if (window.APROFEECAuth) {
                APROFEECAuth.showNotification('Utilisateur bloqué', 'success');
            }
        }
    }
    
    /**
     * Signaler un utilisateur
     */
    reportUser() {
        const reason = prompt('Veuillez indiquer la raison du signalement :');
        if (reason) {
            if (window.APROFEECAuth) {
                APROFEECAuth.showNotification('Signalement envoyé', 'success');
            }
        }
    }
    
    /**
     * Supprimer le chat
     */
    deleteChat() {
        if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cette conversation ?')) {
            this.clearChat();
            if (window.APROFEECAuth) {
                APROFEECAuth.showNotification('Conversation supprimée', 'success');
            }
        }
    }
    
    /**
     * Gérer l'upload de fichier
     */
    handleFileUpload(file) {
        if (!file) return;
        
        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            if (window.APROFEECAuth) {
                APROFEECAuth.showNotification('Le fichier est trop volumineux (max 10MB)', 'error');
            }
            return;
        }
        
        // Types de fichiers autorisés
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            if (window.APROFEECAuth) {
                APROFEECAuth.showNotification('Type de fichier non supporté', 'error');
            }
            return;
        }
        
        // Créer le message de fichier
        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            content: `📎 <strong>${file.name}</strong> (${this.formatFileSize(file.size)})`,
            timestamp: this.getCurrentTime(),
            type: 'sent',
            status: 'sent',
            file: file.name,
            fileSize: file.size,
            fileType: file.type
        };
        
        this.addMessage(message);
        this.saveMessageLocally(message);
        
        if (window.APROFEECAuth) {
            APROFEECAuth.showNotification('Fichier envoyé', 'success');
        }
    }
    
    /**
     * Formater la taille du fichier
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Basculer le sélecteur d'émojis
     */
    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPickerContainer');
        if (picker) {
            this.emojiPickerActive = !this.emojiPickerActive;
            picker.style.display = this.emojiPickerActive ? 'block' : 'none';
            
            if (this.emojiPickerActive && !picker.innerHTML) {
                this.loadEmojiPicker();
            }
        }
    }
    
    /**
     * Charger les émojis
     */
    loadEmojiPicker() {
        const picker = document.getElementById('emojiPickerContainer');
        if (!picker) return;
        
        const emojis = ['😀', '😂', '😊', '😍', '😎', '👍', '👏', '🎉', '🔥', '💯'];
        
        picker.innerHTML = `
            <div class="emoji-grid">
                ${emojis.map(emoji => `
                    <button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>
                `).join('')}
            </div>
        `;
        
        // Ajouter les événements
        picker.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.target.getAttribute('data-emoji');
                const input = document.getElementById('messageInput');
                input.value += emoji;
                input.focus();
                picker.style.display = 'none';
            });
        });
    }
    
    /**
     * Mettre à jour le statut en ligne
     */
    updateOnlineStatus(online, status = 'online') {
        this.usersOnline.set(this.currentUser.id, { online, status });
        this.updateStatusIndicator();
    }
    
    /**
     * Mettre à jour l'indicateur de statut
     */
    updateStatusIndicator() {
        document.querySelectorAll('.status-indicator').forEach(indicator => {
            const status = this.usersOnline.get(this.currentUser.id)?.status || 'online';
            indicator.className = `status-indicator status-${status}`;
            indicator.title = status === 'online' ? 'En ligne' :
                            status === 'away' ? 'Absent' :
                            status === 'busy' ? 'Occupé' : 'Hors ligne';
        });
    }
    
    /**
     * Marquer les messages comme lus
     */
    markAsRead(userId) {
        document.querySelectorAll('.chat-user').forEach(user => {
            if (user.getAttribute('data-user-id') === userId.toString()) {
                const unreadBadge = user.querySelector('.chat-unread');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
                user.classList.remove('unread');
            }
        });
    }
    
    /**
     * Connexion WebSocket
     */
    connectWebSocket() {
        // Simulation pour le moment
        console.log('WebSocket: Mode simulation activé');
        this.simulateWebSocket();
    }
    
    /**
     * Envoyer un message WebSocket
     */
    sendWebSocketMessage(data) {
        // Simulation
        console.log('WebSocket (simulation):', data);
        
        // En production, utiliser :
        // if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        //     this.socket.send(JSON.stringify(data));
        // }
    }
    
    /**
     * Simuler WebSocket
     */
    simulateWebSocket() {
        // Simulation de connexion WebSocket
        setInterval(() => {
            // Simuler des utilisateurs en ligne
            const onlineUsers = [2, 4];
            document.querySelectorAll('.chat-user').forEach(user => {
                const userId = parseInt(user.getAttribute('data-user-id'));
                const onlineDot = user.querySelector('.online-dot');
                if (onlineDot) {
                    onlineDot.style.display = onlineUsers.includes(userId) ? 'block' : 'none';
                }
            });
            
            // Simuler la réception de nouveaux messages (seulement si chat ouvert)
            if (Math.random() > 0.8 && this.currentChat) {
                const newMessage = {
                    id: Date.now(),
                    senderId: this.currentChat,
                    senderName: this.getUserName(this.currentChat),
                    content: this.getRandomResponse(),
                    timestamp: this.getCurrentTime(),
                    type: 'received',
                    status: 'read',
                    chatId: this.currentChat
                };
                this.addMessage(newMessage);
                this.saveMessageLocally(newMessage);
            }
        }, 15000); // Toutes les 15 secondes
    }
    
    /**
     * Obtenir une réponse aléatoire
     */
    getRandomResponse() {
        const responses = [
            "Je comprends votre question, laissez-moi vérifier cela.",
            "Excellent travail ! Continuez comme ça.",
            "Avez-vous consulté la documentation du projet ?",
            "Je vous enverrai plus d'informations par email.",
            "C'est une excellente question, discutons-en lors de notre prochaine session.",
            "Merci pour votre retour !",
            "Je vais examiner cela et vous répondre rapidement.",
            "C'est une bonne idée, nous pourrions l'implémenter.",
            "Avez-vous des questions supplémentaires ?",
            "Très bien, passez une excellente journée !"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialiser le système de chat quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si nous sommes sur une page de chat
    if (document.getElementById('chatContainer')) {
        window.chatSystem = new ChatSystem();
        console.log('Système de chat APROFEEC initialisé');
    }
});

// Fonctions utilitaires globales
window.startChatWithUser = (userId, userName) => {
    if (window.chatSystem) {
        window.chatSystem.selectChat(userId);
    } else {
        // Rediriger vers la page de chat
        window.location.href = `/chat.html?user=${userId}&name=${encodeURIComponent(userName)}`;
    }
};

window.sendQuickMessage = (message) => {
    if (window.chatSystem) {
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = message;
            window.chatSystem.sendMessage();
        }
    }
};

// Exporter la classe pour une utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatSystem;
}