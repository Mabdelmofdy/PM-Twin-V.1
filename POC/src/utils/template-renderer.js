/**
 * Template Renderer Utility
 * Renders HTML templates with data using Handlebars-like syntax
 */

class TemplateRenderer {
    /**
     * Render a template with data
     * @param {string} template - HTML template string
     * @param {Object} data - Data object to render
     * @returns {string} Rendered HTML string
     */
    render(template, data = {}) {
        let rendered = template;
        
        // Process conditionals first (innermost to outermost, handles nesting)
        let iterations = 0;
        const maxIterations = 50; // Prevent infinite loops
        
        while (iterations < maxIterations) {
            const beforeRender = rendered;
            
            // Handle conditionals with else: {{#if property}}...{{else}}...{{/if}}
            rendered = rendered.replace(
                /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
                (match, path, ifContent, elseContent) => {
                    const value = this.getNestedValue(data, path);
                    const condition = this.isTruthy(value);
                    const content = condition ? ifContent : elseContent;
                    return this.render(content, data); // Recursively render chosen content
                }
            );
            
            // Handle conditionals without else: {{#if property}}...{{/if}}
            rendered = rendered.replace(
                /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g,
                (match, path, content) => {
                    const value = this.getNestedValue(data, path);
                    const condition = this.isTruthy(value);
                    return condition ? this.render(content, data) : '';
                }
            );
            
            // Handle negative conditionals: {{#unless property}}...{{/unless}}
            rendered = rendered.replace(
                /\{\{#unless\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
                (match, path, content) => {
                    const value = this.getNestedValue(data, path);
                    const condition = !this.isTruthy(value);
                    return condition ? this.render(content, data) : '';
                }
            );
            
            // Handle loops: {{#each array}}...{{/each}}
            rendered = rendered.replace(
                /\{\{#each\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g,
                (match, path, content) => {
                    const array = this.getNestedValue(data, path);
                    if (!Array.isArray(array)) {
                        return '';
                    }
                    
                    return array.map((item, index) => {
                        const itemData = {
                            ...data,
                            ...(typeof item === 'object' ? item : { this: item }),
                            '@index': index,
                            '@first': index === 0,
                            '@last': index === array.length - 1
                        };
                        return this.render(content, itemData);
                    }).join('');
                }
            );
            
            // If no changes were made, we're done with block helpers
            if (rendered === beforeRender) {
                break;
            }
            iterations++;
        }
        
        // Handle unescaped placeholders: {{{property}}}
        rendered = rendered.replace(/\{\{\{(\w+(?:\.\w+)*)\}\}\}/g, (match, path) => {
            const value = this.getNestedValue(data, path);
            return value !== undefined && value !== null ? String(value) : '';
        });
        
        // Handle simple placeholders: {{property}}
        rendered = rendered.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const value = this.getNestedValue(data, path);
            return this.escapeHtml(value !== undefined && value !== null ? String(value) : '');
        });
        
        return rendered;
    }
    
    /**
     * Check if a value is truthy for template conditionals
     */
    isTruthy(value) {
        if (value === undefined || value === null || value === false || value === '') {
            return false;
        }
        if (Array.isArray(value) && value.length === 0) {
            return false;
        }
        return true;
    }
    
    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Object to get value from
     * @param {string} path - Dot notation path (e.g., 'user.profile.name')
     * @returns {*} Value at path or undefined
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : undefined;
        }, obj);
    }
    
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @param {string} format - Format string (default: locale date string)
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'locale') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        if (format === 'locale') {
            return d.toLocaleDateString();
        } else if (format === 'datetime') {
            return d.toLocaleString();
        } else if (format === 'time') {
            return d.toLocaleTimeString();
        }
        
        return d.toLocaleDateString();
    }
    
    /**
     * Format number
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    formatNumber(num, decimals = 0) {
        if (num === undefined || num === null) return '';
        return Number(num).toFixed(decimals);
    }
}

// Create singleton instance
const templateRenderer = new TemplateRenderer();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = templateRenderer;
} else {
    window.templateRenderer = templateRenderer;
}
