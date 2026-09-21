// Pokédx JavaScript mejorado
const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1010;

let allPokemonList = [];
let pokemonCache = new Map();
let movesCache = new Map();
let abilitiesCache = new Map();
let speciesCache = new Map();
let evolutionCache = new Map();
let selectedPokemonId = null;
let favorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
let comparisonPokemon = [];
let currentSort = 'id';
let currentSortOrder = 'asc';
let advancedFilters = {
    minBST: 0,
    maxBST: 800,
    minStat: { stat: '', value: 0 },
    maxStat: { stat: '', value: 255 },
    ability: '',
    move: ''
};

document.addEventListener('DOMContentLoaded', async function() {
    showLoading(true);
    await loadPokemonList();
    setupEventListeners();
    updateComparisonCount();
    showLoading(false);
    
    document.addEventListener('click', (e) => {
        const tooltip = document.getElementById('pokemon-quick-tooltip');
        if (tooltip && !e.target.closest('.pokemon-item')) {
            tooltip.style.display = 'none';
        }
    });
});

function setupEventListeners() {
    document.getElementById('pokemon-search').addEventListener('input', filterPokemon);
    document.getElementById('generation-filter').addEventListener('change', filterPokemon);
    document.getElementById('type-filter').addEventListener('change', filterPokemon);
    document.getElementById('sort-filter').addEventListener('change', handleSort);
    document.getElementById('favorites-toggle').addEventListener('click', toggleFavoritesView);
    document.getElementById('advanced-filters').addEventListener('click', openAdvancedFilters);
    document.getElementById('clear-comparison').addEventListener('click', clearComparison);
    setupPokemonTooltips();
}

function setupPokemonTooltips() {
    let tooltip = document.getElementById('pokemon-quick-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pokemon-quick-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.85em;
            z-index: 10000;
            display: none;
            pointer-events: none;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            max-width: 250px;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(tooltip);
    }
    
    document.addEventListener('mouseover', async (e) => {
        const pokemonItem = e.target.closest('.pokemon-item');
        if (pokemonItem && !e.target.closest('.pokemon-item-actions')) {
            const pokemonId = parseInt(pokemonItem.dataset.pokemonId);
            let pokemonData = pokemonCache.get(pokemonId);
            
            if (!pokemonData) {
                pokemonData = await fetchPokemonData(pokemonId);
            }
            
            if (pokemonData) {
                const bst = Object.values(pokemonData.stats).reduce((a, b) => a + b, 0);
                const abilities = pokemonData.abilities.map(a => 
                    capitalizeFirst(a.name.replace(/-/g, ' ')) + (a.hidden ? ' (H)' : '')
                ).join(', ');
                
                tooltip.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 6px; font-size: 1.1em;">${capitalizeFirst(pokemonData.name)}</div>
                    <div style="margin-bottom: 4px;"><strong>Height:</strong> ${pokemonData.height}m | <strong>Weight:</strong> ${pokemonData.weight}kg</div>
                    <div style="margin-bottom: 4px;"><strong>BST:</strong> ${bst}</div>
                    <div style="font-size: 0.9em; opacity: 0.9;"><strong>Abilities:</strong> ${abilities}</div>
                    <div style="margin-top: 6px; font-size: 0.8em; opacity: 0.7; font-style: italic;">Click to see full details</div>
                `;
                tooltip.style.display = 'block';
            }
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        const tooltip = document.getElementById('pokemon-quick-tooltip');
        if (tooltip && tooltip.style.display === 'block') {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.pokemon-item') && !e.relatedTarget?.closest('.pokemon-item')) {
            const tooltip = document.getElementById('pokemon-quick-tooltip');
            if (tooltip) tooltip.style.display = 'none';
        }
    });
}

async function loadPokemonList() {
    try {
        // Cargar hasta 1300 para incluir formas regionales
        const response = await fetch(`${API_BASE}/pokemon?limit=1300`);
        const data = await response.json();
        
        // Procesar todos los Pokémon incluyendo formas regionales
        allPokemonList = data.results.map((pokemon, index) => {
            // Extraer ID real de la URL
            const urlParts = pokemon.url.split('/');
            const realId = parseInt(urlParts[urlParts.length - 2]);
            
            let displayName = pokemon.name;
            
            // Detectar formas regionales y mejorar nombres
            if (pokemon.name.includes('-')) {
                const parts = pokemon.name.split('-');
                if (parts.includes('alola')) {
                    displayName = `${capitalizeFirst(parts[0])} (Alola)`;
                } else if (parts.includes('galar')) {
                    displayName = `${capitalizeFirst(parts[0])} (Galar)`;
                } else if (parts.includes('hisui')) {
                    displayName = `${capitalizeFirst(parts[0])} (Hisui)`;
                } else if (parts.includes('paldea')) {
                    displayName = `${capitalizeFirst(parts[0])} (Paldea)`;
                } else {
                    // Otras formas como mega, gigantamax, etc.
                    displayName = capitalizeFirst(pokemon.name.replace(/-/g, ' '));
                }
            } else {
                displayName = capitalizeFirst(pokemon.name);
            }
            
            return {
                ...pokemon,
                id: realId,
                displayName: displayName
            };
        }).filter(pokemon => pokemon.id <= 1300); // Limitar a un rango razonable
        
        displayPokemonList(allPokemonList);
        console.log(`Cargados ${allPokemonList.length} Pokémon (incluyendo formas regionales)`);
    } catch (error) {
        console.error('Error cargando lista de Pokémon:', error);
    }
}

async function displayPokemonList(pokemonList) {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    
    const sortedList = await sortPokemonList(pokemonList);
    
    for (const pokemon of sortedList) {
        const item = document.createElement('div');
        item.className = 'pokemon-item';
        item.dataset.pokemonId = pokemon.id;
        
        const isFavorite = favorites.includes(pokemon.id);
        const isInComparison = comparisonPokemon.includes(pokemon.id);
        
        let pokemonData = pokemonCache.get(pokemon.id);
        let typesHtml = '';
        let bstHtml = '';
        let typeGradient = 'var(--bg-white)';
        let genBadge = '';
        const staticSpriteUrl = pokemonData?.sprites?.front_default || getStaticSpriteUrl(pokemon.id);
        const spriteUrl = pokemonData ? getSpriteUrl(pokemonData) : getAnimatedSpriteUrl(pokemon.id);
        
        if (pokemonData) {
            typesHtml = pokemonData.types.map(type => 
                `<span class="type-badge type-${type}" style="font-size: 0.6em; padding: 1px 3px;">${type}</span>`
            ).join('');
            const bst = Object.values(pokemonData.stats).reduce((a, b) => a + b, 0);
            bstHtml = `<div class="pokemon-item-bst">BST: ${bst}</div>`;
            
            typeGradient = getTypeGradient(pokemonData.types);
            genBadge = getGenerationBadgeHtml(pokemon.id, pokemon.name, 16);
            
            if (currentSort !== 'id' && currentSort !== 'name' && currentSort !== 'bst') {
                const statNames = {
                    hp: 'HP', attack: 'Atk', defense: 'Def', 
                    spAttack: 'SpA', spDefense: 'SpD', speed: 'Spe',
                    height: 'Height', weight: 'Weight'
                };
                
                let value;
                if (pokemonData.stats[currentSort]) {
                    value = pokemonData.stats[currentSort];
                } else if (currentSort === 'height') {
                    value = pokemonData.height + 'm';
                } else if (currentSort === 'weight') {
                    value = pokemonData.weight + 'kg';
                }
                
                if (value) {
                    bstHtml += `<div class="pokemon-item-stat">${statNames[currentSort]}: ${value}</div>`;
                }
            }
        }
        
        item.style.background = typeGradient;
        
        let statsHtml = '';
        if (pokemonData) {
            const topStats = [
                { label: 'HP', value: pokemonData.stats.hp },
                { label: 'Atk', value: pokemonData.stats.attack },
                { label: 'Def', value: pokemonData.stats.defense },
                { label: 'SpA', value: pokemonData.stats.spAttack },
                { label: 'SpD', value: pokemonData.stats.spDefense },
                { label: 'Spe', value: pokemonData.stats.speed }
            ].sort((a, b) => b.value - a.value).slice(0, 3);
            
            statsHtml = `<div class="pokemon-item-stats-mini">${topStats.map(s => 
                `<div class="stat-mini"><span class="stat-label">${s.label}</span> <span class="stat-val">${s.value}</span></div>`
            ).join('')}</div>`;
        }
        
        item.innerHTML = `
            <div class="pokemon-item-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${pokemon.id}, event)" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <button class="compare-btn ${isInComparison ? 'active' : ''}" onclick="addToComparison(${pokemon.id}, event)" title="${isInComparison ? 'Quitar de comparación' : 'Agregar a comparación'}">
                    ${isInComparison ? '⚖️' : '⚖️'}
                </button>
            </div>
            <img src="${spriteUrl}"
                 data-static-sprite="${staticSpriteUrl}"
                 alt="${pokemon.name}" 
                 onerror="if(this.dataset.staticSprite && this.src !== this.dataset.staticSprite){this.src=this.dataset.staticSprite;}else{this.onerror=null;}">
            <div class="pokemon-item-info">
                <div class="pokemon-item-name">${capitalizeFirst(pokemon.displayName || pokemon.name)}</div>
                <div class="pokemon-item-number">#${pokemon.id.toString().padStart(3, '0')} ${genBadge}</div>
                <div class="pokemon-item-types">${typesHtml}</div>
                ${bstHtml}
                ${statsHtml}
            </div>
        `;
        
        item.addEventListener('click', () => selectPokemon(pokemon.id));
        grid.appendChild(item);
    }
}

async function selectPokemon(pokemonId) {
    document.querySelectorAll('.pokemon-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Solo marcar como seleccionado si es un Pokémon de la lista principal
    if (typeof pokemonId === 'number') {
        const item = document.querySelector(`[data-pokemon-id="${pokemonId}"]`);
        if (item) item.classList.add('selected');
    }
    
    selectedPokemonId = pokemonId;
    
    showLoading(true);
    await displayPokemonDetails(pokemonId);
    showLoading(false);
}

async function displayPokemonDetails(pokemonId) {
    const pokemon = await fetchPokemonData(pokemonId);
    if (!pokemon) return;
    
    const detailsContainer = document.getElementById('pokemon-info');
    
    const genBadgeHtml = getGenerationBadgeHtml(pokemon.id, pokemon.name, 22);
    const displayName = pokemon.isMega ? 
        `${capitalizeFirst(pokemon.name.split('-')[0])} (${pokemon.name.includes('-x') ? 'Mega X' : pokemon.name.includes('-y') ? 'Mega Y' : 'Mega'})` : 
        capitalizeFirst(pokemon.name);
    
    detailsContainer.innerHTML = `
        <div class="pokemon-detail-content">
            <div class="pokemon-header" style="background: ${getTypeGradient(pokemon.types)}; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div class="pokemon-sprites">
                    <img src="${getSpriteUrl(pokemon, 'front_default')}" ${getSpriteFallbackAttributes(pokemon, 'front_default')} alt="${pokemon.name}" class="pokemon-sprite">
                    ${pokemon.sprites.front_shiny ? `<img src="${getSpriteUrl(pokemon, 'front_shiny')}" ${getSpriteFallbackAttributes(pokemon, 'front_shiny')} alt="${pokemon.name} shiny" class="pokemon-sprite">` : ''}
                </div>
                <div class="pokemon-basic-info">
                    <h1 style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${displayName}${pokemon.isMega ? ' ⚡' : ''}</h1>
                    <div class="pokemon-number" style="color: white; display: flex; align-items: center; gap: 8px;">#${pokemon.id.toString().padStart(3, '0')} ${genBadgeHtml}</div>
                    <div class="pokemon-types">
                        ${pokemon.types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                    </div>
                    <div class="pokemon-physical" style="color: white;">
                        <span><strong>Altura:</strong> ${pokemon.height}m</span>
                        <span><strong>Peso:</strong> ${pokemon.weight}kg</span>
                        <span><strong>BST:</strong> ${Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0)}</span>
                    </div>
                    ${pokemon.habitat ? `<div style="margin-top: 10px; font-size: 0.9em; color: white;"><strong>Hábitat:</strong> ${capitalizeFirst(pokemon.habitat.replace(/-/g, ' '))}</div>` : ''}
                    ${pokemon.flavorText ? `<div style="margin-top: 10px; font-size: 0.9em; color: white; font-style: italic; max-width: 400px; line-height: 1.4; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">${pokemon.flavorText}</div>` : ''}
                    <div style="margin-top: 15px;">
                        <button onclick="copyPokemonToTeamBuilder(${pokemon.id})" style="background: #48bb78; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9em; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: all 0.2s ease;" onmouseover="this.style.background='#38a169'" onmouseout="this.style.background='#48bb78'">
                            ➕ Agregar al Team Builder
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="info-sections">
                <div class="info-section">
                    <h3>Estadísticas Base</h3>
                    <div class="stats-grid">
                        ${(() => {
                            const stats = {
                                'HP': { value: pokemon.stats.hp, key: 'hp', class: 'hp' },
                                'Ataque': { value: pokemon.stats.attack, key: 'attack', class: 'attack' },
                                'Defensa': { value: pokemon.stats.defense, key: 'defense', class: 'defense' },
                                'Atq. Esp.': { value: pokemon.stats.spAttack, key: 'spAttack', class: 'special-attack' },
                                'Def. Esp.': { value: pokemon.stats.spDefense, key: 'spDefense', class: 'special-defense' },
                                'Velocidad': { value: pokemon.stats.speed, key: 'speed', class: 'speed' }
                            };
                            const values = Object.values(stats).map(s => s.value);
                            const min = Math.min(...values);
                            const max = Math.max(...values);
                            const range = max - min;
                            
                            return Object.entries(stats).map(([name, {value, key, class: statClass}]) => {
                                const opacity = range > 0 ? 0.3 + ((value - min) / range) * 0.7 : 1;
                                const fontSize = range > 0 ? 0.9 + ((value - min) / range) * 0.3 : 1;
                                return `
                                    <div class="stat-row">
                                        <span class="stat-name">${name}</span>
                                        <div class="stat-bar">
                                            <div class="stat-fill stat-${statClass}" style="width: ${Math.min((value / 200) * 100, 100)}%; opacity: ${opacity}"></div>
                                        </div>
                                        <span class="stat-value" style="font-size: ${fontSize}em; opacity: ${opacity}; font-weight: ${value === max ? 'bold' : 'normal'}; color: ${value === max ? '#48bb78' : 'inherit'}">${value}</span>
                                    </div>
                                `;
                            }).join('');
                        })()}
                    </div>
                    <div style="margin-top: 15px; text-align: center; font-weight: bold; font-size: 1.1em; padding: 8px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                        BST Total: ${Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0)}
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Habilidades</h3>
                    <div class="abilities-list" id="abilities-${pokemon.id}">
                        <!-- Las habilidades se cargarán aquí -->
                    </div>
                </div>
                
                <div class="info-section moves-section">
                    <h3>Movimientos</h3>
                    <select class="version-selector" id="version-selector">
                        <option value="auto">Automático (Última generación)</option>
                        <option value="red-blue">Rojo/Azul (Gen 1)</option>
                        <option value="gold-silver">Oro/Plata (Gen 2)</option>
                        <option value="ruby-sapphire">Rubí/Zafiro (Gen 3)</option>
                        <option value="diamond-pearl">Diamante/Perla (Gen 4)</option>
                        <option value="black-white">Negro/Blanco (Gen 5)</option>
                        <option value="x-y">X/Y (Gen 6)</option>
                        <option value="omega-ruby-alpha-sapphire">Rubí Ω/Zafiro α (Gen 6)</option>
                        <option value="sun-moon">Sol/Luna (Gen 7)</option>
                        <option value="ultra-sun-ultra-moon">Ultra Sol/Ultra Luna (Gen 7)</option>
                        <option value="sword-shield">Espada/Escudo (Gen 8)</option>
                        <option value="brilliant-diamond-shining-pearl">Diamante/Perla Brillante (Gen 8)</option>
                        <option value="scarlet-violet">Escarlata/Púrpura (Gen 9)</option>
                    </select>
                    <div class="moves-by-method" id="moves-container">
                        <!-- Los movimientos se cargarán aquí -->
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Efectividad de Tipos</h3>
                    <div class="type-effectiveness" id="type-effectiveness">
                        <!-- La efectividad se cargará aquí -->
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Comparador de Tamaños</h3>
                    <div class="size-comparison" id="size-comparison">
                        <!-- La comparación se cargará aquí -->
                    </div>
                </div>
                
                <div class="info-section evolution-section">
                    <h3>Cadena Evolutiva</h3>
                    <div class="evolution-chain" id="evolution-chain">
                        <!-- La cadena evolutiva se cargará aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadPokemonAbilities(pokemon);
    loadPokemonMoves(pokemon, 'auto');
    loadTypeEffectiveness(pokemon);
    loadSizeComparison(pokemon);
    loadEvolutionChain(pokemon);
    
    document.getElementById('version-selector').addEventListener('change', (e) => {
        loadPokemonMoves(pokemon, e.target.value);
    });
}

async function loadPokemonAbilities(pokemon) {
    const container = document.getElementById(`abilities-${pokemon.id}`);
    
    for (const ability of pokemon.abilities) {
        const abilityData = await fetchAbilityData(ability.name);
        const abilityElement = document.createElement('div');
        abilityElement.className = `ability-item ${ability.hidden ? 'hidden' : ''} ability-tooltip`;
        abilityElement.dataset.ability = ability.name;
        abilityElement.innerHTML = `
            <div class="ability-name">${capitalizeFirst(ability.name.replace(/-/g, ' '))}${ability.hidden ? ' (Oculta)' : ''}</div>
            <div class="ability-description">${abilityData?.effect || 'Descripción no disponible'}</div>
        `;
        container.appendChild(abilityElement);
    }
    
    setupAbilityTooltips();
}

async function loadPokemonMoves(pokemon, selectedVersion) {
    const container = document.getElementById('moves-container');
    container.innerHTML = '<p>Cargando movimientos...</p>';
    
    let movesToProcess = pokemon.moves;
    
    if (selectedVersion !== 'auto') {
        movesToProcess = pokemon.moves.filter(move => move.versionGroup === selectedVersion);
    } else {
        const versionPriority = ['scarlet-violet', 'brilliant-diamond-shining-pearl', 'sword-shield', 'ultra-sun-ultra-moon', 'sun-moon'];
        for (const version of versionPriority) {
            const versionMoves = pokemon.moves.filter(move => move.versionGroup === version);
            if (versionMoves.length > 0) {
                movesToProcess = versionMoves;
                break;
            }
        }
    }
    
    const movesByMethod = {
        'level-up': new Map(),
        'machine': new Set(),
        'egg': new Set(),
        'tutor': new Set()
    };
    
    movesToProcess.forEach(move => {
        const method = move.learnMethod || 'level-up';
        if (method === 'level-up') {
            const level = move.level || 1;
            if (!movesByMethod[method].has(move.name) || movesByMethod[method].get(move.name).level > level) {
                movesByMethod[method].set(move.name, { name: move.name, level });
            }
        } else if (movesByMethod[method]) {
            movesByMethod[method].add(move.name);
        }
    });
    
    let html = '';
    
    if (movesByMethod['level-up'].size > 0) {
        const levelMoves = Array.from(movesByMethod['level-up'].values())
            .sort((a, b) => a.level - b.level);
        
        html += `
            <div class="move-method">
                <h4>Por Nivel (${levelMoves.length})</h4>
                <div class="moves-list">
                    ${await Promise.all(levelMoves.map(async move => {
                        const moveData = await fetchMoveData(move.name);
                        return `
                            <div class="move-item enhanced" data-move="${move.name}">
                                <div class="move-main-info">
                                    <span class="move-name">${capitalizeFirst(move.name.replace(/-/g, ' '))}</span>
                                    <span class="move-level">Nv. ${move.level}</span>
                                </div>
                                <div class="move-details">
                                    <span class="type-badge type-${moveData?.type || 'normal'}">${moveData?.type || 'normal'}</span>
                                    <span class="move-power">${moveData?.power || '-'}</span>
                                    <span class="move-accuracy">${moveData?.accuracy || '-'}%</span>
                                    ${getCategoryIconHtml(moveData?.damage_class || 'status')}
                                </div>
                            </div>
                        `;
                    })).then(results => results.join(''))}
                </div>
            </div>
        `;
    }
    
    if (movesByMethod['machine'].size > 0) {
        const machineMoves = Array.from(movesByMethod['machine']);
        html += `
            <div class="move-method">
                <h4>Por MT/MO (${machineMoves.length})</h4>
                <div class="moves-list">
                    ${await Promise.all(machineMoves.map(async move => {
                        const moveData = await fetchMoveData(move);
                        return `
                            <div class="move-item enhanced" data-move="${move}">
                                <div class="move-main-info">
                                    <span class="move-name">${capitalizeFirst(move.replace(/-/g, ' '))}</span>
                                </div>
                                <div class="move-details">
                                    <span class="type-badge type-${moveData?.type || 'normal'}">${moveData?.type || 'normal'}</span>
                                    <span class="move-power">${moveData?.power || '-'}</span>
                                    <span class="move-accuracy">${moveData?.accuracy || '-'}%</span>
                                    ${getCategoryIconHtml(moveData?.damage_class || 'status')}
                                </div>
                            </div>
                        `;
                    })).then(results => results.join(''))}
                </div>
            </div>
        `;
    }
    
    if (movesByMethod['egg'].size > 0) {
        const eggMoves = Array.from(movesByMethod['egg']);
        html += `
            <div class="move-method">
                <h4>Por Huevo (${eggMoves.length})</h4>
                <div class="moves-list">
                    ${await Promise.all(eggMoves.map(async move => {
                        const moveData = await fetchMoveData(move);
                        return `
                            <div class="move-item enhanced" data-move="${move}">
                                <div class="move-main-info">
                                    <span class="move-name">${capitalizeFirst(move.replace(/-/g, ' '))}</span>
                                </div>
                                <div class="move-details">
                                    <span class="type-badge type-${moveData?.type || 'normal'}">${moveData?.type || 'normal'}</span>
                                    <span class="move-power">${moveData?.power || '-'}</span>
                                    <span class="move-accuracy">${moveData?.accuracy || '-'}%</span>
                                    ${getCategoryIconHtml(moveData?.damage_class || 'status')}
                                </div>
                            </div>
                        `;
                    })).then(results => results.join(''))}
                </div>
            </div>
        `;
    }
    
    if (movesByMethod['tutor'].size > 0) {
        const tutorMoves = Array.from(movesByMethod['tutor']);
        html += `
            <div class="move-method">
                <h4>Por Tutor (${tutorMoves.length})</h4>
                <div class="moves-list">
                    ${await Promise.all(tutorMoves.map(async move => {
                        const moveData = await fetchMoveData(move);
                        return `
                            <div class="move-item enhanced" data-move="${move}">
                                <div class="move-main-info">
                                    <span class="move-name">${capitalizeFirst(move.replace(/-/g, ' '))}</span>
                                </div>
                                <div class="move-details">
                                    <span class="type-badge type-${moveData?.type || 'normal'}">${moveData?.type || 'normal'}</span>
                                    <span class="move-power">${moveData?.power || '-'}</span>
                                    <span class="move-accuracy">${moveData?.accuracy || '-'}%</span>
                                    ${getCategoryIconHtml(moveData?.damage_class || 'status')}
                                </div>
                            </div>
                        `;
                    })).then(results => results.join(''))}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html || '<p>No hay movimientos disponibles para esta versión.</p>';
    setupMoveTooltips();
}

function filterPokemon() {
    const searchTerm = document.getElementById('pokemon-search').value.toLowerCase();
    const generationFilter = document.getElementById('generation-filter').value;
    
    let filteredPokemon = allPokemonList;
    
    if (searchTerm) {
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            (pokemon.displayName && pokemon.displayName.toLowerCase().includes(searchTerm)) ||
            pokemon.id.toString().includes(searchTerm)
        );
    }
    
    if (generationFilter) {
        const genRanges = {
            '1': [1, 151],
            '2': [152, 251],
            '3': [252, 386],
            '4': [387, 493],
            '5': [494, 649],
            '6': [650, 721],
            '7': [722, 809],
            '8': [810, 905],
            '9': [906, 1010]
        };
        
        const [start, end] = genRanges[generationFilter];
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.id >= start && pokemon.id <= end
        );
    }
    
    displayPokemonList(filteredPokemon);
}

async function fetchPokemonData(id) {
    const cacheKey = typeof id === 'string' ? id : id.toString();
    
    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }
    
    try {
        let pokemonUrl, speciesUrl;
        
        if (typeof id === 'string') {
            // Para megaevoluciones y formas especiales
            pokemonUrl = `${API_BASE}/pokemon/${id}`;
            const baseName = id.split('-')[0];
            speciesUrl = `${API_BASE}/pokemon-species/${baseName}`;
        } else {
            pokemonUrl = `${API_BASE}/pokemon/${id}`;
            speciesUrl = `${API_BASE}/pokemon-species/${id}`;
        }
        
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(pokemonUrl),
            fetch(speciesUrl)
        ]);
        
        if (!pokemonResponse.ok) return null;
        
        const data = await pokemonResponse.json();
        const speciesData = speciesResponse.ok ? await speciesResponse.json() : null;
        
        const pokemon = {
            id: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            sprites: {
                front_default: data.sprites.front_default,
                back_default: data.sprites.back_default,
                front_shiny: data.sprites.front_shiny,
                back_shiny: data.sprites.back_shiny
            },
            // Los GIF animados solo existen para parte de la Pokédex. Cada
            // uso pasa por getSpriteUrl(), que vuelve al sprite estático si
            // esta variante no está disponible.
            animatedSprites: (() => {
                const animated = data.sprites?.versions?.['generation-v']?.['black-white']?.animated;
                if (!animated) return {};
                return {
                    front_default: animated.front_default,
                    back_default: animated.back_default,
                    front_shiny: animated.front_shiny,
                    back_shiny: animated.back_shiny
                };
            })(),
            height: data.height / 10,
            weight: data.weight / 10,
            abilities: data.abilities.map(a => ({
                name: a.ability.name,
                hidden: a.is_hidden
            })),
            stats: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                spAttack: data.stats[3].base_stat,
                spDefense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat
            },
            moves: data.moves.flatMap(m => 
                m.version_group_details.map(vgd => ({
                    name: m.move.name,
                    learnMethod: vgd.move_learn_method?.name || 'unknown',
                    level: vgd.level_learned_at || null,
                    versionGroup: vgd.version_group?.name || 'unknown'
                }))
            ),
            generation: speciesData ? getGeneration(speciesData.generation?.url) : Math.ceil(data.id / 151),
            habitat: speciesData?.habitat?.name || null,
            flavorText: speciesData ? getFlavorText(speciesData) : null,
            isMega: typeof id === 'string' && id.includes('mega')
        };
        
        pokemonCache.set(cacheKey, pokemon);
        return pokemon;
    } catch (error) {
        console.error(`Error cargando Pokémon ${id}:`, error);
        return null;
    }
}

async function fetchAbilityData(abilityName) {
    if (abilitiesCache.has(abilityName)) {
        return abilitiesCache.get(abilityName);
    }
    
    try {
        const response = await fetch(`${API_BASE}/ability/${abilityName}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const abilityData = {
            name: data.name,
            effect: data.effect_entries.find(e => e.language.name === 'en')?.effect || 'No description available'
        };
        
        abilitiesCache.set(abilityName, abilityData);
        return abilityData;
    } catch (error) {
        console.error(`Error cargando habilidad ${abilityName}:`, error);
        return null;
    }
}

function getGeneration(url) {
    if (!url) return 1;
    const match = url.match(/generation\/(\\d+)/);
    return match ? parseInt(match[1]) : 1;
}

function getFlavorText(speciesData) {
    if (!speciesData.flavor_text_entries) return null;
    
    // Buscar texto en español primero, luego inglés
    const spanishText = speciesData.flavor_text_entries.find(entry => 
        entry.language.name === 'es' && entry.version.name
    );
    
    const englishText = speciesData.flavor_text_entries.find(entry => 
        entry.language.name === 'en' && entry.version.name
    );
    
    const text = spanishText || englishText;
    return text ? text.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim() : null;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSpriteUrl(pokemon, spriteType = 'front_default') {
    const apiAnimatedSprite = pokemon.animatedSprites?.[spriteType];
    if (apiAnimatedSprite) return apiAnimatedSprite;

    // The API omits this field for some newer Pokémon even when the animated
    // file exists in the sprite repository. Each image falls back to its
    // corresponding static sprite through its onerror handler.
    if (pokemon.id) return getAnimatedSpriteUrl(pokemon.id, spriteType);

    return pokemon.sprites?.[spriteType] || '';
}

function getAnimatedSpriteUrl(pokemonId, spriteType = 'front_default') {
    const directories = {
        front_default: '',
        front_shiny: 'shiny/',
        back_default: 'back/',
        back_shiny: 'back/shiny/'
    };
    const directory = directories[spriteType];
    if (directory === undefined) return '';

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${directory}${pokemonId}.gif`;
}

function getStaticSpriteUrl(pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

function getSpriteFallbackAttributes(pokemon, spriteType = 'front_default') {
    const staticSprite = pokemon.sprites?.[spriteType] || '';
    return `data-static-sprite="${staticSprite}" onerror="if(this.dataset.staticSprite && this.src !== this.dataset.staticSprite){this.src=this.dataset.staticSprite;}else{this.onerror=null;}"`;
}

// Uses the same three-cell category spritesheet as Team Builder.
const CATEGORY_ICON_INDEX = { physical: 0, special: 1, status: 2 };

function getCategoryIconHtml(damageClass, size = 16) {
    const index = CATEGORY_ICON_INDEX[damageClass];
    if (index === undefined) return '';

    const scale = size / 28;
    const posX = -((64 - 28) / 2) * scale;
    const posY = -(index * 28 * scale);

    return `<span class="move-category" title="${damageClass}" aria-label="${damageClass}" style="display:inline-block; background-image:url('../assets/images/category.png'); background-repeat:no-repeat; background-position:${posX}px ${posY}px; background-size:${64 * scale}px ${84 * scale}px;"></span>`;
}

async function fetchMoveData(moveName) {
    if (movesCache.has(moveName)) {
        return movesCache.get(moveName);
    }
    
    try {
        const response = await fetch(`${API_BASE}/move/${moveName}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const moveData = {
            name: data.name,
            type: data.type.name,
            damage_class: data.damage_class.name,
            power: data.power,
            pp: data.pp,
            accuracy: data.accuracy,
            description: data.effect_entries.find(e => e.language.name === 'en')?.effect || 'No description available'
        };
        
        movesCache.set(moveName, moveData);
        return moveData;
    } catch (error) {
        console.error(`Error cargando movimiento ${moveName}:`, error);
        return null;
    }
}

function loadTypeEffectiveness(pokemon) {
    const container = document.getElementById('type-effectiveness');
    const typeChart = {
        normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
        fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
        water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
        electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
        grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
        ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
        fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
        poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
        ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
        flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
        psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
        bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
        rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
        ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
        dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
        dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
        steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
        fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
    };
    
    // Calcular efectividad considerando doble tipo
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    const effectiveness = {};
    
    allTypes.forEach(attackType => {
        let multiplier = 1;
        pokemon.types.forEach(defenseType => {
            const chart = typeChart[defenseType];
            if (chart) {
                if (chart.immune.includes(attackType)) multiplier *= 0;
                else if (chart.resist.includes(attackType)) multiplier *= 0.5;
                else if (chart.weak.includes(attackType)) multiplier *= 2;
            }
        });
        effectiveness[attackType] = multiplier;
    });
    
    const weaknesses4x = Object.entries(effectiveness).filter(([type, mult]) => mult === 4).map(([type]) => type);
    const weaknesses2x = Object.entries(effectiveness).filter(([type, mult]) => mult === 2).map(([type]) => type);
    const resistances05x = Object.entries(effectiveness).filter(([type, mult]) => mult === 0.5).map(([type]) => type);
    const resistances025x = Object.entries(effectiveness).filter(([type, mult]) => mult === 0.25).map(([type]) => type);
    const immunities = Object.entries(effectiveness).filter(([type, mult]) => mult === 0).map(([type]) => type);
    
    container.innerHTML = `
        ${weaknesses4x.length > 0 ? `
            <div class="effectiveness-section">
                <h4>Muy débil a (4x daño):</h4>
                <div class="type-list">
                    ${weaknesses4x.map(type => `<span class="type-badge type-${type}" style="border: 2px solid #e53e3e;">${type}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        ${weaknesses2x.length > 0 ? `
            <div class="effectiveness-section">
                <h4>Débil a (2x daño):</h4>
                <div class="type-list">
                    ${weaknesses2x.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        ${resistances05x.length > 0 ? `
            <div class="effectiveness-section">
                <h4>Resiste (0.5x daño):</h4>
                <div class="type-list">
                    ${resistances05x.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        ${resistances025x.length > 0 ? `
            <div class="effectiveness-section">
                <h4>Muy resistente a (0.25x daño):</h4>
                <div class="type-list">
                    ${resistances025x.map(type => `<span class="type-badge type-${type}" style="border: 2px solid #38a169;">${type}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        ${immunities.length > 0 ? `
            <div class="effectiveness-section">
                <h4>Inmune a (0x daño):</h4>
                <div class="type-list">
                    ${immunities.map(type => `<span class="type-badge type-${type}" style="opacity: 0.7; border: 2px solid #333;">${type}</span>`).join('')}
                </div>
            </div>
        ` : ''}
        ${weaknesses4x.length === 0 && weaknesses2x.length === 0 && resistances05x.length === 0 && resistances025x.length === 0 && immunities.length === 0 ? '<p>Efectividad neutral contra todos los tipos.</p>' : ''}
    `;
}

function loadSizeComparison(pokemon) {
    const container = document.getElementById('size-comparison');
    const trainerHeight = 1.75;
    const trainerWeight = 70; // kg promedio
    const maxHeight = Math.max(trainerHeight, pokemon.height);
    const scale = 150 / maxHeight;
    
    // Calcular inclinación de la balanza basada en el peso
    const weightDiff = pokemon.weight - trainerWeight;
    const maxTilt = 15; // grados máximos de inclinación
    const tiltAngle = Math.min(Math.max(weightDiff / 50 * maxTilt, -maxTilt), maxTilt);
    
    container.innerHTML = `
        <div class="visual-comparison">
            <!-- Comparación de Altura -->
            <div class="height-comparison">
                <h4>📏 Comparación de Altura</h4>
                <div class="height-visual">
                    <div class="height-item">
                        <img src="../assets/images/Trainers/ROJO1.png" alt="Entrenador" style="height: ${trainerHeight * scale}px;">
                        <div class="height-label">Entrenador<br><strong>1.75m</strong></div>
                    </div>
                    <div class="height-item ${pokemon.height > trainerHeight ? 'taller' : pokemon.height < trainerHeight ? 'shorter' : 'equal'}">
                        <img src="${getSpriteUrl(pokemon)}" ${getSpriteFallbackAttributes(pokemon)} alt="${pokemon.name}" style="height: ${pokemon.height * scale}px;">
                        <div class="height-label">${capitalizeFirst(pokemon.name)}<br><strong>${pokemon.height}m</strong></div>
                    </div>
                </div>
                <div class="height-difference">
                    ${pokemon.height > trainerHeight ? 
                        `🔺 ${(pokemon.height - trainerHeight).toFixed(2)}m más alto` : 
                        pokemon.height < trainerHeight ? 
                        `🔻 ${(trainerHeight - pokemon.height).toFixed(2)}m más bajo` : 
                        `⚖️ Misma altura`
                    }
                </div>
            </div>
            
            <!-- Comparación de Peso -->
            <div class="weight-comparison">
                <h4>⚖️ Comparación de Peso</h4>
                <div class="balance-scale">
                    <div class="scale-base"></div>
                    <div class="scale-arm" style="transform: rotate(${tiltAngle}deg);">
                        <div class="scale-plate left ${pokemon.weight < trainerWeight ? 'lighter' : ''}">
                            <img src="../assets/images/Trainers/ROJO1.png" alt="Entrenador">
                            <div class="weight-label">Entrenador<br><strong>${trainerWeight}kg</strong></div>
                        </div>
                        <div class="scale-plate right ${pokemon.weight > trainerWeight ? 'heavier' : ''}">
                            <img src="${getSpriteUrl(pokemon)}" ${getSpriteFallbackAttributes(pokemon)} alt="${pokemon.name}">
                            <div class="weight-label">${capitalizeFirst(pokemon.name)}<br><strong>${pokemon.weight}kg</strong></div>
                        </div>
                    </div>
                </div>
                <div class="weight-difference">
                    ${pokemon.weight > trainerWeight ? 
                        `🔺 ${(pokemon.weight - trainerWeight).toFixed(1)}kg más pesado` : 
                        pokemon.weight < trainerWeight ? 
                        `🔻 ${(trainerWeight - pokemon.weight).toFixed(1)}kg más liviano` : 
                        `⚖️ Mismo peso`
                    }
                </div>
            </div>
        </div>
        
        <div class="comparison-stats">
            <div class="stat-item">
                <span class="stat-icon">📏</span>
                <span><strong>Altura:</strong> ${pokemon.height}m</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">⚖️</span>
                <span><strong>Peso:</strong> ${pokemon.weight}kg</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">💪</span>
                <span><strong>BST:</strong> ${Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0)}</span>
            </div>
        </div>
    `;
}

function showLoading(show) {
    const loader = document.getElementById('loading');
    loader.style.display = show ? 'flex' : 'none';
}

// Nuevas funciones para las mejoras
function toggleFavorite(pokemonId, event) {
    event.stopPropagation();
    const index = favorites.indexOf(pokemonId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(pokemonId);
    }
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
    
    // Actualizar botón
    const btn = event.target;
    const isFavorite = favorites.includes(pokemonId);
    btn.textContent = isFavorite ? '❤️' : '🤍';
    btn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
    btn.title = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
}

function addToComparison(pokemonId, event) {
    event.stopPropagation();
    const index = comparisonPokemon.indexOf(pokemonId);
    
    if (index > -1) {
        // Remover de comparación
        comparisonPokemon.splice(index, 1);
    } else {
        // Agregar a comparación (máximo 4)
        if (comparisonPokemon.length < 4) {
            comparisonPokemon.push(pokemonId);
        } else {
            alert('Máximo 4 Pokémon para comparar');
            return;
        }
    }
    
    updateComparisonCount();
    
    if (comparisonPokemon.length > 0) {
        showComparison();
    } else {
        document.getElementById('comparison-container').style.display = 'none';
    }
    
    // Actualizar botón
    const btn = event.target;
    const isInComparison = comparisonPokemon.includes(pokemonId);
    btn.className = `compare-btn ${isInComparison ? 'active' : ''}`;
    btn.title = isInComparison ? 'Quitar de comparación' : 'Agregar a comparación';
}

async function showComparison() {
    if (comparisonPokemon.length === 0) return;
    
    const container = document.getElementById('comparison-container');
    container.style.display = 'block';
    
    const pokemonData = await Promise.all(
        comparisonPokemon.map(id => fetchPokemonData(id))
    );
    
    // Calcular valores máximos para comparaciones visuales
    const maxHeight = Math.max(...pokemonData.map(p => p.height));
    const maxWeight = Math.max(...pokemonData.map(p => p.weight));
    const maxBST = Math.max(...pokemonData.map(p => Object.values(p.stats).reduce((a, b) => a + b, 0)));
    
    let html = `
        <div class="comparison-header">
            <h3>Comparación de Pokémon (${comparisonPokemon.length})</h3>
            <button id="close-comparison" onclick="clearComparison()">✕</button>
        </div>
        
        <!-- Comparación Visual de Alturas -->
        <div class="multi-height-comparison">
            <h4>📏 Comparación de Alturas</h4>
            <div class="height-lineup">
                ${pokemonData.map(pokemon => {
                    const heightScale = (pokemon.height / maxHeight) * 100;
                    return `
                        <div class="lineup-pokemon ${pokemon.height === maxHeight ? 'tallest' : ''}">
                            <img src="${getSpriteUrl(pokemon)}" ${getSpriteFallbackAttributes(pokemon)}
                                 alt="${pokemon.name}" 
                                 style="height: ${Math.max(heightScale, 20)}px; max-height: 120px;">
                            <div class="lineup-info">
                                <div class="pokemon-name">${capitalizeFirst(pokemon.name)}</div>
                                <div class="height-value">${pokemon.height}m</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- Comparación Visual de Pesos -->
        <div class="multi-weight-comparison">
            <h4>⚖️ Comparación de Pesos</h4>
            <div class="weight-bars">
                ${pokemonData.map(pokemon => {
                    const weightPercentage = (pokemon.weight / maxWeight) * 100;
                    return `
                        <div class="weight-bar-item">
                            <div class="pokemon-info">
                                <img src="${getSpriteUrl(pokemon)}" ${getSpriteFallbackAttributes(pokemon)} alt="${pokemon.name}">
                                <span class="pokemon-name">${capitalizeFirst(pokemon.name)}</span>
                            </div>
                            <div class="weight-bar-container">
                                <div class="weight-bar" style="width: ${weightPercentage}%;"></div>
                                <span class="weight-value">${pokemon.weight}kg</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <div class="comparison-content-multi">
    `;
    
    pokemonData.forEach((pokemon, index) => {
        const bst = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
        
        html += `
            <div class="comparison-pokemon-multi">
                <img src="${getSpriteUrl(pokemon)}" ${getSpriteFallbackAttributes(pokemon)} alt="${pokemon.name}">
                <h4>${capitalizeFirst(pokemon.name)} #${pokemon.id}</h4>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                </div>
                <div class="comparison-stats">
                    ${Object.entries({
                        'HP': pokemon.stats.hp,
                        'Atk': pokemon.stats.attack,
                        'Def': pokemon.stats.defense,
                        'SpA': pokemon.stats.spAttack,
                        'SpD': pokemon.stats.spDefense,
                        'Spe': pokemon.stats.speed
                    }).map(([statName, value]) => {
                        const maxStat = Math.max(...pokemonData.map(p => p.stats[statName.toLowerCase().replace('spa', 'spAttack').replace('spd', 'spDefense').replace('spe', 'speed')]));
                        const color = value === maxStat ? '#48bb78' : '#666';
                        return `<div>${statName}: <span style="color: ${color}; font-weight: ${value === maxStat ? 'bold' : 'normal'}">${value}</span></div>`;
                    }).join('')}
                    <div class="bst">BST: <span style="color: ${bst === maxBST ? '#48bb78' : '#666'}; font-weight: ${bst === maxBST ? 'bold' : 'normal'}">${bst}</span></div>
                </div>
                <div class="comparison-physical">
                    <div class="${pokemon.height === maxHeight ? 'highlight' : ''}">📏 ${pokemon.height}m</div>
                    <div class="${pokemon.weight === maxWeight ? 'highlight' : ''}">⚖️ ${pokemon.weight}kg</div>
                </div>
                <button class="remove-from-comparison" onclick="addToComparison(${pokemon.id}, event)" title="Quitar de comparación">✕</button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function clearComparison() {
    comparisonPokemon = [];
    updateComparisonCount();
    document.getElementById('comparison-container').style.display = 'none';
    // Actualizar botones de comparación
    document.querySelectorAll('.compare-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.title = 'Agregar a comparación';
    });
}

async function toggleFavoritesView() {
    const btn = document.getElementById('favorites-toggle');
    const isShowingFavorites = btn.classList.contains('active');
    
    if (isShowingFavorites) {
        btn.classList.remove('active');
        btn.textContent = '⭐ Mostrar Favoritos';
        await displayPokemonList(allPokemonList);
    } else {
        btn.classList.add('active');
        btn.textContent = '📋 Mostrar Todos';
        const favoritePokemon = allPokemonList.filter(p => favorites.includes(p.id));
        await displayPokemonList(favoritePokemon);
    }
}

async function filterPokemon() {
    showLoading(true);
    
    const searchTerm = document.getElementById('pokemon-search').value.toLowerCase();
    const generationFilter = document.getElementById('generation-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    let filteredPokemon = allPokemonList;
    
    // Filtro de búsqueda
    if (searchTerm) {
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            (pokemon.displayName && pokemon.displayName.toLowerCase().includes(searchTerm)) ||
            pokemon.id.toString().includes(searchTerm)
        );
    }
    
    // Filtro de generación
    if (generationFilter) {
        const genRanges = {
            '1': [1, 151],
            '2': [152, 251],
            '3': [252, 386],
            '4': [387, 493],
            '5': [494, 649],
            '6': [650, 721],
            '7': [722, 809],
            '8': [810, 905],
            '9': [906, 1010]
        };
        
        const [start, end] = genRanges[generationFilter];
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.id >= start && pokemon.id <= end
        );
    }
    
    // Aplicar filtros avanzados
    if (advancedFilters.minBST > 0 || advancedFilters.maxBST < 800 || 
        advancedFilters.minStat.stat || advancedFilters.ability || advancedFilters.move || typeFilter) {
        
        const advancedFilteredPokemon = [];
        
        for (const pokemon of filteredPokemon) {
            let pokemonData = pokemonCache.get(pokemon.id);
            if (!pokemonData) {
                pokemonData = await fetchPokemonData(pokemon.id);
            }
            
            if (!pokemonData) continue;
            
            // Filtro por tipo
            if (typeFilter && !pokemonData.types.includes(typeFilter)) {
                continue;
            }
            
            // Filtro por BST
            const bst = Object.values(pokemonData.stats).reduce((a, b) => a + b, 0);
            if (bst < advancedFilters.minBST || bst > advancedFilters.maxBST) {
                continue;
            }
            
            // Filtro por estadística mínima
            if (advancedFilters.minStat.stat && 
                pokemonData.stats[advancedFilters.minStat.stat] < advancedFilters.minStat.value) {
                continue;
            }
            
            // Filtro por habilidad
            if (advancedFilters.ability && 
                !pokemonData.abilities.some(ability => 
                    ability.name.toLowerCase().includes(advancedFilters.ability)
                )) {
                continue;
            }
            
            // Filtro por movimiento
            if (advancedFilters.move && 
                !pokemonData.moves.some(move => 
                    move.name.toLowerCase().includes(advancedFilters.move)
                )) {
                continue;
            }
            
            advancedFilteredPokemon.push(pokemon);
        }
        
        filteredPokemon = advancedFilteredPokemon;
    }
    
    await displayPokemonList(filteredPokemon);
    showLoading(false);
}

function setupMoveTooltips() {
    const moveItems = document.querySelectorAll('.move-item.enhanced');
    moveItems.forEach(item => {
        item.addEventListener('mouseenter', async (e) => {
            const moveName = e.target.closest('.move-item').dataset.move;
            const moveData = await fetchMoveData(moveName);
            if (moveData) {
                showMoveTooltip(e, moveData);
            }
        });
        
        item.addEventListener('mouseleave', hideMoveTooltip);
    });
}

function showMoveTooltip(event, moveData) {
    let tooltip = document.getElementById('move-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'move-tooltip';
        tooltip.className = 'move-tooltip';
        document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <strong>${capitalizeFirst(moveData.name.replace(/-/g, ' '))}</strong>
            <span class="type-badge type-${moveData.type}">${moveData.type}</span>
        </div>
        <div class="tooltip-stats">
            <div>Poder: ${moveData.power || '-'}</div>
            <div>Precisión: ${moveData.accuracy || '-'}%</div>
            <div>PP: ${moveData.pp || '-'}</div>
            <div>Categoría: ${moveData.damage_class}</div>
        </div>
        <div class="tooltip-description">
            ${moveData.description}
        </div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY + 10 + 'px';
}

function hideMoveTooltip() {
    const tooltip = document.getElementById('move-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function setupAbilityTooltips() {
    // Remover tooltips existentes
    const existingTooltip = document.getElementById('ability-tooltip');
    if (existingTooltip) existingTooltip.remove();
    
    // Crear tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'ability-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 12px;
        border-radius: 8px;
        font-size: 0.9em;
        max-width: 300px;
        z-index: 1000;
        display: none;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(tooltip);
    
    // Event listeners para habilidades
    document.addEventListener('mouseover', async (e) => {
        if (e.target.classList.contains('ability-tooltip') || e.target.closest('.ability-tooltip')) {
            const abilityElement = e.target.classList.contains('ability-tooltip') ? e.target : e.target.closest('.ability-tooltip');
            const abilityName = abilityElement.dataset.ability;
            const abilityData = await fetchAbilityData(abilityName);
            if (abilityData) {
                tooltip.innerHTML = `<strong>${capitalizeFirst(abilityName.replace(/-/g, ' '))}</strong><br><br>${abilityData.effect}`;
                tooltip.style.display = 'block';
            }
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY + 10 + 'px';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('ability-tooltip') || e.target.closest('.ability-tooltip')) {
            tooltip.style.display = 'none';
        }
    });
}

async function loadEvolutionChain(pokemon) {
    const container = document.getElementById('evolution-chain');
    container.innerHTML = '<p>Cargando cadena evolutiva...</p>';
    
    try {
        // Obtener datos de la especie
        const speciesResponse = await fetch(`${API_BASE}/pokemon-species/${pokemon.id}`);
        if (!speciesResponse.ok) {
            container.innerHTML = '<p>No se pudo cargar la cadena evolutiva.</p>';
            return;
        }
        
        const speciesData = await speciesResponse.json();
        
        // Obtener cadena evolutiva
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) {
            container.innerHTML = '<p>No se pudo cargar la cadena evolutiva.</p>';
            return;
        }
        
        const evolutionData = await evolutionResponse.json();
        
        // Procesar cadena evolutiva
        const evolutionChain = await processEvolutionChain(evolutionData.chain);
        
        // Buscar megaevoluciones para cada Pokémon en la cadena
        const megaEvolutions = await findMegaEvolutions(evolutionChain);
        
        if (evolutionChain.length <= 1 && Object.keys(megaEvolutions).length === 0) {
            container.innerHTML = '<p>Este Pokémon no evoluciona.</p>';
            return;
        }
        
        // Mostrar cadena evolutiva
        let html = '<div class="evolution-stages">';
        
        for (let i = 0; i < evolutionChain.length; i++) {
            const stage = evolutionChain[i];
            const isCurrentPokemon = stage.name === pokemon.name;
            const hasMegas = megaEvolutions[stage.name] && megaEvolutions[stage.name].length > 0;
            
            html += `
                <div class="evolution-stage ${isCurrentPokemon ? 'current' : ''}">
                    <div class="evolution-pokemon" onclick="selectPokemon(${stage.id})">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.id}.png" alt="${stage.name}">
                        <div class="evolution-name">${capitalizeFirst(stage.name)}</div>
                        <div class="evolution-number">#${stage.id.toString().padStart(3, '0')}</div>
                    </div>
                    
                    ${hasMegas ? `
                        <div class="mega-evolutions">
                            <div class="mega-label">Megaevoluciones:</div>
                            <div class="mega-forms">
                                ${megaEvolutions[stage.name].map(mega => `
                                    <div class="mega-pokemon" onclick="selectPokemon(${mega.id})" title="${capitalizeFirst(mega.displayName)}">
                                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mega.id}.png" alt="${mega.name}">
                                        <div class="mega-name">${mega.displayName}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${i < evolutionChain.length - 1 ? `
                        <div class="evolution-arrow">
                            <span>→</span>
                            ${stage.evolutionDetails ? `<div class="evolution-condition">${stage.evolutionDetails}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando cadena evolutiva:', error);
        container.innerHTML = '<p>Error al cargar la cadena evolutiva.</p>';
    }
}

async function processEvolutionChain(chain) {
    const evolutionChain = [];
    
    // Función recursiva para procesar la cadena
    async function processStage(stage) {
        // Obtener ID del Pokémon
        const pokemonId = await getPokemonIdFromSpecies(stage.species.name);
        
        const stageData = {
            name: stage.species.name,
            id: pokemonId,
            evolutionDetails: null
        };
        
        // Procesar condiciones de evolución
        if (stage.evolution_details && stage.evolution_details.length > 0) {
            const details = stage.evolution_details[0];
            let condition = '';
            
            if (details.min_level) {
                condition = `Nv. ${details.min_level}`;
            } else if (details.item) {
                condition = capitalizeFirst(details.item.name.replace(/-/g, ' '));
            } else if (details.trigger) {
                condition = capitalizeFirst(details.trigger.name.replace(/-/g, ' '));
            }
            
            stageData.evolutionDetails = condition;
        }
        
        evolutionChain.push(stageData);
        
        // Procesar evoluciones siguientes
        for (const evolution of stage.evolves_to) {
            await processStage(evolution);
        }
    }
    
    await processStage(chain);
    return evolutionChain;
}

async function getPokemonIdFromSpecies(speciesName) {
    try {
        const response = await fetch(`${API_BASE}/pokemon/${speciesName}`);
        if (response.ok) {
            const data = await response.json();
            return data.id;
        }
    } catch (error) {
        console.error(`Error obteniendo ID para ${speciesName}:`, error);
    }
    return 1; // Fallback
}

async function findMegaEvolutions(evolutionChain) {
    const megaEvolutions = {};
    
    // Lista de megaevoluciones conocidas
    const megaList = {
        'venusaur': ['venusaur-mega'],
        'charizard': ['charizard-mega-x', 'charizard-mega-y'],
        'blastoise': ['blastoise-mega'],
        'alakazam': ['alakazam-mega'],
        'gengar': ['gengar-mega'],
        'kangaskhan': ['kangaskhan-mega'],
        'pinsir': ['pinsir-mega'],
        'gyarados': ['gyarados-mega'],
        'aerodactyl': ['aerodactyl-mega'],
        'mewtwo': ['mewtwo-mega-x', 'mewtwo-mega-y'],
        'ampharos': ['ampharos-mega'],
        'scizor': ['scizor-mega'],
        'heracross': ['heracross-mega'],
        'houndoom': ['houndoom-mega'],
        'tyranitar': ['tyranitar-mega'],
        'blaziken': ['blaziken-mega'],
        'gardevoir': ['gardevoir-mega'],
        'mawile': ['mawile-mega'],
        'aggron': ['aggron-mega'],
        'medicham': ['medicham-mega'],
        'manectric': ['manectric-mega'],
        'banette': ['banette-mega'],
        'absol': ['absol-mega'],
        'garchomp': ['garchomp-mega'],
        'lucario': ['lucario-mega'],
        'abomasnow': ['abomasnow-mega'],
        'beedrill': ['beedrill-mega'],
        'pidgeot': ['pidgeot-mega'],
        'slowbro': ['slowbro-mega'],
        'steelix': ['steelix-mega'],
        'sceptile': ['sceptile-mega'],
        'swampert': ['swampert-mega'],
        'sableye': ['sableye-mega'],
        'sharpedo': ['sharpedo-mega'],
        'camerupt': ['camerupt-mega'],
        'altaria': ['altaria-mega'],
        'glalie': ['glalie-mega'],
        'salamence': ['salamence-mega'],
        'metagross': ['metagross-mega'],
        'latias': ['latias-mega'],
        'latios': ['latios-mega'],
        'rayquaza': ['rayquaza-mega'],
        'lopunny': ['lopunny-mega'],
        'gallade': ['gallade-mega'],
        'audino': ['audino-mega'],
        'diancie': ['diancie-mega']
    };
    
    for (const stage of evolutionChain) {
        if (megaList[stage.name]) {
            megaEvolutions[stage.name] = [];
            
            for (const megaName of megaList[stage.name]) {
                try {
                    const megaData = await fetchPokemonData(megaName);
                    if (megaData) {
                        let displayName = 'Mega';
                        if (megaName.includes('-x')) displayName = 'Mega X';
                        else if (megaName.includes('-y')) displayName = 'Mega Y';
                        
                        megaEvolutions[stage.name].push({
                            id: megaData.id,
                            name: megaName,
                            displayName: displayName
                        });
                    }
                } catch (error) {
                    console.error(`Error cargando mega ${megaName}:`, error);
                }
            }
        }
    }
    
    return megaEvolutions;
}

// Nuevas funciones para las mejoras
function updateComparisonCount() {
    document.getElementById('comparison-count').textContent = comparisonPokemon.length;
}

async function handleSort(event) {
    const [stat, order] = event.target.value.split('-');
    currentSort = stat;
    currentSortOrder = order;
    await filterPokemon();
}

function updateSortLabels(select) {
    const sortLabels = {
        'id': 'Por Número',
        'name': 'Por Nombre', 
        'bst': 'Por BST',
        'hp': 'Por HP',
        'attack': 'Por Ataque',
        'defense': 'Por Defensa',
        'spAttack': 'Por Atq. Esp.',
        'spDefense': 'Por Def. Esp.',
        'speed': 'Por Velocidad',
        'height': 'Por Altura',
        'weight': 'Por Peso'
    };
    
    Array.from(select.options).forEach(option => {
        const value = option.value;
        const baseText = sortLabels[value];
        if (value === currentSort) {
            const arrow = currentSortOrder === 'asc' ? '↑' : '↓';
            option.textContent = `${baseText} (${arrow})`;
        } else {
            option.textContent = baseText;
        }
    });
}

async function sortPokemonList(pokemonList) {
    if (currentSort === 'id') {
        return pokemonList.sort((a, b) => {
            const result = a.id - b.id;
            return currentSortOrder === 'asc' ? result : -result;
        });
    }
    
    if (currentSort === 'name') {
        return pokemonList.sort((a, b) => {
            const result = a.name.localeCompare(b.name);
            return currentSortOrder === 'asc' ? result : -result;
        });
    }
    
    // Para ordenamiento por estadísticas, necesitamos los datos
    const pokemonWithStats = [];
    for (const pokemon of pokemonList) {
        let pokemonData = pokemonCache.get(pokemon.id);
        if (!pokemonData) {
            pokemonData = await fetchPokemonData(pokemon.id);
        }
        if (pokemonData) {
            pokemonWithStats.push({ ...pokemon, stats: pokemonData.stats, height: pokemonData.height, weight: pokemonData.weight });
        }
    }
    
    return pokemonWithStats.sort((a, b) => {
        let valueA, valueB;
        
        if (currentSort === 'bst') {
            valueA = Object.values(a.stats).reduce((sum, stat) => sum + stat, 0);
            valueB = Object.values(b.stats).reduce((sum, stat) => sum + stat, 0);
        } else if (currentSort === 'height') {
            valueA = a.height || 0;
            valueB = b.height || 0;
        } else if (currentSort === 'weight') {
            valueA = a.weight || 0;
            valueB = b.weight || 0;
        } else {
            valueA = a.stats[currentSort];
            valueB = b.stats[currentSort];
        }
        
        const result = valueA - valueB;
        return currentSortOrder === 'asc' ? result : -result;
    });
}

function openAdvancedFilters() {
    let modal = document.getElementById('advanced-filters-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'advanced-filters-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Filtros Avanzados</h3>
                <div class="filter-section">
                    <label>BST Mínimo:</label>
                    <input type="range" id="min-bst" min="0" max="800" value="${advancedFilters.minBST}">
                    <span id="min-bst-value">${advancedFilters.minBST}</span>
                </div>
                <div class="filter-section">
                    <label>BST Máximo:</label>
                    <input type="range" id="max-bst" min="0" max="800" value="${advancedFilters.maxBST}">
                    <span id="max-bst-value">${advancedFilters.maxBST}</span>
                </div>
                <div class="filter-section">
                    <label>Estadística mínima:</label>
                    <select id="min-stat-type">
                        <option value="">Seleccionar estadística</option>
                        <option value="hp">HP</option>
                        <option value="attack">Ataque</option>
                        <option value="defense">Defensa</option>
                        <option value="spAttack">Ataque Especial</option>
                        <option value="spDefense">Defensa Especial</option>
                        <option value="speed">Velocidad</option>
                    </select>
                    <input type="number" id="min-stat-value" min="0" max="255" value="${advancedFilters.minStat.value}">
                </div>
                <div class="filter-section">
                    <label>Buscar por habilidad:</label>
                    <input type="text" id="ability-search" placeholder="Nombre de habilidad" value="${advancedFilters.ability}">
                </div>
                <div class="filter-section">
                    <label>Buscar por movimiento:</label>
                    <input type="text" id="move-search" placeholder="Nombre de movimiento" value="${advancedFilters.move}">
                </div>
                <div class="filter-actions">
                    <button id="apply-filters" class="filter-btn">Aplicar Filtros</button>
                    <button id="reset-filters" class="filter-btn">Resetear</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        
        // Sliders
        const minBstSlider = modal.querySelector('#min-bst');
        const maxBstSlider = modal.querySelector('#max-bst');
        minBstSlider.addEventListener('input', (e) => {
            modal.querySelector('#min-bst-value').textContent = e.target.value;
        });
        maxBstSlider.addEventListener('input', (e) => {
            modal.querySelector('#max-bst-value').textContent = e.target.value;
        });
        
        // Botones
        modal.querySelector('#apply-filters').addEventListener('click', applyAdvancedFilters);
        modal.querySelector('#reset-filters').addEventListener('click', resetAdvancedFilters);
    }
    
    modal.style.display = 'block';
}

async function applyAdvancedFilters() {
    const modal = document.getElementById('advanced-filters-modal');
    
    advancedFilters.minBST = parseInt(modal.querySelector('#min-bst').value);
    advancedFilters.maxBST = parseInt(modal.querySelector('#max-bst').value);
    advancedFilters.minStat.stat = modal.querySelector('#min-stat-type').value;
    advancedFilters.minStat.value = parseInt(modal.querySelector('#min-stat-value').value) || 0;
    advancedFilters.ability = modal.querySelector('#ability-search').value.toLowerCase();
    advancedFilters.move = modal.querySelector('#move-search').value.toLowerCase();
    
    modal.style.display = 'none';
    await filterPokemon();
}

async function resetAdvancedFilters() {
    advancedFilters = {
        minBST: 0,
        maxBST: 800,
        minStat: { stat: '', value: 0 },
        ability: '',
        move: ''
    };
    
    const modal = document.getElementById('advanced-filters-modal');
    modal.querySelector('#min-bst').value = 0;
    modal.querySelector('#max-bst').value = 800;
    modal.querySelector('#min-bst-value').textContent = '0';
    modal.querySelector('#max-bst-value').textContent = '800';
    modal.querySelector('#min-stat-type').value = '';
    modal.querySelector('#min-stat-value').value = 0;
    modal.querySelector('#ability-search').value = '';
    modal.querySelector('#move-search').value = '';
    
    await filterPokemon();
}



function getTypeGradient(types) {
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    if (types.length === 1) {
        const color = typeColors[types[0]] || '#68D391';
        return isDark 
            ? `linear-gradient(135deg, ${color}90, ${color}50)` 
            : `linear-gradient(135deg, ${color}70, ${color}40)`;
    } else {
        const color1 = typeColors[types[0]] || '#68D391';
        const color2 = typeColors[types[1]] || '#68D391';
        return isDark 
            ? `linear-gradient(90deg, ${color1}90 0%, ${color1}90 45%, ${color2}90 55%, ${color2}90 100%)` 
            : `linear-gradient(90deg, ${color1}70 0%, ${color1}70 45%, ${color2}70 55%, ${color2}70 100%)`;
    }
}

function getGenerationBadge(pokemonId, pokemonName) {
    const genRanges = {
        1: { range: [1, 151], color: '#FF6B6B', name: 'Gen I', svg: '../assets/images/Gens/Primera_generacion.svg' },
        2: { range: [152, 251], color: '#4ECDC4', name: 'Gen II', svg: '../assets/images/Gens/Segunda_generacion.svg' },
        3: { range: [252, 386], color: '#45B7D1', name: 'Gen III', svg: '../assets/images/Gens/Tercera_generacion.svg' },
        4: { range: [387, 493], color: '#96CEB4', name: 'Gen IV', svg: '../assets/images/Gens/Cuarta_generacion.svg' },
        5: { range: [494, 649], color: '#FFEAA7', name: 'Gen V', svg: '../assets/images/Gens/Quinta_generacion.svg' },
        6: { range: [650, 721], color: '#DDA0DD', name: 'Gen VI', svg: '../assets/images/Gens/Sexta_generacion.svg' },
        7: { range: [722, 809], color: '#98D8C8', name: 'Gen VII', svg: '../assets/images/Gens/Septima_generacion.svg' },
        8: { range: [810, 905], color: '#F7DC6F', name: 'Gen VIII', svg: '../assets/images/Gens/Octava_generacion.svg' },
        9: { range: [906, 1010], color: '#BB8FCE', name: 'Gen IX', svg: '../assets/images/Gens/Novena_generacion.svg' }
    };
    
    pokemonId = resolveBaseSpeciesId(pokemonId, pokemonName);
    
    for (const [gen, data] of Object.entries(genRanges)) {
        const [start, end] = data.range;
        if (pokemonId >= start && pokemonId <= end) {
            return { gen, color: data.color, name: data.name, svg: data.svg };
        }
    }
    return { gen: '?', color: '#95A5A6', name: 'Unknown', svg: null };
}

// Resuelve el ID de la especie base para formas alternativas cuyo ID está
// fuera del rango de la Pokédex nacional (p.ej. aegislash-blade = 10026).
// PokeAPI nombra la forma por defecto como "aegislash-shield", no "aegislash",
// por lo que buscamos por prefijo de especie y tomamos el ID nacional válido.
function resolveBaseSpeciesId(pokemonId, pokemonName) {
    if (!pokemonName || !pokemonName.includes('-')) return pokemonId;
    // Si el ID ya está dentro del rango nacional, no hace falta resolver.
    if (pokemonId >= 1 && pokemonId <= 1010) return pokemonId;
    
    const baseName = pokemonName.split('-')[0];
    const candidates = (allPokemonList || []).filter(p =>
        p && p.name && (p.name === baseName || p.name.startsWith(baseName + '-')) &&
        p.id >= 1 && p.id <= 1010
    );
    if (candidates.length > 0) {
        // El ID nacional más bajo corresponde a la especie base.
        return candidates.reduce((min, p) => (p.id < min ? p.id : min), candidates[0].id);
    }
    return pokemonId;
}

// Devuelve el HTML del badge de generación como imagen SVG (o texto de fallback)
function getGenerationBadgeHtml(pokemonId, pokemonName, height = 16) {
    const genInfo = getGenerationBadge(pokemonId, pokemonName);
    if (genInfo.svg) {
        return `<img src="${genInfo.svg}" alt="${genInfo.name}" title="${genInfo.name}" class="gen-badge-svg" style="height: ${height}px; width: auto; vertical-align: middle;">`;
    }
    return `<span style="background: ${genInfo.color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.6em; font-weight: bold;">${genInfo.name}</span>`;
}

function copyPokemonToTeamBuilder(pokemonId) {
    const pokemon = pokemonCache.get(pokemonId);
    if (!pokemon) return;
    
    const teamBuilderData = {
        id: pokemon.id,
        name: pokemon.name,
        fromPokedex: true,
        timestamp: Date.now()
    };
    
    localStorage.setItem('pokedex-to-teambuilder', JSON.stringify(teamBuilderData));
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        ✓ ${capitalizeFirst(pokemon.name)} copiado!<br>
        <small style="font-weight: normal; opacity: 0.9;">Abre el Team Builder para agregarlo</small>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

window.toggleFavorite = toggleFavorite;
window.addToComparison = addToComparison;
window.clearComparison = clearComparison;
window.copyPokemonToTeamBuilder = copyPokemonToTeamBuilder;
