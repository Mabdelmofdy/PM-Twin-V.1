/**
 * Opportunities List Component
 */

async function initOpportunities() {
    await loadOpportunities();
    
    // Setup filters
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
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
        
        // Apply filters
        const modelFilter = document.getElementById('filter-model')?.value;
        const statusFilter = document.getElementById('filter-status')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        
        if (modelFilter) {
            opportunities = opportunities.filter(o => o.modelType === modelFilter);
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
        
        // Sort by created date (newest first)
        opportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (opportunities.length === 0) {
            container.innerHTML = '<div class="empty-state">No opportunities found. <a href="/opportunities/create">Create the first one!</a></div>';
            return;
        }
        
        container.innerHTML = opportunities.map(opp => createOpportunityCard(opp, user)).join('');
        
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

function createOpportunityCard(opportunity, user) {
    const isOwner = user && opportunity.creatorId === user.id;
    const canApply = user && !isOwner && opportunity.status === 'published';
    
    return `
        <div class="opportunity-card" data-id="${opportunity.id}">
            <div class="opportunity-header">
                <div>
                    <h3 class="opportunity-title">${opportunity.title || 'Untitled Opportunity'}</h3>
                    <div class="opportunity-meta">
                        <span class="badge badge-primary">${opportunity.modelType || 'N/A'}</span>
                        <span class="badge badge-${getStatusBadgeClass(opportunity.status)}">${opportunity.status || 'draft'}</span>
                    </div>
                </div>
            </div>
            <div class="opportunity-description">
                ${opportunity.description || 'No description available'}
            </div>
            <div class="opportunity-footer">
                <span class="text-muted" style="font-size: var(--font-size-xs);">
                    ${new Date(opportunity.createdAt).toLocaleDateString()}
                </span>
                ${isOwner ? `
                    <a href="/opportunities/${opportunity.id}" class="btn btn-sm btn-secondary">Manage</a>
                ` : canApply ? `
                    <a href="/opportunities/${opportunity.id}" class="btn btn-sm btn-primary">View & Apply</a>
                ` : `
                    <a href="/opportunities/${opportunity.id}" class="btn btn-sm btn-secondary">View</a>
                `}
            </div>
        </div>
    `;
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
