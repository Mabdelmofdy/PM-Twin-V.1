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
        const opportunities = await dataService.getOpportunities();
        const applications = await dataService.getApplications();
        
        document.getElementById('stat-total-users').textContent = users.length;
        document.getElementById('stat-pending-users').textContent = 
            users.filter(u => u.status === 'pending').length;
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
        
        // Load user info for each log
        const logsWithUsers = await Promise.all(
            recentLogs.map(async (log) => {
                const user = await dataService.getUserById(log.userId);
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
        const pendingUsers = users.filter(u => u.status === 'pending').slice(0, 10);
        
        if (pendingUsers.length === 0) {
            container.innerHTML = '<p class="text-muted">No pending approvals</p>';
            return;
        }
        
        container.innerHTML = pendingUsers.map(user => `
            <div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-header">
                    <h3>${user.email}</h3>
                    <span class="badge badge-warning">Pending</span>
                </div>
                <div class="card-body">
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    ${user.profile?.name ? `<p><strong>Name:</strong> ${user.profile.name}</p>` : ''}
                </div>
                <div class="card-footer">
                    <button onclick="approveUser('${user.id}')" class="btn btn-success btn-sm">Approve</button>
                    <button onclick="rejectUser('${user.id}')" class="btn btn-danger btn-sm">Reject</button>
                    <a href="/admin/users/${user.id}" class="btn btn-secondary btn-sm">View Details</a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        container.innerHTML = '<p class="text-muted">Error loading approvals</p>';
    }
}

async function approveUser(userId) {
    if (!confirm('Approve this user?')) return;
    
    try {
        await dataService.updateUser(userId, { status: 'active' });
        
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
            action: 'user_approved',
            entityType: 'user',
            entityId: userId,
            details: {}
        });
        
        alert('User approved successfully');
        await loadPendingApprovals();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Error approving user:', error);
        alert('Failed to approve user. Please try again.');
    }
}

async function rejectUser(userId) {
    if (!confirm('Reject this user? They will be notified.')) return;
    
    const reason = prompt('Rejection reason (optional):');
    
    try {
        await dataService.updateUser(userId, { status: 'rejected' });
        
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
            action: 'user_rejected',
            entityType: 'user',
            entityId: userId,
            details: { reason: reason || 'No reason provided' }
        });
        
        alert('User rejected');
        await loadPendingApprovals();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Error rejecting user:', error);
        alert('Failed to reject user. Please try again.');
    }
}

// Make functions available globally
window.approveUser = approveUser;
window.rejectUser = rejectUser;
