/**
 * Overlay functionality for Pokedex
 * @fileoverview Handles large view overlay and modal functionality
 */

/** @type {number} Index of currently displayed Pokemon in modal */
let currentPokemonIndex = 0;

/**
 * Opens the large view for a Pokemon
 * @param {Object} pokemon - Pokemon data object
 * @returns {void}
 */
function openLargeView(pokemon) {
    currentPokemonIndex = pokemonList.findIndex(p => p.id === pokemon.id);
    renderLargeView(pokemon);
}

/**
 * Renders the large view for a Pokemon
 * @param {Object} pokemon - Pokemon data object
 * @returns {void}
 */
function renderLargeView(pokemon) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'large-view-overlay';
    overlay.id = 'largeViewOverlay';
    
    overlay.innerHTML = createLargeViewTemplate(pokemon, getTypeColors());

    // Close overlay when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLargeView();
        }
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the large view
 * @returns {void}
 */
function closeLargeView() {
    const overlay = document.getElementById('largeViewOverlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
        document.body.style.position = '';
    }
}

/**
 * Navigates between Pokemon in the large view with cyclic navigation
 * @param {number} direction - Direction (-1 for previous, 1 for next)
 * @returns {void}
 */
function navigatePokemon(direction) {
    let newIndex = currentPokemonIndex + direction;
    
    if (newIndex < 0) {
        newIndex = pokemonList.length - 1;
    } else if (newIndex >= pokemonList.length) {
        newIndex = 0; 
    }
    
    currentPokemonIndex = newIndex;
    const overlay = document.getElementById('largeViewOverlay');
    if (overlay) {
        overlay.remove();
        renderLargeView(pokemonList[currentPokemonIndex]);
    }
}

/**
 * Shows a custom modal
 * @param {string} message - The message to display
 * @returns {void}
 */
function showCustomModal(message) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }
}

/**
 * Closes the custom modal
 * @returns {void}
 */
function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Wrapper function for the X button in modal
 * @returns {void}
 */
function closeLargeViewButton() {
    closeLargeView();
}

/**
 * Switches between tabs in the large view
 * @param {string} tabName - Name of the tab to activate
 * @param {HTMLElement} button - The clicked tab button element
 */
function switchTab(tabName, button) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Load evolution chain when evolution tab is opened
    if (tabName === 'evolution') {
        const currentPokemon = getCurrentPokemon();
        if (currentPokemon) {
            loadEvolutionChain(currentPokemon);
        }
    }
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

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} String with capitalized first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
