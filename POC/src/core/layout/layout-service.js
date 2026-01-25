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
        
        let navHTML = '<nav class="main-nav"><div class="nav-container">';
        navHTML += `<div class="nav-brand"><a href="${CONFIG.ROUTES.HOME}">${CONFIG.APP_NAME}</a></div>`;
        navHTML += '<ul class="nav-menu">';
        
        if (isAuthenticated) {
            navHTML += `<li><a href="${CONFIG.ROUTES.DASHBOARD}">Dashboard</a></li>`;
            navHTML += `<li><a href="${CONFIG.ROUTES.OPPORTUNITIES}">Opportunities</a></li>`;
            navHTML += `<li><a href="${CONFIG.ROUTES.PROFILE}">Profile</a></li>`;
            
            if (this.authService.isAdmin()) {
                navHTML += `<li><a href="${CONFIG.ROUTES.ADMIN}">Admin</a></li>`;
            }
            
            navHTML += `<li class="nav-user">
                <span>${user?.email || 'User'}</span>
                <button onclick="layoutService.handleLogout()">Logout</button>
            </li>`;
        } else {
            navHTML += `<li><a href="${CONFIG.ROUTES.LOGIN}">Login</a></li>`;
            navHTML += `<li><a href="${CONFIG.ROUTES.REGISTER}">Register</a></li>`;
        }
        
        navHTML += '</ul></div></nav>';
        navElement.innerHTML = navHTML;
    }
    
    /**
     * Render footer
     */
    async renderFooter() {
        const footerElement = document.getElementById('main-footer');
        if (!footerElement) return;
        
        const footerHTML = `
            <footer class="main-footer">
                <div class="footer-container">
                    <p>&copy; ${new Date().getFullYear()} ${CONFIG.APP_NAME}. All rights reserved.</p>
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
