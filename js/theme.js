// Gestión del tema (claro/oscuro) y el cielo nocturno con estrellas.
// Compartido por todas las páginas. Reemplaza a los toggleTheme() inline.

function generateStars() {
    const container = document.getElementById('night-stars');
    if (!container || container.childElementCount > 0) return;

    const count = 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        const size = Math.random() * 2 + 1; // 1-3px
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        // Concentrar estrellas en la mitad superior (cielo).
        star.style.top = Math.random() * 70 + '%';
        star.style.setProperty('--twinkle-dur', (Math.random() * 3 + 2).toFixed(2) + 's');
        star.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
        frag.appendChild(star);
    }
    container.appendChild(frag);
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Aplicar tema guardado y generar estrellas al cargar.
(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generateStars);
    } else {
        generateStars();
    }
})();
