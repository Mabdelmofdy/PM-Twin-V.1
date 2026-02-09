/**
 * Admin Audit Component
 */

async function initAdminAudit() {
    if (!authService.canAccessAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }

    await loadUsersForFilter();
    await loadAuditLogs();
    setupFilters();
}

async function loadUsersForFilter() {
    const userSelect = document.getElementById('filter-user');
    if (!userSelect) return;
    
    try {
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        const allPeople = [...users, ...companies];
        userSelect.innerHTML = '<option value="">All Users & Companies</option>' +
            allPeople.map(u => {
                const typeLabel = u.profile?.type === 'company' ? ' (Company)' : '';
                return `<option value="${u.id}">${u.email}${typeLabel}</option>`;
            }).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadAuditLogs() {
    const container = document.getElementById('audit-logs');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        const filters = {
            userId: document.getElementById('filter-user')?.value || undefined,
            entityType: document.getElementById('filter-entity-type')?.value || undefined,
            startDate: document.getElementById('filter-start-date')?.value || undefined,
            endDate: document.getElementById('filter-end-date')?.value || undefined
        };

        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === '') delete filters[key];
        });

        let logs = await dataService.getAuditLogs(filters);

        const actionFilter = document.getElementById('filter-action')?.value;
        if (actionFilter) {
            logs = logs.filter(log => log.action === actionFilter);
        }

        const searchFilter = document.getElementById('filter-search')?.value?.toLowerCase();
        if (searchFilter) {
            logs = logs.filter(log => {
                const actionMatch = (log.action || '').toLowerCase().includes(searchFilter);
                const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : '';
                const entityMatch = (log.entityType || '').toLowerCase().includes(searchFilter);
                return actionMatch || detailsStr.includes(searchFilter) || entityMatch;
            });
        }

        // Load user/company info for each log
        const logsWithUsers = await Promise.all(
            logs.map(async (log) => {
                const user = await dataService.getUserOrCompanyById(log.userId);
                return { ...log, user };
            })
        );
        
        if (logsWithUsers.length === 0) {
            delete container.dataset.exportLogs;
            container.innerHTML = '<div class="empty-state">No audit logs found</div>';
            return;
        }

        // Load template
        const template = await templateLoader.load('audit-log-item');
        
        // Render audit logs
        const html = logsWithUsers.map(log => {
            const data = {
                ...log,
                actionFormatted: log.action.replace(/_/g, ' ').toUpperCase(),
                timestampFormatted: new Date(log.timestamp).toLocaleString(),
                user: {
                    email: log.user?.email || 'Unknown',
                    role: log.user?.role || 'N/A'
                },
                hasDetails: log.details && Object.keys(log.details).length > 0,
                detailsJson: log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : ''
            };
            return templateRenderer.render(template, data);
        }).join('');
        
        container.innerHTML = html;

        // Store current logs for CSV export (same list we just rendered)
        container.dataset.exportLogs = JSON.stringify(logsWithUsers.map(l => ({
            timestamp: l.timestamp,
            action: l.action,
            entityType: l.entityType || '',
            entityId: l.entityId || '',
            userId: l.userId,
            userEmail: l.user?.email || '',
            details: l.details ? JSON.stringify(l.details) : ''
        })));

    } catch (error) {
        console.error('Error loading audit logs:', error);
        container.innerHTML = '<div class="empty-state">Error loading audit logs</div>';
    }
}

function exportAuditCsv() {
    const container = document.getElementById('audit-logs');
    const dataJson = container?.dataset?.exportLogs;
    if (!dataJson) {
        alert('Load audit logs first, then export.');
        return;
    }
    let rows;
    try {
        rows = JSON.parse(dataJson);
    } catch (e) {
        alert('No data to export.');
        return;
    }
    if (rows.length === 0) {
        alert('No audit logs to export.');
        return;
    }
    const headers = ['timestamp', 'action', 'entityType', 'entityId', 'userId', 'userEmail', 'details'];
    const csvContent = [
        headers.join(','),
        ...rows.map(r => headers.map(h => {
            const v = (r[h] ?? '').toString();
            return v.includes(',') || v.includes('"') || v.includes('\n') ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function setupFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const exportBtn = document.getElementById('export-csv');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => loadAuditLogs());
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportAuditCsv());
    }
    const searchEl = document.getElementById('filter-search');
    if (searchEl) {
        searchEl.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadAuditLogs(); });
    }
}
