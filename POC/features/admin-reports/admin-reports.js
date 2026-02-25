/**
 * Admin Reports & Analytics – aggregate from dataService
 * Multi-module reports with Chart.js visualizations
 */

let lastOffersPerOpportunity = [];
let lastOffersBySite = [];

/** @type {Record<string, import('chart.js').Chart>} */
const chartInstances = {};

const CHART_COLORS = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

function destroyChart(canvasId) {
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }
}

function createDoughnutChart(canvasId, labels, data, title) {
    const el = document.getElementById(canvasId);
    if (!el || typeof Chart === 'undefined') return;
    destroyChart(canvasId);
    const ctx = el.getContext('2d');
    const colors = CHART_COLORS.slice(0, Math.max(labels.length, data.length));
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.replace(/_/g, ' ')),
            datasets: [{ data, backgroundColor: colors, borderWidth: 1 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function createBarChart(canvasId, labels, data, title) {
    const el = document.getElementById(canvasId);
    if (!el || typeof Chart === 'undefined') return;
    destroyChart(canvasId);
    const ctx = el.getContext('2d');
    const colors = CHART_COLORS.slice(0, Math.max(labels.length, data.length));
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.replace(/_/g, ' ')),
            datasets: [{ label: title || 'Count', data, backgroundColor: colors, borderWidth: 0 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function setupModuleTabs() {
    const tabs = document.querySelectorAll('.report-tab');
    const panels = document.querySelectorAll('.report-module-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const module = tab.getAttribute('data-module');
            tabs.forEach(t => {
                t.classList.remove('report-tab-active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('report-tab-active');
            tab.setAttribute('aria-selected', 'true');
            panels.forEach(panel => {
                const isActive = panel.getAttribute('data-module') === module;
                panel.classList.toggle('report-module-panel-visible', isActive);
                panel.hidden = !isActive;
            });
            // Resize charts in the now-visible panel so they render correctly
            requestAnimationFrame(() => {
                Object.keys(chartInstances).forEach(id => {
                    const canvas = document.getElementById(id);
                    if (canvas && canvas.closest('.report-module-panel-visible')) {
                        chartInstances[id].resize();
                    }
                });
            });
        });
    });
}

async function initAdminReports() {
    if (!authService.canAccessAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    setupModuleTabs();
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
        Object.keys(chartInstances).forEach(id => destroyChart(id));

        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        const opportunities = await dataService.getOpportunities();
        const applications = await dataService.getApplications();
        const matches = await dataService.getMatches();
        const auditLogs = await dataService.getAuditLogs({});

        const totalPeople = users.length + companies.length;
        const statUsers = document.getElementById('stat-users');
        const statOpportunities = document.getElementById('stat-opportunities');
        const statApplications = document.getElementById('stat-applications');
        const statMatches = document.getElementById('stat-matches');
        if (statUsers) statUsers.textContent = totalPeople;
        if (statOpportunities) statOpportunities.textContent = opportunities.length;
        if (statApplications) statApplications.textContent = applications.length;
        if (statMatches) statMatches.textContent = matches.length;

        const allPeople = [...users, ...companies];
        const oppById = {};
        opportunities.forEach(o => { oppById[o.id] = o; });

        // User & company status and role
        const byStatus = {};
        const statusOrderUsers = ['pending', 'active', 'suspended', 'rejected', 'clarification_requested'];
        allPeople.forEach(p => {
            const s = p.status || 'active';
            byStatus[s] = (byStatus[s] || 0) + 1;
        });
        const userStatusLabels = statusOrderUsers.filter(s => byStatus[s]);
        const userStatusData = userStatusLabels.map(s => byStatus[s]);
        if (userStatusLabels.length) {
            createDoughnutChart('chart-overview-users-status', userStatusLabels, userStatusData);
            createDoughnutChart('chart-user-status', userStatusLabels, userStatusData);
        }

        const byRole = {};
        allPeople.forEach(p => {
            const r = p.role || 'unknown';
            byRole[r] = (byRole[r] || 0) + 1;
        });
        const userRoleLabels = Object.keys(byRole).sort((a, b) => byRole[b] - byRole[a]);
        const userRoleData = userRoleLabels.map(r => byRole[r]);
        if (userRoleLabels.length) {
            createDoughnutChart('chart-user-role', userRoleLabels, userRoleData);
        }

        // Opportunity status, model, intent
        const oppByStatus = {};
        const statusOrder = ['draft', 'published', 'in_negotiation', 'contracted', 'in_execution', 'completed', 'closed', 'cancelled'];
        opportunities.forEach(o => {
            const s = o.status || 'draft';
            oppByStatus[s] = (oppByStatus[s] || 0) + 1;
        });
        const oppStatusLabels = statusOrder.filter(s => oppByStatus[s]);
        const oppStatusData = oppStatusLabels.map(s => oppByStatus[s]);
        if (oppStatusLabels.length) {
            createDoughnutChart('chart-overview-opportunities-status', oppStatusLabels, oppStatusData);
            createDoughnutChart('chart-opportunity-status', oppStatusLabels, oppStatusData);
        }

        const oppByModel = {};
        opportunities.forEach(o => {
            const m = o.modelType || o.collaborationModel || 'unknown';
            oppByModel[m] = (oppByModel[m] || 0) + 1;
        });
        const oppModelLabels = Object.keys(oppByModel).sort((a, b) => oppByModel[b] - oppByModel[a]);
        const oppModelData = oppModelLabels.map(m => oppByModel[m]);
        if (oppModelLabels.length) {
            createDoughnutChart('chart-opportunity-model', oppModelLabels, oppModelData);
        }

        const oppByIntent = {};
        opportunities.forEach(o => {
            const i = o.intent || 'request';
            oppByIntent[i] = (oppByIntent[i] || 0) + 1;
        });
        const oppIntentLabels = Object.keys(oppByIntent);
        const oppIntentData = oppIntentLabels.map(i => oppByIntent[i]);
        if (oppIntentLabels.length) {
            createDoughnutChart('chart-opportunity-intent', oppIntentLabels, oppIntentData);
        }

        // Application status
        const appByStatus = {};
        const appOrder = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
        applications.forEach(a => {
            const s = a.status || 'pending';
            appByStatus[s] = (appByStatus[s] || 0) + 1;
        });
        const appStatusLabels = appOrder.filter(s => appByStatus[s]);
        const appStatusData = appStatusLabels.map(s => appByStatus[s]);
        if (appStatusLabels.length) {
            createDoughnutChart('chart-application-status', appStatusLabels, appStatusData);
        }

        // Matches: notified vs not, score bands
        const matchNotified = { notified: 0, 'not notified': 0 };
        matches.forEach(m => {
            if (m.notified) matchNotified.notified++;
            else matchNotified['not notified']++;
        });
        const matchNotifiedLabels = ['notified', 'not notified'];
        const matchNotifiedData = [matchNotified.notified, matchNotified['not notified']];
        if (matches.length) {
            createDoughnutChart('chart-matches-notified', matchNotifiedLabels, matchNotifiedData);
        }

        const scoreBands = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
        matches.forEach(m => {
            const score = m.matchScore != null ? Math.round(Number(m.matchScore)) : 50;
            const s = score <= 25 ? '0-25' : score <= 50 ? '26-50' : score <= 75 ? '51-75' : '76-100';
            scoreBands[s]++;
        });
        const scoreBandLabels = ['0-25', '26-50', '51-75', '76-100'];
        const scoreBandData = scoreBandLabels.map(b => scoreBands[b]);
        if (matches.length) {
            createBarChart('chart-matches-score-band', scoreBandLabels, scoreBandData, 'Matches');
        }

        // Audit (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAudit = auditLogs.filter(l => new Date(l.timestamp) >= thirtyDaysAgo);
        const auditByAction = {};
        recentAudit.forEach(l => {
            const a = l.action || 'unknown';
            auditByAction[a] = (auditByAction[a] || 0) + 1;
        });
        const auditLabels = Object.entries(auditByAction).sort((a, b) => b[1] - a[1]).map(([k]) => k);
        const auditData = Object.entries(auditByAction).sort((a, b) => b[1] - a[1]).map(([, v]) => v);
        if (auditLabels.length) {
            createBarChart('chart-audit-actions', auditLabels, auditData, 'Count');
        }

        const auditEl = document.getElementById('audit-summary');
        if (auditEl) {
            auditEl.innerHTML = auditLabels.length
                ? auditLabels.map((action, i) => `
                    <div class="report-row">
                        <span class="report-label">${action.replace(/_/g, ' ')}</span>
                        <span class="report-value">${auditData[i]}</span>
                    </div>
                `).join('')
                : '<p class="text-muted">No audit activity in the last 30 days</p>';
        }

        // Offers per opportunity (table)
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

        // Offers by site (table)
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
