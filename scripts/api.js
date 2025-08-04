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
    
    if (sanitizedTerm.length >= 3) {
        const pokemonIds = getRegionPokemonIds();
        return await searchPokemonByFuzzyName(sanitizedTerm, pokemonIds);
    } else {
        try {
            const pokemon = await searchPokemon(sanitizedTerm);
            if (!isPokemonInCurrentRegion(pokemon.id)) {
                showCustomModal(`Pokemon "${searchTerm}" is not available in the ${selectedRegion} region.`);
                throw new Error('Pokemon not in current region');
            }
            return [pokemon];
        } catch (error) {
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

        const pokemonIds = getRegionPokemonIds();
        const startIndex = currentOffset;
        const endIndex = Math.min(startIndex + limit, pokemonIds.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const pokemonId = pokemonIds[i];
            const pokemonData = await fetchPokemonById(pokemonId);
            
            if (isValidPokemonData(pokemonData)) {
                pokemonList.push(pokemonData);
                renderPokemonCard(pokemonData);
            }
        }

        currentOffset += limit;
        
        if (endIndex >= pokemonIds.length) {
            updateLoadMoreButton(false, true); 
        } else {
            updateLoadMoreButton(false, false); 
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
    
    showButtonState(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await loadPokemon();
    } finally {
        showButtonState(false);
    }
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
 * Searches Pokemon by fuzzy name matching
 * @async
 * @param {string} searchTerm - The search term
 * @param {Array<number>} pokemonIds - Array of Pokemon IDs to search through
 * @returns {Promise<Array<Object>>} Array of matching Pokemon
 */
async function searchPokemonByFuzzyName(searchTerm, pokemonIds) {
    const matchingPokemon = [];

    for (const pokemonId of pokemonIds) {
        try {
            const pokemon = await fetchPokemonById(pokemonId);

            if (pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                matchingPokemon.push(pokemon);
            }
        } catch (error) {
            console.warn(`Could not fetch Pokemon ${pokemonId}:`, error);
        }
    }
    if (matchingPokemon.length === 0) {
        throw new Error(`No Pokemon found matching "${searchTerm}"`);
    }
    
    return matchingPokemon;
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

/**
 * Fetches species data for a Pokemon
 * @async
 * @param {number} id - Pokemon ID
 * @returns {Promise<Object>} Species data object
 */
async function fetchSpeciesById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon-species/${id}`);
        
        if (!response.ok) {
            throw new Error(`Species with ID ${id} not found`);
        }  
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching species by ID:', error);
        throw error;
    }
}

/**
 * Fetches evolution chain data
 * @async
 * @param {string} evolutionChainUrl - URL of the evolution chain
 * @returns {Promise<Object>} Evolution chain data object
 */
async function fetchEvolutionChain(evolutionChainUrl) {
    try {
        const response = await fetch(evolutionChainUrl);
        
        if (!response.ok) {
            throw new Error('Evolution chain not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        throw error;
    }
}

/**
 * Extracts Pokemon ID from species URL
 * @param {string} speciesUrl - Species URL
 * @returns {number} Pokemon ID
 */
function extractPokemonIdFromUrl(speciesUrl) {
    return speciesUrl.split('/').slice(-2, -1)[0];
}

/**
 * Creates evolution data object
 * @param {Object} pokemonData - Pokemon data
 * @param {Array} evolutionDetails - Evolution details
 * @returns {Object} Evolution data object
 */
function createEvolutionData(pokemonData, evolutionDetails) {
    return {
        pokemon: pokemonData,
        evolutionDetails: evolutionDetails || []
    };
}

/**
 * Processes evolution chain recursively
 * @async
 * @param {Object} chain - Current chain link
 * @param {Array<Object>} evolutionChain - Array to store evolution chain
 * @returns {Promise<void>}
 */
async function processEvolutionChain(chain, evolutionChain) {
    if (!chain) return;   
    try {
        const speciesUrl = chain.species.url;
        const pokemonId = extractPokemonIdFromUrl(speciesUrl);
        const pokemonData = await fetchPokemonById(pokemonId);
        const evolutionData = createEvolutionData(pokemonData, chain.evolution_details);
        
        evolutionChain.push(evolutionData);
        
        for (const evolution of chain.evolves_to || []) {
            await processEvolutionChain(evolution, evolutionChain);
        }
    } catch (error) {
        console.error('Error processing evolution chain:', error);
    }
}

/**
 * Extracts evolution chain data and fetches Pokemon details
 * @async
 * @param {Object} pokemon - Pokemon data object
 * @returns {Promise<Array<Object>>} Array of evolution chain Pokemon with details
 */
async function getEvolutionChain(pokemon) {
    try {
        const speciesData = await fetchSpeciesById(pokemon.id);
        
        if (!speciesData.evolution_chain?.url) {
            return [];
        }  
        const evolutionChainData = await fetchEvolutionChain(speciesData.evolution_chain.url);
        const evolutionChain = [];
        const chain = evolutionChainData.chain;
        
        await processEvolutionChain(chain, evolutionChain);
        return evolutionChain;
    } catch (error) {
        console.error('Error getting evolution chain:', error);
        return [];
    }
}

/**
 * Loads and displays evolution chain for a Pokemon
 * @async
 * @param {Object} pokemon - Pokemon data object
 * @returns {Promise<void>}
 */
async function loadEvolutionChain(pokemon) {
    const loadingElement = document.getElementById('evolutionLoading');
    const chainElement = document.getElementById('evolutionChain');
    const errorElement = document.getElementById('evolutionError');
    
    if (!loadingElement || !chainElement || !errorElement) return;
    
    try {
        showEvolutionLoading(loadingElement, chainElement, errorElement);
        
        const evolutionChain = await getEvolutionChain(pokemon);
        
        if (evolutionChain.length === 0) {
            showEvolutionError(errorElement);
            return;
        }
        const evolutionHTML = createEvolutionChainHTML(evolutionChain, pokemon);
        showEvolutionContent(chainElement, evolutionHTML);
        
    } catch (error) {
        console.error('Error loading evolution chain:', error);
        showEvolutionError(errorElement);
    } finally {
        loadingElement.style.display = 'none';
    }
}