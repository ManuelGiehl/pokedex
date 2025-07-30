/**
 * Database and utility functions for Pokedex
 * @fileoverview data validation and error handling functions
 */

// Data validation functions
/**
 * Checks if Pokemon data is valid
 * @param {Object} pokemon - Pokemon data object
 * @returns {boolean} true if data is valid
 */
function isValidPokemonData(pokemon) {
    return pokemon && 
           pokemon.id && 
           pokemon.name && 
           pokemon.types && 
           pokemon.sprites && 
           pokemon.stats;
}

/**
 * Checks if a search term is valid
 * @param {string} searchTerm - The search term to validate
 * @returns {boolean} true if search term is valid
 */
function isValidSearchTerm(searchTerm) {
    return searchTerm && 
           searchTerm.trim().length >= 1 && 
           /^[a-zA-Z0-9\s-]+$/.test(searchTerm);
}

/**
 * Checks if a search term is a Pokemon ID
 * @param {string} searchTerm - The search term to check
 * @returns {boolean} true if it's an ID
 */
function isPokemonId(searchTerm) {
    // Check if the search term is a number (Pokemon ID)
    const cleanTerm = searchTerm.trim();
    return /^\d+$/.test(cleanTerm);
}

/**
 * Sanitizes a search term
 * @param {string} searchTerm - The search term to sanitize
 * @returns {string} Sanitized search term
 */
function sanitizeSearchTerm(searchTerm) {
    return searchTerm.toLowerCase().trim().replace(/[^a-zA-Z0-9\s-]/g, '');
}

/**
 * Sanitizes a Pokemon ID and converts it to a number
 * @param {string} searchTerm - The ID to sanitize
 * @returns {number} Pokemon ID as number
 */
function sanitizePokemonId(searchTerm) {
    // Remove leading zeros and convert to number
    const cleanTerm = searchTerm.trim();
    return parseInt(cleanTerm, 10);
}

// Error handling functions
/**
 * Handles API errors and returns user-friendly messages
 * @param {Error} error - The occurred error
 * @param {string} context - Context in which the error occurred
 * @returns {string} User-friendly error message
 */
function handleAPIError(error, context) {
    console.error(`API Error in ${context}:`, error);
    
    const errorMessage = {
        network: 'Network error. Please check your connection.',
        notFound: 'Pokemon not found. Please try a different search term.',
        server: 'Server error. Please try again later.',
        unknown: 'An unexpected error occurred. Please try again.'
    };

    if (error.message.includes('not found')) {
        return errorMessage.notFound;
    } else if (error.name === 'TypeError') {
        return errorMessage.network;
    } else if (error.message.includes('status: 500')) {
        return errorMessage.server;
    } else {
        return errorMessage.unknown;
    }
}

/**
 * Shows an error message as notification
 * @param {string} message - The error message to display
 * @returns {void}
 */
function showError(message) {
    // Create a temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
