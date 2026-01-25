/**
 * Opportunity Create Component
 */

let currentModel = null;
let currentSubModel = null;

async function initOpportunityCreate() {
    // Load opportunity models script if not loaded
    if (!window.OPPORTUNITY_MODELS) {
        await loadScript('src/business-logic/models/opportunity-models.js');
    }
    
    // Load form service if not loaded
    if (!window.opportunityFormService) {
        await loadScript('src/services/opportunities/opportunity-form-service.js');
    }
    
    await initializeForm();
    setupFormHandlers();
}

async function initializeForm() {
    const modelSelect = document.getElementById('model-type');
    const subModelSelect = document.getElementById('submodel-type');
    const formService = window.opportunityFormService;
    
    if (!modelSelect || !formService) return;
    
    // Populate model options
    const models = formService.getModels();
    modelSelect.innerHTML = '<option value="">Select a model...</option>' +
        models.map(m => `<option value="${m.key}">${m.name}</option>`).join('');
    
    // Handle model selection
    modelSelect.addEventListener('change', (e) => {
        const modelKey = e.target.value;
        currentModel = modelKey;
        
        if (modelKey) {
            const model = models.find(m => m.key === modelKey);
            if (model) {
                // Populate sub-model options
                subModelSelect.innerHTML = '<option value="">Select a sub-model...</option>' +
                    model.subModels.map(sm => `<option value="${sm.key}">${sm.name}</option>`).join('');
                
                document.getElementById('submodel-group').style.display = 'block';
            }
        } else {
            document.getElementById('submodel-group').style.display = 'none';
            document.getElementById('dynamic-fields').innerHTML = '<p class="text-muted">Please select a model and sub-model to see specific fields.</p>';
        }
    });
    
    // Handle sub-model selection
    subModelSelect.addEventListener('change', (e) => {
        const subModelKey = e.target.value;
        currentSubModel = subModelKey;
        
        if (currentModel && subModelKey) {
            renderDynamicFields(currentModel, subModelKey);
        }
    });
}

function renderDynamicFields(modelKey, subModelKey) {
    const formService = window.opportunityFormService;
    const container = document.getElementById('dynamic-fields');
    
    if (!container || !formService) return;
    
    const attributes = formService.getAttributes(modelKey, subModelKey);
    
    if (attributes.length === 0) {
        container.innerHTML = '<p class="text-muted">No additional fields required for this model.</p>';
        return;
    }
    
    container.innerHTML = attributes.map(attr => 
        formService.renderField(attr)
    ).join('');
    
    // Setup conditional fields
    const form = document.getElementById('opportunity-form');
    formService.setupConditionalFields(form);
}

function setupFormHandlers() {
    const form = document.getElementById('opportunity-form');
    if (!form) return;
    
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
                throw new Error('You must be logged in to create an opportunity');
            }
            
            // Validate required fields
            if (!formData.modelType || !formData.subModelType) {
                throw new Error('Please select a model and sub-model');
            }
            
            if (!formData.title) {
                throw new Error('Title is required');
            }
            
            // Create opportunity using service
            const oppService = window.opportunityService;
            const opportunity = await oppService.createOpportunity({
                title: formData.title,
                description: formData.description || '',
                modelType: formData.modelType,
                subModelType: formData.subModelType,
                status: formData.status || 'draft',
                creatorId: user.id,
                attributes: formData // Store all model-specific attributes
            });
            
            // Create audit log
            await dataService.createAuditLog({
                userId: user.id,
                action: 'opportunity_created',
                entityType: 'opportunity',
                entityId: opportunity.id,
                details: { title: opportunity.title, modelType: opportunity.modelType }
            });
            
            // Show success message
            successDiv.textContent = 'Opportunity created successfully!';
            successDiv.style.display = 'block';
            
            // Redirect after 2 seconds
            setTimeout(() => {
                router.navigate(`/opportunities/${opportunity.id}`);
            }, 2000);
            
        } catch (error) {
            console.error('Error creating opportunity:', error);
            errorDiv.textContent = error.message || 'Failed to create opportunity. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
