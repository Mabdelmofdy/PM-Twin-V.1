/**
 * API Service
 * Abstraction layer for API calls (ready for backend integration)
 * Currently uses localStorage, but structured for easy backend migration
 */

class ApiService {
    constructor() {
        this.dataService = window.dataService || dataService;
        this.authService = window.authService || authService;
        this.baseURL = CONFIG.API.BASE_URL;
    }
    
    /**
     * Make API request (currently uses dataService, ready for fetch)
     */
    async request(endpoint, options = {}) {
        // In POC, use dataService directly
        // In production, replace with fetch() calls
        
        const { method = 'GET', data } = options;
        
        // For now, route to appropriate dataService method
        // This structure allows easy replacement with fetch() later
        
        switch (method) {
            case 'GET':
                return this.handleGet(endpoint, options);
            case 'POST':
                return this.handlePost(endpoint, data);
            case 'PUT':
                return this.handlePut(endpoint, data);
            case 'DELETE':
                return this.handleDelete(endpoint);
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }
    
    /**
     * Handle GET requests
     */
    async handleGet(endpoint, options) {
        // Parse endpoint and route to dataService
        if (endpoint.includes('/users/')) {
            const id = endpoint.split('/users/')[1];
            return await this.dataService.getUserById(id);
        } else if (endpoint.includes('/opportunities/')) {
            const id = endpoint.split('/opportunities/')[1];
            return await this.dataService.getOpportunityById(id);
        } else if (endpoint === '/users') {
            return await this.dataService.getUsers();
        } else if (endpoint === '/opportunities') {
            return await this.dataService.getOpportunities();
        }
        return null;
    }
    
    /**
     * Handle POST requests
     */
    async handlePost(endpoint, data) {
        if (endpoint === '/opportunities') {
            return await this.dataService.createOpportunity(data);
        } else if (endpoint === '/applications') {
            return await this.dataService.createApplication(data);
        }
        return null;
    }
    
    /**
     * Handle PUT requests
     */
    async handlePut(endpoint, data) {
        if (endpoint.includes('/opportunities/')) {
            const id = endpoint.split('/opportunities/')[1];
            return await this.dataService.updateOpportunity(id, data);
        } else if (endpoint.includes('/users/')) {
            const id = endpoint.split('/users/')[1];
            return await this.dataService.updateUser(id, data);
        }
        return null;
    }
    
    /**
     * Handle DELETE requests
     */
    async handleDelete(endpoint) {
        if (endpoint.includes('/opportunities/')) {
            const id = endpoint.split('/opportunities/')[1];
            return await this.dataService.deleteOpportunity(id);
        }
        return null;
    }
    
    /**
     * Get authentication headers (for future backend integration)
     */
    getAuthHeaders() {
        const token = sessionStorage.getItem('pmtwin_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Create singleton instance
const apiService = new ApiService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
} else {
    window.apiService = apiService;
}
