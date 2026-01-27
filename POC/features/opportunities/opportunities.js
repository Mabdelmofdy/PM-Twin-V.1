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
            container.innerHTML = '<div class="empty-state">No opportunities found. <a href="#" data-route="/opportunities/create">Create the first one!</a></div>';
            return;
        }
        
        // Load template
        const template = await templateLoader.load('opportunity-card');
        
        // Render opportunities
        const html = opportunities.map(opp => {
            const isOwner = user && opp.creatorId === user.id;
            const canApply = user && !isOwner && opp.status === 'published';
            
            const data = {
                ...opp,
                title: opp.title || 'Untitled Opportunity',
                modelType: opp.modelType || 'N/A',
                status: opp.status || 'draft',
                statusBadgeClass: getStatusBadgeClass(opp.status),
                description: opp.description || 'No description available',
                createdDate: new Date(opp.createdAt).toLocaleDateString(),
                isOwner,
                canApply
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

function getStatusBadgeClass(status) {
    const statusMap = {
        'draft': 'secondary',
        'published': 'success',
        'closed': 'danger',
        'cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
}
