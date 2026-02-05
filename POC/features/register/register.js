/**
 * Register Page Component - Dual workflow (Company vs Individual)
 */

const BASE_PATH = (window.CONFIG && window.CONFIG.BASE_PATH) || '';

let regState = {
    accountType: null,
    currentStep: 0,
    companyRole: null,
    companySubType: null,
    companyName: '',
    website: '',
    email: '',
    mobile: '',
    address: { country: '', region: '', city: '' },
    password: '',
    emailVerified: false,
    mobileVerified: false,
    documents: [],
    termsAccepted: false,
    individualType: null,
    fullName: '',
    specialty: '',
    expertise: ''
};

let lookupsData = null;
let locationsData = null;
let otpCodes = { email: null, mobile: null, indEmail: null, indMobile: null };

function showRegError(msg) {
    const el = document.getElementById('register-error');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
    const successEl = document.getElementById('register-success');
    if (successEl) successEl.style.display = 'none';
}

function showRegSuccess(msg) {
    const el = document.getElementById('register-success');
    if (el) {
        el.innerHTML = msg;
        el.style.display = 'block';
    }
    const errEl = document.getElementById('register-error');
    if (errEl) errEl.style.display = 'none';
}

function hideRegMessages() {
    const err = document.getElementById('register-error');
    const success = document.getElementById('register-success');
    if (err) err.style.display = 'none';
    if (success) success.style.display = 'none';
}

function getRegStepId() {
    if (regState.currentStep === 0) return 'reg-step-0';
    if (regState.accountType === 'company') return `reg-step-a${regState.currentStep}`;
    return `reg-step-b${regState.currentStep}`;
}

function showRegStep(stepId) {
    document.querySelectorAll('.reg-step-content').forEach(el => {
        el.classList.add('hidden');
    });
    const step = document.getElementById(stepId);
    if (step) step.classList.remove('hidden');
}

function updateRegProgress() {
    const progressWrap = document.getElementById('reg-wizard-progress');
    const label = document.getElementById('reg-step-label');
    const bar = document.getElementById('reg-progress-bar');
    if (regState.currentStep === 0) {
        if (progressWrap) progressWrap.classList.add('hidden');
        return;
    }
    if (progressWrap) progressWrap.classList.remove('hidden');
    const total = 4;
    const pct = (regState.currentStep / total) * 100;
    if (label) label.textContent = `Step ${regState.currentStep} of ${total}`;
    if (bar) bar.style.width = `${pct}%`;
}

function goToRegStep(step) {
    regState.currentStep = step;
    const stepId = getRegStepId();
    showRegStep(stepId);
    updateRegProgress();
    hideRegMessages();
}

function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function requestOTP(channel, prefix) {
    const code = generateOTP();
    if (prefix === 'company') {
        if (channel === 'email') otpCodes.email = code;
        else otpCodes.mobile = code;
    } else {
        if (channel === 'email') otpCodes.indEmail = code;
        else otpCodes.indMobile = code;
    }
    return code;
}

function verifyOTP(channel, code, prefix) {
    let stored;
    if (prefix === 'company') {
        stored = channel === 'email' ? otpCodes.email : otpCodes.mobile;
    } else {
        stored = channel === 'email' ? otpCodes.indEmail : otpCodes.indMobile;
    }
    const ok = stored && String(code).trim() === String(stored);
    if (ok && prefix === 'company') {
        if (channel === 'email') regState.emailVerified = true;
        else regState.mobileVerified = true;
    }
    if (ok && prefix === 'individual') {
        if (channel === 'email') regState.emailVerified = true;
        else regState.mobileVerified = true;
    }
    return ok;
}

async function loadRegData() {
    if (lookupsData && locationsData) return;
    try {
        const [lookupRes, locRes] = await Promise.all([
            fetch(BASE_PATH + 'data/lookups.json'),
            fetch(BASE_PATH + 'data/locations.json')
        ]);
        lookupsData = await lookupRes.json();
        locationsData = await locRes.json();
    } catch (e) {
        console.error('Failed to load registration data', e);
    }
}

function setupLocationDropdowns(prefix) {
    const countryId = prefix === 'company' ? 'reg-address-country' : 'reg-ind-address-country';
    const regionId = prefix === 'company' ? 'reg-address-region' : 'reg-ind-address-region';
    const cityId = prefix === 'company' ? 'reg-address-city' : 'reg-ind-address-city';
    const countries = locationsData?.countries || [];
    const countrySelect = document.getElementById(countryId);
    const regionSelect = document.getElementById(regionId);
    const citySelect = document.getElementById(cityId);
    if (!countrySelect || !regionSelect || !citySelect) return;

    countrySelect.innerHTML = '<option value="">Select country</option>';
    countries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        countrySelect.appendChild(opt);
    });

    regionSelect.innerHTML = '<option value="">Select region</option>';
    citySelect.innerHTML = '<option value="">Select city</option>';

    function onCountryChange() {
        const cid = countrySelect.value;
        regionSelect.innerHTML = '<option value="">Select region</option>';
        citySelect.innerHTML = '<option value="">Select city</option>';
        if (!cid) return;
        const country = countries.find(c => c.id === cid);
        const regions = country?.regions || [];
        regions.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            regionSelect.appendChild(opt);
        });
    }

    function onRegionChange() {
        const cid = countrySelect.value;
        const rid = regionSelect.value;
        citySelect.innerHTML = '<option value="">Select city</option>';
        if (!cid || !rid) return;
        const country = countries.find(c => c.id === cid);
        const region = country?.regions?.find(r => r.id === rid);
        const cities = region?.cities || [];
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            citySelect.appendChild(opt);
        });
    }

    countrySelect.removeEventListener('change', onCountryChange);
    regionSelect.removeEventListener('change', onRegionChange);
    countrySelect.addEventListener('change', onCountryChange);
    regionSelect.addEventListener('change', onRegionChange);
}

function validateRegStep(step) {
    if (regState.accountType === 'company') {
        if (step === 1) {
            const role = document.getElementById('reg-company-role')?.value;
            if (!role) { showRegError('Please select a company role'); return false; }
            const wrap = document.getElementById('reg-company-subtype-wrap');
            if (wrap && !wrap.classList.contains('hidden')) {
                const sub = document.getElementById('reg-company-subtype')?.value;
                if (!sub) { showRegError('Please select a sub-type'); return false; }
            }
            return true;
        }
        if (step === 2) {
            const name = document.getElementById('reg-company-name')?.value?.trim();
            if (!name) { showRegError('Company name is required'); return false; }
            const email = document.getElementById('reg-email')?.value?.trim();
            if (!email) { showRegError('Email is required'); return false; }
            if (!regState.emailVerified) { showRegError('Please verify your email with OTP'); return false; }
            const mobile = document.getElementById('reg-mobile')?.value?.trim();
            if (!mobile) { showRegError('Mobile is required'); return false; }
            if (!regState.mobileVerified) { showRegError('Please verify your mobile with OTP'); return false; }
            const country = document.getElementById('reg-address-country')?.value;
            if (!country) { showRegError('Country is required'); return false; }
            const password = document.getElementById('reg-password')?.value;
            const confirm = document.getElementById('reg-confirm-password')?.value;
            if (!password || password.length < 6) { showRegError('Password must be at least 6 characters'); return false; }
            if (password !== confirm) { showRegError('Passwords do not match'); return false; }
            return true;
        }
        if (step === 3) {
            const role = regState.companyRole;
            const docs = lookupsData?.companyRoleDocuments?.[role] || [];
            const required = docs.filter(d => d.required);
            for (const r of required) {
                const has = regState.documents.some(d => d.type === r.id);
                if (!has) { showRegError(`Please upload: ${r.label}`); return false; }
            }
            const terms = document.getElementById('reg-terms-company')?.checked;
            if (!terms) { showRegError('You must accept the Terms & Conditions'); return false; }
            return true;
        }
    }
    if (regState.accountType === 'individual') {
        if (step === 1) {
            const type = document.querySelector('input[name="individualType"]:checked')?.value;
            if (!type) { showRegError('Please select Professional or Consultant'); return false; }
            return true;
        }
        if (step === 2) {
            const name = document.getElementById('reg-full-name')?.value?.trim();
            if (!name) { showRegError('Full name is required'); return false; }
            const email = document.getElementById('reg-ind-email')?.value?.trim();
            if (!email) { showRegError('Email is required'); return false; }
            if (!regState.emailVerified) { showRegError('Please verify your email with OTP'); return false; }
            const mobile = document.getElementById('reg-ind-mobile')?.value?.trim();
            if (!mobile) { showRegError('Mobile is required'); return false; }
            if (!regState.mobileVerified) { showRegError('Please verify your mobile with OTP'); return false; }
            const country = document.getElementById('reg-ind-address-country')?.value;
            if (!country) { showRegError('Country is required'); return false; }
            const password = document.getElementById('reg-ind-password')?.value;
            const confirm = document.getElementById('reg-ind-confirm-password')?.value;
            if (!password || password.length < 6) { showRegError('Password must be at least 6 characters'); return false; }
            if (password !== confirm) { showRegError('Passwords do not match'); return false; }
            const type = regState.individualType;
            if (type === 'professional') {
                const spec = document.getElementById('reg-specialty')?.value?.trim();
                if (!spec) { showRegError('Discipline / Specialty is required'); return false; }
            } else {
                const exp = document.getElementById('reg-expertise')?.value?.trim();
                if (!exp) { showRegError('Expertise area is required'); return false; }
            }
            return true;
        }
        if (step === 3) {
            const type = regState.individualType;
            const docs = lookupsData?.individualTypeDocuments?.[type] || [];
            const required = docs.filter(d => d.required);
            for (const r of required) {
                const has = regState.documents.some(d => d.type === r.id);
                if (!has) { showRegError(`Please upload: ${r.label}`); return false; }
            }
            const terms = document.getElementById('reg-terms-individual')?.checked;
            if (!terms) { showRegError('You must accept the Terms & Conditions'); return false; }
            return true;
        }
    }
    return true;
}

function syncRegStateFromForm() {
    if (regState.accountType === 'company') {
        regState.companyRole = document.getElementById('reg-company-role')?.value || null;
        regState.companySubType = document.getElementById('reg-company-subtype')?.value || null;
        regState.companyName = document.getElementById('reg-company-name')?.value?.trim() || '';
        regState.website = document.getElementById('reg-company-website')?.value?.trim() || '';
        regState.email = document.getElementById('reg-email')?.value?.trim() || '';
        regState.mobile = document.getElementById('reg-mobile')?.value?.trim() || '';
        regState.address = {
            country: document.getElementById('reg-address-country')?.value || '',
            region: document.getElementById('reg-address-region')?.value || '',
            city: document.getElementById('reg-address-city')?.value || ''
        };
        regState.password = document.getElementById('reg-password')?.value || '';
    } else if (regState.accountType === 'individual') {
        regState.individualType = document.querySelector('input[name="individualType"]:checked')?.value || null;
        regState.fullName = document.getElementById('reg-full-name')?.value?.trim() || '';
        regState.email = document.getElementById('reg-ind-email')?.value?.trim() || '';
        regState.mobile = document.getElementById('reg-ind-mobile')?.value?.trim() || '';
        regState.address = {
            country: document.getElementById('reg-ind-address-country')?.value || '',
            region: document.getElementById('reg-ind-address-region')?.value || '',
            city: document.getElementById('reg-ind-address-city')?.value || ''
        };
        regState.password = document.getElementById('reg-ind-password')?.value || '';
        regState.specialty = document.getElementById('reg-specialty')?.value?.trim() || '';
        regState.expertise = document.getElementById('reg-expertise')?.value?.trim() || '';
    }
}

function renderCompanyDocuments() {
    const container = document.getElementById('reg-company-documents');
    if (!container) return;
    const role = regState.companyRole;
    const docs = lookupsData?.companyRoleDocuments?.[role] || [];
    container.innerHTML = '';
    docs.forEach(d => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="block mb-2 font-medium text-gray-900">${d.label} ${d.required ? '<span class="text-red-600">*</span>' : ''}</label>
            <input type="file" data-doc-type="${d.id}" data-doc-label="${d.label}" class="reg-doc-input w-full px-4 py-2 border border-gray-300 rounded-md" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
            <span class="reg-doc-name text-sm text-gray-500"></span>
        `;
        container.appendChild(div);
        const input = div.querySelector('.reg-doc-input');
        const nameSpan = div.querySelector('.reg-doc-name');
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) {
                regState.documents = regState.documents.filter(x => x.type !== d.id);
                nameSpan.textContent = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showRegError('File size must be under 5MB');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                regState.documents = regState.documents.filter(x => x.type !== d.id);
                regState.documents.push({ type: d.id, label: d.label, fileName: file.name, data: reader.result });
                nameSpan.textContent = file.name;
            };
            reader.readAsDataURL(file);
        });
    });
}

function renderIndividualDocuments() {
    const container = document.getElementById('reg-individual-documents');
    if (!container) return;
    const type = regState.individualType;
    const docs = lookupsData?.individualTypeDocuments?.[type] || [];
    container.innerHTML = '';
    regState.documents = [];
    docs.forEach(d => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="block mb-2 font-medium text-gray-900">${d.label} ${d.required ? '<span class="text-red-600">*</span>' : ''}</label>
            <input type="file" data-doc-type="${d.id}" data-doc-label="${d.label}" class="reg-doc-ind-input w-full px-4 py-2 border border-gray-300 rounded-md" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
            <span class="reg-doc-ind-name text-sm text-gray-500"></span>
        `;
        container.appendChild(div);
        const input = div.querySelector('.reg-doc-ind-input');
        const nameSpan = div.querySelector('.reg-doc-ind-name');
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) {
                regState.documents = regState.documents.filter(x => x.type !== d.id);
                nameSpan.textContent = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showRegError('File size must be under 5MB');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                regState.documents = regState.documents.filter(x => x.type !== d.id);
                regState.documents.push({ type: d.id, label: d.label, fileName: file.name, data: reader.result });
                nameSpan.textContent = file.name;
            };
            reader.readAsDataURL(file);
        });
    });
}

function renderReviewCompany() {
    syncRegStateFromForm();
    const container = document.getElementById('reg-review-company');
    if (!container) return;
    const roles = lookupsData?.companyRoles || [];
    const roleLabel = roles.find(r => r.id === regState.companyRole)?.label || regState.companyRole;
    const subTypes = lookupsData?.companyRoleSubTypes?.[regState.companyRole] || [];
    const subLabel = regState.companySubType ? (subTypes.find(s => s.id === regState.companySubType)?.label || regState.companySubType) : '';
    const loc = [regState.address.country, regState.address.region, regState.address.city].filter(Boolean).join(', ');
    const docList = regState.documents.map(d => d.label + ': ' + d.fileName).join('; ');
    container.innerHTML = `
        <p><strong>Role:</strong> ${roleLabel} ${subLabel ? ' / ' + subLabel : ''}</p>
        <p><strong>Company:</strong> ${regState.companyName}</p>
        <p><strong>Email:</strong> ${regState.email} (verified)</p>
        <p><strong>Mobile:</strong> ${regState.mobile} (verified)</p>
        <p><strong>Address:</strong> ${loc || '—'}</p>
        <p><strong>Documents:</strong> ${docList || '—'}</p>
    `;
}

function renderReviewIndividual() {
    syncRegStateFromForm();
    const container = document.getElementById('reg-review-individual');
    if (!container) return;
    const typeLabel = regState.individualType === 'professional' ? 'Professional' : 'Consultant';
    const spec = regState.individualType === 'professional' ? regState.specialty : regState.expertise;
    const loc = [regState.address.country, regState.address.region, regState.address.city].filter(Boolean).join(', ');
    const docList = regState.documents.map(d => d.label + ': ' + d.fileName).join('; ');
    container.innerHTML = `
        <p><strong>Type:</strong> ${typeLabel}</p>
        <p><strong>Name:</strong> ${regState.fullName}</p>
        <p><strong>Specialty/Expertise:</strong> ${spec}</p>
        <p><strong>Email:</strong> ${regState.email} (verified)</p>
        <p><strong>Mobile:</strong> ${regState.mobile} (verified)</p>
        <p><strong>Address:</strong> ${loc || '—'}</p>
        <p><strong>Documents:</strong> ${docList || '—'}</p>
    `;
}

async function submitCompany() {
    syncRegStateFromForm();
    const address = {
        country: regState.address.country,
        region: regState.address.region,
        city: regState.address.city
    };
    try {
        await authService.registerCompany({
            companyName: regState.companyName,
            website: regState.website,
            email: regState.email,
            mobile: regState.mobile,
            address,
            password: regState.password,
            companyRole: regState.companyRole,
            companySubType: regState.companySubType || null,
            documents: regState.documents,
            emailVerified: true,
            mobileVerified: true
        });
        showRegSuccess('Account created successfully. Your account is pending admin approval. You will receive an email once approved. Redirecting to login...');
        setTimeout(() => router.navigate(CONFIG.ROUTES.LOGIN), 3000);
    } catch (err) {
        showRegError(err.message || 'Registration failed. Please try again.');
    }
}

async function submitIndividual() {
    syncRegStateFromForm();
    const role = regState.individualType === 'professional' ? CONFIG.ROLES.PROFESSIONAL : CONFIG.ROLES.CONSULTANT;
    const specialty = regState.individualType === 'professional' ? regState.specialty : regState.expertise;
    const profile = {
        type: regState.individualType,
        name: regState.fullName,
        phone: regState.mobile,
        location: [regState.address.country, regState.address.region, regState.address.city].filter(Boolean).join(', '),
        specialty,
        individualType: regState.individualType
    };
    try {
        await authService.register({
            email: regState.email,
            password: regState.password,
            role,
            profile,
            address: regState.address,
            individualType: regState.individualType,
            specialty,
            documents: regState.documents,
            emailVerified: true,
            mobileVerified: true
        });
        showRegSuccess('Account created successfully. Your account is pending admin approval. You will receive an email once approved. Redirecting to login...');
        setTimeout(() => router.navigate(CONFIG.ROUTES.LOGIN), 3000);
    } catch (err) {
        showRegError(err.message || 'Registration failed. Please try again.');
    }
}

function setupOTPCompany() {
    const emailSend = document.getElementById('reg-otp-email-send');
    const emailWrap = document.getElementById('reg-otp-email-verify-wrap');
    const emailCode = document.getElementById('reg-otp-email-code');
    const emailDisplay = document.getElementById('reg-otp-email-display');
    const emailVerify = document.getElementById('reg-otp-email-verify');
    const emailBadge = document.getElementById('reg-email-verified-badge');
    if (emailSend) {
        emailSend.addEventListener('click', () => {
            const code = requestOTP('email', 'company');
            if (emailDisplay) emailDisplay.textContent = 'Code: ' + code;
            if (emailWrap) emailWrap.classList.remove('hidden');
        });
    }
    if (emailVerify) {
        emailVerify.addEventListener('click', () => {
            const ok = verifyOTP('email', emailCode?.value, 'company');
            if (ok && emailBadge) { emailBadge.classList.remove('hidden'); }
            else if (!ok) showRegError('Invalid code');
        });
    }
    const mobileSend = document.getElementById('reg-otp-mobile-send');
    const mobileWrap = document.getElementById('reg-otp-mobile-verify-wrap');
    const mobileCode = document.getElementById('reg-otp-mobile-code');
    const mobileDisplay = document.getElementById('reg-otp-mobile-display');
    const mobileVerify = document.getElementById('reg-otp-mobile-verify');
    const mobileBadge = document.getElementById('reg-mobile-verified-badge');
    if (mobileSend) {
        mobileSend.addEventListener('click', () => {
            const code = requestOTP('mobile', 'company');
            if (mobileDisplay) mobileDisplay.textContent = 'Code: ' + code;
            if (mobileWrap) mobileWrap.classList.remove('hidden');
        });
    }
    if (mobileVerify) {
        mobileVerify.addEventListener('click', () => {
            const ok = verifyOTP('mobile', mobileCode?.value, 'company');
            if (ok && mobileBadge) { mobileBadge.classList.remove('hidden'); }
            else if (!ok) showRegError('Invalid code');
        });
    }
}

function setupOTPIndividual() {
    const emailSend = document.getElementById('reg-otp-ind-email-send');
    const emailWrap = document.getElementById('reg-otp-ind-email-verify-wrap');
    const emailCode = document.getElementById('reg-otp-ind-email-code');
    const emailDisplay = document.getElementById('reg-otp-ind-email-display');
    const emailVerify = document.getElementById('reg-otp-ind-email-verify');
    const emailBadge = document.getElementById('reg-ind-email-verified-badge');
    if (emailSend) {
        emailSend.addEventListener('click', () => {
            const code = requestOTP('email', 'individual');
            if (emailDisplay) emailDisplay.textContent = 'Code: ' + code;
            if (emailWrap) emailWrap.classList.remove('hidden');
        });
    }
    if (emailVerify) {
        emailVerify.addEventListener('click', () => {
            const ok = verifyOTP('email', emailCode?.value, 'individual');
            if (ok && emailBadge) { emailBadge.classList.remove('hidden'); }
            else if (!ok) showRegError('Invalid code');
        });
    }
    const mobileSend = document.getElementById('reg-otp-ind-mobile-send');
    const mobileWrap = document.getElementById('reg-otp-ind-mobile-verify-wrap');
    const mobileCode = document.getElementById('reg-otp-ind-mobile-code');
    const mobileDisplay = document.getElementById('reg-otp-ind-mobile-display');
    const mobileVerify = document.getElementById('reg-otp-ind-mobile-verify');
    const mobileBadge = document.getElementById('reg-ind-mobile-verified-badge');
    if (mobileSend) {
        mobileSend.addEventListener('click', () => {
            const code = requestOTP('mobile', 'individual');
            if (mobileDisplay) mobileDisplay.textContent = 'Code: ' + code;
            if (mobileWrap) mobileWrap.classList.remove('hidden');
        });
    }
    if (mobileVerify) {
        mobileVerify.addEventListener('click', () => {
            const ok = verifyOTP('mobile', mobileCode?.value, 'individual');
            if (ok && mobileBadge) { mobileBadge.classList.remove('hidden'); }
            else if (!ok) showRegError('Invalid code');
        });
    }
}

function initRegister() {
    regState = {
        accountType: null,
        currentStep: 0,
        companyRole: null,
        companySubType: null,
        companyName: '',
        website: '',
        email: '',
        mobile: '',
        address: { country: '', region: '', city: '' },
        password: '',
        emailVerified: false,
        mobileVerified: false,
        documents: [],
        termsAccepted: false,
        individualType: null,
        fullName: '',
        specialty: '',
        expertise: ''
    };
    otpCodes = { email: null, mobile: null, indEmail: null, indMobile: null };

    loadRegData().then(() => {
        const roles = lookupsData?.companyRoles || [];
        const roleSelect = document.getElementById('reg-company-role');
        if (roleSelect) {
            roleSelect.innerHTML = '<option value="">Select role</option>';
            roles.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.label;
                roleSelect.appendChild(opt);
            });
        }
        const subtypeWrap = document.getElementById('reg-company-subtype-wrap');
        const subtypeSelect = document.getElementById('reg-company-subtype');
        if (roleSelect) {
            roleSelect.addEventListener('change', () => {
                const role = roleSelect.value;
                const subTypes = lookupsData?.companyRoleSubTypes?.[role];
                if (subTypes && subTypes.length) {
                    subtypeWrap.classList.remove('hidden');
                    subtypeSelect.innerHTML = '<option value="">Select sub-type</option>';
                    subTypes.forEach(s => {
                        const o = document.createElement('option');
                        o.value = s.id;
                        o.textContent = s.label;
                        subtypeSelect.appendChild(o);
                    });
                } else {
                    subtypeWrap.classList.add('hidden');
                    subtypeSelect.innerHTML = '<option value="">Select sub-type</option>';
                }
            });
        }
        setupLocationDropdowns('company');
        setupLocationDropdowns('individual');
        setupOTPCompany();
        setupOTPIndividual();
    });

    document.querySelectorAll('input[name="accountType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            regState.accountType = document.querySelector('input[name="accountType"]:checked')?.value || null;
            document.getElementById('reg-btn-continue').disabled = !regState.accountType;
        });
    });

    document.getElementById('reg-btn-continue')?.addEventListener('click', () => {
        regState.accountType = document.querySelector('input[name="accountType"]:checked')?.value || null;
        if (!regState.accountType) return;
        regState.currentStep = 1;
        if (regState.accountType === 'company') {
            showRegStep('reg-step-a1');
            document.getElementById('reg-wizard-progress')?.classList.remove('hidden');
            updateRegProgress();
        } else {
            showRegStep('reg-step-b1');
            document.getElementById('reg-wizard-progress')?.classList.remove('hidden');
            updateRegProgress();
        }
        document.getElementById('reg-step-0').classList.add('hidden');
    });

    document.getElementById('reg-btn-back-a1')?.addEventListener('click', () => {
        showRegStep('reg-step-0');
        document.getElementById('reg-wizard-progress')?.classList.add('hidden');
        document.getElementById('reg-step-0').classList.remove('hidden');
        regState.currentStep = 0;
    });
    document.getElementById('reg-btn-next-a1')?.addEventListener('click', () => {
        if (!validateRegStep(1)) return;
        regState.companyRole = document.getElementById('reg-company-role')?.value;
        regState.companySubType = document.getElementById('reg-company-subtype')?.value;
        renderCompanyDocuments();
        goToRegStep(2);
    });
    document.getElementById('reg-btn-back-a2')?.addEventListener('click', () => goToRegStep(1));
    document.getElementById('reg-btn-next-a2')?.addEventListener('click', () => {
        if (!validateRegStep(2)) return;
        goToRegStep(3);
    });
    document.getElementById('reg-btn-back-a3')?.addEventListener('click', () => goToRegStep(2));
    document.getElementById('reg-btn-next-a3')?.addEventListener('click', () => {
        regState.termsAccepted = document.getElementById('reg-terms-company')?.checked;
        if (!validateRegStep(3)) return;
        renderReviewCompany();
        goToRegStep(4);
    });
    document.getElementById('reg-btn-back-a4')?.addEventListener('click', () => goToRegStep(3));
    document.getElementById('reg-btn-submit-company')?.addEventListener('click', () => {
        if (!validateRegStep(2) || !validateRegStep(3)) return;
        submitCompany();
    });

    document.getElementById('reg-btn-back-b1')?.addEventListener('click', () => {
        showRegStep('reg-step-0');
        document.getElementById('reg-wizard-progress')?.classList.add('hidden');
        document.getElementById('reg-step-0').classList.remove('hidden');
        regState.currentStep = 0;
    });
    document.getElementById('reg-btn-next-b1')?.addEventListener('click', () => {
        if (!validateRegStep(1)) return;
        regState.individualType = document.querySelector('input[name="individualType"]:checked')?.value;
        document.getElementById('reg-specialty-wrap').classList.toggle('hidden', regState.individualType !== 'professional');
        document.getElementById('reg-expertise-wrap').classList.toggle('hidden', regState.individualType !== 'consultant');
        renderIndividualDocuments();
        goToRegStep(2);
    });
    document.getElementById('reg-btn-back-b2')?.addEventListener('click', () => goToRegStep(1));
    document.getElementById('reg-btn-next-b2')?.addEventListener('click', () => {
        if (!validateRegStep(2)) return;
        goToRegStep(3);
    });
    document.getElementById('reg-btn-back-b3')?.addEventListener('click', () => goToRegStep(2));
    document.getElementById('reg-btn-next-b3')?.addEventListener('click', () => {
        regState.termsAccepted = document.getElementById('reg-terms-individual')?.checked;
        if (!validateRegStep(3)) return;
        renderReviewIndividual();
        goToRegStep(4);
    });
    document.getElementById('reg-btn-back-b4')?.addEventListener('click', () => goToRegStep(3));
    document.getElementById('reg-btn-submit-individual')?.addEventListener('click', () => {
        if (!validateRegStep(2) || !validateRegStep(3)) return;
        submitIndividual();
    });

    showRegStep('reg-step-0');
    updateRegProgress();
}
