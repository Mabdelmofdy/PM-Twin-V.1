/**
 * Contract Detail – full view of a contract between creator and contractor.
 * Shows parties, scope, payment, duration, milestones, dates, and link to opportunity.
 */

function escapeHtml(str) {
    if (str == null || str === '') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getContractStatusBadgeClass(status) {
    const map = {
        pending: 'secondary',
        active: 'primary',
        completed: 'success',
        terminated: 'danger'
    };
    return map[status] || 'secondary';
}

function getContractStatusLabel(status) {
    const map = {
        pending: 'Pending',
        active: 'Active',
        completed: 'Completed',
        terminated: 'Terminated'
    };
    return map[status] || status;
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return iso;
    }
}

async function initContractDetail(params) {
    const contractId = params?.id;
    const loadingEl = document.getElementById('contract-loading');
    const errorEl = document.getElementById('contract-error');
    const contentEl = document.getElementById('contract-content');

    if (!contractId) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        contentEl.style.display = 'none';
        wireBackLink(errorEl);
        return;
    }

    const user = authService.getCurrentUser();
    if (!user) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        contentEl.style.display = 'none';
        wireBackLink(errorEl);
        return;
    }

    try {
        const contract = await dataService.getContractById(contractId);
        if (!contract) {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            contentEl.style.display = 'none';
            wireBackLink(errorEl);
            return;
        }

        const isParty = contract.creatorId === user.id || contract.contractorId === user.id;
        if (!isParty) {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            contentEl.style.display = 'none';
            wireBackLink(errorEl);
            return;
        }

        const [creator, contractor, opportunity] = await Promise.all([
            dataService.getUserOrCompanyById(contract.creatorId),
            dataService.getUserOrCompanyById(contract.contractorId),
            dataService.getOpportunityById(contract.opportunityId)
        ]);

        const creatorName = creator?.profile?.name || creator?.email || contract.creatorId;
        const creatorEmail = creator?.email || '—';
        const contractorName = contractor?.profile?.name || contractor?.email || contract.contractorId;
        const contractorEmail = contractor?.email || '—';

        const myRole = contract.creatorId === user.id ? 'Creator' : 'Contractor';
        const scopeDisplay = contract.scope || (opportunity && opportunity.title) || '—';

        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';

        document.getElementById('contract-title').textContent = scopeDisplay;
        document.getElementById('contract-status-badge').textContent = getContractStatusLabel(contract.status);
        document.getElementById('contract-status-badge').className = 'badge badge-' + getContractStatusBadgeClass(contract.status);
        document.getElementById('contract-role-badge').textContent = 'Your role: ' + myRole;

        document.getElementById('contract-parties').innerHTML = `
            <p><strong>Creator</strong><br/>${escapeHtml(creatorName)}<br/><span class="text-muted">${escapeHtml(creatorEmail)}</span></p>
            <p><strong>Contractor</strong><br/>${escapeHtml(contractorName)}<br/><span class="text-muted">${escapeHtml(contractorEmail)}</span></p>
        `;

        const paymentMode = contract.paymentMode || (opportunity && opportunity.exchangeMode) || '—';
        const duration = contract.duration || '—';
        document.getElementById('contract-scope-terms').innerHTML = `
            <p><strong>Scope</strong><br/>${escapeHtml(scopeDisplay)}</p>
            <p><strong>Payment mode</strong><br/>${escapeHtml(paymentMode)}</p>
            <p><strong>Duration</strong><br/>${escapeHtml(duration)}</p>
        `;

        const milestones = contract.milestones || [];
        const milestonesHtml = milestones.length
            ? `<ul class="list-none p-0 m-0">${milestones.map((m) => `
                <li class="milestone-item">
                    <span>${escapeHtml(m.title)}${m.dueDate ? ' <span class="text-muted">(' + escapeHtml(m.dueDate) + ')</span>' : ''}</span>
                    <span class="badge badge-${m.status === 'completed' ? 'success' : 'secondary'}">${m.status === 'completed' ? 'Completed' : 'Pending'}${m.completedAt ? ' ' + formatDate(m.completedAt) : ''}</span>
                </li>
            `).join('')}</ul>`
            : '<p class="text-muted">No milestones defined.</p>';
        document.getElementById('contract-milestones').innerHTML = milestonesHtml;

        document.getElementById('contract-dates').innerHTML = `
            <p><strong>Created</strong><br/>${formatDate(contract.createdAt)}</p>
            <p><strong>Last updated</strong><br/>${formatDate(contract.updatedAt)}</p>
            ${contract.signedAt ? '<p><strong>Signed</strong><br/>' + formatDate(contract.signedAt) + '</p>' : ''}
        `;

        const oppTitle = (opportunity && opportunity.title) || scopeDisplay;
        const oppId = contract.opportunityId;
        document.getElementById('contract-opportunity-link').innerHTML = `
            <p><a href="#" data-route="/opportunities/${escapeHtml(oppId)}" class="contract-opportunity-link text-primary font-medium">${escapeHtml(oppTitle)}</a></p>
            <a href="#" data-route="/opportunities/${escapeHtml(oppId)}" class="btn btn-primary btn-sm">View opportunity</a>
        `;

        const isCreator = contract.creatorId === user.id;
        const canEditContract = isCreator && (contract.status === 'pending' || contract.status === 'active');
        const oppStatus = opportunity ? opportunity.status : '';
        const showManageExecution = ['contracted', 'in_execution', 'completed'].indexOf(oppStatus) !== -1;
        const actionsEl = document.getElementById('contract-detail-actions');
        if (actionsEl) {
            let actionsHtml = '';
            if (canEditContract) {
                actionsHtml += `<button type="button" id="contract-edit-btn" class="btn btn-secondary no-print" data-contract-id="${escapeHtml(contract.id)}">Edit contract</button>`;
            }
            if (showManageExecution && oppId) {
                actionsHtml += `<a href="#" data-route="/opportunities/${escapeHtml(oppId)}" class="btn btn-primary">Manage execution</a>`;
            }
            actionsHtml += `<button type="button" id="contract-print-btn" class="btn btn-secondary">Print contract</button>`;
            actionsEl.innerHTML = actionsHtml;
        }

        document.getElementById('contract-edit-btn')?.addEventListener('click', () => {
            showEditContractModal(contractId, contract.scope || '', contract.duration || '');
        });

        document.getElementById('contract-print-btn')?.addEventListener('click', () => {
            window.print();
        });

        wireBackLink(contentEl);
        contentEl.querySelectorAll('a[data-route]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route && typeof router !== 'undefined') router.navigate(route);
            });
        });
    } catch (err) {
        console.error('Error loading contract:', err);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        contentEl.style.display = 'none';
        wireBackLink(errorEl);
    }
}

function showEditContractModal(contractId, currentScope, currentDuration) {
    const contentHTML = `
        <form id="contract-edit-form" class="space-y-3">
            <div>
                <label for="edit-contract-scope" class="block text-sm font-medium text-gray-700 mb-1">Scope <span class="text-red-500">*</span></label>
                <input type="text" id="edit-contract-scope" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value="${escapeHtml(currentScope || '')}" required placeholder="Contract scope / title" />
            </div>
            <div>
                <label for="edit-contract-duration" class="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
                <input type="text" id="edit-contract-duration" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value="${escapeHtml(currentDuration || '')}" placeholder="e.g. 3 months, Q2 2026" />
            </div>
            <div class="flex gap-2 pt-2">
                <button type="button" id="contract-edit-save" class="btn btn-primary">Save</button>
                <button type="button" id="contract-edit-cancel" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    `;

    if (typeof modalService === 'undefined') {
        const scope = prompt('Scope (required):', currentScope || '');
        if (scope === null) return;
        if (!scope.trim()) {
            alert('Scope is required.');
            return;
        }
        const duration = prompt('Duration (optional):', currentDuration || '') || '';
        saveContractEdit(contractId, scope.trim(), duration.trim());
        return;
    }

    modalService.showCustom(contentHTML, 'Edit contract', { confirmText: 'Close' }).then(() => {});

    const modalEl = document.getElementById('modal-container');
    if (!modalEl) return;

    const saveBtn = modalEl.querySelector('#contract-edit-save');
    const cancelBtn = modalEl.querySelector('#contract-edit-cancel');
    const scopeInput = modalEl.querySelector('#edit-contract-scope');
    const durationInput = modalEl.querySelector('#edit-contract-duration');

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const scope = scopeInput?.value != null ? String(scopeInput.value).trim() : '';
            const duration = durationInput?.value != null ? String(durationInput.value).trim() : '';
            if (!scope) {
                alert('Scope is required.');
                if (scopeInput) scopeInput.focus();
                return;
            }
            modalService.close();
            await saveContractEdit(contractId, scope, duration);
        });
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modalService.close());
    }
}

async function saveContractEdit(contractId, scope, duration) {
    try {
        await dataService.updateContract(contractId, { scope, duration });
        if (typeof initContractDetail === 'function') {
            await initContractDetail({ id: contractId });
        }
    } catch (err) {
        console.error('Error updating contract:', err);
        alert('Failed to update contract. Please try again.');
    }
}

function wireBackLink(container) {
    if (!container) return;
    const back = container.querySelector('a[data-route="/contracts"]');
    if (back && typeof router !== 'undefined') {
        back.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/contracts');
        });
    }
}
