/**
 * Pipeline Management Component
 */

async function initPipeline() {
    setupTabs();
    await loadPipelineData();
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            
            const targetTab = document.getElementById(`tab-${tabName}`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
            }
            
            // Reload data for active tab
            if (tabName === 'opportunities') {
                loadOpportunitiesPipeline();
            } else if (tabName === 'applications') {
                loadApplicationsPipeline();
            } else if (tabName === 'matches') {
                loadMatchesPipeline();
            }
        });
    });
}

async function loadPipelineData() {
    await loadOpportunitiesPipeline();
}

async function loadOpportunitiesPipeline() {
    const user = authService.getCurrentUser();
    if (!user) return;
    
    try {
        const allOpportunities = await dataService.getOpportunities();
        const userOpportunities = allOpportunities.filter(o => o.creatorId === user.id);
        
        // Group by status
        const draft = userOpportunities.filter(o => o.status === 'draft');
        const published = userOpportunities.filter(o => o.status === 'published');
        const closed = userOpportunities.filter(o => o.status === 'closed' || o.status === 'cancelled');
        
        // In progress = published with applications
        const allApplications = await dataService.getApplications();
        const inProgress = published.filter(o => {
            const hasApplications = allApplications.some(a => a.opportunityId === o.id);
            return hasApplications;
        });
        
        renderKanbanColumn('kanban-draft', draft);
        renderKanbanColumn('kanban-published', published.filter(o => !inProgress.includes(o)));
        renderKanbanColumn('kanban-in-progress', inProgress);
        renderKanbanColumn('kanban-closed', closed);
        
    } catch (error) {
        console.error('Error loading opportunities pipeline:', error);
    }
}

async function loadApplicationsPipeline() {
    const user = authService.getCurrentUser();
    if (!user) return;
    
    try {
        const allApplications = await dataService.getApplications();
        const userApplications = allApplications.filter(a => a.applicantId === user.id);
        
        // Group by status
        const pending = userApplications.filter(a => a.status === 'pending');
        const reviewing = userApplications.filter(a => a.status === 'reviewing');
        const shortlisted = userApplications.filter(a => a.status === 'shortlisted');
        const accepted = userApplications.filter(a => a.status === 'accepted');
        const rejected = userApplications.filter(a => a.status === 'rejected');
        
        // Load opportunity details
        const appsWithOpps = await Promise.all(
            userApplications.map(async (app) => {
                const opportunity = await dataService.getOpportunityById(app.opportunityId);
                return { ...app, opportunity };
            })
        );
        
        renderApplicationColumn('kanban-app-pending', appsWithOpps.filter(a => a.status === 'pending'));
        renderApplicationColumn('kanban-app-reviewing', appsWithOpps.filter(a => a.status === 'reviewing'));
        renderApplicationColumn('kanban-app-shortlisted', appsWithOpps.filter(a => a.status === 'shortlisted'));
        renderApplicationColumn('kanban-app-accepted', appsWithOpps.filter(a => a.status === 'accepted'));
        renderApplicationColumn('kanban-app-rejected', appsWithOpps.filter(a => a.status === 'rejected'));
        
    } catch (error) {
        console.error('Error loading applications pipeline:', error);
    }
}

async function loadMatchesPipeline() {
    const user = authService.getCurrentUser();
    if (!user) return;
    
    const container = document.getElementById('matches-list');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        const matches = await matchingService.findOpportunitiesForCandidate(user.id);
        
        if (matches.length === 0) {
            container.innerHTML = '<div class="empty-state">No matches found. Keep your profile updated to receive matches!</div>';
            return;
        }
        
        container.innerHTML = matches.map(match => `
            <div class="card">
                <div class="card-header">
                    <h3>${match.opportunity.title}</h3>
                    <span class="badge badge-success">${Math.round(match.matchScore * 100)}% Match</span>
                </div>
                <div class="card-body">
                    <p>${match.opportunity.description || 'No description'}</p>
                    <p class="text-muted" style="font-size: var(--font-size-sm); margin-top: var(--spacing-md);">
                        Model: ${match.opportunity.modelType} | 
                        Status: ${match.opportunity.status}
                    </p>
                </div>
                <div class="card-footer">
                    <a href="/opportunities/${match.opportunity.id}" class="btn btn-primary btn-sm">View & Apply</a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading matches:', error);
        container.innerHTML = '<div class="empty-state">Error loading matches. Please try again.</div>';
    }
}

function renderKanbanColumn(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; padding: var(--spacing-lg);">No items</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="kanban-item" data-id="${item.id}">
            <div class="kanban-item-title">${item.title || 'Untitled'}</div>
            <div class="kanban-item-meta">
                ${item.modelType || 'N/A'} | ${new Date(item.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.kanban-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            router.navigate(`/opportunities/${id}`);
        });
    });
}

function renderApplicationColumn(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; padding: var(--spacing-lg);">No items</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="kanban-item" data-id="${item.id}">
            <div class="kanban-item-title">${item.opportunity?.title || 'Unknown Opportunity'}</div>
            <div class="kanban-item-meta">
                Applied: ${new Date(item.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.kanban-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const application = items.find(a => a.id === id);
            if (application && application.opportunity) {
                router.navigate(`/opportunities/${application.opportunity.id}`);
            }
        });
    });
}
