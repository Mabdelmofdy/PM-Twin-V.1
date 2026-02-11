/**
 * Pipeline Management Component
 */

async function initPipeline() {
    setupTabs();
    setupOpportunitiesIntentFilter();
    setupApplicationsIntentFilter();
    await loadPipelineData();
}

function setupOpportunitiesIntentFilter() {
    const filterEl = document.getElementById('filter-opportunities-intent');
    if (filterEl) {
        filterEl.addEventListener('change', () => loadOpportunitiesPipeline());
    }
}

function setupApplicationsIntentFilter() {
    const filterEl = document.getElementById('filter-applications-intent');
    if (filterEl) {
        filterEl.addEventListener('change', () => loadApplicationsPipeline());
    }
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
        let userOpportunities = allOpportunities.filter(o => o.creatorId === user.id);
        
        // Apply intent filter (show only OFFER or only REQUEST)
        const intentFilter = document.getElementById('filter-opportunities-intent')?.value;
        if (intentFilter === 'request' || intentFilter === 'offer') {
            userOpportunities = userOpportunities.filter(o => (o.intent || 'request') === intentFilter);
        }
        
        const draft = userOpportunities.filter(o => o.status === 'draft');
        const published = userOpportunities.filter(o => o.status === 'published');
        const inProgress = userOpportunities.filter(o =>
            o.status === 'in_negotiation' || o.status === 'contracted' || o.status === 'in_execution'
        );
        const closed = userOpportunities.filter(o =>
            o.status === 'closed' || o.status === 'cancelled' || o.status === 'completed'
        );
        
        await renderKanbanColumn('kanban-draft', draft);
        await renderKanbanColumn('kanban-published', published);
        await renderKanbanColumn('kanban-in-progress', inProgress);
        await renderKanbanColumn('kanban-closed', closed);
        
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
        let appsWithOpps = await Promise.all(
            userApplications.map(async (app) => {
                const opportunity = await dataService.getOpportunityById(app.opportunityId);
                return { ...app, opportunity };
            })
        );
        
        // Apply intent filter (proposals for offers vs requests)
        const intentFilter = document.getElementById('filter-applications-intent')?.value;
        if (intentFilter === 'request' || intentFilter === 'offer') {
            appsWithOpps = appsWithOpps.filter(a => (a.opportunity?.intent || 'request') === intentFilter);
        }
        
        await renderApplicationColumn('kanban-app-pending', appsWithOpps.filter(a => a.status === 'pending'));
        await renderApplicationColumn('kanban-app-reviewing', appsWithOpps.filter(a => a.status === 'reviewing'));
        await renderApplicationColumn('kanban-app-shortlisted', appsWithOpps.filter(a => a.status === 'shortlisted'));
        await renderApplicationColumn('kanban-app-accepted', appsWithOpps.filter(a => a.status === 'accepted'));
        await renderApplicationColumn('kanban-app-rejected', appsWithOpps.filter(a => a.status === 'rejected'));
        
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
        
        // Load template
        const template = await templateLoader.load('match-card');
        
        // Render matches
        const html = matches.map(match => {
            const data = {
                ...match,
                opportunity: {
                    ...match.opportunity,
                    description: match.opportunity.description || 'No description'
                },
                matchScorePercent: Math.round(match.matchScore * 100)
            };
            return templateRenderer.render(template, data);
        }).join('');
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading matches:', error);
        container.innerHTML = '<div class="empty-state">Error loading matches. Please try again.</div>';
    }
}

async function renderKanbanColumn(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; padding: var(--spacing-lg);">No items</p>';
        return;
    }
    
    // Load template
    const template = await templateLoader.load('kanban-item');
    
    // Render items
    const html = items.map(item => {
        const intent = item.intent || 'request';
        const intentLabel = intent === 'offer' ? 'OFFER' : 'REQUEST';
        const intentBadgeClass = typeof getIntentBadgeClass === 'function'
            ? getIntentBadgeClass(intent, item.modelType)
            : (intent === 'offer' ? 'badge-info' : 'badge-primary');
        const data = {
            ...item,
            title: item.title || 'Untitled',
            modelType: item.modelType || 'N/A',
            createdDate: new Date(item.createdAt).toLocaleDateString(),
            intentLabel,
            intentBadgeClass
        };
        return templateRenderer.render(template, data);
    }).join('');
    
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.kanban-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            router.navigate(`/opportunities/${id}`);
        });
    });
}

async function renderApplicationColumn(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align: center; padding: var(--spacing-lg);">No items</p>';
        return;
    }
    
    // Load template
    const template = await templateLoader.load('application-kanban-item');
    
    // Render items
    const html = items.map(item => {
        const intent = item.opportunity?.intent || 'request';
        const intentLabel = intent === 'offer' ? 'OFFER' : 'REQUEST';
        const intentBadgeClass = typeof getIntentBadgeClass === 'function'
            ? getIntentBadgeClass(intent, item.opportunity?.modelType)
            : (intent === 'offer' ? 'badge-info' : 'badge-primary');
        const data = {
            ...item,
            opportunity: {
                title: item.opportunity?.title || 'Unknown Opportunity'
            },
            createdDate: new Date(item.createdAt).toLocaleDateString(),
            intentLabel,
            intentBadgeClass
        };
        return templateRenderer.render(template, data);
    }).join('');
    
    container.innerHTML = html;
    
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
