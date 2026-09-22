// Footer compartido con copyright y atribución. Se inyecta al final del body
// en todas las páginas (proyecto open source, licencia MIT).

(function () {
    const AUTHOR = 'VaanyaHairul';
    const REPO_URL = 'https://github.com/VaanyaHairul';

    function buildFooter() {
        if (document.querySelector('.app-footer')) return;

        const year = new Date().getFullYear();
        const footer = document.createElement('footer');
        footer.className = 'app-footer';
        footer.innerHTML = `
            <div class="app-footer-inner">
                <span>© ${year} <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">${AUTHOR}</a></span>
                <span class="app-footer-sep">·</span>
                <span>Código bajo licencia <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT</a> · Open source</span>
                <span class="app-footer-sep">·</span>
                <span>Datos de <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a>. Pokémon © Nintendo / Game Freak.</span>
            </div>
        `;
        document.body.appendChild(footer);
        document.body.classList.add('has-app-footer');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildFooter);
    } else {
        buildFooter();
    }
})();
