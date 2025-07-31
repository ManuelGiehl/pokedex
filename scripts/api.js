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
 * Searches Pokemon by term (ID or name)
 * @async
 * @param {string} searchTerm - The search term
 * @returns {Promise<Object>} Pokemon data object
 */
async function searchPokemonByTerm(searchTerm) {
    if (isPokemonId(searchTerm)) {
        return await searchPokemonById(searchTerm);
    } else {
        return await searchPokemonByName(searchTerm);
    }
}

/**
 * Searches Pokemon by ID
 * @async
 * @param {string} searchTerm - The Pokemon ID as string
 * @returns {Promise<Object>} Pokemon data object
 * @throws {Error} When Pokemon is not available in current region
 */
async function searchPokemonById(searchTerm) {
    const pokemonId = sanitizePokemonId(searchTerm);
    
    if (!isPokemonInCurrentRegion(pokemonId)) {
        showCustomModal(`Pokemon #${pokemonId} is not available in the ${selectedRegion} region. Please search for Pokemon #${regionStart}-${regionEnd}.`);
        throw new Error('Pokemon not in current region');
    }
    
    return await fetchPokemonById(pokemonId);
}

/**
 * Searches Pokemon by name with fuzzy search support
 * @async
 * @param {string} searchTerm - The Pokemon name
 * @returns {Promise<Array<Object>>} Array of Pokemon data objects
 * @throws {Error} When Pokemon is not available in current region
 */
async function searchPokemonByName(searchTerm) {
    const sanitizedTerm = sanitizeSearchTerm(searchTerm);
    
    // If search term is 3 or more characters, use fuzzy search
    if (sanitizedTerm.length >= 3) {
        const pokemonIds = getRegionPokemonIds();
        return await searchPokemonByFuzzyName(sanitizedTerm, pokemonIds);
    } else {
        // For shorter terms, try exact search first
        try {
            const pokemon = await searchPokemon(sanitizedTerm);
            if (!isPokemonInCurrentRegion(pokemon.id)) {
                showCustomModal(`Pokemon "${searchTerm}" is not available in the ${selectedRegion} region.`);
                throw new Error('Pokemon not in current region');
            }
            return [pokemon];
        } catch (error) {
            // If exact search fails, try fuzzy search even for short terms
            const pokemonIds = getRegionPokemonIds();
            return await searchPokemonByFuzzyName(sanitizedTerm, pokemonIds);
        }
    }
}

/**
 * Loads Pokemon for the current region
 * @async
 * @returns {Promise<void>}
 */
async function loadPokemon() {
    try {
        isLoading = true;
        updateLoadMoreButton(true);

        // Load Pokemon IDs for the selected region
        const pokemonIds = getRegionPokemonIds();
        const startIndex = currentOffset;
        const endIndex = Math.min(startIndex + limit, pokemonIds.length);
        
        // Load Pokemon within the current batch
        for (let i = startIndex; i < endIndex; i++) {
            const pokemonId = pokemonIds[i];
            const pokemonData = await fetchPokemonById(pokemonId);
            
            if (isValidPokemonData(pokemonData)) {
                pokemonList.push(pokemonData);
                renderPokemonCard(pokemonData);
            }
        }

        currentOffset += limit;
        
        // Hide load more button if we've loaded all Pokemon in the region
        if (endIndex >= pokemonIds.length) {
            updateLoadMoreButton(false, true); // true = hide completely
        } else {
            updateLoadMoreButton(false, false); // false = show normally
        }
    } catch (error) {
        const errorMessage = handleAPIError(error, 'loadPokemon');
        showError(errorMessage);
    } finally {
        isLoading = false;
        if (currentOffset < getRegionPokemonIds().length) {
            updateLoadMoreButton(false, false);
        }
    }
}

/**
 * Loads more Pokemon
 * @async
 * @returns {Promise<void>}
 */
async function loadMorePokemon() {
    if (isLoading || isInSearchMode) return;
    await loadPokemon();
}

/**
 * Handles Pokemon search
 * @async
 * @returns {Promise<void>}
 */
async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        resetToDefaultView();
        return;
    }
    
    if (!isValidSearchTerm(searchTerm)) {
        showCustomModal('Please enter a valid search term (letters, numbers, or spaces).');
        return;
    }

    try {
        const pokemon = await searchPokemonByTerm(searchTerm);
        displaySearchResult(pokemon, searchTerm);
    } catch (error) {
        const errorMessage = handleAPIError(error, 'search');
        showError(errorMessage);
    }
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
