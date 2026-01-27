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
        await displayRecentOpportunities(userOpportunities.slice(0, 5));
        
        // Display recent applications
        await displayRecentApplications(userApplications.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function displayRecentOpportunities(opportunities) {
    const container = document.getElementById('recent-opportunities');
    if (!container) return;
    
    if (opportunities.length === 0) {
        container.innerHTML = '<p class="text-muted">No opportunities yet. <a href="#" data-route="/opportunities/create">Create your first opportunity</a></p>';
        return;
    }
    
    // Load template
    const template = await templateLoader.load('opportunity-card');
    
    // Render each opportunity
    const html = opportunities.map(opp => {
        const data = {
            ...opp,
            statusBadgeClass: getStatusBadgeClass(opp.status),
            createdDate: new Date(opp.createdAt).toLocaleDateString(),
            description: opp.description || 'No description',
            isOwner: true,
            canApply: false
        };
        return templateRenderer.render(template, data);
    }).join('');
    
    container.innerHTML = html;
}

async function displayRecentApplications(applications) {
    const container = document.getElementById('recent-applications');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = '<p class="text-muted">No applications yet.</p>';
        return;
    }
    
    // Load opportunity details for each application
    const appsWithOpps = await Promise.all(
        applications.map(async (app) => {
            const opportunity = await dataService.getOpportunityById(app.opportunityId);
            return { ...app, opportunity };
        })
    );
    
    // Load template
    const template = await templateLoader.load('application-card');
    
    // Render each application
    const html = appsWithOpps.map(app => {
        const data = {
            ...app,
            statusBadgeClass: getStatusBadgeClass(app.status),
            createdDate: new Date(app.createdAt).toLocaleDateString()
        };
        return templateRenderer.render(template, data);
    }).join('');
    
    container.innerHTML = html;
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
