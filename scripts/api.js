/**
 * API functions for Pokedex
 * @fileoverview API communication with PokeAPI
 */

// Global variables for API
/** @type {string} Base URL of the PokeAPI */
const API_BASE_URL = 'https://pokeapi.co/api/v2';


/**
 * Loads Pokemon data by ID
 * @async
 * @param {number} id - Pokemon ID
 * @returns {Promise<Object>} Pokemon data object
 * @throws {Error} When Pokemon is not found
 */
async function fetchPokemonById(id) {
    
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
        
        if (!response.ok) {
            throw new Error(`Pokemon with ID ${id} not found`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon by ID:', error);
        throw error;
    }
}

/**
 * Searches Pokemon by name
 * @async
 * @param {string} searchTerm - Pokemon name
 * @returns {Promise<Object>} Pokemon data object
 * @throws {Error} When Pokemon is not found
 */
async function searchPokemon(searchTerm) {
    
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${searchTerm.toLowerCase()}`);
        
        if (!response.ok) {
            throw new Error(`Pokemon not found: ${searchTerm}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching Pokemon:', error);
        throw error;
    }
}

/**
 * Searches Pokemon by ID (alias for fetchPokemonById)
 * @async
 * @param {number} id - Pokemon ID
 * @returns {Promise<Object>} Pokemon data object
 */
async function searchPokemonById(id) {
    return fetchPokemonById(id);
}

/**
 * Returns colors for Pokemon types
 * @returns {Object} Object with type colors
 */
function getTypeColors() {
    return {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };
}
