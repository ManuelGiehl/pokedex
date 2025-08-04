/**
 * Template functions for Pokemon components
 */

/**
 * Creates a Pokemon card template
 * @param {Object} pokemon - Pokemon data object
 * @param {Object} typeColors - Object with type colors
 * @returns {string} HTML string for the Pokemon card
 */
function createPokemonCardTemplate(pokemon, typeColors) {
    const primaryType = pokemon.types[0].type.name;
    const backgroundColor = typeColors[primaryType] || '#777';
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
    
    return `<article class="pokemon-card" data-pokemon-id="${pokemon.id}" style="background: ${backgroundColor}">
        <header class="pokemon-card-header">
            <h3 class="pokemon-name">${capitalizeFirst(pokemon.name)}</h3>
            <span class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</span>
        </header>
        <figure class="pokemon-image-container">
            <img src="${imageUrl}" alt="${pokemon.name}" class="pokemon-image">
        </figure>
        <footer class="pokemon-types">
            ${pokemon.types.map(type => `<span class="type-badge" style="background-color: ${typeColors[type.type.name] || '#777'}">${capitalizeFirst(type.type.name)}</span>`).join('')}
        </footer>
    </article>`;
}

/**
 * Creates a template for the "Load More" button
 * @param {boolean} isLoading - Indicates if currently loading
 * @returns {string} HTML string for the Load More button
 */
function createLoadMoreButtonTemplate(isLoading) {
    return `<section class="load-more-container">
        <button id="loadMoreBtn" class="load-more-btn" ${isLoading ? 'disabled' : ''}>
            ${isLoading ? 'Loading...' : 'Load More Pokemon'}
        </button>
    </section>`;
}

/**
 * Creates a template for the loading button state
 * @returns {string} HTML string for the loading button
 */
function createLoadingButtonTemplate() {
    return `<section class="load-more-container">
        <div class="loading-button">
            <span>Loading Pokemon...</span>
        </div>
    </section>`;
}

/**
 * Creates a template for search results
 * @param {Object} pokemon - Pokemon data object
 * @param {Object} typeColors - Object with type colors
 * @returns {string} HTML string for the search result
 */
function createSearchResultTemplate(pokemon, typeColors) {
    return `<section class="search-result">${createPokemonCardTemplate(pokemon, typeColors)}</section>`;
}

/**
 * Creates a template for error modals
 * @param {string} message - The error message
 * @returns {string} HTML string for the error modal
 */
function createErrorModalTemplate(message) {
    return `<section class="custom-modal" style="display: flex;">
        <div class="modal-content">
            <header class="modal-header">
                <h3 class="modal-title">Error</h3>
                <button class="modal-close-btn" onclick="closeCustomModal()" aria-label="Close">×</button>
            </header>
            <main class="modal-body">
                <p>${message}</p>
            </main>
            <footer class="modal-footer">
                <button class="modal-ok-btn" onclick="closeCustomModal()">OK</button>
            </footer>
        </div>
    </section>`;
}

/**
 * Creates a template for region selection
 * @returns {string} HTML string for region selection
 */
function createRegionSelectionTemplate() {
    return `<section class="region-selection-section">
        <header class="region-text">
            <h2>Choose the region you want to explore</h2>
        </header>
        <nav class="pokeball-container">
            <button class="pokeball-item" data-region="kanto" aria-label="Select Kanto region">
                <img src="assets/img/pokeball.png" alt="Kanto" class="pokeball-image">
                <span class="region-label">Kanto</span>
            </button>
            <button class="pokeball-item" data-region="johto" aria-label="Select Johto region">
                <img src="assets/img/pokeball.png" alt="Johto" class="pokeball-image">
                <span class="region-label">Johto</span>
            </button>
            <button class="pokeball-item" data-region="hoenn" aria-label="Select Hoenn region">
                <img src="assets/img/pokeball.png" alt="Hoenn" class="pokeball-image">
                <span class="region-label">Hoenn</span>
            </button>
        </nav>
    </section>`;
}

/**
 * Creates a template for error notifications
 * @param {string} message - The error message to display
 * @returns {string} HTML string for the error notification
 */
function createErrorNotificationTemplate(message) {
    return `<div class="error-notification">${message}</div>`;
}


