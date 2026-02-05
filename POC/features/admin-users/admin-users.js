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
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        let allPeople = [...users, ...companies];
        
        // Apply filters
        const statusFilter = document.getElementById('filter-status')?.value;
        const roleFilter = document.getElementById('filter-role')?.value;
        const typeFilter = document.getElementById('filter-type')?.value; // user or company
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        
        if (statusFilter) {
            allPeople = allPeople.filter(u => u.status === statusFilter);
        }
        
        if (roleFilter) {
            allPeople = allPeople.filter(u => u.role === roleFilter);
        }
        
        if (typeFilter) {
            if (typeFilter === 'user') {
                allPeople = allPeople.filter(u => u.profile?.type !== 'company');
            } else if (typeFilter === 'company') {
                allPeople = allPeople.filter(u => u.profile?.type === 'company');
            }
        }
        
        if (searchFilter) {
            allPeople = allPeople.filter(u => 
                u.email?.toLowerCase().includes(searchFilter) ||
                u.profile?.name?.toLowerCase().includes(searchFilter)
            );
        }
        
        if (allPeople.length === 0) {
            container.innerHTML = '<div class="empty-state">No users or companies found</div>';
            return;
        }
        
        // Load template
        const template = await templateLoader.load('user-card');
        
        // Render users and companies
        const html = allPeople.map(user => {
            const isCompany = user.profile?.type === 'company';
            const statusBadgeClass = {
                'pending': 'warning',
                'active': 'success',
                'suspended': 'danger',
                'rejected': 'danger',
                'clarification_requested': 'warning'
            }[user.status] || 'secondary';
            
            const data = {
                ...user,
                statusBadgeClass,
                createdDate: new Date(user.createdAt).toLocaleDateString(),
                showApproveReject: user.status === 'pending',
                showRequestClarification: user.status === 'pending',
                showSuspend: user.status === 'active',
                showActivate: user.status === 'suspended',
                isCompany: isCompany,
                typeLabel: isCompany ? 'Company' : 'User'
            };
            return templateRenderer.render(template, data);
        }).join('');
        
        container.innerHTML = html;
        
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
    // Check if it's a company or user
    const person = await dataService.getPersonById(userId);
    const isCompany = person?.profile?.type === 'company';
    
    switch (action) {
        case 'approve':
            await approveUser(userId, isCompany);
            break;
        case 'reject':
            await rejectUser(userId, isCompany);
            break;
        case 'request_clarification':
            await requestClarification(userId, isCompany);
            break;
        case 'suspend':
            await suspendUser(userId, isCompany);
            break;
        case 'activate':
            await activateUser(userId, isCompany);
            break;
        case 'view':
            // Navigate to admin user detail
            router.navigate(`/admin/users/${userId}`);
            break;
    }
}

async function requestClarification(userId, isCompany = false) {
    const reason = prompt('Reason or missing items (optional):');
    if (reason === null) return; // user cancelled
    
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
        await loadUsers();
        
    } catch (error) {
        console.error('Error requesting clarification:', error);
        alert(`Failed to request clarification`);
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
        
        await dataService.createNotification({
            userId,
            type: 'account_approved',
            title: 'Account Approved',
            message: 'Your account has been approved.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_approved' : 'user_approved',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: {}
        });
        
        alert(`${isCompany ? 'Company' : 'User'} approved`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error approving:', error);
        alert(`Failed to approve ${isCompany ? 'company' : 'user'}`);
    }
}

async function rejectUser(userId, isCompany = false) {
    if (!confirm(`Reject this ${isCompany ? 'company' : 'user'}?`)) return;
    
    const reason = prompt('Rejection reason (optional):');
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'rejected' });
        } else {
            await dataService.updateUser(userId, { status: 'rejected' });
        }
        
        await dataService.createNotification({
            userId,
            type: 'account_rejected',
            title: 'Account Rejected',
            message: reason || 'Your account registration was rejected.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_rejected' : 'user_rejected',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: { reason: reason || '' }
        });
        
        alert(`${isCompany ? 'Company' : 'User'} rejected`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error rejecting:', error);
        alert(`Failed to reject ${isCompany ? 'company' : 'user'}`);
    }
}

async function suspendUser(userId, isCompany = false) {
    if (!confirm(`Suspend this ${isCompany ? 'company' : 'user'}?`)) return;
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'suspended' });
        } else {
            await dataService.updateUser(userId, { status: 'suspended' });
        }
        
        await dataService.createNotification({
            userId,
            type: 'account_suspended',
            title: 'Account Suspended',
            message: 'Your account has been suspended.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_suspended' : 'user_suspended',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: {}
        });
        
        alert(`${isCompany ? 'Company' : 'User'} suspended`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error suspending:', error);
        alert(`Failed to suspend ${isCompany ? 'company' : 'user'}`);
    }
}

async function activateUser(userId, isCompany = false) {
    if (!confirm(`Activate this ${isCompany ? 'company' : 'user'}?`)) return;
    
    try {
        if (isCompany) {
            await dataService.updateCompany(userId, { status: 'active' });
        } else {
            await dataService.updateUser(userId, { status: 'active' });
        }
        
        await dataService.createNotification({
            userId,
            type: 'account_activated',
            title: 'Account Activated',
            message: 'Your account has been activated.'
        });
        
        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_activated' : 'user_activated',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: {}
        });
        
        alert(`${isCompany ? 'Company' : 'User'} activated`);
        await loadUsers();
        
    } catch (error) {
        console.error('Error activating:', error);
        alert(`Failed to activate ${isCompany ? 'company' : 'user'}`);
    }
}
