/**
 * Layout Service
 * Manages application layout, navigation, and common UI elements
 */

class LayoutService {
    constructor() {
        this.authService = window.authService || authService;
        this.router = window.router || router;
    }
    
    /**
     * Initialize layout
     */
    async init() {
        await this.renderNavigation();
        await this.renderFooter();
    }
    
    /**
     * Render navigation
     */
    async renderNavigation() {
        const navElement = document.getElementById('main-nav');
        if (!navElement) return;
        
        const isAuthenticated = await this.authService.checkAuth();
        const user = this.authService.getCurrentUser();
        
        let navHTML = '<nav class="bg-white border-b border-gray-200 h-16 sticky top-0 z-50 shadow-sm"><div class="max-w-container mx-auto px-6 h-full flex items-center justify-between">';
        navHTML += `<div class="nav-brand"><a href="#" data-route="${CONFIG.ROUTES.HOME}" class="text-xl font-bold text-primary no-underline hover:text-primary-dark transition-colors">${CONFIG.APP_NAME}</a></div>`;
        navHTML += '<ul class="flex list-none gap-6 items-center m-0 p-0">';
        
        if (isAuthenticated) {
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.DASHBOARD}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Dashboard</a></li>`;
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.OPPORTUNITIES}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Opportunities</a></li>`;
            navHTML += `<li><a href="#" data-route="/people" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">People</a></li>`;
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.MESSAGES}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Messages</a></li>`;
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.PROFILE}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Profile</a></li>`;
            
            if (this.authService.isAdmin()) {
                navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.ADMIN}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Admin</a></li>`;
            }
            
            navHTML += `<li class="flex items-center gap-4">
                <span class="text-gray-700">${user?.profile?.name || user?.email || 'User'}</span>
                <button onclick="layoutService.handleLogout()" class="px-4 py-2 bg-primary text-white border-0 rounded-md cursor-pointer text-sm hover:bg-primary-dark transition-colors">Logout</button>
            </li>`;
        } else {
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.LOGIN}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Login</a></li>`;
            navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.REGISTER}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Register</a></li>`;
        }
        
        navHTML += '</ul></div></nav>';
        navElement.innerHTML = navHTML;
        
        // Attach click handlers to navigation links
        this.attachNavigationHandlers();
    }
    
    /**
     * Attach click handlers to navigation links
     */
    attachNavigationHandlers() {
        const navElement = document.getElementById('main-nav');
        if (!navElement) return;
        
        // Use event delegation to handle clicks on navigation links
        navElement.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) {
                    this.router.navigate(route);
                }
            }
        });
    }
    
    /**
     * Render footer
     */
    async renderFooter() {
        const footerElement = document.getElementById('main-footer');
        if (!footerElement) return;
        
        const footerHTML = `
            <footer class="bg-white border-t border-gray-200 py-6 mt-auto">
                <div class="max-w-container mx-auto text-center text-gray-600 text-sm">
                    <p class="mb-1">&copy; ${new Date().getFullYear()} ${CONFIG.APP_NAME}. All rights reserved.</p>
                    <p>Construction Collaboration Platform for Saudi Arabia & GCC</p>
                </div>
            </footer>
        `;
        footerElement.innerHTML = footerHTML;
    }
    
    /**
     * Handle logout
     */
    async handleLogout() {
        await this.authService.logout();
        await this.renderNavigation();
        this.router.navigate(CONFIG.ROUTES.HOME);
    }
    
    /**
     * Update navigation (call after auth state changes)
     */
    async updateNavigation() {
        await this.renderNavigation();
    }
}

// Create singleton instance
const layoutService = new LayoutService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = layoutService;
} else {
    window.layoutService = layoutService;
}
