// Tipos de Pokémon
const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Tabla de efectividades completa y correcta (atacante vs defensor)
const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Nombres en español
const TYPE_NAMES = {
    normal: 'Normal',
    fire: 'Fire',
    water: 'Water',
    electric: 'Electric',
    grass: 'Grass',
    ice: 'Ice',
    fighting: 'Fighting',
    poison: 'Poison',
    ground: 'Ground',
    flying: 'Flying',
    psychic: 'Psychic',
    bug: 'Bug',
    rock: 'Rock',
    ghost: 'Ghost',
    dragon: 'Dragon',
    dark: 'Dark',
    steel: 'Steel',
    fairy: 'Fairy'
};

// Ejemplos de Pokémon por tipo (GENERADO AUTOMÁTICAMENTE)
const POKEMON_EXAMPLES = {
    // Tipos únicos
    'bug': [10, 11, 127, 204, 265, 266],
    'dark': [197, 261, 262, 359, 491, 509],
    'dragon': [147, 148, 371, 372, 610, 611],
    'electric': [25, 26, 100, 101, 125, 135],
    'fairy': [35, 36, 173, 175, 209, 210],
    'fighting': [56, 57, 66, 67, 68, 106],
    'fire': [4, 5, 37, 38, 58, 59],
    'flying': [641, 821, 822],
    'ghost': [200, 353, 354, 355, 356, 429],
    'grass': [114, 152, 153, 154, 182, 191],
    'ground': [27, 28, 50, 51, 104, 105],
    'ice': [361, 362, 378, 471, 582, 583],
    'normal': [19, 20, 52, 53, 108, 113],
    'poison': [23, 24, 29, 30, 32, 33],
    'psychic': [63, 64, 65, 96, 97, 150],
    'rock': [185, 299, 377, 408, 409, 438],
    'steel': [379, 599, 600, 601, 808, 809],
    'water': [7, 8, 9, 54, 55, 60],
    
    // Combinaciones duales
    'bug+dark': [920],
    'bug+electric': [595, 596, 737, 738],
    'bug+fairy': [742, 743],
    'bug+fighting': [214, 794, 795, 988],
    'bug+fire': [636, 637, 850, 851],
    'bug+flying': [12, 123, 165, 166, 193, 267],
    'bug+ghost': [292],
    'bug+grass': [46, 47, 413, 540, 541, 542],
    'bug+ground': [290],
    'bug+ice': [872, 873],
    'bug+poison': [13, 14, 15, 48, 49, 167],
    'bug+psychic': [825, 826, 954],
    'bug+rock': [213, 347, 348, 557, 558, 900],
    'bug+steel': [205, 212, 589, 632, 649],
    'bug+water': [283, 751, 752, 767, 768],
    'dark+bug': [920],
    'dark+dragon': [633, 634, 635, 799, 1005],
    'dark+electric': [877],
    'dark+fairy': [859, 860, 861],
    'dark+fighting': [559, 560, 675, 892],
    'dark+fire': [228, 229, 727, 1004],
    'dark+flying': [198, 430, 629, 630, 717, 962],
    'dark+ghost': [302, 442],
    'dark+grass': [274, 275, 332, 893, 908, 986],
    'dark+ground': [551, 552, 553, 1003],
    'dark+ice': [215, 461, 1002],
    'dark+normal': [862],
    'dark+poison': [434, 435, 452, 904],
    'dark+psychic': [686, 687],
    'dark+rock': [248],
    'dark+steel': [624, 625, 983],
    'dark+water': [318, 319, 342, 658],
    'dragon+dark': [633, 634, 635, 799, 1005],
    'dragon+electric': [644, 880, 1008],
    'dragon+fighting': [783, 784, 1007],
    'dragon+fire': [643, 776],
    'dragon+flying': [149, 334, 373, 384, 714, 715],
    'dragon+ghost': [487, 885, 886, 887],
    'dragon+grass': [840, 841, 842],
    'dragon+ground': [329, 330, 443, 444, 445, 718],
    'dragon+ice': [646, 996, 997, 998],
    'dragon+normal': [780, 967],
    'dragon+poison': [691, 804, 890],
    'dragon+psychic': [380, 381],
    'dragon+rock': [696, 697],
    'dragon+steel': [483, 884],
    'dragon+water': [230, 484, 882, 978, 1009],
    'electric+bug': [595, 596, 737, 738],
    'electric+dark': [877],
    'electric+dragon': [644, 880, 1008],
    'electric+fairy': [702, 785],
    'electric+fighting': [922, 923, 992],
    'electric+flying': [145, 587, 642, 940, 941],
    'electric+ghost': [479],
    'electric+ground': [618, 989],
    'electric+ice': [881],
    'electric+normal': [694, 695],
    'electric+poison': [848, 849],
    'electric+rock': [995],
    'electric+steel': [81, 82, 462, 777],
    'electric+water': [170, 171],
    'fairy+bug': [742, 743],
    'fairy+dark': [859, 860, 861],
    'fairy+electric': [702, 785],
    'fairy+fighting': [1006],
    'fairy+flying': [176, 468, 905],
    'fairy+ghost': [778, 987],
    'fairy+grass': [546, 547, 755, 756, 787],
    'fairy+normal': [39, 40, 174, 298],
    'fairy+psychic': [122, 280, 281, 282, 439, 786],
    'fairy+rock': [703, 719],
    'fairy+steel': [303, 707, 801, 957, 958, 959],
    'fairy+water': [183, 184, 730, 788],
    'fighting+bug': [214, 794, 795, 988],
    'fighting+dark': [559, 560, 675, 892],
    'fighting+dragon': [783, 784, 1007],
    'fighting+electric': [922, 923, 992],
    'fighting+fairy': [1006],
    'fighting+fire': [256, 257, 391, 392, 499, 500],
    'fighting+flying': [701, 973],
    'fighting+ghost': [802, 979],
    'fighting+grass': [286, 640, 652],
    'fighting+ground': [984],
    'fighting+ice': [740],
    'fighting+normal': [759, 760],
    'fighting+poison': [453, 454, 903],
    'fighting+psychic': [307, 308, 475],
    'fighting+rock': [639],
    'fighting+steel': [448, 638],
    'fighting+water': [62, 647, 914],
    'fire+bug': [636, 637, 850, 851],
    'fire+dark': [228, 229, 727, 1004],
    'fire+dragon': [643, 776],
    'fire+fighting': [256, 257, 391, 392, 499, 500],
    'fire+flying': [6, 146, 250, 662, 663, 741],
    'fire+ghost': [607, 608, 609, 806, 911, 937],
    'fire+grass': [952],
    'fire+ground': [322, 323],
    'fire+normal': [667, 668],
    'fire+poison': [757, 758, 994],
    'fire+psychic': [494, 655, 936],
    'fire+rock': [219, 838, 839],
    'fire+steel': [485],
    'fire+water': [721],
    'flying+bug': [12, 123, 165, 166, 193, 267],
    'flying+dark': [198, 430, 629, 630, 717, 962],
    'flying+dragon': [149, 334, 373, 384, 714, 715],
    'flying+electric': [145, 587, 642, 940, 941],
    'flying+fairy': [176, 468, 905],
    'flying+fighting': [701, 973],
    'flying+fire': [6, 146, 250, 662, 663, 741],
    'flying+ghost': [425, 426],
    'flying+grass': [187, 188, 189, 357, 722, 723],
    'flying+ground': [207, 472, 645],
    'flying+ice': [144, 225],
    'flying+normal': [16, 17, 18, 21, 22, 83],
    'flying+poison': [41, 42, 169],
    'flying+psychic': [177, 178, 249, 527, 528, 561],
    'flying+rock': [142, 566, 567, 774],
    'flying+steel': [227, 797, 823],
    'flying+water': [130, 226, 278, 279, 458, 580],
    'ghost+bug': [292],
    'ghost+dark': [302, 442],
    'ghost+dragon': [487, 885, 886, 887],
    'ghost+electric': [479],
    'ghost+fairy': [778, 987],
    'ghost+fighting': [802, 979],
    'ghost+fire': [607, 608, 609, 806, 911, 937],
    'ghost+flying': [425, 426],
    'ghost+grass': [708, 709, 710, 711, 724, 781],
    'ghost+ground': [622, 623, 769, 770, 867],
    'ghost+ice': [478],
    'ghost+poison': [92, 93, 94],
    'ghost+psychic': [720, 792],
    'ghost+steel': [679, 680, 681, 1000],
    'ghost+water': [592, 593, 902],
    'grass+bug': [46, 47, 413, 540, 541, 542],
    'grass+dark': [274, 275, 332, 893, 908, 986],
    'grass+dragon': [840, 841, 842],
    'grass+fairy': [546, 547, 755, 756, 787],
    'grass+fighting': [286, 640, 652],
    'grass+fire': [952],
    'grass+flying': [187, 188, 189, 357, 722, 723],
    'grass+ghost': [708, 709, 710, 711, 724, 781],
    'grass+ground': [389, 948, 949],
    'grass+ice': [459, 460],
    'grass+normal': [585, 586, 928, 929, 930],
    'grass+poison': [1, 2, 3, 43, 44, 45],
    'grass+psychic': [102, 103, 251, 898, 1010],
    'grass+rock': [345, 346],
    'grass+steel': [597, 598, 798],
    'grass+water': [270, 271, 272],
    'ground+bug': [290],
    'ground+dark': [551, 552, 553, 1003],
    'ground+dragon': [329, 330, 443, 444, 445, 718],
    'ground+electric': [618, 989],
    'ground+fighting': [984],
    'ground+fire': [322, 323],
    'ground+flying': [207, 472, 645],
    'ground+ghost': [622, 623, 769, 770, 867],
    'ground+grass': [389, 948, 949],
    'ground+ice': [220, 221, 473],
    'ground+normal': [660, 901],
    'ground+poison': [31, 34, 980],
    'ground+psychic': [343, 344],
    'ground+rock': [74, 75, 76, 95, 111, 112],
    'ground+steel': [208, 530, 990],
    'ground+water': [194, 195, 259, 260, 339, 340],
    'ice+bug': [872, 873],
    'ice+dark': [215, 461, 1002],
    'ice+dragon': [646, 996, 997, 998],
    'ice+electric': [881],
    'ice+fighting': [740],
    'ice+flying': [144, 225],
    'ice+ghost': [478],
    'ice+grass': [459, 460],
    'ice+ground': [220, 221, 473],
    'ice+psychic': [124, 238, 866],
    'ice+rock': [698, 699],
    'ice+water': [87, 91, 131, 363, 364, 365],
    'normal+dark': [862],
    'normal+dragon': [780, 967],
    'normal+electric': [694, 695],
    'normal+fairy': [39, 40, 174, 298],
    'normal+fighting': [759, 760],
    'normal+fire': [667, 668],
    'normal+flying': [16, 17, 18, 21, 22, 83],
    'normal+grass': [585, 586, 928, 929, 930],
    'normal+ground': [660, 901],
    'normal+poison': [944, 945],
    'normal+psychic': [203, 648, 765, 876, 899, 981],
    'normal+water': [400],
    'poison+bug': [13, 14, 15, 48, 49, 167],
    'poison+dark': [434, 435, 452, 904],
    'poison+dragon': [691, 804, 890],
    'poison+electric': [848, 849],
    'poison+fighting': [453, 454, 903],
    'poison+fire': [757, 758, 994],
    'poison+flying': [41, 42, 169],
    'poison+ghost': [92, 93, 94],
    'poison+grass': [1, 2, 3, 43, 44, 45],
    'poison+ground': [31, 34, 980],
    'poison+normal': [944, 945],
    'poison+rock': [793, 969, 970],
    'poison+steel': [965, 966],
    'poison+water': [72, 73, 211, 690, 747, 748],
    'psychic+bug': [825, 826, 954],
    'psychic+dark': [686, 687],
    'psychic+dragon': [380, 381],
    'psychic+fairy': [122, 280, 281, 282, 439, 786],
    'psychic+fighting': [307, 308, 475],
    'psychic+fire': [494, 655, 936],
    'psychic+flying': [177, 178, 249, 527, 528, 561],
    'psychic+ghost': [720, 792],
    'psychic+grass': [102, 103, 251, 898, 1010],
    'psychic+ground': [343, 344],
    'psychic+ice': [124, 238, 866],
    'psychic+normal': [203, 648, 765, 876, 899, 981],
    'psychic+rock': [337, 338],
    'psychic+steel': [374, 375, 376, 385, 436, 437],
    'psychic+water': [79, 80, 121, 199, 779, 976],
    'rock+bug': [213, 347, 348, 557, 558, 900],
    'rock+dark': [248],
    'rock+dragon': [696, 697],
    'rock+electric': [995],
    'rock+fairy': [703, 719],
    'rock+fighting': [639],
    'rock+fire': [219, 838, 839],
    'rock+flying': [142, 566, 567, 774],
    'rock+grass': [345, 346],
    'rock+ground': [74, 75, 76, 95, 111, 112],
    'rock+ice': [698, 699],
    'rock+poison': [793, 969, 970],
    'rock+psychic': [337, 338],
    'rock+steel': [304, 305, 306, 410, 411, 476],
    'rock+water': [138, 139, 140, 141, 222, 369],
    'steel+bug': [205, 212, 589, 632, 649],
    'steel+dark': [624, 625, 983],
    'steel+dragon': [483, 884],
    'steel+electric': [81, 82, 462, 777],
    'steel+fairy': [303, 707, 801, 957, 958, 959],
    'steel+fighting': [448, 638],
    'steel+fire': [485],
    'steel+flying': [227, 797, 823],
    'steel+ghost': [679, 680, 681, 1000],
    'steel+grass': [597, 598, 798],
    'steel+ground': [208, 530, 990],
    'steel+poison': [965, 966],
    'steel+psychic': [374, 375, 376, 385, 436, 437],
    'steel+rock': [304, 305, 306, 410, 411, 476],
    'steel+water': [395],
    'water+bug': [283, 751, 752, 767, 768],
    'water+dark': [318, 319, 342, 658],
    'water+dragon': [230, 484, 882, 978, 1009],
    'water+electric': [170, 171],
    'water+fairy': [183, 184, 730, 788],
    'water+fighting': [62, 647, 914],
    'water+fire': [721],
    'water+flying': [130, 226, 278, 279, 458, 580],
    'water+ghost': [592, 593, 902],
    'water+grass': [270, 271, 272],
    'water+ground': [194, 195, 259, 260, 339, 340],
    'water+ice': [87, 91, 131, 363, 364, 365],
    'water+normal': [400],
    'water+poison': [72, 73, 211, 690, 747, 748],
    'water+psychic': [79, 80, 121, 199, 779, 976],
    'water+rock': [138, 139, 140, 141, 222, 369],
    'water+steel': [395]
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    populateTypeSelectors();
    generateTypeChart();
});

function populateTypeSelectors() {
    const type1Select = document.getElementById('type1');
    const type2Select = document.getElementById('type2');
    
    TYPES.forEach(type => {
        const option1 = document.createElement('option');
        option1.value = type;
        option1.textContent = TYPE_NAMES[type];
        type1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = type;
        option2.textContent = TYPE_NAMES[type];
        type2Select.appendChild(option2);
    });
}

function generateTypeChart() {
    const matrix = document.getElementById('typeMatrix');
    matrix.innerHTML = '';
    
    // Celda vacía superior izquierda
    const emptyCell = document.createElement('div');
    emptyCell.className = 'matrix-cell matrix-header';
    emptyCell.textContent = 'ATK\\DEF';
    matrix.appendChild(emptyCell);
    
    // Headers de columnas (defensores)
    TYPES.forEach(type => {
        const header = document.createElement('div');
        header.className = `matrix-cell matrix-header type-${type}`;
        header.textContent = TYPE_NAMES[type].substring(0, 3).toUpperCase();
        header.title = TYPE_NAMES[type];
        matrix.appendChild(header);
    });
    
    // Filas con headers y celdas
    TYPES.forEach(attacker => {
        // Header de fila (atacante)
        const rowHeader = document.createElement('div');
        rowHeader.className = `matrix-cell matrix-row-header type-${attacker}`;
        rowHeader.textContent = TYPE_NAMES[attacker];
        matrix.appendChild(rowHeader);
        
        // Celdas de efectividad
        TYPES.forEach(defender => {
            const effectiveness = getEffectiveness(attacker, defender);
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            
            if (effectiveness === 2) {
                cell.classList.add('eff-2x');
                cell.textContent = '2';
            } else if (effectiveness === 0.5) {
                cell.classList.add('eff-0-5x');
                cell.textContent = '½';
            } else if (effectiveness === 0) {
                cell.classList.add('eff-0x');
                cell.textContent = '0';
            } else {
                cell.textContent = '1';
            }
            
            cell.title = `${TYPE_NAMES[attacker]} → ${TYPE_NAMES[defender]}: ${effectiveness}x`;
            cell.onclick = () => showTypeInteraction(attacker, defender, effectiveness);
            matrix.appendChild(cell);
        });
    });
}

function getEffectiveness(attacker, defender) {
    const chart = TYPE_CHART[attacker];
    if (chart && chart.hasOwnProperty(defender)) {
        return chart[defender];
    }
    return 1;
}

function calculateDualTypeEffectiveness(attacker, defender1, defender2) {
    const eff1 = getEffectiveness(attacker, defender1);
    const eff2 = defender2 ? getEffectiveness(attacker, defender2) : 1;
    return eff1 * eff2;
}

function calculateEffectiveness() {
    const type1 = document.getElementById('type1').value;
    const type2 = document.getElementById('type2').value;
    
    if (!type1) {
        clearResults();
        return;
    }
    
    const weaknesses = [];
    const resistances = [];
    const immunities = [];
    
    TYPES.forEach(attackerType => {
        const effectiveness = calculateDualTypeEffectiveness(attackerType, type1, type2);
        
        if (effectiveness > 1) {
            weaknesses.push({ type: attackerType, value: effectiveness });
        } else if (effectiveness < 1 && effectiveness > 0) {
            resistances.push({ type: attackerType, value: effectiveness });
        } else if (effectiveness === 0) {
            immunities.push({ type: attackerType, value: effectiveness });
        }
    });
    
    displayResults(weaknesses, resistances, immunities);
    loadPokemonExamples(type1, type2);
}

function displayResults(weaknesses, resistances, immunities) {
    displayTypeList('weaknessList', weaknesses);
    displayTypeList('resistanceList', resistances);
    displayTypeList('immunityList', immunities);
}

function displayTypeList(elementId, typeList) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    
    if (typeList.length === 0) {
        element.innerHTML = '<span style="color: #718096;">None</span>';
        return;
    }
    
    typeList.sort((a, b) => b.value - a.value);
    
    typeList.forEach(item => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${item.type}`;
        badge.innerHTML = `${TYPE_NAMES[item.type]} <span style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; margin-left: 5px;">${item.value}x</span>`;
        element.appendChild(badge);
    });
}

function clearResults() {
    document.getElementById('weaknessList').innerHTML = '<span style="color: #718096;">Select a type</span>';
    document.getElementById('resistanceList').innerHTML = '<span style="color: #718096;">Select a type</span>';
    document.getElementById('immunityList').innerHTML = '<span style="color: #718096;">Select a type</span>';
    document.getElementById('pokemonExamples').innerHTML = '<span style="color: #718096;">Select a type to see examples</span>';
}

function clearTypes() {
    document.getElementById('type1').value = '';
    document.getElementById('type2').value = '';
    clearResults();
}

function showTypeInteraction(attacker, defender, effectiveness) {
    const modal = document.getElementById('typeModal') || createTypeModal();
    const modalContent = modal.querySelector('.modal-content');
    
    let effectText = '';
    let effectClass = '';
    
    if (effectiveness === 2) {
        effectText = 'Super effective';
        effectClass = 'super-effective';
    } else if (effectiveness === 0.5) {
        effectText = 'Not very effective';
        effectClass = 'not-very-effective';
    } else if (effectiveness === 0) {
        effectText = 'No effect';
        effectClass = 'no-effect';
    } else {
        effectText = 'Normal damage';
        effectClass = 'normal-damage';
    }
    
    modalContent.innerHTML = `
        <span class="close-modal" onclick="closeTypeModal()">&times;</span>
        <div class="type-interaction">
            <div class="interaction-types">
                <span class="type-badge type-${attacker}">${TYPE_NAMES[attacker]}</span>
                <span class="vs-arrow">→</span>
                <span class="type-badge type-${defender}">${TYPE_NAMES[defender]}</span>
            </div>
            <div class="effectiveness-result ${effectClass}">
                <span class="effectiveness-multiplier">${effectiveness}x</span>
                <span class="effectiveness-text">${effectText}</span>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function createTypeModal() {
    const modal = document.createElement('div');
    modal.id = 'typeModal';
    modal.className = 'type-modal';
    modal.innerHTML = '<div class="modal-content"></div>';
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal) closeTypeModal();
    };
    
    return modal;
}

function closeTypeModal() {
    const modal = document.getElementById('typeModal');
    if (modal) modal.style.display = 'none';
}

async function loadPokemonExamples(type1, type2) {
    const container = document.getElementById('pokemonExamples');
    container.innerHTML = '<span style="color: #718096;">Searching Pokémon...</span>';
    
    // Si ambos tipos son iguales, tratar como tipo único
    if (type2 && type1 === type2) {
        type2 = null;
    }
    
    let key = type2 ? `${type1}+${type2}` : type1;
    let examples = POKEMON_EXAMPLES[key] || [];
    
    // Si no encuentra la combinación, probar el orden inverso
    if (examples.length === 0 && type2) {
        key = `${type2}+${type1}`;
        examples = POKEMON_EXAMPLES[key] || [];
    }
    
    if (examples.length === 0) {
        const typeText = type2 ? `${TYPE_NAMES[type1]}/${TYPE_NAMES[type2]}` : TYPE_NAMES[type1];
        container.innerHTML = `<span style="color: #718096;">No examples available for ${typeText}</span>`;
        return;
    }
    
    try {
        const pokemonData = [];
        const selected = examples.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        for (const pokemonId of selected) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const pokemon = await response.json();
            pokemonData.push(pokemon);
        }
        
        displayPokemonExamples(pokemonData, type1, type2);
    } catch (error) {
        container.innerHTML = '<span style="color: #e53e3e;">Error loading Pokémon</span>';
    }
}

function displayPokemonExamples(pokemonList, type1, type2) {
    const container = document.getElementById('pokemonExamples');
    
    if (pokemonList.length === 0) {
        const typeText = type2 ? `${TYPE_NAMES[type1]}/${TYPE_NAMES[type2]}` : TYPE_NAMES[type1];
        container.innerHTML = `<span style="color: #718096;">No Pokémon found with the ${typeText} combination</span>`;
        return;
    }
    
    container.innerHTML = pokemonList.map(pokemon => `
        <div class="pokemon-example">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-example-sprite">
            <div class="pokemon-example-name">${capitalize(pokemon.name)}</div>
            <div class="pokemon-example-types">
                ${pokemon.types.map(t => `<span class="type-badge type-${t.type.name}">${TYPE_NAMES[t.type.name] || capitalize(t.type.name)}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}