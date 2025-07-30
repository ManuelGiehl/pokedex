/**
 * Pokedex JavaScript with functional approach
 * @fileoverview Main logic for the Pokedex application
 */

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

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

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize Pokedex when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});

/**
 * Initializes the Pokedex application
 * @async
 * @returns {Promise<void>}
 */
async function init() {
    setupEventListeners();
    
    // Only load Pokemon if main content is visible (not on landing page)
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.style.display !== 'none') {
        updateLoadMoreButton(false);
        await loadPokemon();
    }
}

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================

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

// ============================================================================
// LANDING PAGE FUNCTIONS
// ============================================================================

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

// ============================================================================
// REGION SELECTION FUNCTIONS
// ============================================================================

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