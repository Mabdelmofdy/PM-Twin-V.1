/**
 * Application Initialization
 * Bootstraps the application
 */

// Load configuration first
const configScript = document.createElement('script');
configScript.src = 'src/core/config/config.js';
document.head.appendChild(configScript);

// Wait for config to load, then initialize
configScript.onload = async () => {
    // Load core services
    await loadScript('src/core/storage/storage-service.js');
    await loadScript('src/core/data/data-service.js');
    await loadScript('src/core/auth/auth-service.js');
    await loadScript('src/core/router/router.js');
    await loadScript('src/core/router/auth-guard.js');
    await loadScript('src/core/layout/layout-service.js');
    await loadScript('src/core/api/api-service.js');
    
    // Load business logic
    await loadScript('src/business-logic/models/opportunity-models.js');
    
    // Load services
    await loadScript('src/services/matching/matching-service.js');
    await loadScript('src/services/opportunities/opportunity-service.js');
    
    // Initialize application
    await initializeApp();
};

/**
 * Load script dynamically
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

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
        [CONFIG.STORAGE_KEYS.SESSIONS]: [],
        [CONFIG.STORAGE_KEYS.OPPORTUNITIES]: [],
        [CONFIG.STORAGE_KEYS.APPLICATIONS]: [],
        [CONFIG.STORAGE_KEYS.MATCHES]: [],
        [CONFIG.STORAGE_KEYS.AUDIT]: [],
        [CONFIG.STORAGE_KEYS.NOTIFICATIONS]: [],
        [CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS]: {}
    };
    
    storageService.initialize(defaultData);
    
    // Create default admin user if no users exist
    const users = await dataService.getUsers();
    if (users.length === 0) {
        await createDefaultAdmin();
    }
}

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
 * Load page content
 */
async function loadPage(pageName, params = {}) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    try {
        // Load page HTML
        const response = await fetch(`pages/${pageName}/index.html`);
        if (!response.ok) {
            throw new Error(`Page not found: ${pageName}`);
        }
        const html = await response.text();
        
        // Set content
        mainContent.innerHTML = html;
        
        // Load page script if exists
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
