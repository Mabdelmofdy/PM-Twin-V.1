/**
 * Application Initialization
 * Bootstraps the application
 */

/**
 * Detect base path from document location
 * This is the single source of truth for base path
 * Works whether app is served from root or subdirectory
 */
function detectBasePath() {
    // Method 1: Use document.baseURI (most reliable)
    try {
        const baseURI = new URL(document.baseURI);
        let basePath = baseURI.pathname;
        
        // Remove index.html if present
        if (basePath.endsWith('index.html')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        }
        // Ensure ends with /
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        return basePath;
    } catch (e) {
        console.warn('Could not parse document.baseURI', e);
    }
    
    // Method 2: Fallback to window.location.pathname
    let pathname = window.location.pathname;
    
    // Remove hash and query
    pathname = pathname.split('?')[0].split('#')[0];
    
    // Remove index.html if present
    if (pathname.endsWith('index.html')) {
        pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }
    
    // Ensure ends with /
    if (!pathname.endsWith('/')) {
        pathname += '/';
    }
    
    return pathname;
}

// Detect base path immediately
const APP_BASE_PATH = detectBasePath();
console.log('PMTwin App base path:', APP_BASE_PATH);

/**
 * Load script dynamically with base path
 */
function loadScript(relativeSrc) {
    const fullSrc = APP_BASE_PATH + relativeSrc;
    
    return new Promise((resolve, reject) => {
        // Check if script already loaded (check both relative and full paths)
        const existingScript = document.querySelector(`script[src="${fullSrc}"], script[src="${relativeSrc}"]`);
        if (existingScript) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = fullSrc;
        script.onload = resolve;
        script.onerror = () => {
            document.head.removeChild(script);
            reject(new Error(`Failed to load script: ${fullSrc}`));
        };
        document.head.appendChild(script);
    });
}

// Load configuration first
loadScript('src/core/config/config.js').then(async () => {
    // Ensure CONFIG has the correct BASE_PATH
    if (window.CONFIG) {
        window.CONFIG.BASE_PATH = APP_BASE_PATH;
    }
    
    // Load core services
    await loadScript('src/core/storage/storage-service.js');
    await loadScript('src/core/data/data-service.js');
    await loadScript('src/core/auth/auth-service.js');
    await loadScript('src/core/router/router.js');
    await loadScript('src/core/router/auth-guard.js');
    await loadScript('src/core/layout/layout-service.js');
    await loadScript('src/core/api/api-service.js');
    
    // Load utilities
    await loadScript('src/utils/icon-helper.js');
    await loadScript('src/utils/template-loader.js');
    await loadScript('src/utils/template-renderer.js');
    await loadScript('src/utils/modal.js');
    
    // Load business logic
    await loadScript('src/business-logic/models/opportunity-models.js');
    
    // Load services
    await loadScript('src/services/matching/matching-service.js');
    await loadScript('src/services/opportunities/opportunity-service.js');
    
    // Initialize application
    await initializeApp();
}).catch(error => {
    console.error('Failed to load configuration:', error);
});

/**
 * Initialize application
 */
async function initializeApp() {
    try {
        // Initialize storage with seed data
        await initializeStorage();
        
        // Initialize layout
        await layoutService.init();
        
        // Check authentication
        await authService.checkAuth();
        
        // Initialize router
        initializeRoutes();
        router.init();
        
        // Add global click handler for navigation links
        setupGlobalNavigation();
        
        console.log('PMTwin application initialized');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

/**
 * Initialize storage with default data
 */
async function initializeStorage() {
    const defaultData = {
        [CONFIG.STORAGE_KEYS.USERS]: [],
        [CONFIG.STORAGE_KEYS.COMPANIES]: [],
        [CONFIG.STORAGE_KEYS.SESSIONS]: [],
        [CONFIG.STORAGE_KEYS.OPPORTUNITIES]: [],
        [CONFIG.STORAGE_KEYS.APPLICATIONS]: [],
        [CONFIG.STORAGE_KEYS.MATCHES]: [],
        [CONFIG.STORAGE_KEYS.AUDIT]: [],
        [CONFIG.STORAGE_KEYS.NOTIFICATIONS]: [],
        [CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS]: {}
    };
    
    storageService.initialize(defaultData);
    
    // Initialize data from JSON seed files
    await dataService.initializeFromJSON();
    
    // Create default admin user if no admin exists
    const users = await dataService.getUsers();
    const hasAdmin = users.some(u => u.role === CONFIG.ROLES.ADMIN && u.status === 'active');
    if (!hasAdmin) {
        await createDefaultAdmin();
    }
}

/**
 * Reset all data and re-seed from JSON files
 * Can be called from browser console: window.resetAppData()
 */
async function resetAppData() {
    if (confirm('This will reset all data to default. Continue?')) {
        await dataService.reseedFromJSON();
        // Clear session
        sessionStorage.clear();
        // Reload page
        window.location.reload();
    }
}

// Expose reset function globally for debugging
window.resetAppData = resetAppData;

/**
 * Debug utility - shows app configuration
 * Can be called from browser console: window.appDebug()
 */
function appDebug() {
    console.log('=== PMTwin Debug Info ===');
    console.log('Base Path:', CONFIG.BASE_PATH);
    console.log('App Version:', CONFIG.APP_VERSION);
    console.log('Current Route:', router.getCurrentPath());
    console.log('Authenticated:', !!authService.currentUser);
    console.log('User:', authService.currentUser?.email || 'Not logged in');
    console.log('Storage Keys:', Object.keys(CONFIG.STORAGE_KEYS));
    console.log('========================');
    return {
        basePath: CONFIG.BASE_PATH,
        route: router.getCurrentPath(),
        user: authService.currentUser?.email
    };
}
window.appDebug = appDebug;

/**
 * Create default admin user
 */
async function createDefaultAdmin() {
    const adminUser = await authService.register({
        email: 'admin@pmtwin.com',
        password: 'admin123',
        role: CONFIG.ROLES.ADMIN,
        profile: {
            name: 'Platform Administrator',
            type: 'admin'
        }
    });
    
    // Auto-approve admin
    await dataService.updateUser(adminUser.id, { status: 'active' });
    
    console.log('Default admin user created: admin@pmtwin.com / admin123');
}

/**
 * Initialize routes
 */
function initializeRoutes() {
    // Home route
    router.register(CONFIG.ROUTES.HOME, async () => {
        await loadPage('home');
    });
    
    // Auth routes
    router.register(CONFIG.ROUTES.LOGIN, async () => {
        await loadPage('login');
    });
    
    router.register(CONFIG.ROUTES.REGISTER, async () => {
        await loadPage('register');
    });
    
    // Dashboard route (protected)
    router.register(CONFIG.ROUTES.DASHBOARD, authGuard.protect(async () => {
        await loadPage('dashboard');
    }));
    
    // Opportunities routes (protected)
    router.register(CONFIG.ROUTES.OPPORTUNITIES, authGuard.protect(async () => {
        await loadPage('opportunities');
    }));
    
    router.register(CONFIG.ROUTES.OPPORTUNITY_CREATE, authGuard.protect(async () => {
        await loadPage('opportunity-create');
    }));
    
    router.register('/opportunities/:id', authGuard.protect(async (params) => {
        await loadPage('opportunity-detail', params);
    }));
    
    // Edit route
    router.register('/opportunities/:id/edit', authGuard.protect(async (params) => {
        await loadPage('opportunity-edit', params);
    }));
    
    // Profile route (protected)
    router.register(CONFIG.ROUTES.PROFILE, authGuard.protect(async () => {
        await loadPage('profile');
    }));
    
    // Pipeline route (protected)
    router.register('/pipeline', authGuard.protect(async () => {
        await loadPage('pipeline');
    }));
    
    // People routes (accessible to all users)
    router.register('/people', authGuard.protect(async () => {
        await loadPage('people');
    }));
    
    router.register('/people/:id', authGuard.protect(async (params) => {
        await loadPage('person-profile', params);
    }));
    
    router.register(CONFIG.ROUTES.MESSAGES, authGuard.protect(async () => {
        await loadPage('messages', {});
    }));
    
    router.register('/messages/:id', authGuard.protect(async (params) => {
        await loadPage('messages', params);
    }));
    
    // Admin routes (protected, admin only)
    router.register(CONFIG.ROUTES.ADMIN, authGuard.protect(async () => {
        if (!authService.isAdmin()) {
            router.navigate(CONFIG.ROUTES.DASHBOARD);
            return;
        }
        await loadPage('admin-dashboard');
    }, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR]));
    
    router.register(CONFIG.ROUTES.ADMIN_USERS, authGuard.protect(async () => {
        if (!authService.isAdmin()) {
            router.navigate(CONFIG.ROUTES.DASHBOARD);
            return;
        }
        await loadPage('admin-users');
    }, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR]));
    
    router.register(CONFIG.ROUTES.ADMIN_OPPORTUNITIES, authGuard.protect(async () => {
        if (!authService.isAdmin()) {
            router.navigate(CONFIG.ROUTES.DASHBOARD);
            return;
        }
        await loadPage('admin-opportunities');
    }, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR]));
    
    router.register(CONFIG.ROUTES.ADMIN_AUDIT, authGuard.protect(async () => {
        if (!authService.isAdmin()) {
            router.navigate(CONFIG.ROUTES.DASHBOARD);
            return;
        }
        await loadPage('admin-audit');
    }, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR, CONFIG.ROLES.AUDITOR]));
    
    router.register(CONFIG.ROUTES.ADMIN_SETTINGS, authGuard.protect(async () => {
        if (!authService.isAdmin()) {
            router.navigate(CONFIG.ROUTES.DASHBOARD);
            return;
        }
        await loadPage('admin-settings');
    }, [CONFIG.ROLES.ADMIN]));
}

/**
 * Setup global navigation handler
 */
function setupGlobalNavigation() {
    // Use event delegation on document body to catch all links
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-route]');
        if (link) {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            if (route) {
                router.navigate(route);
            }
        }
    });
}

/**
 * Load page content
 * Uses CONFIG.BASE_PATH for correct path resolution
 */
async function loadPage(pageName, params = {}) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // Get base path from CONFIG (set during initialization)
    const basePath = window.CONFIG?.BASE_PATH || APP_BASE_PATH || '';
    
    try {
        // Load page HTML using base path
        const pagePath = `${basePath}pages/${pageName}/index.html`;
        const response = await fetch(pagePath);
        if (!response.ok) {
            throw new Error(`Page not found: ${pageName}`);
        }
        const html = await response.text();
        
        // Set content
        mainContent.innerHTML = html;
        
        // Load page script if exists (loadScript already uses base path)
        const scriptPath = `features/${pageName}/${pageName}.js`;
        try {
            await loadScript(scriptPath);
            // Initialize page - convert kebab-case to camelCase for function name
            const functionName = pageName.split('-').map((word, index) => 
                index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            ).join('');
            const initFunctionName = `init${functionName.charAt(0).toUpperCase() + functionName.slice(1)}`;
            
            if (window[initFunctionName]) {
                window[initFunctionName](params);
            }
        } catch (error) {
            // Script doesn't exist, that's okay
            console.log(`No script found for ${pageName}`);
        }
    } catch (error) {
        console.error(`Error loading page ${pageName}:`, error);
        mainContent.innerHTML = `<div class="error">Page not found: ${pageName}</div>`;
    }
}
