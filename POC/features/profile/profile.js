/**
 * Profile Component
 * Matches BRD Flow 7: View current profile → Edit → Save → Profile updated (matching recalculated)
 */

const BASE_PATH = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
let profileLookups = null;

async function loadProfileLookups() {
    if (profileLookups) return profileLookups;
    try {
        const res = await fetch(BASE_PATH + 'data/lookups.json');
        profileLookups = await res.json();
        return profileLookups;
    } catch (e) {
        console.warn('Failed to load lookups for profile', e);
        return {};
    }
}

function parseArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
}

function formatArray(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return '—';
    return arr.join(', ');
}

async function initProfile() {
    const user = authService.getCurrentUser();
    if (!user) {
        router.navigate(CONFIG.ROUTES.LOGIN);
        return;
    }
    await loadProfileLookups();
    await loadProfile(user);
    await loadProfileStats(user.id);
}

function getCompanyCompleteness(profile) {
    const fields = [
        !!profile?.name,
        !!(profile?.crNumber || profile?.registrationNumber),
        (Array.isArray(profile?.sectors) ? profile.sectors.length : parseArray(profile?.sectors).length) > 0 ||
            (Array.isArray(profile?.classifications) ? profile.classifications.length : parseArray(profile?.classifications).length) > 0,
        profile?.financialCapacity != null && profile?.financialCapacity !== '' && Number(profile.financialCapacity) >= 0,
        !!profile?.companyRole,
        (Array.isArray(profile?.preferredPaymentModes) ? profile.preferredPaymentModes.length : 0) > 0
    ];
    const total = 6;
    const filled = fields.filter(Boolean).length;
    return { percent: Math.round((filled / total) * 100), total, filled };
}

function getProfessionalCompleteness(profile) {
    const hasName = !!profile?.name;
    const hasSpec = Array.isArray(profile?.specializations) ? profile.specializations.length > 0 : !!profile?.specializations;
    const hasSkills = Array.isArray(profile?.skills) ? profile.skills.length > 0 : !!profile?.skills;
    const hasCert = Array.isArray(profile?.certifications) ? profile.certifications.length > 0 : !!profile?.certifications;
    const hasExp = (profile?.yearsExperience != null && profile?.yearsExperience !== '') || (profile?.experience != null && profile?.experience !== '');
    const hasHeadline = !!profile?.headline;
    const hasLocation = !!profile?.location;
    const hasWorkMode = !!profile?.preferredWorkMode;
    const hasPaymentModes = (Array.isArray(profile?.preferredPaymentModes) ? profile.preferredPaymentModes.length : 0) > 0;
    const fields = [hasName, hasSpec || hasSkills, hasCert, hasExp, hasHeadline, hasLocation, hasWorkMode, hasPaymentModes];
    const total = 8;
    const filled = fields.filter(Boolean).length;
    return { percent: Math.round((filled / total) * 100), total, filled };
}

function renderCompleteness(profile, isCompany) {
    const card = document.getElementById('profile-completeness-card');
    const textEl = document.getElementById('profile-completeness-text');
    const barEl = document.getElementById('profile-completeness-bar');
    const percentEl = document.getElementById('profile-completeness-percent');
    if (!card || !barEl) return;
    const result = isCompany ? getCompanyCompleteness(profile) : getProfessionalCompleteness(profile);
    card.style.display = 'block';
    barEl.style.width = result.percent + '%';
    percentEl.textContent = result.percent + '%';
    if (result.percent === 100) {
        textEl.textContent = 'Your profile is complete. Keeping it updated improves your match recommendations.';
    } else {
        textEl.textContent = 'Complete your profile to improve match recommendations.';
    }
}

function showProfileSuccess(message) {
    const el = document.getElementById('profile-success-message');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 6000);
}

function setCompanyViewMode(profile) {
    const lookups = profileLookups || {};
    const roles = lookups.companyRoles || [];
    const roleLabel = profile?.companyRole ? (roles.find(r => r.id === profile.companyRole)?.label || profile.companyRole) : '—';
    const subTypes = lookups.companyRoleSubTypes?.[profile?.companyRole] || [];
    const subLabel = profile?.companySubType ? (subTypes.find(s => s.id === profile.companySubType)?.label || profile.companySubType) : '—';
    const paymentModes = lookups.paymentModes || [];
    const preferredLabels = (Array.isArray(profile?.preferredPaymentModes) ? profile.preferredPaymentModes : [])
        .map(id => paymentModes.find(p => p.id === id || p.label === id)?.label || id);
    const preferredText = preferredLabels.length ? preferredLabels.join(', ') : '—';

    document.getElementById('view-company-name').textContent = profile?.name || '—';
    document.getElementById('view-company-headline').textContent = profile?.headline || '—';
    document.getElementById('view-company-role').textContent = roleLabel;
    document.getElementById('view-company-subtype').textContent = subLabel;
    document.getElementById('view-cr-number').textContent = profile?.crNumber || profile?.registrationNumber || '—';
    document.getElementById('view-company-website').textContent = profile?.website || '—';
    document.getElementById('view-company-phone').textContent = profile?.phone || '—';
    document.getElementById('view-company-location').textContent = profile?.location || profile?.address || '—';
    document.getElementById('view-company-description').textContent = profile?.description || '—';
    document.getElementById('view-company-sectors').textContent = formatArray(profile?.sectors);
    document.getElementById('view-company-classifications').textContent = formatArray(profile?.classifications);
    document.getElementById('view-company-employeeCount').textContent = profile?.employeeCount || '—';
    document.getElementById('view-company-yearEstablished').textContent = profile?.yearEstablished != null && profile?.yearEstablished !== '' ? profile.yearEstablished : '—';
    document.getElementById('view-company-certifications').textContent = formatArray(profile?.certifications);
    document.getElementById('view-company-services').textContent = formatArray(profile?.services);
    document.getElementById('view-company-interests').textContent = formatArray(profile?.interests);
    document.getElementById('view-financial-capacity').textContent =
        profile?.financialCapacity != null && profile?.financialCapacity !== ''
            ? Number(profile.financialCapacity).toLocaleString() + ' SAR' : '—';
    document.getElementById('view-company-paymentModes').textContent = preferredText;
}

function setProfessionalViewMode(profile) {
    const lookups = profileLookups || {};
    const workModes = lookups.workModes || [];
    const workModeLabel = profile?.preferredWorkMode ? (workModes.includes(profile.preferredWorkMode) ? profile.preferredWorkMode : profile.preferredWorkMode) : '—';
    const paymentModes = lookups.paymentModes || [];
    const preferredLabels = (Array.isArray(profile?.preferredPaymentModes) ? profile.preferredPaymentModes : [])
        .map(id => paymentModes.find(p => p.id === id || p.label === id)?.label || id);
    const preferredText = preferredLabels.length ? preferredLabels.join(', ') : '—';
    const exp = profile?.yearsExperience ?? profile?.experience;

    document.getElementById('view-full-name').textContent = profile?.name || '—';
    document.getElementById('view-prof-headline').textContent = profile?.headline || '—';
    document.getElementById('view-prof-title').textContent = profile?.title || '—';
    document.getElementById('view-prof-phone').textContent = profile?.phone || '—';
    document.getElementById('view-prof-location').textContent = profile?.location || '—';
    document.getElementById('view-prof-bio').textContent = profile?.bio || '—';
    document.getElementById('view-specializations').textContent = formatArray(profile?.specializations);
    document.getElementById('view-skills').textContent = formatArray(profile?.skills);
    document.getElementById('view-prof-sectors').textContent = formatArray(profile?.sectors || profile?.industry);
    document.getElementById('view-prof-education').textContent = profile?.education || '—';
    document.getElementById('view-certifications').textContent = formatArray(profile?.certifications);
    document.getElementById('view-years-experience').textContent = exp != null && exp !== '' ? exp : '—';
    document.getElementById('view-prof-services').textContent = formatArray(profile?.services);
    document.getElementById('view-prof-interests').textContent = formatArray(profile?.interests);
    document.getElementById('view-prof-availability').textContent = profile?.availability || '—';
    document.getElementById('view-prof-workMode').textContent = workModeLabel;
    document.getElementById('view-prof-paymentModes').textContent = preferredText;
    const rate = profile?.hourlyRate;
    const currency = profile?.currency || 'SAR';
    document.getElementById('view-prof-hourlyRate').textContent = rate != null && rate !== '' ? rate + ' ' + currency : '—';
    document.getElementById('view-prof-languages').textContent = formatArray(profile?.languages);
}

function fillCompanyLookups() {
    const lookups = profileLookups || {};
    const roleSelect = document.getElementById('company-role');
    if (roleSelect && roleSelect.options.length <= 1) {
        const roles = lookups.companyRoles || [];
        roleSelect.innerHTML = '<option value="">Select role</option>';
        roles.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.label;
            roleSelect.appendChild(opt);
        });
    }
    const paySelect = document.getElementById('company-paymentModes');
    if (paySelect && paySelect.options.length === 0) {
        const modes = lookups.paymentModes || [];
        modes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.label;
            paySelect.appendChild(opt);
        });
    }
}

function fillCompanySubTypeOptions(companyRole) {
    const lookups = profileLookups || {};
    const subSelect = document.getElementById('company-subtype');
    if (!subSelect) return;
    const subTypes = lookups.companyRoleSubTypes?.[companyRole] || [];
    subSelect.innerHTML = '<option value="">Select sub-type</option>';
    subTypes.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        subSelect.appendChild(opt);
    });
    const wrap = document.getElementById('company-subtype-wrap');
    if (wrap) wrap.style.display = subTypes.length ? 'block' : 'none';
}

function fillProfessionalLookups() {
    const lookups = profileLookups || {};
    const workSelect = document.getElementById('prof-workMode');
    if (workSelect && workSelect.options.length <= 1) {
        const modes = lookups.workModes || [];
        workSelect.innerHTML = '<option value="">Select</option>';
        modes.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            workSelect.appendChild(opt);
        });
    }
    const paySelect = document.getElementById('prof-paymentModes');
    if (paySelect && paySelect.options.length === 0) {
        const modes = lookups.paymentModes || [];
        modes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.label;
            paySelect.appendChild(opt);
        });
    }
}

async function loadProfile(user) {
    // Basic info
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-role').value = user.role || '';
    document.getElementById('profile-status').value = user.status || '';
    
    // Hide success message and other card by default
    const successEl = document.getElementById('profile-success-message');
    if (successEl) successEl.classList.add('hidden');
    const otherCard = document.getElementById('profile-other-card');
    if (otherCard) otherCard.style.display = 'none';
    
    // Show clarification banner and "Submit for review again" when status is clarification_requested
    const clarificationBanner = document.getElementById('profile-clarification-banner');
    const submitReviewBtn = document.getElementById('profile-submit-review-again');
    if (clarificationBanner) {
        clarificationBanner.style.display = user.status === 'clarification_requested' ? 'block' : 'none';
    }
    if (submitReviewBtn) {
        submitReviewBtn.onclick = null;
        if (user.status === 'clarification_requested') {
            submitReviewBtn.onclick = async () => {
                try {
                    const isCompany = user.profile?.type === 'company';
                    if (isCompany) {
                        await dataService.updateCompany(user.id, { status: 'pending' });
                    } else {
                        await dataService.updateUser(user.id, { status: 'pending' });
                    }
                    alert('Your account has been resubmitted for review. You will be notified once an admin reviews it.');
                    location.reload();
                } catch (err) {
                    console.error('Error resubmitting for review:', err);
                    alert('Failed to resubmit. Please try again.');
                }
            };
        }
    }
    
    const profile = user.profile || {};
    
    if (authService.isCompanyUser()) {
        document.getElementById('company-profile-card').style.display = 'block';
        document.getElementById('professional-profile-card').style.display = 'none';

        fillCompanyLookups();
        document.getElementById('company-name').value = profile.name || '';
        document.getElementById('company-headline').value = profile.headline || '';
        document.getElementById('company-role').value = profile.companyRole || '';
        fillCompanySubTypeOptions(profile.companyRole);
        document.getElementById('company-subtype').value = profile.companySubType || '';
        document.getElementById('cr-number').value = profile.crNumber || profile.registrationNumber || '';
        document.getElementById('company-website').value = profile.website || '';
        document.getElementById('company-phone').value = profile.phone || '';
        document.getElementById('company-location').value = profile.location || profile.address || '';
        document.getElementById('company-description').value = profile.description || '';
        document.getElementById('company-sectors').value = Array.isArray(profile.sectors) ? profile.sectors.join(', ') : (profile.sectors || '');
        document.getElementById('company-classifications').value = Array.isArray(profile.classifications) ? profile.classifications.join(', ') : (profile.classifications || '');
        document.getElementById('company-employeeCount').value = profile.employeeCount || '';
        document.getElementById('company-yearEstablished').value = profile.yearEstablished ?? '';
        document.getElementById('company-certifications').value = Array.isArray(profile.certifications) ? profile.certifications.join(', ') : (profile.certifications || '');
        document.getElementById('company-services').value = Array.isArray(profile.services) ? profile.services.join(', ') : (profile.services || '');
        document.getElementById('company-interests').value = Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || '');
        document.getElementById('financial-capacity').value = profile.financialCapacity ?? '';
        const preferredPayment = profile.preferredPaymentModes || [];
        const paySelect = document.getElementById('company-paymentModes');
        if (paySelect) Array.from(paySelect.options).forEach(opt => { opt.selected = preferredPayment.indexOf(opt.value) !== -1; });

        setCompanyViewMode(profile);
        renderCompleteness(profile, true);
        showCompanyView();
        setupCompanyForm(user.id);
    } else if (authService.isProfessional()) {
        document.getElementById('professional-profile-card').style.display = 'block';
        document.getElementById('company-profile-card').style.display = 'none';

        fillProfessionalLookups();
        document.getElementById('full-name').value = profile.name || '';
        document.getElementById('prof-headline').value = profile.headline || '';
        document.getElementById('prof-title').value = profile.title || '';
        document.getElementById('prof-phone').value = profile.phone || '';
        document.getElementById('prof-location').value = profile.location || '';
        document.getElementById('prof-bio').value = profile.bio || '';
        document.getElementById('specializations').value = Array.isArray(profile.specializations) ? profile.specializations.join(', ') : (profile.specializations || '');
        document.getElementById('skills').value = Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '');
        document.getElementById('prof-sectors').value = Array.isArray(profile.sectors) ? profile.sectors.join(', ') : (profile.sectors || profile.industry || '');
        document.getElementById('prof-education').value = profile.education || '';
        document.getElementById('certifications').value = Array.isArray(profile.certifications) ? profile.certifications.join(', ') : (profile.certifications || '');
        document.getElementById('years-experience').value = profile.yearsExperience ?? profile.experience ?? '';
        document.getElementById('prof-services').value = Array.isArray(profile.services) ? profile.services.join(', ') : (profile.services || '');
        document.getElementById('prof-interests').value = Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || '');
        document.getElementById('prof-availability').value = profile.availability || '';
        document.getElementById('prof-workMode').value = profile.preferredWorkMode || '';
        const preferredPayment = profile.preferredPaymentModes || [];
        const paySelect = document.getElementById('prof-paymentModes');
        if (paySelect) Array.from(paySelect.options).forEach(opt => { opt.selected = preferredPayment.indexOf(opt.value) !== -1; });
        document.getElementById('prof-hourlyRate').value = profile.hourlyRate ?? '';
        document.getElementById('prof-currency').value = profile.currency || 'SAR';
        document.getElementById('prof-languages').value = Array.isArray(profile.languages) ? profile.languages.join(', ') : (profile.languages || '');

        setProfessionalViewMode(profile);
        renderCompleteness(profile, false);
        showProfessionalView();
        setupProfessionalForm(user.id);
    } else {
        if (otherCard) otherCard.style.display = 'block';
        document.getElementById('company-profile-card').style.display = 'none';
        document.getElementById('professional-profile-card').style.display = 'none';
    }
}

function showCompanyView() {
    const view = document.getElementById('company-profile-view');
    const form = document.getElementById('company-profile-form');
    const editBtn = document.getElementById('company-profile-edit-btn');
    const cancelBtn = document.getElementById('company-profile-cancel-btn');
    if (view) view.style.display = 'block';
    if (form) form.style.display = 'none';
    if (editBtn) editBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function showCompanyEdit() {
    const view = document.getElementById('company-profile-view');
    const form = document.getElementById('company-profile-form');
    const editBtn = document.getElementById('company-profile-edit-btn');
    const cancelBtn = document.getElementById('company-profile-cancel-btn');
    if (view) view.style.display = 'none';
    if (form) form.style.display = 'block';
    if (editBtn) editBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function showProfessionalView() {
    const view = document.getElementById('professional-profile-view');
    const form = document.getElementById('professional-profile-form');
    const editBtn = document.getElementById('professional-profile-edit-btn');
    const cancelBtn = document.getElementById('professional-profile-cancel-btn');
    if (view) view.style.display = 'block';
    if (form) form.style.display = 'none';
    if (editBtn) editBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function showProfessionalEdit() {
    const view = document.getElementById('professional-profile-view');
    const form = document.getElementById('professional-profile-form');
    const editBtn = document.getElementById('professional-profile-edit-btn');
    const cancelBtn = document.getElementById('professional-profile-cancel-btn');
    if (view) view.style.display = 'none';
    if (form) form.style.display = 'block';
    if (editBtn) editBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function setupCompanyForm(userId) {
    const form = document.getElementById('company-profile-form');
    const editBtn = document.getElementById('company-profile-edit-btn');
    const cancelBtn = document.getElementById('company-profile-cancel-btn');
    const roleSelect = document.getElementById('company-role');
    if (!form) return;

    if (roleSelect) roleSelect.addEventListener('change', () => fillCompanySubTypeOptions(roleSelect.value));
    if (editBtn) editBtn.addEventListener('click', () => showCompanyEdit());
    if (cancelBtn) cancelBtn.addEventListener('click', () => showCompanyView());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payEl = document.getElementById('company-paymentModes');
        const preferredPaymentModes = payEl ? Array.from(payEl.selectedOptions).map(o => o.value) : [];
        const profileData = {
            type: 'company',
            name: formData.get('name') || null,
            headline: formData.get('headline') || null,
            companyRole: formData.get('companyRole') || null,
            companySubType: formData.get('companySubType') || null,
            crNumber: formData.get('crNumber') || null,
            registrationNumber: formData.get('crNumber') || null,
            website: formData.get('website') || null,
            phone: formData.get('phone') || null,
            location: formData.get('location') || null,
            description: formData.get('description') || null,
            sectors: parseArray(formData.get('sectors')),
            classifications: parseArray(formData.get('classifications')),
            employeeCount: formData.get('employeeCount') || null,
            yearEstablished: formData.get('yearEstablished') ? parseInt(formData.get('yearEstablished'), 10) : null,
            certifications: parseArray(formData.get('certifications')),
            services: parseArray(formData.get('services')),
            interests: parseArray(formData.get('interests')),
            financialCapacity: parseFloat(formData.get('financialCapacity')) || 0,
            preferredPaymentModes
        };
        try {
            const user = authService.getCurrentUser();
            const merged = { ...(user?.profile || {}), ...profileData };
            await dataService.updateCompany(userId, { profile: merged });
            authService.currentUser = { ...user, profile: merged };
            setCompanyViewMode(merged);
            renderCompleteness(merged, true);
            showCompanyView();
            showProfileSuccess('Profile updated successfully. Your match recommendations will update to reflect these changes.');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
}

function setupProfessionalForm(userId) {
    const form = document.getElementById('professional-profile-form');
    const editBtn = document.getElementById('professional-profile-edit-btn');
    const cancelBtn = document.getElementById('professional-profile-cancel-btn');
    if (!form) return;

    if (editBtn) editBtn.addEventListener('click', () => showProfessionalEdit());
    if (cancelBtn) cancelBtn.addEventListener('click', () => showProfessionalView());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payEl = document.getElementById('prof-paymentModes');
        const preferredPaymentModes = payEl ? Array.from(payEl.selectedOptions).map(o => o.value) : [];
        const yearsVal = formData.get('yearsExperience');
        const yearsExperience = yearsVal !== '' && yearsVal != null ? parseInt(yearsVal, 10) : null;
        const profileData = {
            name: formData.get('name') || null,
            headline: formData.get('headline') || null,
            title: formData.get('title') || null,
            phone: formData.get('phone') || null,
            location: formData.get('location') || null,
            bio: formData.get('bio') || null,
            specializations: parseArray(formData.get('specializations')),
            skills: parseArray(formData.get('skills')),
            sectors: parseArray(formData.get('sectors')),
            education: formData.get('education') || null,
            certifications: parseArray(formData.get('certifications')),
            yearsExperience: yearsExperience != null ? yearsExperience : 0,
            experience: yearsExperience,
            services: parseArray(formData.get('services')),
            interests: parseArray(formData.get('interests')),
            availability: formData.get('availability') || null,
            preferredWorkMode: formData.get('preferredWorkMode') || null,
            preferredPaymentModes,
            hourlyRate: formData.get('hourlyRate') !== '' ? parseFloat(formData.get('hourlyRate')) : null,
            currency: formData.get('currency') || 'SAR',
            languages: parseArray(formData.get('languages'))
        };
        try {
            const user = authService.getCurrentUser();
            const merged = { ...(user?.profile || {}), ...profileData };
            if (user?.profile?.type) merged.type = user.profile.type;
            await dataService.updateUser(userId, { profile: merged });
            authService.currentUser = { ...user, profile: merged };
            setProfessionalViewMode(merged);
            renderCompleteness(merged, false);
            showProfessionalView();
            showProfileSuccess('Profile updated successfully. Your match recommendations will update to reflect these changes.');
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
