/**
 * Admin Users Component
 */

async function initAdminUsers() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    
    await loadUsers();
    setupFilters();
}

async function loadUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        let users = await dataService.getUsers();
        
        // Apply filters
        const statusFilter = document.getElementById('filter-status')?.value;
        const roleFilter = document.getElementById('filter-role')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        
        if (statusFilter) {
            users = users.filter(u => u.status === statusFilter);
        }
        
        if (roleFilter) {
            users = users.filter(u => u.role === roleFilter);
        }
        
        if (searchFilter) {
            users = users.filter(u => 
                u.email?.toLowerCase().includes(searchFilter) ||
                u.profile?.name?.toLowerCase().includes(searchFilter)
            );
        }
        
        if (users.length === 0) {
            container.innerHTML = '<div class="empty-state">No users found</div>';
            return;
        }
        
        container.innerHTML = users.map(user => createUserCard(user)).join('');
        
        // Attach event handlers
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const userId = btn.dataset.userId;
                handleUserAction(action, userId);
            });
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<div class="empty-state">Error loading users</div>';
    }
}

function createUserCard(user) {
    const statusBadgeClass = {
        'pending': 'warning',
        'active': 'success',
        'suspended': 'danger',
        'rejected': 'danger'
    }[user.status] || 'secondary';
    
    return `
        <div class="user-card">
            <div class="user-card-header">
                <div class="user-info">
                    <div class="user-email">${user.email}</div>
                    <div class="user-meta">
                        <span><strong>Role:</strong> ${user.role}</span>
                        <span><strong>Status:</strong> <span class="badge badge-${statusBadgeClass}">${user.status}</span></span>
                        <span><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${user.profile?.name ? `<div style="margin-top: var(--spacing-xs); color: var(--text-secondary);">${user.profile.name}</div>` : ''}
                </div>
                <div class="user-actions">
                    ${user.status === 'pending' ? `
                        <button data-action="approve" data-user-id="${user.id}" class="btn btn-success btn-sm">Approve</button>
                        <button data-action="reject" data-user-id="${user.id}" class="btn btn-danger btn-sm">Reject</button>
                    ` : ''}
                    ${user.status === 'active' ? `
                        <button data-action="suspend" data-user-id="${user.id}" class="btn btn-warning btn-sm">Suspend</button>
                    ` : ''}
                    ${user.status === 'suspended' ? `
                        <button data-action="activate" data-user-id="${user.id}" class="btn btn-success btn-sm">Activate</button>
                    ` : ''}
                    <button data-action="view" data-user-id="${user.id}" class="btn btn-secondary btn-sm">View Details</button>
                </div>
            </div>
        </div>
    `;
}

function setupFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const searchInput = document.getElementById('filter-search');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            loadUsers();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadUsers();
            }
        });
    }
}

async function handleUserAction(action, userId) {
    switch (action) {
        case 'approve':
            await approveUser(userId);
            break;
        case 'reject':
            await rejectUser(userId);
            break;
        case 'suspend':
            await suspendUser(userId);
            break;
        case 'activate':
            await activateUser(userId);
            break;
        case 'view':
            // Could navigate to user detail page
            alert('User detail view not implemented yet');
            break;
    }
}

async function approveUser(userId) {
    if (!confirm('Approve this user?')) return;
    
    try {
        await dataService.updateUser(userId, { status: 'active' });
        
        await dataService.createNotification({
            userId,
            type: 'account_approved',
            title: 'Account Approved',
            message: 'Your account has been approved.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'user_approved',
            entityType: 'user',
            entityId: userId,
            details: {}
        });
        
        alert('User approved');
        await loadUsers();
        
    } catch (error) {
        console.error('Error approving user:', error);
        alert('Failed to approve user');
    }
}

async function rejectUser(userId) {
    if (!confirm('Reject this user?')) return;
    
    const reason = prompt('Rejection reason (optional):');
    
    try {
        await dataService.updateUser(userId, { status: 'rejected' });
        
        await dataService.createNotification({
            userId,
            type: 'account_rejected',
            title: 'Account Rejected',
            message: reason || 'Your account registration was rejected.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'user_rejected',
            entityType: 'user',
            entityId: userId,
            details: { reason: reason || '' }
        });
        
        alert('User rejected');
        await loadUsers();
        
    } catch (error) {
        console.error('Error rejecting user:', error);
        alert('Failed to reject user');
    }
}

async function suspendUser(userId) {
    if (!confirm('Suspend this user?')) return;
    
    try {
        await dataService.updateUser(userId, { status: 'suspended' });
        
        await dataService.createNotification({
            userId,
            type: 'account_suspended',
            title: 'Account Suspended',
            message: 'Your account has been suspended.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'user_suspended',
            entityType: 'user',
            entityId: userId,
            details: {}
        });
        
        alert('User suspended');
        await loadUsers();
        
    } catch (error) {
        console.error('Error suspending user:', error);
        alert('Failed to suspend user');
    }
}

async function activateUser(userId) {
    if (!confirm('Activate this user?')) return;
    
    try {
        await dataService.updateUser(userId, { status: 'active' });
        
        await dataService.createNotification({
            userId,
            type: 'account_activated',
            title: 'Account Activated',
            message: 'Your account has been activated.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: 'user_activated',
            entityType: 'user',
            entityId: userId,
            details: {}
        });
        
        alert('User activated');
        await loadUsers();
        
    } catch (error) {
        console.error('Error activating user:', error);
        alert('Failed to activate user');
    }
}
