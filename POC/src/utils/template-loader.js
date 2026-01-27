/**
 * Template Loader Utility
 * Handles loading and caching of HTML templates
 */

class TemplateLoader {
    constructor() {
        this.cache = new Map();
    }
    
    /**
     * Get full path for templates using CONFIG.BASE_PATH
     */
    get basePath() {
        return (window.CONFIG?.BASE_PATH || '') + 'templates/';
    }
    
    /**
     * Load a template from file
     * @param {string} templateName - Name of template (without .html extension)
     * @returns {Promise<string>} HTML template string
     */
    async load(templateName) {
        // Check cache first
        if (this.cache.has(templateName)) {
            return this.cache.get(templateName);
        }
        
        try {
            const fullPath = `${this.basePath}${templateName}.html`;
            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templateName}`);
            }
            
            const template = await response.text();
            
            // Cache the template
            this.cache.set(templateName, template);
            
            return template;
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            throw error;
        }
    }
    
    /**
     * Load multiple templates at once
     * @param {string[]} templateNames - Array of template names
     * @returns {Promise<Object>} Object with template names as keys and HTML as values
     */
    async loadMultiple(templateNames) {
        const promises = templateNames.map(name => 
            this.load(name).then(html => ({ name, html }))
        );
        
        const results = await Promise.all(promises);
        
        return results.reduce((acc, { name, html }) => {
            acc[name] = html;
            return acc;
        }, {});
    }
    
    /**
     * Clear the template cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Remove a specific template from cache
     * @param {string} templateName - Name of template to remove
     */
    removeFromCache(templateName) {
        this.cache.delete(templateName);
    }
}

// Create singleton instance
const templateLoader = new TemplateLoader();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = templateLoader;
} else {
    window.templateLoader = templateLoader;
}
