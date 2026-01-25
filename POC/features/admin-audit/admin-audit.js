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
        userSelect.innerHTML = '<option value="">All Users</option>' +
            users.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
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
        
        // Load user info for each log
        const logsWithUsers = await Promise.all(
            logs.map(async (log) => {
                const user = await dataService.getUserById(log.userId);
                return { ...log, user };
            })
        );
        
        if (logsWithUsers.length === 0) {
            container.innerHTML = '<div class="empty-state">No audit logs found</div>';
            return;
        }
        
        container.innerHTML = logsWithUsers.map(log => `
            <div class="audit-log-item">
                <div class="audit-log-header">
                    <span class="audit-log-action">${log.action.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="audit-log-time">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div class="audit-log-details">
                    <p><strong>User:</strong> ${log.user?.email || 'Unknown'} (${log.user?.role || 'N/A'})</p>
                    <p><strong>Entity:</strong> ${log.entityType} ${log.entityId ? `(${log.entityId})` : ''}</p>
                    ${log.details && Object.keys(log.details).length > 0 ? `
                        <p><strong>Details:</strong> ${JSON.stringify(log.details)}</p>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
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
