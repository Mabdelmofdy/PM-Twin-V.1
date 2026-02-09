/**
 * Admin User Vetting Component
 * Review pending and clarification_requested users/companies; approve, reject, or request clarification.
 */

async function initAdminVetting() {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }

    await loadVettingList();
    setupFilters();
}

function setupFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const statusSelect = document.getElementById('filter-status');
    const searchInput = document.getElementById('filter-search');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => loadVettingList());
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', () => loadVettingList());
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadVettingList(); });
    }
}

async function loadVettingList() {
    const container = document.getElementById('vetting-list');
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        const users = await dataService.getUsers();
        const companies = await dataService.getCompanies();
        let list = [...users, ...companies].filter(
            u => u.status === 'pending' || u.status === 'clarification_requested'
        );

        const statusFilter = document.getElementById('filter-status')?.value;
        const searchFilter = document.getElementById('filter-search')?.value?.toLowerCase();

        if (statusFilter) {
            list = list.filter(u => u.status === statusFilter);
        }
        if (searchFilter) {
            list = list.filter(u =>
                u.email?.toLowerCase().includes(searchFilter) ||
                u.profile?.name?.toLowerCase().includes(searchFilter)
            );
        }

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state">No users or companies awaiting review</div>';
            return;
        }

        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = list.map(user => {
            const isCompany = user.profile?.type === 'company';
            const typeLabel = isCompany ? 'Company' : 'User';
            const statusLabel = user.status === 'clarification_requested' ? 'Clarification Requested' : 'Pending';
            const statusClass = user.status === 'clarification_requested' ? 'warning' : 'warning';
            return `
            <div class="vetting-card" data-id="${user.id}" data-company="${isCompany}">
                <div class="vetting-card-header">
                    <div>
                        <h3 class="vetting-email">${user.email}</h3>
                        <span class="badge badge-${statusClass}">${statusLabel}</span>
                        <span class="badge badge-secondary">${typeLabel}</span>
                    </div>
                </div>
                <div class="vetting-card-body">
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    ${user.profile?.name ? `<p><strong>Name:</strong> ${user.profile.name}</p>` : ''}
                </div>
                <div class="vetting-card-footer">
                    <button type="button" class="btn btn-success btn-sm" data-action="approve" data-id="${user.id}" data-company="${isCompany}">Approve</button>
                    <button type="button" class="btn btn-danger btn-sm" data-action="reject" data-id="${user.id}" data-company="${isCompany}">Reject</button>
                    <button type="button" class="btn btn-warning btn-sm" data-action="clarify" data-id="${user.id}" data-company="${isCompany}">Request clarification</button>
                    <a href="#" data-route="/admin/users/${user.id}" class="btn btn-secondary btn-sm">View detail</a>
                </div>
            </div>
            `;
        }).join('');

        container.querySelectorAll('[data-action]').forEach(btn => {
            if (btn.tagName === 'A') return;
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const isCompany = btn.dataset.company === 'true';
                if (action === 'approve') approveUser(id, isCompany);
                else if (action === 'reject') rejectUser(id, isCompany);
                else if (action === 'clarify') requestClarification(id, isCompany);
            });
        });
    } catch (error) {
        console.error('Error loading vetting list:', error);
        container.innerHTML = '<div class="empty-state">Error loading list</div>';
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
            message: 'Your account has been approved. You can now access all features.'
        });

        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_approved' : 'user_approved',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: {}
        });

        await loadVettingList();
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

        await dataService.createNotification({
            userId,
            type: 'account_rejected',
            title: 'Account Rejected',
            message: reason ? `Your account was rejected: ${reason}` : 'Your account registration was rejected.'
        });

        const admin = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: admin.id,
            action: isCompany ? 'company_rejected' : 'user_rejected',
            entityType: isCompany ? 'company' : 'user',
            entityId: userId,
            details: { reason: reason || 'No reason provided' }
        });

        await loadVettingList();
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

        await loadVettingList();
    } catch (error) {
        console.error('Error requesting clarification:', error);
        alert('Failed to request clarification.');
    }
}
