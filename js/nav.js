// Barra de navegación compartida entre todas las secciones de la plataforma.
// Permite ir de cualquier sección a cualquier otra. Se inyecta sola al cargar.

(function () {
    const HOME_SVG = `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>`;

    const SECTIONS = [
        { file: 'index.html',             label: 'Home',              svg: HOME_SVG },
        { file: 'team-builder.html',      label: 'Team Builder',      icon: '../assets/images/Icons/menuPokemon.png' },
        { file: 'pokedex.html',           label: 'Pokédex',           icon: '../assets/images/Icons/menuPokedex.png' },
        { file: 'type-calculator.html',   label: 'Type Chart',        icon: '../assets/images/Icons/menuOptions.png' },
        { file: 'damage-calculator.html', label: 'Damage Calculator', icon: '../assets/images/Icons/menuPokegear.png' }
    ];

    // Nombre del archivo actual (p. ej. "pokedex.html").
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    function buildNav() {
        if (document.querySelector('.app-nav')) return;

        const nav = document.createElement('nav');
        nav.className = 'app-nav';

        const inner = document.createElement('div');
        inner.className = 'app-nav-inner';

        SECTIONS.forEach(section => {
            const link = document.createElement('a');
            link.href = section.file;
            link.className = 'app-nav-link' + (section.file === current ? ' active' : '');
            const iconHtml = section.svg
                ? section.svg
                : `<img src="${section.icon}" alt="" class="app-nav-icon">`;
            link.innerHTML = `${iconHtml}<span>${section.label}</span>`;
            if (section.file === current) link.setAttribute('aria-current', 'page');
            inner.appendChild(link);
        });

        nav.appendChild(inner);
        document.body.insertBefore(nav, document.body.firstChild);
        document.body.classList.add('has-app-nav');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildNav);
    } else {
        buildNav();
    }
})();
