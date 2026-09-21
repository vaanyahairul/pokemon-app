// Calculadora de Daño Pokémon
// Reutiliza la lógica de stats y tipos del constructor de equipos.

const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1010;

// Caches simples
const pokemonCache = new Map();
const moveCache = new Map();
let allPokemonList = [];
let allMovesList = [];

// Efectos de naturaleza sobre las estadísticas (mismo modelo que el builder)
const natureEffects = {
    hardy: {}, lonely: { attack: 1.1, defense: 0.9 }, brave: { attack: 1.1, speed: 0.9 },
    adamant: { attack: 1.1, spAttack: 0.9 }, naughty: { attack: 1.1, spDefense: 0.9 },
    bold: { defense: 1.1, attack: 0.9 }, docile: {}, relaxed: { defense: 1.1, speed: 0.9 },
    impish: { defense: 1.1, spAttack: 0.9 }, lax: { defense: 1.1, spDefense: 0.9 },
    timid: { speed: 1.1, attack: 0.9 }, hasty: { speed: 1.1, defense: 0.9 },
    serious: {}, jolly: { speed: 1.1, spAttack: 0.9 }, naive: { speed: 1.1, spDefense: 0.9 },
    modest: { spAttack: 1.1, attack: 0.9 }, mild: { spAttack: 1.1, defense: 0.9 },
    quiet: { spAttack: 1.1, speed: 0.9 }, bashful: {}, rash: { spAttack: 1.1, spDefense: 0.9 },
    calm: { spDefense: 1.1, attack: 0.9 }, gentle: { spDefense: 1.1, defense: 0.9 },
    sassy: { spDefense: 1.1, speed: 0.9 }, careful: { spDefense: 1.1, spAttack: 0.9 }, quirky: {}
};

// Tabla de efectividad de tipos (defensiva)
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

const TYPE_NAMES = {
    normal: 'Normal', fire: 'Fire', water: 'Water', electric: 'Electric',
    grass: 'Grass', ice: 'Ice', fighting: 'Fighting', poison: 'Poison',
    ground: 'Ground', flying: 'Flying', psychic: 'Psychic', bug: 'Bug',
    rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon', dark: 'Dark',
    steel: 'Steel', fairy: 'Fairy'
};

// Estado de cada combatiente
const state = {
    attacker: { pokemon: null, move: null },
    defender: { pokemon: null }
};

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', async () => {
    setupSideListeners('attacker');
    setupSideListeners('defender');
    document.getElementById('calculate-btn').addEventListener('click', calculateDamage);
    await loadAllPokemon();
});

async function loadAllPokemon() {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=${TOTAL_POKEMON}`);
        const data = await response.json();
        allPokemonList = data.results.map((p, index) => ({ name: p.name, id: index + 1 }));
    } catch (error) {
        console.error('Could not load the Pokémon list:', error);
    }
}

// ---------- Fetch de datos ----------
async function fetchPokemonData(nameOrId) {
    const key = String(nameOrId).toLowerCase();
    if (pokemonCache.has(key)) return pokemonCache.get(key);

    try {
        const response = await fetch(`${API_BASE}/pokemon/${key}`);
        if (!response.ok) return null;
        const data = await response.json();

        const pokemon = {
            id: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.front_default,
            stats: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                spAttack: data.stats[3].base_stat,
                spDefense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat
            },
            moves: [...new Set(data.moves.map(m => m.move.name))].sort()
        };

        pokemonCache.set(key, pokemon);
        return pokemon;
    } catch (error) {
        console.error(`Error cargando Pokémon ${key}:`, error);
        return null;
    }
}

async function fetchMoveData(moveName) {
    const key = moveName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (moveCache.has(key)) return moveCache.get(key);

    try {
        const response = await fetch(`${API_BASE}/move/${key}`);
        if (!response.ok) return null;
        const data = await response.json();
        const move = {
            name: data.name,
            type: data.type.name,
            damageClass: data.damage_class.name, // physical | special | status
            power: data.power
        };
        moveCache.set(key, move);
        return move;
    } catch (error) {
        console.error(`Error cargando movimiento ${key}:`, error);
        return null;
    }
}

// ---------- Cálculo de estadísticas (fórmula oficial) ----------
function calcHP(base, iv, ev, level) {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10);
}

function calcStat(base, iv, ev, level, natureMod) {
    let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5);
    if (natureMod) stat = Math.floor(stat * natureMod);
    return stat;
}

// ---------- Efectividad de tipos ----------
// Devuelve el multiplicador total y el desglose por tipo defensor.
function getEffectiveness(attackingType, defendingTypes) {
    let multiplier = 1;
    const breakdown = [];
    defendingTypes.forEach(defType => {
        const chart = typeChart[defType];
        let sub = 1;
        if (chart.immune.includes(attackingType)) sub = 0;
        else if (chart.resist.includes(attackingType)) sub = 0.5;
        else if (chart.weak.includes(attackingType)) sub = 2;
        multiplier *= sub;
        breakdown.push({ type: defType, value: sub });
    });
    return { multiplier, breakdown };
}

// ---------- Fórmula de daño ----------
// Daño = ((((2*Nivel/5 + 2) * Potencia * A / D) / 50) + 2) * STAB * Tipo * Roll
function computeDamage({ level, power, attackStat, defenseStat, stab, typeMultiplier }) {
    const base = Math.floor(Math.floor(Math.floor((2 * level) / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;
    const afterStab = Math.floor(base * stab);
    const afterType = Math.floor(afterStab * typeMultiplier);

    // El daño real varía con 16 rolls entre 85% y 100%
    const minDamage = Math.max(typeMultiplier === 0 ? 0 : 1, Math.floor(afterType * 0.85));
    const maxDamage = typeMultiplier === 0 ? 0 : Math.floor(afterType * 1.00);
    return { base, afterStab, afterType, minDamage, maxDamage };
}

// ---------- UI: listeners por lado ----------
function setupSideListeners(side) {
    const input = document.getElementById(`${side}-search`);
    const dropdown = document.getElementById(`${side}-dropdown`);

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        if (q.length < 2) { dropdown.classList.remove('show'); return; }
        const matches = allPokemonList
            .filter(p => p.name.includes(q))
            .slice(0, 8);
        dropdown.innerHTML = matches
            .map(p => `<div class="dc-autocomplete-item" data-name="${p.name}">#${p.id} ${capitalize(p.name)}</div>`)
            .join('');
        dropdown.classList.toggle('show', matches.length > 0);
    });

    input.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('show'), 200));

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.dc-autocomplete-item');
        if (!item) return;
        input.value = capitalize(item.dataset.name);
        dropdown.classList.remove('show');
        selectPokemon(side, item.dataset.name);
    });

    // Recalcular al cambiar nivel o naturaleza
    ['level', 'nature'].forEach(field => {
        const el = document.getElementById(`${side}-${field}`);
        if (el) el.addEventListener('input', () => onParamsChanged(side));
    });

    // Recalcular al cambiar cualquier EV/IV (delegación sobre la tabla)
    const evTable = document.querySelector(`.dc-evtable[data-side="${side}"]`);
    if (evTable) {
        evTable.addEventListener('input', () => onParamsChanged(side));
    }
}

function onParamsChanged(side) {
    updateEvTotal(side);
    renderRealStats(side);
    if (allReady()) calculateDamage();
}

// Muestra el total de EVs y avisa si supera el límite competitivo (510).
function updateEvTotal(side) {
    const box = document.getElementById(`${side}-ev-total`);
    if (!box) return;
    let total = 0;
    document.querySelectorAll(`#${side}-ev-hp, #${side}-ev-attack, #${side}-ev-defense, #${side}-ev-spAttack, #${side}-ev-spDefense, #${side}-ev-speed`)
        .forEach(input => { total += clampInt(input.value, 0, 252, 0); });

    box.textContent = `EVs totales: ${total}/510`;
    box.classList.toggle('over', total > 510);
}

async function selectPokemon(side, name) {
    const pokemon = await fetchPokemonData(name);
    if (!pokemon) return;
    state[side].pokemon = pokemon;
    renderPokemonHeader(side, pokemon);
    renderRealStats(side);

    if (side === 'attacker') {
        populateMoveSelector(pokemon);
    }
    if (allReady()) calculateDamage();
}

function renderPokemonHeader(side, pokemon) {
    const header = document.getElementById(`${side}-header`);
    header.innerHTML = `
        <img src="${pokemon.sprite || ''}" alt="${pokemon.name}" class="dc-sprite">
        <div class="dc-poke-info">
            <div class="dc-poke-name">${capitalize(pokemon.name)} <span class="dc-poke-id">#${pokemon.id}</span></div>
            <div class="dc-types">
                ${pokemon.types.map(t => `<span class="type-badge type-${t}">${TYPE_NAMES[t] || capitalize(t)}</span>`).join('')}
            </div>
            <div class="dc-basestats">
                ${statChip('HP', pokemon.stats.hp)} ${statChip('Atk', pokemon.stats.attack)} ${statChip('Def', pokemon.stats.defense)}
                ${statChip('SpA', pokemon.stats.spAttack)} ${statChip('SpD', pokemon.stats.spDefense)} ${statChip('Spe', pokemon.stats.speed)}
            </div>
        </div>
    `;
    header.classList.add('filled');
}

function statChip(label, value) {
    return `<span class="dc-base-chip"><span>${label}</span><strong>${value}</strong></span>`;
}

// Calcula las 6 estadísticas finales aplicando nivel, naturaleza, EVs e IVs.
// Nota: aquí los EVs/IVs del formulario se aplican por igual a todas las stats,
// porque el formulario expone un único campo EV/IV (el de la stat relevante).
function computeFinalStats(pokemon, params) {
    const { level, evs, ivs, nature } = params;
    const effects = natureEffects[nature] || {};
    return {
        hp: calcHP(pokemon.stats.hp, ivs.hp, evs.hp, level),
        attack: calcStat(pokemon.stats.attack, ivs.attack, evs.attack, level, effects.attack),
        defense: calcStat(pokemon.stats.defense, ivs.defense, evs.defense, level, effects.defense),
        spAttack: calcStat(pokemon.stats.spAttack, ivs.spAttack, evs.spAttack, level, effects.spAttack),
        spDefense: calcStat(pokemon.stats.spDefense, ivs.spDefense, evs.spDefense, level, effects.spDefense),
        speed: calcStat(pokemon.stats.speed, ivs.speed, evs.speed, level, effects.speed)
    };
}

// Pinta las estadísticas reales calculadas debajo de las base, en su propio bloque.
function renderRealStats(side) {
    const box = document.getElementById(`${side}-realstats`);
    const pokemon = state[side].pokemon;
    if (!box) return;
    if (!pokemon) { box.innerHTML = ''; box.classList.remove('filled'); return; }

    const params = readSideParams(side);
    const finals = computeFinalStats(pokemon, params);
    const effects = natureEffects[params.nature] || {};

    const order = [
        ['hp', 'HP'], ['attack', 'Atk'], ['defense', 'Def'],
        ['spAttack', 'SpA'], ['spDefense', 'SpD'], ['speed', 'Spe']
    ];

    const rows = order.map(([key, label]) => {
        const mod = effects[key];
        const arrow = mod > 1 ? '<span class="dc-stat-up">▲</span>' : mod < 1 && mod ? '<span class="dc-stat-down">▼</span>' : '';
        return `
            <div class="dc-real-stat ${mod > 1 ? 'up' : mod < 1 && mod ? 'down' : ''}">
                <span class="dc-real-label">${label} ${arrow}</span>
                <span class="dc-real-value">${finals[key]}</span>
            </div>`;
    }).join('');

    box.innerHTML = `
        <div class="dc-real-title">Estadísticas reales · Nv. ${params.level} · ${capitalize(params.nature)}</div>
        <div class="dc-real-grid">${rows}</div>
    `;
    box.classList.add('filled');
}

function populateMoveSelector(pokemon) {
    const select = document.getElementById('attacker-move');
    select.innerHTML = '<option value="">Select a move...</option>' +
        pokemon.moves.map(m => `<option value="${m}">${capitalize(m.replace(/-/g, ' '))}</option>`).join('');
    select.disabled = false;

    select.onchange = async () => {
        if (!select.value) { state.attacker.move = null; return; }
        const move = await fetchMoveData(select.value);
        state.attacker.move = move;
        renderMoveInfo(move);
        if (allReady()) calculateDamage();
    };
}

const CATEGORY_ICON_INDEX = { physical: 0, special: 1, status: 2 };

function getCategoryIconHtml(damageClass, size = 16) {
    const index = CATEGORY_ICON_INDEX[damageClass];
    if (index === undefined) return '';

    const scale = size / 28;
    const posX = -((64 - 28) / 2) * scale;
    const posY = -(index * 28 * scale);

    return `<span title="${damageClass}" aria-label="${damageClass}" style="display:inline-block; width:${size}px; height:${size}px; background-image:url('../assets/images/category.png'); background-repeat:no-repeat; background-position:${posX}px ${posY}px; background-size:${64 * scale}px ${84 * scale}px; vertical-align:middle;"></span>`;
}

function renderMoveInfo(move) {
    const box = document.getElementById('attacker-move-info');
    if (!move) { box.innerHTML = ''; return; }
    const classLabel = { physical: 'Physical', special: 'Special', status: 'Status' }[move.damageClass] || move.damageClass;
    box.innerHTML = `
        <span class="type-badge type-${move.type}">${TYPE_NAMES[move.type] || capitalize(move.type)}</span>
        ${getCategoryIconHtml(move.damageClass, 18)}
        <span class="dc-move-class">${classLabel}</span>
        <span class="dc-move-power">Power: ${move.power ?? '—'}</span>
    `;
}

// ---------- Estado listo para calcular ----------
function allReady() {
    return state.attacker.pokemon && state.defender.pokemon && state.attacker.move;
}

// ---------- Cálculo principal ----------
function calculateDamage() {
    if (!state.attacker.pokemon) return showResultMessage('Select the attacking Pokémon.');
    if (!state.attacker.move) return showResultMessage('Select a move for the attacker.');
    if (!state.defender.pokemon) return showResultMessage('Select the defending Pokémon.');

    const move = state.attacker.move;
    if (move.damageClass === 'status' || !move.power) {
        return showResultMessage(`"${capitalize(move.name.replace(/-/g, ' '))}" is a status move or has no power: it deals no direct damage.`);
    }

    // Parámetros del atacante
    const atk = readSideParams('attacker');
    const def = readSideParams('defender');
    const attacker = state.attacker.pokemon;
    const defender = state.defender.pokemon;

    // Estadísticas reales completas (las mismas que se muestran en cada panel)
    const attackerFinals = computeFinalStats(attacker, atk);
    const defenderFinals = computeFinalStats(defender, def);

    // Elegir stats según categoría del movimiento
    const isPhysical = move.damageClass === 'physical';
    const attackStatName = isPhysical ? 'attack' : 'spAttack';
    const defenseStatName = isPhysical ? 'defense' : 'spDefense';

    const attackStat = attackerFinals[attackStatName];
    const defenseStat = defenderFinals[defenseStatName];
    const defenderHP = defenderFinals.hp;

    // STAB
    const hasStab = attacker.types.includes(move.type);
    const stab = hasStab ? 1.5 : 1;

    // Efectividad de tipo
    const { multiplier: typeMultiplier, breakdown } = getEffectiveness(move.type, defender.types);

    // Daño
    const dmg = computeDamage({
        level: atk.level,
        power: move.power,
        attackStat,
        defenseStat,
        stab,
        typeMultiplier
    });

    const minPct = (dmg.minDamage / defenderHP) * 100;
    const maxPct = (dmg.maxDamage / defenderHP) * 100;

    renderResult({
        attacker, defender, move, isPhysical,
        atk, def, attackStatName, defenseStatName,
        attackStat, defenseStat, defenderHP,
        hasStab, stab, typeMultiplier, breakdown, dmg,
        minPct, maxPct
    });
}

const STAT_KEYS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];

function readSideParams(side) {
    const evs = {};
    const ivs = {};
    STAT_KEYS.forEach(key => {
        evs[key] = clampInt(document.getElementById(`${side}-ev-${key}`).value, 0, 252, 0);
        ivs[key] = clampInt(document.getElementById(`${side}-iv-${key}`).value, 0, 31, 31);
    });
    return {
        level: clampInt(document.getElementById(`${side}-level`).value, 1, 100, 50),
        nature: document.getElementById(`${side}-nature`).value || 'hardy',
        evs,
        ivs
    };
}

function clampInt(value, min, max, fallback) {
    const n = parseInt(value);
    if (isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

// ---------- Render del resultado con la fórmula transparente ----------
function renderResult(r) {
    const { attacker, defender, move, isPhysical, atk, def,
        attackStatName, defenseStatName, attackStat, defenseStat, defenderHP,
        hasStab, stab, typeMultiplier, breakdown, dmg, minPct, maxPct } = r;

    const statLabels = { attack: 'Attack', spAttack: 'Sp. Atk', defense: 'Defense', spDefense: 'Sp. Def' };
    const effLabel = effectivenessLabel(typeMultiplier);
    const koInfo = knockoutInfo(dmg, defenderHP);

    const breakdownHtml = breakdown.map(b => {
        const label = b.value === 0 ? 'immune (x0)' : b.value === 2 ? 'weak (x2)' : b.value === 0.5 ? 'resists (x0.5)' : 'neutral (x1)';
        return `<span class="type-badge type-${b.type}">${TYPE_NAMES[b.type] || b.type}: ${label}</span>`;
    }).join(' ');

    document.getElementById('result').innerHTML = `
        <div class="dc-result-headline ${koInfo.klass}">
            <div class="dc-result-range">${dmg.minDamage} – ${dmg.maxDamage} <span>damage</span></div>
            <div class="dc-result-pct">${minPct.toFixed(1)}% – ${maxPct.toFixed(1)}% of HP</div>
            <div class="dc-result-ko">${koInfo.text}</div>
        </div>

        <div class="dc-formula">
            <h3>How it's calculated (step by step)</h3>

            <div class="dc-formula-block">
                <div class="dc-formula-title">1. Attack stat (${statLabels[attackStatName]})</div>
                <code>floor((2 × ${attacker.stats[attackStatName]} + ${atk.ivs[attackStatName]} + floor(${atk.evs[attackStatName]}/4)) × ${atk.level}/100 + 5)${natureNote(atk.nature, attackStatName)} = <strong>${attackStat}</strong></code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">2. Defense stat (${statLabels[defenseStatName]})</div>
                <code>floor((2 × ${defender.stats[defenseStatName]} + ${def.ivs[defenseStatName]} + floor(${def.evs[defenseStatName]}/4)) × ${def.level}/100 + 5)${natureNote(def.nature, defenseStatName)} = <strong>${defenseStat}</strong></code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">3. Defender's HP</div>
                <code>floor((2 × ${defender.stats.hp} + ${def.ivs.hp} + floor(${def.evs.hp}/4)) × ${def.level}/100 + ${def.level} + 10) = <strong>${defenderHP}</strong></code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">4. Base damage</div>
                <code>floor((2 × ${atk.level} / 5 + 2) × ${move.power} × ${attackStat} / ${defenseStat} / 50) + 2 = <strong>${dmg.base}</strong></code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">5. STAB (same-type bonus)</div>
                <code>${dmg.base} × ${stab} = <strong>${dmg.afterStab}</strong> ${hasStab ? '<span class="dc-tag ok">STAB applied (×1.5)</span>' : '<span class="dc-tag">No STAB (×1)</span>'}</code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">6. Type effectiveness</div>
                <code>${dmg.afterStab} × ${typeMultiplier} = <strong>${dmg.afterType}</strong> <span class="dc-tag ${effLabel.klass}">${effLabel.text} (×${typeMultiplier})</span></code>
                <div class="dc-type-breakdown">${breakdownHtml}</div>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">7. Random variation (roll 85%–100%)</div>
                <code>${dmg.afterType} × 0.85 = <strong>${dmg.minDamage}</strong> (min) &nbsp;·&nbsp; ${dmg.afterType} × 1.00 = <strong>${dmg.maxDamage}</strong> (max)</code>
            </div>

            <div class="dc-formula-block">
                <div class="dc-formula-title">8. HP percentage (damage ÷ defender's HP × 100)</div>
                <code>${dmg.minDamage} / ${defenderHP} × 100 = <strong>${minPct.toFixed(1)}%</strong> (min) &nbsp;·&nbsp; ${dmg.maxDamage} / ${defenderHP} × 100 = <strong>${maxPct.toFixed(1)}%</strong> (max)</code>
            </div>
        </div>

        <p class="dc-disclaimer">Single-hit damage without weather, items, abilities or critical hits. Meant to understand the base mechanics of battles.</p>
    `;
}

function natureNote(nature, statName) {
    const mod = (natureEffects[nature] || {})[statName];
    if (!mod) return '';
    return mod > 1 ? ` × 1.1 <span class="dc-tag ok">${capitalize(nature)} +</span>` : ` × 0.9 <span class="dc-tag bad">${capitalize(nature)} −</span>`;
}

function effectivenessLabel(m) {
    if (m === 0) return { text: 'No effect', klass: 'bad' };
    if (m >= 4) return { text: 'Super effective x4', klass: 'ok' };
    if (m > 1) return { text: 'Super effective', klass: 'ok' };
    if (m === 1) return { text: 'Neutral damage', klass: '' };
    if (m <= 0.25) return { text: 'Barely effective x0.25', klass: 'bad' };
    return { text: 'Not very effective', klass: 'bad' };
}

function knockoutInfo(dmg, hp) {
    if (dmg.maxDamage === 0) return { text: 'Deals no damage', klass: 'neutral' };
    if (dmg.minDamage >= hp) return { text: 'Guaranteed OHKO!', klass: 'ko' };
    if (dmg.maxDamage >= hp) return { text: 'Possible OHKO (depends on the roll)', klass: 'maybe' };
    const hits = Math.ceil(hp / dmg.maxDamage);
    return { text: `Needs at least ${hits} hits to faint (best case)`, klass: 'neutral' };
}

function showResultMessage(msg) {
    document.getElementById('result').innerHTML = `<div class="dc-result-placeholder">${msg}</div>`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
