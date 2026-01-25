/**
 * Router Service
 * Handles client-side routing for MPA
 */

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.params = {};
    }
    
    /**
     * Register a route
     */
    register(path, handler) {
        this.routes.push({ path, handler });
    }
    
    /**
     * Navigate to a route
     */
    async navigate(path) {
        // Update URL
        window.history.pushState({ path }, '', path);
        
        // Find matching route
        const route = this.findRoute(path);
        if (!route) {
            console.error(`Route not found: ${path}`);
            return false;
        }
        
        this.currentRoute = route;
        
        // Execute route handler
        if (route.handler) {
            await route.handler(route.params);
        }
        
        return true;
    }
    
    /**
     * Find matching route
     */
    findRoute(path) {
        for (const route of this.routes) {
            const params = this.matchRoute(route.path, path);
            if (params !== null) {
                return { ...route, params };
            }
        }
        return null;
    }
    
    /**
     * Match route pattern with path
     */
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(p => p);
        const pathParts = path.split('/').filter(p => p);
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                // Parameter
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // Static part doesn't match
                return null;
            }
        }
        
        this.params = params;
        return params;
    }
    
    /**
     * Get current path
     */
    getCurrentPath() {
        return window.location.pathname;
    }
    
    /**
     * Initialize router
     */
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const path = e.state?.path || window.location.pathname;
            this.navigate(path);
        });
        
        // Handle initial load
        const initialPath = this.getCurrentPath();
        this.navigate(initialPath);
    }
}

// Create singleton instance
const router = new Router();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = router;
} else {
    window.router = router;
}
