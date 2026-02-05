/**
 * Admin Dashboard Component
 */

async function initAdminDashboard() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    
    await loadDashboardStats();
    await loadRecentActivity();
    await loadPendingApprovals();
}

async function loadDashboardStats() {
    try {
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        const allPeople = [...users, ...companies];
        const opportunities = await dataService.getOpportunities();
        const applications = await dataService.getApplications();
        
        document.getElementById('stat-total-users').textContent = allPeople.length;
        document.getElementById('stat-pending-users').textContent = 
            allPeople.filter(u => u.status === 'pending').length;
        document.getElementById('stat-total-opportunities').textContent = opportunities.length;
        document.getElementById('stat-total-applications').textContent = applications.length;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    try {
        const auditLogs = await dataService.getAuditLogs({});
        const recentLogs = auditLogs.slice(0, 10);
        
        if (recentLogs.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }
        
        // Load user/company info for each log
        const logsWithUsers = await Promise.all(
            recentLogs.map(async (log) => {
                const user = await dataService.getUserOrCompanyById(log.userId);
                return { ...log, user };
            })
        );
        
        container.innerHTML = logsWithUsers.map(log => `
            <div class="activity-item">
                <div class="activity-item-header">
                    <span class="activity-item-title">${log.action.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="activity-item-time">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div class="activity-item-details">
                    User: ${log.user?.email || 'Unknown'} | 
                    Entity: ${log.entityType} | 
                    ${log.details ? JSON.stringify(log.details) : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        container.innerHTML = '<p class="text-muted">Error loading activity</p>';
    }
}

async function loadPendingApprovals() {
    const container = document.getElementById('pending-approvals');
    if (!container) return;
    
    try {
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        const allPeople = [...users, ...companies];
        const pendingUsers = allPeople.filter(u => u.status === 'pending').slice(0, 10);
        
        if (pendingUsers.length === 0) {
            container.innerHTML = '<p class="text-muted">No pending approvals</p>';
            return;
        }
        
        container.innerHTML = pendingUsers.map(user => {
            const isCompany = user.profile?.type === 'company';
            const typeLabel = isCompany ? 'Company' : 'User';
            return `
            <div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-header">
                    <h3>${user.email}</h3>
                    <span class="badge badge-warning">Pending</span>
                    <span class="badge badge-secondary">${typeLabel}</span>
                </div>
                <div class="card-body">
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    ${user.profile?.name ? `<p><strong>Name:</strong> ${user.profile.name}</p>` : ''}
                </div>
                <div class="card-footer">
                    <button onclick="approveUser('${user.id}', ${isCompany})" class="btn btn-success btn-sm">Approve</button>
                    <button onclick="rejectUser('${user.id}', ${isCompany})" class="btn btn-danger btn-sm">Reject</button>
                    <button onclick="requestClarification('${user.id}', ${isCompany})" class="btn btn-warning btn-sm">Request clarification</button>
                    <a href="#" data-route="/admin/users" class="btn btn-secondary btn-sm">View All</a>
                </div>
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        container.innerHTML = '<p class="text-muted">Error loading approvals</p>';
    }
}

async function approveUser(userId, isCompany = false) {
    if (!confirm(`Approve this ${isCompany ? 'company' : 'user'}?`)) return;
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'active' });
        } else {
            await dataService.updateUser(userId, { status: 'active' });
        }
        
        // Create notification
        await dataService.createNotification({
            userId,
            type: 'account_approved',
            title: 'Account Approved',
            message: 'Your account has been approved. You can now access all features.'
        });
        
        // Create audit log
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_approved' : 'user_approved',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: {}
        });
        
        alert(`${isCompany ? 'Company' : 'User'} approved successfully`);
        await loadPendingApprovals();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Error approving:', error);
        alert('Failed to approve. Please try again.');
    }
}

async function rejectUser(userId, isCompany = false) {
    if (!confirm(`Reject this ${isCompany ? 'company' : 'user'}? They will be notified.`)) return;
    
    const reason = prompt('Rejection reason (optional):');
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'rejected' });
        } else {
            await dataService.updateUser(userId, { status: 'rejected' });
        }
        
        // Create notification
        await dataService.createNotification({
            userId,
            type: 'account_rejected',
            title: 'Account Rejected',
            message: reason ? `Your account was rejected: ${reason}` : 'Your account registration was rejected.'
        });
        
        // Create audit log
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_rejected' : 'user_rejected',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: { reason: reason || 'No reason provided' }
        });
        
        alert(`${isCompany ? 'Company' : 'User'} rejected`);
        await loadPendingApprovals();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Error rejecting:', error);
        alert('Failed to reject. Please try again.');
    }
}

async function requestClarification(userId, isCompany = false) {
    const reason = prompt('Reason or missing items (optional):');
    if (reason === null) return;
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'clarification_requested' });
        } else {
            await dataService.updateUser(userId, { status: 'clarification_requested' });
        }
        
        await dataService.createNotification({
            userId,
            type: 'account_clarification_requested',
            title: 'Registration needs clarification',
            message: reason ? `Your registration needs clarification: ${reason}. Please update your profile or documents and submit for review again.` : 'Your registration needs clarification. Please update your profile or documents and submit for review again from your profile page.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_clarification_requested' : 'user_clarification_requested',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: { reason: reason || '' }
        });
        
        alert(`${isCompany ? 'Company' : 'User'} marked as needs clarification`);
        await loadPendingApprovals();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error requesting clarification:', error);
        alert('Failed to request clarification.');
    }
}

// Make functions available globally
window.approveUser = approveUser;
window.rejectUser = rejectUser;
window.requestClarification = requestClarification;