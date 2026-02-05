/**
 * Collaboration Wizard – multi-step questionnaire, recommends collaboration model(s)
 */

const WIZARD_STEPS = [
    {
        id: 'goal',
        title: 'What is your main goal?',
        options: [
            { value: 'deliver_project', label: 'Deliver a specific project with partners', models: ['project_based'] },
            { value: 'long_term_partner', label: 'Find a long-term strategic partner', models: ['strategic_partnership'] },
            { value: 'reduce_costs', label: 'Reduce costs through shared resources', models: ['resource_pooling'] },
            { value: 'hire_talent', label: 'Hire talent or win work via competition', models: ['hiring', 'competition'] }
        ]
    },
    {
        id: 'timeline',
        title: 'What is your timeline?',
        options: [
            { value: 'short', label: 'Short-term (single project or task)', models: ['project_based', 'hiring'] },
            { value: 'medium', label: 'Medium-term (6–24 months)', models: ['project_based', 'strategic_partnership'] },
            { value: 'long', label: 'Long-term (multi-year)', models: ['strategic_partnership', 'resource_pooling'] }
        ]
    },
    {
        id: 'structure',
        title: 'Preferred structure?',
        options: [
            { value: 'joint_venture', label: 'Joint venture or consortium', models: ['project_based', 'strategic_partnership'] },
            { value: 'contract', label: 'Clear contract / scope of work', models: ['project_based', 'hiring'] },
            { value: 'alliance', label: 'Alliance or resource-sharing agreement', models: ['resource_pooling', 'strategic_partnership'] }
        ]
    }
];

const MODEL_LABELS = {
    project_based: 'Project-Based Collaboration',
    strategic_partnership: 'Strategic Partnership',
    resource_pooling: 'Resource Pooling',
    hiring: 'Hiring',
    competition: 'Competition'
};

function initCollaborationWizard() {
    const stepsEl = document.getElementById('wizard-steps');
    const progressBar = document.getElementById('wizard-progress-bar');
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const submitBtn = document.getElementById('wizard-submit');
    const resultEl = document.getElementById('wizard-result');
    const resultModelsEl = document.getElementById('wizard-result-models');

    let currentStep = 0;
    const answers = [];

    function renderSteps() {
        stepsEl.innerHTML = WIZARD_STEPS.map((step, index) => `
            <div class="wizard-step ${index === currentStep ? 'active' : ''}" data-step="${index}">
                <h3>${step.title}</h3>
                <div class="wizard-options">
                    ${step.options.map(opt => `
                        <div class="wizard-option" data-value="${opt.value}" data-models="${(opt.models || []).join(',')}">
                            ${opt.label}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        stepsEl.querySelectorAll('.wizard-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const step = WIZARD_STEPS[currentStep];
                const value = opt.dataset.value;
                const models = (opt.dataset.models || '').split(',').filter(Boolean);
                answers[currentStep] = { value, models };
                stepsEl.querySelectorAll('.wizard-step.active .wizard-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    }

    function updateUI() {
        stepsEl.querySelectorAll('.wizard-step').forEach((el, i) => {
            el.classList.toggle('active', i === currentStep);
        });
        const pct = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
        progressBar.style.width = pct + '%';
        prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        nextBtn.style.display = currentStep === WIZARD_STEPS.length - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = currentStep === WIZARD_STEPS.length - 1 ? 'inline-block' : 'none';
    }

    function showResult() {
        const modelCount = {};
        answers.forEach(a => {
            (a.models || []).forEach(m => { modelCount[m] = (modelCount[m] || 0) + 1; });
        });
        const sorted = Object.entries(modelCount).sort((a, b) => b[1] - a[1]);
        const topModels = sorted.slice(0, 3).map(([id]) => id);
        const unique = [...new Set(topModels)];

        document.querySelector('.wizard-container').style.display = 'none';
        resultEl.style.display = 'block';
        resultModelsEl.innerHTML = '<ul class="wizard-result-models-list">' +
            unique.map(id => `<li><strong>${MODEL_LABELS[id] || id}</strong></li>`).join('') +
            '</ul>';

        const createOpp = document.getElementById('wizard-create-opp');
        if (createOpp && typeof authService !== 'undefined' && authService.getCurrentUser()) {
            createOpp.style.display = 'inline-block';
        } else if (createOpp) {
            createOpp.style.display = 'none';
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderSteps();
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (answers[currentStep]) {
            if (currentStep < WIZARD_STEPS.length - 1) {
                currentStep++;
                renderSteps();
                updateUI();
            }
        } else {
            alert('Please select an option.');
        }
    });

    submitBtn.addEventListener('click', () => {
        if (answers[currentStep]) showResult();
        else alert('Please select an option.');
    });

    renderSteps();
    updateUI();
}
