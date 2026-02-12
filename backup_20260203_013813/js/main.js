// APROFEEC Main Application
console.log('APROFEEC App loaded');

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const role = document.getElementById('role').value;
            
            if (role === 'admin') {
                window.location.href = 'admin-panel.html';
            } else if (role === 'mentor') {
                window.location.href = 'mentor-space.html';
            } else if (role === 'apprenant') {
                window.location.href = 'apprenant-space.html';
            }
        });
    }
});
