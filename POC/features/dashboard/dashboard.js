/**
 * Dashboard Component
 */

async function initDashboard() {
    const user = authService.getCurrentUser();
    if (!user) {
        router.navigate(CONFIG.ROUTES.LOGIN);
        return;
    }
    
    // Set user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.profile?.name || user.email;
    }
    
    // Load dashboard data
    await loadDashboardData(user.id);
}

async function loadDashboardData(userId) {
    try {
        // Load opportunities
        const allOpportunities = await dataService.getOpportunities();
        const userOpportunities = allOpportunities.filter(o => o.creatorId === userId);
        document.getElementById('stat-opportunities').textContent = userOpportunities.length;
        
        // Load applications
        const allApplications = await dataService.getApplications();
        const userApplications = allApplications.filter(a => a.applicantId === userId);
        document.getElementById('stat-applications').textContent = userApplications.length;
        
        // Load matches
        const allMatches = await dataService.getMatches();
        const userMatches = allMatches.filter(m => m.candidateId === userId);
        document.getElementById('stat-matches').textContent = userMatches.length;
        
        // Load notifications
        const notifications = await dataService.getNotifications(userId);
        const unreadCount = notifications.filter(n => !n.read).length;
        document.getElementById('stat-notifications').textContent = unreadCount;
        
        // Display recent opportunities
        displayRecentOpportunities(userOpportunities.slice(0, 5));
        
        // Display recent applications
        displayRecentApplications(userApplications.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayRecentOpportunities(opportunities) {
    const container = document.getElementById('recent-opportunities');
    if (!container) return;
    
    if (opportunities.length === 0) {
        container.innerHTML = '<p class="text-muted">No opportunities yet. <a href="/opportunities/create">Create your first opportunity</a></p>';
        return;
    }
    
    container.innerHTML = opportunities.map(opp => `
        <div class="card" style="margin-bottom: var(--spacing-md);">
            <div class="card-header">
                <h3 class="card-title">${opp.title}</h3>
                <span class="badge badge-primary">${opp.modelType}</span>
            </div>
            <div class="card-body">
                <p>${opp.description || 'No description'}</p>
                <p class="text-muted" style="font-size: var(--font-size-sm);">
                    Status: <strong>${opp.status}</strong> | 
                    Created: ${new Date(opp.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div class="card-footer">
                <a href="/opportunities/${opp.id}" class="btn btn-sm btn-secondary">View Details</a>
            </div>
        </div>
    `).join('');
}

function displayRecentApplications(applications) {
    const container = document.getElementById('recent-applications');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = '<p class="text-muted">No applications yet.</p>';
        return;
    }
    
    // Load opportunity details for each application
    Promise.all(applications.map(async (app) => {
        const opportunity = await dataService.getOpportunityById(app.opportunityId);
        return { ...app, opportunity };
    })).then(appsWithOpps => {
        container.innerHTML = appsWithOpps.map(app => `
            <div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-header">
                    <h3 class="card-title">${app.opportunity?.title || 'Unknown Opportunity'}</h3>
                    <span class="badge badge-${getStatusBadgeClass(app.status)}">${app.status}</span>
                </div>
                <div class="card-body">
                    <p class="text-muted" style="font-size: var(--font-size-sm);">
                        Applied: ${new Date(app.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        `).join('');
    });
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'pending': 'warning',
        'reviewing': 'primary',
        'shortlisted': 'primary',
        'accepted': 'success',
        'rejected': 'danger',
        'withdrawn': 'secondary'
    };
    return statusMap[status] || 'secondary';
}
