// notifications.js - Système de notifications (version light)
window.showNotification = function(message, type = 'info') {
    // Simple alert si pas de temps pour plus
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Fallback simple
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position:fixed; top:20px; right:20px;
        background:${type === 'error' ? '#dc3545' : 
                   type === 'success' ? '#28a745' : 
                   type === 'warning' ? '#fd7e14' : '#17a2b8'};
        color:white; padding:10px 15px; border-radius:5px;
        z-index:9999; font-size:14px;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
};