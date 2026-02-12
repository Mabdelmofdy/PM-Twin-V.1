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
        // Admin endpoints
        if (endpoint.startsWith('/admin/')) {
            return this.handleAdminGet(endpoint);
        }
        // Parse endpoint and route to dataService
        if (endpoint.includes('/users/')) {
            const id = endpoint.split('/users/')[1]?.split('/')[0];
            return await this.dataService.getUserById(id);
        } else if (endpoint.includes('/opportunities/')) {
            const parts = endpoint.split('/opportunities/')[1]?.split('/') || [];
            const id = parts[0];
            if (parts[1] === 'applications') {
                return await this.dataService.getApplicationsByOpportunityId(id);
            }
            return await this.dataService.getOpportunityById(id);
        } else if (endpoint === '/users') {
            return await this.dataService.getUsers();
        } else if (endpoint === '/opportunities') {
            return await this.dataService.getOpportunities();
        }
        return null;
    }

    async handleAdminGet(endpoint) {
        const ds = this.dataService;
        if (endpoint === '/admin/opportunities' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_OPPORTUNITIES) {
            return await ds.getOpportunities();
        }
        if (endpoint.match(/^\/admin\/opportunities\/[^/]+$/) || endpoint.includes('opportunities/:id')) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0]?.replace(':id', '');
            return id ? await ds.getOpportunityById(id) : null;
        }
        if (endpoint.match(/^\/admin\/opportunities\/[^/]+\/applications$/)) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0];
            return id ? await ds.getApplicationsByOpportunityId(id) : [];
        }
        if (endpoint === '/admin/users' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_USERS) {
            return await ds.getUsers();
        }
        if (endpoint.match(/^\/admin\/users\/[^/]+$/)) {
            const id = endpoint.split('/users/')[1]?.split('/')[0];
            return id ? await ds.getUserById(id) : null;
        }
        if (endpoint === '/admin/applications' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_APPLICATIONS) {
            return await ds.getApplications();
        }
        if (endpoint === '/admin/reports/offers-by-site' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_REPORTS_OFFERS_BY_SITE) {
            const applications = await ds.getApplications();
            const opportunities = await ds.getOpportunities();
            const oppById = {};
            opportunities.forEach(o => { oppById[o.id] = o; });
            const bySite = {};
            applications.forEach((app) => {
                const opp = oppById[app.opportunityId];
                const site = opp ? (opp.location || opp.locationRegion || opp.locationCity || 'Unknown').trim() || 'Unknown' : 'Unknown';
                bySite[site] = (bySite[site] || 0) + 1;
            });
            return Object.entries(bySite).map(([site, count]) => ({ site, count })).sort((a, b) => b.count - a.count);
        }
        if (endpoint === '/admin/reports/offers-by-opportunity' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_REPORTS_OFFERS_BY_OPPORTUNITY) {
            const opportunities = await ds.getOpportunities();
            return Promise.all(opportunities.map(async (o) => ({
                id: o.id,
                title: o.title || o.id,
                count: await ds.getApplicationCountByOpportunityId(o.id)
            }))).then(arr => arr.sort((a, b) => b.count - a.count));
        }
        if (endpoint === '/admin/settings' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SETTINGS) {
            return (window.storageService || {}).get?.(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS) || {};
        }
        if (endpoint === '/admin/subscription-plans' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SUBSCRIPTION_PLANS) {
            return await ds.getSubscriptionPlans();
        }
        if (endpoint === '/admin/subscriptions' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SUBSCRIPTIONS) {
            return await ds.getSubscriptions();
        }
        return null;
    }
    
    /**
     * Handle POST requests
     */
    async handlePost(endpoint, data) {
        if (endpoint.startsWith('/admin/')) {
            return this.handleAdminPost(endpoint, data);
        }
        if (endpoint === '/opportunities') {
            return await this.dataService.createOpportunity(data);
        } else if (endpoint === '/applications') {
            return await this.dataService.createApplication(data);
        }
        return null;
    }

    async handleAdminPost(endpoint, data) {
        const ds = this.dataService;
        if (endpoint === '/admin/subscription-plans' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SUBSCRIPTION_PLANS) {
            return await ds.createPlan(data || {});
        }
        if (endpoint === '/admin/subscriptions' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SUBSCRIPTIONS) {
            const { entityId, planId, isCompany, status, startsAt, endsAt } = data || {};
            return await ds.assignSubscription(entityId, planId, !!isCompany, { status, startsAt, endsAt });
        }
        if (endpoint === '/admin/settings' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SETTINGS) {
            const storage = window.storageService;
            if (storage && data) storage.set(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS, data);
            return data;
        }
        return null;
    }
    
    /**
     * Handle PUT requests
     */
    async handlePut(endpoint, data) {
        if (endpoint.startsWith('/admin/')) {
            return this.handleAdminPut(endpoint, data);
        }
        if (endpoint.includes('/opportunities/')) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0];
            return id ? await this.dataService.updateOpportunity(id, data) : null;
        } else if (endpoint.includes('/users/')) {
            const id = endpoint.split('/users/')[1]?.split('/')[0];
            return id ? await this.dataService.updateUser(id, data) : null;
        }
        return null;
    }

    async handleAdminPut(endpoint, data) {
        const ds = this.dataService;
        if (endpoint.match(/^\/admin\/opportunities\/[^/]+$/)) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0];
            return id ? await ds.updateOpportunity(id, data) : null;
        }
        if (endpoint.match(/^\/admin\/users\/[^/]+$/)) {
            const id = endpoint.split('/users/')[1]?.split('/')[0];
            return id ? await ds.updateUser(id, data) : null;
        }
        if (endpoint === '/admin/settings' || endpoint === CONFIG.API.ENDPOINTS.ADMIN_SETTINGS) {
            const storage = window.storageService;
            if (storage && data) storage.set(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS, data);
            return data;
        }
        if (endpoint.match(/^\/admin\/subscription-plans\/[^/]+$/)) {
            const id = endpoint.split('/subscription-plans/')[1]?.split('/')[0];
            return id ? await ds.updatePlan(id, data) : null;
        }
        if (endpoint.match(/^\/admin\/subscriptions\/[^/]+$/)) {
            const id = endpoint.split('/subscriptions/')[1]?.split('/')[0];
            return id ? await ds.updateSubscription(id, data) : null;
        }
        return null;
    }
    
    /**
     * Handle DELETE requests
     */
    async handleDelete(endpoint) {
        if (endpoint.startsWith('/admin/')) {
            return this.handleAdminDelete(endpoint);
        }
        if (endpoint.includes('/opportunities/')) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0];
            return id ? await this.dataService.deleteOpportunity(id) : null;
        }
        return null;
    }

    async handleAdminDelete(endpoint) {
        const ds = this.dataService;
        if (endpoint.match(/^\/admin\/opportunities\/[^/]+$/)) {
            const id = endpoint.split('/opportunities/')[1]?.split('/')[0];
            return id ? await ds.deleteOpportunity(id) : null;
        }
        if (endpoint.match(/^\/admin\/subscription-plans\/[^/]+$/)) {
            const id = endpoint.split('/subscription-plans/')[1]?.split('/')[0];
            return id ? await ds.deletePlan(id) : null;
        }
        if (endpoint.match(/^\/admin\/subscriptions\/[^/]+$/)) {
            const id = endpoint.split('/subscriptions/')[1]?.split('/')[0];
            return id ? await ds.removeSubscription(id) : null;
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
