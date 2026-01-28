/**
 * Opportunities List Component
 */

let userApplications = [];

async function initOpportunities() {
    // Pre-load user's applications for categorization
    const user = authService.getCurrentUser();
    if (user) {
        const allApplications = await dataService.getApplications();
        userApplications = allApplications.filter(app => app.applicantId === user.id);
    }
    
    await loadOpportunities();
    
    // Setup filters
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const categoryFilter = document.getElementById('filter-category');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadOpportunities();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('filter-model').value = '';
            document.getElementById('filter-status').value = '';
            document.getElementById('filter-search').value = '';
            if (categoryFilter) categoryFilter.value = '';
            loadOpportunities();
        });
    }
    
    // Category filter change
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadOpportunities();
        });
    }
    
    // Search on enter
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadOpportunities();
            }
        });
    }
}

async function loadOpportunities() {
    const container = document.getElementById('opportunities-list');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        let opportunities = await dataService.getOpportunities();
        const user = authService.getCurrentUser();
        
        // Categorize each opportunity
        opportunities = opportunities.map(opp => {
            const isOwner = user && opp.creatorId === user.id;
            const application = userApplications.find(app => app.opportunityId === opp.id);
            const hasApplied = !!application;
            
            let category = 'available';
            if (isOwner) {
                category = 'mine';
            } else if (hasApplied) {
                category = 'applied';
            }
            
            return {
                ...opp,
                category,
                isOwner,
                hasApplied,
                applicationStatus: application?.status || null,
                applicationId: application?.id || null
            };
        });
        
        // Apply filters
        const modelFilter = document.getElementById('filter-model')?.value;
        const statusFilter = document.getElementById('filter-status')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category')?.value;
        
        if (modelFilter) {
            opportunities = opportunities.filter(o => o.subModelType === modelFilter);
        }
        
        if (statusFilter) {
            opportunities = opportunities.filter(o => o.status === statusFilter);
        }
        
        if (searchFilter) {
            opportunities = opportunities.filter(o => 
                o.title?.toLowerCase().includes(searchFilter) ||
                o.description?.toLowerCase().includes(searchFilter)
            );
        }
        
        if (categoryFilter) {
            opportunities = opportunities.filter(o => o.category === categoryFilter);
        }
        
        // Sort: mine first, then applied, then available, each group by date
        opportunities.sort((a, b) => {
            const categoryOrder = { 'mine': 0, 'applied': 1, 'available': 2 };
            const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
            if (catDiff !== 0) return catDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Count by category for summary
        const counts = {
            mine: opportunities.filter(o => o.category === 'mine').length,
            applied: opportunities.filter(o => o.category === 'applied').length,
            available: opportunities.filter(o => o.category === 'available').length
        };
        
        // Update category counts in UI
        updateCategoryCounts(counts);
        
        if (opportunities.length === 0) {
            const opportunityIcon = IconHelper ? IconHelper.render('briefcase', { size: 40, weight: 'duotone', color: 'currentColor' }) : '';
            const plusIcon = IconHelper ? IconHelper.render('plus', { size: 20, weight: 'duotone', color: 'currentColor', className: 'mr-2' }) : '';
            
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 px-8 text-center min-h-[300px]">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/90 to-primary-light flex items-center justify-center mb-6 text-white opacity-90">
                        ${opportunityIcon}
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">No opportunities found</h3>
                    <p class="text-base text-gray-600 max-w-md mb-8 leading-relaxed">${searchFilter || modelFilter || statusFilter || categoryFilter ? 'Try adjusting your filters to see more results.' : 'Be the first to create an opportunity and start building connections.'}</p>
                    <a href="#" data-route="/opportunities/create" class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg no-underline">
                        ${plusIcon}
                        Create Opportunity
                    </a>
                </div>
            `;
            return;
        }
        
        // Load template
        const template = await templateLoader.load('opportunity-card');
        
        // Render opportunities
        const html = opportunities.map(opp => {
            const canApply = user && !opp.isOwner && opp.status === 'published' && !opp.hasApplied;
            
            const data = {
                ...opp,
                title: opp.title || 'Untitled Opportunity',
                modelType: formatModelType(opp.modelType) || 'N/A',
                subModelType: formatSubModelType(opp.subModelType) || '',
                status: opp.status || 'draft',
                statusBadgeClass: getStatusBadgeClass(opp.status),
                description: opp.description || 'No description available',
                createdDate: new Date(opp.createdAt).toLocaleDateString(),
                canApply,
                // Category-specific data
                categoryClass: getCategoryClass(opp.category),
                categoryLabel: getCategoryLabel(opp.category),
                categoryIcon: getCategoryIcon(opp.category),
                showCategoryBadge: opp.category !== 'available',
                applicationStatusLabel: opp.hasApplied ? formatApplicationStatus(opp.applicationStatus) : '',
                applicationStatusClass: opp.hasApplied ? getApplicationStatusClass(opp.applicationStatus) : ''
            };
            return templateRenderer.render(template, data);
        }).join('');
        
        container.innerHTML = html;
        
        // Attach click handlers
        container.querySelectorAll('.opportunity-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.dataset.id;
                if (id && !e.target.closest('.btn')) {
                    router.navigate(`/opportunities/${id}`);
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading opportunities:', error);
        container.innerHTML = '<div class="empty-state">Error loading opportunities. Please try again.</div>';
    }
}

function updateCategoryCounts(counts) {
    const mineCount = document.getElementById('count-mine');
    const appliedCount = document.getElementById('count-applied');
    const availableCount = document.getElementById('count-available');
    
    if (mineCount) mineCount.textContent = counts.mine;
    if (appliedCount) appliedCount.textContent = counts.applied;
    if (availableCount) availableCount.textContent = counts.available;
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'draft': 'secondary',
        'published': 'success',
        'closed': 'danger',
        'cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
}

function getCategoryClass(category) {
    const classMap = {
        'mine': 'category-mine',
        'applied': 'category-applied',
        'available': 'category-available'
    };
    return classMap[category] || '';
}

function getCategoryLabel(category) {
    const labelMap = {
        'mine': 'My Opportunity',
        'applied': 'Applied',
        'available': ''
    };
    return labelMap[category] || '';
}

function getCategoryIcon(category) {
    const iconMap = {
        'mine': 'ph-duotone ph-user-circle',
        'applied': 'ph-duotone ph-paper-plane-tilt',
        'available': ''
    };
    return iconMap[category] || '';
}

function formatModelType(modelType) {
    const types = {
        'project_based': 'Project-Based',
        'strategic_partnership': 'Strategic Partnership',
        'resource_pooling': 'Resource Pooling',
        'hiring': 'Hiring',
        'competition': 'Competition'
    };
    return types[modelType] || modelType;
}

function formatSubModelType(subModelType) {
    const types = {
        'task_based': 'Task-Based',
        'milestone_based': 'Milestone-Based',
        'retainer': 'Retainer',
        'joint_venture': 'Joint Venture',
        'consortium': 'Consortium',
        'strategic_alliance': 'Strategic Alliance',
        'equipment_sharing': 'Equipment Sharing',
        'facility_sharing': 'Facility Sharing',
        'talent_pooling': 'Talent Pooling',
        'full_time': 'Full-Time',
        'part_time': 'Part-Time',
        'contract': 'Contract',
        'innovation_challenge': 'Innovation Challenge',
        'hackathon': 'Hackathon',
        'pitch_competition': 'Pitch Competition',
        'professional_hiring': 'Professional Hiring',
        'consultant_hiring': 'Consultant Hiring',
        'competition_rfp': 'Competition/RFP',
        'bulk_purchasing': 'Bulk Purchasing',
        'resource_sharing': 'Resource Sharing',
        'strategic_jv': 'Strategic JV',
        'project_jv': 'Project JV',
        'spv': 'SPV',
        'mentorship': 'Mentorship'
    };
    return types[subModelType] || subModelType;
}

function formatApplicationStatus(status) {
    const statusMap = {
        'pending': 'Pending Review',
        'reviewing': 'Under Review',
        'shortlisted': 'Shortlisted',
        'accepted': 'Accepted',
        'rejected': 'Rejected',
        'withdrawn': 'Withdrawn'
    };
    return statusMap[status] || status;
}

function getApplicationStatusClass(status) {
    const classMap = {
        'pending': 'status-pending',
        'reviewing': 'status-reviewing',
        'shortlisted': 'status-shortlisted',
        'accepted': 'status-accepted',
        'rejected': 'status-rejected',
        'withdrawn': 'status-withdrawn'
    };
    return classMap[status] || '';
}
