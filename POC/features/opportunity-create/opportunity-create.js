/**
 * Opportunity Create Component - Wizard Flow
 */

let currentModel = null;
let currentSubModel = null;
let currentStep = 1;
let allModels = [];
let allLocations = [];

// Initialize shared data object if it doesn't exist
if (!window.opportunityFormData) {
    window.opportunityFormData = {
        lookupsData: null,
        locationsData: null
    };
}

// Helper functions to get/set shared data
function getLookupsData() {
    return window.opportunityFormData.lookupsData;
}

function setLookupsData(data) {
    window.opportunityFormData.lookupsData = data;
}

function getLocationsData() {
    return window.opportunityFormData.locationsData;
}

function setLocationsData(data) {
    window.opportunityFormData.locationsData = data;
}

async function initOpportunityCreate() {
    // Load data files
    await loadDataFiles();
    
    // Load opportunity models script if not loaded
    if (!window.OPPORTUNITY_MODELS) {
        await loadScript('src/business-logic/models/opportunity-models.js');
    }
    
    // Load form service if not loaded
    if (!window.opportunityFormService) {
        await loadScript('src/services/opportunities/opportunity-form-service.js');
    }
    
    await initializeForm();
    setupWizardNavigation();
    setupFormHandlers();
    setupDemoDataFiller();
    
    // Load rich text editor utility
    await loadScript('src/utils/rich-text-editor.js');
    
    // Initialize rich text editors
    setTimeout(() => {
        if (window.RichTextEditor) {
            window.RichTextEditor.initAll();
        }
    }, 200);
}

async function loadDataFiles() {
    try {
        // Use shared data if already loaded
        if (getLookupsData() && getLocationsData()) {
            flattenLocations();
            return;
        }
        
        const [lookupsRes, locationsRes] = await Promise.all([
            fetch('data/lookups.json'),
            fetch('data/locations.json')
        ]);
        
        const loadedLookups = await lookupsRes.json();
        const loadedLocations = await locationsRes.json();
        
        // Store in shared data object
        setLookupsData(loadedLookups);
        setLocationsData(loadedLocations);
        
        // Flatten locations for search
        flattenLocations();
    } catch (error) {
        console.error('Error loading data files:', error);
    }
}

function flattenLocations() {
    // No longer needed - we'll use cascading dropdowns instead
    allLocations = getLocationsData();
}

async function initializeForm() {
    const formService = window.opportunityFormService;
    
    if (!formService) return;
    
    // Build flat list of all sub-models with their parent info
    const models = formService.getModels();
    allModels = [];
    
    models.forEach(model => {
        model.subModels.forEach(subModel => {
            allModels.push({
                modelKey: model.key,
                modelName: model.name,
                subModelKey: subModel.key,
                subModelName: subModel.name,
                searchText: `${model.name} ${subModel.name}`.toLowerCase()
            });
        });
    });
    
    setupSearchableModelSelector();
    setupLocationSearch();
    setupExchangeModeSelection();
}

function setupWizardNavigation() {
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const submitBtn = document.getElementById('submit-form');
    
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            goToStep(currentStep + 1);
        }
    });
    
    prevBtn.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });
    
    updateWizardUI();
}

function validateCurrentStep() {
    const errorDiv = document.getElementById('form-error');
    errorDiv.classList.add('hidden');
    
    switch (currentStep) {
        case 1:
            const modelType = document.getElementById('model-type').value;
            const subModelType = document.getElementById('submodel-type').value;
            if (!modelType || !subModelType) {
                showError('Please select a collaboration model');
                return false;
            }
            break;
            
        case 2:
            const title = document.getElementById('title').value.trim();
            const country = document.getElementById('location-country').value;
            const region = document.getElementById('location-region').value;
            const city = document.getElementById('location-city').value;
            if (!title) {
                showError('Title is required');
                return false;
            }
            if (!country) {
                showError('Country is required');
                return false;
            }
            if (!region) {
                showError('Region is required');
                return false;
            }
            if (country !== 'remote' && !city) {
                showError('City is required');
                return false;
            }
            break;
            
        case 3:
            // Validate dynamic fields in step 3
            const step3Content = document.getElementById('step-3');
            if (step3Content && !step3Content.classList.contains('hidden')) {
                const requiredFields = step3Content.querySelectorAll('[required]');
                for (let field of requiredFields) {
                    if (field.type === 'checkbox') {
                        if (!field.checked && !field.closest('.hidden')) {
                            showError(`${field.labels?.[0]?.textContent || 'This field'} is required`);
                            field.focus();
                            return false;
                        }
                    } else if (field.type === 'number') {
                        // Handle currency-range fields (min/max)
                        if (field.name && field.name.includes('_min') || field.name.includes('_max')) {
                            const baseName = field.name.replace('_min', '').replace('_max', '');
                            const minField = step3Content.querySelector(`[name="${baseName}_min"]`);
                            const maxField = step3Content.querySelector(`[name="${baseName}_max"]`);
                            if (minField && maxField && (!minField.value || !maxField.value)) {
                                showError(`${baseName.replace(/([A-Z])/g, ' $1').trim()} range is required`);
                                if (!minField.value) minField.focus();
                                else maxField.focus();
                                return false;
                            }
                        } else if (!field.value && field.value !== '0') {
                            showError(`${field.labels?.[0]?.textContent || field.placeholder || 'This field'} is required`);
                            field.focus();
                            return false;
                        }
                    } else if (!field.value || (field.value.trim && field.value.trim() === '')) {
                        showError(`${field.labels?.[0]?.textContent || field.placeholder || 'This field'} is required`);
                        field.focus();
                        return false;
                    }
                }
            }
            break;
            
        case 4:
            // Budget range validation
            const budgetMin = document.getElementById('budgetRange_min')?.value;
            const budgetMax = document.getElementById('budgetRange_max')?.value;
            
            if (!budgetMin || parseFloat(budgetMin) <= 0) {
                showError('Minimum budget is required');
                document.getElementById('budgetRange_min')?.focus();
                return false;
            }
            if (!budgetMax || parseFloat(budgetMax) <= 0) {
                showError('Maximum budget is required');
                document.getElementById('budgetRange_max')?.focus();
                return false;
            }
            if (parseFloat(budgetMin) > parseFloat(budgetMax)) {
                showError('Minimum budget cannot be greater than maximum budget');
                document.getElementById('budgetRange_min')?.focus();
                return false;
            }
            
            // Exchange mode validation
            const exchangeModeInput = document.getElementById('exchange-mode');
            const exchangeMode = exchangeModeInput?.value;
            const exchangeAgreement = document.getElementById('exchange-agreement')?.checked;
            if (!exchangeMode) {
                showError('Exchange mode is required');
                return false;
            }
            if (!exchangeAgreement) {
                showError('Please agree to the exchange terms');
                return false;
            }
            
            // Validate mode-specific required fields
            if (exchangeMode === 'cash' || exchangeMode === 'hybrid') {
                const currency = document.getElementById('currency').value;
                if (!currency) {
                    showError('Currency is required for cash/hybrid exchange modes');
                    return false;
                }
            }
            
            if (exchangeMode === 'cash') {
                const cashAmount = document.getElementById('cash-amount').value;
                const cashPaymentTerms = document.getElementById('cash-payment-terms').value;
                if (!cashAmount) {
                    showError('Cash amount is required');
                    return false;
                }
                if (!cashPaymentTerms) {
                    showError('Payment terms are required');
                    return false;
                }
            }
            
            if (exchangeMode === 'equity') {
                const equityPercentage = document.getElementById('equity-percentage').value;
                if (!equityPercentage) {
                    showError('Equity percentage is required');
                    return false;
                }
            }
            
            if (exchangeMode === 'profit_sharing') {
                const profitSplit = document.getElementById('profit-split').value;
                if (!profitSplit) {
                    showError('Profit split percentage is required');
                    return false;
                }
            }
            
            if (exchangeMode === 'barter') {
                const barterOffer = document.getElementById('barter-offer').value;
                const barterNeed = document.getElementById('barter-need').value;
                if (!barterOffer) {
                    showError('Barter offer description is required');
                    return false;
                }
                if (!barterNeed) {
                    showError('Barter need description is required');
                    return false;
                }
            }
            
            if (exchangeMode === 'hybrid') {
                const hybridCash = document.getElementById('hybrid-cash').value;
                const hybridEquity = document.getElementById('hybrid-equity').value;
                const hybridBarter = document.getElementById('hybrid-barter').value;
                const total = parseFloat(hybridCash || 0) + parseFloat(hybridEquity || 0) + parseFloat(hybridBarter || 0);
                if (total !== 100) {
                    showError('Hybrid percentages must sum to 100%');
                    return false;
                }
            }
            break;
            
        case 5:
            const status = document.getElementById('status').value;
            if (!status) {
                showError('Please select a status (Draft or Published)');
                return false;
            }
            break;
    }
    
    return true;
}

function goToStep(step) {
    if (step < 1 || step > 5) return;
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    
    // Show new step
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    
    // Update wizard progress
    updateWizardUI();
    
    // Load dynamic fields if step 3
    if (currentStep === 3 && currentModel && currentSubModel) {
        // Re-render fields to ensure they're properly initialized when step becomes visible
        // Preserve values to avoid clearing filled demo data
        // Rich text editors will be initialized by renderDynamicFields
        renderDynamicFields(currentModel, currentSubModel, true);
    }
    
    // Initialize exchange mode selection if step 4
    if (currentStep === 4) {
        // Exchange mode selection is already initialized, but ensure it's ready
        const exchangeModeInput = document.getElementById('exchange-mode');
        if (exchangeModeInput && !exchangeModeInput.value) {
            // Reset exchange mode fields if no selection
            document.getElementById('exchange-mode-fields').innerHTML = 
                '<p class="text-gray-500 italic">Please select an exchange mode to see specific fields.</p>';
        }
    }
    
    // Initialize status field if step 5
    if (currentStep === 5) {
        // Set default status to draft if not set
        const statusField = document.getElementById('status');
        if (statusField && !statusField.value) {
            statusField.value = 'draft';
        }
    }
    
    // Initialize rich text editors for fields in the current visible step
    setTimeout(() => {
        if (window.RichTextEditor && typeof Quill !== 'undefined') {
            // Get current step container
            const currentStepContainer = document.getElementById(`step-${currentStep}`);
            if (currentStepContainer) {
                // Find all textareas with data-rich-text in the current step
                const textareas = currentStepContainer.querySelectorAll('textarea[data-rich-text="true"]');
                textareas.forEach(textarea => {
                    if (!window.RichTextEditor.get(textarea.id)) {
                        console.log(`Initializing rich text editor for ${textarea.id} in step ${currentStep}`);
                        window.RichTextEditor.init(textarea.id);
                        // Set content if textarea has value
                        if (textarea.value) {
                            setTimeout(() => {
                                window.RichTextEditor.setContent(textarea.id, textarea.value);
                            }, 100);
                        }
                    }
                });
            }
        }
    }, 200);
}

function updateWizardUI() {
    const steps = document.querySelectorAll('.wizard-step');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const submitBtn = document.getElementById('submit-form');
    
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update buttons
    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.classList.toggle('hidden', currentStep === 5);
    submitBtn.classList.toggle('hidden', currentStep !== 5);
}

function setupSearchableModelSelector() {
    const searchInput = document.getElementById('model-search');
    const dropdown = document.getElementById('model-dropdown');
    const dropdownContent = dropdown.querySelector('.model-dropdown-content');
    const selectedDisplay = document.getElementById('selected-model-display');
    const clearButton = document.getElementById('clear-model-selection');
    const modelTypeInput = document.getElementById('model-type');
    const subModelTypeInput = document.getElementById('submodel-type');
    
    let selectedIndex = -1;
    
    function renderDropdown(searchTerm = '') {
        const term = searchTerm.toLowerCase();
        const filteredModels = term ? 
            allModels.filter(m => m.searchText.includes(term)) : 
            allModels;
        
        if (filteredModels.length === 0) {
            dropdownContent.innerHTML = '<div class="no-results">No matching collaboration models found</div>';
            return;
        }
        
        const grouped = {};
        filteredModels.forEach(model => {
            if (!grouped[model.modelName]) {
                grouped[model.modelName] = [];
            }
            grouped[model.modelName].push(model);
        });
        
        let html = '';
        Object.keys(grouped).forEach(modelName => {
            html += `<div class="model-group">`;
            html += `<div class="model-group-header">${modelName}</div>`;
            grouped[modelName].forEach(model => {
                html += `
                    <div class="model-option" data-model-key="${model.modelKey}" data-submodel-key="${model.subModelKey}">
                        <div class="model-option-name">${model.subModelName}</div>
                        <div class="model-option-description">${model.modelName}</div>
                    </div>
                `;
            });
            html += `</div>`;
        });
        
        dropdownContent.innerHTML = html;
        selectedIndex = -1;
        
        dropdownContent.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', () => {
                selectModel(option.dataset.modelKey, option.dataset.submodelKey);
            });
        });
    }
    
    function selectModel(modelKey, subModelKey) {
        const model = allModels.find(m => m.modelKey === modelKey && m.subModelKey === subModelKey);
        if (!model) return;
        
        currentModel = modelKey;
        currentSubModel = subModelKey;
        
        modelTypeInput.value = modelKey;
        subModelTypeInput.value = subModelKey;
        
        document.getElementById('selected-model-name').textContent = model.subModelName;
        document.getElementById('selected-model-category').textContent = `Category: ${model.modelName}`;
        
        dropdown.classList.add('hidden');
        selectedDisplay.classList.remove('hidden');
        searchInput.value = '';
        searchInput.disabled = true;
    }
    
    clearButton.addEventListener('click', () => {
        currentModel = null;
        currentSubModel = null;
        modelTypeInput.value = '';
        subModelTypeInput.value = '';
        selectedDisplay.classList.add('hidden');
        searchInput.disabled = false;
        searchInput.focus();
    });
    
    searchInput.addEventListener('focus', () => {
        if (!searchInput.disabled) {
            renderDropdown(searchInput.value);
            dropdown.classList.remove('hidden');
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        renderDropdown(e.target.value);
        dropdown.classList.remove('hidden');
    });
    
    searchInput.addEventListener('keydown', (e) => {
        const options = dropdownContent.querySelectorAll('.model-option');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
            updateHighlight(options);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateHighlight(options);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const selectedOption = options[selectedIndex];
            selectModel(selectedOption.dataset.modelKey, selectedOption.dataset.submodelKey);
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
        }
    });
    
    function updateHighlight(options) {
        options.forEach((opt, idx) => {
            if (idx === selectedIndex) {
                opt.classList.add('highlighted');
                opt.scrollIntoView({ block: 'nearest' });
            } else {
                opt.classList.remove('highlighted');
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

function setupLocationSearch() {
    const countrySearch = document.getElementById('location-country-search');
    const countryInput = document.getElementById('location-country');
    const countryDropdown = document.getElementById('location-country-dropdown');
    const countryDisplay = document.getElementById('location-country-display');
    
    const regionSearch = document.getElementById('location-region-search');
    const regionInput = document.getElementById('location-region');
    const regionDropdown = document.getElementById('location-region-dropdown');
    const regionDisplay = document.getElementById('location-region-display');
    
    const citySearch = document.getElementById('location-city-search');
    const cityInput = document.getElementById('location-city');
    const cityDropdown = document.getElementById('location-city-dropdown');
    const cityDisplay = document.getElementById('location-city-display');
    
    const districtSearch = document.getElementById('location-district-search');
    const districtInput = document.getElementById('location-district');
    const districtDropdown = document.getElementById('location-district-dropdown');
    const districtDisplay = document.getElementById('location-district-display');
    
    const locationInput = document.getElementById('location');
    
    let selectedCountry = null;
    let selectedRegion = null;
    let selectedCity = null;
    let selectedDistrict = null;
    
    // Setup searchable dropdown helper
    function setupSearchableDropdown(searchInput, hiddenInput, dropdown, display, items, onSelect) {
        // Store items for later use
        searchInput.dataset.items = JSON.stringify(items);
        
        // Check if already initialized - if so, just update items
        if (searchInput.dataset.initialized === 'true') {
            return;
        }
        
        searchInput.dataset.initialized = 'true';
        
        let selectedIndex = -1;
        let filteredItems = [];
        
        function renderDropdown(searchTerm = '') {
            const currentItems = JSON.parse(searchInput.dataset.items || '[]');
            const term = searchTerm.toLowerCase();
            filteredItems = term ? 
                currentItems.filter(item => item.name.toLowerCase().includes(term)) : 
                currentItems;
            
            if (filteredItems.length === 0) {
                dropdown.querySelector('.searchable-dropdown-content').innerHTML = 
                    '<div class="p-4 text-center text-gray-500">No results found</div>';
                return;
            }
            
            const html = filteredItems.map((item, idx) => `
                <div class="searchable-dropdown-item" data-index="${idx}" data-value="${item.id || item.name}">
                    ${item.name}
                </div>
            `).join('');
            
            dropdown.querySelector('.searchable-dropdown-content').innerHTML = html;
            selectedIndex = -1;
            
            dropdown.querySelectorAll('.searchable-dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const selectedItem = filteredItems[parseInt(item.dataset.index)];
                    onSelect(selectedItem);
                });
            });
        }
        
        searchInput.addEventListener('focus', () => {
            if (!searchInput.disabled) {
                renderDropdown(searchInput.value);
                dropdown.classList.remove('hidden');
            }
        });
        
        searchInput.addEventListener('input', (e) => {
            renderDropdown(e.target.value);
            dropdown.classList.remove('hidden');
        });
        
        searchInput.addEventListener('keydown', (e) => {
            const options = dropdown.querySelectorAll('.searchable-dropdown-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
                updateHighlight(options);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateHighlight(options);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selectedOption = options[selectedIndex];
                const selectedItem = filteredItems[parseInt(selectedOption.dataset.index)];
                onSelect(selectedItem);
            } else if (e.key === 'Escape') {
                dropdown.classList.add('hidden');
            }
        });
        
        function updateHighlight(options) {
            options.forEach((opt, idx) => {
                if (idx === selectedIndex) {
                    opt.classList.add('highlighted');
                    opt.scrollIntoView({ block: 'nearest' });
                } else {
                    opt.classList.remove('highlighted');
                }
            });
        }
        
        const clickHandler = (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        };
        
        document.addEventListener('click', clickHandler);
    }
    
    // Country selection
        const locations = getLocationsData();
        if (!locations || !locations.countries) return;
        const countries = locations.countries.map(c => ({ id: c.id, name: c.name }));
    setupSearchableDropdown(
        countrySearch,
        countryInput,
        countryDropdown,
        countryDisplay,
        countries,
        (country) => {
            selectedCountry = country;
            countryInput.value = country.id;
            countrySearch.value = '';
            countrySearch.disabled = true;
            countryDisplay.querySelector('#location-country-name').textContent = country.name;
            countryDisplay.classList.remove('hidden');
            countryDropdown.classList.add('hidden');
            
            // Enable and populate regions
            enableRegionSearch();
            clearCitySelection();
            clearDistrictSelection();
            updateLocationString();
        }
    );
    
    // Clear functions
    function clearCitySelection() {
        selectedCity = null;
        cityInput.value = '';
        citySearch.value = '';
        citySearch.disabled = true;
        citySearch.classList.add('bg-gray-50');
        citySearch.placeholder = 'Select region first...';
        cityDisplay.classList.add('hidden');
        cityDropdown.classList.add('hidden');
        citySearch.dataset.initialized = 'false';
    }
    
    function clearDistrictSelection() {
        selectedDistrict = null;
        districtInput.value = '';
        districtSearch.value = '';
        districtSearch.disabled = true;
        districtSearch.classList.add('bg-gray-50');
        districtSearch.placeholder = 'Select city first...';
        districtDisplay.classList.add('hidden');
        districtDropdown.classList.add('hidden');
        districtSearch.dataset.initialized = 'false';
    }
    
    function clearRegionSelection() {
        selectedRegion = null;
        regionInput.value = '';
        regionSearch.value = '';
        regionSearch.disabled = true;
        regionSearch.classList.add('bg-gray-50');
        regionSearch.placeholder = 'Select country first...';
        regionDisplay.classList.add('hidden');
        regionDropdown.classList.add('hidden');
        regionSearch.dataset.initialized = 'false';
        clearCitySelection();
        clearDistrictSelection();
        updateLocationString();
    }
    
    // Region selection
    function enableRegionSearch() {
        if (!selectedCountry) return;
        
        const locations = getLocationsData();
        if (!locations || !locations.countries) return;
        const country = locations.countries.find(c => c.id === selectedCountry.id);
        if (!country) return;
        
        if (selectedCountry.id === 'remote') {
            // Handle remote
            selectedRegion = { id: 'remote', name: 'Remote' };
            regionInput.value = 'remote';
            regionSearch.value = 'Remote';
            regionSearch.disabled = true;
            regionDisplay.querySelector('#location-region-name').textContent = 'Remote';
            regionDisplay.classList.remove('hidden');
            updateLocationString();
            return;
        }
        
        const regions = (country.regions || []).map(r => ({ id: r.id, name: r.name }));
        
        regionSearch.disabled = false;
        regionSearch.classList.remove('bg-gray-50');
        regionSearch.placeholder = 'Search region...';
        regionSearch.value = '';
        
        setupSearchableDropdown(
            regionSearch,
            regionInput,
            regionDropdown,
            regionDisplay,
            regions,
            (region) => {
                selectedRegion = region;
                regionInput.value = region.id;
                regionSearch.value = '';
                regionSearch.disabled = true;
                regionDisplay.querySelector('#location-region-name').textContent = region.name;
                regionDisplay.classList.remove('hidden');
                regionDropdown.classList.add('hidden');
                
                // Enable and populate cities
                enableCitySearch();
                clearDistrictSelection();
                updateLocationString();
            }
        );
    }
    
    // City selection
    function enableCitySearch() {
        if (!selectedCountry || !selectedRegion) return;
        
        const locations = getLocationsData();
        if (!locations || !locations.countries) return;
        const country = locations.countries.find(c => c.id === selectedCountry.id);
        if (!country) return;
        
        const region = country.regions?.find(r => r.id === selectedRegion.id);
        if (!region || !region.cities || region.cities.length === 0) return;
        
        const cities = region.cities.map(c => ({ id: c.id, name: c.name }));
        
        citySearch.disabled = false;
        citySearch.classList.remove('bg-gray-50');
        citySearch.placeholder = 'Search city...';
        citySearch.value = '';
        
        setupSearchableDropdown(
            citySearch,
            cityInput,
            cityDropdown,
            cityDisplay,
            cities,
            (city) => {
                selectedCity = city;
                cityInput.value = city.id;
                citySearch.value = '';
                citySearch.disabled = true;
                cityDisplay.querySelector('#location-city-name').textContent = city.name;
                cityDisplay.classList.remove('hidden');
                cityDropdown.classList.add('hidden');
                
                // Enable and populate districts
                enableDistrictSearch();
                updateLocationString();
            }
        );
    }
    
    // District selection
    function enableDistrictSearch() {
        if (!selectedCountry || !selectedRegion || !selectedCity) return;
        
        const locations = getLocationsData();
        if (!locations || !locations.countries) return;
        const country = locations.countries.find(c => c.id === selectedCountry.id);
        if (!country) return;
        
        const region = country.regions?.find(r => r.id === selectedRegion.id);
        if (!region) return;
        
        const city = region.cities?.find(c => c.id === selectedCity.id);
        if (!city || !city.districts || city.districts.length === 0) {
            districtSearch.disabled = true;
            districtSearch.classList.add('bg-gray-50');
            districtSearch.placeholder = 'No districts available';
            return;
        }
        
        const districts = city.districts.map(d => ({ name: d }));
        
        districtSearch.disabled = false;
        districtSearch.classList.remove('bg-gray-50');
        districtSearch.placeholder = 'Search district (optional)...';
        districtSearch.value = '';
        
        setupSearchableDropdown(
            districtSearch,
            districtInput,
            districtDropdown,
            districtDisplay,
            districts,
            (district) => {
                selectedDistrict = district;
                districtInput.value = district.name;
                districtSearch.value = '';
                districtSearch.disabled = true;
                districtDisplay.querySelector('#location-district-name').textContent = district.name;
                districtDisplay.classList.remove('hidden');
                districtDropdown.classList.add('hidden');
                updateLocationString();
            }
        );
    }
    
    // Global clear function
    window.clearLocationSelection = function(level) {
        if (level === 'country') {
            selectedCountry = null;
            countryInput.value = '';
            countrySearch.value = '';
            countrySearch.disabled = false;
            countryDisplay.classList.add('hidden');
            countryDropdown.classList.add('hidden');
            countrySearch.dataset.initialized = 'false';
            clearRegionSelection();
        } else if (level === 'region') {
            clearRegionSelection();
        } else if (level === 'city') {
            clearCitySelection();
            updateLocationString();
        } else if (level === 'district') {
            clearDistrictSelection();
            updateLocationString();
        }
    };
    
    // Update location string
    function updateLocationString() {
        const parts = [];
        
        if (selectedCountry) {
            parts.push(selectedCountry.name);
        }
        
        if (selectedRegion) {
            parts.push(selectedRegion.name);
        }
        
        if (selectedCity) {
            parts.push(selectedCity.name);
        }
        
        if (selectedDistrict) {
            parts.push(selectedDistrict.name);
        }
        
        locationInput.value = parts.join(' > ');
    }
}

function setupExchangeModeSelection() {
    const exchangeModeCards = document.querySelectorAll('.exchange-mode-card');
    const exchangeModeInput = document.getElementById('exchange-mode');
    const selectedDisplay = document.getElementById('selected-exchange-display');
    const clearButton = document.getElementById('clear-exchange-selection');
    const fieldsContainer = document.getElementById('exchange-mode-fields');
    const currencyGroup = document.getElementById('currency-group');
    
    let selectedMode = null;
    
    exchangeModeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            selectExchangeMode(mode);
        });
    });
    
    function selectExchangeMode(mode) {
        selectedMode = mode;
        exchangeModeInput.value = mode;
        
        // Update card selection
        exchangeModeCards.forEach(c => {
            c.classList.remove('selected');
            if (c.dataset.mode === mode) {
                c.classList.add('selected');
            }
        });
        
        // Update display
        const modeNames = {
            'cash': 'Cash',
            'equity': 'Equity',
            'profit_sharing': 'Profit-Sharing',
            'barter': 'Barter',
            'hybrid': 'Hybrid'
        };
        
        document.getElementById('selected-exchange-name').textContent = modeNames[mode];
        selectedDisplay.classList.remove('hidden');
        
        // Render mode-specific fields
        renderExchangeModeFields(mode);
    }
    
    function renderExchangeModeFields(mode) {
        let html = '';
        
        switch(mode) {
            case 'cash':
                currencyGroup.classList.remove('hidden');
                html = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="form-group">
                            <label for="cash-amount" class="form-label">Cash Amount <span class="text-red-600">*</span></label>
                            <input 
                                type="number" 
                                id="cash-amount" 
                                name="cashAmount" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 10000"
                                step="0.01"
                                required
                            >
                            <p class="text-sm text-gray-500 mt-1">Enter the total cash amount</p>
                        </div>
                        <div class="form-group">
                            <label for="cash-payment-terms" class="form-label">Payment Terms <span class="text-red-600">*</span></label>
                            <select 
                                id="cash-payment-terms" 
                                name="cashPaymentTerms" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select payment terms</option>
                                <option value="upfront">Upfront</option>
                                <option value="milestone_based">Milestone-Based</option>
                                <option value="upon_completion">Upon Completion</option>
                                <option value="monthly">Monthly</option>
                                <option value="installments">Installments</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cash-milestones" class="form-label">Payment Milestones</label>
                        <textarea 
                            id="cash-milestones" 
                            name="cashMilestones" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="3"
                            placeholder="e.g., 50% upfront (5K SAR), 50% on completion (5K SAR)"
                            data-rich-text="true"
                        ></textarea>
                        <p class="text-sm text-gray-500 mt-1">Describe payment schedule and milestones</p>
                    </div>
                `;
                break;
                
            case 'equity':
                currencyGroup.classList.add('hidden');
                html = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="form-group">
                            <label for="equity-percentage" class="form-label">Equity Percentage <span class="text-red-600">*</span></label>
                            <input 
                                type="number" 
                                id="equity-percentage" 
                                name="equityPercentage" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 40"
                                min="0"
                                max="100"
                                step="0.1"
                                required
                            >
                            <p class="text-sm text-gray-500 mt-1">Percentage of ownership stake</p>
                        </div>
                        <div class="form-group">
                            <label for="equity-vesting" class="form-label">Vesting Period</label>
                            <select 
                                id="equity-vesting" 
                                name="equityVesting" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select vesting period</option>
                                <option value="immediate">Immediate</option>
                                <option value="1_year">1 Year</option>
                                <option value="2_years">2 Years</option>
                                <option value="3_years">3 Years</option>
                                <option value="4_years">4 Years</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="equity-contribution" class="form-label">Contribution Description</label>
                        <textarea 
                            id="equity-contribution" 
                            name="equityContribution" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="3"
                            placeholder="e.g., Join our JV: 40% equity for expertise + equipment"
                            data-rich-text="true"
                        ></textarea>
                        <p class="text-sm text-gray-500 mt-1">Describe what contribution earns this equity stake</p>
                    </div>
                `;
                break;
                
            case 'profit_sharing':
                currencyGroup.classList.add('hidden');
                html = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="form-group">
                            <label for="profit-split" class="form-label">Profit Split Percentage <span class="text-red-600">*</span></label>
                            <input 
                                type="text" 
                                id="profit-split" 
                                name="profitSplit" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 60-40 or 50-30-20"
                                required
                            >
                            <p class="text-sm text-gray-500 mt-1">Enter profit split (e.g., 60-40 for 60% partner, 40% partner)</p>
                        </div>
                        <div class="form-group">
                            <label for="profit-basis" class="form-label">Profit Basis</label>
                            <select 
                                id="profit-basis" 
                                name="profitBasis" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="revenue">Revenue Share</option>
                                <option value="profit">Profit Share (After Costs)</option>
                                <option value="gross_profit">Gross Profit Share</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profit-distribution" class="form-label">Distribution Schedule</label>
                        <textarea 
                            id="profit-distribution" 
                            name="profitDistribution" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="3"
                            placeholder="e.g., Consortium: 60-40 profit split after costs, distributed quarterly"
                            data-rich-text="true"
                        ></textarea>
                        <p class="text-sm text-gray-500 mt-1">Describe how and when profits will be distributed</p>
                    </div>
                `;
                break;
                
            case 'barter':
                currencyGroup.classList.add('hidden');
                html = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="form-group">
                            <label for="barter-offer" class="form-label">What You Offer <span class="text-red-600">*</span></label>
                            <textarea 
                                id="barter-offer" 
                                name="barterOffer" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows="3"
                                placeholder="e.g., Office space, equipment, services..."
                                required
                                data-rich-text="true"
                            ></textarea>
                            <p class="text-sm text-gray-500 mt-1">Describe what you're offering in exchange</p>
                        </div>
                        <div class="form-group">
                            <label for="barter-need" class="form-label">What You Need <span class="text-red-600">*</span></label>
                            <textarea 
                                id="barter-need" 
                                name="barterNeed" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows="3"
                                placeholder="e.g., Structural engineering services..."
                                required
                                data-rich-text="true"
                            ></textarea>
                            <p class="text-sm text-gray-500 mt-1">Describe what you need in return</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="barter-value" class="form-label">Estimated Value (Optional)</label>
                        <input 
                            type="text" 
                            id="barter-value" 
                            name="barterValue" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Equivalent to 50K SAR"
                        >
                        <p class="text-sm text-gray-500 mt-1">Optional: Estimated equivalent value</p>
                    </div>
                `;
                break;
                
            case 'hybrid':
                currencyGroup.classList.remove('hidden');
                html = `
                    <div class="mb-6">
                        <p class="text-sm font-medium text-gray-700 mb-4">Define the mix of exchange modes (must total 100%)</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="form-group">
                                <label for="hybrid-cash" class="form-label">Cash Percentage</label>
                                <input 
                                    type="number" 
                                    id="hybrid-cash" 
                                    name="hybridCash" 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., 30"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                >
                                <p class="text-sm text-gray-500 mt-1">%</p>
                            </div>
                            <div class="form-group">
                                <label for="hybrid-equity" class="form-label">Equity Percentage</label>
                                <input 
                                    type="number" 
                                    id="hybrid-equity" 
                                    name="hybridEquity" 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., 50"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                >
                                <p class="text-sm text-gray-500 mt-1">%</p>
                            </div>
                            <div class="form-group">
                                <label for="hybrid-barter" class="form-label">Barter Percentage</label>
                                <input 
                                    type="number" 
                                    id="hybrid-barter" 
                                    name="hybridBarter" 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., 20"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                >
                                <p class="text-sm text-gray-500 mt-1">%</p>
                            </div>
                        </div>
                        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p class="text-sm text-gray-700">
                                <span class="font-semibold">Total: </span>
                                <span id="hybrid-total">0%</span>
                            </p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="form-group">
                            <label for="hybrid-cash-details" class="form-label">Cash Details</label>
                            <textarea 
                                id="hybrid-cash-details" 
                                name="hybridCashDetails" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows="2"
                                placeholder="e.g., 30% cash upfront"
                                data-rich-text="true"
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label for="hybrid-equity-details" class="form-label">Equity Details</label>
                            <textarea 
                                id="hybrid-equity-details" 
                                name="hybridEquityDetails" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows="2"
                                placeholder="e.g., 50% equity stake"
                                data-rich-text="true"
                            ></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="hybrid-barter-details" class="form-label">Barter Details</label>
                        <textarea 
                            id="hybrid-barter-details" 
                            name="hybridBarterDetails" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="2"
                            placeholder="e.g., 20% in-kind services"
                            data-rich-text="true"
                        ></textarea>
                    </div>
                `;
                
                // Add total calculation for hybrid mode
                setTimeout(() => {
                    const cashInput = document.getElementById('hybrid-cash');
                    const equityInput = document.getElementById('hybrid-equity');
                    const barterInput = document.getElementById('hybrid-barter');
                    const totalDisplay = document.getElementById('hybrid-total');
                    
                    function updateTotal() {
                        const cash = parseFloat(cashInput?.value || 0);
                        const equity = parseFloat(equityInput?.value || 0);
                        const barter = parseFloat(barterInput?.value || 0);
                        const total = cash + equity + barter;
                        if (totalDisplay) {
                            totalDisplay.textContent = `${total.toFixed(1)}%`;
                            if (total === 100) {
                                totalDisplay.parentElement.classList.remove('bg-blue-50', 'border-blue-200');
                                totalDisplay.parentElement.classList.add('bg-green-50', 'border-green-200');
                            } else {
                                totalDisplay.parentElement.classList.remove('bg-green-50', 'border-green-200');
                                totalDisplay.parentElement.classList.add('bg-blue-50', 'border-blue-200');
                            }
                        }
                    }
                    
                    if (cashInput) cashInput.addEventListener('input', updateTotal);
                    if (equityInput) equityInput.addEventListener('input', updateTotal);
                    if (barterInput) barterInput.addEventListener('input', updateTotal);
                }, 100);
                break;
        }
        
        fieldsContainer.innerHTML = html;
        
        // Initialize rich text editors for newly rendered exchange mode fields
        setTimeout(() => {
            if (window.RichTextEditor) {
                window.RichTextEditor.initAll();
            }
        }, 150);
    }
    
    clearButton.addEventListener('click', () => {
        selectedMode = null;
        exchangeModeInput.value = '';
        exchangeModeCards.forEach(c => c.classList.remove('selected'));
        selectedDisplay.classList.add('hidden');
        fieldsContainer.innerHTML = '<p class="text-gray-500 italic">Please select an exchange mode to see specific fields.</p>';
        currencyGroup.classList.add('hidden');
    });
}

function setupDemoDataFiller() {
    const fillDemoBtn = document.getElementById('fill-demo-data');
    const modal = document.getElementById('demo-data-modal');
    const confirmBtn = document.getElementById('demo-modal-confirm');
    const cancelBtn = document.getElementById('demo-modal-cancel');
    
    if (!fillDemoBtn || !modal) return;
    
    // Open modal when button is clicked
    fillDemoBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
    
    // Confirm button
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            closeModal();
            fillDemoData();
        });
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal();
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

async function fillDemoData() {
    try {
        // Step 1: Select a model (Task-Based Engagement)
        const demoModel = allModels.find(m => m.subModelKey === 'task_based') || allModels[0];
        if (demoModel) {
            const modelSearch = document.getElementById('model-search');
            const modelTypeInput = document.getElementById('model-type');
            const subModelTypeInput = document.getElementById('submodel-type');
            
            if (modelSearch && modelTypeInput && subModelTypeInput) {
                modelSearch.value = demoModel.subModelName;
                modelTypeInput.value = demoModel.modelKey;
                subModelTypeInput.value = demoModel.subModelKey;
                
                // Update display
                const modelDisplay = document.getElementById('selected-model-display');
                if (modelDisplay) {
                    modelDisplay.querySelector('#selected-model-name').textContent = demoModel.subModelName;
                    modelDisplay.classList.remove('hidden');
                }
                
                currentModel = demoModel.modelKey;
                currentSubModel = demoModel.subModelKey;
                
                // Render dynamic fields for step 3
                renderDynamicFields(demoModel.modelKey, demoModel.subModelKey);
            }
        }
        
        // Step 2: Fill basic information
        setTimeout(() => {
            const titleInput = document.getElementById('title');
            const descriptionInput = document.getElementById('description');
            
            if (titleInput) titleInput.value = 'Structural Engineering Services for Commercial Building Project';
            if (descriptionInput) {
                const descriptionContent = 'We are seeking an experienced structural engineer to provide design and consultation services for a new 5-story commercial building in Riyadh. The project involves reinforced concrete design, foundation analysis, and construction supervision.';
                descriptionInput.value = descriptionContent;
                // Set content in rich text editor if it exists
                if (descriptionInput.hasAttribute('data-rich-text') && window.RichTextEditor) {
                    setTimeout(() => {
                        window.RichTextEditor.setContent('description', descriptionContent);
                    }, 200);
                }
            }
            
            // Fill location (Saudi Arabia > Riyadh > Riyadh City > Al Olaya)
            fillDemoLocation();
            
            // Step 3: Fill dynamic fields (fields were already rendered at line 1385)
            // Wait a bit for the DOM to be ready
            setTimeout(() => {
                console.log('Filling demo dynamic fields...');
                fillDemoDynamicFields();
                
                // Step 4: Fill exchange mode (without navigating)
                setTimeout(() => {
                    fillDemoExchangeMode();
                    
                    // Step 5: Set status (without navigating)
                    setTimeout(() => {
                        const statusField = document.getElementById('status');
                        if (statusField) {
                            statusField.value = 'published';
                        }
                    }, 200);
                }, 500);
            }, 500); // Wait for fields to be rendered
        }, 100);
        
        // Show success message
        setTimeout(() => {
            const successDiv = document.getElementById('form-success');
            if (successDiv) {
                successDiv.textContent = 'Demo data filled successfully! Review and submit when ready.';
                successDiv.classList.remove('hidden');
                setTimeout(() => successDiv.classList.add('hidden'), 5000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error filling demo data:', error);
        const errorDiv = document.getElementById('form-error');
        if (errorDiv) {
            errorDiv.textContent = 'Error filling demo data: ' + error.message;
            errorDiv.classList.remove('hidden');
        }
    }
}

async function fillDemoLocation() {
    const locations = getLocationsData();
    if (!locations) return;
    
    try {
        // Find Saudi Arabia > Riyadh > Riyadh City > Al Olaya
        const sa = locations.countries.find(c => c.id === 'sa');
        if (!sa) return;
        
        const riyadhRegion = sa.regions.find(r => r.id === 'riyadh');
        if (!riyadhRegion) return;
        
        const riyadhCity = riyadhRegion.cities.find(c => c.id === 'riyadh-city');
        if (!riyadhCity) return;
        
        const district = riyadhCity.districts && riyadhCity.districts.length > 0 ? riyadhCity.districts[0] : null;
        
        // Fill country by clicking the dropdown option
        const countrySearch = document.getElementById('location-country-search');
        const countryInput = document.getElementById('location-country');
        const countryDropdown = document.getElementById('location-country-dropdown');
        const countryDisplay = document.getElementById('location-country-display');
        
        if (countrySearch && countryInput) {
            // Show dropdown and select country
            countrySearch.focus();
            countrySearch.value = sa.name;
            countrySearch.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
                // Find and click the country option
                const countryOptions = countryDropdown?.querySelectorAll('.searchable-dropdown-item');
                if (countryOptions) {
                    for (let option of countryOptions) {
                        if (option.textContent.trim() === sa.name || option.dataset.id === sa.id) {
                            option.click();
                            break;
                        }
                    }
                }
                
                // Fill region after country is selected
                setTimeout(() => {
                    const regionSearch = document.getElementById('location-region-search');
                    const regionInput = document.getElementById('location-region');
                    const regionDropdown = document.getElementById('location-region-dropdown');
                    const regionDisplay = document.getElementById('location-region-display');
                    
                    if (regionSearch && regionInput && !regionSearch.disabled) {
                        regionSearch.focus();
                        regionSearch.value = riyadhRegion.name;
                        regionSearch.dispatchEvent(new Event('input', { bubbles: true }));
                        
                        setTimeout(() => {
                            const regionOptions = regionDropdown?.querySelectorAll('.searchable-dropdown-item');
                            if (regionOptions) {
                                for (let option of regionOptions) {
                                    if (option.textContent.trim() === riyadhRegion.name || option.dataset.id === riyadhRegion.id) {
                                        option.click();
                                        break;
                                    }
                                }
                            }
                            
                            // Fill city after region is selected
                            setTimeout(() => {
                                const citySearch = document.getElementById('location-city-search');
                                const cityInput = document.getElementById('location-city');
                                const cityDropdown = document.getElementById('location-city-dropdown');
                                const cityDisplay = document.getElementById('location-city-display');
                                
                                if (citySearch && cityInput && !citySearch.disabled) {
                                    citySearch.focus();
                                    citySearch.value = riyadhCity.name;
                                    citySearch.dispatchEvent(new Event('input', { bubbles: true }));
                                    
                                    setTimeout(() => {
                                        const cityOptions = cityDropdown?.querySelectorAll('.searchable-dropdown-item');
                                        if (cityOptions) {
                                            for (let option of cityOptions) {
                                                if (option.textContent.trim() === riyadhCity.name || option.dataset.id === riyadhCity.id) {
                                                    option.click();
                                                    break;
                                                }
                                            }
                                        }
                                        
                                        // Fill district if available
                                        if (district) {
                                            setTimeout(() => {
                                                const districtSearch = document.getElementById('location-district-search');
                                                const districtInput = document.getElementById('location-district');
                                                const districtDropdown = document.getElementById('location-district-dropdown');
                                                
                                                if (districtSearch && districtInput && !districtSearch.disabled) {
                                                    districtSearch.focus();
                                                    districtSearch.value = district;
                                                    districtSearch.dispatchEvent(new Event('input', { bubbles: true }));
                                                    
                                                    setTimeout(() => {
                                                        const districtOptions = districtDropdown?.querySelectorAll('.searchable-dropdown-item');
                                                        if (districtOptions) {
                                                            for (let option of districtOptions) {
                                                                if (option.textContent.trim() === district || option.dataset.name === district) {
                                                                    option.click();
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }, 200);
                                                }
                                            }, 200);
                                        }
                                    }, 200);
                                }
                            }, 200);
                        }, 200);
                    }
                }, 200);
            }, 200);
        }
        
    } catch (error) {
        console.error('Error filling location:', error);
    }
}

function fillDemoDynamicFields() {
    const form = document.getElementById('opportunity-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Fill common fields based on task_based model
    const fieldMappings = {
        'taskTitle': 'Structural Design and Analysis for Commercial Building',
        'taskType': 'Engineering',
        'detailedScope': 'Provide complete structural engineering services including:\n- Structural analysis and design for 5-story reinforced concrete building\n- Foundation design and soil analysis\n- Construction drawings and specifications\n- Site visits and construction supervision\n- Coordination with architectural and MEP teams',
        'duration': '90',
        'budgetRange_min': '50000',
        'budgetRange_max': '75000',
        'requiredSkills': 'Structural Engineering, Reinforced Concrete Design, Foundation Design, AutoCAD, ETABS',
        'experienceLevel': 'Senior',
        'locationRequirement': 'Hybrid',
        'startDate': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        'deliverableFormat': 'PDF drawings, CAD files, calculation reports',
        'paymentTerms': 'Milestone-Based',
        'exchangeType': 'Cash'
    };
    
    console.log('Filling demo dynamic fields...');
    let filledCount = 0;
    let missingCount = 0;
    
    // Fill fields directly (they can be in hidden steps)
    Object.keys(fieldMappings).forEach(key => {
        // Try multiple selectors to find the field
        let field = form.querySelector(`[name="${key}"]`);
        if (!field) {
            // Try by ID as well
            field = document.getElementById(key);
        }
        
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = fieldMappings[key];
                filledCount++;
            } else if (field.tagName === 'SELECT') {
                field.value = fieldMappings[key];
                // Trigger change event for select fields
                field.dispatchEvent(new Event('change', { bubbles: true }));
                filledCount++;
            } else if (field.tagName === 'TEXTAREA') {
                const value = fieldMappings[key];
                field.value = value;
                // Trigger input event to ensure value is set
                field.dispatchEvent(new Event('input', { bubbles: true }));
                
                // If it's a rich text editor field, initialize the editor
                if (field.hasAttribute('data-rich-text') && window.RichTextEditor) {
                    // Initialize editor if not already initialized
                    if (!window.RichTextEditor.get(field.id)) {
                        window.RichTextEditor.init(field.id);
                    }
                    // Set content in the editor
                    setTimeout(() => {
                        window.RichTextEditor.setContent(key, value);
                    }, 200);
                }
                filledCount++;
            } else {
                field.value = fieldMappings[key];
                // Trigger input event for other input fields
                field.dispatchEvent(new Event('input', { bubbles: true }));
                filledCount++;
            }
            console.log(`✓ Filled field: ${key} = ${fieldMappings[key]}`);
        } else {
            missingCount++;
            console.warn(`✗ Field not found: ${key}`);
        }
    });
    
    // Handle tags input (requiredSkills) - this might be a special component
    const skillsInput = form.querySelector('[name="requiredSkills"]');
    if (skillsInput) {
        if (skillsInput.type === 'text') {
            skillsInput.value = fieldMappings.requiredSkills;
            // Trigger input event to process tags
            skillsInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log(`✓ Filled requiredSkills: ${fieldMappings.requiredSkills}`);
        }
    } else {
        console.warn('✗ requiredSkills field not found');
    }
    
    // Handle budget range fields specifically
    const budgetMin = document.getElementById('budgetRange_min') || form.querySelector('[name="budgetRange_min"]');
    const budgetMax = document.getElementById('budgetRange_max') || form.querySelector('[name="budgetRange_max"]');
    if (budgetMin && budgetMax) {
        budgetMin.value = fieldMappings.budgetRange_min;
        budgetMax.value = fieldMappings.budgetRange_max;
        budgetMin.dispatchEvent(new Event('input', { bubbles: true }));
        budgetMax.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`✓ Filled budget range: ${fieldMappings.budgetRange_min} - ${fieldMappings.budgetRange_max}`);
    } else {
        console.warn('✗ Budget range fields not found');
    }
    
    console.log(`Demo data fill complete: ${filledCount} fields filled, ${missingCount} fields missing`);
    
    // Log all available fields for debugging
    const allFields = Array.from(form.querySelectorAll('[name]'));
    console.log('Available fields:', allFields.map(f => f.name));
}

function fillDemoExchangeMode() {
    // Fill budget range fields (now in step 4)
    const budgetMin = document.getElementById('budgetRange_min');
    const budgetMax = document.getElementById('budgetRange_max');
    if (budgetMin && budgetMax) {
        budgetMin.value = '50000';
        budgetMax.value = '75000';
        budgetMin.dispatchEvent(new Event('input', { bubbles: true }));
        budgetMax.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✓ Filled budget range: 50,000 - 75,000 SAR');
    }
    
    // Select Cash mode (can be in hidden step)
    const cashCard = document.querySelector('.exchange-mode-card[data-mode="cash"]');
    if (cashCard) {
        // Trigger click event to select the mode
        cashCard.dispatchEvent(new Event('click', { bubbles: true }));
        
        setTimeout(() => {
            // Fill cash mode fields (they can be in hidden step)
            const cashAmount = document.getElementById('cash-amount');
            const cashPaymentTerms = document.getElementById('cash-payment-terms');
            const currency = document.getElementById('currency');
            const cashMilestones = document.getElementById('cash-milestones');
            const exchangeTermsSummary = document.getElementById('exchange-terms-summary');
            const exchangeAgreement = document.getElementById('exchange-agreement');
            
            if (cashAmount) cashAmount.value = '60000';
            if (cashPaymentTerms) cashPaymentTerms.value = 'milestone_based';
            if (currency) currency.value = 'SAR';
            
            // Set textarea values (rich text editors will be initialized when step becomes visible)
            const milestonesContent = 'Payment Schedule:\n- 30% upfront (18,000 SAR) upon contract signing\n- 40% (24,000 SAR) upon completion of design phase\n- 30% (18,000 SAR) upon final delivery and approval';
            if (cashMilestones) {
                cashMilestones.value = milestonesContent;
            }
            
            const termsContent = 'All payments will be made via bank transfer within 7 days of milestone completion. Final payment subject to client approval of deliverables.';
            if (exchangeTermsSummary) {
                exchangeTermsSummary.value = termsContent;
            }
            
            if (exchangeAgreement) exchangeAgreement.checked = true;
        }, 300);
    }
}

function renderDynamicFields(modelKey, subModelKey, preserveValues = false) {
    const formService = window.opportunityFormService;
    const container = document.getElementById('dynamic-fields');
    
    if (!container || !formService) return;
    
    // If preserving values, collect current field values before re-rendering
    const savedValues = {};
    if (preserveValues) {
        const attributes = formService.getAttributes(modelKey, subModelKey);
        attributes.forEach(attr => {
            // Handle currency-range fields separately (they have _min and _max suffixes)
            if (attr.type === 'currency-range') {
                const minField = document.getElementById(`${attr.key}_min`) || document.querySelector(`[name="${attr.key}_min"]`);
                const maxField = document.getElementById(`${attr.key}_max`) || document.querySelector(`[name="${attr.key}_max"]`);
                if (minField) {
                    savedValues[`${attr.key}_min`] = minField.value;
                }
                if (maxField) {
                    savedValues[`${attr.key}_max`] = maxField.value;
                }
            } else {
                // Regular fields
                const field = document.getElementById(attr.key) || document.querySelector(`[name="${attr.key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        savedValues[attr.key] = field.checked;
                    } else {
                        savedValues[attr.key] = field.value;
                    }
                }
            }
        });
    }
    
    // Update form service to use lookups
    const lookups = getLookupsData();
    if (lookups) {
        formService.setLookups(lookups);
    }
    
    const attributes = formService.getAttributes(modelKey, subModelKey);
    
    if (attributes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No additional fields required for this model.</p>';
        return;
    }
    
    // Render fields with saved values if preserving
    container.innerHTML = attributes.map(attr => {
        const value = preserveValues && savedValues[attr.key] !== undefined ? savedValues[attr.key] : '';
        return formService.renderField(attr, value);
    }).join('');
    
    // Restore currency-range values
    if (preserveValues) {
        attributes.forEach(attr => {
            if (attr.type === 'currency-range') {
                const minValue = savedValues[`${attr.key}_min`];
                const maxValue = savedValues[`${attr.key}_max`];
                if (minValue !== undefined) {
                    const minField = document.getElementById(`${attr.key}_min`);
                    if (minField) minField.value = minValue;
                }
                if (maxValue !== undefined) {
                    const maxField = document.getElementById(`${attr.key}_max`);
                    if (maxField) maxField.value = maxValue;
                }
            }
        });
    }
    
    const form = document.getElementById('opportunity-form');
    formService.setupConditionalFields(form);
    
    // Initialize rich text editors for newly rendered fields
    // Check if step 3 is visible before initializing
    const step3 = document.getElementById('step-3');
    const isStep3Visible = step3 && !step3.classList.contains('hidden');
    
    if (isStep3Visible) {
        // Step is visible, initialize rich text editors immediately
        setTimeout(() => {
            if (window.RichTextEditor && typeof Quill !== 'undefined') {
                // Find all textareas with data-rich-text in step 3
                const textareas = step3.querySelectorAll('textarea[data-rich-text="true"]');
                textareas.forEach(textarea => {
                    if (!window.RichTextEditor.get(textarea.id)) {
                        console.log(`Initializing rich text editor for ${textarea.id} in renderDynamicFields`);
                        window.RichTextEditor.init(textarea.id);
                    }
                });
                
                // Restore rich text editor content if preserving values
                if (preserveValues) {
                    Object.keys(savedValues).forEach(key => {
                        const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                        if (field && field.tagName === 'TEXTAREA' && field.hasAttribute('data-rich-text') && savedValues[key]) {
                            setTimeout(() => {
                                window.RichTextEditor.setContent(key, savedValues[key]);
                            }, 200);
                        }
                    });
                }
            } else {
                console.error('RichTextEditor or Quill not available in renderDynamicFields');
            }
        }, 400); // Increased timeout to ensure DOM is ready
    } else {
        // Step is hidden, will be initialized when it becomes visible via goToStep
        console.log('Step 3 is hidden, rich text editors will be initialized when step becomes visible');
    }
}

function setupFormHandlers() {
    const form = document.getElementById('opportunity-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Remove required attribute from hidden fields to prevent HTML5 validation errors
        const allRequiredFields = form.querySelectorAll('[required]');
        const hiddenFields = [];
        
        allRequiredFields.forEach(field => {
            const stepContent = field.closest('.wizard-step-content');
            if (stepContent && stepContent.classList.contains('hidden')) {
                field.removeAttribute('required');
                hiddenFields.push(field);
            }
        });
        
        if (!validateCurrentStep()) {
            // Restore required attributes if validation fails
            hiddenFields.forEach(field => field.setAttribute('required', 'required'));
            return;
        }
        
        // Restore required attributes after validation passes
        hiddenFields.forEach(field => field.setAttribute('required', 'required'));
        
        const errorDiv = document.getElementById('form-error');
        const successDiv = document.getElementById('form-success');
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        
        try {
            const formService = window.opportunityFormService;
            const formData = formService.collectFormData(form);
            
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('You must be logged in to create an opportunity');
            }
            
            if (!formData.modelType || !formData.subModelType) {
                throw new Error('Please select a model and sub-model');
            }
            
            if (!formData.title) {
                throw new Error('Title is required');
            }
            
            if (!formData.locationCountry || !formData.locationRegion || !formData.locationCity) {
                throw new Error('Country, Region, and City are required');
            }
            
            // Collect exchange mode data
            const exchangeData = {
                exchangeMode: formData.exchangeMode,
                currency: formData.currency || 'SAR',
                exchangeTermsSummary: formData.exchangeTermsSummary || '',
                // Budget range from step 4
                budgetRange: {
                    min: parseFloat(formData.budgetRange_min) || 0,
                    max: parseFloat(formData.budgetRange_max) || 0,
                    currency: formData.currency || 'SAR'
                }
            };
            
            // Add mode-specific fields
            if (formData.exchangeMode === 'cash') {
                exchangeData.cashAmount = parseFloat(formData.cashAmount);
                exchangeData.cashPaymentTerms = formData.cashPaymentTerms;
                exchangeData.cashMilestones = formData.cashMilestones || '';
            } else if (formData.exchangeMode === 'equity') {
                exchangeData.equityPercentage = parseFloat(formData.equityPercentage);
                exchangeData.equityVesting = formData.equityVesting || '';
                exchangeData.equityContribution = formData.equityContribution || '';
            } else if (formData.exchangeMode === 'profit_sharing') {
                exchangeData.profitSplit = formData.profitSplit;
                exchangeData.profitBasis = formData.profitBasis || 'profit';
                exchangeData.profitDistribution = formData.profitDistribution || '';
            } else if (formData.exchangeMode === 'barter') {
                exchangeData.barterOffer = formData.barterOffer;
                exchangeData.barterNeed = formData.barterNeed;
                exchangeData.barterValue = formData.barterValue || '';
            } else if (formData.exchangeMode === 'hybrid') {
                exchangeData.hybridCash = parseFloat(formData.hybridCash || 0);
                exchangeData.hybridEquity = parseFloat(formData.hybridEquity || 0);
                exchangeData.hybridBarter = parseFloat(formData.hybridBarter || 0);
                exchangeData.hybridCashDetails = formData.hybridCashDetails || '';
                exchangeData.hybridEquityDetails = formData.hybridEquityDetails || '';
                exchangeData.hybridBarterDetails = formData.hybridBarterDetails || '';
            }
            
            const oppService = window.opportunityService;
            const opportunity = await oppService.createOpportunity({
                title: formData.title,
                description: formData.description || '',
                modelType: formData.modelType,
                subModelType: formData.subModelType,
                status: formData.status || 'draft',
                location: formData.location || '',
                locationCountry: formData.locationCountry,
                locationRegion: formData.locationRegion,
                locationCity: formData.locationCity,
                locationDistrict: formData.locationDistrict || '',
                exchangeMode: formData.exchangeMode,
                exchangeData: exchangeData,
                creatorId: user.id,
                attributes: formData
            });
            
            await dataService.createAuditLog({
                userId: user.id,
                action: 'opportunity_created',
                entityType: 'opportunity',
                entityId: opportunity.id,
                details: { title: opportunity.title, modelType: opportunity.modelType }
            });
            
            successDiv.textContent = 'Opportunity created successfully!';
            successDiv.classList.remove('hidden');
            
            setTimeout(() => {
                router.navigate(`/opportunities/${opportunity.id}`);
            }, 2000);
            
        } catch (error) {
            console.error('Error creating opportunity:', error);
            showError(error.message || 'Failed to create opportunity. Please try again.');
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('form-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
