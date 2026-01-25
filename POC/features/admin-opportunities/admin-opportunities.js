/**
 * Admin Opportunities Component
 */

async function initAdminOpportunities() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    
    await loadOpportunities();
    setupFilters();
}

async function loadOpportunities() {
    const container = document.getElementById('opportunities-list');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        let opportunities = await dataService.getOpportunities();
        
        // Apply filters
        const statusFilter = document.getElementById('filter-status')?.value;
        const modelFilter = document.getElementById('filter-model')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        
        if (statusFilter) {
            opportunities = opportunities.filter(o => o.status === statusFilter);
        }
        
        if (modelFilter) {
            opportunities = opportunities.filter(o => o.modelType === modelFilter);
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
            container.innerHTML = '<div class="empty-state">No opportunities found</div>';
            return;
        }
        
        // Load creator info
        const oppsWithCreators = await Promise.all(
            opportunities.map(async (opp) => {
                const creator = await dataService.getUserById(opp.creatorId);
                return { ...opp, creator };
            })
        );
        
        container.innerHTML = oppsWithCreators.map(opp => createOpportunityCard(opp)).join('');
        
        // Attach event handlers
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const oppId = btn.dataset.opportunityId;
                handleOpportunityAction(action, oppId);
            });
        });
        
    } catch (error) {
        console.error('Error loading opportunities:', error);
        container.innerHTML = '<div class="empty-state">Error loading opportunities</div>';
    }
}

function createOpportunityCard(opportunity) {
    return `
        <div class="card">
            <div class="card-header">
                <h3>${opportunity.title || 'Untitled'}</h3>
                <div>
                    <span class="badge badge-primary">${opportunity.modelType || 'N/A'}</span>
                    <span class="badge badge-${getStatusBadgeClass(opportunity.status)}">${opportunity.status || 'draft'}</span>
                </div>
            </div>
            <div class="card-body">
                <p>${opportunity.description || 'No description'}</p>
                <p class="text-muted" style="font-size: var(--font-size-sm); margin-top: var(--spacing-md);">
                    Created by: ${opportunity.creator?.email || 'Unknown'} | 
                    ${new Date(opportunity.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div class="card-footer">
                <a href="/opportunities/${opportunity.id}" class="btn btn-secondary btn-sm">View</a>
                ${opportunity.status === 'published' ? `
                    <button data-action="close" data-opportunity-id="${opportunity.id}" class="btn btn-warning btn-sm">Close</button>
                ` : ''}
                <button data-action="delete" data-opportunity-id="${opportunity.id}" class="btn btn-danger btn-sm">Delete</button>
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

function setupFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const searchInput = document.getElementById('filter-search');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            loadOpportunities();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadOpportunities();
            }
        });
    }
}

async function handleOpportunityAction(action, opportunityId) {
    switch (action) {
        case 'close':
            await closeOpportunity(opportunityId);
            break;
        case 'delete':
            await deleteOpportunity(opportunityId);
            break;
    }
}

async function closeOpportunity(opportunityId) {
    if (!confirm('Close this opportunity?')) return;
    
    try {
        await dataService.updateOpportunity(opportunityId, { status: 'closed' });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'opportunity_closed',
            entityType: 'opportunity',
            entityId: opportunityId,
            details: {}
        });
        
        alert('Opportunity closed');
        await loadOpportunities();
        
    } catch (error) {
        console.error('Error closing opportunity:', error);
        alert('Failed to close opportunity');
    }
}

async function deleteOpportunity(opportunityId) {
    if (!confirm('Delete this opportunity? This action cannot be undone.')) return;
    
    try {
        await dataService.deleteOpportunity(opportunityId);
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'opportunity_deleted',
            entityType: 'opportunity',
            entityId: opportunityId,
            details: {}
        });
        
        alert('Opportunity deleted');
        await loadOpportunities();
        
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity');
    }
}
