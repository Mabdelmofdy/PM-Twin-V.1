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
        
        // Process block helpers with proper nesting support
        rendered = this.processBlocks(rendered, data);
        
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
     * Process block helpers (if, unless, each) with proper nesting
     */
    processBlocks(template, data) {
        let result = '';
        let i = 0;
        
        while (i < template.length) {
            // Look for block start
            const blockStart = template.indexOf('{{#', i);
            
            if (blockStart === -1) {
                // No more blocks, append rest
                result += template.substring(i);
                break;
            }
            
            // Append content before block
            result += template.substring(i, blockStart);
            
            // Parse block type and variable
            const blockMatch = template.substring(blockStart).match(/^\{\{#(\w+)\s+(\w+(?:\.\w+)*)\}\}/);
            if (!blockMatch) {
                // Not a valid block, append and continue
                result += '{{#';
                i = blockStart + 3;
                continue;
            }
            
            const blockType = blockMatch[1]; // 'if', 'unless', 'each'
            const blockVar = blockMatch[2];  // variable name
            const blockOpenEnd = blockStart + blockMatch[0].length;
            
            // Find matching closing tag
            const closeTag = `{{/${blockType}}}`;
            const blockContent = this.findMatchingClose(template, blockOpenEnd, blockType);
            
            if (!blockContent) {
                // No matching close, append and continue
                result += blockMatch[0];
                i = blockOpenEnd;
                continue;
            }
            
            const { content, elseContent, endIndex } = blockContent;
            
            // Process based on block type
            if (blockType === 'if') {
                const value = this.getNestedValue(data, blockVar);
                const condition = this.isTruthy(value);
                const selectedContent = condition ? content : (elseContent || '');
                result += this.render(selectedContent, data);
            } else if (blockType === 'unless') {
                const value = this.getNestedValue(data, blockVar);
                const condition = !this.isTruthy(value);
                result += condition ? this.render(content, data) : '';
            } else if (blockType === 'each') {
                const array = this.getNestedValue(data, blockVar);
                if (Array.isArray(array)) {
                    result += array.map((item, index) => {
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
            }
            
            i = endIndex;
        }
        
        return result;
    }
    
    /**
     * Find matching closing tag, accounting for nesting
     */
    findMatchingClose(template, startIndex, blockType) {
        const openPattern = new RegExp(`\\{\\{#${blockType}\\s+\\w+(?:\\.\\w+)*\\}\\}`, 'g');
        const closePattern = `{{/${blockType}}}`;
        const elsePattern = '{{else}}';
        
        let depth = 1;
        let i = startIndex;
        let contentStart = startIndex;
        let elseIndex = -1;
        
        while (i < template.length && depth > 0) {
            // Check for nested open
            const remainingTemplate = template.substring(i);
            const nextOpen = remainingTemplate.search(openPattern);
            const nextClose = remainingTemplate.indexOf(closePattern);
            const nextElse = remainingTemplate.indexOf(elsePattern);
            
            // Determine which comes first
            let nextEvent = -1;
            let eventType = '';
            
            if (nextClose !== -1) {
                nextEvent = nextClose;
                eventType = 'close';
            }
            
            if (nextOpen !== -1 && (nextEvent === -1 || nextOpen < nextEvent)) {
                nextEvent = nextOpen;
                eventType = 'open';
            }
            
            // Check for else at current depth
            if (depth === 1 && nextElse !== -1 && (nextEvent === -1 || nextElse < nextEvent)) {
                elseIndex = i + nextElse;
                i = elseIndex + elsePattern.length;
                continue;
            }
            
            if (nextEvent === -1) {
                // No more tags found
                return null;
            }
            
            if (eventType === 'open') {
                depth++;
                const match = remainingTemplate.match(openPattern);
                i += nextOpen + (match ? match[0].length : 3);
            } else if (eventType === 'close') {
                depth--;
                if (depth === 0) {
                    // Found matching close
                    const endIndex = i + nextClose + closePattern.length;
                    
                    if (elseIndex !== -1) {
                        return {
                            content: template.substring(contentStart, elseIndex),
                            elseContent: template.substring(elseIndex + elsePattern.length, i + nextClose),
                            endIndex
                        };
                    } else {
                        return {
                            content: template.substring(contentStart, i + nextClose),
                            elseContent: null,
                            endIndex
                        };
                    }
                }
                i += nextClose + closePattern.length;
            }
        }
        
        return null;
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
