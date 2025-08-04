/**
 * Template functions for Pokemon overlay components
 */

/**
 * Creates a template for the large Pokemon view
 * @param {Object} pokemon - Pokemon data object
 * @param {Object} typeColors - Object with type colors
 * @returns {string} HTML string for the large view
 */
function createLargeViewTemplate(pokemon, typeColors) {
    const primaryType = pokemon.types[0].type.name;
    const backgroundColor = typeColors[primaryType] || '#777';
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
    
    return `<section class="large-view-content">
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
                    ${pokemon.types.map(type => `<span class="type-badge large" style="background-color: ${typeColors[type.type.name] || '#777'}">${capitalizeFirst(type.type.name)}</span>`).join('')}
                </footer>
            </section>
            <section class="large-view-bottom">
                <div class="tab-container">${createTabSystem(pokemon)}</div>
            </section>
        </main>
        <div class="nav-container">
            <nav class="large-view-nav">
                <button class="nav-btn prev-btn" onclick="navigatePokemon(-1)" aria-label="Previous Pokemon">‹</button>
                <button class="nav-btn next-btn" onclick="navigatePokemon(1)" aria-label="Next Pokemon">›</button>
            </nav>
        </div>
    </section>`;
}

/**
 * Creates the tab system for the large view
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the tab system
 */
function createTabSystem(pokemon) {
    return `<nav class="tab-header">
        <button class="tab-button active" onclick="switchTab('about', this)" aria-label="About tab">About</button>
        <button class="tab-button" onclick="switchTab('stats', this)" aria-label="Stats tab">Stats</button>
        <button class="tab-button" onclick="switchTab('evolution', this)" aria-label="Evolution tab">Evolution</button>
        <button class="tab-button" onclick="switchTab('moves', this)" aria-label="Moves tab">Moves</button>
    </nav>
    <main class="tab-content">
        <section id="about-tab" class="tab-panel active">${createAboutTab(pokemon)}</section>
        <section id="stats-tab" class="tab-panel">${createStatsTab(pokemon)}</section>
        <section id="evolution-tab" class="tab-panel">${createEvolutionTab(pokemon)}</section>
        <section id="moves-tab" class="tab-panel">${createMovesTab(pokemon)}</section>
    </main>`;
}

/**
 * Creates the "About" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the About tab
 */
function createAboutTab(pokemon) {
    return `<dl class="about-section">
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
            <dd class="about-value">${pokemon.abilities.map(ability => capitalizeFirst(ability.ability.name) + (ability.is_hidden ? ' (Hidden)' : '')).join(', ')}</dd>
        </div>
        <div class="about-item">
            <dt class="about-label">Base Experience</dt>
            <dd class="about-value">${pokemon.base_experience || 'Unknown'}</dd>
        </div>
    </dl>`;
}

/**
 * Creates the "Base Stats" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Stats tab
 */
function createStatsTab(pokemon) {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    
    return `<section class="stats-container">
        ${pokemon.stats.map(stat => {
            const percentage = (stat.base_stat / 255) * 100;
            let barClass = 'low';
            if (percentage > 60) barClass = 'high';
            else if (percentage > 40) barClass = 'medium';
            
            return `<article class="stat-item">
                <div class="stat-info">
                    <h4 class="stat-name">${capitalizeFirst(stat.stat.name)}</h4>
                    <div class="stat-bar">
                        <div class="stat-bar-fill ${barClass}" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="stat-value">${stat.base_stat}</span>
            </article>`;
        }).join('')}
        <article class="stat-item total">
            <h4 class="stat-name">Total</h4>
            <span class="stat-value">${totalStats}</span>
        </article>
    </section>`;
}

/**
 * Creates the "Moves" tab content
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} HTML string for the Moves tab
 */
function createMovesTab(pokemon) {
    const moves = pokemon.moves.slice(0, 10);
    
    return `<dl class="about-section">
        ${moves.map(move => `<div class="about-item">
            <dt class="about-label">${capitalizeFirst(move.move.name)}</dt>
            <dd class="about-value">Level ${move.version_group_details[0]?.level_learned_at || 'Unknown'}</dd>
        </div>`).join('')}
    </dl>`;
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


