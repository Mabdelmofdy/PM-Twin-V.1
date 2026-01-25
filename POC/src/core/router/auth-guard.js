/**
 * Auth Guard
 * Protects routes based on authentication and authorization
 */

class AuthGuard {
    constructor() {
        this.authService = window.authService || authService;
        this.router = window.router || router;
    }
    
    /**
     * Check if route requires authentication
     */
    requiresAuth(route) {
        const publicRoutes = [
            CONFIG.ROUTES.HOME,
            CONFIG.ROUTES.LOGIN,
            CONFIG.ROUTES.REGISTER
        ];
        return !publicRoutes.includes(route);
    }
    
    /**
     * Check if route requires specific role
     */
    requiresRole(route, roles) {
        const adminRoutes = [
            CONFIG.ROUTES.ADMIN,
            CONFIG.ROUTES.ADMIN_USERS,
            CONFIG.ROUTES.ADMIN_OPPORTUNITIES,
            CONFIG.ROUTES.ADMIN_AUDIT,
            CONFIG.ROUTES.ADMIN_SETTINGS
        ];
        
        if (adminRoutes.includes(route)) {
            return this.authService.hasAnyRole(roles || [CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR]);
        }
        
        return true;
    }
    
    /**
     * Guard route access
     */
    async canActivate(route) {
        // Check authentication
        if (this.requiresAuth(route)) {
            const isAuthenticated = await this.authService.checkAuth();
            if (!isAuthenticated) {
                return {
                    allowed: false,
                    redirect: CONFIG.ROUTES.LOGIN,
                    reason: 'Authentication required'
                };
            }
        }
        
        // Check authorization
        if (!this.requiresRole(route)) {
            return {
                allowed: false,
                redirect: CONFIG.ROUTES.DASHBOARD,
                reason: 'Insufficient permissions'
            };
        }
        
        return { allowed: true };
    }
    
    /**
     * Protect a route handler
     */
    protect(handler, requiredRoles = null) {
        return async (params) => {
            const route = window.location.pathname;
            const guardResult = await this.canActivate(route);
            
            if (!guardResult.allowed) {
                if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
                    alert('You do not have permission to access this page.');
                    this.router.navigate(CONFIG.ROUTES.DASHBOARD);
                    return;
                }
                
                this.router.navigate(guardResult.redirect);
                return;
            }
            
            return handler(params);
        };
    }
}

// Create singleton instance
const authGuard = new AuthGuard();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authGuard;
} else {
    window.authGuard = authGuard;
}
