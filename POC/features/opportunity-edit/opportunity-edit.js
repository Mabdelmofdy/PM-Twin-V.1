/**
 * Opportunity Edit Component
 * Note: Function names are prefixed with 'edit' to avoid conflicts with opportunity-detail.js
 */

let editingOpportunity = null;

async function initOpportunityEdit(params) {
    const opportunityId = params?.id;
    
    if (!opportunityId) {
        editShowError('No opportunity ID provided');
        return;
    }
    
    // Load opportunity models script if not loaded
    if (!window.OPPORTUNITY_MODELS) {
        await editLoadScript('src/business-logic/models/opportunity-models.js');
    }
    
    // Load form service if not loaded
    if (!window.opportunityFormService) {
        await editLoadScript('src/services/opportunities/opportunity-form-service.js');
    }
    
    await editLoadOpportunity(opportunityId);
}

async function editLoadOpportunity(opportunityId) {
    const loadingDiv = document.getElementById('edit-loading');
    const formDiv = document.getElementById('opportunity-edit-form');
    const errorDiv = document.getElementById('edit-error');
    
    try {
        // Load opportunity
        const opportunity = await dataService.getOpportunityById(opportunityId);
        
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }
        
        // Check if current user is the owner
        const currentUser = authService.getCurrentUser();
        if (!currentUser || opportunity.creatorId !== currentUser.id) {
            // Allow admins to edit as well
            if (!authService.isAdmin()) {
                throw new Error('You do not have permission to edit this opportunity');
            }
        }
        
        editingOpportunity = opportunity;
        
        // Hide loading, show form
        loadingDiv.style.display = 'none';
        formDiv.style.display = 'block';
        
        // Populate form
        editPopulateForm(opportunity);
        
        // Setup form handlers
        editSetupFormHandlers();
        
    } catch (error) {
        console.error('Error loading opportunity:', error);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.querySelector('p').textContent = error.message || 'Failed to load opportunity';
    }
}

function editPopulateForm(opportunity) {
    const formService = window.opportunityFormService;
    
    // Set hidden ID
    document.getElementById('opportunity-id').value = opportunity.id;
    
    // Set model type (read-only display)
    const modelName = editGetModelName(opportunity.modelType);
    const subModelName = editGetSubModelName(opportunity.modelType, opportunity.subModelType);
    
    document.getElementById('model-type-display').value = modelName;
    document.getElementById('model-type').value = opportunity.modelType;
    document.getElementById('submodel-type-display').value = subModelName;
    document.getElementById('submodel-type').value = opportunity.subModelType;
    
    // Set basic fields
    document.getElementById('title').value = opportunity.title || '';
    document.getElementById('description').value = opportunity.description || '';
    document.getElementById('status').value = opportunity.status || 'draft';
    
    // Render and populate dynamic fields
    editRenderDynamicFields(opportunity);
}

function editGetModelName(modelKey) {
    const models = window.OPPORTUNITY_MODELS;
    if (models && models[modelKey]) {
        return models[modelKey].name;
    }
    return modelKey;
}

function editGetSubModelName(modelKey, subModelKey) {
    const models = window.OPPORTUNITY_MODELS;
    if (models && models[modelKey] && models[modelKey].subModels && models[modelKey].subModels[subModelKey]) {
        return models[modelKey].subModels[subModelKey].name;
    }
    return subModelKey;
}

function editRenderDynamicFields(opportunity) {
    const formService = window.opportunityFormService;
    const container = document.getElementById('dynamic-fields');
    
    if (!container || !formService) return;
    
    const attributes = formService.getAttributes(opportunity.modelType, opportunity.subModelType);
    
    if (attributes.length === 0) {
        container.innerHTML = '<p class="text-muted">No additional fields for this model.</p>';
        return;
    }
    
    // Render fields
    container.innerHTML = attributes.map(attr => 
        formService.renderField(attr)
    ).join('');
    
    // Populate field values from opportunity.attributes or opportunity.modelData
    const data = opportunity.attributes || opportunity.modelData || {};
    
    attributes.forEach(attr => {
        const field = document.getElementById(attr.key);
        if (!field) return;
        
        const value = data[attr.key];
        if (value === undefined || value === null) return;
        
        switch (attr.type) {
            case 'text':
            case 'textarea':
            case 'number':
            case 'date':
            case 'select':
                field.value = value;
                break;
            case 'boolean':
                field.checked = !!value;
                break;
            case 'tags':
            case 'multi-select':
                if (Array.isArray(value)) {
                    field.value = value.join(', ');
                } else {
                    field.value = value;
                }
                break;
            case 'currency':
                field.value = value;
                break;
            case 'currency-range':
                const minField = document.getElementById(`${attr.key}_min`);
                const maxField = document.getElementById(`${attr.key}_max`);
                if (minField && value.min !== undefined) minField.value = value.min;
                if (maxField && value.max !== undefined) maxField.value = value.max;
                break;
            case 'date-range':
                const startField = document.getElementById(`${attr.key}_start`);
                const endField = document.getElementById(`${attr.key}_end`);
                if (startField && value.start) startField.value = value.start;
                if (endField && value.end) endField.value = value.end;
                break;
            default:
                if (typeof value === 'object') {
                    field.value = JSON.stringify(value);
                } else {
                    field.value = value;
                }
        }
    });
    
    // Setup conditional fields
    const form = document.getElementById('opportunity-edit-form');
    formService.setupConditionalFields(form);
}

function editSetupFormHandlers() {
    const form = document.getElementById('opportunity-edit-form');
    const cancelBtn = document.getElementById('cancel-edit');
    
    if (!form) return;
    
    // Cancel button
    cancelBtn?.addEventListener('click', () => {
        if (editingOpportunity) {
            router.navigate(`/opportunities/${editingOpportunity.id}`);
        } else {
            router.navigate('/opportunities');
        }
    });
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorDiv = document.getElementById('form-error');
        const successDiv = document.getElementById('form-success');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        try {
            const formService = window.opportunityFormService;
            const formData = formService.collectFormData(form);
            
            // Get current user
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('You must be logged in to edit an opportunity');
            }
            
            if (!formData.title) {
                throw new Error('Title is required');
            }
            
            // Update opportunity
            const updates = {
                title: formData.title,
                description: formData.description || '',
                status: formData.status || editingOpportunity.status,
                attributes: formData, // Store all model-specific attributes
                modelData: formData   // Also store as modelData for compatibility
            };
            
            const updated = await dataService.updateOpportunity(editingOpportunity.id, updates);
            
            if (!updated) {
                throw new Error('Failed to update opportunity');
            }
            
            // Create audit log
            await dataService.createAuditLog({
                userId: user.id,
                action: 'opportunity_updated',
                entityType: 'opportunity',
                entityId: editingOpportunity.id,
                details: { title: formData.title, changes: Object.keys(updates) }
            });
            
            // Show success message
            successDiv.textContent = 'Opportunity updated successfully!';
            successDiv.style.display = 'block';
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                router.navigate(`/opportunities/${editingOpportunity.id}`);
            }, 1500);
            
        } catch (error) {
            console.error('Error updating opportunity:', error);
            errorDiv.textContent = error.message || 'Failed to update opportunity. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

function editShowError(message) {
    const loadingDiv = document.getElementById('edit-loading');
    const errorDiv = document.getElementById('edit-error');
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (errorDiv) {
        errorDiv.style.display = 'block';
        const p = errorDiv.querySelector('p');
        if (p) p.textContent = message;
    }
}

function editLoadScript(src) {
    const basePath = window.CONFIG?.BASE_PATH || '';
    const fullSrc = basePath + src;
    
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.querySelector(`script[src="${fullSrc}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = fullSrc;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
