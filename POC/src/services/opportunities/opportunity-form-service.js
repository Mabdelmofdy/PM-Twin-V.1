/**
 * Opportunity Form Service
 * Handles dynamic form generation for all opportunity models
 */

class OpportunityFormService {
    constructor() {
        this.models = window.OPPORTUNITY_MODELS || OPPORTUNITY_MODELS;
    }
    
    /**
     * Get all models
     */
    getModels() {
        return Object.keys(this.models).map(key => ({
            key,
            name: this.models[key].name,
            subModels: Object.keys(this.models[key].subModels).map(subKey => ({
                key: subKey,
                name: this.models[key].subModels[subKey].name
            }))
        }));
    }
    
    /**
     * Get attributes for a sub-model
     */
    getAttributes(modelKey, subModelKey) {
        if (!this.models[modelKey] || !this.models[modelKey].subModels[subModelKey]) {
            return [];
        }
        return this.models[modelKey].subModels[subModelKey].attributes;
    }
    
    /**
     * Render form field
     */
    renderField(attribute, value = '') {
        const { key, label, type, required, options, maxLength, min, conditional } = attribute;
        
        let fieldHTML = '';
        const requiredAttr = required ? 'required' : '';
        const maxLengthAttr = maxLength ? `maxlength="${maxLength}"` : '';
        const minAttr = min ? `min="${min}"` : '';
        
        switch (type) {
            case 'text':
                fieldHTML = `
                    <input 
                        type="text" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${value || ''}"
                        ${requiredAttr}
                        ${maxLengthAttr}
                        placeholder="${label}"
                    >
                `;
                break;
                
            case 'textarea':
                fieldHTML = `
                    <textarea 
                        id="${key}" 
                        name="${key}" 
                        class="form-textarea" 
                        ${requiredAttr}
                        ${maxLengthAttr}
                        placeholder="${label}"
                    >${value || ''}</textarea>
                `;
                break;
                
            case 'number':
                fieldHTML = `
                    <input 
                        type="number" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${value || ''}"
                        ${requiredAttr}
                        ${minAttr}
                        placeholder="${label}"
                    >
                `;
                break;
                
            case 'currency':
                fieldHTML = `
                    <input 
                        type="number" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${value || ''}"
                        ${requiredAttr}
                        ${minAttr}
                        step="0.01"
                        placeholder="${label} (SAR)"
                    >
                `;
                break;
                
            case 'currency-range':
                fieldHTML = `
                    <div class="currency-range">
                        <input 
                            type="number" 
                            id="${key}_min" 
                            name="${key}_min" 
                            class="form-input" 
                            value="${value?.min || ''}"
                            ${requiredAttr}
                            step="0.01"
                            placeholder="Min (SAR)"
                        >
                        <span>to</span>
                        <input 
                            type="number" 
                            id="${key}_max" 
                            name="${key}_max" 
                            class="form-input" 
                            value="${value?.max || ''}"
                            ${requiredAttr}
                            step="0.01"
                            placeholder="Max (SAR)"
                        >
                    </div>
                `;
                break;
                
            case 'date':
                fieldHTML = `
                    <input 
                        type="date" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${value || ''}"
                        ${requiredAttr}
                    >
                `;
                break;
                
            case 'date-range':
                fieldHTML = `
                    <div class="date-range">
                        <input 
                            type="date" 
                            id="${key}_start" 
                            name="${key}_start" 
                            class="form-input" 
                            value="${value?.start || ''}"
                            ${requiredAttr}
                        >
                        <span>to</span>
                        <input 
                            type="date" 
                            id="${key}_end" 
                            name="${key}_end" 
                            class="form-input" 
                            value="${value?.end || ''}"
                            ${requiredAttr}
                        >
                    </div>
                `;
                break;
                
            case 'select':
                const optionsHTML = options.map(opt => 
                    `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');
                fieldHTML = `
                    <select 
                        id="${key}" 
                        name="${key}" 
                        class="form-select" 
                        ${requiredAttr}
                    >
                        <option value="">Select ${label}</option>
                        ${optionsHTML}
                    </select>
                `;
                break;
                
            case 'multi-select':
                const multiOptionsHTML = options.map(opt => {
                    const selected = Array.isArray(value) && value.includes(opt) ? 'selected' : '';
                    return `<option value="${opt}" ${selected}>${opt}</option>`;
                }).join('');
                fieldHTML = `
                    <select 
                        id="${key}" 
                        name="${key}" 
                        class="form-select" 
                        multiple
                        ${requiredAttr}
                    >
                        ${multiOptionsHTML}
                    </select>
                    <small class="form-help">Hold Ctrl/Cmd to select multiple</small>
                `;
                break;
                
            case 'boolean':
                fieldHTML = `
                    <div class="form-checkbox">
                        <input 
                            type="checkbox" 
                            id="${key}" 
                            name="${key}" 
                            ${value ? 'checked' : ''}
                            ${requiredAttr}
                        >
                        <label for="${key}">${label}</label>
                    </div>
                `;
                break;
                
            case 'tags':
                const tagsValue = Array.isArray(value) ? value.join(', ') : value || '';
                fieldHTML = `
                    <input 
                        type="text" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${tagsValue}"
                        ${requiredAttr}
                        placeholder="Comma-separated values (e.g., BIM, AutoCAD, Project Management)"
                    >
                    <small class="form-help">Enter comma-separated values</small>
                `;
                break;
                
            case 'array-percentages':
                const percentagesValue = Array.isArray(value) ? value.join(', ') : value || '';
                fieldHTML = `
                    <input 
                        type="text" 
                        id="${key}" 
                        name="${key}" 
                        class="form-input" 
                        value="${percentagesValue}"
                        ${requiredAttr}
                        placeholder="Comma-separated percentages (e.g., 50, 50 or 60, 40)"
                    >
                    <small class="form-help">Enter comma-separated percentages (must sum to 100)</small>
                `;
                break;
                
            case 'array-objects':
                fieldHTML = `
                    <div id="${key}_container" class="array-objects-container">
                        ${this.renderArrayObjectsField(key, value || [])}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="opportunityFormService.addArrayObject('${key}')">
                        Add Item
                    </button>
                `;
                break;
                
            default:
                fieldHTML = `<input type="text" id="${key}" name="${key}" class="form-input" value="${value || ''}" ${requiredAttr}>`;
        }
        
        // Add conditional display logic
        let conditionalAttr = '';
        if (conditional) {
            conditionalAttr = `data-conditional-field="${conditional.field}" data-conditional-value="${conditional.value.join(',')}"`;
        }
        
        return `
            <div class="form-group" ${conditionalAttr} ${conditional ? 'style="display: none;"' : ''}>
                <label for="${key}" class="form-label">
                    ${label}
                    ${required ? '<span style="color: var(--danger-color);">*</span>' : ''}
                </label>
                ${fieldHTML}
            </div>
        `;
    }
    
    /**
     * Render array objects field
     */
    renderArrayObjectsField(key, values) {
        if (!values || values.length === 0) {
            return '<p class="text-muted">No items added yet</p>';
        }
        
        return values.map((item, index) => `
            <div class="array-object-item" data-index="${index}">
                <input type="text" name="${key}[${index}][label]" value="${item.label || ''}" placeholder="Label" class="form-input">
                <input type="text" name="${key}[${index}][value]" value="${item.value || ''}" placeholder="Value" class="form-input">
                <button type="button" class="btn btn-danger btn-sm" onclick="opportunityFormService.removeArrayObject('${key}', ${index})">Remove</button>
            </div>
        `).join('');
    }
    
    /**
     * Add array object item
     */
    addArrayObject(key) {
        const container = document.getElementById(`${key}_container`);
        if (!container) return;
        
        const index = container.querySelectorAll('.array-object-item').length;
        const itemHTML = `
            <div class="array-object-item" data-index="${index}">
                <input type="text" name="${key}[${index}][label]" placeholder="Label" class="form-input">
                <input type="text" name="${key}[${index}][value]" placeholder="Value" class="form-input">
                <button type="button" class="btn btn-danger btn-sm" onclick="opportunityFormService.removeArrayObject('${key}', ${index})">Remove</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    }
    
    /**
     * Remove array object item
     */
    removeArrayObject(key, index) {
        const container = document.getElementById(`${key}_container`);
        if (!container) return;
        
        const item = container.querySelector(`[data-index="${index}"]`);
        if (item) {
            item.remove();
            // Reindex remaining items
            container.querySelectorAll('.array-object-item').forEach((el, i) => {
                el.dataset.index = i;
                el.querySelectorAll('input').forEach(input => {
                    const name = input.name.replace(/\[\d+\]/, `[${i}]`);
                    input.name = name;
                });
            });
        }
    }
    
    /**
     * Handle conditional fields
     */
    setupConditionalFields(formElement) {
        const conditionalFields = formElement.querySelectorAll('[data-conditional-field]');
        
        conditionalFields.forEach(field => {
            const conditionalFieldName = field.dataset.conditionalField;
            const conditionalValues = field.dataset.conditionalValue.split(',');
            
            const watchField = formElement.querySelector(`[name="${conditionalFieldName}"]`);
            if (watchField) {
                const updateVisibility = () => {
                    const watchValue = watchField.type === 'checkbox' ? watchField.checked : watchField.value;
                    const shouldShow = conditionalValues.includes(watchValue);
                    field.style.display = shouldShow ? 'block' : 'none';
                };
                
                watchField.addEventListener('change', updateVisibility);
                updateVisibility(); // Initial check
            }
        });
    }
    
    /**
     * Collect form data
     */
    collectFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // Handle array notation
            if (key.includes('[')) {
                const match = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
                if (match) {
                    const [, arrayKey, index, prop] = match;
                    if (!data[arrayKey]) data[arrayKey] = [];
                    if (!data[arrayKey][index]) data[arrayKey][index] = {};
                    data[arrayKey][index][prop] = value;
                } else {
                    // Handle simple arrays
                    const match2 = key.match(/^(\w+)\[(\d+)\]$/);
                    if (match2) {
                        const [, arrayKey, index] = match2;
                        if (!data[arrayKey]) data[arrayKey] = [];
                        data[arrayKey][index] = value;
                    } else {
                        data[key] = value;
                    }
                }
            } else {
                data[key] = value;
            }
        }
        
        // Handle special field types
        Object.keys(data).forEach(key => {
            // Currency ranges
            if (data[`${key}_min`] && data[`${key}_max`]) {
                data[key] = {
                    min: parseFloat(data[`${key}_min`]),
                    max: parseFloat(data[`${key}_max`])
                };
                delete data[`${key}_min`];
                delete data[`${key}_max`];
            }
            
            // Date ranges
            if (data[`${key}_start`] && data[`${key}_end`]) {
                data[key] = {
                    start: data[`${key}_start`],
                    end: data[`${key}_end`]
                };
                delete data[`${key}_start`];
                delete data[`${key}_end`];
            }
            
            // Tags (comma-separated strings)
            if (typeof data[key] === 'string' && data[key].includes(',')) {
                const tags = data[key].split(',').map(t => t.trim()).filter(t => t);
                if (tags.length > 0) {
                    data[key] = tags;
                }
            }
            
            // Multi-select
            const selectElement = formElement.querySelector(`[name="${key}"][multiple]`);
            if (selectElement) {
                const selected = Array.from(selectElement.selectedOptions).map(opt => opt.value);
                data[key] = selected;
            }
            
            // Boolean/checkbox
            const checkboxElement = formElement.querySelector(`[name="${key}"][type="checkbox"]`);
            if (checkboxElement) {
                data[key] = checkboxElement.checked;
            }
        });
        
        return data;
    }
}

// Create singleton instance
const opportunityFormService = new OpportunityFormService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = opportunityFormService;
} else {
    window.opportunityFormService = opportunityFormService;
}
