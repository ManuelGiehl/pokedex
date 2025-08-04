/**
 * Evolution Chain functionality
 * @fileoverview Evolution chain API and template functions
 */

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
 * Creates the "Evolution" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Evolution tab
 */
function createEvolutionTab(pokemon) {
    return `<section class="evolution-container">
        <div class="evolution-loading" id="evolutionLoading">
            <div class="loading-spinner"></div>
            <p>Loading evolution chain...</p>
        </div>
        <div class="evolution-chain" id="evolutionChain" style="display: none;">
            <!-- Evolution chain will be populated here -->
        </div>
        <div class="evolution-error" id="evolutionError" style="display: none;">
            <p>Could not load evolution chain</p>
        </div>
    </section>`;
}

/**
 * Shows loading state for evolution chain
 * @param {HTMLElement} loadingElement - Loading element
 * @param {HTMLElement} chainElement - Chain element
 * @param {HTMLElement} errorElement - Error element
 */
function showEvolutionLoading(loadingElement, chainElement, errorElement) {
    loadingElement.style.display = 'block';
    chainElement.style.display = 'none';
    errorElement.style.display = 'none';
}

/**
 * Shows error state for evolution chain
 * @param {HTMLElement} errorElement - Error element
 */
function showEvolutionError(errorElement) {
    errorElement.style.display = 'block';
}

/**
 * Shows evolution chain content
 * @param {HTMLElement} chainElement - Chain element
 * @param {string} evolutionHTML - Evolution HTML content
 */
function showEvolutionContent(chainElement, evolutionHTML) {
    chainElement.innerHTML = evolutionHTML;
    chainElement.style.display = 'block';
}

/**
 * Loads and displays evolution chain for a Pokemon
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

/**
 * Creates single evolution message
 * @returns {string} HTML for single evolution
 */
function createSingleEvolutionHTML() {
    return `<div class="evolution-single">
        <p>This Pokemon does not evolve</p>
    </div>`;
}

/**
 * Creates evolution stage HTML
 * @param {Object} evolution - Evolution data
 * @param {Object} currentPokemon - Current Pokemon
 * @param {number} index - Current index
 * @param {number} totalLength - Total evolution chain length
 * @returns {string} HTML for evolution stage
 */
function createEvolutionStageHTML(evolution, currentPokemon, index, totalLength) {
    const pokemon = evolution.pokemon;
    const isCurrent = pokemon.id === currentPokemon.id;
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
    
    return `<div class="evolution-stage ${isCurrent ? 'current' : ''}">
        <div class="evolution-pokemon">
            <img src="${imageUrl}" alt="${pokemon.name}" class="evolution-image">
            <h4 class="evolution-name">${capitalizeFirst(pokemon.name)}</h4>
            <span class="evolution-number">#${pokemon.id.toString().padStart(3, '0')}</span>
        </div>
        ${index < totalLength - 1 ? '<div class="evolution-arrow">→</div>' : ''}
    </div>`;
}

/**
 * Creates HTML for evolution chain display
 * @param {Array<Object>} evolutionChain - Array of evolution data
 * @param {Object} currentPokemon - Current Pokemon being viewed
 * @returns {string} HTML string for evolution chain
 */
function createEvolutionChainHTML(evolutionChain, currentPokemon) {
    if (evolutionChain.length === 1) {
        return createSingleEvolutionHTML();
    }
    
    const evolutionStages = evolutionChain.map((evolution, index) => 
        createEvolutionStageHTML(evolution, currentPokemon, index, evolutionChain.length)
    ).join('');
    
    return `<div class="evolution-chain-display">${evolutionStages}</div>`;
}

/**
 * Gets the currently displayed Pokemon from the large view
 * @returns {Object|null} Current Pokemon object or null
 */
function getCurrentPokemon() {
    const overlay = document.getElementById('largeViewOverlay');
    if (!overlay) return null;
    
    const pokemonNameElement = overlay.querySelector('.large-pokemon-name');
    if (!pokemonNameElement) return null;
    
    const pokemonName = pokemonNameElement.textContent.toLowerCase();
    return pokemonList.find(pokemon => pokemon.name.toLowerCase() === pokemonName) || null;
}
