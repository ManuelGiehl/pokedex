/**
 * Template functions for Pokemon components
 * @fileoverview HTML templates for Pokemon components
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
    
    // Use official artwork images for better quality
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
    
    return `
        <article class="pokemon-card" data-pokemon-id="${pokemon.id}" style="background: ${backgroundColor}">
            <header class="pokemon-card-header">
                <h3 class="pokemon-name">${capitalizeFirst(pokemon.name)}</h3>
                <span class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</span>
            </header>
            <figure class="pokemon-image-container">
                <img src="${imageUrl}" alt="${pokemon.name}" class="pokemon-image">
            </figure>
            <footer class="pokemon-types">
                ${pokemon.types.map(type => `
                    <span class="type-badge" style="background-color: ${typeColors[type.type.name] || '#777'}">
                        ${capitalizeFirst(type.type.name)}
                    </span>
                `).join('')}
            </footer>
        </article>
    `;
}

/**
 * Creates a template for the large Pokemon view
 * @param {Object} pokemon - Pokemon data object
 * @param {Object} typeColors - Object with type colors
 * @returns {string} HTML string for the large view
 */
function createLargeViewTemplate(pokemon, typeColors) {
    const primaryType = pokemon.types[0].type.name;
    const backgroundColor = typeColors[primaryType] || '#777';
    
    // Use official artwork images for better quality
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
    
    return `
        <section class="large-view-content">
            <header class="large-view-header">
                <button class="close-btn" onclick="closeLargeViewButton()" aria-label="Close">×</button>
            </header>
            <main class="large-view-body">
                <section class="large-pokemon-info" style="background: ${backgroundColor}">
                    <header class="large-pokemon-header">
                        <h2 class="large-pokemon-name">${capitalizeFirst(pokemon.name)}</h2>
                        <span class="large-pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
                    </header>
                    <figure class="large-pokemon-image">
                        <img src="${imageUrl}" alt="${pokemon.name}">
                    </figure>
                    <footer class="large-pokemon-types">
                        ${pokemon.types.map(type => `
                            <span class="type-badge large" style="background-color: ${typeColors[type.type.name] || '#777'}">
                                ${capitalizeFirst(type.type.name)}
                            </span>
                        `).join('')}
                    </footer>
                </section>
                <section class="large-view-bottom">
                    <div class="tab-container">
                        ${createTabSystem(pokemon)}
                    </div>
                </section>
            </main>
            <nav class="large-view-nav">
                <button class="nav-btn prev-btn" onclick="navigatePokemon(-1)" aria-label="Previous Pokemon">‹</button>
                <button class="nav-btn next-btn" onclick="navigatePokemon(1)" aria-label="Next Pokemon">›</button>
            </nav>
        </section>
    `;
}

/**
 * Creates the tab system for the large view
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the tab system
 */
function createTabSystem(pokemon) {
    return `
        <nav class="tab-header">
            <button class="tab-button active" onclick="switchTab('about', this)" aria-label="About tab">About</button>
            <button class="tab-button" onclick="switchTab('stats', this)" aria-label="Base Stats tab">Base Stats</button>
            <button class="tab-button" onclick="switchTab('evolution', this)" aria-label="Evolution tab">Evolution</button>
            <button class="tab-button" onclick="switchTab('moves', this)" aria-label="Moves tab">Moves</button>
        </nav>
        <main class="tab-content">
            <section id="about-tab" class="tab-panel active">
                ${createAboutTab(pokemon)}
            </section>
            <section id="stats-tab" class="tab-panel">
                ${createStatsTab(pokemon)}
            </section>
            <section id="evolution-tab" class="tab-panel">
                ${createEvolutionTab(pokemon)}
            </section>
            <section id="moves-tab" class="tab-panel">
                ${createMovesTab(pokemon)}
            </section>
        </main>
    `;
}

/**
 * Creates the "About" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the About tab
 */
function createAboutTab(pokemon) {
    return `
        <dl class="about-section">
            <div class="about-item">
                <dt class="about-label">Species</dt>
                <dd class="about-value">${capitalizeFirst(pokemon.species?.name || 'Unknown')}</dd>
            </div>
            <div class="about-item">
                <dt class="about-label">Height</dt>
                <dd class="about-value">${(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div class="about-item">
                <dt class="about-label">Weight</dt>
                <dd class="about-value">${(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
            <div class="about-item">
                <dt class="about-label">Abilities</dt>
                <dd class="about-value">${pokemon.abilities.map(ability => 
                    capitalizeFirst(ability.ability.name) + (ability.is_hidden ? ' (Hidden)' : '')
                ).join(', ')}</dd>
            </div>
            <div class="about-item">
                <dt class="about-label">Base Experience</dt>
                <dd class="about-value">${pokemon.base_experience || 'Unknown'}</dd>
            </div>
        </dl>
    `;
}

/**
 * Creates the "Base Stats" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Stats tab
 */
function createStatsTab(pokemon) {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    
    return `
        <section class="stats-container">
            ${pokemon.stats.map(stat => {
                const percentage = (stat.base_stat / 255) * 100;
                let barClass = 'low';
                if (percentage > 60) barClass = 'high';
                else if (percentage > 40) barClass = 'medium';
                
                return `
                    <article class="stat-item">
                        <div class="stat-info">
                            <h4 class="stat-name">${capitalizeFirst(stat.stat.name)}</h4>
                            <div class="stat-bar">
                                <div class="stat-bar-fill ${barClass}" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        <span class="stat-value">${stat.base_stat}</span>
                    </article>
                `;
            }).join('')}
            <article class="stat-item total">
                <h4 class="stat-name">Total</h4>
                <span class="stat-value">${totalStats}</span>
            </article>
        </section>
    `;
}

/**
 * Creates the "Evolution" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Evolution tab
 */
function createEvolutionTab(pokemon) {
    return `
        <dl class="about-section">
            <div class="about-item">
                <dt class="about-label">Evolution Chain</dt>
                <dd class="about-value">Coming Soon</dd>
            </div>
            <div class="about-item">
                <dt class="about-label">Evolution Method</dt>
                <dd class="about-value">Level Up</dd>
            </div>
        </dl>
    `;
}

/**
 * Creates the "Moves" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Moves tab
 */
function createMovesTab(pokemon) {
    const moves = pokemon.moves.slice(0, 10); // Show first 10 moves
    
    return `
        <dl class="about-section">
            ${moves.map(move => `
                <div class="about-item">
                    <dt class="about-label">${capitalizeFirst(move.move.name)}</dt>
                    <dd class="about-value">Level ${move.version_group_details[0]?.level_learned_at || 'Unknown'}</dd>
                </div>
            `).join('')}
        </dl>
    `;
}

/**
 * Creates a template for the "Load More" button
 * @param {boolean} isLoading - Indicates if currently loading
 * @returns {string} HTML string for the Load More button
 */
function createLoadMoreButtonTemplate(isLoading) {
    return `
        <section class="load-more-container">
            <button id="loadMoreBtn" class="load-more-btn" ${isLoading ? 'disabled' : ''}>
                ${isLoading ? 'Loading...' : 'Load More Pokemon'}
            </button>
        </section>
    `;
}

/**
 * Creates a template for search results
 * @param {Object} pokemon - Pokemon data object
 * @param {Object} typeColors - Object with type colors
 * @returns {string} HTML string for the search result
 */
function createSearchResultTemplate(pokemon, typeColors) {
    return `
        <section class="search-result">
            ${createPokemonCardTemplate(pokemon, typeColors)}
        </section>
    `;
}

/**
 * Creates a template for error modals
 * @param {string} message - The error message
 * @returns {string} HTML string for the error modal
 */
function createErrorModalTemplate(message) {
    return `
        <section class="custom-modal" style="display: flex;">
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
        </section>
    `;
}

/**
 * Creates a template for region selection
 * @returns {string} HTML string for region selection
 */
function createRegionSelectionTemplate() {
    return `
        <section class="region-selection-section">
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
        </section>
    `;
}

/**
 * Switches between tabs in the large view
 * @param {string} tabName - Name of the tab to activate
 * @param {HTMLElement} button - The clicked tab button element
 * @returns {void}
 */
function switchTab(tabName, button) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding panel
    button.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} String with capitalized first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates a template for error notifications
 * @param {string} message - The error message to display
 * @returns {string} HTML string for the error notification
 */
function createErrorNotificationTemplate(message) {
    return `
        <div class="error-notification" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            ${message}
        </div>
    `;
}

/**
 * Shows an error message as notification
 * @param {string} message - The error message to display
 * @returns {void}
 */
function showError(message) {
    // Create error notification using template
    const errorHTML = createErrorNotificationTemplate(message);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = errorHTML;
    const errorDiv = tempDiv.firstElementChild;
    
    document.body.appendChild(errorDiv);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}
