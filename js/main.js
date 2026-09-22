// Sistema de múltiples equipos Pokémon
const API_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1010;

// Entrenador seleccionado para la comparación de tamaños (global, persistido).
const TRAINERS = [
    'ASH','OAK','BILL','AZUL1','AZUL2','AZUL3','AZUL4','AZUL5','AZUL6','ROJO1','ROJO2','ROJO3','ROJO4','ROJO5',
    'HOJA1','HOJA2','HOJA3','HOJA4','HOJA5','CINTIA','MAXIMO','MIRTO','SURYA','SURYA2','URANO1','ATENEA1','ATENEA2',
    'ATLAS1','ATLAS2','AGATHA1','GIOVANNI1','GIOVANNI2','GIOVANNI3','ALTOMANDO1','ALTOMANDO2','ALTOMANDO3','ALTOMANDO4',
    'CAMPEON','LIDER1','LIDER2','LIDER3','LIDER4','LIDER5','LIDER6','LIDER7','LIDER8',
    'LIDER1HOENN','LIDER2HOENN','LIDER3HOENN','LIDER4HOENN','LIDER5HOENN','LIDER6HOENN','LIDER7HOENN','LIDER8HOENN',
    'LIDER1REVANCHA','LIDER2REVANCHA','LIDER3REVANCHA','LIDER4REVANCHA','LIDER5REVANCHA','LIDER6REVANCHA','LIDER7REVANCHA','LIDER8REVANCHA',
    'CHICO','CHICA','GUAY','GUAYA','KARATEKA','KARATEKAA','CIENTIFICO','CIENTIFICA','NADADOR','NADADORA',
    'NINJA','NINJAA','PESCADOR','PESCADORA','MECANICO','MECANICA','CAZABICHOS','CAZABICHAS','CAMPISTO','CAMPISTA',
    'ROCKETO','ROCKETA','ELITEROCKET','MOTORISTA','MACARRA','MATON','LADRON','MARINERO','MONTANERO','MEDIUM',
    'EXORCISTA','BRUJITA','MALABARISTA','MODELO','FOTOGRAFA','JOVENRICA','DAMISELA','CABALLERO','CABALLERA',
    'VETERANO','VETERANA','ORNITOLOGO','POKEMANIACO','JUGON','CEREBRITO','ESTUDIANTA','TECNICO','PRISMA','PRISMF','PRISMM',
    'POKEMONTRAINER_HojaAria','POKEMONTRAINER_HojaNegra','POKEMONTRAINER_HojaNeutra',
    'POKEMONTRAINER_RojoArio','POKEMONTRAINER_RojoNegro','POKEMONTRAINER_RojoNeutro','POKEMONTRAINER_Yellow',
    'TB1','TB2','TB3','TB4','TB5','TB6','TB7','TB8','TB9','TB10','TB11','TB12','TB13','TB14','TB15','TB16','TB17','TB18',
    'TB19','TB20','TB21','TB22','TB23','TB24','TB25','TB26','TB27','TB28','TB29','TB30','TB31','TB32','TB33','TB34','TB35','TB36'
];
let selectedTrainer = localStorage.getItem('selected-trainer') || 'ROJO1';

function getTrainerImage(name) {
    return `../assets/images/Trainers/${name || selectedTrainer}.png`;
}

// Límites de EVs (competitivo)
const EV_MAX_TOTAL = 510;   // Límite duro: no se puede superar
const EV_MAX_USABLE = 508;  // Máximo realmente aprovechable (127 puntos x 4 EVs)
const EV_MAX_PER_STAT = 252; // Máximo por estadística

// Id del slider de EVs de cada estadística dentro del modal de configuración.
const EV_SLIDER_IDS = {
    hp: 'ev-hp', attack: 'ev-attack', defense: 'ev-defense',
    spAttack: 'ev-spattack', spDefense: 'ev-spdefense', speed: 'ev-speed'
};

// Etiqueta corta de cada estadística (mensajes de validación y tablas en vivo).
const EV_STAT_LABELS = {
    hp: 'HP', attack: 'Atk', defense: 'Def',
    spAttack: 'SpA', spDefense: 'SpD', speed: 'Spe'
};

// Presets de EVs más usados en competitivo. Ningún preset supera los 508 EVs útiles.
const EV_PRESETS = [
    { id: 'physical', label: '⚔️ Physical', hint: 'Atk 252 / Spe 252 / HP 4',
      evs: { hp: 4, attack: 252, defense: 0, spAttack: 0, spDefense: 0, speed: 252 } },
    { id: 'special', label: '✨ Special', hint: 'SpA 252 / Spe 252 / HP 4',
      evs: { hp: 4, attack: 0, defense: 0, spAttack: 252, spDefense: 0, speed: 252 } },
    { id: 'mixed', label: '🔀 Mixed', hint: 'Atk 128 / SpA 128 / Spe 252',
      evs: { hp: 0, attack: 128, defense: 0, spAttack: 128, spDefense: 0, speed: 252 } },
    { id: 'bulky-physical', label: '🛡️ Bulky Physical', hint: 'HP 252 / Atk 252 / Def 4',
      evs: { hp: 252, attack: 252, defense: 4, spAttack: 0, spDefense: 0, speed: 0 } },
    { id: 'bulky-special', label: '🛡️ Bulky Special', hint: 'HP 252 / SpA 252 / SpD 4',
      evs: { hp: 252, attack: 0, defense: 0, spAttack: 252, spDefense: 4, speed: 0 } },
    { id: 'reset', label: '↺ Reset', hint: '0 EVs en todas las estadísticas',
      evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 } }
];

let allPokemonList = [];
let pokemonCache = new Map();
let movesCache = new Map();
let abilityCache = new Map();
let teams = [];
let teamCounter = 0;

// Lista de objetos comunes para autocompletado
const commonItems = [
    // Objetos clásicos
    'Leftovers', 'Life Orb', 'Choice Band', 'Choice Specs', 'Choice Scarf', 'Focus Sash',
    'Assault Vest', 'Rocky Helmet', 'Heavy-Duty Boots', 'Eviolite', 'Sitrus Berry',
    'Lum Berry', 'Mental Herb', 'Power Herb', 'White Herb', 'Red Card', 'Eject Button',
    'Air Balloon', 'Weakness Policy', 'Expert Belt', 'Muscle Band', 'Wise Glasses',
    'Scope Lens', 'Razor Claw', 'King\'s Rock', 'Bright Powder', 'Lax Incense',
    'Charcoal', 'Mystic Water', 'Miracle Seed', 'Magnet', 'Sharp Beak', 'Poison Barb',
    'Soft Sand', 'Hard Stone', 'Silver Powder', 'Spell Tag', 'Metal Coat', 'Dragon Fang',
    'Black Belt', 'Black Glasses', 'Pink Bow', 'Fairy Feather', 'Never-Melt Ice',
    'Twisted Spoon', 'Silk Scarf', 'Iron Ball', 'Flame Orb', 'Toxic Orb', 'Black Sludge',
    'Wide Lens', 'Zoom Lens', 'Metronome', 'Lagging Tail', 'Sticky Barb',
    'Shed Shell', 'Big Root', 'Binding Band', 'Grip Claw', 'Quick Claw', 'Focus Band',
    
    // Megapiedras clásicas
    'Charizardite X', 'Charizardite Y', 'Venusaurite', 'Blastoisinite', 'Alakazite',
    'Gengarite', 'Kangaskhanite', 'Pinsirite', 'Gyaradosite', 'Aerodactylite',
    'Mewtwonite X', 'Mewtwonite Y', 'Ampharosite', 'Steelixite', 'Scizorite',
    'Heracronite', 'Houndoominite', 'Tyranitarite', 'Sceptilite', 'Blazikenite',
    'Swampertite', 'Gardevoirite', 'Sablenite', 'Mawilite', 'Aggronite', 'Medichamite',
    'Manectite', 'Sharpedonite', 'Cameruptite', 'Altarianite', 'Banettite', 'Absolite',
    'Glalitite', 'Salamencite', 'Metagrossite', 'Latiasite', 'Latiosite', 'Lopunnite',
    'Garchompite', 'Lucarionite', 'Abomasite', 'Galladite', 'Audinite', 'Diancite',
    
    // Nuevas Megapiedras (Legends Z-A)
    'Beedrillite', 'Pidgeotite', 'Slowbronite', 'Chestnaughtite', 'Delphoxite', 'Greninjaite',
    'Meganiumite', 'Feraligatrite', 'Emboarite', 'Drampite', 'Scolipedeite', 'Excadrillite',
    'Clefablite', 'Eelektrossite', 'Pyroarite', 'Zygardeite', 'Barbaraclite', 'Baxcaliburite',
    'Chandelurite', 'Chimelite', 'Crabominablite', 'Darkraiite', 'Dragalgite', 'Dragonite',
    'Falinksite', 'Froslasite', 'Glimmorite', 'Golisopodit', 'Golurkite', 'Hawluchite',
    'Heatranite', 'Magearnaite', 'Malamarite', 'Meowstickite', 'Raichuite X', 'Raichuite Y',
    'Rayquazite', 'Skarmorite', 'Staraptite', 'Starmite', 'Scraftite', 'Scovillainite',
    'Tatsugiriite', 'Victreebelite', 'Zeraorite',
    

    
    // Cristales Z
    'Normalium Z', 'Firium Z', 'Waterium Z', 'Electrium Z', 'Grassium Z', 'Icium Z',
    'Fightinium Z', 'Poisonium Z', 'Groundium Z', 'Flyinium Z', 'Psychium Z', 'Buginium Z',
    'Rockium Z', 'Ghostium Z', 'Dragonium Z', 'Darkinium Z', 'Steelium Z', 'Fairium Z',
    'Aloraichium Z', 'Decidium Z', 'Incinium Z', 'Primarium Z', 'Eevium Z', 'Snorlium Z',
    'Mewnium Z', 'Pikashunium Z', 'Marshadium Z', 'Ultranecrozium Z', 'Mimikium Z',
    'Lycanium Z', 'Kommonium Z', 'Solganium Z', 'Lunalium Z', 'Tapunium Z',
    
    // Objetos Gen 8 (Galar)
    'Room Service', 'Utility Umbrella', 'Blunder Policy', 'Throat Spray', 'Eject Pack',
    'Protective Pads', 'Terrain Extender', 'Electric Seed', 'Grassy Seed',
    'Misty Seed', 'Psychic Seed', 'Adrenaline Orb', 'Snowball', 'Luminous Moss',
    'Absorb Bulb', 'Cell Battery', 'Rusted Sword', 'Rusted Shield',
    
    // Objetos Gen 9 (Paldea)
    'Booster Energy', 'Ability Shield', 'Clear Amulet', 'Mirror Herb', 'Punching Glove',
    'Covert Cloak', 'Loaded Dice', 'Adamant Crystal', 'Lustrous Globe',
    'Griseous Core', 'Wellspring Mask', 'Hearthflame Mask', 'Cornerstone Mask',
    'Teal Mask', 'Malicious Armor', 'Auspicious Armor', 'Leader\'s Crest',
    'Scroll of Darkness', 'Scroll of Waters',
    
    // Bayas adicionales
    'Oran Berry', 'Pecha Berry', 'Rawst Berry', 'Chesto Berry', 'Aspear Berry',
    'Leppa Berry', 'Persim Berry', 'Figy Berry', 'Wiki Berry', 'Mago Berry',
    'Aguav Berry', 'Iapapa Berry', 'Liechi Berry', 'Ganlon Berry', 'Salac Berry',
    'Petaya Berry', 'Apicot Berry', 'Lansat Berry', 'Starf Berry', 'Enigma Berry',
    'Micle Berry', 'Custap Berry', 'Jaboca Berry', 'Rowap Berry', 'Kee Berry',
    'Maranga Berry', 'Roseli Berry', 'Babiri Berry', 'Chilan Berry', 'Coba Berry',
    'Colbur Berry', 'Haban Berry', 'Kasib Berry', 'Kebia Berry', 'Occa Berry',
    'Passho Berry', 'Payapa Berry', 'Rindo Berry', 'Shuca Berry', 'Tanga Berry',
    'Wacan Berry', 'Yache Berry',

    // Placas (Arceus / STAB)
    'Draco Plate', 'Dread Plate', 'Earth Plate', 'Fist Plate', 'Flame Plate',
    'Icicle Plate', 'Insect Plate', 'Iron Plate', 'Meadow Plate', 'Mind Plate',
    'Pixie Plate', 'Sky Plate', 'Splash Plate', 'Spooky Plate', 'Stone Plate',
    'Toxic Plate', 'Zap Plate', 'Blank Plate', 'Legend Plate',

    // Gemas
    'Normal Gem', 'Fire Gem', 'Water Gem', 'Electric Gem', 'Grass Gem', 'Ice Gem',
    'Fighting Gem', 'Poison Gem', 'Ground Gem', 'Flying Gem', 'Psychic Gem', 'Bug Gem',
    'Rock Gem', 'Ghost Gem', 'Dragon Gem', 'Dark Gem', 'Steel Gem', 'Fairy Gem',

    // Drives (Genesect) y memorias (Silvally)
    'Burn Drive', 'Chill Drive', 'Douse Drive', 'Shock Drive',
    'Bug Memory', 'Dark Memory', 'Dragon Memory', 'Electric Memory', 'Fairy Memory',
    'Fighting Memory', 'Fire Memory', 'Flying Memory', 'Ghost Memory', 'Grass Memory',
    'Ground Memory', 'Ice Memory', 'Poison Memory', 'Psychic Memory', 'Rock Memory',
    'Steel Memory', 'Water Memory',

    // Inciensos
    'Sea Incense', 'Lax Incense', 'Odd Incense', 'Rock Incense', 'Rose Incense',
    'Wave Incense', 'Full Incense', 'Luck Incense', 'Pure Incense', 'Pink Bow',

    // Otros objetos de utilidad y competitivos
    'Leek', 'Stick', 'Light Ball', 'Thick Club', 'Lucky Punch', 'Metal Powder',
    'Quick Powder', 'Soul Dew', 'Deep Sea Tooth', 'Deep Sea Scale', 'Adamant Orb',
    'Lustrous Orb', 'Griseous Orb', 'Blue Orb', 'Red Orb', 'Berry Juice',
    'Shell Bell', 'Destiny Knot', 'Float Stone', 'Ring Target', 'Safety Goggles',
    'Weakness Policy', 'Throat Spray', 'Blunder Policy', 'Heavy-Duty Boots',
    'Power Anklet', 'Power Band', 'Power Belt', 'Power Bracer', 'Power Lens',
    'Power Weight', 'Macho Brace', 'Lucky Egg', 'Amulet Coin', 'Cleanse Tag',
    'Everstone', 'Soothe Bell', 'Reaper Cloth', 'Razor Fang', 'Dragon Scale',
    'Prism Scale', 'Up-Grade', 'Dubious Disc', 'Protector', 'Electirizer',
    'Magmarizer', 'Oval Stone', 'Whipped Dream', 'Sachet'
];

// Efectos de naturalezas
const natureEffects = {
    hardy: {}, lonely: {attack: 1.1, defense: 0.9}, brave: {attack: 1.1, speed: 0.9},
    adamant: {attack: 1.1, spAttack: 0.9}, naughty: {attack: 1.1, spDefense: 0.9},
    bold: {defense: 1.1, attack: 0.9}, docile: {}, relaxed: {defense: 1.1, speed: 0.9},
    impish: {defense: 1.1, spAttack: 0.9}, lax: {defense: 1.1, spDefense: 0.9},
    timid: {speed: 1.1, attack: 0.9}, hasty: {speed: 1.1, defense: 0.9},
    serious: {}, jolly: {speed: 1.1, spAttack: 0.9}, naive: {speed: 1.1, spDefense: 0.9},
    modest: {spAttack: 1.1, attack: 0.9}, mild: {spAttack: 1.1, defense: 0.9},
    quiet: {spAttack: 1.1, speed: 0.9}, bashful: {}, rash: {spAttack: 1.1, spDefense: 0.9},
    calm: {spDefense: 1.1, attack: 0.9}, gentle: {spDefense: 1.1, defense: 0.9},
    sassy: {spDefense: 1.1, speed: 0.9}, careful: {spDefense: 1.1, spAttack: 0.9}, quirky: {}
};

// Tabla de efectividad de tipos
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

document.addEventListener('DOMContentLoaded', async function() {
    showLoading(true);
    await loadAllPokemon();
    setupEventListeners();
    await initializeTeams();
    setupTooltips();
    setupScrollBehavior();
    updateTeamNavigator();
    checkPokedexTransfer();
    showLoading(false);
});

function checkPokedexTransfer() {
    const transferData = localStorage.getItem('pokedex-to-teambuilder');
    if (transferData) {
        try {
            const data = JSON.parse(transferData);
            if (Date.now() - data.timestamp < 60000) {
                showPokedexTransferNotification(data);
            }
            localStorage.removeItem('pokedex-to-teambuilder');
        } catch (e) {
            console.error('Error procesando transferencia:', e);
        }
    }
}

function showPokedexTransferNotification(data) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="font-size: 1.1em; margin-bottom: 10px;">✨ Pokémon from Pokédex</div>
        <div style="font-weight: normal; margin-bottom: 15px; opacity: 0.9;">
            ${capitalizeFirst(data.name)} is ready to add to your team
        </div>
        <button onclick="addPokedexPokemonToTeam(${data.id}); this.parentElement.remove();" 
                style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 5px;">
            ➕ Add to first empty slot
        </button>
        <button onclick="this.parentElement.remove();" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%;">
            Close
        </button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 30000);
}

async function addPokedexPokemonToTeam(pokemonId) {
    if (teams.length === 0) {
        createNewTeam();
    }
    
    const team = teams[0];
    const emptySlot = team.pokemon.findIndex((p, i) => i < 6 && p === null);
    
    if (emptySlot === -1) {
        alert('The first team is full. Create a new team or free up a slot.');
        return;
    }
    
    await selectPokemon(team, emptySlot, pokemonId);
    
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.addPokedexPokemonToTeam = addPokedexPokemonToTeam;

function setupEventListeners() {
    document.getElementById('add-team').addEventListener('click', () => { createNewTeam(); closeSidebar(); });
    document.getElementById('toggle-all-teams').addEventListener('click', () => { toggleAllTeams(); closeSidebar(); });
    document.getElementById('clear-all').addEventListener('click', () => { clearAllTeams(); closeSidebar(); });
    document.getElementById('random-team').addEventListener('click', () => { createRandomTeam(); closeSidebar(); });
    document.getElementById('showdown-editor').addEventListener('click', () => { openGlobalShowdownEditor(); closeSidebar(); });
    document.getElementById('export-image').addEventListener('click', () => { exportTeamAsImage(); closeSidebar(); });
}

function setupScrollBehavior() {
    // Removed automatic scroll behavior
}

let sidebarVisible = false;
let navigatorVisible = false;

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-menu');
    const toggleText = document.querySelector('.toggle-text');
    
    if (sidebarVisible) {
        sidebar.style.transform = 'translateX(-100%)';
        toggleText.textContent = 'MENU';
        sidebarVisible = false;
    } else {
        sidebar.style.transform = 'translateX(0)';
        toggleText.textContent = '✕';
        sidebarVisible = true;
    }
}

function toggleTeamNavigator() {
    const teamNavigator = document.querySelector('.team-navigator');
    
    if (teamNavigator.style.display === 'block') {
        teamNavigator.style.display = 'none';
    } else {
        teamNavigator.style.display = 'block';
    }
}

function toggleTeamNavigator() {
    const navTeams = document.getElementById('nav-teams');
    const toggle = document.querySelector('.nav-toggle');
    
    if (navTeams.style.display === 'none') {
        navTeams.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        navTeams.style.display = 'none';
        toggle.textContent = '▶';
    }
}

function updateTeamNavigator() {
    const navTeams = document.getElementById('nav-teams');
    navTeams.innerHTML = '';
    
    teams.forEach((team, index) => {
        const navItem = document.createElement('div');
        navItem.className = 'nav-team-item';
        navItem.innerHTML = `
            <span class="nav-team-name">${team.name}</span>
            <span class="nav-team-count">${team.pokemon.slice(0, 6).filter(p => p !== null).length}/6</span>
        `;
        navItem.addEventListener('click', () => scrollToTeam(team.id));
        navTeams.appendChild(navItem);
    });
}

function scrollToTeam(teamId) {
    const teamElement = document.querySelector(`[data-team-id="${teamId}"]`);
    if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeSidebar();
}

function closeSidebar() {
    if (sidebarVisible) {
        const sidebar = document.querySelector('.sidebar-menu');
        const toggleText = document.querySelector('.toggle-text');
        sidebar.style.transform = 'translateX(-100%)';
        toggleText.textContent = 'MENU';
        sidebarVisible = false;
    }
}

async function loadAllPokemon() {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=2000`);
        const data = await response.json();
        
        allPokemonList = data.results.map((pokemon) => {
            const urlParts = pokemon.url.split('/');
            const realId = parseInt(urlParts[urlParts.length - 2]);
            
            let displayName = null;
            
            // Procesar formas regionales
            if (pokemon.name.includes('-')) {
                const parts = pokemon.name.split('-');
                const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                
                // Detectar formas automáticamente
                if (parts.includes('mega')) {
                    displayName = `${baseName} Mega ${parts[parts.length - 1].toUpperCase()}`;
                } else {
                    // Detectar cualquier forma automáticamente
                    const lastPart = parts[parts.length - 1];
                    
                    if (lastPart && lastPart !== baseName.toLowerCase()) {
                        const formName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
                        displayName = `${baseName} (${formName})`;
                    }
                }
            }
            
            return {
                ...pokemon,
                id: realId,
                displayName: displayName
            };
        });
        
        // Cargar formas regionales desde species
        const regionalForms = [];
        const speciesWithForms = ['raichu', 'sandshrew', 'sandslash', 'vulpix', 'ninetales', 'diglett', 'dugtrio', 'meowth', 'persian', 'geodude', 'graveler', 'golem', 'grimer', 'muk', 'exeggutor', 'marowak', 'ponyta', 'rapidash', 'slowpoke', 'slowbro', 'farfetchd', 'weezing', 'mr-mime', 'articuno', 'zapdos', 'moltres', 'slowking', 'corsola', 'zigzagoon', 'linoone', 'darumaka', 'darmanitan', 'yamask', 'stunfisk', 'growlithe', 'arcanine', 'voltorb', 'electrode', 'typhlosion', 'qwilfish', 'sneasel', 'samurott', 'lilligant', 'zorua', 'zoroark', 'braviary', 'sliggoo', 'goodra', 'avalugg', 'decidueye'];
        
        for (const speciesName of speciesWithForms) {
            try {
                const speciesResponse = await fetch(`${API_BASE}/pokemon-species/${speciesName}`);
                if (speciesResponse.ok) {
                    const speciesData = await speciesResponse.json();
                    
                    for (const variety of speciesData.varieties) {
                        if (!variety.is_default) {
                            const pokemonName = variety.pokemon.name;
                            const urlParts = variety.pokemon.url.split('/');
                            const pokemonId = parseInt(urlParts[urlParts.length - 2]);
                            
                            let displayName = null;
                            if (pokemonName.includes('-')) {
                                const parts = pokemonName.split('-');
                                const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                                
                                // Detectar cualquier forma automáticamente
                                const lastPart = parts[parts.length - 1];
                                
                                if (lastPart && lastPart !== baseName.toLowerCase()) {
                                    const formName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
                                    displayName = `${baseName} (${formName})`;
                                }
                            }
                            
                            if (displayName) {
                                regionalForms.push({
                                    name: pokemonName,
                                    url: variety.pokemon.url,
                                    id: pokemonId,
                                    displayName: displayName
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(`Error cargando especies ${speciesName}:`, error);
            }
        }
        
        allPokemonList = allPokemonList.concat(regionalForms);
        console.log(`Agregadas ${regionalForms.length} formas regionales`);
        
        // Debug: mostrar Pokémon con guiones
        const pokemonWithDashes = allPokemonList.filter(p => p.name.includes('-'));
        const processedRegionalForms = allPokemonList.filter(p => p.displayName);
        
        console.log(`Cargados ${allPokemonList.length} Pokémon para team builder`);
        console.log(`Pokémon con guiones: ${pokemonWithDashes.length}`);
        console.log('Ejemplos con guiones:', pokemonWithDashes.slice(0, 10).map(p => p.name));
        console.log(`Formas regionales procesadas: ${processedRegionalForms.length}`);
        console.log('Ejemplos regionales:', processedRegionalForms.slice(0, 5).map(p => `${p.name} -> ${p.displayName}`));
    } catch (error) {
        console.error('Error cargando lista de Pokémon:', error);
    }
}

// Funciones de sesión local
async function initializeTeams() {
    const savedTeams = loadFromSession();
    if (savedTeams && savedTeams.length > 0) {
        // Cargar equipos guardados
        teams.length = 0;
        teamCounter = 0;
        for (const savedTeam of savedTeams) {
            await loadSavedTeam(savedTeam);
        }
    } else {
        // Primera vez: cargar desde teams.txt
        await loadDefaultTeams();
    }
    
    if (teams.length === 0) {
        createFirstTeam();
    }
}

function createFirstTeam() {
    createNewTeam();
}

function saveToSession() {
    const teamsData = teams.map(team => ({
        id: team.id,
        name: team.name,
        pokemon: team.pokemon.slice(0, 6).map(pokemon => {
            if (!pokemon) return null;
            return {
                id: pokemon.id,
                name: pokemon.name,
                nickname: pokemon.nickname || '',
                level: pokemon.level,
                nature: pokemon.nature,
                gender: pokemon.gender || null,
                selectedAbility: pokemon.selectedAbility,
                moves: pokemon.moves || [],
                heldItem: pokemon.heldItem || '',
                pokeball: pokemon.pokeball || DEFAULT_POKEBALL,
                evs: pokemon.evs || null,
                ivs: pokemon.ivs || null,
                currentSprite: pokemon.currentSprite || 'front_default'
            };
        }),
        expanded: team.expanded
    }));
    localStorage.setItem('pokemon-teams', JSON.stringify(teamsData));
}

function loadFromSession() {
    const saved = localStorage.getItem('pokemon-teams');
    return saved ? JSON.parse(saved) : null;
}

async function loadDefaultTeams() {
    try {
        const response = await fetch('../teams/teams.txt');
        const teamsText = await response.text();
        syncWithShowdown(teamsText);
        saveToSession();
    } catch (error) {
        console.log('Could not load teams.txt automatically. Use "Sync Showdown" to load your teams.');
        createFirstTeam();
        
        // Mostrar mensaje informativo solo la primera vez
        if (!localStorage.getItem('pokemon-teams-info-shown')) {
            setTimeout(() => {
                alert('💡 Tip: Use the "Sync Showdown" button to load your teams from teams.txt');
                localStorage.setItem('pokemon-teams-info-shown', 'true');
            }, 1000);
        }
    }
}



async function loadSavedTeam(savedTeam) {
    teamCounter++;
    const team = {
        id: savedTeam.id || `team-${teamCounter}`,
        name: savedTeam.name || `Team ${teamCounter}`,
        pokemon: [null, null, null, null, null, null, null, null],

        expanded: savedTeam.expanded !== false
    };
    
    teams.push(team);
    renderTeam(team);
    
    // Cargar Pokémon guardados
    if (savedTeam.pokemon) {
        for (let i = 0; i < 6; i++) {
            const pokemonData = savedTeam.pokemon[i];
            if (pokemonData) {
                const pokemon = await fetchPokemonData(pokemonData.id);
                if (pokemon) {
                    // Cargar movimientos al cache
                    for (const move of pokemonData.moves || []) {
                        await fetchMoveData(move);
                    }
                    
                    team.pokemon[i] = {
                        ...pokemon,
                        nickname: pokemonData.nickname || '',
                        level: pokemonData.level || 50,
                        nature: pokemonData.nature || 'hardy',
                        gender: pokemonData.gender !== undefined ? pokemonData.gender : defaultGender(pokemon.genderRate),
                        selectedAbility: pokemonData.selectedAbility || pokemon.abilities[0]?.name,
                        moves: pokemonData.moves || [],
                        heldItem: pokemonData.heldItem || '',
                        pokeball: pokemonData.pokeball || DEFAULT_POKEBALL,
                        evs: pokemonData.evs || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
                        ivs: pokemonData.ivs || { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
                        currentSprite: pokemonData.currentSprite || 'front_default'
                    };
                }
            }
        }
        
        // Actualizar inputs
        const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
        if (teamElement) {
            const inputs = teamElement.querySelectorAll('.pokemon-autocomplete');
            inputs.forEach((input, index) => {
                if (team.pokemon[index]) {
                    input.value = team.pokemon[index].name.charAt(0).toUpperCase() + team.pokemon[index].name.slice(1);
                } else {
                    input.value = '';
                }
            });
        }
        
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        updateTeamNavigator();
        
        // Aplicar estado expandido/contraído guardado
        if (teamElement) {
            const teamBuilder = teamElement.querySelector('.team-builder');
            const expandBtn = teamElement.querySelector('.expand-toggle');
            
            if (team.expanded) {
                teamBuilder.classList.remove('team-collapsed');
                expandBtn.textContent = '▼';
            } else {
                teamBuilder.classList.add('team-collapsed');
                expandBtn.textContent = '▶';
                updateCompactView(team);
            }
        }
    }
}

function createNewTeam() {
    teamCounter++;
    const teamId = `team-${teamCounter}`;
    
    const team = {
        id: teamId,
        name: `Team ${teamCounter}`,
        pokemon: [null, null, null, null, null, null, null, null],
        expanded: true
    };
    
    teams.push(team);
    renderTeam(team);
    updateTeamNavigator();
    saveToSession();
}

function renderTeam(team) {
    const template = document.querySelector('.team-template');
    const teamElement = template.cloneNode(true);
    teamElement.className = 'team-instance';
    teamElement.dataset.teamId = team.id;
    teamElement.style.display = 'block';
    
    // Configurar nombre del equipo
    const teamNameInput = teamElement.querySelector('.team-name');
    teamNameInput.value = team.name;
    
    // Configurar drag & drop para los slots
    setupDragAndDrop(teamElement, team);
    
    teamNameInput.addEventListener('input', (e) => {
        team.name = e.target.value;
        saveToSession();
    });
    teamNameInput.addEventListener('click', (e) => e.stopPropagation());
    teamNameInput.addEventListener('focus', (e) => e.stopPropagation());
    
    // Configurar botones
    const removeBtn = teamElement.querySelector('.remove-team');
    const expandBtn = teamElement.querySelector('.expand-toggle');
    
    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeTeam(team.id); });
    expandBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleTeamExpansion(team); });
    
    // Hacer el header clickeable para expandir/contraer
    const teamHeader = teamElement.querySelector('.team-header');
    teamHeader.addEventListener('click', () => toggleTeamExpansion(team));
    
    // Configurar slots de Pokémon
    const slots = teamElement.querySelectorAll('.team-slot');
    slots.forEach((slot, index) => {
        const input = slot.querySelector('.pokemon-autocomplete');
        const dropdown = slot.querySelector('.autocomplete-dropdown');
        
        input.dataset.teamId = team.id;
        input.dataset.slot = index;
        dropdown.dataset.teamId = team.id;
        dropdown.dataset.slot = index;
        
        const generationSelect = slot.querySelector('.generation-filter');
        generationSelect.dataset.teamId = team.id;
        generationSelect.dataset.slot = index;
        
        input.addEventListener('input', (e) => handleAutocomplete(e, team, index));
        input.addEventListener('keydown', (e) => handleAutocompleteKeydown(e, team, index));
        input.addEventListener('blur', () => setTimeout(() => hideAutocomplete(team.id, index), 200));
        generationSelect.addEventListener('change', (e) => handleAutocomplete(e.target.nextElementSibling, team, index));
        
        const pokemonDisplay = slot.querySelector('.pokemon-display');
        pokemonDisplay.dataset.teamId = team.id;
        pokemonDisplay.dataset.slot = index;
        
        // Add drag and drop only for main team slots (0-5)
        if (index < 6) {
            pokemonDisplay.draggable = true;
            pokemonDisplay.addEventListener('dragstart', handleDragStart);
            pokemonDisplay.addEventListener('dragover', handleDragOver);
            pokemonDisplay.addEventListener('drop', handleDrop);
            pokemonDisplay.addEventListener('dragend', handleDragEnd);
        }
    });
    
    // Agregar event listener para configurar Pokémon
    teamElement.addEventListener('click', (e) => {
        if (e.target.closest('.pokemon-display.filled')) {
            const display = e.target.closest('.pokemon-display');
            const slotIndex = parseInt(display.dataset.slot);
            if (team.pokemon[slotIndex]) {
                openPokemonModal(team, slotIndex);
            }
        }
    });
    
    document.getElementById('teams-list').appendChild(teamElement);
    updateTeamDisplay(team);
}

function handleAutocomplete(event, team, slotIndex) {
    const input = event.target || event;
    const query = input.value.toLowerCase().trim();
    const dropdown = document.querySelector(`.autocomplete-dropdown[data-team-id="${team.id}"][data-slot="${slotIndex}"]`);
    const generationSelect = document.querySelector(`.generation-filter[data-team-id="${team.id}"][data-slot="${slotIndex}"]`);
    const selectedGen = generationSelect ? generationSelect.value : '';
    
    if (query.length < 2) {
        hideAutocomplete(team.id, slotIndex);
        return;
    }
    
    let filteredList = allPokemonList;
    
    // Filtrar por generación
    if (selectedGen) {
        const genRanges = {
            '1': [1, 151], '2': [152, 251], '3': [252, 386], '4': [387, 493],
            '5': [494, 649], '6': [650, 721], '7': [722, 809], '8': [810, 905], '9': [906, 1010]
        };
        const [start, end] = genRanges[selectedGen];
        filteredList = allPokemonList.filter(pokemon => pokemon.id >= start && pokemon.id <= end);
    }
    
    const matches = filteredList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query) ||
        (pokemon.displayName && pokemon.displayName.toLowerCase().includes(query))
    ).slice(0, 10);
    
    // Debug: mostrar qué se encontró
    if (query === 'rai') {
        console.log('Buscando "rai", encontrados:', matches.map(p => `${p.name} -> ${p.displayName || p.name}`));
    }
    
    if (matches.length === 0) {
        hideAutocomplete(team.id, slotIndex);
        return;
    }
    
    dropdown.innerHTML = '';
    matches.forEach((pokemon) => {
        const pokemonId = pokemon.id;
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        item.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" 
                 alt="${pokemon.name}" onerror="this.style.display='none'">
            <div class="autocomplete-item-info">
                <div class="autocomplete-item-name">${pokemon.displayName || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</div>
                <div class="autocomplete-item-types">#${pokemonId.toString().padStart(3, '0')}</div>
            </div>
        `;
        
        item.addEventListener('click', () => selectPokemon(team, slotIndex, pokemonId));
        dropdown.appendChild(item);
    });
    
    dropdown.classList.add('show');
}

function handleAutocompleteKeydown(event, team, slotIndex) {
    // Implementación básica para navegación con teclado
    if (event.key === 'Escape') {
        hideAutocomplete(team.id, slotIndex);
    }
}

function hideAutocomplete(teamId, slotIndex) {
    const dropdown = document.querySelector(`.autocomplete-dropdown[data-team-id="${teamId}"][data-slot="${slotIndex}"]`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

async function selectPokemon(team, slotIndex, pokemonId) {
    showLoading(true);
    
    const pokemon = await fetchPokemonData(pokemonId);
    if (pokemon) {
        // Cargar algunos movimientos iniciales únicos
        const uniqueMoves = new Map();
        pokemon.moves.forEach(m => {
            if (m.learnMethod === 'level-up' && m.level <= 10) {
                if (!uniqueMoves.has(m.name) || uniqueMoves.get(m.name).level > m.level) {
                    uniqueMoves.set(m.name, m);
                }
            }
        });
        
        const initialMoves = Array.from(uniqueMoves.values())
            .sort((a, b) => a.level - b.level)
            .slice(0, 4)
            .map(m => m.name);
        
        // Cargar datos de movimientos al cache
        for (const move of initialMoves) {
            await fetchMoveData(move);
        }
        
        team.pokemon[slotIndex] = {
            ...pokemon,
            level: 50,
            nature: 'hardy',
            gender: defaultGender(pokemon.genderRate),
            moves: initialMoves,
            selectedAbility: pokemon.abilities[0]?.name || null,
            nickname: '',
            currentSprite: 'front_default',
            heldItem: '',
            pokeball: DEFAULT_POKEBALL,
            evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
            ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 }
        };
        
        const input = document.querySelector(`.pokemon-autocomplete[data-team-id="${team.id}"][data-slot="${slotIndex}"]`);
        input.value = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        if (!team.expanded) {
            updateCompactView(team);
        }
    }
    
    hideAutocomplete(team.id, slotIndex);
    showLoading(false);
}

// Edición del nivel en línea: al hacer clic en el badge se convierte en un input (1-100).
function editLevel(teamId, slotIndex, badgeEl) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.pokemon[slotIndex]) return;
    const pokemon = team.pokemon[slotIndex];

    // Evitar abrir dos inputs sobre el mismo badge
    if (badgeEl.querySelector('input')) return;

    const current = pokemon.level || 50;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '100';
    input.value = current;
    input.style.cssText = 'width: 42px; font-size: 1em; font-weight: bold; text-align: center; border: 1px solid #667eea; border-radius: 6px; background: var(--bg-white); color: var(--text-primary);';

    badgeEl.textContent = 'Nv. ';
    badgeEl.appendChild(input);
    input.focus();
    input.select();

    // Evitar que los clics dentro del input propaguen al modal
    input.addEventListener('click', (e) => e.stopPropagation());

    const commit = () => {
        const level = Math.max(1, Math.min(100, parseInt(input.value) || current));
        pokemon.level = level;
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        setupTooltips();
        saveToSession();
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        else if (e.key === 'Escape') { input.value = current; input.blur(); }
    });
    input.addEventListener('blur', commit);
}

// Alterna el sexo del Pokémon (solo si la especie admite ambos).
function toggleGender(teamId, slotIndex) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.pokemon[slotIndex]) return;
    const pokemon = team.pokemon[slotIndex];
    if (!canChooseGender(pokemon.genderRate)) return; // fijo o sin género
    pokemon.gender = pokemon.gender === 'M' ? 'F' : 'M';
    updateTeamDisplay(team);
    saveToSession();
}

// HTML del símbolo de sexo (♂/♀) para la tarjeta. Vacío si no tiene género.
function getGenderBadge(pokemon, teamId, slotIndex) {
    const g = pokemon.gender;
    if (!g) return '';
    const editable = canChooseGender(pokemon.genderRate);
    const symbol = g === 'M' ? '♂' : '♀';
    const color = g === 'M' ? '#4299e1' : '#ed64a6';
    const clickAttr = editable
        ? `onclick="event.stopPropagation(); toggleGender('${teamId}', ${slotIndex})" title="Clic para cambiar el sexo" style="cursor: pointer; color: ${color}; font-weight: bold; font-size: 1em;"`
        : `title="Sexo fijo de esta especie" style="cursor: default; color: ${color}; font-weight: bold; font-size: 1em;"`;
    return `<span class="gender-badge" ${clickAttr}>${symbol}</span>`;
}

// Longitud máxima de mote (estándar Gen 6+ del juego oficial).
const NICKNAME_MAX_LENGTH = 12;

// Edición del mote en línea: al hacer clic se convierte en un input (1-12 caracteres).
// Si se deja vacío, se elimina el mote y vuelve a mostrarse el nombre de especie.
function editNickname(teamId, slotIndex, badgeEl) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.pokemon[slotIndex]) return;
    const pokemon = team.pokemon[slotIndex];

    if (badgeEl.querySelector('input')) return;

    const speciesName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const current = pokemon.nickname || '';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.maxLength = NICKNAME_MAX_LENGTH;
    input.placeholder = speciesName;
    input.style.cssText = 'width: 92px; font-size: 1em; font-weight: bold; text-align: center; border: 1px solid #667eea; border-radius: 6px; background: var(--bg-white); color: var(--text-primary);';

    badgeEl.textContent = '';
    badgeEl.appendChild(input);
    input.focus();
    input.select();

    input.addEventListener('click', (e) => e.stopPropagation());

    const commit = () => {
        // Recortar espacios sobrantes y limitar longitud (1-12). Vacío = sin mote.
        let value = input.value.replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX_LENGTH);
        pokemon.nickname = value; // '' => se usará el nombre de especie
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        setupTooltips();
        saveToSession();
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        else if (e.key === 'Escape') { input.value = current; input.blur(); }
    });
    input.addEventListener('blur', commit);
}

function changePokemonSprite(teamId, slotIndex, spriteType) {
    const team = teams.find(t => t.id === teamId);
    if (team && team.pokemon[slotIndex] && team.pokemon[slotIndex].sprites[spriteType]) {
        team.pokemon[slotIndex].currentSprite = spriteType;
        const spriteImg = document.getElementById(`pokemon-sprite-${teamId}-${slotIndex}`);
        if (spriteImg) {
            spriteImg.dataset.static = team.pokemon[slotIndex].sprites[spriteType] || '';
            spriteImg.src = getSpriteUrl(team.pokemon[slotIndex], spriteType);
        }
        updateTeamDisplay(team);
        saveToSession();
    }
}

async function fetchPokemonData(id) {
    if (pokemonCache.has(id)) {
        return pokemonCache.get(id);
    }
    
    try {
        // Para formas regionales (ID > 10000), usar el nombre del pokémon
        let pokemonUrl, speciesUrl;
        if (id > 10000) {
            // Buscar el nombre del pokémon en allPokemonList
            const pokemonEntry = allPokemonList.find(p => p.id === id);
            if (pokemonEntry) {
                pokemonUrl = `${API_BASE}/pokemon/${pokemonEntry.name}`;
                // Para species, usar el nombre base (sin la región)
                const baseName = pokemonEntry.name.split('-')[0];
                speciesUrl = `${API_BASE}/pokemon-species/${baseName}`;
            } else {
                pokemonUrl = `${API_BASE}/pokemon/${id}`;
                speciesUrl = `${API_BASE}/pokemon-species/${id}`;
            }
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
            // Sprites animados de Gen 5 (Black/White). Solo existen hasta ~Gen 5;
            // para el resto quedarán undefined y se usará el estático como fallback.
            animatedSprites: (() => {
                const anim = data.sprites?.versions?.['generation-v']?.['black-white']?.animated;
                if (!anim) return {};
                return {
                    front_default: anim.front_default,
                    back_default: anim.back_default,
                    front_shiny: anim.front_shiny,
                    back_shiny: anim.back_shiny
                };
            })(),
            height: data.height / 10,
            weight: data.weight / 10,
            // Datos de Pokédex (del endpoint species): descripción y categoría/género.
            pokedexEntry: (() => {
                if (!speciesData) return '';
                const entry = speciesData.flavor_text_entries?.find(e => e.language.name === 'en');
                return entry ? entry.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim() : '';
            })(),
            genus: (() => {
                if (!speciesData) return '';
                const g = speciesData.genera?.find(e => e.language.name === 'en');
                return g ? g.genus : '';
            })(),
            // Ratio de género: -1 sin género, 0 siempre ♂, 8 siempre ♀, 1-7 ambos.
            genderRate: speciesData ? speciesData.gender_rate : -1,
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
            )
        };
        
        pokemonCache.set(id, pokemon);
        return pokemon;
    } catch (error) {
        console.error(`Error cargando Pokémon ${id}:`, error);
        return null;
    }
}

function calculateFinalStats(pokemon) {
    const level = pokemon.level || 50;
    const nature = pokemon.nature || 'hardy';
    const effects = natureEffects[nature] || {};
    const evs = pokemon.evs || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
    const ivs = pokemon.ivs || { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 };
    
    const finalStats = {};
    
    // Fórmula HP: ((2 * Base + IV + EV/4) * Level / 100) + Level + 10
    finalStats.hp = Math.floor(((2 * pokemon.stats.hp + ivs.hp + Math.floor(evs.hp / 4)) * level / 100) + level + 10);
    
    // Fórmula otros stats: (((2 * Base + IV + EV/4) * Level / 100) + 5) * Nature
    ['attack', 'defense', 'spAttack', 'spDefense', 'speed'].forEach(stat => {
        let finalStat = Math.floor(((2 * pokemon.stats[stat] + ivs[stat] + Math.floor(evs[stat] / 4)) * level / 100) + 5);
        if (effects[stat]) {
            finalStat = Math.floor(finalStat * effects[stat]);
        }
        finalStats[stat] = finalStat;
    });
    
    return finalStats;
}

// Mantener función anterior para compatibilidad
function getModifiedStats(pokemon) {
    return calculateFinalStats(pokemon);
}

function updateTeamDisplay(team) {
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const teamCount = team.pokemon.slice(0, 6).filter(p => p !== null).length;
    
    // Actualizar contador con Pokéballs
    teamElement.querySelector('.team-count').innerHTML = getTeamBallsHtml(teamCount);
    
    // Calcular min/max de cada stat en el equipo para opacidad relativa
    const teamPokemon = team.pokemon.slice(0, 6).filter(p => p !== null);
    const statRanges = {};
    ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'].forEach(statKey => {
        const values = teamPokemon.map(p => p.stats[statKey]).filter(v => v !== undefined);
        if (values.length > 0) {
            statRanges[statKey] = {
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
    });
    
    // Actualizar displays de Pokémon
    const displays = teamElement.querySelectorAll('.pokemon-display');
    displays.forEach((display, index) => {
        const pokemon = team.pokemon[index];
        
        if (pokemon) {
            display.className = 'pokemon-display filled';
            
            // Agregar gradiente por tipos
            const typeGradient = getTypeGradient(pokemon.types);
            display.style.background = typeGradient;
            
            const nature = pokemon.nature || 'hardy';
            const effects = natureEffects[nature] || {};
            const finalStats = calculateFinalStats(pokemon);
            
            const statsHtml = Object.entries({
                'HP': {base: pokemon.stats.hp, key: 'hp'},
                'Atk': {base: pokemon.stats.attack, key: 'attack'},
                'Def': {base: pokemon.stats.defense, key: 'defense'},
                'SpA': {base: pokemon.stats.spAttack, key: 'spAttack'},
                'SpD': {base: pokemon.stats.spDefense, key: 'spDefense'},
                'Spe': {base: pokemon.stats.speed, key: 'speed'}
            }).map(([stat, {base, key}]) => {
                // Calcular opacidad relativa al equipo (0.15 = mínimo, 1.0 = máximo) - MÁS DRAMÁTICO
                let opacity = 1.0;
                let fontSize = 1.1; // Tamaño base
                if (statRanges[key] && teamPokemon.length > 1) {
                    const range = statRanges[key].max - statRanges[key].min;
                    if (range > 0) {
                        const normalized = (base - statRanges[key].min) / range;
                        opacity = 0.15 + normalized * 0.85; // Rango más dramático
                        fontSize = 0.95 + normalized * 0.25; // 0.95em a 1.2em
                    }
                }
                // Color por naturaleza sobre la stat REAL (se conserva el esquema actual):
                // rojo si la naturaleza sube esa stat, azul si la baja, neutro si no afecta.
                const isIncreased = effects[key] === 1.1;
                const isDecreased = effects[key] === 0.9;
                const realColor = isIncreased ? '#e53e3e' : isDecreased ? '#3182ce' : 'var(--text-primary)';

                // Stat real: incluye nivel + EVs + IVs + naturaleza.
                const realValue = finalStats[key];

                // Aporte REAL de los EVs a la estadística (no los EVs en crudo):
                // diferencia entre la stat final con EVs y la misma stat con 0 EVs,
                // respetando nivel, IVs y naturaleza. Cada 4 EVs = 1 punto (÷ nivel).
                const evAmount = (pokemon.evs && pokemon.evs[key]) || 0;
                let evBonus = 0;
                if (evAmount > 0) {
                    const statNoEvs = calculateFinalStats({ ...pokemon, evs: { ...(pokemon.evs || {}), [key]: 0 } });
                    evBonus = realValue - statNoEvs[key];
                }
                const evChip = evBonus > 0
                    ? `<span class="ev-bonus-chip" title="${evAmount} EVs → +${evBonus} ${stat} points"><span class="ev-chip-label">ᴇᴠ </span>+<span class="ev-chip-value">${evBonus}</span></span>`
                    : '';

                // Barra estilo juego (escala fija 0-255) del stat REAL, con una marca
                // del "real sin EVs" para ver de un vistazo cuánto aportan los EVs.
                const BAR_MAX = 550;
                const realPct = Math.min(100, (realValue / BAR_MAX) * 100);
                const noEvsValue = realValue - evBonus; // real con 0 EVs (mismo nivel/naturaleza)
                const basePct = Math.min(100, (noEvsValue / BAR_MAX) * 100);
                const barColor = getStatBarColor(realValue);
                const showMarker = evBonus > 0; // solo tiene sentido la marca si hay aporte de EVs

                // 2 zonas (números) + barra debajo. No se quita nada de lo anterior.
                return `
                    <div style="margin: 3px 0; padding: 2px 4px; background: rgba(102, 126, 234, 0.1); border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; height: 16px;">
                            <span style="display: flex; align-items: baseline; gap: 6px;">
                                <span style="font-size: 0.75em; font-weight: 600;">${stat}</span>
                                <span style="font-size: ${fontSize * 0.85}em; font-weight: bold; color: var(--text-primary); opacity: ${opacity * 0.7};">${base}</span>
                            </span>
                            <span style="display: flex; align-items: center; gap: 4px;">
                                ${evChip}
                                <span style="font-size: ${fontSize}em; font-weight: bold; color: ${realColor}; opacity: ${opacity};">${realValue}</span>
                            </span>
                        </div>
                        <div class="stat-bar-track" title="${stat}: ${realValue}">
                            <div class="stat-bar-fill" style="width: ${realPct}%; background: ${barColor};"></div>
                            ${showMarker ? `<div class="stat-bar-marker" style="left: ${basePct}%;" title="Without EVs: ${noEvsValue}"></div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Totales de la fila resumen de stats (misma lógica que cada fila individual):
            //   baseTotal = suma de las stats base.
            //   realTotal = suma de las stats finales ya calculadas (nivel + IVs + EVs + naturaleza).
            const baseTotal = Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0);
            const realTotal = Object.values(finalStats).reduce((sum, stat) => sum + stat, 0);

            const movesHtml = Array.from({length: 4}, (_, i) => {
                const move = pokemon.moves && pokemon.moves[i];
                if (move) {
                    const moveData = movesCache.get(move);
                    return `
                        <div class="move-slot filled move-tooltip" data-move="${move}" data-move-index="${i}" onclick="event.stopPropagation(); openMoveSelector('${team.id}', ${index}, ${i})" style="font-size: 0.75em; background: var(--bg-white); border: 1px solid var(--border-color); border-left: 4px solid ${moveData ? getTypeColor(moveData.type) : 'var(--border-color)'}; color: var(--text-primary); padding: 2px 6px; margin: 2px; border-radius: 3px; text-align: left; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.boxShadow='0 0 0 1px #667eea'" onmouseout="this.style.boxShadow='none'">
                            <span style="font-weight: bold;">${move.replace(/-/g, ' ')}</span>
                            <div style="display: flex; align-items: center; gap: 4px;">
                                ${moveData ? getTypeIconHtml(moveData.type, 0.6) : ''}
                                ${moveData ? getCategoryIconHtml(moveData.damage_class, 14) : ''}
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="move-slot empty" data-move-index="${i}" onclick="event.stopPropagation(); openMoveSelector('${team.id}', ${index}, ${i})" style="font-size: 0.75em; background: var(--bg-white); border: 1px dashed var(--border-color); color: #999; padding: 2px 6px; margin: 2px; border-radius: 3px; text-align: center; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='var(--border-color)'">
                            + Add move
                        </div>
                    `;
                }
            }).join('');
            
            display.innerHTML = `
                <button class="remove-btn" onclick="removePokemon('${team.id}', ${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(229, 62, 62, 0.85); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.9em; line-height: 1; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.25); transition: all 0.15s ease;" onmouseover="this.style.background='#e53e3e'; this.style.transform='scale(1.15)'" onmouseout="this.style.background='rgba(229, 62, 62, 0.85)'; this.style.transform='scale(1)'">&times;</button>

                ${getPokeballBadgeHtml(pokemon.pokeball, team.id, index)}
                
                <div style="position: relative; display: inline-block;">
                    <img id="pokemon-sprite-${team.id}-${index}" src="${getSpriteUrl(pokemon, pokemon.currentSprite || 'front_default')}" alt="${pokemon.name}" 
                         data-static="${pokemon.sprites[pokemon.currentSprite || 'front_default'] || ''}"
                         style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 8px;"
                         onerror="if(this.dataset.static && this.src !== this.dataset.static){this.src=this.dataset.static;}else{this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyNUM1NC4zNTk0IDI1IDY2IDM2LjY0MDYgNjYgNTFDNjYgNjUuMzU5NCA1NC4zNTk0IDc3IDQwIDc3QzI1LjY0MDYgNzcgMTQgNjUuMzU5NCAxNCA1MUMxNCAzNi42NDA2IDI1LjY0MDYgMjUgNDAgMjVaIiBmaWxsPSIjRTJFOEYwIi8+Cjwvc3ZnPgo=';}">
                    <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: flex; gap: 2px;">
                        <button onclick="changePokemonSprite('${team.id}', ${index}, 'front_default')" style="font-size: 0.5em; padding: 1px 2px; border: 1px solid #ccc; background: ${(pokemon.currentSprite || 'front_default') === 'front_default' ? '#007bff' : '#fff'}; color: ${(pokemon.currentSprite || 'front_default') === 'front_default' ? '#fff' : '#000'}; border-radius: 2px; cursor: pointer;">F</button>
                        ${pokemon.sprites.back_default ? `<button onclick="changePokemonSprite('${team.id}', ${index}, 'back_default')" style="font-size: 0.5em; padding: 1px 2px; border: 1px solid #ccc; background: ${pokemon.currentSprite === 'back_default' ? '#007bff' : '#fff'}; color: ${pokemon.currentSprite === 'back_default' ? '#fff' : '#000'}; border-radius: 2px; cursor: pointer;">B</button>` : ''}
                        ${pokemon.sprites.front_shiny ? `<button onclick="changePokemonSprite('${team.id}', ${index}, 'front_shiny')" style="font-size: 0.5em; padding: 1px 2px; border: 1px solid #ccc; background: ${pokemon.currentSprite === 'front_shiny' ? '#007bff' : '#fff'}; color: ${pokemon.currentSprite === 'front_shiny' ? '#fff' : '#000'}; border-radius: 2px; cursor: pointer;">S</button>` : ''}
                        ${pokemon.sprites.back_shiny ? `<button onclick="changePokemonSprite('${team.id}', ${index}, 'back_shiny')" style="font-size: 0.5em; padding: 1px 2px; border: 1px solid #ccc; background: ${pokemon.currentSprite === 'back_shiny' ? '#007bff' : '#fff'}; color: ${pokemon.currentSprite === 'back_shiny' ? '#fff' : '#000'}; border-radius: 2px; cursor: pointer;">BS</button>` : ''}
                    </div>
                </div>
                
                <div style="text-align: center; width: 100%; font-size: 0.8em;">
                    <div style="text-align: center; margin-bottom: 2px;">
                        <span class="nickname-badge${pokemon.nickname ? '' : ' species-tooltip'}" data-species-name="${pokemon.name}" onclick="event.stopPropagation(); editNickname('${team.id}', ${index}, this)" title="Clic para cambiar el mote (1-12 caracteres)" style="font-weight: bold; font-size: 1.1em; color: var(--text-primary); cursor: pointer;">
                            ${pokemon.nickname ? pokemon.nickname : pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </span>
                    </div>
                    <div style="text-align: center; margin-bottom: 2px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span class="level-badge" onclick="event.stopPropagation(); editLevel('${team.id}', ${index}, this)" title="Clic para cambiar el nivel (1-100)" style="display: inline-block; background: rgba(102, 126, 234, 0.15); color: var(--text-primary); padding: 2px 10px; border-radius: 10px; font-size: 0.9em; font-weight: bold; cursor: pointer; white-space: nowrap;">Nv. ${pokemon.level || 50}</span>
                        ${getGenderBadge(pokemon, team.id, index)}
                        ${(pokemon.currentSprite === 'front_shiny' || pokemon.currentSprite === 'back_shiny') ? '<span class="shiny-star-inline" title="Shiny">✨</span>' : ''}
                    </div>
                    <div style="font-size: 0.75em; color: var(--text-primary); margin-bottom: 2px; min-height: 1.2em;">
                        ${pokemon.nickname ? `<span class="species-tooltip" data-species-name="${pokemon.name}" style="cursor: help; border-bottom: 1px dotted currentColor;">(${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)})</span>` : ''}
                    </div>
                    
                    <div style="font-size: 0.85em; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span>#${pokemon.id.toString().padStart(3, '0')}</span>
                        ${getGenerationBadgeHtml(pokemon.id, pokemon.name, 16)}
                        ${getFootprintTag(pokemon.name, 18)}
                    </div>
                    
                    <div class="defense-tooltip" data-types="${pokemon.types.join(',')}" style="margin-bottom: 6px; cursor: help; display: flex; gap: 4px; justify-content: center; align-items: center;">
                        ${pokemon.types.map(type => getTypeIconHtml(type, 0.9)).join('')}
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; font-size: 0.75em; color: var(--text-primary);">
                        <div style="display: flex; justify-content: space-between; margin: 1px 0;">
                            <span>Height:</span><span>${pokemon.height}m</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 1px 0;">
                            <span>Weight:</span><span>${pokemon.weight}kg</span>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">Nature:</div>
                        <div class="nature-badge nature-tooltip" data-nature="${pokemon.nature || 'hardy'}" style="font-size: 0.75em; background: #fff3cd; border: 1px solid #ffc107; color: #333; padding: 2px 6px; margin: 1px; border-radius: 3px; text-align: center; cursor: help;">
                            ${pokemon.nature ? pokemon.nature.charAt(0).toUpperCase() + pokemon.nature.slice(1) : 'Hardy'}
                            ${(() => {
                                const nature = pokemon.nature || 'hardy';
                                const effects = natureEffects[nature] || {};
                                const entries = Object.entries(effects);
                                if (entries.length === 0) return '';
                                
                                const statNames = { attack: 'Atk', defense: 'Def', spAttack: 'SpA', spDefense: 'SpD', speed: 'Spe' };
                                const increased = entries.find(([stat, mult]) => mult === 1.1);
                                const decreased = entries.find(([stat, mult]) => mult === 0.9);
                                
                                let result = '';
                                if (increased) result += ` <span style="color: #e53e3e; font-weight: bold;">+${statNames[increased[0]]}</span>`;
                                if (decreased) result += ` <span style="color: #3182ce; font-weight: bold;">-${statNames[decreased[0]]}</span>`;
                                return result;
                            })()}
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">Ability:</div>
                        ${pokemon.selectedAbility ? (() => {
                            const selectedAbilityData = pokemon.abilities.find(a => a.name === pokemon.selectedAbility);
                            return `<div class="ability-tooltip ability-badge" data-ability="${pokemon.selectedAbility}" style="font-size: 0.75em; background: ${selectedAbilityData?.hidden ? '#fef5e7' : '#e6fffa'}; border: 1px solid ${selectedAbilityData?.hidden ? '#f6ad55' : '#38b2ac'}; color: #333; padding: 2px 6px; margin: 1px; border-radius: 3px; cursor: help;">
                                ${pokemon.selectedAbility.replace(/-/g, ' ')}${selectedAbilityData?.hidden ? ' (H)' : ''}
                            </div>`;
                        })() : '<div style="font-size: 0.75em; color: #999;">Not selected</div>'}
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">Item:</div>
                        ${pokemon.heldItem ? `<div class="item-badge item-tooltip" data-item-name="${pokemon.heldItem}" style="font-size: 0.65em; background: #fff3cd; border: 1px solid #ffc107; color: #333; padding: 1px 4px; margin: 1px; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: help;">
                            ${getItemImageTag(pokemon.heldItem, 16)}<span>${pokemon.heldItem}</span>
                        </div>` : `<div style="font-size: 0.75em; color: #999; font-style: italic; text-align: center;">No item</div>`}
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">EVs:</div>
                        ${pokemon.evs && Object.values(pokemon.evs).some(ev => ev > 0) ? `<div style="font-size: 0.8em; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;">
                            ${pokemon.evs.hp > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.hp / 252) * 0.25}em; font-weight: ${pokemon.evs.hp >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.hp / 252) * 0.5};">HP: ${pokemon.evs.hp}</div>` : ''}
                            ${pokemon.evs.attack > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.attack / 252) * 0.25}em; font-weight: ${pokemon.evs.attack >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.attack / 252) * 0.5};">Atk: ${pokemon.evs.attack}</div>` : ''}
                            ${pokemon.evs.defense > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.defense / 252) * 0.25}em; font-weight: ${pokemon.evs.defense >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.defense / 252) * 0.5};">Def: ${pokemon.evs.defense}</div>` : ''}
                            ${pokemon.evs.spAttack > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.spAttack / 252) * 0.25}em; font-weight: ${pokemon.evs.spAttack >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.spAttack / 252) * 0.5};">SpA: ${pokemon.evs.spAttack}</div>` : ''}
                            ${pokemon.evs.spDefense > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.spDefense / 252) * 0.25}em; font-weight: ${pokemon.evs.spDefense >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.spDefense / 252) * 0.5};">SpD: ${pokemon.evs.spDefense}</div>` : ''}
                            ${pokemon.evs.speed > 0 ? `<div style="font-size: ${0.8 + (pokemon.evs.speed / 252) * 0.25}em; font-weight: ${pokemon.evs.speed >= 252 ? 'bold' : 'normal'}; opacity: ${0.5 + (pokemon.evs.speed / 252) * 0.5};">Spe: ${pokemon.evs.speed}</div>` : ''}
                        </div>` : `<div style="font-size: 0.75em; color: #999; font-style: italic; text-align: center;">No EVs assigned</div>`}
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; margin-bottom: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">Stats:</div>
                        ${statsHtml}
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 3px 0; padding: 2px 4px; background: rgba(102, 126, 234, 0.15); border-radius: 4px; border-top: 1px solid rgba(102, 126, 234, 0.3); margin-top: 5px;">
                            <span style="display: flex; align-items: baseline; gap: 5px;">
                                <span class="stat-total-tag" title="Base Stat total (sum of base stats)">BS</span>
                                <span style="font-size: 0.95em; font-weight: bold; color: var(--text-primary); opacity: 0.7;" title="Base total: ${baseTotal}">${baseTotal}</span>
                            </span>
                            <span style="display: flex; align-items: baseline; gap: 5px;">
                                <span class="stat-total-tag" title="Final Stat total (level, IVs, EVs and nature)">FS</span>
                                <span style="font-size: 1.1em; font-weight: bold; color: var(--text-primary);" title="Real total (level, IVs, EVs, nature): ${realTotal}">${realTotal}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-white); border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; color: var(--text-primary);">
                        <div style="font-size: 0.7em; font-weight: bold; margin-bottom: 2px; color: var(--text-primary);">Moves:</div>
                        ${movesHtml}
                    </div>
                </div>
            `;
        } else {
            display.className = 'pokemon-display';
            display.style.background = 'var(--bg-white)';
            display.innerHTML = `
                <div class="empty-slot">
                    <span class="add-icon">+</span>
                    <span class="slot-text">Selecciona un Pokémon</span>
                </div>
            `;
        }
        // Si el detalle flotante del equipo colapsado está abierto para este slot,
        // reconstruirlo desde la ficha ya actualizada (edición inline en vivo).
        // Se hace en diferido para que el DOM del slot ya esté actualizado.
        if (typeof refreshCompactPokemonDetail === 'function') {
            const refreshTeamId = team.id;
            const refreshSlot = index;
            setTimeout(() => refreshCompactPokemonDetail(refreshTeamId, refreshSlot), 0);
        }
    });
}

function removePokemon(teamId, slotIndex) {
    const team = teams.find(t => t.id === teamId);
    if (team) {
        team.pokemon[slotIndex] = null;

        const input = document.querySelector(`.pokemon-autocomplete[data-team-id="${teamId}"][data-slot="${slotIndex}"]`);
        if (input) input.value = '';

        // Si el detalle flotante mostraba este Pokémon, cerrarlo (ya no existe).
        const compactModal = document.getElementById('compact-pokemon-modal');
        if (compactModal && compactModal.style.display === 'block'
            && compactModal.dataset.teamId === String(teamId)
            && parseInt(compactModal.dataset.slotIndex) === slotIndex) {
            closeCompactPokemonDetail();
        }

        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        if (!team.expanded) {
            updateCompactView(team);
        }
        saveToSession();
    }
}



function removeTeam(teamId) {
    if (teams.length <= 1) {
        alert('You must keep at least one team');
        return;
    }
    
    if (confirm('Are you sure you want to delete this team?')) {
        teams = teams.filter(t => t.id !== teamId);
        document.querySelector(`[data-team-id="${teamId}"]`).remove();
        updateTeamNavigator();
        saveToSession();
    }
}

function toggleTeamExpansion(team) {
    team.expanded = !team.expanded;
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const teamBuilder = teamElement.querySelector('.team-builder');
    const expandBtn = teamElement.querySelector('.expand-toggle');
    
    if (team.expanded) {
        teamBuilder.classList.remove('team-collapsed');
        expandBtn.textContent = '▼';
    } else {
        teamBuilder.classList.add('team-collapsed');
        expandBtn.textContent = '▶';
        updateCompactView(team);
    }
    
    saveToSession();
}

function updateCompactView(team) {
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const compactContainer = teamElement.querySelector('.compact-size-comparison');
    const teamPokemon = team.pokemon.slice(0, 6).filter(p => p !== null);
    
    if (teamPokemon.length === 0) {
        compactContainer.innerHTML = '<p style="text-align: center; color: #666;">Empty team</p>';
        return;
    }
    
    const trainerHeight = 1.75;
    const maxHeight = Math.max(trainerHeight, ...teamPokemon.map(p => p.height));
    const scale = 80 / maxHeight;
    
    let html = `
        <div class="size-display">
            <div class="size-item trainer-reference">
                <img src="${getTrainerImage()}" alt="Entrenador" title="Clic para cambiar el entrenador" onclick="event.stopPropagation(); openTrainerSelector()" style="height: ${trainerHeight * scale}px; cursor: pointer;" onerror="this.src='../assets/images/Trainers/ROJO1.png'">
                <div>Entrenador<br>1.75m</div>
            </div>
    `;
    
    teamPokemon.forEach((pokemon, filteredPos) => {
        // NOTA: teamPokemon ya viene filtrado (sin nulos), así que hay que
        // recuperar el índice real del slot para poder abrir el detalle.
        // Se busca a partir de la posición ya resuelta para no colisionar
        // cuando el equipo tiene dos veces el mismo objeto Pokémon.
        const slotIndex = team.pokemon.slice(0, 6).indexOf(pokemon, filteredPos);
        const safeTeamId = team.id.replace(/'/g, "\\'");
        const rawName = pokemon.nickname || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const safeName = rawName.replace(/"/g, '&quot;');
        html += `
            <div class="size-item size-item-clickable" role="button" tabindex="0" onclick="openCompactPokemonDetail('${safeTeamId}', ${slotIndex})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCompactPokemonDetail('${safeTeamId}', ${slotIndex});}" title="Ver ficha de ${safeName}" style="cursor: pointer;">
                <img src="${getSpriteUrl(pokemon, pokemon.currentSprite || 'front_default')}" 
                     data-static="${pokemon.sprites[pokemon.currentSprite || 'front_default'] || ''}"
                     onerror="if(this.dataset.static && this.src !== this.dataset.static){this.src=this.dataset.static;}"
                     alt="${pokemon.name}" 
                     style="height: ${pokemon.height * scale}px;">
                <div>${safeName}<br>${pokemon.height}m</div>
            </div>
        `;
    });
    
    html += '</div>';
    compactContainer.innerHTML = html;
}

// Ventana flotante de SOLO VISUALIZACIÓN de un Pokémon cuando el equipo está
// colapsado. Clona la misma ficha que `updateTeamDisplay` (misma apariencia)
// pero en modo lectura: sin editar mote/nivel/sexo/sprite, sin borrar y sin
// configuración. Para editar se usa la vista expandida o el modal clásico.
function openCompactPokemonDetail(teamId, slotIndex) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.pokemon[slotIndex]) return;

    let modal = document.getElementById('compact-pokemon-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'compact-pokemon-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content compact-detail-content">
                <span class="close">&times;</span>
                <div class="compact-detail-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close').addEventListener('click', closeCompactPokemonDetail);
        // Cerrar al clickar fuera del contenido (overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCompactPokemonDetail();
        });
    }

    modal.dataset.teamId = teamId;
    modal.dataset.slotIndex = slotIndex;

    renderCompactPokemonDetailBody(team, slotIndex);

    modal.style.display = 'block';
    setupTooltips();
    modal.dataset.refreshKey = `${teamId}:${slotIndex}:${Date.now()}`;
}

function closeCompactPokemonDetail() {
    const modal = document.getElementById('compact-pokemon-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Refresca la ventana flotante de detalle si está abierta para ese slot.
// Se llama desde updateTeamDisplay para que mote/nivel/sexo/sprite/movimientos
// editados en la vista expandida se vean al instante sin cerrar y reabrir.
function refreshCompactPokemonDetail(teamId, slotIndex) {
    const modal = document.getElementById('compact-pokemon-modal');
    if (!modal || modal.style.display !== 'block') return;
    if (modal.dataset.teamId !== String(teamId) || parseInt(modal.dataset.slotIndex) !== slotIndex) return;
    const content = modal.querySelector('.modal-content');
    const scrollTop = content ? content.scrollTop : 0;
    openCompactPokemonDetail(teamId, slotIndex);
    const newContent = modal.querySelector('.modal-content');
    if (newContent) newContent.scrollTop = scrollTop;
}

// Renderiza el clon de la ficha del Pokémon dentro del flotante.
//
// El cuerpo del flotante (#compact-detail-body) contiene una copia de la
// ficha que updateTeamDisplay ya calculó para el slot real. updateTeamDisplay
// pinta el slot incluso cuando el equipo está colapsado (solo se oculta el
// bloque .team-builder), así que siempre podemos clonarlo.
function renderCompactPokemonDetailBody(team, slotIndex) {
    const modal = document.getElementById('compact-pokemon-modal');
    if (!modal) return;
    const body = modal.querySelector('.compact-detail-body');
    if (!body) return;

    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const display = teamElement
        ? teamElement.querySelector(`.pokemon-display[data-team-id="${team.id}"][data-slot="${slotIndex}"]`)
        : null;

    body.innerHTML = '';
    if (display) {
        const clone = display.cloneNode(true);
        // El clon se muestra como solo lectura:
        // - quitar listeners inline que abran el modal clásico / edits
        clone.querySelectorAll('[onclick], [onmouseover], [onmouseout]').forEach(n => {
            n.removeAttribute('onclick');
            n.removeAttribute('onmouseover');
            n.removeAttribute('onmouseout');
        });
        // - quitar el botón de borrar Pokémon (no debe aparecer aquí)
        const removeBtn = clone.querySelector('.remove-btn');
        if (removeBtn) removeBtn.remove();
        // - quitar botones de sprite (F/B/S/BS) que cambian de sprite
        clone.querySelectorAll('button[onclick*="changePokemonSprite"]').forEach(b => b.remove());
        // - desactivar tooltips inline que dependan del slot real (se rehace con setupTooltips)
        clone.querySelectorAll('.item-badge, .ability-badge, .nature-badge, .move-slot, .species-tooltip, .defense-tooltip').forEach(el => {
            el.style.pointerEvents = 'auto';
        });
        // - el id del sprite debe ser único: quitarlo
        const spriteImg = clone.querySelector('img[id^="pokemon-sprite-"]');
        if (spriteImg) spriteImg.removeAttribute('id');

        body.appendChild(clone);
    } else {
        body.innerHTML = '<p style="padding:10px; color:#999;">Loading Pokémon data…</p>';
    }
}

function updateTeamAnalysis(team) {
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const teamPokemon = team.pokemon.slice(0, 6).filter(p => p !== null);
    
    // Actualizar comparación de tamaños
    const sizeContainer = teamElement.querySelector('.size-comparison-content');
    if (teamPokemon.length === 0) {
        sizeContainer.innerHTML = '<p>Add Pokémon to see size comparison</p>';
    } else {
        const trainerHeight = 1.75;
        const maxHeight = Math.max(trainerHeight, ...teamPokemon.map(p => p.height));
        const scale = 150 / maxHeight;
        
        let html = `
            <div class="size-item trainer-reference">
                <img src="${getTrainerImage()}" alt="Entrenador" title="Clic para cambiar el entrenador" onclick="event.stopPropagation(); openTrainerSelector()" style="height: ${trainerHeight * scale}px; cursor: pointer;" onerror="this.src='../assets/images/Trainers/ROJO1.png'">
                <div style="color: #333;">Entrenador<br>1.75m</div>
            </div>
        `;
        
        teamPokemon.forEach(pokemon => {
            html += `
                <div class="size-item">
                    <img src="${getSpriteUrl(pokemon, pokemon.currentSprite || 'front_default')}" 
                         data-static="${pokemon.sprites[pokemon.currentSprite || 'front_default'] || ''}"
                         onerror="if(this.dataset.static && this.src !== this.dataset.static){this.src=this.dataset.static;}"
                         alt="${pokemon.name}" style="height: ${pokemon.height * scale}px;">
                    <div style="color: #333;">${pokemon.nickname}<br>${pokemon.height}m</div>
                </div>
            `;
        });
        
        sizeContainer.innerHTML = html;
    }
    
    // Actualizar análisis completo
    updateTypeCoverage(team, teamElement, teamPokemon);
    updateTeamWeaknesses(team, teamElement, teamPokemon);
    updateAttackDistribution(team, teamElement, teamPokemon);
}

function updateTypeCoverage(team, teamElement, teamPokemon) {
    const typeChartDiv = teamElement.querySelector('.type-chart');
    
    if (teamPokemon.length === 0) {
        typeChartDiv.innerHTML = '<p>Add Pokémon to see offensive coverage</p>';
        return;
    }
    
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    const moveTypes = new Set();
    
    // Recopilar tipos de movimientos ofensivos
    teamPokemon.forEach(pokemon => {
        if (pokemon.moves) {
            pokemon.moves.forEach(moveName => {
                const moveData = movesCache.get(moveName);
                if (moveData && moveData.damage_class !== 'status') {
                    moveTypes.add(moveData.type);
                }
            });
        }
    });
    
    // Calcular qué tipos puede golpear súper efectivamente
    const superEffectiveAgainst = [];
    const weakCoverage = [];
    
    allTypes.forEach(defType => {
        let canHitSuperEffective = false;
        
        moveTypes.forEach(atkType => {
            const eff = getTypeEffectiveness(atkType, [defType]);
            if (eff > 1) {
                canHitSuperEffective = true;
            }
        });
        
        if (canHitSuperEffective) {
            superEffectiveAgainst.push(defType);
        } else {
            weakCoverage.push(defType);
        }
    });
    
    const superEffectiveHtml = superEffectiveAgainst.map(type => 
        getTypeIconHtml(type, 0.8)
    ).join(' ');
    
    const weakCoverageHtml = weakCoverage.map(type => 
        `<span style="opacity: 0.45;">${getTypeIconHtml(type, 0.8)}</span>`
    ).join(' ');
    
    typeChartDiv.innerHTML = `
        <div><strong>Super effective against:</strong><br>${superEffectiveHtml || 'No type'}</div>
        <div style="margin-top: 10px;"><strong>No coverage:</strong><br>${weakCoverageHtml || 'Full coverage'}</div>
    `;
}

function updateTeamRoles(team, teamElement, teamPokemon) {
    const statsChart = teamElement.querySelector('.stats-chart');
    
    if (teamPokemon.length === 0) {
        statsChart.innerHTML = '<p>Add Pokémon to see team roles</p>';
        return;
    }
    
    const roles = teamPokemon.map(pokemon => {
        const modifiedStats = getModifiedStats(pokemon);
        const { attack, spAttack, defense, spDefense, speed, hp } = modifiedStats;
        
        let role = 'Balanced';
        let roleColor = '#6b7280';
        let roleIcon = '⚖️';
        
        if (attack > 100 || spAttack > 100) {
            if (speed > 100) {
                role = 'Sweeper';
                roleColor = '#ef4444';
                roleIcon = '⚔️';
            } else {
                role = 'Wallbreaker';
                roleColor = '#f97316';
                roleIcon = '💥';
            }
        } else if ((defense > 100 || spDefense > 100) && hp > 80) {
            role = 'Tank';
            roleColor = '#3b82f6';
            roleIcon = '🛡️';
        } else if (speed > 110) {
            role = 'Support';
            roleColor = '#10b981';
            roleIcon = '🎯';
        }
        
        return { name: pokemon.name, role, roleColor, roleIcon, bst: Object.values(modifiedStats).reduce((a, b) => a + b, 0) };
    });
    
    const rolesHtml = roles.map(({ name, role, roleColor, roleIcon, bst }) => 
        `<div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0; padding: 4px 8px; background: #f3f4f6; border-radius: 4px;">
            <span style="font-weight: bold; color: #333;">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
            <span style="color: ${roleColor}; font-weight: bold;">${roleIcon} ${role}</span>
            <span style="font-size: 0.8em; color: #6b7280;">BST: ${bst}</span>
        </div>`
    ).join('');
    
    const roleCount = roles.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});
    
    const balanceHtml = Object.entries(roleCount)
        .map(([role, count]) => `<span style="margin-right: 8px;">${role}: ${count}</span>`)
        .join('');
    
    statsChart.innerHTML = `
        <div><strong>Team balance:</strong><br><div style="font-size: 0.9em; margin: 8px 0;">${balanceHtml}</div></div>
        <div style="margin-top: 10px;"><strong>Individual roles:</strong><br>${rolesHtml}</div>
    `;
}

function updateTeamWeaknesses(team, teamElement, teamPokemon) {
    const weaknessList = teamElement.querySelector('.weaknesses-list');
    
    if (teamPokemon.length === 0) {
        weaknessList.innerHTML = '<p>Add Pokémon to see team weaknesses</p>';
        return;
    }
    
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    const teamWeaknesses = {};
    const teamResistances = {};
    const teamImmunities = {};
    
    allTypes.forEach(atkType => {
        const weaknesses = [];
        const resistances = [];
        const immunities = [];
        
        teamPokemon.forEach(pokemon => {
            const effectiveness = getTypeEffectiveness(atkType, pokemon.types);
            if (effectiveness > 1) {
                weaknesses.push({ name: pokemon.name, multiplier: effectiveness });
            } else if (effectiveness === 0) {
                immunities.push({ name: pokemon.name });
            } else if (effectiveness < 1 && effectiveness > 0) {
                resistances.push({ name: pokemon.name, multiplier: effectiveness });
            }
        });
        
        if (weaknesses.length > 0) teamWeaknesses[atkType] = weaknesses;
        if (resistances.length > 0) teamResistances[atkType] = resistances;
        if (immunities.length > 0) teamImmunities[atkType] = immunities;
    });
    
    const weaknessesHtml = Object.entries(teamWeaknesses)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 6)
        .map(([type, weaknesses]) => {
            const x4Count = weaknesses.filter(w => w.multiplier === 4).length;
            const x2Count = weaknesses.filter(w => w.multiplier === 2).length;
            let extra = `(${weaknesses.length})`;
            if (x4Count > 0) extra += ` x4:${x4Count}`;
            if (x2Count > 0) extra += ` x2:${x2Count}`;
            return typeCountChip(type, extra);
        })
        .join('');
    
    const resistancesHtml = Object.entries(teamResistances)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 6)
        .map(([type, resistances]) => typeCountChip(type, `(${resistances.length})`))
        .join('');
    
    const immunitiesHtml = Object.entries(teamImmunities)
        .sort(([,a], [,b]) => b.length - a.length)
        .map(([type, immunities]) => typeCountChip(type, `(${immunities.length})`))
        .join('');
    
    weaknessList.innerHTML = `
        <div><strong>Team weaknesses:</strong><br>${weaknessesHtml || 'No common weaknesses'}</div>
        <div style="margin-top: 10px;"><strong>Team resistances:</strong><br>${resistancesHtml || 'No common resistances'}</div>
        <div style="margin-top: 10px;"><strong>Team immunities:</strong><br>${immunitiesHtml || 'No immunities'}</div>
    `;
}

function updateTeamSynergy(team, teamElement, teamPokemon) {
    const synergyDiv = teamElement.querySelector('.team-synergy-content');
    
    if (teamPokemon.length === 0) {
        synergyDiv.innerHTML = '<p>Add Pokémon to see synergy</p>';
        return;
    }
    
    // Análisis de sinergia
    const synergies = [];
    const warnings = [];
    
    // 1. Sinergia de velocidad
    const speeds = teamPokemon.map(p => ({
        name: p.name,
        speed: getModifiedStats(p).speed,
        role: getRole(p)
    })).sort((a, b) => b.speed - a.speed);
    
    const fastCount = speeds.filter(p => p.speed > 100).length;
    const slowCount = speeds.filter(p => p.speed < 70).length;
    
    if (fastCount >= 3) {
        synergies.push('⚡ Fast team: Speed control');
    } else if (slowCount >= 3) {
        synergies.push('🛡️ Slow team: Defensive approach');
    } else if (fastCount >= 2 && slowCount >= 2) {
        synergies.push('⚖️ Speed balance: Versatility');
    }
    
    // 2. Sinergia de tipos defensiva
    const typeResistances = {};
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    allTypes.forEach(atkType => {
        const resistCount = teamPokemon.filter(pokemon => {
            const eff = getTypeEffectiveness(atkType, pokemon.types);
            return eff <= 0.5;
        }).length;
        if (resistCount >= 3) {
            typeResistances[atkType] = resistCount;
        }
    });
    
    if (Object.keys(typeResistances).length >= 5) {
        synergies.push('🛡️ Excellent defensive coverage');
    }
    
    // 3. Sinergia ofensiva
    const moveTypes = new Set();
    teamPokemon.forEach(pokemon => {
        if (pokemon.moves) {
            pokemon.moves.forEach(moveName => {
                const moveData = movesCache.get(moveName);
                if (moveData && moveData.damage_class !== 'status') {
                    moveTypes.add(moveData.type);
                }
            });
        }
    });
    
    if (moveTypes.size >= 12) {
        synergies.push('⚔️ Full offensive coverage');
    } else if (moveTypes.size >= 8) {
        synergies.push('⚔️ Good offensive coverage');
    }
    
    // 4. Sinergia de roles
    const roles = teamPokemon.map(p => getRole(p));
    const roleCount = roles.reduce((acc, role) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});
    
    if (roleCount['Tank'] >= 2 && roleCount['Sweeper'] >= 2) {
        synergies.push('🎨 Perfect balance: Tanks + Sweepers');
    }
    
    // 5. Advertencias de anti-sinergia
    const duplicateTypes = {};
    teamPokemon.forEach(pokemon => {
        pokemon.types.forEach(type => {
            duplicateTypes[type] = (duplicateTypes[type] || 0) + 1;
        });
    });
    
    Object.entries(duplicateTypes).forEach(([type, count]) => {
        if (count >= 4) {
            warnings.push(`⚠️ Too many ${type} types: ${count} Pokémon`);
        }
    });
    
    // Verificar debilidades comunes críticas
    const criticalWeaknesses = ['rock', 'ice', 'fire'];
    criticalWeaknesses.forEach(atkType => {
        const weakCount = teamPokemon.filter(pokemon => {
            const eff = getTypeEffectiveness(atkType, pokemon.types);
            return eff >= 2;
        }).length;
        if (weakCount >= 4) {
            warnings.push(`⚠️ Critical weakness to ${atkType}: ${weakCount} Pokémon`);
        }
    });
    
    // Generar HTML
    let html = '';
    
    if (synergies.length > 0) {
        html += '<div style="margin-bottom: 10px;"><strong>✨ Synergies:</strong><br>';
        synergies.forEach(synergy => {
            html += `<div style="color: #48bb78; font-size: 0.9em; margin: 2px 0;">${synergy}</div>`;
        });
        html += '</div>';
    }
    
    if (warnings.length > 0) {
        html += '<div style="margin-bottom: 10px;"><strong>⚠️ Warnings:</strong><br>';
        warnings.forEach(warning => {
            html += `<div style="color: #e53e3e; font-size: 0.9em; margin: 2px 0;">${warning}</div>`;
        });
        html += '</div>';
    }
    
    // Orden de velocidad
    html += '<div><strong>⚡ Speed Order:</strong><br>';
    html += '<div style="font-size: 0.85em; display: grid; gap: 2px;">';
    speeds.forEach((pokemon, index) => {
        const speedColor = pokemon.speed > 100 ? '#e53e3e' : pokemon.speed > 70 ? '#f6ad55' : '#48bb78';
        html += `<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: rgba(0,0,0,0.05); border-radius: 3px;">`;
        html += `<span>${index + 1}. ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>`;
        html += `<span style="color: ${speedColor}; font-weight: bold;">${pokemon.speed}</span>`;
        html += '</div>';
    });
    html += '</div></div>';
    
    if (synergies.length === 0 && warnings.length === 0) {
        html = '<div style="color: #666; font-style: italic;">Basic team with no special synergies detected</div>' + html;
    }
    
    synergyDiv.innerHTML = html;
}

function getRole(pokemon) {
    const modifiedStats = getModifiedStats(pokemon);
    const { attack, spAttack, defense, spDefense, speed, hp } = modifiedStats;
    
    if (attack > 100 || spAttack > 100) {
        if (speed > 100) {
            return 'Sweeper';
        } else {
            return 'Wallbreaker';
        }
    } else if ((defense > 100 || spDefense > 100) && hp > 80) {
        return 'Tank';
    } else if (speed > 110) {
        return 'Support';
    }
    return 'Balanced';
}

function updateAttackDistribution(team, teamElement, teamPokemon) {
    const attackDiv = teamElement.querySelector('.attack-distribution-content');
    
    if (teamPokemon.length === 0) {
        attackDiv.innerHTML = '<p>Add Pokémon to see attack types</p>';
        return;
    }
    
    const attackTypes = {};
    let totalMoves = 0;
    
    teamPokemon.forEach(pokemon => {
        if (pokemon.moves) {
            pokemon.moves.forEach(moveName => {
                const moveData = movesCache.get(moveName);
                if (moveData && moveData.damage_class !== 'status') {
                    const type = moveData.type;
                    attackTypes[type] = (attackTypes[type] || 0) + 1;
                    totalMoves++;
                }
            });
        }
    });
    
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const sortedAttackTypes = Object.entries(attackTypes)
        .sort(([,a], [,b]) => b - a)
        .map(([type, count]) => {
            const percentage = Math.round((count / totalMoves) * 100);
            return typeCountChip(type, `${count} · ${percentage}%`);
        }).join('');
    
    const missingTypes = allTypes.filter(type => !attackTypes[type])
        .map(type => `<span style="opacity: 0.4;">${getTypeIconHtml(type, 0.7)}</span>`)
        .join(' ');
    
    const coverageTypes = Object.keys(attackTypes).length;
    
    attackDiv.innerHTML = `
        <div><strong>Offensive types:</strong><br>${sortedAttackTypes || 'No offensive moves'}</div>
        <div style="margin-top: 10px;"><strong>Missing types:</strong><br>${missingTypes || 'Full coverage'}</div>
        <div style="margin-top: 8px; font-size: 0.9em;"><strong>Coverage:</strong> ${coverageTypes}/18 types • ${totalMoves} offensive moves</div>
    `;
}

function updateTypeDistribution(team, teamElement, teamPokemon) {
    const typeDiv = teamElement.querySelector('.type-distribution-content');
    
    if (teamPokemon.length === 0) {
        typeDiv.innerHTML = '<p>Add Pokémon to see types</p>';
        return;
    }
    
    const typeCount = {};
    teamPokemon.forEach(pokemon => {
        pokemon.types.forEach(type => {
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
    });
    
    const sortedTypes = Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)
        .map(([type, count]) => typeCountChip(type, `(${count})`)).join('');
    
    const totalTypes = Object.keys(typeCount).length;
    const coverage = Math.round((totalTypes / 18) * 100);
    
    typeDiv.innerHTML = `
        <div><strong>Types in the team:</strong><br>${sortedTypes}</div>
        <div style="margin-top: 8px; font-size: 0.9em;"><strong>Diversity:</strong> ${totalTypes}/18 types (${coverage}%)</div>
    `;
}

function getTypeEffectiveness(attackingType, defendingTypes) {
    let effectiveness = 1;
    defendingTypes.forEach(defType => {
        if (typeChart[defType].immune.includes(attackingType)) effectiveness *= 0;
        else if (typeChart[defType].resist.includes(attackingType)) effectiveness *= 0.5;
        else if (typeChart[defType].weak.includes(attackingType)) effectiveness *= 2;
    });
    return effectiveness;
}

// Texto explicativo de una naturaleza (qué stat sube y cuál baja).
function getNatureTooltipHtml(nature) {
    const statNames = { attack: 'Attack', defense: 'Defense', spAttack: 'Special Attack', spDefense: 'Special Defense', speed: 'Speed' };
    const effects = natureEffects[nature] || {};
    const up = Object.entries(effects).find(([, m]) => m === 1.1);
    const down = Object.entries(effects).find(([, m]) => m === 0.9);
    const displayName = nature.charAt(0).toUpperCase() + nature.slice(1);

    if (!up && !down) {
        return `<strong>${displayName}</strong><br><span style="opacity:0.8;">Neutral nature: does not modify any stat.</span>`;
    }
    return `<strong>${displayName}</strong>`
        + `<br><span style="color:#68d391;">▲ Raises ${statNames[up[0]]} (+10%)</span>`
        + `<br><span style="color:#fc8181;">▼ Lowers ${statNames[down[0]]} (−10%)</span>`;
}

// Resumen defensivo de un Pokémon: contra qué tipos es débil/resiste/inmune.
// Devuelve HTML listo para el tooltip.
function getDefensiveSummaryHtml(defendingTypes) {
    const allTypes = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
    const groups = { x4: [], x2: [], q: [], qq: [], immune: [] }; // q = x0.5, qq = x0.25

    allTypes.forEach(atk => {
        const eff = getTypeEffectiveness(atk, defendingTypes);
        if (eff === 0) groups.immune.push(atk);
        else if (eff === 4) groups.x4.push(atk);
        else if (eff === 2) groups.x2.push(atk);
        else if (eff === 0.25) groups.qq.push(atk);
        else if (eff === 0.5) groups.q.push(atk);
    });

    const badges = arr => arr.map(t => getTypeIconHtml(t, 0.75)).join(' ');
    let html = '';
    if (groups.x4.length)    html += `<div style="margin-top:4px;"><strong style="color:#fc8181;">Weak x4:</strong> ${badges(groups.x4)}</div>`;
    if (groups.x2.length)    html += `<div style="margin-top:4px;"><strong style="color:#fc8181;">Weak x2:</strong> ${badges(groups.x2)}</div>`;
    if (groups.q.length)     html += `<div style="margin-top:4px;"><strong style="color:#68d391;">Resists x0.5:</strong> ${badges(groups.q)}</div>`;
    if (groups.qq.length)    html += `<div style="margin-top:4px;"><strong style="color:#68d391;">Resists x0.25:</strong> ${badges(groups.qq)}</div>`;
    if (groups.immune.length) html += `<div style="margin-top:4px;"><strong style="color:#90cdf4;">Immune:</strong> ${badges(groups.immune)}</div>`;
    if (!html) html = '<div style="margin-top:4px; opacity:0.7;">Neutral damage to all types</div>';
    return html;
}

let selectedPokemon = null;
let currentTeam = null;
let currentSlot = null;

async function fetchMoveData(moveName) {
    if (!moveName || typeof moveName !== 'string') return null;
    
    // Limpiar nombre de movimiento (solo letras, números y guiones)
    moveName = moveName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
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
            accuracy: data.accuracy, // null = nunca falla (movimientos sin chequeo de precisión)
            priority: data.priority, // 0 = normal; >0 ataca antes; <0 ataca después
            effectChance: data.effect_chance, // % del efecto secundario (o null)
            description: data.effect_entries.find(e => e.language.name === 'en')?.effect || 'No description available',
            shortEffect: data.effect_entries.find(e => e.language.name === 'en')?.short_effect || ''
        };
        
        movesCache.set(moveName, moveData);
        return moveData;
    } catch (error) {
        console.error(`Error cargando movimiento ${moveName}:`, error);
        return null;
    }
}

async function fetchAbilityData(abilityName) {
    if (abilityCache.has(abilityName)) {
        return abilityCache.get(abilityName);
    }
    
    try {
        const response = await fetch(`${API_BASE}/ability/${abilityName}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const abilityData = {
            name: data.name,
            effect: data.effect_entries.find(e => e.language.name === 'en')?.effect || 'No description available'
        };
        
        abilityCache.set(abilityName, abilityData);
        return abilityData;
    } catch (error) {
        console.error(`Error cargando habilidad ${abilityName}:`, error);
        return null;
    }
}

// Cache de datos de objetos (descripciones de la PokéAPI).
const itemCache = new Map();

// Convierte el nombre visible del objeto al slug de la PokéAPI: "Choice Band" -> "choice-band".
function itemNameToSlug(itemName) {
    return itemName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin acentos
        .toLowerCase()
        .replace(/['’.]/g, '')      // sin apóstrofes ni puntos
        .replace(/\s+/g, '-');       // espacios -> guiones
}

async function fetchItemData(itemName) {
    const slug = itemNameToSlug(itemName);
    if (itemCache.has(slug)) return itemCache.get(slug);

    try {
        const response = await fetch(`${API_BASE}/item/${slug}`);
        if (!response.ok) { itemCache.set(slug, null); return null; }

        const data = await response.json();
        const en = e => e.language.name === 'en';
        const shortEffect = data.effect_entries?.find(en)?.short_effect;
        const fullEffect = data.effect_entries?.find(en)?.effect;
        const flavor = data.flavor_text_entries?.find(en)?.text?.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();

        const itemData = {
            name: data.name,
            effect: shortEffect || fullEffect || flavor || 'No description available'
        };

        itemCache.set(slug, itemData);
        return itemData;
    } catch (error) {
        console.error(`Error cargando objeto ${itemName}:`, error);
        itemCache.set(slug, null);
        return null;
    }
}

function openPokemonModal(team, slotIndex) {
    selectedPokemon = team.pokemon[slotIndex];
    currentTeam = team;
    currentSlot = slotIndex;
    
    // Crear modal si no existe
    let modal = document.getElementById('pokemon-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pokemon-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3 id="modal-title">Configure Pokémon</h3>
                <div class="config-section">
                    <label>Nature:</label>
                    <div class="nature-combobox" id="nature-combobox">
                        <div class="nature-combobox-control" id="nature-combobox-control">
                            <span class="nature-combobox-display" id="nature-combobox-display"></span>
                            <span class="nature-combobox-arrow">▾</span>
                        </div>
                        <input type="hidden" id="pokemon-nature">
                        <div class="nature-dropdown" id="nature-dropdown"></div>
                    </div>
                </div>
                <div class="config-section">
                    <label>Ability:</label>
                    <div id="pokemon-ability-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
                    <input type="hidden" id="pokemon-ability">
                </div>
                <div class="config-section">
                    <label>Poké Ball:</label>
                    <div class="ball-combobox" id="ball-combobox">
                        <div class="ball-combobox-control" id="ball-combobox-control">
                            <span id="pokemon-ball-icon" class="ball-sprite"></span>
                            <span class="ball-combobox-label" id="pokemon-ball-label"></span>
                            <span class="ball-combobox-arrow">▾</span>
                        </div>
                        <input type="hidden" id="pokemon-ball">
                        <div class="ball-dropdown" id="ball-dropdown"></div>
                    </div>
                </div>
                <div class="config-section">
                    <label>Item:</label>
                    <div class="item-combobox" id="item-combobox">
                        <div class="item-combobox-control" id="item-combobox-control">
                            <img id="pokemon-item-icon" alt="" class="item-combobox-icon">
                            <input type="text" id="pokemon-item" class="item-combobox-input" placeholder="Search item..." autocomplete="off">
                            <button type="button" id="item-combobox-clear" class="item-combobox-clear" title="Clear item">&times;</button>
                            <span class="item-combobox-arrow">▾</span>
                        </div>
                        <div class="item-autocomplete-dropdown"></div>
                    </div>
                </div>

                <div class="config-section">
                    <label>EVs:</label>
                    <div id="ev-total" style="font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">Total: 0/510 · Available: 510</div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                        <div class="ev-slider-container"><label>HP:</label><input type="range" class="ev-slider" id="ev-hp" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                        <div class="ev-slider-container"><label>Atk:</label><input type="range" class="ev-slider" id="ev-attack" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                        <div class="ev-slider-container"><label>Def:</label><input type="range" class="ev-slider" id="ev-defense" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                        <div class="ev-slider-container"><label>SpA:</label><input type="range" class="ev-slider" id="ev-spattack" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                        <div class="ev-slider-container"><label>SpD:</label><input type="range" class="ev-slider" id="ev-spdefense" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                        <div class="ev-slider-container"><label>Spe:</label><input type="range" class="ev-slider" id="ev-speed" min="0" max="252" value="0" step="4"><span class="ev-value">0</span></div>
                    </div>
                </div>

                <button id="save-pokemon">Save</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners para el modal
        modal.querySelector('.close').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        modal.querySelector('#save-pokemon').addEventListener('click', savePokemonConfig);
    }
    
    // Configurar contenido del modal
    document.getElementById('modal-title').textContent = `Configure ${selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}`;
    
    // Cargar habilidades como lista de tarjetas seleccionables (cada una con su tooltip)
    const abilityHidden = document.getElementById('pokemon-ability');
    const abilityList = document.getElementById('pokemon-ability-list');
    const currentAbility = selectedPokemon.selectedAbility || selectedPokemon.abilities[0]?.name || '';
    abilityHidden.value = currentAbility;
    abilityList.innerHTML = '';

    (selectedPokemon.abilities || []).forEach(ability => {
        const card = document.createElement('div');
        card.className = 'ability-option ability-tooltip';
        card.dataset.ability = ability.name;
        card.dataset.abilityName = ability.name;
        const isSel = ability.name === currentAbility;
        card.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 2px solid ${isSel ? '#667eea' : (ability.hidden ? '#f6ad55' : 'var(--border-color)')}; border-radius: 6px; cursor: pointer; background: ${isSel ? 'rgba(102,126,234,0.12)' : (ability.hidden ? 'rgba(246,173,85,0.12)' : 'var(--bg-white)')}; color: var(--text-primary);`;
        card.innerHTML = `
            <span style="font-weight: 600;">${ability.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            ${ability.hidden ? '<span style="font-size: 0.7em; background: #f6ad55; color: #333; padding: 1px 6px; border-radius: 8px; font-weight: bold;">Oculta</span>' : ''}
        `;
        card.addEventListener('click', () => {
            abilityHidden.value = ability.name;
            // Actualizar selección visual
            abilityList.querySelectorAll('.ability-option').forEach(c => {
                const sel = c.dataset.ability === ability.name;
                const hidden = selectedPokemon.abilities.find(a => a.name === c.dataset.ability)?.hidden;
                c.style.borderColor = sel ? '#667eea' : (hidden ? '#f6ad55' : 'var(--border-color)');
                c.style.background = sel ? 'rgba(102,126,234,0.12)' : (hidden ? 'rgba(246,173,85,0.12)' : 'var(--bg-white)');
            });
        });
        abilityList.appendChild(card);
    });
    
    // Cargar valores actuales
    setupNatureCombobox(selectedPokemon.nature || 'hardy');
    setupBallCombobox(selectedPokemon.pokeball || DEFAULT_POKEBALL);
    setupItemCombobox(selectedPokemon.heldItem || '');
    
    // Cargar EVs
    const evs = selectedPokemon.evs || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
    document.getElementById('ev-hp').value = evs.hp;
    document.getElementById('ev-attack').value = evs.attack;
    document.getElementById('ev-defense').value = evs.defense;
    document.getElementById('ev-spattack').value = evs.spAttack;
    document.getElementById('ev-spdefense').value = evs.spDefense;
    document.getElementById('ev-speed').value = evs.speed;
    
    // Agregar listeners para sliders EVs
    document.querySelectorAll('.ev-slider').forEach(slider => {
        slider.addEventListener('input', handleEvSlider);
        updateEvDisplay(slider);
    });
    updateEvTotal();
    

    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('pokemon-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function savePokemonConfig() {
    if (!selectedPokemon || !currentTeam || currentSlot === null) return;
    
    const nature = document.getElementById('pokemon-nature').value;
    const selectedAbility = document.getElementById('pokemon-ability').value;
    const heldItem = document.getElementById('pokemon-item').value.trim();
    const pokeball = (document.getElementById('pokemon-ball').value || DEFAULT_POKEBALL).toUpperCase();
    
    const evs = {
        hp: parseInt(document.getElementById('ev-hp').value) || 0,
        attack: parseInt(document.getElementById('ev-attack').value) || 0,
        defense: parseInt(document.getElementById('ev-defense').value) || 0,
        spAttack: parseInt(document.getElementById('ev-spattack').value) || 0,
        spDefense: parseInt(document.getElementById('ev-spdefense').value) || 0,
        speed: parseInt(document.getElementById('ev-speed').value) || 0
    };
    

    const moves = currentTeam.pokemon[currentSlot].moves || [];
    
    // Cargar datos de movimientos al caché
    for (const move of moves) {
        await fetchMoveData(move);
    }
    
    // Actualizar datos del equipo
    const prevBall = currentTeam.pokemon[currentSlot].pokeball || DEFAULT_POKEBALL;
    currentTeam.pokemon[currentSlot].nature = nature;
    currentTeam.pokemon[currentSlot].selectedAbility = selectedAbility;
    currentTeam.pokemon[currentSlot].heldItem = heldItem;
    currentTeam.pokemon[currentSlot].pokeball = pokeball;
    const ballChanged = prevBall !== pokeball;
    currentTeam.pokemon[currentSlot].evs = evs;
    currentTeam.pokemon[currentSlot].moves = moves;
    
    updateTeamDisplay(currentTeam);
    updateTeamAnalysis(currentTeam);
    setupTooltips();
    saveToSession();

    // Si cambió la pokébola, reproducir la animación de giro + apertura en la ficha.
    if (ballChanged) {
        const tid = currentTeam.id, slot = currentSlot;
        setTimeout(() => playPokeballAnimation(tid, slot), 30);
    }

    closeModal();
}

// Reproduce la animación de la pokébola recorriendo los 8 frames del
// spritesheet (con steps) en la ficha del slot indicado. Se repite un par de
// vueltas y vuelve al frame 0.
function playPokeballAnimation(teamId, slotIndex) {
    const teamElement = document.querySelector(`[data-team-id="${teamId}"]`);
    if (!teamElement) return;
    const display = teamElement.querySelector(`.pokemon-display[data-team-id="${teamId}"][data-slot="${slotIndex}"]`);
    const badge = display ? display.querySelector('.pokeball-badge') : null;
    if (!badge) return;
    badge.classList.remove('pokeball-spin');
    void badge.offsetWidth; // reiniciar animación
    badge.classList.add('pokeball-spin');
    badge.addEventListener('animationend', function handler() {
        badge.classList.remove('pokeball-spin');
        badge.removeEventListener('animationend', handler);
    });
}

async function handleMoveAutocomplete(input, moveIndex, availableMoves) {
    const query = input.value.toLowerCase().trim();
    const dropdown = input.parentElement.querySelector('.move-autocomplete-dropdown');
    
    if (query.length < 2) {
        hideMoveAutocomplete(moveIndex);
        return;
    }
    
    // Usar Set para evitar duplicados
    const uniqueMoves = new Set();
    const matches = [];
    
    for (const move of availableMoves) {
        const moveName = typeof move === 'string' ? move : move.name;
        if (moveName.toLowerCase().includes(query) && !uniqueMoves.has(moveName)) {
            uniqueMoves.add(moveName);
            matches.push(move);
            if (matches.length >= 10) break;
        }
    }
    
    if (matches.length === 0) {
        hideMoveAutocomplete(moveIndex);
        return;
    }
    
    dropdown.innerHTML = '';
    for (const move of matches) {
        const moveName = typeof move === 'string' ? move : move.name;
        const moveData = await fetchMoveData(moveName);
        const item = document.createElement('div');
        item.className = 'move-autocomplete-item';
        
        const displayName = moveName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        let learnInfo = '';
        if (typeof move === 'object' && move.learnMethod) {
            if (move.learnMethod === 'level-up' && move.level) {
                learnInfo = `Nv.${move.level}`;
            } else if (move.learnMethod === 'machine') {
                learnInfo = 'MT';
            } else if (move.learnMethod === 'egg') {
                learnInfo = 'Huevo';
            } else if (move.learnMethod === 'tutor') {
                learnInfo = 'Tutor';
            }
        }
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="move-autocomplete-item-name">${displayName}</div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    ${learnInfo ? `<span style="font-size: 0.7em; color: #666; background: #f0f0f0; padding: 1px 4px; border-radius: 2px;">${learnInfo}</span>` : ''}
                    ${getTypeIconHtml(moveData?.type || 'normal', 0.65)}
                    ${getCategoryIconHtml(moveData?.damage_class || 'status', 14)}
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => selectMoveFromAutocomplete(moveName, moveIndex));
        dropdown.appendChild(item);
    }
    
    dropdown.classList.add('show');
}

function selectMoveFromAutocomplete(move, moveIndex) {
    const input = document.querySelector(`.move-autocomplete[data-move="${moveIndex}"]`);
    input.value = move.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    hideMoveAutocomplete(moveIndex);
}

function hideMoveAutocomplete(moveIndex) {
    const dropdown = document.querySelector(`.move-autocomplete-dropdown[data-move="${moveIndex}"]`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

async function showAllMoves(input, moveIndex, availableMoves) {
    const dropdown = input.parentElement.querySelector('.move-autocomplete-dropdown');
    
    // Organizar movimientos por método, eliminando duplicados y tomando el nivel más bajo
    const movesByMethod = {
        'level-up': new Map(),
        'machine': new Set(),
        'egg': new Set(),
        'tutor': new Set()
    };
    
    for (const move of availableMoves) {
        const moveName = typeof move === 'string' ? move : move.name;
        const method = typeof move === 'object' ? move.learnMethod : 'level-up';
        
        if (method === 'level-up') {
            const level = typeof move === 'object' ? (move.level || 1) : 1;
            if (!movesByMethod[method].has(moveName) || movesByMethod[method].get(moveName).level > level) {
                movesByMethod[method].set(moveName, { name: moveName, level });
            }
        } else if (movesByMethod[method]) {
            movesByMethod[method].add(moveName);
        }
    }
    
    dropdown.innerHTML = '';
    
    const methodNames = {
        'level-up': '📈 Por Nivel',
        'machine': '💿 MT/MO',
        'egg': '🥚 Huevo',
        'tutor': '👨🏫 Tutor'
    };
    
    for (const [method, moves] of Object.entries(movesByMethod)) {
        const moveCount = method === 'level-up' ? moves.size : moves.size;
        if (moveCount > 0) {
            const header = document.createElement('div');
            header.style.cssText = 'background: #667eea; color: white; padding: 4px 8px; font-size: 0.8em; font-weight: bold; margin: 2px 0;';
            header.textContent = methodNames[method] + ` (${moveCount})`;
            dropdown.appendChild(header);
            
            let sortedMoves = [];
            if (method === 'level-up') {
                sortedMoves = Array.from(moves.values()).sort((a, b) => a.level - b.level);
            } else {
                sortedMoves = Array.from(moves).map(name => ({ name })).sort((a, b) => a.name.localeCompare(b.name));
            }
            
            /*const sortedMoves = moves.sort((a, b) => {
                if (method === 'level-up') {
                    const levelA = typeof a === 'object' ? a.level || 0 : 0;
                    const levelB = typeof b === 'object' ? b.level || 0 : 0;
                    return levelA - levelB;
                }
                const nameA = typeof a === 'string' ? a : a.name;
                const nameB = typeof b === 'string' ? b : b.name;
                return nameA.localeCompare(nameB);
            });*/
            
            for (const move of sortedMoves) {
                const moveName = move.name;
                const moveData = await fetchMoveData(moveName);
                const item = document.createElement('div');
                item.className = 'move-autocomplete-item';
                
                const displayName = moveName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                let learnInfo = '';
                if (method === 'level-up' && move.level) {
                    learnInfo = `Nv.${move.level}`;
                }
                
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div class="move-autocomplete-item-name">${displayName}</div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            ${moveData?.power ? `<span title="Power" style="font-size: 0.7em; background: #fff3cd; padding: 1px 3px; border-radius: 2px;">⚔️${moveData.power}</span>` : ''}
                            ${moveData && moveData.accuracy != null ? `<span title="Accuracy" style="font-size: 0.7em; background: #e6f0ff; padding: 1px 3px; border-radius: 2px;">🎯${moveData.accuracy}</span>` : ''}
                            ${learnInfo ? `<span style="font-size: 0.7em; color: #666; background: #f0f0f0; padding: 1px 4px; border-radius: 2px;">${learnInfo}</span>` : ''}
                            ${getTypeIconHtml(moveData?.type || 'normal', 0.65)}
                            ${getCategoryIconHtml(moveData?.damage_class || 'status', 14)}
                        </div>
                    </div>
                `;
                
                item.addEventListener('click', () => selectMoveFromAutocomplete(moveName, moveIndex));
                dropdown.appendChild(item);
            }
        }
    }
    
    dropdown.style.maxHeight = '300px';
    dropdown.classList.add('show');
}

// Naturalezas: nombre -> stat que sube (+) y stat que baja (-). null = neutral.
const NATURES = {
    hardy:   { up: null,  down: null },
    lonely:  { up: 'Atk', down: 'Def' },
    brave:   { up: 'Atk', down: 'Spe' },
    adamant: { up: 'Atk', down: 'SpA' },
    naughty: { up: 'Atk', down: 'SpD' },
    bold:    { up: 'Def', down: 'Atk' },
    docile:  { up: null,  down: null },
    relaxed: { up: 'Def', down: 'Spe' },
    impish:  { up: 'Def', down: 'SpA' },
    lax:     { up: 'Def', down: 'SpD' },
    timid:   { up: 'Spe', down: 'Atk' },
    hasty:   { up: 'Spe', down: 'Def' },
    serious: { up: null,  down: null },
    jolly:   { up: 'Spe', down: 'SpA' },
    naive:   { up: 'Spe', down: 'SpD' },
    modest:  { up: 'SpA', down: 'Atk' },
    mild:    { up: 'SpA', down: 'Def' },
    quiet:   { up: 'SpA', down: 'Spe' },
    bashful: { up: null,  down: null },
    rash:    { up: 'SpA', down: 'SpD' },
    calm:    { up: 'SpD', down: 'Atk' },
    gentle:  { up: 'SpD', down: 'Def' },
    sassy:   { up: 'SpD', down: 'Spe' },
    careful: { up: 'SpD', down: 'SpA' },
    quirky:  { up: null,  down: null }
};

// HTML del nombre + stats coloreados (rojo el que sube, azul el que baja).
function natureLabelHtml(name) {
    const info = NATURES[name];
    const pretty = name.charAt(0).toUpperCase() + name.slice(1);
    if (!info || (!info.up && !info.down)) {
        return `<span class="nature-name">${pretty}</span><span class="nature-neutral">Neutral</span>`;
    }
    return `<span class="nature-name">${pretty}</span>`
        + `<span class="nature-mods">`
        + `<span class="nature-up">+${info.up}</span>`
        + `<span class="nature-down">-${info.down}</span>`
        + `</span>`;
}

// Configura el combobox de pokébola (dropdown con miniatura de cada bola).
function setupBallCombobox(currentValue) {
    const hidden = document.getElementById('pokemon-ball');
    const control = document.getElementById('ball-combobox-control');
    const icon = document.getElementById('pokemon-ball-icon');
    const label = document.getElementById('pokemon-ball-label');
    const dropdown = document.getElementById('ball-dropdown');
    if (!hidden || !control || !icon || !label || !dropdown) return;

    const setValue = (key) => {
        const k = (key || DEFAULT_POKEBALL).toUpperCase();
        hidden.value = k;
        icon.style.cssText = pokeballFrameStyle(k, 0);
        label.textContent = getPokeballLabel(k);
        dropdown.querySelectorAll('.ball-option').forEach(o =>
            o.classList.toggle('selected', o.dataset.ball === k));
    };

    // Construir opciones (cada una con miniatura + nombre).
    dropdown.innerHTML = '';
    POKEBALLS.forEach(ball => {
        const opt = document.createElement('div');
        opt.className = 'ball-option';
        opt.dataset.ball = ball.key;
        opt.innerHTML = `<span class="ball-sprite ball-option-icon" style="${pokeballFrameStyle(ball.key, 0)}"></span><span>${ball.label}</span>`;
        opt.addEventListener('mousedown', (e) => {
            e.preventDefault();
            setValue(ball.key);
            dropdown.classList.remove('show');
        });
        dropdown.appendChild(opt);
    });

    setValue((currentValue || DEFAULT_POKEBALL).toUpperCase());

    control.onclick = () => {
        const willOpen = !dropdown.classList.contains('show');
        dropdown.classList.toggle('show', willOpen);
        if (willOpen) {
            const sel = dropdown.querySelector('.ball-option.selected');
            if (sel) sel.scrollIntoView({ block: 'nearest' });
        }
    };

    document.addEventListener('click', (e) => {
        const box = document.getElementById('ball-combobox');
        if (box && !box.contains(e.target)) dropdown.classList.remove('show');
    });
}

// Configura el combobox de naturalezas con stats coloreados.
function setupNatureCombobox(currentValue) {
    const hidden = document.getElementById('pokemon-nature');
    const control = document.getElementById('nature-combobox-control');
    const display = document.getElementById('nature-combobox-display');
    const dropdown = document.getElementById('nature-dropdown');
    if (!hidden || !control || !display || !dropdown) return;

    const setValue = (name) => {
        hidden.value = name;
        display.innerHTML = natureLabelHtml(name);
        dropdown.querySelectorAll('.nature-option').forEach(o =>
            o.classList.toggle('selected', o.dataset.nature === name));
    };

    // Construir opciones.
    dropdown.innerHTML = '';
    Object.keys(NATURES).forEach(name => {
        const opt = document.createElement('div');
        opt.className = 'nature-option';
        opt.dataset.nature = name;
        opt.innerHTML = natureLabelHtml(name);
        opt.addEventListener('mousedown', (e) => {
            e.preventDefault();
            setValue(name);
            dropdown.classList.remove('show');
        });
        dropdown.appendChild(opt);
    });

    setValue(currentValue || 'hardy');

    // Abrir/cerrar.
    control.onclick = () => {
        const willOpen = !dropdown.classList.contains('show');
        dropdown.classList.toggle('show', willOpen);
        if (willOpen) {
            const sel = dropdown.querySelector('.nature-option.selected');
            if (sel) sel.scrollIntoView({ block: 'nearest' });
        }
    };

    // Cerrar al hacer clic fuera.
    document.addEventListener('click', (e) => {
        const box = document.getElementById('nature-combobox');
        if (box && !box.contains(e.target)) dropdown.classList.remove('show');
    });
}

// Índice de la opción resaltada con el teclado dentro del dropdown.
let itemComboHighlight = -1;

// Configura el combobox de objetos: input con búsqueda + dropdown con imágenes.
function setupItemCombobox(currentValue) {
    const input = document.getElementById('pokemon-item');
    const control = document.getElementById('item-combobox-control');
    const clearBtn = document.getElementById('item-combobox-clear');
    if (!input || !control) return;

    input.value = currentValue || '';
    updateItemInputIcon(currentValue || '');
    updateItemClearButton();

    // Abrir/filtrar al escribir.
    input.oninput = () => {
        updateItemInputIcon(input.value.trim());
        updateItemClearButton();
        renderItemOptions(input.value.trim().toLowerCase());
    };

    // Abrir mostrando todo al enfocar o hacer clic.
    input.onfocus = () => renderItemOptions(input.value.trim().toLowerCase());
    control.onclick = (e) => {
        if (e.target === clearBtn) return;
        input.focus();
        renderItemOptions(input.value.trim().toLowerCase());
    };

    // Navegación con teclado.
    input.onkeydown = (e) => {
        const dropdown = document.querySelector('.item-autocomplete-dropdown');
        const options = dropdown ? [...dropdown.querySelectorAll('.item-autocomplete-item')] : [];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!dropdown || !dropdown.classList.contains('show')) { renderItemOptions(input.value.trim().toLowerCase()); return; }
            itemComboHighlight = Math.min(itemComboHighlight + 1, options.length - 1);
            highlightItemOption(options);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            itemComboHighlight = Math.max(itemComboHighlight - 1, 0);
            highlightItemOption(options);
        } else if (e.key === 'Enter') {
            if (options[itemComboHighlight]) {
                e.preventDefault();
                selectItem(options[itemComboHighlight].dataset.itemName);
            }
        } else if (e.key === 'Escape') {
            hideItemAutocomplete();
        }
    };

    // Cerrar al perder foco (con retardo para permitir el clic en una opción).
    input.onblur = () => setTimeout(hideItemAutocomplete, 150);

    // Botón para limpiar el objeto.
    if (clearBtn) {
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            selectItem('');
            input.focus();
        };
    }
}

// Renderiza las opciones del dropdown filtradas por 'query' (subcadena).
function renderItemOptions(query) {
    const dropdown = document.querySelector('.item-autocomplete-dropdown');
    if (!dropdown) return;
    itemComboHighlight = -1;

    const unique = [...new Set(commonItems)].sort((a, b) => a.localeCompare(b));
    const matches = query
        ? unique.filter(item => item.toLowerCase().includes(query))
        : unique;

    dropdown.innerHTML = '';

    // Opción para quitar el objeto.
    const noneDiv = document.createElement('div');
    noneDiv.className = 'item-autocomplete-item item-autocomplete-none';
    noneDiv.dataset.itemName = '';
    noneDiv.innerHTML = `<span class="item-none-label">— No item —</span>`;
    noneDiv.addEventListener('mousedown', (e) => { e.preventDefault(); selectItem(''); });
    dropdown.appendChild(noneDiv);

    if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'item-autocomplete-empty';
        empty.textContent = 'No matches';
        dropdown.appendChild(empty);
    } else {
        matches.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-autocomplete-item item-tooltip';
            itemDiv.dataset.itemName = item;
            itemDiv.innerHTML = `${getItemImageTag(item, 22)}<span class="item-option-name">${item}</span>`;
            // mousedown para no perder foco antes de seleccionar.
            itemDiv.addEventListener('mousedown', (e) => { e.preventDefault(); selectItem(item); });
            dropdown.appendChild(itemDiv);
        });
    }

    dropdown.classList.add('show');
}

// Aplica el estilo resaltado a la opción activa y la hace visible.
function highlightItemOption(options) {
    options.forEach((opt, i) => {
        opt.classList.toggle('highlighted', i === itemComboHighlight);
        if (i === itemComboHighlight) opt.scrollIntoView({ block: 'nearest' });
    });
}

function selectItem(item) {
    const input = document.getElementById('pokemon-item');
    if (input) input.value = item;
    updateItemInputIcon(item);
    updateItemClearButton();
    hideItemAutocomplete();
}

// Muestra u oculta la "x" para limpiar según haya texto.
function updateItemClearButton() {
    const clearBtn = document.getElementById('item-combobox-clear');
    const input = document.getElementById('pokemon-item');
    if (!clearBtn || !input) return;
    clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
}

// Actualiza el icono a la izquierda del input de objeto según el nombre actual.
function updateItemInputIcon(itemName) {
    const icon = document.getElementById('pokemon-item-icon');
    if (!icon) return;
    const src = getItemImage(itemName);
    if (!src) { icon.style.visibility = 'hidden'; return; }
    icon.src = src;
    icon.style.visibility = 'visible';
    icon.onerror = () => { icon.style.visibility = 'hidden'; };
}

function hideItemAutocomplete() {
    const dropdown = document.querySelector('.item-autocomplete-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    itemComboHighlight = -1;
}





function showLoading(show) {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function exportShowdown(team) {
    const teamPokemon = team.pokemon.slice(0, 6).filter(p => p !== null);
    
    if (teamPokemon.length === 0) {
        alert('The team is empty');
        return;
    }
    
    // Reutiliza el generador completo (incluye Level, género, IVs, pokébola...).
    const showdownText = generateShowdownText(team);
    showTextModal('Export to Pokémon Showdown', showdownText, true);
}

function importShowdown(team) {
    showTextModal('Import from Pokémon Showdown', '', false, (text) => {
        parseShowdownText(text, team);
    });
}

function parseShowdownText(text, team) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const pokemon = [];
    let currentPokemon = null;
    
    for (const line of lines) {
        if (line.startsWith('===') || line.startsWith('//')) continue;
        
        if (line.includes('Ability:')) {
            if (currentPokemon) {
                const ability = line.split('Ability:')[1].trim().toLowerCase().replace(/\s+/g, '-');
                currentPokemon.selectedAbility = ability;
            }
        } else if (line.includes('Shiny:')) {
            if (currentPokemon) {
                currentPokemon.isShiny = line.split('Shiny:')[1].trim().toLowerCase() === 'yes';
            }
        } else if (line.includes('Nature')) {
            if (currentPokemon) {
                const nature = line.replace('Nature', '').trim().toLowerCase();
                currentPokemon.nature = nature;
            }
        } else if (line.includes('EVs:')) {
            if (currentPokemon) {
                // Resetear EVs a 0 antes de parsear
                currentPokemon.evs = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
                const evText = line.split('EVs:')[1].trim();
                const evPairs = evText.split('/');
                evPairs.forEach(pair => {
                    const [value, stat] = pair.trim().split(' ');
                    // Limitar cada EV al máximo por estadística (252)
                    const evValue = Math.min(parseInt(value) || 0, EV_MAX_PER_STAT);
                    if (stat) {
                        const statName = stat.toLowerCase();
                        if (statName === 'hp') currentPokemon.evs.hp = evValue;
                        else if (statName === 'atk') currentPokemon.evs.attack = evValue;
                        else if (statName === 'def') currentPokemon.evs.defense = evValue;
                        else if (statName === 'spa') currentPokemon.evs.spAttack = evValue;
                        else if (statName === 'spd') currentPokemon.evs.spDefense = evValue;
                        else if (statName === 'spe') currentPokemon.evs.speed = evValue;
                    }
                });
                currentPokemon.hasEvs = true;
            }
        } else if (line.includes('Level:')) {
            if (currentPokemon) {
                const lvl = parseInt(line.split('Level:')[1].trim());
                if (!isNaN(lvl)) currentPokemon.level = Math.max(1, Math.min(100, lvl));
            }
        } else if (line.includes('Ball:')) {
            if (currentPokemon) {
                // Convertir "Great Ball" -> "GREATBALL" y validar contra la lista.
                const raw = line.split('Ball:')[1].trim();
                const key = raw.replace(/[^a-zA-Z]/g, '').toUpperCase();
                const found = POKEBALLS.find(b => b.key === key);
                currentPokemon.pokeball = found ? found.key : DEFAULT_POKEBALL;
            }
        } else if (line.includes('IVs:')) {
            if (currentPokemon) {
                // Showdown solo lista los IVs != 31; el resto se asume 31.
                currentPokemon.ivs = { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 };
                const ivText = line.split('IVs:')[1].trim();
                ivText.split('/').forEach(pair => {
                    const [value, stat] = pair.trim().split(' ');
                    const ivValue = Math.max(0, Math.min(31, parseInt(value) || 0));
                    if (stat) {
                        const s = stat.toLowerCase();
                        if (s === 'hp') currentPokemon.ivs.hp = ivValue;
                        else if (s === 'atk') currentPokemon.ivs.attack = ivValue;
                        else if (s === 'def') currentPokemon.ivs.defense = ivValue;
                        else if (s === 'spa') currentPokemon.ivs.spAttack = ivValue;
                        else if (s === 'spd') currentPokemon.ivs.spDefense = ivValue;
                        else if (s === 'spe') currentPokemon.ivs.speed = ivValue;
                    }
                });
            }
        } else if (line.includes('Tera Type:')) {
            continue;
        } else if (line.includes('@') || (line.includes('(') && !currentPokemon && !line.match(/\s\([MF]\)\s*$/)) || (currentPokemon && currentPokemon.moves.length >= 4) || (!currentPokemon && !line.includes('Ability:') && !line.includes('Nature') && !line.includes('EVs:') && !line.startsWith('-') && line.length > 0)) {
            // Nueva línea de Pokémon
            if (currentPokemon && currentPokemon.name) {
                pokemon.push(currentPokemon);
            }
            
            let pokemonName = line.split('@')[0].trim();
            let nickname = '';

            // Género: (M) o (F) en la parte del nombre (antes de @).
            let parsedGender;
            const genderMatch = pokemonName.match(/\((M|F)\)\s*$/);
            if (genderMatch) {
                parsedGender = genderMatch[1] === 'M' ? 'male' : 'female';
            }
            
            if (pokemonName.includes('(') && pokemonName.includes(')')) {
                const match = pokemonName.match(/^(.+?)\s*\((.+?)\)\s*(.*)$/);
                if (match) {
                    const part1 = match[1].trim();
                    const part2 = match[2].trim();
                    const part3 = match[3].trim();
                    
                    if (part3.match(/^\([MF]\)$/)) {
                        nickname = part1;
                        pokemonName = part2;
                    } else if (part2.match(/^[MF]$/)) {
                        pokemonName = part1;
                        parsedGender = part2 === 'M' ? 'male' : 'female';
                    } else {
                        nickname = part1;
                        pokemonName = part2;
                    }
                }
            }
            
            pokemonName = pokemonName.replace(/\s*\([MF]\)\s*$/, '').trim();
            
            let heldItem = '';
            if (line.includes('@')) {
                heldItem = line.split('@')[1].trim();
            }
            
            currentPokemon = {
                name: pokemonName.toLowerCase().replace(/\s+/g, '-'),
                nickname: nickname,
                moves: [],
                nature: 'hardy',
                level: 50,
                gender: parsedGender,
                pokeball: DEFAULT_POKEBALL,
                ivs: null,
                selectedAbility: null,
                heldItem: heldItem,
                evs: null,
                hasEvs: false
            };
        } else if (currentPokemon && line.length > 0) {
            // Verificar si es un nombre de Pokémon conocido o tiene formato de apodo
            const isNewPokemon = ['feraligatr', 'delphox', 'chesnaught', 'excadrill', 'scolipede', 'drampa'].includes(line.toLowerCase()) || 
                                 (line.includes('(') && line.includes(')') && !line.startsWith('-'));
            
            if (isNewPokemon) {
                // Es un nuevo Pokémon
                if (currentPokemon && currentPokemon.name) {
                    pokemon.push(currentPokemon);
                }
                
                let pokemonName = line.split('@')[0].trim();
                let nickname = '';

                let parsedGender2;
                const gm2 = pokemonName.match(/\((M|F)\)\s*$/);
                if (gm2) parsedGender2 = gm2[1] === 'M' ? 'male' : 'female';
                
                if (pokemonName.includes('(') && pokemonName.includes(')')) {
                    const match = pokemonName.match(/^(.+?)\s*\((.+?)\)\s*(.*)$/);
                    if (match) {
                        nickname = match[1].trim();
                        pokemonName = match[2].trim();
                    }
                }
                pokemonName = pokemonName.replace(/\s*\([MF]\)\s*$/, '').trim();
                
                let heldItem = '';
                if (line.includes('@')) {
                    heldItem = line.split('@')[1].trim();
                }
                
                currentPokemon = {
                    name: pokemonName.toLowerCase().replace(/\s+/g, '-'),
                    nickname: nickname,
                    moves: [],
                    nature: 'hardy',
                    level: 50,
                    gender: parsedGender2,
                    pokeball: DEFAULT_POKEBALL,
                    ivs: null,
                    selectedAbility: null,
                    heldItem: heldItem,
                    evs: null,
                    hasEvs: false,
                    isShiny: false
                };
            } else {
                // Es un movimiento
                let move = line.replace(/^-\s*/, '').trim();
                if (move.toLowerCase().includes('hidden power')) {
                    move = 'hidden-power';
                } else if (move.toLowerCase().includes("king's shield") || move.includes('&#39;')) {
                    move = 'kings-shield';
                } else {
                    move = move.replace(/\[.*?\]/g, '').toLowerCase().replace(/\s+/g, '-');
                }
                if (move && currentPokemon.moves.length < 4) {
                    currentPokemon.moves.push(move);
                }
            }
        }
    }
    
    if (currentPokemon && currentPokemon.name) {
        pokemon.push(currentPokemon);
    }
    
    console.log('Pokémon parseados:', pokemon);
    importShowdownPokemon(pokemon, team);
}

async function importShowdownPokemon(pokemonList, team) {
    showLoading(true);
    
    // Limpiar equipo actual
    team.pokemon = [null, null, null, null, null, null, null, null];
    
    for (let i = 0; i < Math.min(pokemonList.length, 6); i++) {
        const pokemonData = pokemonList[i];
        
        try {
            // Buscar el Pokémon en la lista primero
            const pokemonEntry = allPokemonList.find(p => 
                p.name === pokemonData.name || 
                (p.displayName && p.displayName.toLowerCase().includes(pokemonData.name.replace(/-/g, ' ')))
            );
            
            const pokemon = pokemonEntry ? await fetchPokemonData(pokemonEntry.id) : null;
            if (pokemon) {
                // Cargar datos de movimientos
                for (const move of pokemonData.moves) {
                    await fetchMoveData(move);
                }
                
                team.pokemon[i] = {
                    ...pokemon,
                    nickname: pokemonData.nickname,
                    level: pokemonData.level,
                    nature: pokemonData.nature,
                    gender: pokemonData.gender !== undefined ? pokemonData.gender : defaultGender(pokemon.genderRate),
                    selectedAbility: pokemonData.selectedAbility || pokemon.abilities[0]?.name,
                    moves: pokemonData.moves,
                    currentSprite: pokemonData.isShiny ? 'front_shiny' : 'front_default',
                    heldItem: pokemonData.heldItem || '',
                    pokeball: pokemonData.pokeball || DEFAULT_POKEBALL,
                    evs: pokemonData.evs || null,
                    ivs: pokemonData.ivs || { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
                    hasEvs: pokemonData.hasEvs || false
                };
            }
        } catch (error) {
            console.error(`Error cargando ${pokemonData.name}:`, error);
        }
    }
    
    // Actualizar inputs
    const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
    const inputs = teamElement.querySelectorAll('.pokemon-autocomplete');
    inputs.forEach((input, index) => {
        if (team.pokemon[index]) {
            input.value = team.pokemon[index].name.charAt(0).toUpperCase() + team.pokemon[index].name.slice(1);
        } else {
            input.value = '';
        }
    });
    
    updateTeamDisplay(team);
    updateTeamAnalysis(team);
    if (!team.expanded) {
        updateCompactView(team);
    }
    setupTooltips();
    saveToSession();
    
    showLoading(false);
    updateTeamNavigator();
    console.log('Equipos sincronizados correctamente');
}

function showTextModal(title, content, readonly, onSave) {
    let modal = document.getElementById('text-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'text-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h3 id="text-modal-title"></h3>
                <textarea id="text-modal-content" style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                <div style="margin-top: 15px; text-align: right;">
                    <button id="text-modal-save" class="team-btn">Sync</button>
                    <button id="text-modal-copy" class="team-btn">Copy</button>
                    <button id="text-modal-save-file" class="team-btn">Save TXT</button>
                    <button id="text-modal-load-file" class="team-btn">Load TXT</button>
                    <input type="file" id="text-modal-file-input" accept=".txt" style="display: none;">
                    <button id="text-modal-cancel" class="team-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
        modal.querySelector('#text-modal-cancel').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    const textarea = modal.querySelector('#text-modal-content');
    const saveBtn = modal.querySelector('#text-modal-save');
    const copyBtn = modal.querySelector('#text-modal-copy');
    const saveFileBtn = modal.querySelector('#text-modal-save-file');
    const loadFileBtn = modal.querySelector('#text-modal-load-file');
    const fileInput = modal.querySelector('#text-modal-file-input');
    
    modal.querySelector('#text-modal-title').textContent = title;
    textarea.value = content;
    textarea.readOnly = readonly;
    
    saveBtn.style.display = readonly ? 'none' : 'inline-block';
    copyBtn.style.display = readonly ? 'inline-block' : 'none';
    
    // Funcionalidad de guardar archivo
    saveFileBtn.onclick = () => {
        const text = textarea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teams.txt';
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Funcionalidad de cargar archivo
    loadFileBtn.onclick = () => {
        fileInput.click();
    };
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                textarea.value = event.target.result;
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    };
    
    if (readonly) {
        copyBtn.onclick = () => {
            textarea.select();
            document.execCommand('copy');
            alert('Copied to clipboard!');
        };
    } else {
        saveBtn.onclick = () => {
            if (onSave) onSave(textarea.value);
            modal.style.display = 'none';
        };
    }
    
    modal.style.display = 'block';
    if (!readonly) textarea.focus();
}

function openGlobalShowdownEditor() {
    const allTeamsText = teams.map(team => generateShowdownText(team)).join('\n');
    showTextModal('Sync with Pokémon Showdown', allTeamsText, false, (text) => {
        syncWithShowdown(text);
    });
}

function syncWithShowdown(text) {
    // Si solo hay un equipo, actualizar el primero existente
    if (!text.includes('===')) {
        if (teams.length > 0) {
            parseShowdownText(text, teams[0]);
        }
        return;
    }
    
    const teamSections = text.split(/===\s*(?:\[.*?\]\s*)?(.+?)\s*===/g).filter(section => section.trim());
    
    if (teamSections.length < 2) {
        alert('No valid teams found');
        return;
    }
    
    teams.forEach(team => {
        const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
        if (teamElement) teamElement.remove();
    });
    teams.length = 0;
    teamCounter = 0;
    
    for (let i = 0; i < teamSections.length; i += 2) {
        const teamName = teamSections[i]?.trim();
        const teamContent = teamSections[i + 1]?.trim();
        
        if (teamName && teamContent) {
            const newTeam = createNewTeamWithName(teamName);
            parseShowdownText(teamContent, newTeam);
        }
    }
    
    if (teams.length === 0) {
        createNewTeam();
    }
}

function createNewTeamWithName(name) {
    teamCounter++;
    const teamId = `team-${teamCounter}`;
    
    const team = {
        id: teamId,
        name: name || `Team ${teamCounter}`,
        pokemon: [null, null, null, null, null, null, null, null],
        expanded: true
    };
    
    teams.push(team);
    renderTeam(team);
    return team;
}

function generateShowdownText(team) {
    const teamPokemon = team.pokemon.slice(0, 6).filter(p => p !== null);
    
    if (teamPokemon.length === 0) {
        return '';
    }
    
    let showdownText = `=== ${team.name} ===\n\n`;
    
    teamPokemon.forEach(pokemon => {
        let pokemonLine = '';
        
        // Nombre (con nickname si existe)
        if (pokemon.nickname) {
            pokemonLine += `${pokemon.nickname} (${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)})`;
        } else {
            pokemonLine += pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        }

        // Género (formato Showdown: (M) o (F) tras el nombre)
        if (pokemon.gender === 'male') pokemonLine += ' (M)';
        else if (pokemon.gender === 'female') pokemonLine += ' (F)';
        
        // Agregar objeto si existe
        if (pokemon.heldItem) {
            pokemonLine += ` @ ${pokemon.heldItem}`;
        }
        
        showdownText += pokemonLine + '\n';

        // Pokébola (línea reconocida por Showdown; nuestro parser también la lee)
        if (pokemon.pokeball && pokemon.pokeball !== DEFAULT_POKEBALL) {
            showdownText += `Ball: ${getPokeballLabel(pokemon.pokeball)}\n`;
        }
        
        // Habilidad
        if (pokemon.selectedAbility) {
            showdownText += `Ability: ${pokemon.selectedAbility.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
        }

        // Nivel (solo si no es el estándar 50)
        if (pokemon.level && pokemon.level !== 50) {
            showdownText += `Level: ${pokemon.level}\n`;
        }
        
        // Shiny
        if (pokemon.currentSprite && pokemon.currentSprite.includes('shiny')) {
            showdownText += 'Shiny: Yes\n';
        }
        
        // EVs (mostrar si existen)
        if (pokemon.evs && Object.values(pokemon.evs).some(ev => ev > 0)) {
            const evParts = [];
            if (pokemon.evs.hp > 0) evParts.push(`${pokemon.evs.hp} HP`);
            if (pokemon.evs.attack > 0) evParts.push(`${pokemon.evs.attack} Atk`);
            if (pokemon.evs.defense > 0) evParts.push(`${pokemon.evs.defense} Def`);
            if (pokemon.evs.spAttack > 0) evParts.push(`${pokemon.evs.spAttack} SpA`);
            if (pokemon.evs.spDefense > 0) evParts.push(`${pokemon.evs.spDefense} SpD`);
            if (pokemon.evs.speed > 0) evParts.push(`${pokemon.evs.speed} Spe`);
            if (evParts.length > 0) {
                showdownText += `EVs: ${evParts.join(' / ')}\n`;
            }
        }
        
        // Naturaleza
        if (pokemon.nature && pokemon.nature !== 'hardy') {
            showdownText += `${pokemon.nature.charAt(0).toUpperCase() + pokemon.nature.slice(1)} Nature\n`;
        }

        // IVs (mostrar solo los que no son 31, como hace Showdown)
        if (pokemon.ivs) {
            const ivMap = [
                ['hp', 'HP'], ['attack', 'Atk'], ['defense', 'Def'],
                ['spAttack', 'SpA'], ['spDefense', 'SpD'], ['speed', 'Spe']
            ];
            const ivParts = [];
            ivMap.forEach(([key, label]) => {
                const v = pokemon.ivs[key];
                if (v !== undefined && v !== 31) ivParts.push(`${v} ${label}`);
            });
            if (ivParts.length > 0) {
                showdownText += `IVs: ${ivParts.join(' / ')}\n`;
            }
        }
        
        // Movimientos
        if (pokemon.moves && pokemon.moves.length > 0) {
            pokemon.moves.forEach(move => {
                showdownText += `- ${move.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
            });
        }
        
        showdownText += '\n';
    });
    
    return showdownText;
}

function updateEvTotal() {
    // Excluir los sliders del detalle flotante (tienen su propio total).
    const sliders = [...document.querySelectorAll('.ev-slider')].filter(s => !s.closest('#compact-pokemon-modal'));
    let total = 0;
    
    sliders.forEach(slider => {
        total += parseInt(slider.value) || 0;
    });
    
    const totalDisplay = document.getElementById('ev-total');
    const remaining = EV_MAX_TOTAL - total;

    let text = `Total: ${total}/${EV_MAX_TOTAL}`;
    let color;

    if (total > EV_MAX_TOTAL) {
        // Ilegal: supera el límite duro (puede venir de una importación)
        text += ` ⚠️ Exceeds the limit by ${total - EV_MAX_TOTAL}`;
        color = '#e53e3e';
    } else if (total >= EV_MAX_USABLE) {
        // Óptimo: 508 es el máximo aprovechable. 509-510 sobran 1-2 EVs inútiles.
        text += ` ✓ Optimal`;
        color = '#38a169';
    } else {
        // Aún quedan EVs por repartir
        text += ` · Available: ${remaining}`;
        color = 'var(--text-color, #000)';
    }

    totalDisplay.textContent = text;
    totalDisplay.style.color = color;
}

function updateEvDisplay(slider) {
    const valueSpan = slider.parentElement.querySelector('.ev-value');
    valueSpan.textContent = slider.value;
}

function handleEvSlider(event) {
    const slider = event.target;
    const newValue = parseInt(slider.value);
    
    // Calcular total si aplicamos este cambio (solo sliders del modal clásico)
    const sliders = [...document.querySelectorAll('.ev-slider')].filter(s => !s.closest('#compact-pokemon-modal'));
    let total = 0;
    sliders.forEach(s => {
        if (s === slider) {
            total += newValue;
        } else {
            total += parseInt(s.value) || 0;
        }
    });
    
    // Si excede el límite total, recortar este slider a lo que queda disponible
    if (total > EV_MAX_TOTAL) {
        const available = EV_MAX_TOTAL - (total - newValue);
        // Mantener el paso de 4 y no bajar de 0
        slider.value = Math.max(0, Math.floor(available / 4) * 4);
    }
    
    updateEvDisplay(slider);
    updateEvTotal();
}

function toggleAllTeams() {
    const allExpanded = teams.every(team => team.expanded);
    const newState = !allExpanded;
    
    teams.forEach(team => {
        team.expanded = newState;
        const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
        if (teamElement) {
            const teamBuilder = teamElement.querySelector('.team-builder');
            const expandBtn = teamElement.querySelector('.expand-toggle');
            
            if (newState) {
                teamBuilder.classList.remove('team-collapsed');
                expandBtn.textContent = '▼';
            } else {
                teamBuilder.classList.add('team-collapsed');
                expandBtn.textContent = '▶';
                updateCompactView(team);
            }
        }
    });
    
    saveToSession();
}

function clearAllTeams() {
    if (teams.length === 0) {
        alert('No teams to clear');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ALL ${teams.length} teams?\n\nThis action cannot be undone.`)) {
        if (confirm('Are you COMPLETELY sure? All your teams and settings will be deleted.')) {
            // Limpiar localStorage
            localStorage.removeItem('pokemon-teams');
            
            // Limpiar equipos de la interfaz
            teams.forEach(team => {
                const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
                if (teamElement) teamElement.remove();
            });
            
            // Resetear variables
            teams.length = 0;
            teamCounter = 0;
            
            // Crear un equipo vacío
            createFirstTeam();
            
            alert('All teams have been deleted.');
        }
    }
}

// Tooltips para habilidades y movimientos.
// Ratón (hover): la burbuja aparece al pasar por encima y sigue al cursor.
// Táctil (sin hover): aparece al TOCAR, anclada al elemento (no bajo el dedo, que
//   la taparía) y se cierra al tocar fuera, al hacer scroll o al girar la pantalla.
//   En los elementos que ya tienen una acción propia (slot de movimiento, mote,
//   nivel, habilidad/objeto del modal) el toque corto mantiene su acción y el
//   tooltip se pide con una PULSACIÓN LARGA (~450 ms).
// Se usan Pointer Events: pointerType distingue ratón de dedo/lápiz, así que en
// equipos híbridos funcionan las dos vías sin abrir dos burbujas a la vez.
// Idempotente: crea el tooltip y registra los listeners UNA sola vez, aunque
// setupTooltips() se llame muchas veces. Los handlers usan delegación en document,
// así que funcionan con elementos creados dinámicamente (fichas y modales).
function setupTooltips() {
    // Crear el tooltip una sola vez
    let tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.35;
            max-width: min(300px, calc(100vw - 24px));
            z-index: 10001;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(tooltip);
    }

    // Registrar los listeners globales una sola vez
    if (window.__tooltipHandlersReady) return;
    window.__tooltipHandlersReady = true;

    // Elemento con tooltip bajo el puntero/dedo, o null.
    const tooltipTargetFor = (node) => (node && node.closest
        ? node.closest('.ability-tooltip, .move-tooltip, .species-tooltip, .item-tooltip, .defense-tooltip, .nature-tooltip')
        : null);

    // Elementos cuyo toque corto ya tiene una acción propia (abrir el selector de
    // movimientos, editar mote/nivel, elegir habilidad/objeto): en táctil se
    // respeta esa acción y el tooltip se pide con una pulsación larga.
    const OWN_ACTION_SELECTOR = '.move-slot, .move-select-item, .nickname-badge, .level-badge, .ability-option, .item-autocomplete-item';

    // Contenido HTML del tooltip de 'el', o null si no hay nada que mostrar.
    async function buildTooltipContent(el) {
        const abilityEl = el.closest('.ability-tooltip');
        const moveEl = el.closest('.move-tooltip');
        const speciesEl = el.closest('.species-tooltip');
        const itemEl = el.closest('.item-tooltip');
        const defenseEl = el.closest('.defense-tooltip');
        const natureEl = el.closest('.nature-tooltip');

        if (natureEl) {
            return getNatureTooltipHtml(natureEl.dataset.nature || 'hardy');
        }

        if (defenseEl) {
            const types = (defenseEl.dataset.types || '').split(',').filter(Boolean);
            if (!types.length) return null;
            return `<strong>Type defense (${types.join(' / ')})</strong>${getDefensiveSummaryHtml(types)}`;
        }

        if (itemEl) {
            const itemName = itemEl.dataset.itemName;
            const itemData = await fetchItemData(itemName);
            return itemData ? `<strong>${itemName}</strong><br>${itemData.effect}` : null;
        }

        if (speciesEl) {
            const speciesName = speciesEl.dataset.speciesName;
            // Buscar el Pokémon en el cache por nombre (tiene pokedexEntry y genus)
            let data = null;
            for (const p of pokemonCache.values()) {
                if (p.name === speciesName) { data = p; break; }
            }
            if (!data || (!data.pokedexEntry && !data.genus)) return null;
            const displayName = speciesName.charAt(0).toUpperCase() + speciesName.slice(1);
            return `<strong>${displayName}</strong>`
                + (data.genus ? `<br><em>${data.genus}</em>` : '')
                + (data.pokedexEntry ? `<br>${data.pokedexEntry}` : '');
        }

        if (abilityEl) {
            const abilityName = abilityEl.dataset.ability;
            const abilityData = await fetchAbilityData(abilityName);
            if (!abilityData) return null;
            return `<strong>${abilityName.replace(/-/g, ' ')}</strong><br>${abilityData.effect}`;
        } else if (moveEl) {
            const moveName = moveEl.dataset.move;
            const moveData = await fetchMoveData(moveName);
            if (!moveData) return null;

            const accuracyText = moveData.accuracy == null ? 'Nunca falla' : `${moveData.accuracy}%`;
            const classLabels = { physical: 'Físico', special: 'Especial', status: 'Estado' };
            const classText = classLabels[moveData.damage_class] || moveData.damage_class;
            const priorityText = moveData.priority ? `<br>Prioridad: ${moveData.priority > 0 ? '+' : ''}${moveData.priority}` : '';
            const effectChanceText = moveData.effectChance ? `<br>Efecto secundario: ${moveData.effectChance}%` : '';
            return `<strong>${moveName.replace(/-/g, ' ')}</strong>`
                + `<br>Tipo: ${moveData.type}`
                + `<br>Categoría: ${classText}`
                + `<br>Potencia: ${moveData.power || '—'}`
                + `<br>Precisión: ${accuracyText}`
                + `<br>PP: ${moveData.pp}`
                + priorityText
                + effectChanceText
                + `<br>${moveData.description}`;
        }

        return null;
    }

    // --- Anclaje, mostrar/ocultar y limpieza de hover inline ---
    // Elemento al que está anclado el tooltip en táctil (null con ratón) y token
    // para descartar respuestas de red que ya no vienen al caso.
    let anchoredEl = null;
    let anchorToken = 0;
    let suppressNextClick = false;

    function hideTooltip() {
        const tip = document.getElementById('tooltip');
        if (tip) tip.style.display = 'none';
        anchoredEl = null;
        anchorToken++;
    }

    // Coloca el tooltip anclado al elemento: encima si cabe y, si no, debajo, y
    // siempre dentro de la ventana (una burbuja pegada al dedo no se leería).
    function positionTooltipAt(el) {
        const tip = document.getElementById('tooltip');
        if (!tip || !el || !el.getBoundingClientRect) return;

        const rect = el.getBoundingClientRect();
        const margin = 8;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;

        tip.style.display = 'block';
        tip.style.visibility = 'hidden'; // medir sin que se vea el salto
        const w = tip.offsetWidth;
        const h = tip.offsetHeight;

        let left = rect.left + scrollX + rect.width / 2 - w / 2;
        left = Math.max(scrollX + margin, Math.min(left, scrollX + vw - w - margin));

        let top = rect.top + scrollY - h - margin;
        if (rect.top - h - margin < margin) top = rect.bottom + scrollY + margin;
        top = Math.max(scrollY + margin, Math.min(top, scrollY + vh - h - margin));

        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
        tip.style.visibility = 'visible';
    }

    // Muestra el tooltip de 'el'. Con anchored = true queda pegado al elemento y se
    // pinta al instante con un "Loading…", porque el primer dato puede venir de red.
    async function showTooltip(el, anchored = false) {
        const tip = document.getElementById('tooltip');
        if (!tip || !el) return;

        const token = ++anchorToken;
        anchoredEl = anchored ? el : null;

        if (anchored) {
            tip.innerHTML = '<span style="opacity:0.65;">Loading…</span>';
            positionTooltipAt(el);
        }

        const html = await buildTooltipContent(el);

        // Mientras cargaba, el usuario ya tocó otra cosa: se descarta la respuesta.
        if (token !== anchorToken || (anchored && anchoredEl !== el)) return;
        if (!html) { hideTooltip(); return; }

        tip.innerHTML = html;
        if (anchored) positionTooltipAt(el);
        tip.style.display = 'block';
    }

    // --------- Ratón: hover clásico; la burbuja sigue al cursor ---------
    document.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'mouse') return; // el dedo va por el camino táctil
        const el = tooltipTargetFor(e.target);
        if (el) showTooltip(el);
    });

    document.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const tip = document.getElementById('tooltip');
        if (tip && tip.style.display === 'block' && !anchoredEl) {
            tip.style.left = e.pageX + 10 + 'px';
            tip.style.top = e.pageY + 10 + 'px';
        }
    });

    document.addEventListener('pointerout', (e) => {
        if (e.pointerType !== 'mouse') return;
        const from = tooltipTargetFor(e.target);
        if (!from) return;
        // Al pasar a otro elemento con tooltip, el refresco lo hace pointerover.
        if (tooltipTargetFor(e.relatedTarget)) return;
        // Solo ocultar si el ratón sale realmente del elemento (no al pasar a un hijo)
        if (from.contains(e.relatedTarget)) return;
        hideTooltip();
    });

    // Los estados hover inline (onmouseover/onmouseout) no aportan nada en táctil y
    // en iOS pueden gastar el primer toque en "activar el hover": los quitamos del
    // bloque tocado (se regeneran al volver a pintar la ficha).
    function stripInlineHoverHandlers(node) {
        if (!node || !node.closest) return;
        const scope = node.closest('.team-builder, .modal-content') || node;
        scope.querySelectorAll('[onmouseover], [onmouseout]').forEach(n => {
            n.removeAttribute('onmouseover');
            n.removeAttribute('onmouseout');
        });
    }

    // --------- Táctil / lápiz: toque corto (acción o info) y pulsación larga ---------
    const LONG_PRESS_MS = 450;
    let pressTimer = null;
    let longPressFired = false;

    document.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        stripInlineHoverHandlers(e.target);
        suppressNextClick = false;
        longPressFired = false;
        clearTimeout(pressTimer);

        const el = tooltipTargetFor(e.target);
        if (!el) { hideTooltip(); return; } // el toque fuera cierra el tooltip anclado

        pressTimer = setTimeout(() => {
            longPressFired = true;
            suppressNextClick = true; // la pulsación larga no debe ejecutar la acción
            showTooltip(el, true);
        }, LONG_PRESS_MS);
    }, { passive: true });

    document.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') return;
        clearTimeout(pressTimer);
        if (longPressFired) return; // ya se mostró con la pulsación larga

        const el = tooltipTargetFor(e.target);
        if (!el) return;
        if (el.closest(OWN_ACTION_SELECTOR)) return; // el toque corto es su propia acción

        // Elemento informativo: el toque muestra (o cierra) su tooltip y no debe
        // disparar la acción de la ficha (p. ej. abrir la configuración).
        suppressNextClick = true;
        if (anchoredEl === el) { hideTooltip(); return; }
        showTooltip(el, true);
    });

    document.addEventListener('pointercancel', () => {
        clearTimeout(pressTimer);
        longPressFired = false;
    });

    document.addEventListener('click', (e) => {
        if (suppressNextClick) {  // venimos de un toque informativo o de pulsación larga
            suppressNextClick = false;
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (anchoredEl && tooltipTargetFor(e.target) !== anchoredEl) hideTooltip();
    }, true); // en captura: corta el click antes de que llegue al elemento

    // El anclaje deja de ser válido al hacer scroll (también dentro de un modal),
    // al girar la pantalla o al redimensionar.
    document.addEventListener('scroll', () => { if (anchoredEl) hideTooltip(); }, { passive: true, capture: true });
    window.addEventListener('orientationchange', hideTooltip);
    window.addEventListener('resize', () => { if (anchoredEl) positionTooltipAt(anchoredEl); });
}

async function createRandomTeam() {
    showLoading(true);
    
    const newTeam = {
        id: `team-${++teamCounter}`,
        name: `Random Team ${teamCounter}`,
        pokemon: [null, null, null, null, null, null, null, null],
        expanded: true
    };
    
    teams.push(newTeam);
    renderTeam(newTeam);
    
    // Generar 6 Pokémon aleatorios
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * allPokemonList.length);
        const randomPokemon = allPokemonList[randomIndex];
        
        const pokemon = await fetchPokemonData(randomPokemon.id);
        if (pokemon) {
            // Movimientos aleatorios
            const availableMoves = pokemon.moves.filter(m => m.learnMethod === 'level-up').slice(0, 20);
            const randomMoves = [];
            for (let j = 0; j < 4 && j < availableMoves.length; j++) {
                const moveIndex = Math.floor(Math.random() * availableMoves.length);
                const move = availableMoves.splice(moveIndex, 1)[0];
                randomMoves.push(move.name);
                await fetchMoveData(move.name);
            }
            
            // Naturaleza aleatoria
            const natures = ['hardy', 'adamant', 'modest', 'jolly', 'timid', 'bold', 'calm', 'impish', 'careful'];
            const randomNature = natures[Math.floor(Math.random() * natures.length)];
            
            newTeam.pokemon[i] = {
                ...pokemon,
                level: 50,
                nature: randomNature,
                gender: defaultGender(pokemon.genderRate),
                moves: randomMoves,
                selectedAbility: pokemon.abilities[0]?.name || null,
                nickname: '',
                currentSprite: 'front_default',
                heldItem: '',
                pokeball: DEFAULT_POKEBALL,
                evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
                ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 }
            };
        }
    }
    
    updateTeamDisplay(newTeam);
    updateTeamAnalysis(newTeam);
    setupTooltips();
    saveToSession();
    showLoading(false);
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    if (draggedElement && e.target !== draggedElement) {
        const draggedTeamId = draggedElement.dataset.teamId;
        const draggedSlot = parseInt(draggedElement.dataset.slot);
        const targetTeamId = e.target.dataset.teamId;
        const targetSlot = parseInt(e.target.dataset.slot);
        
        // Only allow drops within same team and main slots (0-5)
        if (draggedTeamId === targetTeamId && targetSlot < 6 && draggedSlot < 6) {
            const team = teams.find(t => t.id === draggedTeamId);
            if (team) {
                // Swap pokemon positions
                const temp = team.pokemon[draggedSlot];
                team.pokemon[draggedSlot] = team.pokemon[targetSlot];
                team.pokemon[targetSlot] = temp;
                
                // Update inputs
                const teamElement = document.querySelector(`[data-team-id="${team.id}"]`);
                const inputs = teamElement.querySelectorAll('.pokemon-autocomplete');
                [draggedSlot, targetSlot].forEach(slot => {
                    if (team.pokemon[slot]) {
                        inputs[slot].value = team.pokemon[slot].name.charAt(0).toUpperCase() + team.pokemon[slot].name.slice(1);
                    } else {
                        inputs[slot].value = '';
                    }
                });
                
                updateTeamDisplay(team);
                updateTeamAnalysis(team);
                if (!team.expanded) {
                    updateCompactView(team);
                }
            }
        }
    }
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    draggedElement = null;
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
    
    // Para formas especiales, resolver la especie base
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
    return `<span style="background: ${genInfo.color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; font-weight: bold;">${genInfo.name}</span>`;
}

function getTypeGradient(types) {
    const typeColors = TYPE_COLORS;
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    // Detrás de los Pokémon: los mismos colores de tipo pero suavizados (baja opacidad).
    if (types.length === 1) {
        const color = typeColors[types[0]] || '#68D391';
        return isDark 
            ? `linear-gradient(135deg, ${color}90, ${color}58)` 
            : `linear-gradient(135deg, ${color}75, ${color}4E)`;
    } else {
        const color1 = typeColors[types[0]] || '#68D391';
        const color2 = typeColors[types[1]] || '#68D391';
        return isDark 
            ? `linear-gradient(90deg, ${color1}90 0%, ${color1}90 35%, ${color2}90 65%, ${color2}90 100%)` 
            : `linear-gradient(90deg, ${color1}75 0%, ${color1}75 35%, ${color2}75 65%, ${color2}75 100%)`;
    }
}

function toggleAnalysisSection(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.analysis-toggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
    }
}

function setupDragAndDrop(teamElement, team) {
    const pokemonDisplays = teamElement.querySelectorAll('.pokemon-display');
    
    pokemonDisplays.forEach((display, index) => {
        if (index < 6) { // Solo slots principales
            display.draggable = true;
            display.addEventListener('dragstart', handleDragStart);
            display.addEventListener('dragover', handleDragOver);
            display.addEventListener('drop', handleDrop);
            display.addEventListener('dragend', handleDragEnd);
        }
    });
}

async function openMoveSelector(teamId, slotIndex, moveIndex) {
    const team = teams.find(t => t.id === teamId);
    const pokemon = team.pokemon[slotIndex];
    const fullPokemon = pokemonCache.get(pokemon.id) || pokemon;
    const allAvailableMoves = fullPokemon.moves || [];
    const currentMove = pokemon.moves && pokemon.moves[moveIndex];
    
    let modal = document.getElementById('move-selector-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'move-selector-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h3 id="move-modal-title">Select Move</h3>
                <div id="current-move-display" style="margin-bottom: 10px;"></div>
                <div style="margin-bottom: 15px;">
                    <div style="margin-bottom: 8px;">
                        <input type="text" id="move-search" placeholder="Search move..." style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 6px; background: var(--bg-white); color: var(--text-primary);">
                    </div>
                    <div class="move-filter-row">
                        <button class="move-filter-btn active" data-filter="all">All</button>
                        <button class="move-filter-btn" data-filter="physical">${getCategoryIconHtml('physical', 14)}Physical</button>
                        <button class="move-filter-btn" data-filter="special">${getCategoryIconHtml('special', 14)}Special</button>
                        <button class="move-filter-btn" data-filter="status">${getCategoryIconHtml('status', 14)}Status</button>
                        <button class="move-filter-btn" data-filter="stab">⭐ STAB</button>
                    </div>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85em; color: var(--text-primary); cursor: pointer;">
                        <input type="checkbox" id="custom-mode-checkbox" onchange="toggleCustomMode()" style="margin: 0;">
                        Custom move
                    </label>
                </div>
                <div id="moves-list" style="display: flex; flex-direction: column; gap: 5px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    modal.querySelector('#move-modal-title').textContent = `Move ${moveIndex + 1} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;
    
    // Guardar datos en el modal para selectCustomMove
    modal.dataset.teamId = teamId;
    modal.dataset.slotIndex = slotIndex;
    modal.dataset.moveIndex = moveIndex;
    
    const currentMoveDisplay = modal.querySelector('#current-move-display');
    const currentMoveData = currentMove ? movesCache.get(currentMove) : null;
    currentMoveDisplay.innerHTML = `
        <div class="dc-current-move ${currentMove ? 'filled' : 'empty'}">
            <div class="dc-current-left">
                <span class="dc-current-label">${currentMove ? 'Current move' : 'No move set'}</span>
                ${currentMove
                    ? `<span class="dc-current-name">${currentMove.replace(/-/g, ' ')}</span>`
                    : '<span class="dc-current-placeholder">Empty slot — pick one below</span>'}
            </div>
            <div class="dc-current-right">
                ${currentMoveData ? getTypeIconHtml(currentMoveData.type, 0.8) : ''}
                ${currentMoveData ? getCategoryIconHtml(currentMoveData.damage_class, 18) : ''}
                ${currentMove ? `<button class="dc-remove-move" onclick="removeMoveFromSlot('${teamId}', ${slotIndex}, ${moveIndex})" title="Remove move">✕</button>` : ''}
            </div>
        </div>
    `;
    
    // Resetear estado del modal
    const checkbox = modal.querySelector('#custom-mode-checkbox');
    const searchInput = modal.querySelector('#move-search');
    const movesList = modal.querySelector('#moves-list');
    
    checkbox.checked = false;
    searchInput.value = '';
    searchInput.placeholder = 'Search move...';
    movesList.style.display = 'flex';

    // Reiniciar el filtro de categoría a "All" en cada apertura (dataset + estado visual)
    modal.dataset.currentFilter = 'all';
    modal.querySelectorAll('.move-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'all');
    });
    
    modal.style.display = 'block';
    
    movesList.innerHTML = getMoveSkeletonHtml();
    
    async function renderMoves(query = '') {
        return new Promise(async (resolve) => {
        const currentFilter = modal.dataset.currentFilter || 'all';
        const movesByMethod = {
            'level-up': new Map(),
            'machine': new Set(),
            'egg': new Set(),
            'tutor': new Set()
        };
        
        for (const move of allAvailableMoves) {
            const moveName = typeof move === 'string' ? move : move.name;
            if (query && !moveName.includes(query.toLowerCase())) continue;
            
            // Filtrar por categoría
            if (currentFilter !== 'all') {
                const moveData = await fetchMoveData(moveName);
                if (currentFilter === 'stab') {
                    if (!moveData || !pokemon.types.includes(moveData.type)) continue;
                } else if (moveData && moveData.damage_class !== currentFilter) {
                    continue;
                }
            }
            
            const method = typeof move === 'object' ? move.learnMethod : 'level-up';
            if (method === 'level-up') {
                const level = typeof move === 'object' ? (move.level || 1) : 1;
                if (!movesByMethod[method].has(moveName) || movesByMethod[method].get(moveName).level > level) {
                    movesByMethod[method].set(moveName, { name: moveName, level });
                }
            } else if (movesByMethod[method]) {
                movesByMethod[method].add(moveName);
            }
        }
        
        if (currentMove && !query) {
            let foundInMethods = false;
            for (const moves of Object.values(movesByMethod)) {
                if (moves instanceof Map) {
                    if (moves.has(currentMove)) foundInMethods = true;
                } else if (moves instanceof Set) {
                    if (moves.has(currentMove)) foundInMethods = true;
                }
            }
            if (!foundInMethods) {
                if (!movesByMethod['machine']) movesByMethod['machine'] = new Set();
                movesByMethod['machine'].add(currentMove);
            }
        }
        
        let html = '';
        const methodNames = {'level-up': '📈 Por Nivel', 'machine': '💿 MT/MO', 'egg': '🥚 Huevo', 'tutor': '👨🏫 Tutor'};
        
        for (const [method, moves] of Object.entries(movesByMethod)) {
            const moveCount = method === 'level-up' ? moves.size : moves.size;
            if (moveCount === 0) continue;
            
            html += `<div style="background: #667eea; color: white; padding: 6px 10px; font-size: 0.9em; font-weight: bold; border-radius: 4px; margin-top: ${moveCount === Object.keys(movesByMethod).find(k => (k === 'level-up' ? movesByMethod[k].size : movesByMethod[k].size) > 0) === method ? '5px' : '10px'};">${methodNames[method]} (${moveCount})</div>`;
            
            let sortedMoves = method === 'level-up' ? Array.from(moves.values()).sort((a, b) => a.level - b.level) : Array.from(moves).map(name => ({ name })).sort((a, b) => a.name.localeCompare(b.name));
            
            for (const move of sortedMoves) {
                const moveData = await fetchMoveData(move.name);
                const isSelected = currentMove === move.name;
                const usedMoves = pokemon.moves.filter((m, idx) => m && idx !== moveIndex);
                const isAlreadyUsed = usedMoves.includes(move.name);
                const isSTAB = moveData && pokemon.types.includes(moveData.type);
                html += `
                    <div class="move-select-item move-tooltip" data-move="${move.name}" style="padding: 8px 12px; background: ${isSelected ? 'rgba(102, 126, 234, 0.2)' : isAlreadyUsed ? 'rgba(255, 193, 7, 0.1)' : 'var(--bg-white)'}; border: ${isSelected ? '2px solid #667eea' : isAlreadyUsed ? '2px solid #ffc107' : '1px solid var(--border-color)'}; border-left: 5px solid ${moveData ? getTypeColor(moveData.type) : 'var(--border-color)'}; border-radius: 4px; cursor: ${isAlreadyUsed ? 'not-allowed' : 'pointer'}; opacity: ${isAlreadyUsed ? '0.6' : '1'}; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;" onmouseover="this.style.background='${isAlreadyUsed ? 'rgba(255, 193, 7, 0.15)' : 'rgba(102, 126, 234, 0.1)'}'" onmouseout="this.style.background='${isSelected ? 'rgba(102, 126, 234, 0.2)' : isAlreadyUsed ? 'rgba(255, 193, 7, 0.1)' : 'var(--bg-white)'}'">
                        <div>
                            <span style="font-weight: bold; color: var(--text-primary);">${isSTAB ? '⭐ ' : ''}${move.name.replace(/-/g, ' ')}${isSelected ? ' ✓' : ''}${isAlreadyUsed ? ' ⚠️' : ''}</span>
                            ${method === 'level-up' && move.level ? `<span style="font-size: 0.8em; color: #666; margin-left: 8px;">Nv.${move.level}</span>` : ''}
                            ${isAlreadyUsed ? '<span style="font-size: 0.7em; color: #f59e0b; margin-left: 8px; font-weight: bold;">ALREADY USED</span>' : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${moveData ? `<span title="Power" style="font-size: 0.8em; color: #666;">⚔️${moveData.power || '-'}</span>` : ''}
                            ${moveData && moveData.accuracy != null ? `<span title="Accuracy" style="font-size: 0.8em; color: #666;">🎯${moveData.accuracy}</span>` : ''}
                            ${moveData ? getTypeIconHtml(moveData.type, 0.7) : ''}
                            ${moveData ? getCategoryIconHtml(moveData.damage_class, 16) : ''}
                        </div>
                    </div>
                `;
            }
        }
        

        

        
        movesList.innerHTML = html || '<p style="text-align: center; color: #666;">No moves found</p>';
        
        document.querySelectorAll('.move-select-item').forEach(item => {
            item.addEventListener('click', async () => {
                const moveName = item.dataset.move;
                const usedMoves = pokemon.moves.filter((m, idx) => m && idx !== moveIndex);
                if (usedMoves.includes(moveName)) {
                    alert('⚠️ This Pokémon already has that move in another slot.\n\nIn the Pokémon games moves cannot be repeated.');
                    return;
                }
                if (!pokemon.moves) pokemon.moves = [];
                pokemon.moves[moveIndex] = moveName;
                await fetchMoveData(moveName);
                
                currentMoveDisplay.innerHTML = `
                    <div style="background: rgba(72, 187, 120, 0.15); border: 2px solid #48bb78; border-radius: 6px; padding: 10px; text-align: center;">
                        <span style="font-size: 0.85em; color: #48bb78; font-weight: 600;">✓ MOVIMIENTO SELECCIONADO:</span>
                        <div style="font-size: 1.1em; font-weight: bold; color: #48bb78; margin-top: 5px;">${moveName.replace(/-/g, ' ').toUpperCase()}</div>
                    </div>
                `;
                
                setTimeout(() => {
                    updateTeamDisplay(team);
                    updateTeamAnalysis(team);
                    saveToSession();
                    modal.style.display = 'none';
                }, 500);
            });
        });
        
        resolve();
        });
    }
    
    // Hacer renderMoves disponible globalmente en el modal
    modal.renderMoves = renderMoves;
    
    // Deshabilitar input mientras carga
    searchInput.disabled = true;
    searchInput.placeholder = 'Loading moves...';
    
    // Autocompletado para modo personalizado
    searchInput.oninput = (e) => {
        const isCustomMode = document.getElementById('custom-mode-checkbox').checked;
        if (isCustomMode) {
            handleCustomMoveAutocomplete(e.target.value);
        } else {
            renderMoves(e.target.value);
        }
    };
    
    // Configurar filtros de categoría
    modal.querySelectorAll('.move-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.move-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            modal.dataset.currentFilter = btn.dataset.filter;
            renderMoves(searchInput.value);
        });
    });
    modal.dataset.currentFilter = 'all';
    
    // Cargar movimientos y habilitar input
    renderMoves().then(() => {
        searchInput.disabled = false;
        searchInput.placeholder = 'Search move...';
    });
}

function removeMoveFromSlot(teamId, slotIndex, moveIndex) {
    const team = teams.find(t => t.id === teamId);
    const pokemon = team.pokemon[slotIndex];
    
    if (pokemon && pokemon.moves) {
        pokemon.moves[moveIndex] = null;
        
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        saveToSession();
        
        const modal = document.getElementById('move-selector-modal');
        if (modal) modal.style.display = 'none';
    }
}

function toggleCustomMode() {
    const checkbox = document.getElementById('custom-mode-checkbox');
    const searchInput = document.getElementById('move-search');
    const addButton = document.getElementById('custom-add-btn');
    const movesList = document.getElementById('moves-list');
    
    // No permitir cambio si está deshabilitado
    if (searchInput.disabled) {
        checkbox.checked = !checkbox.checked; // Revertir el cambio
        return;
    }
    
    if (checkbox.checked) {
        searchInput.placeholder = 'Type a custom move...';
        movesList.style.display = 'flex';
        searchInput.value = '';
        movesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Type at least 2 characters to search...</p>';
    } else {
        searchInput.placeholder = 'Search move...';
        movesList.style.display = 'flex';
        searchInput.value = '';
        // Re-renderizar la lista completa sin filtros
        const modal = document.getElementById('move-selector-modal');
        if (modal && modal.style.display === 'block') {
            const renderFunction = modal.renderMoves;
            if (renderFunction) renderFunction('');
        }
    }
}

let allMovesList = [];

// Cargar lista completa de movimientos de la API
async function loadAllMoves() {
    if (allMovesList.length > 0) return;
    
    try {
        const response = await fetch(`${API_BASE}/move?limit=1000`);
        const data = await response.json();
        allMovesList = data.results.map(move => move.name);
    } catch (error) {
        console.error('Error cargando movimientos:', error);
    }
}

async function handleCustomMoveAutocomplete(query) {
    const movesList = document.getElementById('moves-list');
    
    if (!query || query.length < 2) {
        movesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Type at least 2 characters to search...</p>';
        return;
    }
    
    // Cargar movimientos si no están cargados
    if (allMovesList.length === 0) {
        movesList.innerHTML = getMoveSkeletonHtml();
        await loadAllMoves();
    }
    
    const matches = allMovesList.filter(move => 
        move.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 12);
    
    if (matches.length === 0) {
        movesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No se encontraron movimientos</p>';
        return;
    }
    
    // Mostrar loading mientras carga los datos
    movesList.innerHTML = `
        <div style="background: #28a745; color: white; padding: 6px 10px; font-size: 0.9em; font-weight: bold; border-radius: 4px; margin-bottom: 5px;">💡 Movimientos (${matches.length})</div>
        <p style="text-align: center; color: #666; padding: 20px;">⏳ Cargando datos...</p>
    `;
    
    let html = `<div style="background: #28a745; color: white; padding: 6px 10px; font-size: 0.9em; font-weight: bold; border-radius: 4px; margin-bottom: 5px;">💡 Movimientos (${matches.length})</div>`;
    
    const modal = document.getElementById('move-selector-modal');
    const teamId = modal.dataset.teamId;
    const slotIndex = parseInt(modal.dataset.slotIndex);
    const moveIndex = parseInt(modal.dataset.moveIndex);
    const team = teams.find(t => t.id === teamId);
    const pokemon = team.pokemon[slotIndex];
    const usedMoves = pokemon.moves.filter((m, idx) => m && idx !== moveIndex);
    
    // Cargar datos detallados pero limitado a 12 para mantener velocidad
    for (const move of matches) {
        const displayName = move.replace(/-/g, ' ');
        const moveData = await fetchMoveData(move);
        const isAlreadyUsed = usedMoves.includes(move);
        html += `
            <div class="move-select-item" style="padding: 8px 12px; background: ${isAlreadyUsed ? 'rgba(255, 193, 7, 0.1)' : 'var(--bg-white)'}; border: ${isAlreadyUsed ? '2px solid #ffc107' : '1px solid var(--border-color)'}; border-radius: 4px; cursor: ${isAlreadyUsed ? 'not-allowed' : 'pointer'}; opacity: ${isAlreadyUsed ? '0.6' : '1'}; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center;" onmouseover="this.style.background='${isAlreadyUsed ? 'rgba(255, 193, 7, 0.15)' : 'rgba(40, 167, 69, 0.1)'}'" onmouseout="this.style.background='${isAlreadyUsed ? 'rgba(255, 193, 7, 0.1)' : 'var(--bg-white)'}'" onclick="selectCustomMove('${move}')">
                <span style="font-weight: bold; color: var(--text-primary);">${displayName}${isAlreadyUsed ? ' ⚠️' : ''}</span>
                ${isAlreadyUsed ? '<span style="font-size: 0.7em; color: #f59e0b; margin-left: 8px; font-weight: bold;">YA USADO</span>' : ''}
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${moveData ? `<span style="font-size: 0.8em; color: #666;">${moveData.power || '-'}</span>` : ''}
                    ${moveData ? getTypeIconHtml(moveData.type, 0.7) : ''}
                </div>
            </div>
        `;
    }
    
    movesList.innerHTML = html;
}

async function selectCustomMove(moveName) {
    const modal = document.getElementById('move-selector-modal');
    if (!modal) return;
    
    // Obtener información del modal
    const teamId = modal.dataset.teamId;
    const slotIndex = parseInt(modal.dataset.slotIndex);
    const moveIndex = parseInt(modal.dataset.moveIndex);
    
    const team = teams.find(t => t.id === teamId);
    const pokemon = team.pokemon[slotIndex];
    
    if (pokemon) {
        const formattedMove = moveName.toLowerCase().replace(/\s+/g, '-');
        const usedMoves = pokemon.moves.filter((m, idx) => m && idx !== moveIndex);
        if (usedMoves.includes(formattedMove)) {
            alert('⚠️ This Pokémon already has that move in another slot.\n\nIn the Pokémon games moves cannot be repeated.');
            return;
        }
        
        if (!pokemon.moves) pokemon.moves = [];
        pokemon.moves[moveIndex] = formattedMove;
        
        await fetchMoveData(formattedMove);
        
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        saveToSession();
        
        modal.style.display = 'none';
    }
}

async function addCustomMove(teamId, slotIndex, moveIndex) {
    const input = document.getElementById('move-search');
    const moveName = input.value.trim();
    
    if (!moveName) {
        alert('Por favor escribe el nombre del movimiento');
        return;
    }
    
    const team = teams.find(t => t.id === teamId);
    const pokemon = team.pokemon[slotIndex];
    
    if (pokemon) {
        const formattedMove = moveName.toLowerCase().replace(/\s+/g, '-');
        
        if (!pokemon.moves) pokemon.moves = [];
        pokemon.moves[moveIndex] = formattedMove;
        
        await fetchMoveData(formattedMove);
        
        updateTeamDisplay(team);
        updateTeamAnalysis(team);
        saveToSession();
        
        const modal = document.getElementById('move-selector-modal');
        if (modal) modal.style.display = 'none';
    }
}

window.removePokemon = removePokemon;
window.editNickname = editNickname;
window.editLevel = editLevel;
window.toggleGender = toggleGender;
window.openCompactPokemonDetail = openCompactPokemonDetail;
window.closeCompactPokemonDetail = closeCompactPokemonDetail;
window.refreshCompactPokemonDetail = refreshCompactPokemonDetail;
window.renderCompactPokemonDetailBody = renderCompactPokemonDetailBody;
window.changePokemonSprite = changePokemonSprite;
window.toggleAnalysisSection = toggleAnalysisSection;
window.toggleSidebar = toggleSidebar;
window.openMoveSelector = openMoveSelector;
window.removeMoveFromSlot = removeMoveFromSlot;
window.addCustomMove = addCustomMove;
window.toggleCustomMode = toggleCustomMode;
window.selectCustomMove = selectCustomMove;

// Exportar equipo como imagen usando html2canvas
async function exportTeamAsImage() {
    if (teams.length === 0) {
        alert('⚠️ No teams to export');
        return;
    }
    
    // Selector de equipo si hay múltiples
    let teamToExport = teams[0];
    if (teams.length > 1) {
        const teamNames = teams.map((t, i) => `${i + 1}. ${t.name}`).join('\n');
        const selection = prompt(`Selecciona el equipo a exportar (1-${teams.length}):\n\n${teamNames}`);
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < teams.length) {
            teamToExport = teams[index];
        } else {
            alert('❌ Selección inválida');
            return;
        }
    }
    
    const teamPokemon = teamToExport.pokemon.slice(0, 6).filter(p => p !== null);
    if (teamPokemon.length === 0) {
        alert('⚠️ The team is empty');
        return;
    }
    
    // Crear canvas manualmente
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 200 * teamPokemon.length + 100;
    
    // Fondo
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(teamToExport.name, 20, 50);
    
    // Dibujar cada Pokémon
    for (let i = 0; i < teamPokemon.length; i++) {
        const pokemon = teamPokemon[i];
        const y = 100 + i * 200;
        
        // Fondo del Pokémon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, y, 1180, 180);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, y, 1180, 180);
        
        // Cargar y dibujar sprite
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = pokemon.sprites[pokemon.currentSprite || 'front_default'];
            });
            ctx.drawImage(img, 20, y + 20, 140, 140);
        } catch (e) {
            console.error('Error cargando sprite:', e);
        }
        
        // Nombre
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 24px Arial';
        const displayName = pokemon.nickname || pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        ctx.fillText(displayName, 180, y + 40);
        
        // Tipos
        ctx.font = '16px Arial';
        let typeX = 180;
        pokemon.types.forEach(type => {
            ctx.fillStyle = getTypeColor(type);
            ctx.fillRect(typeX, y + 50, 80, 25);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(type.toUpperCase(), typeX + 10, y + 68);
            typeX += 90;
        });
        
        // Movimientos
        ctx.fillStyle = '#4a5568';
        ctx.font = '14px Arial';
        ctx.fillText('Moves:', 180, y + 100);
        if (pokemon.moves && pokemon.moves.length > 0) {
            pokemon.moves.forEach((move, idx) => {
                ctx.fillText(`• ${move.replace(/-/g, ' ')}`, 180, y + 120 + idx * 18);
            });
        }
        
        // Stats
        ctx.fillText('Stats:', 600, y + 40);
        const stats = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
        const statValues = [pokemon.stats.hp, pokemon.stats.attack, pokemon.stats.defense, pokemon.stats.spAttack, pokemon.stats.spDefense, pokemon.stats.speed];
        stats.forEach((stat, idx) => {
            ctx.fillText(`${stat}: ${statValues[idx]}`, 600, y + 60 + idx * 20);
        });
        
        // Naturaleza y habilidad
        ctx.fillText(`Nature: ${pokemon.nature || 'Hardy'}`, 800, y + 40);
        ctx.fillText(`Ability: ${pokemon.selectedAbility || 'N/A'}`, 800, y + 60);
        if (pokemon.heldItem) {
            ctx.fillText(`Item: ${pokemon.heldItem}`, 800, y + 80);
        }
    }
    
    // Descargar imagen
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${teamToExport.name.replace(/\s+/g, '_')}.png`;
        a.click();
        URL.revokeObjectURL(url);
        alert('✅ Image exported successfully');
    });
}

// Sexo por defecto según el ratio de género de la especie.
// Devuelve 'M', 'F' o null (sin género).
function defaultGender(genderRate) {
    if (genderRate === -1 || genderRate == null) return null; // sin género
    if (genderRate === 0) return 'M';  // siempre macho
    if (genderRate === 8) return 'F';  // siempre hembra
    return 'M'; // ambos posibles -> macho por defecto
}

// ¿La especie admite elegir entre ♂ y ♀?
function canChooseGender(genderRate) {
    return genderRate >= 1 && genderRate <= 7;
}

// Color de la barra de estadística según su valor, al estilo del juego.
// Escala pensada para stats reales (rojo bajo -> cian muy alto).
function getStatBarColor(value) {
    // Same 0–550 reference used by the bar width. The old thresholds ended
    // at 180, which made most real stats look like they were already maxed.
    if (value < 130) return '#e53e3e';  // red: low
    if (value < 195) return '#ed8936';  // orange
    if (value < 260) return '#ecc94b';  // yellow
    if (value < 325) return '#48bb78';  // green
    if (value < 390) return '#38b2ac';  // teal
    return '#4299e1';                   // cyan: very high
}

// Devuelve la URL del sprite a mostrar: prefiere el animado (GIF de Gen 5) si existe
// para ese tipo de sprite; si no, usa el estático correspondiente.
function getSpriteUrl(pokemon, spriteType) {
    const type = spriteType || 'front_default';
    const animated = pokemon.animatedSprites && pokemon.animatedSprites[type];
    if (animated) return animated;

    // Some newer Pokémon have an animated file in the sprite repository even
    // when PokeAPI does not return it in the Black/White animated field.
    // The existing image onerror handlers keep the static sprite as fallback.
    if (pokemon.id) return getAnimatedSpriteUrl(pokemon.id, type);

    return pokemon.sprites[type];
}

function getAnimatedSpriteUrl(pokemonId, spriteType) {
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

// Convierte el nombre visible de un objeto al nombre del archivo PNG.
// Los archivos están en MAYÚSCULAS, sin espacios, guiones, apóstrofes ni acentos.
// Ej: "Choice Band" -> "CHOICEBAND", "Heavy-Duty Boots" -> "HEAVYDUTYBOOTS", "King's Rock" -> "KINGSROCK".
function getItemImage(itemName) {
    if (!itemName) return '';
    const file = itemName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .replace(/['’.\-\s]/g, '')                          // quitar apóstrofes, puntos, guiones, espacios
        .toUpperCase();
    return `../assets/images/Items/${file}.png`;
}

// HTML de la imagen del objeto (se oculta sola si el PNG no existe).
function getItemImageTag(itemName, size = 16) {
    const src = getItemImage(itemName);
    if (!src) return '';
    return `<img src="${src}" alt="" style="width: ${size}px; height: ${size}px; object-fit: contain; vertical-align: middle; flex-shrink: 0;" onerror="this.style.display='none'">`;
}

// ===== Pokébolas =====
// Lista de pokébolas disponibles. La clave es el identificador guardado en el
// Pokémon (pokemon.pokeball); el label es el nombre mostrado. Los archivos están
// en assets/images/Balls como ball_<KEY>.png (cerrada) y ball_<KEY>_open.png (abierta).
const POKEBALLS = [
    { key: 'POKEBALL',   label: 'Poké Ball' },
    { key: 'GREATBALL',  label: 'Great Ball' },
    { key: 'ULTRABALL',  label: 'Ultra Ball' },
    { key: 'MASTERBALL', label: 'Master Ball' },
    { key: 'PREMIERBALL', label: 'Premier Ball' },
    { key: 'CHERISHBALL', label: 'Cherish Ball' },
    { key: 'SAFARIBALL', label: 'Safari Ball' },
    { key: 'FASTBALL',   label: 'Fast Ball' },
    { key: 'LEVELBALL',  label: 'Level Ball' },
    { key: 'LUREBALL',   label: 'Lure Ball' },
    { key: 'HEAVYBALL',  label: 'Heavy Ball' },
    { key: 'LOVEBALL',   label: 'Love Ball' },
    { key: 'FRIENDBALL', label: 'Friend Ball' },
    { key: 'MOONBALL',   label: 'Moon Ball' },
    { key: 'SPORTBALL',  label: 'Sport Ball' },
    { key: 'NETBALL',    label: 'Net Ball' },
    { key: 'DIVEBALL',   label: 'Dive Ball' },
    { key: 'NESTBALL',   label: 'Nest Ball' },
    { key: 'REPEATBALL', label: 'Repeat Ball' },
    { key: 'TIMERBALL',  label: 'Timer Ball' },
    { key: 'LUXURYBALL', label: 'Luxury Ball' },
    { key: 'DUSKBALL',   label: 'Dusk Ball' },
    { key: 'HEALBALL',   label: 'Heal Ball' },
    { key: 'QUICKBALL',  label: 'Quick Ball' },
    { key: 'DREAMBALL',  label: 'Dream Ball' },
    { key: 'BEASTBALL',  label: 'Beast Ball' }
];

const DEFAULT_POKEBALL = 'POKEBALL';

// IMPORTANTE sobre las imágenes de bolas:
//   ball_<KEY>.png       = spritesheet horizontal de 256x64 = 8 frames de 32x64
//                          (animación de giro/caída de la bola).
//   ball_<KEY>_open.png  = 32x64, un solo frame (bola abierta).
// Por eso NO se usan como <img> directa (se ven estiradas): se muestran como
// fondo recortando 1 frame con background-size/position.
const POKEBALL_FRAMES = 8;

function getPokeballSheet(key) {
    const k = (key || DEFAULT_POKEBALL).toUpperCase();
    return `../assets/images/Balls/ball_${k}.png`;
}

function getPokeballOpenImage(key) {
    const k = (key || DEFAULT_POKEBALL).toUpperCase();
    return `../assets/images/Balls/ball_${k}_open.png`;
}

function getPokeballLabel(key) {
    const b = POKEBALLS.find(p => p.key === (key || DEFAULT_POKEBALL).toUpperCase());
    return b ? b.label : 'Poké Ball';
}

// ===== Huellas (Footprints) =====
// Los archivos en assets/images/Footprints se llaman <NOMBRE>.png en mayúsculas
// y solo por especie base (sin formas). Ej: "charizard-mega-x" -> "CHARIZARD.png".
function getFootprintImage(pokemonName) {
    if (!pokemonName) return '';
    const base = pokemonName.split('-')[0]
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/['’.\s]/g, '')
        .toUpperCase();
    return `../assets/images/Footprints/${base}.png`;
}

// HTML del icono de huella (se oculta solo si el PNG no existe para esa especie).
function getFootprintTag(pokemonName, size = 18) {
    const src = getFootprintImage(pokemonName);
    if (!src) return '';
    return `<img class="footprint-icon" src="${src}" alt="Huella" title="Huella"
        style="width:${size}px; height:${size}px; object-fit:contain; image-rendering:pixelated;"
        onerror="this.style.display='none'">`;
}

// Estilo inline para mostrar 1 frame del spritesheet como fondo.
// El sheet tiene 8 frames en horizontal; background-size 800% muestra 1 frame,
// y frameIndex (0..7) selecciona cuál vía background-position-x.
function pokeballFrameStyle(key, frameIndex = 0) {
    const sheet = getPokeballSheet(key);
    // El sheet es 32x64 por frame, pero la bola visible está en la mitad
    // superior; mostramos el frame completo y el contenedor recorta con overflow.
    const posX = POKEBALL_FRAMES > 1 ? (frameIndex / (POKEBALL_FRAMES - 1)) * 100 : 0;
    return `background-image: url('${sheet}'); background-size: ${POKEBALL_FRAMES * 100}% 100%; background-position: ${posX}% 0; background-repeat: no-repeat;`;
}

// HTML de la pokébola para la esquina de la ficha (frame estático 0).
function getPokeballBadgeHtml(key, teamId, slotIndex) {
    const k = (key || DEFAULT_POKEBALL).toUpperCase();
    const label = getPokeballLabel(k);
    return `<span class="pokeball-badge" title="${label}" data-ball="${k}"
        onclick="event.stopPropagation(); openPokemonModal(teams.find(t=>t.id==='${teamId}'), ${slotIndex})"
        style="${pokeballFrameStyle(k, 0)} cursor: pointer;"></span>`;
}

// Índice de cada tipo en el spritesheet types_ico.png (columna de celdas 24x28).
const TYPE_ICON_INDEX = {
    normal: 0, fighting: 1, flying: 2, poison: 3, ground: 4, rock: 5, bug: 6, ghost: 7, steel: 8,
    fire: 10, water: 11, grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
};

// Colores de tipo extraídos directamente de los iconos de types_ico.png
// (color dominante de cada celda). Se usan para la franja izquierda de los
// movimientos y para el fondo (suavizado) detrás de los Pokémon.
const TYPE_COLORS = {
    normal: '#587282', fire: '#FF3D22', water: '#0078DF', electric: '#FFC20E',
    grass: '#009C15', ice: '#00D3BF', fighting: '#FE6B00', poison: '#9952D3',
    ground: '#994B1F', flying: '#0090C5', psychic: '#FF3E4F', bug: '#B9B400',
    rock: '#B99F60', ghost: '#512A48', dragon: '#401FFB', dark: '#3A3440',
    steel: '#30889A', fairy: '#FF68FF'
};

// Icono de tipo desde el spritesheet. Escalable con el parámetro scale (1 = 24x28).
function getTypeIconHtml(type, scale = 1) {
    const idx = TYPE_ICON_INDEX[type];
    if (idx === undefined) return `<span class="type-badge type-${type}" style="font-size:0.7em;padding:2px 4px;">${type}</span>`;
    const w = 24 * scale, h = 28 * scale;
    const posY = -(idx * 28 * scale);
    return `<span class="type-icon" title="${type}" style="display:inline-block; width:${w}px; height:${h}px; background-image:url('../assets/images/Battle/types_ico.png'); background-repeat:no-repeat; background-position:0 ${posY}px; background-size:${24*scale}px ${532*scale}px; vertical-align:middle;"></span>`;
}

// Skeleton loader para la lista de movimientos mientras cargan.
function getMoveSkeletonHtml(rows = 7) {
    let html = '';
    for (let i = 0; i < rows; i++) {
        html += `
            <div class="move-skeleton">
                <div class="sk-line sk-name"></div>
                <div class="sk-right">
                    <div class="sk-pill"></div>
                    <div class="sk-pill"></div>
                    <div class="sk-icon"></div>
                </div>
            </div>`;
    }
    return html;
}

// Contador de equipo con Pokéballs: llenas = Pokémon presentes, vacías = slots libres.
function getTeamBallsHtml(count, total = 6) {
    let balls = '';
    for (let i = 0; i < total; i++) {
        const src = i < count ? 'icon_ball' : 'icon_ball_empty';
        balls += `<img src="../assets/images/Battle/${src}.png" alt="" style="width:16px; height:16px; vertical-align:middle;">`;
    }
    return `<span style="display:inline-flex; gap:2px; align-items:center; vertical-align:middle;">${balls}</span>`;
}

// Índice de cada categoría de daño en el spritesheet category.png (3 celdas 64x28).
const CATEGORY_ICON_INDEX = { physical: 0, special: 1, status: 2 };

// Icono de categoría (físico/especial/estado) desde el spritesheet.
// La celda nativa es 64x28 (muy ancha). Recortamos a una ventana cuadrada de 28x28
// centrada, mostrando solo la parte central del icono. size = lado del cuadrado en px.
function getCategoryIconHtml(damageClass, size = 16) {
    const idx = CATEGORY_ICON_INDEX[damageClass];
    if (idx === undefined) return '';
    const scale = size / 28;               // celda nativa 28px de alto
    const posX = -((64 - 28) / 2) * scale; // centrar horizontalmente (recorta 18px por lado)
    const posY = -(idx * 28 * scale);
    return `<span class="category-icon" title="${damageClass}" style="display:inline-block; width:${size}px; height:${size}px; background-image:url('../assets/images/category.png'); background-repeat:no-repeat; background-position:${posX}px ${posY}px; background-size:${64*scale}px ${84*scale}px; vertical-align:middle;"></span>`;
}

// Pastilla con icono de tipo + texto (conteos, porcentajes) para el análisis de equipo.
function typeCountChip(type, text) {
    return `<span style="display:inline-flex; align-items:center; gap:3px; background:rgba(102,126,234,0.1); border-radius:6px; padding:2px 6px; margin:2px; font-size:0.8em; color:var(--text-primary);">${getTypeIconHtml(type, 0.7)}${text}</span>`;
}

// Modal para elegir el entrenador de referencia (cuadrícula de miniaturas).
function openTrainerSelector() {
    let modal = document.getElementById('trainer-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'trainer-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 640px; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h3>Elegir entrenador</h3>
                <p style="font-size: 0.85em; color: var(--text-primary); opacity: 0.7; margin-bottom: 12px;">Se usa como referencia de tamaño (1.75 m) en todos los equipos.</p>
                <div id="trainer-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    const grid = modal.querySelector('#trainer-grid');
    grid.innerHTML = TRAINERS.map(name => {
        const isSel = name === selectedTrainer;
        return `
            <div class="trainer-option" data-trainer="${name}" title="${name}" style="border: 2px solid ${isSel ? '#667eea' : 'var(--border-color)'}; border-radius: 8px; padding: 6px; cursor: pointer; background: ${isSel ? 'rgba(102,126,234,0.12)' : 'var(--bg-white)'}; display: flex; align-items: flex-end; justify-content: center; height: 72px;">
                <img src="../assets/images/Trainers/${name}.png" alt="${name}" style="max-height: 60px; max-width: 100%; object-fit: contain;" onerror="this.closest('.trainer-option').style.display='none'">
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.trainer-option').forEach(opt => {
        opt.addEventListener('click', () => {
            selectedTrainer = opt.dataset.trainer;
            localStorage.setItem('selected-trainer', selectedTrainer);
            modal.style.display = 'none';
            // Re-renderizar comparaciones de tamaños de todos los equipos
            teams.forEach(team => {
                updateTeamAnalysis(team);
                if (!team.expanded) updateCompactView(team);
            });
        });
    });

    modal.style.display = 'block';
}

function getTypeColor(type) {
    return TYPE_COLORS[type] || '#68D391';
}
