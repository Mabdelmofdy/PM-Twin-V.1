/**
 * Admin Settings Component
 */

async function initAdminSettings() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    
    await loadSystemInfo();
    setupSettingsForm();
}

async function loadSystemInfo() {
    try {
        const users = await dataService.getUsers();
        const opportunities = await dataService.getOpportunities();
        
        document.getElementById('total-users-count').textContent = users.length;
        document.getElementById('total-opportunities-count').textContent = opportunities.length;
    } catch (error) {
        console.error('Error loading system info:', error);
    }
}

function setupSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const settings = {
            matchingThreshold: parseFloat(formData.get('matchingThreshold')) / 100,
            autoNotifyThreshold: parseFloat(formData.get('autoNotifyThreshold')) / 100,
            sessionDuration: parseInt(formData.get('sessionDuration')) * 60 * 60 * 1000
        };
        
        try {
            // Save to system settings
            const currentSettings = storageService.get(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS) || {};
            const updatedSettings = { ...currentSettings, ...settings };
            storageService.set(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS, updatedSettings);
            
            // Update CONFIG if needed
            CONFIG.MATCHING.MIN_THRESHOLD = settings.matchingThreshold;
            CONFIG.MATCHING.AUTO_NOTIFY_THRESHOLD = settings.autoNotifyThreshold;
            CONFIG.SESSION_DURATION = settings.sessionDuration;
            
            alert('Settings saved successfully!');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        }
    });
}
