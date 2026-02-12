/**
 * Admin Reports & Analytics – aggregate from dataService
 */

let lastOffersPerOpportunity = [];
let lastOffersBySite = [];

async function initAdminReports() {
    if (!authService.canAccessAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    await loadReports();
    setupExportButtons();
}

function setupExportButtons() {
    const exportBySite = document.getElementById('export-offers-by-site-csv');
    const exportPerOpp = document.getElementById('export-offers-per-opp-csv');
    if (exportBySite) {
        exportBySite.addEventListener('click', () => exportOffersBySiteCSV());
    }
    if (exportPerOpp) {
        exportPerOpp.addEventListener('click', () => exportOffersPerOpportunityCSV());
    }
}

function downloadCSV(filename, rows, headers) {
    const escape = (v) => {
        const s = String(v == null ? '' : v);
        if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    };
    const line = (row) => headers.map(h => escape(row[h])).join(',');
    const csv = [headers.join(','), ...rows.map(row => line(row))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

function exportOffersBySiteCSV() {
    const headers = ['Site', 'Offers Count'];
    const rows = lastOffersBySite.map(({ site, count }) => ({ Site: site, 'Offers Count': count }));
    downloadCSV('offers-by-site.csv', rows, headers);
}

function exportOffersPerOpportunityCSV() {
    const headers = ['Opportunity ID', 'Title', 'Offers Count'];
    const rows = lastOffersPerOpportunity.map(({ id, title, count }) => ({ 'Opportunity ID': id, 'Title': title, 'Offers Count': count }));
    downloadCSV('offers-per-opportunity.csv', rows, headers);
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

        // User & company status distribution
        const allPeople = [...users, ...companies];
        const byStatus = {};
        allPeople.forEach(p => {
            const s = p.status || 'active';
            byStatus[s] = (byStatus[s] || 0) + 1;
        });
        const userStatusEl = document.getElementById('user-status-chart');
        if (userStatusEl) {
            const statusOrder = ['pending', 'active', 'suspended', 'rejected', 'clarification_requested'];
            userStatusEl.innerHTML = statusOrder.filter(s => byStatus[s]).map(s => `
                <div class="report-row">
                    <span class="report-label">${s.replace(/_/g, ' ')}</span>
                    <span class="report-value">${byStatus[s]}</span>
                </div>
            `).join('') || '<p class="text-muted">No users</p>';
        }

        // User & company by role
        const byRole = {};
        allPeople.forEach(p => {
            const r = p.role || 'unknown';
            byRole[r] = (byRole[r] || 0) + 1;
        });
        const userRoleEl = document.getElementById('user-role-chart');
        if (userRoleEl) {
            userRoleEl.innerHTML = Object.entries(byRole)
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => `
                <div class="report-row">
                    <span class="report-label">${role.replace(/_/g, ' ')}</span>
                    <span class="report-value">${count}</span>
                </div>
            `).join('') || '<p class="text-muted">No users</p>';
        }

        // Opportunity by model type
        const oppByModel = {};
        opportunities.forEach(o => {
            const m = o.modelType || o.collaborationModel || 'unknown';
            oppByModel[m] = (oppByModel[m] || 0) + 1;
        });
        const oppModelEl = document.getElementById('opportunity-model-chart');
        if (oppModelEl) {
            oppModelEl.innerHTML = Object.entries(oppByModel)
                .sort((a, b) => b[1] - a[1])
                .map(([model, count]) => `
                <div class="report-row">
                    <span class="report-label">${model.replace(/_/g, ' ')}</span>
                    <span class="report-value">${count}</span>
                </div>
            `).join('') || '<p class="text-muted">No opportunities</p>';
        }

        // Opportunity by intent (request/offer)
        const oppByIntent = {};
        opportunities.forEach(o => {
            const i = o.intent || 'request';
            oppByIntent[i] = (oppByIntent[i] || 0) + 1;
        });
        const oppIntentEl = document.getElementById('opportunity-intent-chart');
        if (oppIntentEl) {
            oppIntentEl.innerHTML = Object.entries(oppByIntent)
                .map(([intent, count]) => `
                <div class="report-row">
                    <span class="report-label">${intent}</span>
                    <span class="report-value">${count}</span>
                </div>
            `).join('') || '<p class="text-muted">No opportunities</p>';
        }

        // Offers (applications) per opportunity
        const offersPerOpp = await Promise.all(
            opportunities.map(async (o) => ({
                id: o.id,
                title: o.title || o.id,
                count: await dataService.getApplicationCountByOpportunityId(o.id)
            }))
        );
        offersPerOpp.sort((a, b) => b.count - a.count);
        lastOffersPerOpportunity = offersPerOpp;
        const offersPerOppEl = document.getElementById('offers-per-opportunity');
        if (offersPerOppEl) {
            if (offersPerOpp.length === 0) {
                offersPerOppEl.innerHTML = '<p class="text-muted">No opportunities</p>';
            } else {
                offersPerOppEl.innerHTML = `
                    <table class="report-table">
                        <thead><tr><th>Opportunity</th><th>Title</th><th># Offers</th></tr></thead>
                        <tbody>
                            ${offersPerOpp.map(o => `
                                <tr>
                                    <td><code>${escapeHtml(o.id)}</code></td>
                                    <td>${escapeHtml(o.title)}</td>
                                    <td>${o.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        }

        // Offers by site (location): group applications by opportunity's location
        const oppById = {};
        opportunities.forEach(o => { oppById[o.id] = o; });
        const bySite = {};
        applications.forEach((app) => {
            const opp = oppById[app.opportunityId];
            const site = opp
                ? (opp.location || opp.locationRegion || opp.locationCity || 'Unknown').trim() || 'Unknown'
                : 'Unknown';
            bySite[site] = (bySite[site] || 0) + 1;
        });
        lastOffersBySite = Object.entries(bySite)
            .map(([site, count]) => ({ site, count }))
            .sort((a, b) => b.count - a.count);
        const offersBySiteEl = document.getElementById('offers-by-site');
        if (offersBySiteEl) {
            if (lastOffersBySite.length === 0) {
                offersBySiteEl.innerHTML = '<p class="text-muted">No applications / no location data</p>';
            } else {
                offersBySiteEl.innerHTML = `
                    <table class="report-table">
                        <thead><tr><th>Site / Location</th><th># Offers</th></tr></thead>
                        <tbody>
                            ${lastOffersBySite.map(({ site, count }) => `
                                <tr><td>${escapeHtml(site)}</td><td>${count}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        }
    } catch (err) {
        console.error('Error loading reports:', err);
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
