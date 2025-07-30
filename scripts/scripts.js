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

// ============================================================================
// POKEMON LOADING FUNCTIONS
// ============================================================================

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

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

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
 * Searches Pokemon based on search term (ID or name)
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
 * Searches Pokemon by name
 * @async
 * @param {string} searchTerm - The Pokemon name
 * @returns {Promise<Object>} Pokemon data object
 * @throws {Error} When Pokemon is not available in current region
 */
async function searchPokemonByName(searchTerm) {
    const sanitizedTerm = sanitizeSearchTerm(searchTerm);
    const pokemon = await searchPokemon(sanitizedTerm);
    
    if (!isPokemonInCurrentRegion(pokemon.id)) {
        showCustomModal(`Pokemon "${searchTerm}" is not available in the ${selectedRegion} region.`);
        throw new Error('Pokemon not in current region');
    }
    
    return pokemon;
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
 * @param {Object} pokemon - Pokemon data object
 * @param {string} searchTerm - The original search term
 * @returns {void}
 */
function displaySearchResult(pokemon, searchTerm) {
    saveSearchHistory(searchTerm);
    clearPokemonGrid();
    renderPokemonCard(pokemon);
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
