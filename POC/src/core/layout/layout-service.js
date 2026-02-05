/**
 * Layout Service
 * Manages application layout, navigation, and common UI elements.
 * When authenticated: portal layout (sidebar + main card). When not: public layout (top nav + full-width main).
 */

class LayoutService {
    constructor() {
        this.authService = window.authService || authService;
        this.router = window.router || router;
        this.mainContentId = 'main-content';
        this.publicLayoutId = 'app-public-layout';
        this.portalLayoutId = 'app-portal-layout';
        this.mainContentSlotId = 'main-content-slot';
    }

    /**
     * Initialize layout
     */
    async init() {
        await this.renderLayout();
        await this.renderFooter();
    }

    /**
     * Get current path for active nav (from router or location)
     */
    getCurrentPath() {
        if (this.router && typeof this.router.getCurrentPath === 'function') {
            return this.router.getCurrentPath();
        }
        const hash = window.location.hash.replace(/^#/, '') || '/';
        return hash.startsWith('/') ? hash : '/' + hash;
    }

    /**
     * Switch layout by auth: move #main-content and show/hide portal vs public
     */
    async applyLayoutMode(isAuthenticated) {
        const mainContent = document.getElementById(this.mainContentId);
        const publicLayout = document.getElementById(this.publicLayoutId);
        const portalLayout = document.getElementById(this.portalLayoutId);
        const slot = document.getElementById(this.mainContentSlotId);
        if (!mainContent || !publicLayout || !portalLayout) return;

        if (isAuthenticated) {
            publicLayout.classList.remove('public-visible');
            portalLayout.classList.add('portal-visible');
            if (slot && mainContent.parentElement !== slot) {
                slot.appendChild(mainContent);
            }
        } else {
            portalLayout.classList.remove('portal-visible');
            publicLayout.classList.add('public-visible');
            const publicNav = document.getElementById('main-nav');
            if (publicNav && publicNav.nextElementSibling !== mainContent) {
                if (mainContent.parentElement) {
                    mainContent.parentElement.removeChild(mainContent);
                }
                publicNav.parentElement.insertBefore(mainContent, publicNav.nextElementSibling);
            }
        }
    }

    /**
     * Render entire layout (sidebar when auth, top nav when public)
     */
    async renderLayout() {
        const isAuthenticated = await this.authService.checkAuth();
        const user = this.authService.getCurrentUser();

        await this.applyLayoutMode(isAuthenticated);

        if (isAuthenticated) {
            await this.renderSidebar(user);
            this.attachSidebarHandlers();
        } else {
            await this.renderPublicNav(user);
            this.attachNavigationHandlers();
        }
    }

    /**
     * Render public (top) nav – used when not authenticated.
     * Collaboration Models is intentionally not shown in public view.
     */
    async renderPublicNav() {
        const navElement = document.getElementById('main-nav');
        if (!navElement) return;

        let navHTML = '<nav class="bg-white border-b border-gray-200 h-16 sticky top-0 z-50 shadow-sm"><div class="max-w-container mx-auto px-6 h-full flex items-center justify-between">';
        navHTML += `<div class="nav-brand"><a href="#" data-route="${CONFIG.ROUTES.HOME}" class="text-xl font-bold text-primary no-underline hover:text-primary-dark transition-colors">${CONFIG.APP_NAME}</a></div>`;
        navHTML += '<ul class="flex list-none gap-6 items-center m-0 p-0">';
        navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.KNOWLEDGE_BASE}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Knowledge Base</a></li>`;
        navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.LOGIN}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Login</a></li>`;
        navHTML += `<li><a href="#" data-route="${CONFIG.ROUTES.REGISTER}" class="text-gray-900 no-underline font-medium hover:text-primary transition-colors">Register</a></li>`;
        navHTML += '</ul></div></nav>';
        navElement.innerHTML = navHTML;
    }

    /**
     * Render portal sidebar – used when authenticated
     */
    async renderSidebar(user) {
        const sidebarEl = document.getElementById('app-sidebar');
        if (!sidebarEl) return;

        const currentPath = this.getCurrentPath();
        const isActive = (route) => {
            if (route === '/' || route === CONFIG.ROUTES.HOME) return currentPath === '/' || currentPath === '';
            return currentPath === route || currentPath.startsWith(route + '/');
        };

        const displayName = user?.profile?.name || user?.email || 'User';
        const initial = (displayName.charAt(0) || 'U').toUpperCase();
        const roleLabel = (user?.role || 'user').toUpperCase().replace(/-/g, '_');
        const profileRoute = CONFIG.ROUTES.PROFILE;
        const settingsRoute = CONFIG.ROUTES.SETTINGS;

        let html = '<div class="portal-sidebar-inner">';
        html += `<div class="portal-sidebar-brand"><i class="ph-duotone ph-lightning"></i><span>${CONFIG.APP_NAME}</span></div>`;
        html += '<div class="portal-lang-selector"><button type="button" class="portal-lang-btn" data-lang="ar">AR</button><button type="button" class="portal-lang-btn portal-lang-btn-active" data-lang="en">EN</button></div>';

        html += '<div class="portal-user-dropdown">';
        html += '<div class="portal-sidebar-user-card portal-user-dropdown-trigger" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">';
        html += `<div class="portal-user-avatar" aria-hidden="true">${initial}</div>`;
        html += '<div class="portal-user-info">';
        html += `<span class="portal-user-name">${displayName}</span>`;
        html += `<span class="portal-user-role-tag">${roleLabel}</span>`;
        html += '</div>';
        html += '<i class="ph-duotone ph-caret-down portal-user-chevron" aria-hidden="true"></i>';
        html += '</div>';
        html += '<div class="portal-user-dropdown-menu">';
        html += `<a href="#" data-route="${profileRoute}" class="portal-menu-item ${isActive(profileRoute) ? 'portal-menu-item-active' : ''}"><i class="ph-duotone ph-user"></i><span>Profile</span></a>`;
        html += '<hr class="portal-menu-separator" />';
        html += `<a href="#" data-route="${settingsRoute}" class="portal-menu-item ${isActive(settingsRoute) ? 'portal-menu-item-active' : ''}"><i class="ph-duotone ph-gear"></i><span>Settings</span></a>`;
        html += '</div>';
        html += '</div>';

        html += '<p class="portal-sidebar-section">MAIN</p>';
        html += '<nav class="portal-sidebar-nav">';

        const links = [
            { route: CONFIG.ROUTES.DASHBOARD, label: 'Dashboard', icon: 'ph-duotone ph-house' },
            { route: CONFIG.ROUTES.OPPORTUNITIES, label: 'Opportunities', icon: 'ph-duotone ph-briefcase' },
            { route: '/pipeline', label: 'Pipeline', icon: 'ph-duotone ph-git-branch' },
            { route: '/people', label: 'People', icon: 'ph-duotone ph-users' },
            { route: CONFIG.ROUTES.MESSAGES, label: 'Messages', icon: 'ph-duotone ph-chat-circle' },
            { route: CONFIG.ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'ph-duotone ph-bell' },
        ];
        links.forEach(({ route, label, icon }) => {
            const active = isActive(route);
            html += `<a href="#" data-route="${route}" class="portal-nav-link ${active ? 'portal-nav-active' : ''}"><i class="${icon}"></i><span>${label}</span></a>`;
        });
        if (this.authService.isAdmin()) {
            html += `<a href="#" data-route="${CONFIG.ROUTES.ADMIN}" class="portal-nav-link ${isActive(CONFIG.ROUTES.ADMIN) ? 'portal-nav-active' : ''}"><i class="ph-duotone ph-gear"></i><span>Admin</span></a>`;
            html += `<a href="#" data-route="${CONFIG.ROUTES.ADMIN_REPORTS}" class="portal-nav-link ${isActive(CONFIG.ROUTES.ADMIN_REPORTS) ? 'portal-nav-active' : ''}"><i class="ph-duotone ph-chart-bar"></i><span>Reports</span></a>`;
        }
        html += '</nav>';
        html += `<div class="portal-sidebar-footer"><button type="button" class="portal-logout-btn" onclick="layoutService.handleLogout()"><i class="ph-duotone ph-sign-out"></i><span>Logout</span></button></div>`;
        html += '</div>';
        sidebarEl.innerHTML = html;
    }

    /**
     * Attach sidebar nav link handlers
     */
    attachSidebarHandlers() {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) this.router.navigate(route);
            }
        });
        const langBtns = sidebar.querySelectorAll('.portal-lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                langBtns.forEach(b => b.classList.remove('portal-lang-btn-active'));
                btn.classList.add('portal-lang-btn-active');
                const lang = btn.getAttribute('data-lang');
                if (lang === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                    document.documentElement.setAttribute('lang', 'ar');
                } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                    document.documentElement.setAttribute('lang', 'en');
                }
            });
        });
        const trigger = sidebar.querySelector('.portal-user-dropdown-trigger');
        const dropdown = sidebar.querySelector('.portal-user-dropdown');
        if (trigger && dropdown) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdown.classList.toggle('portal-user-dropdown-open');
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }
        if (!window._portalUserDropdownDocListener) {
            window._portalUserDropdownDocListener = true;
            document.addEventListener('click', (e) => {
                if (e.target.closest('.portal-user-dropdown')) return;
                const openDropdown = document.querySelector('.portal-user-dropdown.portal-user-dropdown-open');
                if (openDropdown) {
                    openDropdown.classList.remove('portal-user-dropdown-open');
                    const t = openDropdown.querySelector('.portal-user-dropdown-trigger');
                    if (t) t.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    /**
     * Attach click handlers for public nav links
     */
    attachNavigationHandlers() {
        const navElement = document.getElementById('main-nav');
        if (!navElement) return;
        navElement.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) this.router.navigate(route);
            }
        });
    }

    /**
     * Render footer
     */
    async renderFooter() {
        const footerElement = document.getElementById('main-footer');
        if (!footerElement) return;
        footerElement.innerHTML = `
            <footer class="bg-white border-t border-gray-200 py-6 mt-auto">
                <div class="max-w-container mx-auto text-center text-gray-600 text-sm">
                    <p class="mb-1">&copy; ${new Date().getFullYear()} ${CONFIG.APP_NAME}. All rights reserved.</p>
                    <p>Construction Collaboration Platform for Saudi Arabia & GCC</p>
                </div>
            </footer>
        `;
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        await this.authService.logout();
        await this.renderLayout();
        this.router.navigate(CONFIG.ROUTES.HOME);
    }

    /**
     * Update navigation (call after auth state or route changes)
     */
    async updateNavigation() {
        await this.renderLayout();
    }

    /**
     * Update sidebar active state after route change (call from router if needed)
     */
    setActiveNav() {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;
        const currentPath = this.getCurrentPath();
        sidebar.querySelectorAll('.portal-nav-link').forEach(link => {
            const route = link.getAttribute('data-route');
            const active = (route === '/' || route === CONFIG.ROUTES.HOME) ? (currentPath === '/' || currentPath === '') : (currentPath === route || currentPath.startsWith(route + '/'));
            link.classList.toggle('portal-nav-active', active);
        });
    }
}

const layoutService = new LayoutService();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = layoutService;
} else {
    window.layoutService = layoutService;
}
