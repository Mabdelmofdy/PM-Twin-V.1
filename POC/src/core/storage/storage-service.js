/**
 * Storage Service
 * Abstraction layer for localStorage (POC) / Backend API (Production)
 */

class StorageService {
    constructor() {
        this.storage = window.localStorage;
    }
    
    /**
     * Get item from storage
     */
    get(key) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return null;
        }
    }
    
    /**
     * Set item in storage
     */
    set(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            return false;
        }
    }
    
    /**
     * Remove item from storage
     */
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from storage (${key}):`, error);
            return false;
        }
    }
    
    /**
     * Clear all storage
     */
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    /**
     * Get all items with a specific prefix
     */
    getAll(prefix) {
        const items = {};
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(prefix)) {
                items[key] = this.get(key);
            }
        }
        return items;
    }
    
    /**
     * Initialize storage with default data if empty
     */
    initialize(defaultData) {
        Object.keys(defaultData).forEach(key => {
            if (!this.get(key)) {
                this.set(key, defaultData[key]);
            }
        });
    }
}

// Create singleton instance
const storageService = new StorageService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storageService;
} else {
    window.storageService = storageService;
}
