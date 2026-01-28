/**
 * Admin Audit Component
 */

async function initAdminAudit() {
    if (!authService.isAdmin()) {
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
            entityType: undefined, // Could add filter for this
            startDate: document.getElementById('filter-start-date')?.value || undefined,
            endDate: document.getElementById('filter-end-date')?.value || undefined
        };
        
        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) delete filters[key];
        });
        
        let logs = await dataService.getAuditLogs(filters);
        
        // Filter by action if specified
        const actionFilter = document.getElementById('filter-action')?.value;
        if (actionFilter) {
            logs = logs.filter(log => log.action === actionFilter);
        }
        
        // Load user/company info for each log
        const logsWithUsers = await Promise.all(
            logs.map(async (log) => {
                const user = await dataService.getUserOrCompanyById(log.userId);
                return { ...log, user };
            })
        );
        
        if (logsWithUsers.length === 0) {
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
        
    } catch (error) {
        console.error('Error loading audit logs:', error);
        container.innerHTML = '<div class="empty-state">Error loading audit logs</div>';
    }
}

function setupFilters() {
    const applyBtn = document.getElementById('apply-filters');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            loadAuditLogs();
        });
    }
}
