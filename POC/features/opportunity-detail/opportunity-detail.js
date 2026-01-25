/**
 * Opportunity Detail Component
 */

async function initOpportunityDetail(params) {
    const opportunityId = params.id;
    if (!opportunityId) {
        document.getElementById('content').innerHTML = '<div class="error">Opportunity ID is required</div>';
        return;
    }
    
    await loadOpportunity(opportunityId);
}

async function loadOpportunity(id) {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('content');
    
    try {
        const opportunity = await dataService.getOpportunityById(id);
        
        if (!opportunity) {
            contentDiv.innerHTML = '<div class="error">Opportunity not found</div>';
            loadingDiv.style.display = 'none';
            return;
        }
        
        // Load creator info
        const creator = await dataService.getUserById(opportunity.creatorId);
        
        // Get current user
        const user = authService.getCurrentUser();
        const isOwner = user && opportunity.creatorId === user.id;
        const canApply = user && !isOwner && opportunity.status === 'published';
        
        // Render opportunity
        renderOpportunity(opportunity, creator, isOwner, canApply);
        
        // Load applications if owner
        if (isOwner) {
            await loadApplications(id);
        }
        
        // Setup application form if can apply
        if (canApply) {
            setupApplicationForm(id);
        }
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading opportunity:', error);
        loadingDiv.style.display = 'none';
        contentDiv.innerHTML = '<div class="error">Error loading opportunity. Please try again.</div>';
    }
}

function renderOpportunity(opportunity, creator, isOwner, canApply) {
    // Title and meta
    document.getElementById('opportunity-title').textContent = opportunity.title || 'Untitled Opportunity';
    document.getElementById('opportunity-model').textContent = opportunity.modelType || 'N/A';
    document.getElementById('opportunity-status').textContent = opportunity.status || 'draft';
    document.getElementById('opportunity-status').className = `badge badge-${getStatusBadgeClass(opportunity.status)}`;
    
    // Description
    document.getElementById('opportunity-description').textContent = 
        opportunity.description || 'No description available';
    
    // Created date
    document.getElementById('opportunity-created').textContent = 
        new Date(opportunity.createdAt).toLocaleDateString();
    
    // Creator
    document.getElementById('opportunity-creator').textContent = 
        creator?.email || 'Unknown';
    
    // Actions
    const actionsDiv = document.getElementById('opportunity-actions');
    if (isOwner) {
        actionsDiv.innerHTML = `
            <a href="/opportunities/${opportunity.id}/edit" class="btn btn-secondary">Edit</a>
            <button onclick="deleteOpportunity('${opportunity.id}')" class="btn btn-danger">Delete</button>
        `;
    } else {
        actionsDiv.innerHTML = '';
    }
    
    // Model-specific details
    renderModelDetails(opportunity);
    
    // Show/hide apply card
    const applyCard = document.getElementById('apply-card');
    if (canApply) {
        applyCard.style.display = 'block';
    } else {
        applyCard.style.display = 'none';
    }
}

function renderModelDetails(opportunity) {
    const container = document.getElementById('model-details');
    if (!opportunity.attributes) {
        container.innerHTML = '<p class="text-muted">No additional details available.</p>';
        return;
    }
    
    const attributes = opportunity.attributes;
    const detailsHTML = Object.keys(attributes)
        .filter(key => !['title', 'description', 'status', 'modelType', 'subModelType'].includes(key))
        .map(key => {
            const value = attributes[key];
            let displayValue = value;
            
            if (Array.isArray(value)) {
                displayValue = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
                if (value.min !== undefined && value.max !== undefined) {
                    displayValue = `${value.min} - ${value.max}`;
                } else if (value.start && value.end) {
                    displayValue = `${value.start} to ${value.end}`;
                } else {
                    displayValue = JSON.stringify(value);
                }
            } else if (typeof value === 'boolean') {
                displayValue = value ? 'Yes' : 'No';
            }
            
            return `
                <div class="detail-item">
                    <div class="detail-label">${formatLabel(key)}</div>
                    <div class="detail-value">${displayValue || 'N/A'}</div>
                </div>
            `;
        }).join('');
    
    container.innerHTML = detailsHTML || '<p class="text-muted">No additional details available.</p>';
}

function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'draft': 'secondary',
        'published': 'success',
        'closed': 'danger',
        'cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
}

async function loadApplications(opportunityId) {
    const applicationsCard = document.getElementById('applications-card');
    const applicationsList = document.getElementById('applications-list');
    const applicationsCountItem = document.getElementById('applications-count-item');
    const applicationsCount = document.getElementById('applications-count');
    
    try {
        const allApplications = await dataService.getApplications();
        const opportunityApplications = allApplications.filter(a => a.opportunityId === opportunityId);
        
        applicationsCard.style.display = 'block';
        applicationsCountItem.style.display = 'block';
        applicationsCount.textContent = opportunityApplications.length;
        
        if (opportunityApplications.length === 0) {
            applicationsList.innerHTML = '<p class="text-muted">No applications yet.</p>';
            return;
        }
        
        // Load applicant info for each application
        const applicationsWithUsers = await Promise.all(
            opportunityApplications.map(async (app) => {
                const applicant = await dataService.getUserById(app.applicantId);
                return { ...app, applicant };
            })
        );
        
        applicationsList.innerHTML = applicationsWithUsers.map(app => `
            <div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-header">
                    <h3>${app.applicant?.email || 'Unknown Applicant'}</h3>
                    <span class="badge badge-${getApplicationStatusBadgeClass(app.status)}">${app.status}</span>
                </div>
                <div class="card-body">
                    <p>${app.proposal || 'No proposal provided'}</p>
                    <p class="text-muted" style="font-size: var(--font-size-sm); margin-top: var(--spacing-md);">
                        Applied: ${new Date(app.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div class="card-footer">
                    <button onclick="updateApplicationStatus('${app.id}', 'accepted')" class="btn btn-success btn-sm">Accept</button>
                    <button onclick="updateApplicationStatus('${app.id}', 'rejected')" class="btn btn-danger btn-sm">Reject</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading applications:', error);
        applicationsList.innerHTML = '<p class="text-muted">Error loading applications.</p>';
    }
}

function getApplicationStatusBadgeClass(status) {
    const statusMap = {
        'pending': 'warning',
        'reviewing': 'primary',
        'shortlisted': 'primary',
        'accepted': 'success',
        'rejected': 'danger',
        'withdrawn': 'secondary'
    };
    return statusMap[status] || 'secondary';
}

function setupApplicationForm(opportunityId) {
    const form = document.getElementById('application-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const proposal = document.getElementById('application-proposal').value;
        const user = authService.getCurrentUser();
        
        if (!user) {
            alert('You must be logged in to apply');
            return;
        }
        
        try {
            const application = await dataService.createApplication({
                opportunityId,
                applicantId: user.id,
                proposal
            });
            
            // Create notification for opportunity creator
            const opportunity = await dataService.getOpportunityById(opportunityId);
            await dataService.createNotification({
                userId: opportunity.creatorId,
                type: 'application_received',
                title: 'New Application',
                message: `You received a new application for "${opportunity.title}"`
            });
            
            alert('Application submitted successfully!');
            form.reset();
            
            // Reload page to show updated state
            location.reload();
            
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application. Please try again.');
        }
    });
}

async function updateApplicationStatus(applicationId, status) {
    if (!confirm(`Are you sure you want to ${status} this application?`)) {
        return;
    }
    
    try {
        await dataService.updateApplication(applicationId, { status });
        
        // Create notification for applicant
        const application = await dataService.getApplicationById(applicationId);
        const opportunity = await dataService.getOpportunityById(application.opportunityId);
        
        await dataService.createNotification({
            userId: application.applicantId,
            type: 'application_status_changed',
            title: 'Application Status Updated',
            message: `Your application for "${opportunity.title}" has been ${status}`
        });
        
        // Reload applications
        await loadApplications(application.opportunityId);
        
    } catch (error) {
        console.error('Error updating application status:', error);
        alert('Failed to update application status. Please try again.');
    }
}

async function deleteOpportunity(id) {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
        return;
    }
    
    try {
        await dataService.deleteOpportunity(id);
        
        // Create audit log
        const user = authService.getCurrentUser();
        await dataService.createAuditLog({
            userId: user.id,
            action: 'opportunity_deleted',
            entityType: 'opportunity',
            entityId: id,
            details: {}
        });
        
        alert('Opportunity deleted successfully');
        router.navigate('/opportunities');
        
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity. Please try again.');
    }
}

// Make functions available globally
window.updateApplicationStatus = updateApplicationStatus;
window.deleteOpportunity = deleteOpportunity;
