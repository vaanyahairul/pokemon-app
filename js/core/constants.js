// Constantes de la aplicación
export const API_BASE = 'https://pokeapi.co/api/v2';
export const TOTAL_POKEMON = 1010; // Hasta Gen 9

// Efectos de las naturalezas en las estadísticas
export const natureEffects = {
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

// Tabla de efectividad de tipos (defensiva)
export const typeChart = {
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