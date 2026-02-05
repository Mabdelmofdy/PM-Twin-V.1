/**
 * Admin Reports & Analytics – aggregate from dataService
 */

async function initAdminReports() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    await loadReports();
}

async function loadReports() {
    try {
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        const opportunities = await dataService.getOpportunities();
        const applications = await dataService.getApplications();
        const matches = await dataService.getMatches();
        const auditLogs = await dataService.getAuditLogs({});

        const totalPeople = users.length + companies.length;
        document.getElementById('stat-users').textContent = totalPeople;
        document.getElementById('stat-opportunities').textContent = opportunities.length;
        document.getElementById('stat-applications').textContent = applications.length;
        document.getElementById('stat-matches').textContent = matches.length;

        // Opportunity status distribution
        const oppByStatus = {};
        opportunities.forEach(o => {
            const s = o.status || 'draft';
            oppByStatus[s] = (oppByStatus[s] || 0) + 1;
        });
        const oppStatusEl = document.getElementById('opportunity-status-chart');
        const statusOrder = ['draft', 'published', 'in_negotiation', 'contracted', 'in_execution', 'completed', 'closed', 'cancelled'];
        oppStatusEl.innerHTML = statusOrder.filter(s => oppByStatus[s]).map(s => `
            <div class="report-row">
                <span class="report-label">${s.replace(/_/g, ' ')}</span>
                <span class="report-value">${oppByStatus[s]}</span>
            </div>
        `).join('') || '<p class="text-muted">No opportunities</p>';

        // Application status distribution
        const appByStatus = {};
        applications.forEach(a => {
            const s = a.status || 'pending';
            appByStatus[s] = (appByStatus[s] || 0) + 1;
        });
        const appStatusEl = document.getElementById('application-status-chart');
        const appOrder = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
        appStatusEl.innerHTML = appOrder.filter(s => appByStatus[s]).map(s => `
            <div class="report-row">
                <span class="report-label">${s}</span>
                <span class="report-value">${appByStatus[s]}</span>
            </div>
        `).join('') || '<p class="text-muted">No applications</p>';

        // Recent audit (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAudit = auditLogs.filter(l => new Date(l.timestamp) >= thirtyDaysAgo);
        const auditByAction = {};
        recentAudit.forEach(l => {
            const a = l.action || 'unknown';
            auditByAction[a] = (auditByAction[a] || 0) + 1;
        });
        const auditEl = document.getElementById('audit-summary');
        auditEl.innerHTML = Object.entries(auditByAction)
            .sort((a, b) => b[1] - a[1])
            .map(([action, count]) => `
            <div class="report-row">
                <span class="report-label">${action.replace(/_/g, ' ')}</span>
                <span class="report-value">${count}</span>
            </div>
        `).join('') || '<p class="text-muted">No audit activity in the last 30 days</p>';
    } catch (err) {
        console.error('Error loading reports:', err);
    }
}
