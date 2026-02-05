/**
 * Admin User Detail – full profile, activity, opportunities, applications, audit
 */

async function initAdminUserDetail(params) {
    if (!authService.isAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }
    const id = params?.id;
    if (!id) {
        router.navigate(CONFIG.ROUTES.ADMIN_USERS);
        return;
    }
    await loadUserDetail(id);
}

async function loadUserDetail(userId) {
    const person = await dataService.getPersonById(userId);
    if (!person) {
        document.getElementById('main-content').innerHTML = '<div class="empty-state">User or company not found.</div>';
        return;
    }

    const isCompany = person.profile?.type === 'company';
    document.getElementById('user-detail-name').textContent = person.profile?.name || person.email || userId;
    document.getElementById('user-detail-email').textContent = person.email || '-';
    const badgesEl = document.getElementById('user-detail-badges');
    badgesEl.innerHTML = `
        <span class="badge badge-${person.status === 'active' ? 'success' : person.status === 'pending' ? 'warning' : 'secondary'}">${person.status}</span>
        <span class="badge badge-secondary">${person.role || '-'}</span>
        <span class="badge badge-secondary">${isCompany ? 'Company' : 'User'}</span>
    `;

    const profileEl = document.getElementById('user-detail-profile');
    profileEl.innerHTML = `
        <div class="detail-item"><strong>ID</strong> ${person.id}</div>
        <div class="detail-item"><strong>Email</strong> ${person.email || '-'}</div>
        <div class="detail-item"><strong>Name</strong> ${person.profile?.name || '-'}</div>
        <div class="detail-item"><strong>Role</strong> ${person.role || '-'}</div>
        <div class="detail-item"><strong>Status</strong> ${person.status || '-'}</div>
        <div class="detail-item"><strong>Registered</strong> ${person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '-'}</div>
    `;

    const opportunities = await dataService.getOpportunities();
    const userOpps = opportunities.filter(o => o.creatorId === userId);
    const oppEl = document.getElementById('user-opportunities');
    if (userOpps.length === 0) {
        oppEl.innerHTML = '<p class="empty-section">None</p>';
    } else {
        oppEl.innerHTML = userOpps.map(o => `
            <div class="detail-item">
                <a href="#" data-route="/opportunities/${o.id}">${o.title || o.id}</a>
                <span class="badge badge-secondary">${o.status || 'draft'}</span>
            </div>
        `).join('');
    }

    const applications = await dataService.getApplications();
    const userApps = applications.filter(a => a.applicantId === userId);
    const appEl = document.getElementById('user-applications');
    if (userApps.length === 0) {
        appEl.innerHTML = '<p class="empty-section">None</p>';
    } else {
        const oppMap = {};
        opportunities.forEach(o => { oppMap[o.id] = o; });
        appEl.innerHTML = userApps.map(a => {
            const opp = oppMap[a.opportunityId];
            const title = opp ? opp.title : a.opportunityId;
            return `
            <div class="detail-item">
                <a href="#" data-route="/opportunities/${a.opportunityId}">${title}</a>
                <span class="badge badge-secondary">${a.status || 'pending'}</span>
            </div>
            `;
        }).join('');
    }

    const auditLogs = await dataService.getAuditLogs({});
    const relatedLogs = auditLogs.filter(l =>
        l.userId === userId || (l.entityType === 'user' && l.entityId === userId) || (l.entityType === 'company' && l.entityId === userId)
    ).slice(0, 30);
    const auditEl = document.getElementById('user-audit');
    if (relatedLogs.length === 0) {
        auditEl.innerHTML = '<p class="empty-section">No related audit entries</p>';
    } else {
        auditEl.innerHTML = relatedLogs.map(l => `
            <div class="audit-item">
                <strong>${(l.action || '').replace(/_/g, ' ')}</strong>
                ${l.entityType ? ` · ${l.entityType}` : ''}
                ${l.entityId ? ` · ${l.entityId}` : ''}
                <span class="text-muted">${l.timestamp ? new Date(l.timestamp).toLocaleString() : ''}</span>
            </div>
        `).join('');
    }
}
