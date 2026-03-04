/**
 * Collaboration Wizard – AI-guided multi-step questionnaire
 * Recommends specific sub-models based on entity type, goals, budget, risk, and structure preferences.
 */

const SUB_MODEL_INFO = {
    task_based: {
        name: 'Task-Based Engagement',
        category: 'Project-Based Collaboration',
        description: 'Hire someone for a defined task or deliverable with a clear scope and timeline.',
        entityTypes: ['company', 'user']
    },
    consortium: {
        name: 'Consortium',
        category: 'Project-Based Collaboration',
        description: 'Multiple companies jointly bid on and deliver a large project, sharing scope and liability.',
        entityTypes: ['company', 'user']
    },
    project_jv: {
        name: 'Project-Specific Joint Venture',
        category: 'Project-Based Collaboration',
        description: 'Form a temporary legal entity with partners to deliver a single large project.',
        entityTypes: ['company']
    },
    spv: {
        name: 'Special Purpose Vehicle (SPV)',
        category: 'Project-Based Collaboration',
        description: 'Create a dedicated corporate entity for a mega-project (50M+ SAR), isolating risk and financing.',
        entityTypes: ['company']
    },
    strategic_jv: {
        name: 'Strategic Joint Venture',
        category: 'Strategic Partnerships',
        description: 'Long-term incorporated partnership to pursue ongoing business objectives across multiple projects.',
        entityTypes: ['company']
    },
    strategic_alliance: {
        name: 'Long-Term Strategic Alliance',
        category: 'Strategic Partnerships',
        description: 'Preferred-supplier or knowledge-sharing agreement for multi-year collaboration without forming a legal entity.',
        entityTypes: ['company', 'user']
    },
    mentorship: {
        name: 'Mentorship Program',
        category: 'Strategic Partnerships',
        description: 'Structured mentoring relationship for skill development, career growth, or knowledge transfer.',
        entityTypes: ['company', 'user']
    },
    bulk_purchasing: {
        name: 'Bulk Purchasing',
        category: 'Resource Pooling',
        description: 'Pool demand with other parties to negotiate better prices on materials, equipment, or services.',
        entityTypes: ['company', 'user']
    },
    equipment_sharing: {
        name: 'Equipment Sharing',
        category: 'Resource Pooling',
        description: 'Co-own or share heavy equipment, vehicles, or facilities to reduce capital expenditure.',
        entityTypes: ['company', 'user']
    },
    resource_sharing: {
        name: 'Resource Sharing & Exchange',
        category: 'Resource Pooling',
        description: 'Sell, rent, barter, or donate surplus materials, equipment, labor, or knowledge.',
        entityTypes: ['company', 'user']
    },
    professional_hiring: {
        name: 'Professional Hiring',
        category: 'Hiring',
        description: 'Recruit a professional for full-time, part-time, contract, or freelance engagement.',
        entityTypes: ['company', 'user']
    },
    consultant_hiring: {
        name: 'Consultant Hiring',
        category: 'Hiring',
        description: 'Engage a consultant for specialized advisory services with defined deliverables.',
        entityTypes: ['company', 'user']
    },
    competition_rfp: {
        name: 'Competition / RFP',
        category: 'Competition',
        description: 'Issue a design competition, RFP, RFQ, or innovation contest to select the best proposal.',
        entityTypes: ['company', 'user']
    }
};

const WIZARD_STEPS = [
    {
        id: 'entity_type',
        title: 'What type of entity are you?',
        subtitle: 'This helps us show only the models applicable to you.',
        autoDetect: true,
        options: [
            { value: 'company', label: 'Company or Organisation' },
            { value: 'user', label: 'Individual Professional / Consultant' }
        ]
    },
    {
        id: 'goal',
        title: 'What is your main goal?',
        subtitle: 'Select the option that best describes what you want to achieve.',
        options: [
            {
                value: 'deliver_project',
                label: 'Deliver a specific project with partners',
                scores: { task_based: 3, consortium: 2, project_jv: 2, spv: 1 }
            },
            {
                value: 'long_term_partner',
                label: 'Build a long-term strategic partnership',
                scores: { strategic_jv: 3, strategic_alliance: 3, mentorship: 1 }
            },
            {
                value: 'reduce_costs',
                label: 'Reduce costs through shared resources',
                scores: { bulk_purchasing: 3, equipment_sharing: 3, resource_sharing: 3 }
            },
            {
                value: 'hire_talent',
                label: 'Hire a professional or consultant',
                scores: { professional_hiring: 3, consultant_hiring: 3 }
            },
            {
                value: 'compete',
                label: 'Launch or respond to a competition / RFP',
                scores: { competition_rfp: 3 }
            }
        ]
    },
    {
        id: 'timeline',
        title: 'What is your expected timeline?',
        subtitle: 'Choose the duration that fits your engagement.',
        options: [
            {
                value: 'short',
                label: 'Short-term (single task or under 6 months)',
                scores: { task_based: 2, professional_hiring: 2, consultant_hiring: 2, resource_sharing: 1, competition_rfp: 1 }
            },
            {
                value: 'medium',
                label: 'Medium-term (6\u201324 months)',
                scores: { consortium: 2, project_jv: 2, bulk_purchasing: 1, equipment_sharing: 1, strategic_alliance: 1 }
            },
            {
                value: 'long',
                label: 'Long-term (multi-year)',
                scores: { strategic_jv: 2, strategic_alliance: 2, spv: 2, mentorship: 1, equipment_sharing: 1 }
            }
        ]
    },
    {
        id: 'budget',
        title: 'What is your estimated project budget?',
        subtitle: 'This helps narrow down the right scale of collaboration.',
        options: [
            {
                value: 'small',
                label: 'Under 1M SAR',
                scores: { task_based: 2, mentorship: 2, resource_sharing: 2, professional_hiring: 1, consultant_hiring: 1 }
            },
            {
                value: 'medium',
                label: '1M \u2013 10M SAR',
                scores: { consortium: 2, project_jv: 1, bulk_purchasing: 2, equipment_sharing: 2 }
            },
            {
                value: 'large',
                label: '10M \u2013 50M SAR',
                scores: { consortium: 2, project_jv: 2, strategic_alliance: 1, competition_rfp: 1 }
            },
            {
                value: 'mega',
                label: '50M+ SAR',
                scores: { spv: 3, strategic_jv: 2, project_jv: 1 }
            }
        ]
    },
    {
        id: 'risk',
        title: 'How much risk are you willing to share?',
        subtitle: 'Some models require sharing financial or legal risk with partners.',
        options: [
            {
                value: 'minimal',
                label: 'Minimal \u2013 I prefer clear contracts with limited liability',
                scores: { task_based: 2, professional_hiring: 2, consultant_hiring: 2, resource_sharing: 1 }
            },
            {
                value: 'moderate',
                label: 'Moderate \u2013 I can share some risk with trusted partners',
                scores: { consortium: 2, bulk_purchasing: 2, equipment_sharing: 2, strategic_alliance: 1, mentorship: 1 }
            },
            {
                value: 'significant',
                label: 'Significant \u2013 I am ready to co-invest and share outcomes',
                scores: { project_jv: 2, spv: 2, strategic_jv: 2 }
            }
        ]
    },
    {
        id: 'team',
        title: 'How many partners do you expect to involve?',
        subtitle: 'Different models suit different team sizes.',
        options: [
            {
                value: 'solo',
                label: 'Just me and one partner',
                scores: { task_based: 2, mentorship: 2, professional_hiring: 2, consultant_hiring: 2 }
            },
            {
                value: 'small_group',
                label: '2\u20133 partners',
                scores: { project_jv: 2, strategic_alliance: 2, equipment_sharing: 2 }
            },
            {
                value: 'large_group',
                label: 'Large group (4+ partners)',
                scores: { consortium: 3, spv: 2, bulk_purchasing: 2 }
            }
        ]
    },
    {
        id: 'formality',
        title: 'How formal should the arrangement be?',
        subtitle: 'Choose the level of legal structure you need.',
        options: [
            {
                value: 'informal',
                label: 'Informal agreement or MoU',
                scores: { mentorship: 2, resource_sharing: 2, task_based: 1 }
            },
            {
                value: 'formal_contract',
                label: 'Formal contract with clear terms',
                scores: { task_based: 2, professional_hiring: 2, consultant_hiring: 2, bulk_purchasing: 1, strategic_alliance: 1, competition_rfp: 1 }
            },
            {
                value: 'legal_entity',
                label: 'Incorporated legal entity (JV, SPV, LLC)',
                scores: { project_jv: 2, spv: 3, strategic_jv: 2, consortium: 1 }
            }
        ]
    }
];

function initCollaborationWizard() {
    const stepsEl = document.getElementById('wizard-steps');
    const progressBar = document.getElementById('wizard-progress-bar');
    const stepIndicator = document.getElementById('wizard-step-indicator');
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const submitBtn = document.getElementById('wizard-submit');
    const resultEl = document.getElementById('wizard-result');
    const resultModelsEl = document.getElementById('wizard-result-models');

    let currentStep = 0;
    const answers = {};
    let detectedEntityType = null;

    if (typeof authService !== 'undefined') {
        const user = authService.getCurrentUser();
        if (user) {
            detectedEntityType = user.profile?.type === 'company' ? 'company' : 'user';
        }
    }

    function getVisibleSteps() {
        return WIZARD_STEPS.filter(step => {
            if (step.id === 'entity_type' && detectedEntityType) return false;
            return true;
        });
    }

    function getEntityType() {
        if (detectedEntityType) return detectedEntityType;
        return answers.entity_type || null;
    }

    function renderStep() {
        const visibleSteps = getVisibleSteps();
        const step = visibleSteps[currentStep];
        if (!step) return;

        let optionsHTML = step.options.map(opt => {
            const isSelected = answers[step.id] === opt.value;
            return `<div class="wizard-option ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
                ${opt.label}
            </div>`;
        }).join('');

        stepsEl.innerHTML = `
            <div class="wizard-step active" data-step-id="${step.id}">
                <h3>${step.title}</h3>
                ${step.subtitle ? `<p class="wizard-step-subtitle">${step.subtitle}</p>` : ''}
                <div class="wizard-options">${optionsHTML}</div>
            </div>`;

        stepsEl.querySelectorAll('.wizard-option').forEach(opt => {
            opt.addEventListener('click', () => {
                answers[step.id] = opt.dataset.value;
                stepsEl.querySelectorAll('.wizard-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    }

    function updateUI() {
        const visibleSteps = getVisibleSteps();
        const total = visibleSteps.length;
        const pct = ((currentStep + 1) / total) * 100;
        progressBar.style.width = pct + '%';
        if (stepIndicator) {
            stepIndicator.textContent = `Step ${currentStep + 1} of ${total}`;
        }
        prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        nextBtn.style.display = currentStep === total - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = currentStep === total - 1 ? 'inline-block' : 'none';
    }

    function computeResults() {
        const entityType = getEntityType();
        const scores = {};
        Object.keys(SUB_MODEL_INFO).forEach(id => { scores[id] = 0; });

        const visibleSteps = getVisibleSteps();
        visibleSteps.forEach(step => {
            if (step.id === 'entity_type') return;
            const answer = answers[step.id];
            if (!answer) return;
            const option = step.options.find(o => o.value === answer);
            if (!option || !option.scores) return;
            Object.entries(option.scores).forEach(([model, pts]) => {
                scores[model] += pts;
            });
        });

        if (entityType) {
            Object.keys(scores).forEach(id => {
                const info = SUB_MODEL_INFO[id];
                if (info && !info.entityTypes.includes(entityType)) {
                    scores[id] = -1;
                }
            });
        }

        return Object.entries(scores)
            .filter(([, s]) => s > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id, score]) => ({ id, score, ...SUB_MODEL_INFO[id] }));
    }

    function buildWhyText(model, answersMap) {
        const reasons = [];
        const goal = answersMap.goal;
        const timeline = answersMap.timeline;
        const budget = answersMap.budget;
        const risk = answersMap.risk;

        if (goal === 'deliver_project' && ['task_based','consortium','project_jv','spv'].includes(model.id))
            reasons.push('Matches your project delivery goal');
        if (goal === 'long_term_partner' && ['strategic_jv','strategic_alliance','mentorship'].includes(model.id))
            reasons.push('Aligned with your long-term partnership goal');
        if (goal === 'reduce_costs' && ['bulk_purchasing','equipment_sharing','resource_sharing'].includes(model.id))
            reasons.push('Supports your cost-reduction objective');
        if (goal === 'hire_talent' && ['professional_hiring','consultant_hiring'].includes(model.id))
            reasons.push('Designed for talent acquisition');
        if (goal === 'compete' && model.id === 'competition_rfp')
            reasons.push('Built for competitions and RFPs');

        if (budget === 'mega' && model.id === 'spv')
            reasons.push('SPV is ideal for 50M+ SAR mega-projects');
        if (budget === 'small' && ['task_based','mentorship'].includes(model.id))
            reasons.push('Well suited for smaller budgets');

        if (risk === 'minimal' && ['task_based','professional_hiring','consultant_hiring'].includes(model.id))
            reasons.push('Low-risk contractual structure');
        if (risk === 'significant' && ['project_jv','spv','strategic_jv'].includes(model.id))
            reasons.push('Structured for shared risk and co-investment');

        if (timeline === 'long' && ['strategic_jv','strategic_alliance','spv'].includes(model.id))
            reasons.push('Suitable for multi-year engagements');
        if (timeline === 'short' && ['task_based','professional_hiring','consultant_hiring'].includes(model.id))
            reasons.push('Efficient for short-term engagements');

        return reasons.length > 0 ? reasons.join('. ') + '.' : 'Strong overall match based on your answers.';
    }

    function showResult() {
        const results = computeResults();
        document.querySelector('.wizard-container').style.display = 'none';
        resultEl.style.display = 'block';

        if (results.length === 0) {
            resultModelsEl.innerHTML = '<p class="text-secondary">No models matched your criteria. Try adjusting your answers.</p>';
            return;
        }

        const maxScore = results[0].score;
        resultModelsEl.innerHTML = results.map((model, idx) => {
            const pct = Math.round((model.score / maxScore) * 100);
            const whyText = buildWhyText(model, answers);
            const rank = idx === 0 ? 'Best Match' : (idx === 1 ? 'Strong Fit' : 'Also Recommended');
            return `
                <div class="wizard-result-card">
                    <div class="result-card-header">
                        <span class="result-rank">${rank}</span>
                        <span class="result-match-pct">${pct}%</span>
                    </div>
                    <h3 class="result-model-name">${model.name}</h3>
                    <span class="result-category-tag">${model.category}</span>
                    <p class="result-model-desc">${model.description}</p>
                    <div class="result-why">
                        <strong>Why this fits:</strong> ${whyText}
                    </div>
                </div>`;
        }).join('');

        const createOpp = document.getElementById('wizard-create-opp');
        if (createOpp && typeof authService !== 'undefined' && authService.getCurrentUser()) {
            createOpp.style.display = 'inline-block';
        } else if (createOpp) {
            createOpp.style.display = 'none';
        }
    }

    function restoreSelection() {
        const visibleSteps = getVisibleSteps();
        const step = visibleSteps[currentStep];
        if (!step) return;
        const savedValue = answers[step.id];
        if (savedValue) {
            const opt = stepsEl.querySelector(`.wizard-option[data-value="${savedValue}"]`);
            if (opt) opt.classList.add('selected');
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderStep();
            restoreSelection();
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        const visibleSteps = getVisibleSteps();
        const step = visibleSteps[currentStep];
        if (answers[step.id]) {
            if (currentStep < visibleSteps.length - 1) {
                currentStep++;
                renderStep();
                restoreSelection();
                updateUI();
            }
        } else {
            alert('Please select an option.');
        }
    });

    submitBtn.addEventListener('click', () => {
        const visibleSteps = getVisibleSteps();
        const step = visibleSteps[currentStep];
        if (answers[step.id]) showResult();
        else alert('Please select an option.');
    });

    const restartBtn = document.getElementById('wizard-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            Object.keys(answers).forEach(k => delete answers[k]);
            currentStep = 0;
            resultEl.style.display = 'none';
            document.querySelector('.wizard-container').style.display = 'block';
            renderStep();
            updateUI();
        });
    }

    renderStep();
    updateUI();
}
