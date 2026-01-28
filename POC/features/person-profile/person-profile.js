/**
 * Person Profile Detail Page
 */

let currentProfile = null;

async function initPersonProfile(params) {
    const personId = params?.id;
    if (!personId) {
        showProfileError();
        return;
    }
    
    await loadProfile(personId);
}

async function loadProfile(personId) {
    const loadingEl = document.getElementById('profile-loading');
    const errorEl = document.getElementById('profile-error');
    const contentEl = document.getElementById('profile-content');
    
    try {
        // Get person from storage (checks both users and companies)
        const person = await dataService.getPersonById(personId);
        
        if (!person || !person.isPublic) {
            showProfileError();
            return;
        }
        
        currentProfile = person;
        
        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';
        
        // Populate profile data
        populateProfile(person);
        
        // Setup action buttons (async: needs connection status)
        await setupActions(person);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showProfileError();
    }
}

function showProfileError() {
    const loadingEl = document.getElementById('profile-loading');
    const errorEl = document.getElementById('profile-error');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
}

function populateProfile(person) {
    const profile = person.profile || {};
    const isCompany = profile.type === 'company';
    
    // Avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
        const name = profile.name || 'Unknown';
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarEl.innerHTML = `<div class="avatar-placeholder avatar-lg">${initials}</div>`;
    }
    
    // Basic info
    setTextContent('profile-name', profile.name || 'Unknown');
    setTextContent('profile-headline', profile.headline || profile.title || '');
    
    // Location
    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
        locationEl.querySelector('span').textContent = profile.location || profile.address || 'Not specified';
    }
    
    // Connections
    const connectionsEl = document.getElementById('profile-connections');
    if (connectionsEl) {
        connectionsEl.querySelector('span').textContent = `${person.connectionCount || 0} connections`;
    }
    
    // Bio
    setTextContent('profile-bio', profile.bio || profile.description || 'No bio available.');
    
    // Services
    const servicesSection = document.getElementById('services-section');
    const servicesEl = document.getElementById('profile-services');
    if (servicesEl && profile.services && profile.services.length > 0) {
        servicesEl.innerHTML = profile.services.map(service => 
            `<div class="service-item">${service}</div>`
        ).join('');
        if (servicesSection) servicesSection.style.display = 'block';
    } else if (servicesSection) {
        servicesSection.style.display = 'none';
    }
    
    // Skills
    const skillsSection = document.getElementById('skills-section');
    const skillsEl = document.getElementById('profile-skills');
    if (skillsEl && profile.skills && profile.skills.length > 0) {
        skillsEl.innerHTML = profile.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
        if (skillsSection) skillsSection.style.display = 'block';
    } else if (skillsSection) {
        skillsSection.style.display = 'none';
    }
    
    // Experience section (for professionals)
    const experienceSection = document.getElementById('experience-section');
    if (experienceSection) {
        if (!isCompany && (profile.experience || profile.education)) {
            experienceSection.style.display = 'block';
            setTextContent('profile-experience', profile.experience ? `${profile.experience} years` : 'Not specified');
            setTextContent('profile-education', profile.education || 'Not specified');
        } else {
            experienceSection.style.display = 'none';
        }
    }
    
    // Certifications
    const certificationsSection = document.getElementById('certifications-section');
    const certificationsEl = document.getElementById('profile-certifications');
    if (certificationsEl && profile.certifications && profile.certifications.length > 0) {
        certificationsEl.innerHTML = profile.certifications.map(cert => 
            `<span class="certification-badge">${cert}</span>`
        ).join('');
        if (certificationsSection) certificationsSection.style.display = 'block';
    } else if (certificationsSection) {
        certificationsSection.style.display = 'none';
    }
    
    // Company section
    const companySection = document.getElementById('company-section');
    const companyInfo = document.getElementById('company-info');
    if (companySection && companyInfo) {
        if (isCompany) {
            companySection.style.display = 'block';
            companyInfo.innerHTML = `
                <div class="company-info-item">
                    <strong>Company Type</strong>
                    <span>${profile.companyType || 'N/A'}</span>
                </div>
                <div class="company-info-item">
                    <strong>Employees</strong>
                    <span>${profile.employeeCount || 'N/A'}</span>
                </div>
                <div class="company-info-item">
                    <strong>Established</strong>
                    <span>${profile.yearEstablished || 'N/A'}</span>
                </div>
                <div class="company-info-item">
                    <strong>Sectors</strong>
                    <span>${(profile.sectors || []).join(', ') || 'N/A'}</span>
                </div>
            `;
        } else {
            companySection.style.display = 'none';
        }
    }
    
    // Contact Info
    const emailEl = document.getElementById('contact-email');
    if (emailEl) {
        const emailValue = emailEl.querySelector('.contact-value');
        if (emailValue) {
            emailValue.textContent = person.email || 'Not available';
        }
    }
    
    const phoneEl = document.getElementById('contact-phone');
    if (phoneEl && profile.phone) {
        phoneEl.style.display = 'flex';
        const phoneValue = phoneEl.querySelector('.contact-value');
        if (phoneValue) {
            phoneValue.textContent = profile.phone;
        }
    }
    
    const websiteEl = document.getElementById('contact-website');
    if (websiteEl && profile.website) {
        websiteEl.style.display = 'flex';
        const link = websiteEl.querySelector('a.contact-value');
        if (link) {
            link.href = profile.website;
            link.textContent = profile.website.replace(/^https?:\/\//, '');
        }
    }
    
    // Availability (for professionals)
    const availabilityCard = document.getElementById('availability-card');
    if (availabilityCard) {
        if (!isCompany) {
            availabilityCard.style.display = 'block';
            
            const statusEl = document.getElementById('availability-status');
            if (statusEl) {
                const availability = profile.availability || 'Unknown';
                statusEl.textContent = availability;
                statusEl.className = 'availability-badge ' + availability.toLowerCase();
            }
            
            const modeEl = document.getElementById('availability-mode');
            if (modeEl) {
                modeEl.textContent = profile.preferredWorkMode ? 
                    `Prefers ${profile.preferredWorkMode} work` : '';
            }
            
            const rateInfo = document.getElementById('rate-info');
            const rateEl = document.getElementById('hourly-rate');
            if (rateInfo && rateEl && profile.hourlyRate) {
                rateInfo.style.display = 'block';
                rateEl.textContent = `${profile.hourlyRate} ${profile.currency || 'SAR'}/hr`;
            }
        } else {
            availabilityCard.style.display = 'none';
        }
    }
    
    // Interests
    const interestsCard = document.getElementById('interests-card');
    const interestsEl = document.getElementById('profile-interests');
    if (interestsEl && profile.interests && profile.interests.length > 0) {
        interestsEl.innerHTML = profile.interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        if (interestsCard) interestsCard.style.display = 'block';
    } else if (interestsCard) {
        interestsCard.style.display = 'none';
    }
    
    // Languages
    const languagesCard = document.getElementById('languages-card');
    const languagesEl = document.getElementById('profile-languages');
    if (languagesEl && profile.languages && profile.languages.length > 0) {
        languagesEl.innerHTML = profile.languages.map(lang => 
            `<span class="language-tag">${lang}</span>`
        ).join('');
        if (languagesCard) languagesCard.style.display = 'block';
    } else if (languagesCard) {
        languagesCard.style.display = 'none';
    }
}

function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

async function setupActions(person) {
    const currentUser = authService.getCurrentUser();
    const connectBtn = document.getElementById('btn-connect');
    const messageBtn = document.getElementById('btn-message');
    const connectActionsEl = document.getElementById('connect-actions'); // optional: Accept / Ignore when pending_received
    
    // Check if viewing own profile
    if (currentUser && currentUser.id === person.id) {
        if (connectBtn) connectBtn.style.display = 'none';
        if (messageBtn) {
            messageBtn.textContent = 'Edit Profile';
            messageBtn.style.display = 'inline-block';
            messageBtn.replaceWith(messageBtn.cloneNode(true)); // remove old listeners
            document.getElementById('btn-message').addEventListener('click', () => router.navigate('/profile'));
        }
        if (connectActionsEl) connectActionsEl.style.display = 'none';
        return;
    }
    
    if (!currentUser) {
        if (connectBtn) connectBtn.style.display = 'none';
        if (messageBtn) messageBtn.style.display = 'none';
        if (connectActionsEl) connectActionsEl.style.display = 'none';
        return;
    }
    
    const status = await dataService.getConnectionStatus(currentUser.id, person.id);
    
    // Pending received: show Accept / Ignore and hide Connect
    if (status === 'pending_received') {
        const conn = await dataService.getConnectionBetweenUsers(currentUser.id, person.id);
        if (connectBtn) connectBtn.style.display = 'none';
        if (messageBtn) messageBtn.style.display = 'none';
        if (connectActionsEl) {
            connectActionsEl.style.display = 'flex';
            connectActionsEl.innerHTML = '<span class="pending-label">Wants to connect</span><button id="btn-accept-connection" class="btn btn-primary btn-sm">Accept</button><button id="btn-ignore-connection" class="btn btn-secondary btn-sm">Ignore</button>';
            document.getElementById('btn-accept-connection').addEventListener('click', async () => {
                await dataService.acceptConnection(conn.id);
                if (typeof showNotification === 'function') showNotification('Connection accepted!', 'success');
                await loadProfile(person.id);
            });
            document.getElementById('btn-ignore-connection').addEventListener('click', async () => {
                await dataService.rejectConnection(conn.id);
                if (typeof showNotification === 'function') showNotification('Connection ignored.', 'info');
                await loadProfile(person.id);
            });
        }
        return;
    }
    
    if (connectActionsEl) connectActionsEl.style.display = 'none';
    
    // Connect button: show only when none or when we can send request
    if (connectBtn) {
        connectBtn.style.display = 'block';
        if (status === 'accepted') {
            connectBtn.style.display = 'none';
        } else if (status === 'pending_sent') {
            connectBtn.textContent = 'Pending';
            connectBtn.classList.remove('btn-primary');
            connectBtn.classList.add('btn-warning');
            connectBtn.disabled = true;
            connectBtn.replaceWith(connectBtn.cloneNode(true)); // remove old listener
        } else {
            connectBtn.textContent = 'Connect';
            connectBtn.classList.remove('btn-warning');
            connectBtn.classList.add('btn-primary');
            connectBtn.disabled = false;
            connectBtn.replaceWith(connectBtn.cloneNode(true));
            const btn = document.getElementById('btn-connect');
            btn.addEventListener('click', async () => {
                await dataService.createConnection(currentUser.id, person.id);
                await dataService.createNotification({
                    userId: person.id,
                    type: 'connection_request',
                    title: 'Connection request',
                    message: `${currentUser.profile?.name || currentUser.email} wants to connect with you.`
                });
                await window.modalService.success('Connection request sent!', 'Success');
                await loadProfile(person.id);
            });
        }
    }
    
    // Message button: only when connected
    if (messageBtn) {
        if (status === 'accepted') {
            messageBtn.style.display = 'inline-block';
            messageBtn.textContent = 'Message';
            messageBtn.disabled = false;
            messageBtn.removeAttribute('title');
            messageBtn.replaceWith(messageBtn.cloneNode(true));
            const newMessageBtn = document.getElementById('btn-message');
            if (newMessageBtn) {
                newMessageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.navigate(`/messages/${person.id}`);
                });
            }
        } else {
            messageBtn.style.display = status === 'pending_sent' ? 'none' : 'inline-block';
            if (status !== 'accepted') {
                messageBtn.textContent = 'Message';
                messageBtn.disabled = true;
                messageBtn.title = 'Connect first to message';
            }
        }
    }
}
