/**
 * Pokedex JavaScript
 * @fileoverview Main logic for the Pokedex application
 */

/** @type {Array<Object>} List of all loaded Pokemon */
let pokemonList = [];
/** @type {number} Current offset for loading Pokemon */
let currentOffset = 0;
/** @type {number} Number of Pokemon per load */
let limit = 20;
/** @type {boolean} Indicates if Pokemon are currently loading */
let isLoading = false;
/** @type {number} Index of currently displayed Pokemon in modal */
let currentPokemonIndex = 0;
/** @type {boolean} Indicates if the app is in search mode */
let isInSearchMode = false;
/** @type {string} Currently selected region */
let selectedRegion = 'kanto';
/** @type {number} Start ID of current region */
let regionStart = 1;
/** @type {number} End ID of current region */
let regionEnd = 151;

// Initialize Pokedex when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});

/**
 * Initializes the Pokedex application
 * @returns {void}
 */
function init() {
    setupEventListeners();
    
    // Only load Pokemon if main content is visible (not on landing page)
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.style.display !== 'none') {
        updateLoadMoreButton(false);
        loadPokemon();
    }
}

/**
 * Sets up all event listeners for the application
 * @returns {void}
 */
function setupEventListeners() {
    // Landing page functionality - only Pokedex image is clickable
    const pokedexImage = document.querySelector('.pokedex-landing-image');
    if (pokedexImage) {
        pokedexImage.addEventListener('click', startPokedexAnimation);
    }

    // Region selection functionality
    setupRegionSelectionListeners();
}

/**
 * Sets up event listeners for region selection
 * @returns {void}
 */
function setupRegionSelectionListeners() {
    const pokeballItems = document.querySelectorAll('.pokeball-item');
    
    pokeballItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const region = e.currentTarget.dataset.region;
            selectRegion(region);
        });
    });
}

/**
 * Sets up event listeners for main content
 * @returns {void}
 */
function setupMainContentListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-button');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });

        // Live search reset when input is cleared
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '' && isInSearchMode) {
                resetToDefaultView();
            }
        });
    }

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePokemon);
    }
}

/**
 * Starts the Pokedex animation on the landing page
 * @returns {void}
 */
function startPokedexAnimation() {
    const initialSection = document.getElementById('initialPokedexSection');
    const regionSection = document.getElementById('regionSelectionSection');
    
    if (!initialSection || !regionSection) return;

    // Fade out the initial section
    initialSection.classList.add('fade-out');

    // Wait for fade out animation, then show region selection
    setTimeout(() => {
        initialSection.style.display = 'none';
        regionSection.style.display = 'flex';
    }, 500);
}

/**
 * Selects a region and loads the corresponding Pokemon
 * @param {string} region - The selected region ('kanto', 'johto', 'hoenn')
 * @returns {void}
 */
function selectRegion(region) {
    const landingPage = document.getElementById('landingPage');
    const mainContent = document.getElementById('mainContent');
    
    if (!landingPage || !mainContent) return;

    // Store selected region and set region-specific limits
    selectedRegion = region;
    setRegionLimits(region);

    // Reset Pokemon list and offset for new region
    pokemonList = [];
    currentOffset = 0;
    clearPokemonGrid();

    // Fade out the landing page
    landingPage.style.display = 'none';
    mainContent.style.display = 'block';
    
    // Setup main content and load Pokemon
    setupMainContentListeners();
    updateLoadMoreButton(false, false);
    loadPokemon();
}

/**
 * Sets the start and end IDs for the selected region
 * @param {string} region - The selected region
 * @returns {void}
 */
function setRegionLimits(region) {
    const regionLimits = {
        kanto: { start: 1, end: 151 },
        johto: { start: 152, end: 251 },
        hoenn: { start: 252, end: 386 }
    };
    
    const limits = regionLimits[region] || regionLimits.kanto;
    regionStart = limits.start;
    regionEnd = limits.end;
}

/**
 * Generates an array with Pokemon IDs for the current region
 * @returns {Array<number>} Array with Pokemon IDs
 */
function getRegionPokemonIds() {
    const ids = [];
    for (let i = regionStart; i <= regionEnd; i++) {
        ids.push(i);
    }
    return ids;
}

/**
 * Renders a Pokemon card in the grid
 * @param {Object} pokemon - Pokemon data object
 * @returns {void}
 */
function renderPokemonCard(pokemon) {
    const pokemonGrid = document.getElementById('pokemonGrid');
    
    const cardElement = document.createElement('div');
    cardElement.innerHTML = createPokemonCardTemplate(pokemon, getTypeColors());
    
    const card = cardElement.firstElementChild;
    
    // Add click event for large view
    card.addEventListener('click', () => openLargeView(pokemon));
    
    pokemonGrid.appendChild(card);
}

/**
 * Checks if a Pokemon belongs to the current region
 * @param {number} pokemonId - The Pokemon ID
 * @returns {boolean} true if Pokemon is in current region
 */
function isPokemonInCurrentRegion(pokemonId) {
    return pokemonId >= regionStart && pokemonId <= regionEnd;
}

/**
 * Displays the search result
 * @param {Array<Object>|Object} pokemon - Pokemon data object(s)
 * @param {string} searchTerm - The original search term
 * @returns {void}
 */
function displaySearchResult(pokemon, searchTerm) {
    saveSearchHistory(searchTerm);
    clearPokemonGrid();
    
    // Handle both single Pokemon and array of Pokemon
    const pokemonArray = Array.isArray(pokemon) ? pokemon : [pokemon];
    
    // Render all matching Pokemon
    pokemonArray.forEach(pokemonData => {
        renderPokemonCard(pokemonData);
    });
    
    isInSearchMode = true;
    updateLoadMoreButton(false);
}

/**
 * Resets the view to default view
 * @returns {void}
 */
function resetToDefaultView() {
    isInSearchMode = false;
    clearPokemonGrid();
    currentOffset = 0;
    pokemonList = [];
    updateLoadMoreButton(false, false);
    loadPokemon();
}

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
 * Navigates between Pokemon in the large view
 * @param {number} direction - Direction (-1 for previous, 1 for next)
 * @returns {void}
 */
function navigatePokemon(direction) {
    const newIndex = currentPokemonIndex + direction;
    if (newIndex >= 0 && newIndex < pokemonList.length) {
        currentPokemonIndex = newIndex;
        const overlay = document.getElementById('largeViewOverlay');
        if (overlay) {
            overlay.remove();
            renderLargeView(pokemonList[currentPokemonIndex]);
        }
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
 * Clears the Pokemon grid
 * @returns {void}
 */
function clearPokemonGrid() {
    const pokemonGrid = document.getElementById('pokemonGrid');
    pokemonGrid.innerHTML = '';
}

/**
 * Updates the "Load More" button
 * @param {boolean} isLoading - Indicates if currently loading
 * @param {boolean} hideCompletely - Indicates if button should be completely hidden
 * @returns {void}
 */
function updateLoadMoreButton(isLoading, hideCompletely = false) {
    const loadMoreSection = document.querySelector('.load-more-section');
    if (loadMoreSection) {
        if (isInSearchMode || hideCompletely) {
            loadMoreSection.style.display = 'none';
        } else {
            loadMoreSection.style.display = 'block';
            showButtonState(isLoading);
        }
    }
}
