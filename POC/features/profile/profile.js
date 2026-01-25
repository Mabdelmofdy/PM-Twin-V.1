/**
 * Profile Component
 */

async function initProfile() {
    const user = authService.getCurrentUser();
    if (!user) {
        router.navigate(CONFIG.ROUTES.LOGIN);
        return;
    }
    
    await loadProfile(user);
    await loadProfileStats(user.id);
}

async function loadProfile(user) {
    // Basic info
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-role').value = user.role || '';
    document.getElementById('profile-status').value = user.status || '';
    
    // Profile-specific info
    const profile = user.profile || {};
    
    if (authService.isCompanyUser()) {
        // Show company profile
        document.getElementById('company-profile-card').style.display = 'block';
        document.getElementById('professional-profile-card').style.display = 'none';
        
        document.getElementById('company-name').value = profile.name || '';
        document.getElementById('cr-number').value = profile.crNumber || '';
        document.getElementById('company-classifications').value = 
            Array.isArray(profile.classifications) ? profile.classifications.join(', ') : profile.classifications || '';
        document.getElementById('financial-capacity').value = profile.financialCapacity || '';
        
        // Setup company form
        setupCompanyForm(user.id);
        
    } else if (authService.isProfessional()) {
        // Show professional profile
        document.getElementById('professional-profile-card').style.display = 'block';
        document.getElementById('company-profile-card').style.display = 'none';
        
        document.getElementById('full-name').value = profile.name || '';
        document.getElementById('specializations').value = 
            Array.isArray(profile.specializations) ? profile.specializations.join(', ') : profile.specializations || '';
        document.getElementById('certifications').value = 
            Array.isArray(profile.certifications) ? profile.certifications.join(', ') : profile.certifications || '';
        document.getElementById('years-experience').value = profile.yearsExperience || '';
        
        // Setup professional form
        setupProfessionalForm(user.id);
    }
}

function setupCompanyForm(userId) {
    const form = document.getElementById('company-profile-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const profileData = {
            name: formData.get('name'),
            crNumber: formData.get('crNumber'),
            classifications: formData.get('classifications')?.split(',').map(s => s.trim()).filter(s => s) || [],
            financialCapacity: parseFloat(formData.get('financialCapacity')) || 0
        };
        
        try {
            await dataService.updateUser(userId, {
                profile: profileData
            });
            
            alert('Profile updated successfully!');
            location.reload();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
}

function setupProfessionalForm(userId) {
    const form = document.getElementById('professional-profile-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const profileData = {
            name: formData.get('name'),
            specializations: formData.get('specializations')?.split(',').map(s => s.trim()).filter(s => s) || [],
            certifications: formData.get('certifications')?.split(',').map(s => s.trim()).filter(s => s) || [],
            yearsExperience: parseInt(formData.get('yearsExperience')) || 0
        };
        
        try {
            await dataService.updateUser(userId, {
                profile: profileData
            });
            
            alert('Profile updated successfully!');
            location.reload();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
}

async function loadProfileStats(userId) {
    try {
        // Opportunities created
        const allOpportunities = await dataService.getOpportunities();
        const oppsCreated = allOpportunities.filter(o => o.creatorId === userId).length;
        document.getElementById('stat-opps-created').textContent = oppsCreated;
        
        // Applications submitted
        const allApplications = await dataService.getApplications();
        const appsSubmitted = allApplications.filter(a => a.applicantId === userId).length;
        document.getElementById('stat-apps-submitted').textContent = appsSubmitted;
        
        // Matches received
        const allMatches = await dataService.getMatches();
        const matchesReceived = allMatches.filter(m => m.candidateId === userId).length;
        document.getElementById('stat-matches-received').textContent = matchesReceived;
        
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}
