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
        const opportunityIcon = IconHelper ? IconHelper.render('briefcase', { size: 40, weight: 'duotone', color: 'currentColor' }) : '';
        const plusIcon = IconHelper ? IconHelper.render('plus', { size: 20, weight: 'duotone', color: 'currentColor', className: 'mr-2' }) : '';
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-8 text-center min-h-[300px]">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/90 to-primary-light flex items-center justify-center mb-6 text-white opacity-90">
                    ${opportunityIcon}
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">No opportunities yet</h3>
                <p class="text-base text-gray-600 max-w-md mb-8 leading-relaxed">Start building your network by creating your first opportunity. Share projects, find partners, and grow together.</p>
                <a href="#" data-route="/opportunities/create" class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg no-underline">
                    ${plusIcon}
                    Create Your First Opportunity
                </a>
            </div>
        `;
        return;
    }
    
    // Load template
    const template = await templateLoader.load('opportunity-card');
    
    // Render each opportunity
    const html = opportunities.map(opp => {
        const data = {
            ...opp,
            intentLabel: opp.intent === 'offer' ? 'OFFER' : 'REQUEST',
            intentBadgeClass: typeof getIntentBadgeClass === 'function' ? getIntentBadgeClass(opp.intent, opp.modelType) : 'badge-intent-request-default',
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
        const usersIcon = IconHelper ? IconHelper.render('users', { size: 40, weight: 'duotone', color: 'currentColor' }) : '';
        const searchIcon = IconHelper ? IconHelper.render('search', { size: 20, weight: 'duotone', color: 'currentColor', className: 'mr-2' }) : '';
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-8 text-center min-h-[300px]">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/90 to-primary-light flex items-center justify-center mb-6 text-white opacity-90">
                    ${usersIcon}
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">No applications yet</h3>
                <p class="text-base text-gray-600 max-w-md mb-8 leading-relaxed">When you apply to opportunities, they'll appear here. Start exploring available opportunities to get started.</p>
                <a href="#" data-route="/opportunities" class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg no-underline">
                    ${searchIcon}
                    Browse Opportunities
                </a>
            </div>
        `;
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
        'draft': 'secondary',
        'published': 'success',
        'in_negotiation': 'warning',
        'contracted': 'primary',
        'in_execution': 'primary',
        'completed': 'success',
        'closed': 'danger',
        'cancelled': 'danger',
        'pending': 'warning',
        'reviewing': 'primary',
        'shortlisted': 'primary',
        'accepted': 'success',
        'rejected': 'danger',
        'withdrawn': 'secondary'
    };
    return statusMap[status] || 'secondary';
}
