// Sistema de cache para la aplicación
export let pokemonData = [];
export let allPokemonList = [];
export let pokemonCache = new Map();
export let movesCache = new Map();
export let abilityCache = new Map();

export function setPokemonData(data) {
    pokemonData = data;
}

export function setAllPokemonList(list) {
    allPokemonList = list;
}