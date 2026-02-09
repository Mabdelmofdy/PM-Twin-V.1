/**
 * Admin Collaboration Models Management
 * Toggle enabled/disabled, set display label and order for CONFIG.MODELS; stored in SYSTEM_SETTINGS.
 */

function getDefaultModelName(modelKey) {
    const models = window.OPPORTUNITY_MODELS || {};
    return (models[modelKey] && models[modelKey].name) || modelKey.replace(/_/g, ' ');
}

function getOverrides() {
    const settings = storageService.get(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS) || {};
    return settings.collaborationModels || {};
}

function saveOverrides(overrides) {
    const settings = storageService.get(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS) || {};
    settings.collaborationModels = overrides;
    storageService.set(CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS, settings);
}

async function initAdminCollaborationModels() {
    if (!authService.hasRole(CONFIG.ROLES.ADMIN)) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }

    renderModelsList();
    document.getElementById('save-models-btn')?.addEventListener('click', saveModels);
}

function renderModelsList() {
    const container = document.getElementById('models-list');
    if (!container) return;

    const overrides = getOverrides();
    const modelKeys = Object.keys(CONFIG.MODELS);

    if (modelKeys.length === 0) {
        container.innerHTML = '<p class="text-muted">No collaboration models defined in config.</p>';
        return;
    }

    container.innerHTML = modelKeys.map((key, index) => {
        const o = overrides[key] || {};
        const enabled = o.enabled !== false;
        const label = o.label !== undefined ? o.label : getDefaultModelName(key);
        const order = o.order !== undefined ? o.order : index + 1;
        return `
        <div class="model-row" data-key="${key}">
            <label>
                <input type="checkbox" data-field="enabled" ${enabled ? 'checked' : ''}>
                <span>Enabled</span>
            </label>
            <input type="text" data-field="label" value="${(label || '').replace(/"/g, '&quot;')}" placeholder="Display name">
            <input type="number" data-field="order" min="1" value="${order}" placeholder="Order" style="width: 80px;">
        </div>
        `;
    }).join('');
}

function saveModels() {
    const container = document.getElementById('models-list');
    if (!container) return;

    const overrides = {};
    container.querySelectorAll('.model-row').forEach(row => {
        const key = row.dataset.key;
        const enabledEl = row.querySelector('[data-field="enabled"]');
        const labelEl = row.querySelector('[data-field="label"]');
        const orderEl = row.querySelector('[data-field="order"]');
        const enabled = enabledEl ? enabledEl.checked : true;
        const label = labelEl ? labelEl.value.trim() : '';
        const order = orderEl ? parseInt(orderEl.value, 10) : 1;

        const defaultName = getDefaultModelName(key);
        overrides[key] = {
            enabled,
            label: label || defaultName,
            order: isNaN(order) ? 1 : order
        };
    });

    saveOverrides(overrides);

    const admin = authService.getCurrentUser();
    if (admin && dataService.createAuditLog) {
        dataService.createAuditLog({
            userId: admin.id,
            action: 'collaboration_models_updated',
            entityType: 'system',
            entityId: 'settings',
            details: { keys: Object.keys(overrides) }
        });
    }

    alert('Collaboration model settings saved.');
}
